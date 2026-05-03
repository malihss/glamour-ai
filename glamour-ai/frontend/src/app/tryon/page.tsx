'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, CameraOff, RefreshCw, Download, Sparkles, X, Loader2, Wand2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { tryonAPI } from '@/lib/api'
import toast from 'react-hot-toast'

// ── MediaPipe landmark indices ────────────────────────────────────────────────
const LIP_UP_OUT  = [61,185,40,39,37,0,267,269,270,409,291]
const LIP_UP_IN   = [78,191,80,81,82,13,312,311,310,415,308]
const LIP_LO_OUT  = [61,146,91,181,84,17,314,405,321,375,291]
const LIP_LO_IN   = [78,95,88,178,87,14,317,402,318,324,308]

// Full eye outline (upper + lower)
const L_EYE_FULL  = [33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7]
const R_EYE_FULL  = [263,466,388,387,386,385,384,398,362,382,381,380,374,373,390,249]

// Strictly the upper eyelid arc — topmost points only (lash line)
// Left: inner corner → peak → outer corner along the TOP lid
const L_LASH      = [33,246,161,160,159,158,157,173,133]
// Right: inner corner → peak → outer corner along the TOP lid
const R_LASH      = [263,466,388,387,386,385,384,398,362]

// Eyebrow landmarks for mascara/liner reference
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

// Draw a soft blurred layer: draw sharp on offscreen, blur when compositing onto main canvas
// This is the correct two-pass technique — avoids white-square artifacts from oc.filter
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

