'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, CameraOff, RefreshCw, Download, Sparkles, X, Loader2, Wand2, ShoppingBag, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useCartStore, useAuthStore } from '@/lib/store'
import { cartAPI } from '@/lib/api'

// ── MediaPipe landmark indices ────────────────────────────────────────────────
const LIP_UP_OUT  = [61,185,40,39,37,0,267,269,270,409,291]
const LIP_UP_IN   = [78,191,80,81,82,13,312,311,310,415,308]
const LIP_LO_OUT  = [61,146,91,181,84,17,314,405,321,375,291]
const LIP_LO_IN   = [78,95,88,178,87,14,317,402,318,324,308]

const L_EYE_FULL  = [33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7]
const R_EYE_FULL  = [263,466,388,387,386,385,384,398,362,382,381,380,374,373,390,249]

const L_LASH      = [33,246,161,160,159,158,157,173,133]
const R_LASH      = [263,466,388,387,386,385,384,398,362]

const L_BROW      = [70,63,105,66,107,55,65,52,53,46]
const R_BROW      = [300,293,334,296,336,285,295,282,283,276]

const FACE        = [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,
                     400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109]

// ── Helpers ───────────────────────────────────────────────────────────────────
type LM = { x: number; y: number; z?: number }

function pts(lms: LM[], idx: number[], w: number, h: number): [number,number][] {
  return idx.map(i => [lms[i].x * w, lms[i].y * h])
}
function lmxy(lms: LM[], i: number, w: number, h: number): [number,number] {
  return [lms[i].x * w, lms[i].y * h]
}
function hex2rgb(hex: string): [number,number,number] {
  const n = parseInt(hex.replace('#',''), 16)
  return [(n>>16)&255, (n>>8)&255, n&255]
}

// Two-pass blit: draw on offscreen, blur + composite onto main canvas
function blitBlurred(
  ctx: CanvasRenderingContext2D,
  oc: CanvasRenderingContext2D,
  blurPx: number,
  composite: GlobalCompositeOperation,
  alpha: number,
  drawFn: (c: CanvasRenderingContext2D) => void
) {
  const w = oc.canvas.width
  const h = oc.canvas.height
  oc.clearRect(0, 0, w, h)
  oc.filter = 'none'
  drawFn(oc)
  ctx.save()
  ctx.filter = blurPx > 0 ? `blur(${blurPx}px)` : 'none'
  ctx.globalAlpha = alpha
  ctx.globalCompositeOperation = composite
  ctx.drawImage(oc.canvas, 0, 0)
  ctx.restore()
  ctx.filter = 'none'
}

// Smooth quadratic bezier path through a list of points (midpoint algorithm)
function smoothPath(c: CanvasRenderingContext2D, points: [number,number][], close = false) {
  if (!points.length) return
  c.moveTo(points[0][0], points[0][1])
  for (let i = 0; i < points.length - 1; i++) {
    const mx = (points[i][0] + points[i + 1][0]) * 0.5
    const my = (points[i][1] + points[i + 1][1]) * 0.5
    c.quadraticCurveTo(points[i][0], points[i][1], mx, my)
  }
  if (close) {
    const n = points.length - 1
    const mx = (points[n][0] + points[0][0]) * 0.5
    const my = (points[n][1] + points[0][1]) * 0.5
    c.quadraticCurveTo(points[n][0], points[n][1], mx, my)
  } else {
    c.lineTo(points[points.length - 1][0], points[points.length - 1][1])
  }
}

// Draw a lip section (outer edge forward, inner edge reversed) as smooth closed path
function lipShape(c: CanvasRenderingContext2D, outer: [number,number][], inner: [number,number][]) {
  const rev = [...inner].reverse()
  const all = [...outer, ...rev]
  c.beginPath()
  c.moveTo(all[0][0], all[0][1])
  for (let i = 0; i < all.length - 1; i++) {
    const mx = (all[i][0] + all[i + 1][0]) * 0.5
    const my = (all[i][1] + all[i + 1][1]) * 0.5
    c.quadraticCurveTo(all[i][0], all[i][1], mx, my)
  }
  c.closePath()
}