// ── Makeup renderer (runs every frame) ───────────────────────────────────────
function renderMakeup(
  ctx: CanvasRenderingContext2D,
  oc: CanvasRenderingContext2D,
  lms: LM[],
  w: number, h: number,
  makeup: Record<string, { hex: string; opacity: number } | null>
) {
  const faceW = Math.abs(lms[454].x - lms[234].x) * w

  // ── FOUNDATION ─────────────────────────────────────────────────────────────
  const fd = makeup.foundation
  if (fd) {
    const [r,g,b] = hex2rgb(fd.hex)
    blitBlurred(ctx, oc, 14, 'multiply', fd.opacity * 0.4, (c) => {
      const fp = pts(lms, FACE, w, h)
      c.beginPath()
      fp.forEach(([x,y],i) => i===0 ? c.moveTo(x,y) : c.lineTo(x,y))
      c.closePath()
      c.fillStyle = `rgb(${r},${g},${b})`
      c.fill()
    })
  }

  // ── BRONZER / CONTOUR ──────────────────────────────────────────────────────
  const cn = makeup.contour
  if (cn) {
    const [r,g,b] = hex2rgb(cn.hex)
    blitBlurred(ctx, oc, Math.max(12, faceW * 0.10), 'multiply', 1, (c) => {
      const [lox, loy] = lmxy(lms, 234, w, h)
      const [lix, liy] = lmxy(lms, 93,  w, h)
      const lcx = lox * 0.45 + lix * 0.55
      const lcy = (loy + liy) * 0.5 + faceW * 0.03
      const [rox, roy] = lmxy(lms, 454, w, h)
      const [rix, riy] = lmxy(lms, 323, w, h)
      const rcx = rox * 0.45 + rix * 0.55
      const rcy = (roy + riy) * 0.5 + faceW * 0.03
      const rx = faceW * 0.20
      const ry = faceW * 0.07
      c.save(); c.translate(lcx, lcy); c.rotate(-0.30)
      c.fillStyle = `rgba(${r},${g},${b},${cn.opacity * 1.6})`
      c.beginPath(); c.ellipse(0,0,rx,ry,0,0,Math.PI*2); c.fill(); c.restore()
      c.save(); c.translate(rcx, rcy); c.rotate(0.30)
      c.fillStyle = `rgba(${r},${g},${b},${cn.opacity * 1.6})`
      c.beginPath(); c.ellipse(0,0,rx,ry,0,0,Math.PI*2); c.fill(); c.restore()
      const [ltx, lty] = lmxy(lms, 21, w, h)
      const [rtx, rty] = lmxy(lms, 251, w, h)
      const tr = faceW * 0.10
      c.fillStyle = `rgba(${r},${g},${b},${cn.opacity * 0.8})`
      c.beginPath(); c.ellipse(ltx, lty, tr, tr*0.6, -0.3, 0, Math.PI*2); c.fill()
      c.beginPath(); c.ellipse(rtx, rty, tr, tr*0.6,  0.3, 0, Math.PI*2); c.fill()
    })
  }

  // ── BLUSH ──────────────────────────────────────────────────────────────────
  const bl = makeup.blush
  if (bl) {
    const [r,g,b] = hex2rgb(bl.hex)
    const rad = faceW * 0.20
    blitBlurred(ctx, oc, Math.max(8, rad * 0.6), 'soft-light', 1, (c) => {
      ;([[lms[116].x*w, lms[116].y*h],[lms[345].x*w, lms[345].y*h]] as [number,number][])
        .forEach(([cx,cy]) => {
          const g2 = c.createRadialGradient(cx, cy, 0, cx, cy, rad)
          g2.addColorStop(0,   `rgba(${r},${g},${b},${bl.opacity * 2.0})`)
          g2.addColorStop(0.5, `rgba(${r},${g},${b},${bl.opacity * 1.0})`)
          g2.addColorStop(1,   `rgba(${r},${g},${b},0)`)
          c.fillStyle = g2
          c.beginPath()
          c.ellipse(cx, cy, rad, rad * 0.75, 0, 0, Math.PI * 2)
          c.fill()
        })
    })
  }

  // ── HIGHLIGHTER ────────────────────────────────────────────────────────────
  const hl = makeup.highlighter
  if (hl) {
    const [r,g,b] = hex2rgb(hl.hex)
    blitBlurred(ctx, oc, Math.max(4, faceW * 0.04), 'screen', hl.opacity * 1.1, (c) => {
      const [lhx, lhy] = lmxy(lms, 116, w, h)
      const [rhx, rhy] = lmxy(lms, 345, w, h)
      const [nbx, nby] = lmxy(lms, 6,   w, h)
      const [lbx, lby] = lmxy(lms, 107, w, h)
      const [rbx, rby] = lmxy(lms, 336, w, h)
      const [cbx, cby] = lmxy(lms, 0,   w, h)
      const spots: [[number,number], number, number][] = [
        [[lhx, lhy - faceW*0.02], faceW*0.09, faceW*0.055],
        [[rhx, rhy - faceW*0.02], faceW*0.09, faceW*0.055],
        [[nbx, nby],              faceW*0.025, faceW*0.025],
        [[lbx, lby],              faceW*0.05,  faceW*0.03],
        [[rbx, rby],              faceW*0.05,  faceW*0.03],
        [[cbx, cby - faceW*0.01], faceW*0.025, faceW*0.015],
      ]
      spots.forEach(([[cx,cy], rx, ry]) => {
        const g2 = c.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx,ry))
        g2.addColorStop(0,   `rgba(${r},${g},${b},0.95)`)
        g2.addColorStop(0.4, `rgba(${r},${g},${b},0.5)`)
        g2.addColorStop(1,   `rgba(${r},${g},${b},0)`)
        c.fillStyle = g2
        c.beginPath()
        c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
        c.fill()
      })
    })
  }

  // ── EYESHADOW ──────────────────────────────────────────────────────────────
  // Strictly on the upper eyelid strip — lash line up to crease, nowhere else
  const ey = makeup.eyeshadow
  if (ey) {
    const [r,g,b] = hex2rgb(ey.hex)
    blitBlurred(ctx, oc, Math.max(3, faceW * 0.025), 'multiply', 1, (c) => {
      ;([
        [L_LASH, L_EYE_FULL],
        [R_LASH, R_EYE_FULL],
      ] as [number[], number[]][]).forEach(([lashIdx, fullIdx]) => {
        const lashPts = pts(lms, lashIdx, w, h)
        const fullPts = pts(lms, fullIdx, w, h)
        const eyeMinY  = Math.min(...fullPts.map(p => p[1]))
        const eyeMaxY  = Math.max(...fullPts.map(p => p[1]))
        const eyeH     = eyeMaxY - eyeMinY
        const lcx      = lashPts.reduce((s,p) => s+p[0], 0) / lashPts.length
        const lashTopY = Math.min(...lashPts.map(p => p[1]))
        const creaseY  = lashTopY - eyeH * 1.4
        c.save()
        c.beginPath()
        lashPts.forEach(([x,y],i) => i===0 ? c.moveTo(x,y) : c.lineTo(x,y))
        c.lineTo(lashPts[lashPts.length-1][0], creaseY)
        c.lineTo(lashPts[0][0], creaseY)
        c.closePath()
        c.clip()
        const grad = c.createLinearGradient(lcx, eyeMaxY, lcx, creaseY)
        grad.addColorStop(0,    `rgba(${r},${g},${b},${ey.opacity * 1.8})`)
        grad.addColorStop(0.35, `rgba(${r},${g},${b},${ey.opacity * 1.2})`)
        grad.addColorStop(1,    `rgba(${r},${g},${b},0)`)
        c.fillStyle = grad
        c.fillRect(
          Math.min(...lashPts.map(p=>p[0])) - 4,
          creaseY - 2,
          Math.max(...lashPts.map(p=>p[0])) - Math.min(...lashPts.map(p=>p[0])) + 8,
          eyeMaxY - creaseY + 4
        )
        c.restore()
      })
    })
  }

  // ── EYELINER ───────────────────────────────────────────────────────────────
  const el = makeup.eyeliner
  if (el) {
    const [r,g,b] = hex2rgb(el.hex)
    const lineW = Math.max(2, faceW * 0.010)
    blitBlurred(ctx, oc, 0.4, 'multiply', el.opacity, (c) => {
      ;([
        [L_LASH, 33,  133],
        [R_LASH, 263, 362],
      ] as [number[], number, number][]).forEach(([lashIdx, outerIdx, innerIdx]) => {
        const ep    = pts(lms, lashIdx, w, h)
        const outer = lmxy(lms, outerIdx, w, h)
        const inner = lmxy(lms, innerIdx, w, h)
        c.beginPath()
        ep.forEach(([x,y],i) => i===0 ? c.moveTo(x,y) : c.lineTo(x,y))
        c.strokeStyle = `rgb(${r},${g},${b})`
        c.lineWidth   = lineW
        c.lineCap     = 'round'
        c.lineJoin    = 'round'
        c.stroke()
        const dx  = outer[0] - inner[0]
        const dy  = outer[1] - inner[1]
        const ang = Math.atan2(dy, dx)
        const wl  = faceW * 0.045
        const wingTip: [number,number] = [
          outer[0] + Math.cos(ang) * wl,
          outer[1] + Math.sin(ang) * wl - wl * 0.7,
        ]
        c.beginPath()
        c.moveTo(outer[0], outer[1])
        c.lineTo(wingTip[0], wingTip[1])
        c.strokeStyle = `rgb(${r},${g},${b})`
        c.lineWidth   = lineW * 0.7
        c.stroke()
      })
    })
  }

  // ── MASCARA ────────────────────────────────────────────────────────────────
  const ms = makeup.mascara
  if (ms) {
    const [r,g,b] = hex2rgb(ms.hex)
    const lashW = Math.max(2.5, faceW * 0.012)
    blitBlurred(ctx, oc, 0.6, 'multiply', ms.opacity, (c) => {
      ;([L_LASH, R_LASH] as number[][]).forEach(lashIdx => {
        const ep = pts(lms, lashIdx, w, h)
        for (let pass = 0; pass < 3; pass++) {
          c.beginPath()
          ep.forEach(([x,y],i) => {
            const yOff = -pass * (lashW * 0.4)
            i===0 ? c.moveTo(x, y+yOff) : c.lineTo(x, y+yOff)
          })
          c.strokeStyle = `rgba(${r},${g},${b},${0.9 - pass * 0.2})`
          c.lineWidth   = lashW - pass * 0.5
          c.lineCap     = 'round'
          c.lineJoin    = 'round'
          c.stroke()
        }
      })
    })
  }

  // ── LIPSTICK ───────────────────────────────────────────────────────────────
  const lp = makeup.lipstick
  if (lp) {
    const [r,g,b] = hex2rgb(lp.hex)
    blitBlurred(ctx, oc, 1.2, 'multiply', lp.opacity, (c) => {
      const upOut = pts(lms, LIP_UP_OUT, w, h)
      const upIn  = pts(lms, LIP_UP_IN,  w, h)
      c.beginPath()
      upOut.forEach(([x,y],i) => i===0 ? c.moveTo(x,y) : c.lineTo(x,y))
      ;[...upIn].reverse().forEach(([x,y]) => c.lineTo(x,y))
      c.closePath()
      c.fillStyle = `rgb(${r},${g},${b})`
      c.fill()
      const loOut = pts(lms, LIP_LO_OUT, w, h)
      const loIn  = pts(lms, LIP_LO_IN,  w, h)
      c.beginPath()
      loOut.forEach(([x,y],i) => i===0 ? c.moveTo(x,y) : c.lineTo(x,y))
      ;[...loIn].reverse().forEach(([x,y]) => c.lineTo(x,y))
      c.closePath()
      c.fillStyle = `rgb(${r},${g},${b})`
      c.fill()
    })
    blitBlurred(ctx, oc, 2.5, 'screen', 0.45, (c) => {
      const upOut = pts(lms, LIP_UP_OUT, w, h)
      const upIn  = pts(lms, LIP_UP_IN,  w, h)
      const loOut = pts(lms, LIP_LO_OUT, w, h)
      const loIn  = pts(lms, LIP_LO_IN,  w, h)
      c.save()
      c.beginPath()
      upOut.forEach(([x,y],i) => i===0 ? c.moveTo(x,y) : c.lineTo(x,y))
      ;[...upIn].reverse().forEach(([x,y]) => c.lineTo(x,y))
      c.closePath()
      c.beginPath()
      loOut.forEach(([x,y],i) => i===0 ? c.moveTo(x,y) : c.lineTo(x,y))
      ;[...loIn].reverse().forEach(([x,y]) => c.lineTo(x,y))
      c.closePath()
      c.clip()
      const cx   = lms[0].x * w
      const ty   = lms[0].y * h
      const lipH = Math.max(4, Math.abs(lms[17].y - lms[0].y) * h)
      const g2   = c.createRadialGradient(cx, ty + lipH*0.15, 0, cx, ty + lipH*0.15, lipH * 2.8)
      g2.addColorStop(0,   'rgba(255,255,255,0.7)')
      g2.addColorStop(0.4, 'rgba(255,255,255,0.2)')
      g2.addColorStop(1,   'rgba(255,255,255,0)')
      c.fillStyle = g2
      c.fillRect(cx - lipH*5, ty - lipH, lipH*10, lipH*3)
      c.restore()
    })
  }
}