// ── Makeup renderer ───────────────────────────────────────────────────────────
//
// Realism key: CSS 'color' blend mode (non-separable) uses H+S of the source
// colour but keeps the LIGHTNESS of the destination — so skin texture, pores,
// lip lines and natural highlight/shadow all show through the pigment, exactly
// like real makeup on skin.  Depth passes still use 'multiply'; specular
// highlights use 'screen'.
//
function renderMakeup(
  ctx: CanvasRenderingContext2D,
  oc: CanvasRenderingContext2D,
  lms: LM[],
  w: number, h: number,
  makeup: Record<string, { hex: string; opacity: number } | null>
) {
  const faceW = Math.abs(lms[454].x - lms[234].x) * w

  // ── FOUNDATION ─────────────────────────────────────────────────────────────
  // 'color' tints skin with chosen shade while preserving every luminosity
  // variation (wrinkles, highlights, pores) — no mask effect
  const fd = makeup.foundation
  if (fd) {
    const [r,g,b] = hex2rgb(fd.hex)
    blitBlurred(ctx, oc, 20, 'color', fd.opacity * 0.60, (c) => {
      const fp = pts(lms, FACE, w, h)
      c.beginPath(); smoothPath(c, fp, true)
      c.fillStyle = `rgb(${r},${g},${b})`; c.fill()
    })
    // Soft-light pass adds a subtle luminosity evening without covering texture
    blitBlurred(ctx, oc, 26, 'soft-light', fd.opacity * 0.18, (c) => {
      const fp = pts(lms, FACE, w, h)
      c.beginPath(); smoothPath(c, fp, true)
      c.fillStyle = `rgb(${r},${g},${b})`; c.fill()
    })
  }

  // ── CONTOUR ────────────────────────────────────────────────────────────────
  // Dual pass like blush: 'color' deposits shade on skin (texture preserved),
  // 'multiply' adds depth/shadow so it merges naturally with surrounding makeup
  const cn = makeup.contour
  if (cn) {
    const [r,g,b] = hex2rgb(cn.hex)
    const drawContour = (c: CanvasRenderingContext2D) => {
      const [lox, loy] = lmxy(lms, 234, w, h)
      const [lix, liy] = lmxy(lms, 93,  w, h)
      const lcx = lox * 0.40 + lix * 0.60
      const lcy = (loy + liy) * 0.5 + faceW * 0.02
      const [rox, roy] = lmxy(lms, 454, w, h)
      const [rix, riy] = lmxy(lms, 323, w, h)
      const rcx = rox * 0.40 + rix * 0.60
      const rcy = (roy + riy) * 0.5 + faceW * 0.02
      const rx = faceW * 0.22
      const ry = faceW * 0.065
      c.save(); c.translate(lcx, lcy); c.rotate(-0.25)
      const lg = c.createRadialGradient(0,0,0, 0,0,rx)
      lg.addColorStop(0, `rgba(${r},${g},${b},1.0)`)
      lg.addColorStop(1, `rgba(${r},${g},${b},0)`)
      c.fillStyle = lg
      c.beginPath(); c.ellipse(0,0,rx,ry,0,0,Math.PI*2); c.fill(); c.restore()
      c.save(); c.translate(rcx, rcy); c.rotate(0.25)
      const rg2 = c.createRadialGradient(0,0,0, 0,0,rx)
      rg2.addColorStop(0, `rgba(${r},${g},${b},1.0)`)
      rg2.addColorStop(1, `rgba(${r},${g},${b},0)`)
      c.fillStyle = rg2
      c.beginPath(); c.ellipse(0,0,rx,ry,0,0,Math.PI*2); c.fill(); c.restore()
      const [ltx, lty] = lmxy(lms, 21, w, h)
      const [rtx, rty] = lmxy(lms, 251, w, h)
      const tr = faceW * 0.08
      const tg = c.createRadialGradient(ltx,lty,0, ltx,lty,tr)
      tg.addColorStop(0, `rgba(${r},${g},${b},0.90)`)
      tg.addColorStop(1, `rgba(${r},${g},${b},0)`)
      c.fillStyle = tg
      c.beginPath(); c.ellipse(ltx, lty, tr, tr*0.7, -0.3, 0, Math.PI*2); c.fill()
      const tg2 = c.createRadialGradient(rtx,rty,0, rtx,rty,tr)
      tg2.addColorStop(0, `rgba(${r},${g},${b},0.90)`)
      tg2.addColorStop(1, `rgba(${r},${g},${b},0)`)
      c.fillStyle = tg2
      c.beginPath(); c.ellipse(rtx, rty, tr, tr*0.7, 0.3, 0, Math.PI*2); c.fill()
    }
    blitBlurred(ctx, oc, Math.max(16, faceW * 0.12), 'color',      cn.opacity * 0.72, drawContour)
    blitBlurred(ctx, oc, Math.max(14, faceW * 0.10), 'soft-light', cn.opacity * 0.58, drawContour)
  }

  // ── BLUSH ──────────────────────────────────────────────────────────────────
  // 'color' blend: deposits the hue+sat of the blush shade on the cheeks while
  // skin luminosity (veins, texture, natural flush) shows through.
  const bl = makeup.blush
  if (bl) {
    const [r,g,b] = hex2rgb(bl.hex)
    const rad = faceW * 0.22
    const [lbx, lby] = lmxy(lms, 116, w, h)
    const [rbx, rby] = lmxy(lms, 345, w, h)
    const centers: [number,number][] = [[lbx, lby + faceW*0.01], [rbx, rby + faceW*0.01]]

    // Primary: color blend for precise realistic tint
    blitBlurred(ctx, oc, Math.max(12, rad * 0.70), 'color', bl.opacity * 0.82, (c) => {
      centers.forEach(([cx,cy]) => {
        const g2 = c.createRadialGradient(cx, cy, 0, cx, cy, rad)
        g2.addColorStop(0,    `rgba(${r},${g},${b},1.0)`)
        g2.addColorStop(0.40, `rgba(${r},${g},${b},0.65)`)
        g2.addColorStop(1,    `rgba(${r},${g},${b},0)`)
        c.fillStyle = g2
        c.beginPath(); c.ellipse(cx, cy, rad, rad * 0.72, 0, 0, Math.PI * 2); c.fill()
      })
    })
    // Soft-light for warmth/glow over skin — blends naturally
    blitBlurred(ctx, oc, Math.max(18, rad * 1.0), 'soft-light', bl.opacity * 0.55, (c) => {
      centers.forEach(([cx,cy]) => {
        const g2 = c.createRadialGradient(cx, cy, 0, cx, cy, rad * 1.1)
        g2.addColorStop(0,   `rgba(${r},${g},${b},0.90)`)
        g2.addColorStop(0.5, `rgba(${r},${g},${b},0.45)`)
        g2.addColorStop(1,   `rgba(${r},${g},${b},0)`)
        c.fillStyle = g2
        c.beginPath(); c.ellipse(cx, cy, rad*1.1, rad*0.78, 0, 0, Math.PI * 2); c.fill()
      })
    })
  }

  // ── HIGHLIGHTER ────────────────────────────────────────────────────────────
  // Dual pass: soft-light builds a natural skin-glow first; screen adds the
  // actual shimmer/shine on top. This way it reads as lit skin, not metallic.
  const hl = makeup.highlighter
  if (hl) {
    const [r,g,b] = hex2rgb(hl.hex)
    const drawHL = (c: CanvasRenderingContext2D, str: number) => {
      const [lhx, lhy] = lmxy(lms, 116, w, h)
      const [rhx, rhy] = lmxy(lms, 345, w, h)
      const [nbx, nby] = lmxy(lms, 6,   w, h)
      const [lbx, lby] = lmxy(lms, 107, w, h)
      const [rbx, rby] = lmxy(lms, 336, w, h)
      const [cbx, cby] = lmxy(lms, 0,   w, h)
      const spots: [[number,number], number, number, number][] = [
        [[lhx, lhy - faceW*0.025], faceW*0.110, faceW*0.070, str * 1.0],
        [[rhx, rhy - faceW*0.025], faceW*0.110, faceW*0.070, str * 1.0],
        [[nbx, nby - faceW*0.005], faceW*0.038, faceW*0.038, str * 0.80],
        [[lbx, lby],               faceW*0.060, faceW*0.036, str * 0.65],
        [[rbx, rby],               faceW*0.060, faceW*0.036, str * 0.65],
        [[cbx, cby - faceW*0.015], faceW*0.032, faceW*0.022, str * 0.55],
      ]
      spots.forEach(([[cx,cy], rx, ry, s]) => {
        const g2 = c.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx,ry))
        g2.addColorStop(0,    `rgba(${r},${g},${b},${s})`)
        g2.addColorStop(0.40, `rgba(${r},${g},${b},${s * 0.45})`)
        g2.addColorStop(1,    `rgba(${r},${g},${b},0)`)
        c.fillStyle = g2
        c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); c.fill()
      })
    }
    // Soft-light first: lifts the skin's own luminosity for a natural glow
    blitBlurred(ctx, oc, Math.max(10, faceW * 0.07), 'soft-light', hl.opacity * 0.70, (c) => drawHL(c, 1.0))
    // Screen second: adds visible shimmer/highlight on top, much more subtle
    blitBlurred(ctx, oc, Math.max(6,  faceW * 0.04), 'screen',     hl.opacity * 0.55, (c) => drawHL(c, 0.80))
  }

  // ── EYESHADOW ──────────────────────────────────────────────────────────────
  // Three-layer approach:
  //   1. multiply depth at lash line (darkens for eye socket shadow)
  //   2. color blend for the actual shade tint (skin texture shows through)
  //   3. screen for metallic/shimmer sheen
  const ey = makeup.eyeshadow
  if (ey) {
    const [r,g,b] = hex2rgb(ey.hex)
    ;([
      [L_LASH, L_BROW, L_EYE_FULL],
      [R_LASH, R_BROW, R_EYE_FULL],
    ] as [number[], number[], number[]][]).forEach(([lashIdx, browIdx, fullIdx]) => {
      const lashPts     = pts(lms, lashIdx, w, h)
      const browPts     = pts(lms, browIdx, w, h)
      const eyeFullPts  = pts(lms, fullIdx, w, h)

      const lashTopY    = Math.min(...lashPts.map(p => p[1]))
      const browBottomY = Math.max(...browPts.map(p => p[1]))
      const eyeBottomY  = Math.max(...eyeFullPts.map(p => p[1]))
      const creaseY     = lashTopY - (lashTopY - browBottomY) * 0.55

      const midX        = lashPts.reduce((s, p) => s + p[0], 0) / lashPts.length
      const innerCorner = lashPts[0]
      const outerCorner = lashPts[lashPts.length - 1]
      const minX        = Math.min(...lashPts.map(p => p[0])) - 6
      const maxW        = Math.max(...lashPts.map(p => p[0])) - minX + 6 + 6

      // Helper: clip canvas to the arch-shaped eye socket region
      const clipArch = (c: CanvasRenderingContext2D) => {
        c.beginPath()
        smoothPath(c, lashPts, false)
        c.quadraticCurveTo((midX + outerCorner[0]) * 0.5, creaseY, midX, creaseY - faceW * 0.008)
        c.quadraticCurveTo((midX + innerCorner[0]) * 0.5, creaseY, innerCorner[0], innerCorner[1])
        c.closePath()
        c.clip()
      }

      // Layer 1 — depth: multiply darkens lash-line area for socket shadow
      blitBlurred(ctx, oc, Math.max(3, faceW * 0.012), 'multiply', ey.opacity * 0.55, (c) => {
        c.save(); clipArch(c)
        const grad = c.createLinearGradient(midX, eyeBottomY + 2, midX, lashTopY - faceW * 0.03)
        grad.addColorStop(0,    `rgba(${r},${g},${b},1.0)`)
        grad.addColorStop(0.22, `rgba(${r},${g},${b},0.65)`)
        grad.addColorStop(0.55, `rgba(${r},${g},${b},0.20)`)
        grad.addColorStop(1,    `rgba(${r},${g},${b},0)`)
        c.fillStyle = grad
        c.fillRect(minX, creaseY - 6, maxW, eyeBottomY - creaseY + 12)
        c.restore()
      })

      // Layer 2 — color: tints eyelid with chosen shade, skin texture preserved
      blitBlurred(ctx, oc, Math.max(5, faceW * 0.026), 'color', ey.opacity * 0.88, (c) => {
        c.save(); clipArch(c)
        const grad = c.createLinearGradient(midX, eyeBottomY + 2, midX, creaseY - 2)
        grad.addColorStop(0,    `rgba(${r},${g},${b},1.0)`)
        grad.addColorStop(0.32, `rgba(${r},${g},${b},0.88)`)
        grad.addColorStop(0.68, `rgba(${r},${g},${b},0.42)`)
        grad.addColorStop(1,    `rgba(${r},${g},${b},0)`)
        c.fillStyle = grad
        c.fillRect(minX, creaseY - 6, maxW, eyeBottomY - creaseY + 12)
        c.restore()
      })

      // Layer 3 — shimmer: screen blend for metallic/sparkle sheen
      blitBlurred(ctx, oc, Math.max(2, faceW * 0.010), 'screen', ey.opacity * 0.22, (c) => {
        c.save(); clipArch(c)
        // Concentrated centre-lid highlight
        const hlY = lashTopY - (lashTopY - browBottomY) * 0.18
        const g2  = c.createRadialGradient(midX, hlY, 0, midX, hlY, faceW * 0.07)
        g2.addColorStop(0,    `rgba(${r},${g},${b},0.90)`)
        g2.addColorStop(0.35, `rgba(${r},${g},${b},0.40)`)
        g2.addColorStop(1,    'rgba(255,255,255,0)')
        c.fillStyle = g2
        c.fillRect(minX, creaseY - 4, maxW, eyeBottomY - creaseY + 8)
        c.restore()
      })
    })
  }

  // ── EYELINER ───────────────────────────────────────────────────────────────
  const el = makeup.eyeliner
  if (el) {
    const [r,g,b] = hex2rgb(el.hex)
    // Variable width: thicker at outer corner, finer at inner
    const lineW = Math.max(2.5, faceW * 0.011)
    blitBlurred(ctx, oc, 0.3, 'multiply', el.opacity, (c) => {
      ;([
        [L_LASH, 33,  133],
        [R_LASH, 263, 362],
      ] as [number[], number, number][]).forEach(([lashIdx, outerIdx, innerIdx]) => {
        const ep    = pts(lms, lashIdx, w, h)
        const outer = lmxy(lms, outerIdx, w, h)
        const inner = lmxy(lms, innerIdx, w, h)

        // Draw liner with smooth bezier, varying width by segment position
        for (let i = 0; i < ep.length - 1; i++) {
          const t    = i / (ep.length - 1)
          // Thicker near outer corner (t closer to 1 for L_LASH, 0 for R_LASH)
          const wMult = 0.6 + 0.8 * (1 - t)
          const mx   = (ep[i][0] + ep[i+1][0]) * 0.5
          const my   = (ep[i][1] + ep[i+1][1]) * 0.5
          c.beginPath()
          c.moveTo(ep[i][0], ep[i][1])
          c.lineTo(mx, my)
          c.strokeStyle = `rgb(${r},${g},${b})`
          c.lineWidth   = lineW * wMult
          c.lineCap     = 'round'
          c.lineJoin    = 'round'
          c.stroke()
        }

        // Cat-eye wing
        const dx  = outer[0] - inner[0]
        const dy  = outer[1] - inner[1]
        const ang = Math.atan2(dy, dx)
        const wl  = faceW * 0.048
        const upAngle = dx < 0 ? ang + 0.55 : ang - 0.55
        const wingTip: [number,number] = [
          outer[0] + Math.cos(upAngle) * wl,
          outer[1] + Math.sin(upAngle) * wl,
        ]
        // Filled wing triangle for realistic look
        c.beginPath()
        c.moveTo(outer[0], outer[1])
        c.lineTo(wingTip[0], wingTip[1])
        const ep2 = ep[ep.length - 2]
        c.quadraticCurveTo(
          (outer[0] + ep2[0]) * 0.5 + Math.cos(upAngle - 0.3) * lineW * 1.5,
          (outer[1] + ep2[1]) * 0.5 + Math.sin(upAngle - 0.3) * lineW * 1.5,
          ep2[0], ep2[1]
        )
        c.fillStyle = `rgb(${r},${g},${b})`
        c.fill()
        // Wing stroke
        c.beginPath()
        c.moveTo(outer[0], outer[1])
        c.lineTo(wingTip[0], wingTip[1])
        c.strokeStyle = `rgb(${r},${g},${b})`
        c.lineWidth   = lineW * 0.65
        c.stroke()
      })
    })
  }

  // ── MASCARA ────────────────────────────────────────────────────────────────
  const ms = makeup.mascara
  if (ms) {
    const [r,g,b] = hex2rgb(ms.hex)
    const lashW = Math.max(2.5, faceW * 0.011)
    blitBlurred(ctx, oc, 0.5, 'multiply', ms.opacity, (c) => {
      ;([L_LASH, R_LASH] as number[][]).forEach(lashIdx => {
        const ep = pts(lms, lashIdx, w, h)

        // Base thickening stroke along lash line
        c.beginPath()
        smoothPath(c, ep, false)
        c.strokeStyle = `rgba(${r},${g},${b},0.95)`
        c.lineWidth   = lashW * 1.1
        c.lineCap     = 'round'
        c.lineJoin    = 'round'
        c.stroke()

        // Dense interpolated lash points — 2× more lashes, no flicker
        const denseEp: [number,number][] = []
        for (let i = 0; i < ep.length - 1; i++) {
          denseEp.push(ep[i])
          denseEp.push([(ep[i][0] + ep[i+1][0]) * 0.5, (ep[i][1] + ep[i+1][1]) * 0.5])
        }
        denseEp.push(ep[ep.length - 1])

        denseEp.forEach(([x, y], i) => {
          const prevPt = denseEp[Math.max(0, i - 1)]
          const nextPt = denseEp[Math.min(denseEp.length - 1, i + 1)]
          const tdx = nextPt[0] - prevPt[0]
          const tdy = nextPt[1] - prevPt[1]
          const tlen = Math.sqrt(tdx * tdx + tdy * tdy) + 0.001
          let nx = -tdy / tlen
          let ny =  tdx / tlen
          if (ny > 0) { nx = -nx; ny = -ny }

          const variation = 0.45 + 0.55 * Math.abs(Math.sin(i * 1.1 + lashIdx.length * 0.3))
          const baseLen   = lashW * 3.2
          const lashLen   = baseLen * variation
          const t         = i / Math.max(1, denseEp.length - 1)
          const curlX     = (t - 0.5) * lashW * 1.2
          const curlUp    = lashLen * 0.10

          // Tip and bezier control point
          const tipX = x + nx * lashLen * 0.90 + curlX * 1.6
          const tipY = y + ny * lashLen * 0.88
          const ctlX = x + nx * lashLen * 0.50 + curlX * 0.55
          const ctlY = y + ny * lashLen * 0.50 - curlUp

          // Perpendicular to growth direction (ny, -nx) for lash width
          const pw = lashW * 0.46 * (0.55 + 0.45 * variation)
          const pHx = ny; const pHy = -nx

          // Tapered filled lash: wide at root, converging to a fine tip
          c.beginPath()
          c.moveTo(x - pHx * pw * 0.5, y - pHy * pw * 0.5)
          c.quadraticCurveTo(ctlX - pHx * pw * 0.20, ctlY - pHy * pw * 0.20, tipX, tipY)
          c.quadraticCurveTo(ctlX + pHx * pw * 0.20, ctlY + pHy * pw * 0.20, x + pHx * pw * 0.5, y + pHy * pw * 0.5)
          c.closePath()
          c.fillStyle = `rgba(${r},${g},${b},${0.90 + 0.10 * variation})`
          c.fill()
        })
      })
    })
  }

  // ── LIPSTICK ───────────────────────────────────────────────────────────────
  const lp = makeup.lipstick
  if (lp) {
    const [r,g,b] = hex2rgb(lp.hex)
    const upOut = pts(lms, LIP_UP_OUT, w, h)
    const upIn  = pts(lms, LIP_UP_IN,  w, h)
    const loOut = pts(lms, LIP_LO_OUT, w, h)
    const loIn  = pts(lms, LIP_LO_IN,  w, h)

    const drawBothLips = (c: CanvasRenderingContext2D, fillStyle?: string) => {
      c.fillStyle = fillStyle ?? `rgb(${r},${g},${b})`
      lipShape(c, upOut, upIn); c.fill()
      lipShape(c, loOut, loIn); c.fill()
    }

    // L1 — anchor: source-over at low opacity pins the actual pigment color so it
    //      isn't entirely at the mercy of the destination lip luminosity
    blitBlurred(ctx, oc, 0.6, 'source-over', lp.opacity * 0.22, (c) => { drawBothLips(c) })

    // L2 — color blend: overlay hue+saturation while preserving lip texture/shadows
    blitBlurred(ctx, oc, 0.8, 'color', lp.opacity * 0.82, (c) => { drawBothLips(c) })

    // L3 — saturation: push vibrancy so the color pops even on pale or dark lips
    blitBlurred(ctx, oc, 1.0, 'saturation', lp.opacity * 0.65, (c) => { drawBothLips(c) })

    // L4 — soft-light: warmth pass to make it feel stained, not painted
    blitBlurred(ctx, oc, 1.4, 'soft-light', lp.opacity * 0.35, (c) => { drawBothLips(c) })

    // L5 — corner depth: multiply only at lip corners for natural 3-D curvature
    blitBlurred(ctx, oc, 3.5, 'multiply', lp.opacity * 0.30, (c) => {
      const dr = Math.max(0, r - 45); const dg2 = Math.max(0, g - 32); const db2 = Math.max(0, b - 32)
      const cRad = faceW * 0.038
      ;[upOut[0], upOut[upOut.length - 1], loOut[0], loOut[loOut.length - 1]].forEach(([cx, cy]) => {
        const grad = c.createRadialGradient(cx, cy, 0, cx, cy, cRad)
        grad.addColorStop(0,   `rgba(${dr},${dg2},${db2},0.90)`)
        grad.addColorStop(0.5, `rgba(${dr},${dg2},${db2},0.42)`)
        grad.addColorStop(1,   'rgba(0,0,0,0)')
        c.fillStyle = grad
        c.fillRect(cx - cRad, cy - cRad, cRad * 2, cRad * 2)
      })
    })

    // L6 — gloss highlight: strong oval on lower lip (main catch light), subtle bow on upper
    blitBlurred(ctx, oc, 1.6, 'screen', lp.opacity * 0.55, (c) => {
      c.save()
      lipShape(c, loOut, loIn); c.clip()
      const lTop  = Math.min(...loIn.map(p => p[1]))
      const lBot  = Math.max(...loOut.map(p => p[1]))
      const lLeft = Math.min(...loOut.map(p => p[0]))
      const lRight = Math.max(...loOut.map(p => p[0]))
      const lCx = (lLeft + lRight) * 0.50
      const lCy = lTop + (lBot - lTop) * 0.34
      const lRx = (lRight - lLeft) * 0.34
      const lGrad = c.createRadialGradient(lCx, lCy, 0, lCx, lCy, lRx)
      lGrad.addColorStop(0,    'rgba(255,255,255,0.92)')
      lGrad.addColorStop(0.30, 'rgba(255,255,255,0.62)')
      lGrad.addColorStop(0.65, 'rgba(255,255,255,0.18)')
      lGrad.addColorStop(1,    'rgba(255,255,255,0)')
      c.fillStyle = lGrad
      c.fillRect(lLeft, lTop, lRight - lLeft, lBot - lTop)
      c.restore()

      c.save()
      lipShape(c, upOut, upIn); c.clip()
      const uTop  = Math.min(...upOut.map(p => p[1]))
      const uBot  = Math.max(...upIn.map(p => p[1]))
      const uLeft = Math.min(...upOut.map(p => p[0]))
      const uRight = Math.max(...upOut.map(p => p[0]))
      const uCx = (uLeft + uRight) * 0.50
      const uCy = uTop + (uBot - uTop) * 0.40
      const uRx = (uRight - uLeft) * 0.22
      const uGrad = c.createRadialGradient(uCx, uCy, 0, uCx, uCy, uRx)
      uGrad.addColorStop(0,    'rgba(255,255,255,0.48)')
      uGrad.addColorStop(0.50, 'rgba(255,255,255,0.16)')
      uGrad.addColorStop(1,    'rgba(255,255,255,0)')
      c.fillStyle = uGrad
      c.fillRect(uLeft, uTop, uRight - uLeft, uBot - uTop)
      c.restore()
    })

    // L7 — liner: crisp edge definition
    blitBlurred(ctx, oc, 0.3, 'multiply', lp.opacity * 0.52, (c) => {
      const dr = Math.max(0, r - 28); const dg2 = Math.max(0, g - 20); const db2 = Math.max(0, b - 20)
      const lineW = Math.max(0.7, faceW * 0.005)
      c.strokeStyle = `rgb(${dr},${dg2},${db2})`
      c.lineWidth = lineW; c.lineCap = 'round'; c.lineJoin = 'round'
      c.beginPath(); smoothPath(c, upOut, false); c.stroke()
      c.beginPath(); smoothPath(c, loOut, false); c.stroke()
    })
  }
}

// ── Shade data types ──────────────────────────────────────────────────────────
interface ShadeData {
  name: string
  hex: string
  productLink: string
  imageLink?: string
  productName: string
  brand: string
  price: number
}
interface ShadeCategory { label: string; shades: ShadeData[] }

// Fallback shades shown instantly while the live API loads
const FALLBACK_SHADES: Record<string, ShadeCategory> = {
  lipstick: { label: 'Lipstick', shades: [
    { name:'Cherry Red',   hex:'#C0172B', productLink:'', productName:'Retro Matte Lipstick Ruby Woo',  brand:'MAC',              price:22  },
    { name:'Rose Glaze',   hex:'#E8909A', productLink:'', productName:'Soft Pinch Tinted Lip Oil',      brand:'Rare Beauty',      price:22  },
    { name:'Berry',        hex:'#8A1845', productLink:'', productName:'Audacious Lipstick Dragon Girl',  brand:'NARS',             price:40  },
    { name:'Coral',        hex:'#F06048', productLink:'', productName:'Poutsicle Lip Stain Coral Reef',  brand:'Fenty Beauty',     price:26  },
    { name:'Nude',         hex:'#C08070', productLink:'', productName:'Pillow Talk Original Lipstick',   brand:'Charlotte Tilbury',price:38  },
    { name:'Fuchsia',      hex:'#E0306A', productLink:'', productName:'Pure Color Whipped Matte',        brand:'Estée Lauder',     price:34  },
    { name:'Mauve Rose',   hex:'#C07090', productLink:'', productName:'Confession Ultra Slim Lipstick',  brand:'Hourglass',        price:36  },
    { name:'Brown Sugar',  hex:'#9A5848', productLink:'', productName:'Stunna Lip Paint Unlocked',       brand:'Fenty Beauty',     price:26  },
  ]},
  eyeshadow: { label: 'Eyeshadow', shades: [
    { name:'Smoky',      hex:'#2E2E2E', productLink:'', productName:'Luxury Palette Golden Goddess', brand:'Charlotte Tilbury',price:75  },
    { name:'Rose Gold',  hex:'#B76E79', productLink:'', productName:'Rose Gold Remastered Palette',  brand:'Huda Beauty',      price:67  },
    { name:'Bronze',     hex:'#8C5A2E', productLink:'', productName:'Naked3 Eyeshadow Palette',      brand:'Urban Decay',      price:54  },
    { name:'Purple',     hex:'#6A0D83', productLink:'', productName:'Luxury Palette Pillow Talk',    brand:'Charlotte Tilbury',price:75  },
    { name:'Champagne',  hex:'#C8A882', productLink:'', productName:'Mothership IX Velvet Rose',     brand:'Pat McGrath',      price:125 },
    { name:'Teal',       hex:'#008080', productLink:'', productName:'Curator Eyeshadow Palette',     brand:'Hourglass',        price:68  },
    { name:'Ocean',      hex:'#1C5F8C', productLink:'', productName:'Narsissist Wanted Palette',     brand:'NARS',             price:65  },
    { name:'Nude',       hex:'#C49A6C', productLink:'', productName:'Sweet Peach Eyeshadow Palette', brand:'Too Faced',        price:48  },
  ]},
  eyeliner: { label: 'Eyeliner', shades: [
    { name:'Jet Black',  hex:'#080808', productLink:'', productName:'Stay All Day Liquid Liner',     brand:'Stila',            price:22  },
    { name:'Soft Black', hex:'#1C1A1A', productLink:'', productName:'Fluidline Eye Liner Gel',       brand:'MAC',              price:22  },
    { name:'Deep Brown', hex:'#3E1A00', productLink:'', productName:'Le Stylo Waterproof Eyeliner',  brand:'Lancôme',          price:26  },
    { name:'Navy',       hex:'#0A1840', productLink:'', productName:'Epic Black Mousse Liner',       brand:'NYX',              price:10  },
    { name:'Teal',       hex:'#005F5F', productLink:'', productName:'Holographic Halo Cream Liner',  brand:'BH Cosmetics',     price:11  },
    { name:'Burgundy',   hex:'#5C001A', productLink:'', productName:'Faux Blacks Eyeliner',          brand:'Kat Von D',        price:8   },
  ]},
  blush: { label: 'Blush', shades: [
    { name:'Peachy',     hex:'#FFAA80', productLink:'', productName:'Soft Pinch Liquid Blush',       brand:'Rare Beauty',      price:22  },
    { name:'Rose',       hex:'#D4698A', productLink:'', productName:'Cheek to Chic Blush Pillow Talk',brand:'Charlotte Tilbury',price:45 },
    { name:'Coral',      hex:'#FF7B54', productLink:'', productName:'Orgasm Blush',                  brand:'NARS',             price:34  },
    { name:'Berry',      hex:'#9B4F7A', productLink:'', productName:'Sweet Cheeks Blush Palette',    brand:'Too Faced',        price:20  },
    { name:'Terracotta', hex:'#C1694F', productLink:'', productName:'Baked Blush',                   brand:'e.l.f.',           price:7   },
  ]},
  contour: { label: 'Contour', shades: [
    { name:'Light',      hex:'#C8956C', productLink:'', productName:'Filmstar Bronze & Glow',        brand:'Charlotte Tilbury',price:70  },
    { name:'Medium',     hex:'#A0663C', productLink:'', productName:'Hoola Matte Bronzer',           brand:'Benefit',          price:36  },
    { name:'Deep',       hex:'#6B3320', productLink:'', productName:'Matte Bronzer',                 brand:'e.l.f.',           price:9   },
    { name:'Cool',       hex:'#8B7060', productLink:'', productName:'Chubby Stick Sculpting Contour',brand:'Clinique',         price:23  },
  ]},
  highlighter: { label: 'Highlighter', shades: [
    { name:'Gold',       hex:'#FFD060', productLink:'', productName:'Killawatt Freestyle Highlighter',brand:'Fenty Beauty',     price:40  },
    { name:'Rose Gold',  hex:'#E8B4A0', productLink:'', productName:'Shimmering Skin Perfector',     brand:'BECCA',            price:38  },
    { name:'Champagne',  hex:'#F0D880', productLink:'', productName:'Ambient Lighting Powder',       brand:'Hourglass',        price:58  },
    { name:'Pearl',      hex:'#F8F4EE', productLink:'', productName:'Filmstar Bronze & Glow',        brand:'Charlotte Tilbury',price:70  },
    { name:'Bronze',     hex:'#CD9040', productLink:'', productName:'Diorskin Nude Air Glow Powder', brand:'Dior',             price:40  },
  ]},
  foundation: { label: 'Foundation', shades: [
    { name:'Porcelain',  hex:'#F5E6D3', productLink:'', productName:'Light Reflecting Foundation',   brand:'NARS',             price:55  },
    { name:'Fair',       hex:'#EDD5B8', productLink:'', productName:'Flawless Filter Complexion',    brand:'Charlotte Tilbury',price:49  },
    { name:'Light',      hex:'#D9B99B', productLink:'', productName:'Luminous Silk Foundation',      brand:'Armani Beauty',    price:68  },
    { name:'Medium',     hex:'#C08040', productLink:'', productName:'Pro Filt\'r Soft Matte',        brand:'Fenty Beauty',     price:40  },
    { name:'Tan',        hex:'#A0663C', productLink:'', productName:'Studio Fix Fluid SPF 15',       brand:'MAC',              price:35  },
    { name:'Deep',       hex:'#6B3320', productLink:'', productName:'Teint Idole Ultra Wear',        brand:'Lancôme',          price:52  },
  ]},
  mascara: { label: 'Mascara', shades: [
    { name:'Jet Black',  hex:'#050505', productLink:'', productName:'Better Than Sex Mascara',       brand:'Too Faced',        price:29  },
    { name:'Soft Black', hex:'#1A1A1A', productLink:'', productName:'Diorshow Iconic Overcurl',      brand:'Dior',             price:32  },
    { name:'Deep Brown', hex:'#2C1A0E', productLink:'', productName:'Pillow Talk Push Up Lashes',    brand:'Charlotte Tilbury',price:32  },
    { name:'Navy',       hex:'#0A0F2E', productLink:'', productName:'Sky High Mascara',              brand:'Maybelline',       price:12  },
    { name:'Burgundy',   hex:'#3A0010', productLink:'', productName:'Monsieur Big Mascara',          brand:'Lancôme',          price:30  },
  ]},
}