// ── Shade catalogue ───────────────────────────────────────────────────────────
const SHADES = {
  lipstick:    { label:'Lipstick',     shades:[
    {name:'Ruby Red',    hex:'#C41E3A'},{name:'Nude Pink',   hex:'#D4808E'},
    {name:'Berry Plum',  hex:'#8B1A4A'},{name:'Coral',       hex:'#FF6B6B'},
    {name:'Brick',       hex:'#9B4448'},{name:'Bordeaux',    hex:'#5C0A14'},
    {name:'Mauve',       hex:'#B07080'},{name:'Rose Gold',   hex:'#C9706A'},
  ]},
  eyeshadow:   { label:'Eyeshadow',    shades:[
    {name:'Smoky',       hex:'#2E2E2E'},{name:'Rose Gold',   hex:'#B76E79'},
    {name:'Bronze',      hex:'#8C5A2E'},{name:'Purple',      hex:'#6A0D83'},
    {name:'Champagne',   hex:'#C8A882'},{name:'Teal',        hex:'#008080'},
    {name:'Ocean',       hex:'#1C5F8C'},{name:'Nude',        hex:'#C49A6C'},
  ]},
  eyeliner:    { label:'Eyeliner',     shades:[
    {name:'Jet Black',   hex:'#080808'},{name:'Soft Black',  hex:'#1C1A1A'},
    {name:'Deep Brown',  hex:'#3E1A00'},{name:'Navy',        hex:'#0A1840'},
    {name:'Teal',        hex:'#005F5F'},{name:'Burgundy',    hex:'#5C001A'},
  ]},
  blush:       { label:'Blush',        shades:[
    {name:'Peachy',      hex:'#FFAA80'},{name:'Rose',        hex:'#D4698A'},
    {name:'Coral',       hex:'#FF7B54'},{name:'Berry',       hex:'#9B4F7A'},
    {name:'Terracotta',  hex:'#C1694F'},
  ]},
  contour:     { label:'Contour',      shades:[
    {name:'Light',       hex:'#C8956C'},{name:'Medium',      hex:'#A0663C'},
    {name:'Deep',        hex:'#6B3320'},{name:'Cool',        hex:'#8B7060'},
  ]},
  highlighter: { label:'Highlighter',  shades:[
    {name:'Gold',        hex:'#FFD060'},{name:'Rose Gold',   hex:'#E8B4A0'},
    {name:'Champagne',   hex:'#F0D880'},{name:'Pearl',       hex:'#F8F4EE'},
    {name:'Bronze',      hex:'#CD9040'},
  ]},
  foundation:  { label:'Foundation',   shades:[
    {name:'Porcelain',   hex:'#F5E6D3'},{name:'Fair',        hex:'#EDD5B8'},
    {name:'Light',       hex:'#D9B99B'},{name:'Medium',      hex:'#C08040'},
    {name:'Tan',         hex:'#A0663C'},{name:'Deep',        hex:'#6B3320'},
  ]},
  mascara:     { label:'Mascara',      shades:[
    {name:'Jet Black',   hex:'#050505'},{name:'Soft Black',  hex:'#1A1A1A'},
    {name:'Deep Brown',  hex:'#2C1A0E'},{name:'Navy',        hex:'#0A0F2E'},
    {name:'Burgundy',    hex:'#3A0010'},
  ]},
} as const