type MakeupType = 'lipstick' | 'eyeshadow' | 'eyeliner' | 'blush' | 'contour' | 'highlighter' | 'foundation' | 'mascara'
type ShadeEntry = { hex: string; name: string; opacity: number; productLink: string; imageLink?: string; productName: string; brand: string; price: number } | null
type SelectedMakeup = Record<string, ShadeEntry>

const DEFAULT_OPACITY: Record<string,number> = {
  lipstick:0.75, eyeshadow:0.55, eyeliner:0.90, blush:0.40,
  contour:0.35, highlighter:0.50, foundation:0.28, mascara:0.92,
}

// ── Preset looks ──────────────────────────────────────────────────────────────
const PRESETS: { name: string; desc: string; makeup: Partial<Record<MakeupType, { hex: string; name: string }>> }[] = [
  {
    name: 'Natural Glow',
    desc: 'Everyday radiance',
    makeup: {
      foundation:  { hex:'#EDD5B8', name:'Fair' },
      blush:       { hex:'#FFAA80', name:'Peachy' },
      highlighter: { hex:'#F0D880', name:'Champagne' },
      lipstick:    { hex:'#D4808E', name:'Nude Pink' },
    },
  },
  {
    name: 'Smoky Glam',
    desc: 'Bold evening look',
    makeup: {
      eyeshadow: { hex:'#2E2E2E', name:'Smoky' },
      eyeliner:  { hex:'#080808', name:'Jet Black' },
      mascara:   { hex:'#050505', name:'Jet Black' },
      blush:     { hex:'#D4698A', name:'Rose' },
      lipstick:  { hex:'#C41E3A', name:'Ruby Red' },
    },
  },
  {
    name: 'Editorial',
    desc: 'High-fashion drama',
    makeup: {
      eyeshadow:   { hex:'#6A0D83', name:'Purple' },
      eyeliner:    { hex:'#080808', name:'Jet Black' },
      contour:     { hex:'#A0663C', name:'Medium' },
      highlighter: { hex:'#FFD060', name:'Gold' },
      lipstick:    { hex:'#8B1A4A', name:'Berry Plum' },
    },
  },
  {
    name: 'Bronzed',
    desc: 'Sun-kissed warmth',
    makeup: {
      eyeshadow:   { hex:'#8C5A2E', name:'Bronze' },
      blush:       { hex:'#FF7B54', name:'Coral' },
      contour:     { hex:'#A0663C', name:'Medium' },
      highlighter: { hex:'#CD9040', name:'Bronze' },
      lipstick:    { hex:'#9B4448', name:'Brick' },
    },
  },
]