type MakeupType = keyof typeof SHADES
type ShadeEntry = { hex: string; name: string; opacity: number } | null
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

  useEffect(() => { makeupRef.current = selectedMakeup }, [selectedMakeup])

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

  // ── Photo capture / apply ─────────────────────────────────────────────────
  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return
    const tmp = document.createElement('canvas')
    tmp.width  = videoRef.current.videoWidth  || 640
    tmp.height = videoRef.current.videoHeight || 480
    const ctx = tmp.getContext('2d')!
    ctx.translate(tmp.width, 0); ctx.scale(-1,1)
    ctx.drawImage(videoRef.current, 0, 0)
    ctx.setTransform(1,0,0,1,0,0)
    setCapturedPhoto(tmp.toDataURL('image/jpeg', 0.92))
    setPhotoResult(null)
    setMode('photo')
  }, [])

  const applyToPhoto = useCallback(async () => {
    if (!capturedPhoto) return
    const hasAny = Object.values(selectedMakeup).some(Boolean)
    if (!hasAny) return
    setIsProcessing(true)
    const config: any = {}
    for (const [k,v] of Object.entries(selectedMakeup)) {
      if (v) config[k] = { color: v.hex, opacity: v.opacity }
    }
    try {
      const { data } = await tryonAPI.applyMakeup(capturedPhoto, config)
      if (data.success) setPhotoResult(data.image)
      else toast.error('No face detected. Try better lighting.')
    } catch { toast.error('Processing failed.') }
    finally { setIsProcessing(false) }
  }, [capturedPhoto, selectedMakeup])

  const downloadResult = useCallback(() => {
    const src = photoResult || (mode === 'live' && canvasRef.current
      ? canvasRef.current.toDataURL('image/jpeg', 0.92) : capturedPhoto)
    if (!src) return
    const a = document.createElement('a')
    a.href = src; a.download = 'glamour-ai-look.jpg'; a.click()
    toast.success('Saved!')
  }, [photoResult, capturedPhoto, mode])

  const toggleMakeup = (type: MakeupType, shade: { name: string; hex: string }) => {
    setSelectedMakeup(prev => ({
      ...prev,
      [type]: prev[type]?.hex === shade.hex
        ? null
        : { ...shade, opacity: DEFAULT_OPACITY[type] },
    }))
  }

  const applyPreset = (preset: typeof PRESETS[0]) => {
    const next: SelectedMakeup = {}
    for (const [type, shade] of Object.entries(preset.makeup)) {
      if (shade) next[type] = { ...shade, opacity: DEFAULT_OPACITY[type] }
    }
    setSelectedMakeup(next)
    toast.success(`Applied "${preset.name}"`)
  }

  const clearAll = () => {
    setSelectedMakeup({})
    toast('Look cleared', { icon: '✕' })
  }

  const displaySrc    = mode === 'photo' ? (photoResult || capturedPhoto) : null
  const hasAnyMakeup  = Object.values(selectedMakeup).some(Boolean)
  const activeCount   = Object.values(selectedMakeup).filter(Boolean).length

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
            Real-time face detection · 7 makeup categories · 40+ shades
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Preview ───────────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="relative bg-charcoal aspect-[4/3] overflow-hidden border border-champagne/10">
              <video ref={videoRef} autoPlay playsInline muted className="hidden" />

              {/* Live canvas (CSS-mirrored for selfie feel) */}
              {cameraActive && mode === 'live' && (
                <canvas ref={canvasRef} className="w-full h-full object-cover" style={{ transform:'scaleX(-1)' }} />
              )}

              {/* Photo result */}
              {displaySrc && (
                <img src={displaySrc} alt="Try-on result" className="w-full h-full object-cover" />
              )}

              {/* Idle state */}
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

              {/* Error */}
              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-noir/90 p-8">
                  <CameraOff size={36} className="text-red-400 mb-4" />
                  <p className="font-sans text-xs text-center text-ivory/70 mb-6">{cameraError}</p>
                  <button onClick={startCamera} className="btn-secondary text-ivory border-ivory/30">Try Again</button>
                </div>
              )}

              {/* AI loading */}
              {mpLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-noir/70 backdrop-blur-sm">
                  <Loader2 size={32} className="text-champagne animate-spin mb-4" />
                  <p className="font-sans text-xs tracking-widest uppercase text-champagne">Loading AI…</p>
                  <p className="font-sans text-[10px] text-ivory/40 mt-1">First load ~6 MB</p>
                </div>
              )}

              {/* Processing badge */}
              {isProcessing && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-noir/70 backdrop-blur-sm px-3 py-2 border border-champagne/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-champagne animate-pulse" />
                  <span className="font-sans text-[10px] tracking-widest uppercase text-champagne">Processing</span>
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

              {/* Active makeup badges */}
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

            {/* Controls bar */}
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

            {/* Panel header */}
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
              {/* ── Presets panel ── */}
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

              {/* ── Shades panel ── */}
              {activePanel === 'shades' && (
                <motion.div key="shades" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}>
                  {/* Category tabs — 4-col grid, wraps to 2 rows */}
                  <div className="grid grid-cols-4 gap-1.5 mb-6">
                    {(Object.keys(SHADES) as MakeupType[]).map(type => (
                      <button key={type} onClick={() => setActiveTab(type)}
                        className={`py-2 font-sans text-[9px] tracking-wider uppercase transition-all leading-tight text-center ${
                          activeTab === type
                            ? 'bg-champagne text-noir'
                            : 'border border-ivory/10 text-ivory/50 hover:border-champagne/40 hover:text-ivory/80'
                        }`}>
                        {selectedMakeup[type] && (
                          <span className="block w-1 h-1 rounded-full bg-current mx-auto mb-0.5" />
                        )}
                        {SHADES[type].label}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>

                      <div className="grid grid-cols-5 gap-2.5 mb-4">
                        {/* Clear swatch */}
                        <button onClick={() => setSelectedMakeup(p => ({ ...p, [activeTab]: null }))}
                          className={`w-8 h-8 border-2 flex items-center justify-center transition-all ${
                            !selectedMakeup[activeTab] ? 'border-champagne text-champagne' : 'border-ivory/20 text-ivory/30 hover:border-ivory/50'
                          }`}>
                          <X size={11} />
                        </button>

                        {SHADES[activeTab].shades.map(shade => {
                          const sel = selectedMakeup[activeTab]?.hex === shade.hex
                          return (
                            <button key={shade.hex} onClick={() => toggleMakeup(activeTab, shade)}
                              title={shade.name}
                              className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
                                sel ? 'ring-2 ring-offset-2 ring-champagne ring-offset-charcoal scale-110' : 'shadow-md'
                              }`}
                              style={{ background: shade.hex }} />
                          )
                        })}
                      </div>

                      {selectedMakeup[activeTab] && (
                        <div className="bg-noir/50 px-4 py-3 flex items-center gap-3 mb-3">
                          <span className="w-5 h-5 rounded-full flex-shrink-0"
                            style={{ background: selectedMakeup[activeTab]!.hex }} />
                          <div>
                            <p className="font-sans text-xs text-ivory">{selectedMakeup[activeTab]!.name}</p>
                            <p className="font-sans text-[10px] text-ivory/40 uppercase tracking-widest">
                              {SHADES[activeTab].label}
                            </p>
                          </div>
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

            {/* How it works */}
            <div className="mt-8 border-t border-ivory/10 pt-6">
              <p className="font-sans text-[10px] tracking-widest uppercase text-champagne mb-3">How It Works</p>
              <ol className="space-y-2">
                {[
                  '1. Enable your camera',
                  '2. Pick a preset or build your own',
                  '3. Makeup renders instantly on your face',
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