// ── MediaPipe CDN loader ──────────────────────────────────────────────────────
const MP_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/'

async function initFaceMesh(): Promise<any> {
  await new Promise<void>((res, rej) => {
    const id = 'mp-face-mesh-script'
    if (document.getElementById(id)) { res(); return }
    const s = document.createElement('script')
    s.id = id; s.crossOrigin = 'anonymous'
    s.src = MP_CDN + 'face_mesh.js'
    s.onload = () => res(); s.onerror = rej
    document.head.appendChild(s)
  })
  const fm = new (window as any).FaceMesh({ locateFile: (f: string) => MP_CDN + f })
  fm.setOptions({ maxNumFaces:1, refineLandmarks:true, minDetectionConfidence:0.5, minTrackingConfidence:0.5 })
  return fm
}

// ── Component ─────────────────────────────────────────────────────────────────
const API_URL = '/api'

export default function TryOnPage() {
  const videoRef      = useRef<HTMLVideoElement>(null)
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const offCanvasRef  = useRef<HTMLCanvasElement | null>(null)
  const offCtxRef     = useRef<CanvasRenderingContext2D | null>(null)
  const faceMeshRef   = useRef<any>(null)
  const streamRef     = useRef<MediaStream | null>(null)
  const animRef       = useRef<number>(0)
  const sendingRef    = useRef(false)
  const makeupRef     = useRef<SelectedMakeup>({})

  const [cameraActive,  setCameraActive]  = useState(false)
  const [cameraError,   setCameraError]   = useState<string | null>(null)
  const [mpLoading,     setMpLoading]     = useState(false)
  const [activeTab,     setActiveTab]     = useState<MakeupType>('lipstick')
  const [selectedMakeup,setSelectedMakeup]= useState<SelectedMakeup>({})
  const [mode,          setMode]          = useState<'live'|'photo'>('live')
  const [capturedPhoto, setCapturedPhoto] = useState<string|null>(null)
  const [photoResult,   setPhotoResult]   = useState<string|null>(null)
  const [isProcessing,  setIsProcessing]  = useState(false)
  const [faceDetected,  setFaceDetected]  = useState(false)
  const [activePanel,   setActivePanel]   = useState<'shades'|'presets'>('shades')
  const [shopOpen,      setShopOpen]      = useState(true)
  const [shades,        setShades]        = useState<Record<string, ShadeCategory>>(FALLBACK_SHADES)
  const [storeMatches,  setStoreMatches]  = useState<Record<string, any[]>>({})
  const [storeMatchHex, setStoreMatchHex] = useState<Record<string, string>>({})
  const [loadingMatches,setLoadingMatches]= useState<Record<string, boolean>>({})
  const [addedIds,      setAddedIds]      = useState<Set<string>>(new Set())
  const [addingId,      setAddingId]      = useState<string | null>(null)

  const { setCart, setOpen } = useCartStore()
  const { isAuthenticated }  = useAuthStore()

  useEffect(() => { makeupRef.current = selectedMakeup }, [selectedMakeup])

  // ── Fetch matching real store products for selected makeup types ──────────
  useEffect(() => {
    const SEARCH_TERMS: Partial<Record<MakeupType, string>> = {
      lipstick:    'lipstick',
      eyeshadow:   'eyeshadow',
      eyeliner:    'eyeliner',
      blush:       'blush',
      contour:     'contour',
      highlighter: 'highlighter',
      foundation:  'foundation',
      mascara:     'mascara',
    }
    const activeTypes = (Object.keys(selectedMakeup) as MakeupType[]).filter(t => selectedMakeup[t])
    if (!activeTypes.length) return

    activeTypes.forEach(async type => {
      const shade = selectedMakeup[type]
      const hex = shade?.hex ?? ''
      // Re-fetch whenever the selected shade hex changes
      if ((storeMatches[type]?.length && storeMatchHex[type] === hex) || loadingMatches[type]) return
      setLoadingMatches(prev => ({ ...prev, [type]: true }))
      try {
        const term = SEARCH_TERMS[type] ?? type
        const params = new URLSearchParams({ search: term, limit: '5', is_active: 'true' })
        if (hex) params.set('shade_hex', hex)
        const res = await fetch(`${API_URL}/products/?${params}`)
        if (!res.ok) return
        const { products } = await res.json()
        if (products?.length) {
          setStoreMatches(prev => ({ ...prev, [type]: products }))
          setStoreMatchHex(prev => ({ ...prev, [type]: hex }))
        }
      } catch {}
      finally {
        setLoadingMatches(prev => ({ ...prev, [type]: false }))
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMakeup])

  // ── Live shades from makeup-api.herokuapp.com ─────────────────────────────
  useEffect(() => {
    const API = 'http://makeup-api.herokuapp.com/api/v1/products.json'
    const TYPE_MAP: Partial<Record<MakeupType, string>> = {
      lipstick: 'lipstick', eyeshadow: 'eyeshadow', eyeliner: 'eyeliner',
      blush: 'blush', contour: 'bronzer', foundation: 'foundation', mascara: 'mascara',
      // highlighter has no dedicated type — keep curated fallback shades
    }
    const LABELS: Record<MakeupType, string> = {
      lipstick:'Lipstick', eyeshadow:'Eyeshadow', eyeliner:'Eyeliner', blush:'Blush',
      contour:'Contour', highlighter:'Highlighter', foundation:'Foundation', mascara:'Mascara',
    }
    ;(Object.keys(TYPE_MAP) as MakeupType[]).forEach(cat => {
      const pType = TYPE_MAP[cat]
      if (!pType) return
      fetch(`${API}?product_type=${pType}`)
        .then(r => r.json())
        .then((products: any[]) => {
          const seen = new Set<string>()
          const fetched: ShadeData[] = []
          for (const p of products) {
            if (!p.product_colors?.length) continue
            for (const c of p.product_colors) {
              const raw = (c.hex_value || '').trim()
              const hex = (raw.startsWith('#') ? raw : '#' + raw).toUpperCase()
              if (!/^#[0-9A-Fa-f]{6}$/.test(hex) || seen.has(hex)) continue
              seen.add(hex)
              fetched.push({
                name:        c.colour_name || p.name,
                hex,
                productName: p.name,
                brand:       (p.brand || '').replace(/(^|\s)\S/g, (l: string) => l.toUpperCase()),
                price:       parseFloat(p.price) || 0,
                productLink: p.product_link || '',
                imageLink:   p.image_link   || '',
              })
              if (fetched.length >= 20) break
            }
            if (fetched.length >= 20) break
          }
          if (fetched.length > 0)
            setShades(prev => ({ ...prev, [cat]: { label: LABELS[cat], shades: fetched } }))
        })
        .catch(() => {}) // keep fallback on network error
    })
  }, [])

  // ── Camera ────────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width:{ideal:640}, height:{ideal:480}, facingMode:'user' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraActive(true)
    } catch (e: any) {
      setCameraError(e.name === 'NotAllowedError'
        ? 'Camera access denied. Allow it in your browser settings.'
        : 'Could not access camera.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    cancelAnimationFrame(animRef.current)
    setCameraActive(false)
    setFaceDetected(false)
  }, [])

  useEffect(() => () => stopCamera(), [stopCamera])

  // ── MediaPipe live loop ───────────────────────────────────────────────────
  useEffect(() => {
    if (!cameraActive || mode !== 'live') return
    let alive = true
    setMpLoading(true)

    const run = async () => {
      try {
        if (!faceMeshRef.current) faceMeshRef.current = await initFaceMesh()
        if (!offCanvasRef.current) {
          offCanvasRef.current = document.createElement('canvas')
          offCtxRef.current = offCanvasRef.current.getContext('2d')
        }
        const fm = faceMeshRef.current
        fm.onResults((results: any) => {
          if (!alive || !canvasRef.current || !videoRef.current) return
          const video  = videoRef.current
          const canvas = canvasRef.current
          const w = video.videoWidth  || 640
          const h = video.videoHeight || 480
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w; canvas.height = h
            offCanvasRef.current!.width = w; offCanvasRef.current!.height = h
            offCtxRef.current = offCanvasRef.current!.getContext('2d')
          }
          const ctx = canvas.getContext('2d')
          if (!ctx || !offCtxRef.current) return
          ctx.drawImage(video, 0, 0, w, h)
          const lms = results.multiFaceLandmarks?.[0]
          if (lms) {
            setFaceDetected(true)
            renderMakeup(ctx, offCtxRef.current, lms, w, h, makeupRef.current)
          } else {
            setFaceDetected(false)
          }
          sendingRef.current = false
        })
        setMpLoading(false)
        const loop = async () => {
          if (!alive) return
          const v = videoRef.current
          if (v && v.readyState === 4 && !sendingRef.current) {
            sendingRef.current = true
            await fm.send({ image: v }).catch(() => { sendingRef.current = false })
          }
          animRef.current = requestAnimationFrame(loop)
        }
        animRef.current = requestAnimationFrame(loop)
      } catch {
        setMpLoading(false)
        toast.error('Could not load face detection. Check your connection.')
      }
    }
    run()
    return () => { alive = false; cancelAnimationFrame(animRef.current) }
  }, [cameraActive, mode])

  // ── Photo capture ─────────────────────────────────────────────────────────
  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return
    const tmp = document.createElement('canvas')
    tmp.width  = videoRef.current.videoWidth  || 640
    tmp.height = videoRef.current.videoHeight || 480
    const ctx = tmp.getContext('2d')!
    // Mirror the photo to match the selfie view
    ctx.translate(tmp.width, 0); ctx.scale(-1, 1)
    ctx.drawImage(videoRef.current, 0, 0)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    setCapturedPhoto(tmp.toDataURL('image/jpeg', 0.95))
    setPhotoResult(null)
    setMode('photo')
  }, [])

  // ── Apply makeup to photo via MediaPipe (no backend needed) ──────────────
  const applyToPhoto = useCallback(async () => {
    if (!capturedPhoto) return
    const hasAny = Object.values(selectedMakeup).some(Boolean)
    if (!hasAny) return
    setIsProcessing(true)

    try {
      // Load image element
      const img = new Image()
      img.src = capturedPhoto
      await new Promise<void>((res, rej) => {
        img.onload = () => res()
        img.onerror = () => rej(new Error('Image load failed'))
      })

      // Create result canvas with full resolution
      const canvas = document.createElement('canvas')
      canvas.width  = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      const oc = document.createElement('canvas')
      oc.width  = canvas.width
      oc.height = canvas.height
      const octx = oc.getContext('2d')!

      // Load MediaPipe if not already loaded
      if (!faceMeshRef.current) {
        setMpLoading(true)
        faceMeshRef.current = await initFaceMesh()
        setMpLoading(false)
      }

      const fm = faceMeshRef.current
      const currentMakeup = makeupRef.current

      await new Promise<void>((resolve) => {
        let done = false
        fm.onResults((results: any) => {
          if (done) return
          done = true
          const lms = results.multiFaceLandmarks?.[0]
          if (lms) {
            renderMakeup(ctx, octx, lms, canvas.width, canvas.height, currentMakeup)
            setPhotoResult(canvas.toDataURL('image/jpeg', 0.95))
          } else {
            toast.error('No face detected. Try better lighting or a clearer photo.')
          }
          resolve()
        })
        fm.send({ image: img }).catch(() => resolve())
      })
    } catch {
      toast.error('Processing failed.')
    } finally {
      setIsProcessing(false)
    }
  }, [capturedPhoto, selectedMakeup])

  const downloadResult = useCallback(() => {
    const src = photoResult || (mode === 'live' && canvasRef.current
      ? canvasRef.current.toDataURL('image/jpeg', 0.95) : capturedPhoto)
    if (!src) return
    const a = document.createElement('a')
    a.href = src; a.download = 'glamour-ai-look.jpg'; a.click()
    toast.success('Saved!')
  }, [photoResult, capturedPhoto, mode])

  const addToCart = async (product: any, variantId?: string) => {
    if (!isAuthenticated) {
      toast.error('Sign in to add to cart')
      return
    }
    const cartKey = variantId ? `${product.id}:${variantId}` : product.id
    setAddingId(cartKey)
    try {
      const { data } = await cartAPI.addItem(product.id, variantId, 1)
      setCart(data.cart)
      setAddedIds(prev => new Set(prev).add(cartKey))
      setOpen(true)
      const variantName = variantId
        ? product.variants?.find((v: any) => v.id === variantId)?.name ?? product.matchedVariant?.name
        : null
      toast.success(`${product.name}${variantName ? ` — ${variantName}` : ''} added to cart!`)
    } catch {
      toast.error('Could not add to cart')
    } finally {
      setAddingId(null)
    }
  }

  const toggleMakeup = (type: MakeupType, shade: ShadeData) => {
    setSelectedMakeup(prev => ({
      ...prev,
      [type]: prev[type]?.hex === shade.hex
        ? null
        : { ...shade, opacity: DEFAULT_OPACITY[type] ?? 0.5 },
    }))
  }

  const applyPreset = (preset: typeof PRESETS[0]) => {
    const next: SelectedMakeup = {}
    for (const [type, shade] of Object.entries(preset.makeup)) {
      if (!shade) continue
      const full = shades[type]?.shades.find(s => s.hex === shade.hex)
      if (full) {
        next[type] = { ...full, opacity: DEFAULT_OPACITY[type] ?? 0.5 }
      } else {
        next[type] = { ...shade, opacity: DEFAULT_OPACITY[type] ?? 0.5, productLink: '', productName: shade.name, brand: '', price: 0 }
      }
    }
    setSelectedMakeup(next)
    toast.success(`Applied "${preset.name}"`)
  }

  const clearAll = () => {
    setSelectedMakeup({})
    toast('Look cleared', { icon: '✕' })
  }

  const displaySrc   = mode === 'photo' ? (photoResult || capturedPhoto) : null
  const hasAnyMakeup = Object.values(selectedMakeup).some(Boolean)
  const activeCount  = Object.values(selectedMakeup).filter(Boolean).length

  return (
    <div className="pt-[88px] min-h-screen bg-noir">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles size={14} className="text-champagne" />
            <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-champagne">
              AI Virtual Try-On
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-ivory mb-3">
            Find Your <span className="italic text-champagne">Perfect Look</span>
          </h1>
          <p className="font-serif text-ivory/50 text-lg">
            Real-time face detection · 8 categories · live shades from real brands
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Preview ───────────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="relative bg-charcoal aspect-[4/3] overflow-hidden border border-champagne/10">
              <video ref={videoRef} autoPlay playsInline muted className="hidden" />

              {/* Live canvas — CSS-mirrored for selfie view */}
              {cameraActive && mode === 'live' && (
                <canvas ref={canvasRef} className="w-full h-full object-cover" style={{ transform:'scaleX(-1)' }} />
              )}

              {/* Photo result */}
              {displaySrc && (
                <img src={displaySrc} alt="Try-on result" className="w-full h-full object-cover" />
              )}

              {/* Idle */}
              {!cameraActive && !capturedPhoto && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 border border-champagne/30 flex items-center justify-center mb-6">
                    <Camera size={36} className="text-champagne/50" />
                  </div>
                  <p className="font-display text-xl text-ivory mb-2">Ready to Transform?</p>
                  <p className="font-sans text-xs text-ivory/40 mb-8 tracking-wider">
                    Enable your camera to start the experience
                  </p>
                  <button onClick={startCamera} className="btn-gold">Enable Camera</button>
                </div>
              )}

              {/* Camera error */}
              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-noir/90 p-8">
                  <CameraOff size={36} className="text-red-400 mb-4" />
                  <p className="font-sans text-xs text-center text-ivory/70 mb-6">{cameraError}</p>
                  <button onClick={startCamera} className="btn-secondary text-ivory border-ivory/30">Try Again</button>
                </div>
              )}

              {/* AI loading */}
              {(mpLoading || isProcessing) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-noir/70 backdrop-blur-sm">
                  <Loader2 size={32} className="text-champagne animate-spin mb-4" />
                  <p className="font-sans text-xs tracking-widest uppercase text-champagne">
                    {isProcessing ? 'Applying Makeup…' : 'Loading AI…'}
                  </p>
                  {!isProcessing && <p className="font-sans text-[10px] text-ivory/40 mt-1">First load ~6 MB</p>}
                </div>
              )}

              {/* Face status */}
              {cameraActive && mode === 'live' && !mpLoading && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-noir/60 backdrop-blur-sm px-3 py-1.5 border border-champagne/10">
                  <span className={`w-2 h-2 rounded-full transition-colors ${faceDetected ? 'bg-green-400' : 'bg-ivory/20'}`} />
                  <span className="font-sans text-[9px] tracking-widest uppercase text-ivory/60">
                    {faceDetected ? 'Face detected' : 'No face'}
                  </span>
                </div>
              )}

              {/* Corner brackets */}
              {cameraActive && (
                <>
                  <div className="absolute top-4 left-4  w-8 h-8 border-t-2 border-l-2 border-champagne/40 pointer-events-none" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-champagne/40 pointer-events-none" />
                  <div className="absolute bottom-4 left-4  w-8 h-8 border-b-2 border-l-2 border-champagne/40 pointer-events-none" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-champagne/40 pointer-events-none" />
                </>
              )}

              {/* Active product badges */}
              {hasAnyMakeup && (
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 justify-end pointer-events-none">
                  {Object.entries(selectedMakeup).filter(([,v]) => v).map(([type,val]) => val && (
                    <div key={type} className="flex items-center gap-1.5 bg-noir/70 backdrop-blur-sm px-3 py-1.5 border border-champagne/20 pointer-events-auto">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: val.hex }} />
                      <span className="font-sans text-[9px] tracking-wider uppercase text-ivory/70">{type}</span>
                      <button onClick={() => setSelectedMakeup(p => ({ ...p, [type]: null }))}>
                        <X size={10} className="text-ivory/40 hover:text-ivory" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-3 mt-4">
              {!cameraActive ? (
                <button onClick={startCamera} className="flex-1 btn-gold flex items-center justify-center gap-2">
                  <Camera size={14} /> Start Camera
                </button>
              ) : mode === 'live' ? (
                <>
                  <button onClick={capturePhoto} className="flex-1 btn-primary flex items-center justify-center gap-2">
                    <Camera size={14} /> Capture Photo
                  </button>
                  <button onClick={stopCamera} className="px-4 border border-ivory/20 text-ivory/60 hover:text-red-400 hover:border-red-400 transition-colors">
                    <CameraOff size={16} />
                  </button>
                  <button onClick={downloadResult} className="px-4 border border-champagne/30 text-champagne hover:bg-champagne/10 transition-colors">
                    <Download size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setMode('live'); setPhotoResult(null); setCapturedPhoto(null) }}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2">
                    <RefreshCw size={14} /> Live Mode
                  </button>
                  <button onClick={applyToPhoto} disabled={isProcessing || !hasAnyMakeup}
                    className="flex-1 btn-gold flex items-center justify-center gap-2 disabled:opacity-50">
                    <Sparkles size={14} />
                    {isProcessing ? 'Applying…' : 'Apply Look'}
                  </button>
                  {(photoResult || capturedPhoto) && (
                    <button onClick={downloadResult} className="px-4 border border-champagne/30 text-champagne hover:bg-champagne/10 transition-colors">
                      <Download size={16} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Selector panel ────────────────────────────────────────────── */}
          <div className="lg:col-span-1 bg-charcoal/50 border border-champagne/10 p-6">

            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl text-ivory">Build Your Look</h3>
              {hasAnyMakeup && (
                <button onClick={clearAll}
                  className="font-sans text-[10px] tracking-widest uppercase text-ivory/40 hover:text-red-400 transition-colors flex items-center gap-1">
                  <X size={10} /> Clear
                </button>
              )}
            </div>

            {/* Shades / Presets toggle */}
            <div className="flex gap-0 mb-6 border border-ivory/10">
              {(['shades','presets'] as const).map(p => (
                <button key={p} onClick={() => setActivePanel(p)}
                  className={`flex-1 py-2 font-sans text-[10px] tracking-widest uppercase transition-all ${
                    activePanel === p ? 'bg-champagne text-noir' : 'text-ivory/50 hover:text-ivory/80'
                  }`}>
                  {p === 'shades' ? `Shades${activeCount > 0 ? ` (${activeCount})` : ''}` : 'Presets'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activePanel === 'presets' && (
                <motion.div key="presets" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}>
                  <div className="space-y-3">
                    {PRESETS.map((preset) => (
                      <button key={preset.name} onClick={() => applyPreset(preset)}
                        className="w-full text-left p-4 border border-ivory/10 hover:border-champagne/50 hover:bg-champagne/5 transition-all group">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-display text-sm text-ivory group-hover:text-champagne transition-colors">{preset.name}</p>
                          <Wand2 size={12} className="text-champagne/40 group-hover:text-champagne transition-colors" />
                        </div>
                        <p className="font-sans text-[10px] text-ivory/40 mb-3">{preset.desc}</p>
                        <div className="flex gap-1.5">
                          {Object.values(preset.makeup).map((s, i) => s && (
                            <span key={i} className="w-4 h-4 rounded-full border border-ivory/10"
                              style={{ background: s.hex }} title={s.name} />
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {activePanel === 'shades' && (
                <motion.div key="shades" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}>
                  {/* Category tabs */}
                  <div className="grid grid-cols-4 gap-1.5 mb-6">
                    {(Object.keys(shades) as MakeupType[]).map(type => (
                      <button key={type} onClick={() => setActiveTab(type)}
                        className={`py-2 font-sans text-[9px] tracking-wider uppercase transition-all leading-tight text-center ${
                          activeTab === type
                            ? 'bg-champagne text-noir'
                            : 'border border-ivory/10 text-ivory/50 hover:border-champagne/40 hover:text-ivory/80'
                        }`}>
                        {selectedMakeup[type] && (
                          <span className="block w-1 h-1 rounded-full bg-current mx-auto mb-0.5" />
                        )}
                        {shades[type]?.label ?? type}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                      <div className="grid grid-cols-5 gap-2.5 mb-4">
                        <button onClick={() => setSelectedMakeup(p => ({ ...p, [activeTab]: null }))}
                          className={`w-8 h-8 border-2 flex items-center justify-center transition-all ${
                            !selectedMakeup[activeTab] ? 'border-champagne text-champagne' : 'border-ivory/20 text-ivory/30 hover:border-ivory/50'
                          }`}>
                          <X size={11} />
                        </button>
                        {(shades[activeTab]?.shades ?? []).map(shade => {
                          const sel = selectedMakeup[activeTab]?.hex === shade.hex
                          return (
                            <button key={shade.hex} onClick={() => toggleMakeup(activeTab, shade)}
                              title={`${shade.name} — ${shade.productName}`}
                              className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
                                sel ? 'ring-2 ring-offset-2 ring-champagne ring-offset-charcoal scale-110' : 'shadow-md'
                              }`}
                              style={{ background: shade.hex }} />
                          )
                        })}
                      </div>

                      {selectedMakeup[activeTab] && (
                        <div className="bg-noir/50 border border-champagne/10 p-3 mb-3">
                          <div className="flex items-center gap-3 mb-2.5">
                            <span className="w-5 h-5 rounded-full flex-shrink-0"
                              style={{ background: selectedMakeup[activeTab]!.hex }} />
                            <div className="flex-1 min-w-0">
                              <p className="font-sans text-xs text-ivory truncate">{selectedMakeup[activeTab]!.name}</p>
                              <p className="font-sans text-[10px] text-ivory/40 uppercase tracking-widest">
                                {shades[activeTab]?.label ?? activeTab}
                              </p>
                            </div>
                          </div>
                          {loadingMatches[activeTab] ? (
                            <div className="flex items-center gap-2 px-3 py-2 bg-champagne/5 border border-champagne/10">
                              <Loader2 size={10} className="animate-spin text-champagne/50" />
                              <span className="font-sans text-[10px] text-ivory/40">Finding in store…</span>
                            </div>
                          ) : storeMatches[activeTab]?.[0] ? (() => {
                            const sp = storeMatches[activeTab][0]
                            const mv = sp.matchedVariant
                            const cartKey = mv ? `${sp.id}:${mv.id}` : sp.id
                            return (
                              <div className="bg-champagne/8 border border-champagne/20">
                                {sp.primaryImage && (
                                  <div className="relative">
                                    <img src={sp.primaryImage} alt={sp.name} className="w-full h-20 object-cover" />
                                    {mv?.shadeHex && (
                                      <span className="absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-ivory/60 shadow-md"
                                        style={{ background: mv.shadeHex }} title={mv.name} />
                                    )}
                                  </div>
                                )}
                                <div className="px-3 py-2">
                                  <p className="font-sans text-[10px] text-champagne leading-tight truncate">{sp.name}</p>
                                  {mv && (
                                    <div className="flex items-center gap-1.5 mt-0.5 mb-1">
                                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                        style={{ background: mv.shadeHex || selectedMakeup[activeTab]!.hex }} />
                                      <p className="font-sans text-[9px] text-ivory/60 truncate">{mv.name}</p>
                                    </div>
                                  )}
                                  <p className="font-sans text-[9px] text-ivory/40 mt-0.5 mb-2">
                                    {sp.brand?.name ?? sp.brand ?? ''}{sp.price ? ` · $${Number(sp.price).toFixed(2)}` : ''}
                                  </p>
                                  <div className="flex gap-1.5">
                                    <button
                                      onClick={() => addToCart(sp, mv?.id)}
                                      disabled={addingId === cartKey}
                                      className="flex-1 flex items-center justify-center gap-1 py-1.5 font-sans text-[9px] tracking-widest uppercase transition-all disabled:opacity-50"
                                      style={{ background: addedIds.has(cartKey) ? '#4A7A4A' : '#C6A9A3', color: '#0D0B0A' }}
                                    >
                                      {addingId === cartKey
                                        ? <Loader2 size={9} className="animate-spin" />
                                        : addedIds.has(cartKey)
                                          ? <><Check size={9} /> Added</>
                                          : <><ShoppingBag size={9} /> Add to Cart</>
                                      }
                                    </button>
                                    <Link href={`/products/${sp.slug}`}
                                      className="px-2.5 py-1.5 font-sans text-[9px] tracking-widest uppercase border border-champagne/30 text-champagne/70 hover:text-champagne hover:border-champagne transition-colors">
                                      View
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            )
                          })() : selectedMakeup[activeTab]!.productName ? (
                            <div className="flex items-center justify-between gap-2 bg-champagne/5 border border-champagne/10 px-3 py-2">
                              <div className="min-w-0 flex-1">
                                <p className="font-sans text-[10px] text-champagne/70 leading-tight truncate">{selectedMakeup[activeTab]!.productName}</p>
                                <p className="font-sans text-[9px] text-ivory/30 mt-0.5">{selectedMakeup[activeTab]!.brand}</p>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}

                      {selectedMakeup[activeTab] && (
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="font-sans text-[10px] tracking-widest uppercase text-ivory/50">Intensity</span>
                            <span className="font-sans text-[10px] text-champagne">
                              {Math.round((selectedMakeup[activeTab]?.opacity ?? 0.5) * 100)}%
                            </span>
                          </div>
                          <input type="range" min="0.05" max="1" step="0.05"
                            value={selectedMakeup[activeTab]?.opacity ?? 0.5}
                            onChange={e => setSelectedMakeup(p => ({
                              ...p,
                              [activeTab]: p[activeTab] ? { ...p[activeTab]!, opacity: parseFloat(e.target.value) } : null,
                            }))}
                            className="w-full accent-champagne h-1 bg-ivory/10" />
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Shop This Look ── */}
            {hasAnyMakeup && (
              <div className="mt-5 border-t border-ivory/10 pt-5">
                <button
                  onClick={() => setShopOpen(v => !v)}
                  className="w-full flex items-center justify-between mb-3 group"
                >
                  <span className="font-sans text-[10px] tracking-widest uppercase text-champagne flex items-center gap-1.5">
                    <ShoppingBag size={11} />
                    Shop This Look ({activeCount})
                  </span>
                  {shopOpen
                    ? <ChevronUp size={12} className="text-champagne/60" />
                    : <ChevronDown size={12} className="text-champagne/60" />}
                </button>

                <AnimatePresence>
                  {shopOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3">
                        {Object.entries(selectedMakeup)
                          .filter(([, v]) => v)
                          .map(([type, val]) => {
                            const sp = storeMatches[type]?.[0]
                            const isLoading = loadingMatches[type]
                            return val && (
                              <div key={type} className="border border-champagne/20 bg-noir/50 overflow-hidden">
                                {/* Product image or shade strip */}
                                {sp?.primaryImage ? (
                                  <div className="relative">
                                    <img src={sp.primaryImage} alt={sp.name}
                                      className="w-full h-28 object-cover" />
                                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-noir/70 backdrop-blur-sm">
                                      <p className="font-sans text-[8px] tracking-widest uppercase text-champagne">{shades[type]?.label ?? type}</p>
                                    </div>
                                    {/* Show matched shade swatch vs tried shade */}
                                    <div className="absolute top-2 right-2 flex items-center gap-1">
                                      <span className="w-4 h-4 rounded-full border-2 border-ivory/60 shadow"
                                        style={{ background: val.hex }} title="Shade you tried" />
                                      {sp.matchedVariant?.shadeHex && sp.matchedVariant.shadeHex !== val.hex && (
                                        <span className="w-4 h-4 rounded-full border-2 border-champagne/80 shadow"
                                          style={{ background: sp.matchedVariant.shadeHex }} title={`Closest in store: ${sp.matchedVariant.name}`} />
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-10 w-full relative" style={{ background: val.hex + '55' }}>
                                    <div className="absolute inset-0 flex items-center px-3 gap-2">
                                      <span className="w-4 h-4 rounded-full border border-ivory/30 flex-shrink-0"
                                        style={{ background: val.hex }} />
                                      <p className="font-sans text-[10px] tracking-widest uppercase text-ivory/60">{shades[type]?.label ?? type}</p>
                                    </div>
                                  </div>
                                )}

                                <div className="p-2.5">
                                  {isLoading && !sp ? (
                                    <div className="flex items-center gap-2 py-1">
                                      <Loader2 size={10} className="animate-spin text-champagne/50" />
                                      <span className="font-sans text-[10px] text-ivory/40">Finding in store…</span>
                                    </div>
                                  ) : sp ? (() => {
                                    const mv = sp.matchedVariant
                                    const cartKey = mv ? `${sp.id}:${mv.id}` : sp.id
                                    return (
                                    <>
                                      <p className="font-sans text-[10px] text-ivory/90 leading-tight truncate mb-0.5">{sp.name}</p>
                                      {mv && (
                                        <div className="flex items-center gap-1.5 mb-1">
                                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{ background: mv.shadeHex || val.hex }} />
                                          <p className="font-sans text-[9px] text-ivory/60 truncate">{mv.name}</p>
                                        </div>
                                      )}
                                      <p className="font-sans text-[9px] text-ivory/40 mb-2.5">
                                        {sp.brand?.name ?? sp.brand ?? ''}{sp.price ? ` · $${Number(sp.price).toFixed(2)}` : ''}
                                      </p>
                                      <div className="flex gap-1.5">
                                        <button
                                          onClick={() => addToCart(sp, mv?.id)}
                                          disabled={addingId === cartKey}
                                          className="flex-1 flex items-center justify-center gap-1 py-1.5 font-sans text-[9px] tracking-widest uppercase transition-all disabled:opacity-50"
                                          style={{ background: addedIds.has(cartKey) ? '#4A7A4A' : '#C6A9A3', color: '#0D0B0A' }}
                                        >
                                          {addingId === cartKey
                                            ? <Loader2 size={9} className="animate-spin" />
                                            : addedIds.has(cartKey)
                                              ? <><Check size={9} /> Added</>
                                              : <><ShoppingBag size={9} /> Add to Cart</>
                                          }
                                        </button>
                                        <Link href={`/products/${sp.slug}`}
                                          className="px-2.5 py-1.5 font-sans text-[9px] tracking-widest uppercase border border-champagne/30 text-champagne/70 hover:text-champagne hover:border-champagne transition-colors">
                                          View
                                        </Link>
                                      </div>
                                    </>
                                    )
                                  })() : (
                                    <div className="py-1">
                                      <p className="font-sans text-[10px] text-ivory/50 truncate">{val.productName || val.name}</p>
                                      <p className="font-sans text-[9px] text-ivory/30">{val.brand}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="mt-6 border-t border-ivory/10 pt-5">
              <p className="font-sans text-[10px] tracking-widest uppercase text-champagne mb-3">How It Works</p>
              <ol className="space-y-2">
                {[
                  '1. Enable your camera',
                  '2. Pick a preset or build your own look',
                  '3. Makeup renders in real-time on your face',
                  '4. Capture → Apply Look → Save',
                ].map(s => <li key={s} className="font-sans text-xs text-ivory/50">{s}</li>)}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
