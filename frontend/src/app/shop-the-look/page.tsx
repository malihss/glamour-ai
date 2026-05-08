'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Sparkles, ShoppingBag, X, Loader2,
  ImageIcon, Check, ArrowRight, Camera, RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useCartStore, useAuthStore } from '@/lib/store'
import { cartAPI } from '@/lib/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// ── Types ─────────────────────────────────────────────────────────────────────
type LM = { x: number; y: number; z?: number }
type MakeupLayer = { hex: string; opacity: number } | null
type MakeupConfig = Record<string, MakeupLayer>

interface Look {
  id: string
  name: string
  subtitle: string
  vibe: string
  model: string
  palette: string[]
  makeup: MakeupConfig
  searchTerms: string[]
}

// ── Editorial looks ───────────────────────────────────────────────────────────
const LOOKS: Look[] = [
  {
    id: 'natural-glow',
    name: 'Natural Glow',
    subtitle: 'Soft everyday radiance',
    vibe: 'Daytime · Fresh · Luminous',
    model: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=700&q=90',
    palette: ['#EDD5B8', '#FFAA80', '#F0D880', '#D4808E'],
    makeup: {
      foundation:  { hex: '#EDD5B8', opacity: 0.22 },
      blush:       { hex: '#FFAA80', opacity: 0.38 },
      highlighter: { hex: '#F0D880', opacity: 0.42 },
      lipstick:    { hex: '#D4808E', opacity: 0.65 },
    },
    searchTerms: ['foundation', 'blush', 'highlighter', 'lipstick'],
  },
  {
    id: 'smoky-glam',
    name: 'Smoky Glam',
    subtitle: 'Intense evening allure',
    vibe: 'Evening · Dramatic · Seductive',
    model: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=700&q=90',
    palette: ['#2E2E2E', '#D4698A', '#C41E3A', '#080808'],
    makeup: {
      eyeshadow: { hex: '#2E2E2E', opacity: 0.55 },
      eyeliner:  { hex: '#080808', opacity: 0.90 },
      mascara:   { hex: '#050505', opacity: 0.92 },
      blush:     { hex: '#D4698A', opacity: 0.38 },
      lipstick:  { hex: '#C41E3A', opacity: 0.78 },
    },
    searchTerms: ['eyeshadow', 'eyeliner', 'mascara', 'blush', 'lipstick'],
  },
  {
    id: 'editorial',
    name: 'Editorial',
    subtitle: 'High-fashion statement',
    vibe: 'Fashion · Avant-garde · Fierce',
    model: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=700&q=90',
    palette: ['#6A0D83', '#FFD060', '#8B1A4A', '#A0663C'],
    makeup: {
      eyeshadow:   { hex: '#6A0D83', opacity: 0.58 },
      eyeliner:    { hex: '#080808', opacity: 0.90 },
      contour:     { hex: '#A0663C', opacity: 0.32 },
      highlighter: { hex: '#FFD060', opacity: 0.50 },
      lipstick:    { hex: '#8B1A4A', opacity: 0.82 },
    },
    searchTerms: ['eyeshadow', 'eyeliner', 'contour', 'highlighter', 'lipstick'],
  },
  {
    id: 'bronzed',
    name: 'Bronzed Beauty',
    subtitle: 'Sun-kissed warmth',
    vibe: 'Summer · Warm · Glowing',
    model: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=700&q=90',
    palette: ['#8C5A2E', '#FF7B54', '#CD9040', '#9B4448'],
    makeup: {
      eyeshadow:   { hex: '#8C5A2E', opacity: 0.50 },
      blush:       { hex: '#FF7B54', opacity: 0.40 },
      contour:     { hex: '#A0663C', opacity: 0.30 },
      highlighter: { hex: '#CD9040', opacity: 0.48 },
      lipstick:    { hex: '#9B4448', opacity: 0.68 },
    },
    searchTerms: ['bronzer', 'blush', 'contour', 'highlighter', 'lipstick'],
  },
  {
    id: 'french-girl',
    name: 'French Girl',
    subtitle: 'Effortless Parisian chic',
    vibe: 'Parisian · Minimal · Romantic',
    model: 'https://images.unsplash.com/photo-1561069934-eee225952461?w=700&q=90',
    palette: ['#F0D5BE', '#E8A0A0', '#C08060'],
    makeup: {
      foundation: { hex: '#F0D5BE', opacity: 0.18 },
      blush:      { hex: '#E8A0A0', opacity: 0.28 },
      lipstick:   { hex: '#C08060', opacity: 0.55 },
    },
    searchTerms: ['foundation', 'blush', 'lipstick', 'skincare'],
  },
  {
    id: 'rose-quartz',
    name: 'Rose Quartz',
    subtitle: 'Dreamy romantic hues',
    vibe: 'Romantic · Feminine · Soft',
    model: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700&q=90',
    palette: ['#B76E79', '#D4698A', '#E8B4A0', '#C07090'],
    makeup: {
      eyeshadow:   { hex: '#B76E79', opacity: 0.48 },
      blush:       { hex: '#D4698A', opacity: 0.42 },
      highlighter: { hex: '#E8B4A0', opacity: 0.45 },
      lipstick:    { hex: '#C07090', opacity: 0.72 },
    },
    searchTerms: ['eyeshadow', 'blush', 'highlighter', 'lipstick'],
  },
]

// ── MediaPipe landmark indices ────────────────────────────────────────────────
const LIP_UP_OUT = [61,185,40,39,37,0,267,269,270,409,291]
const LIP_UP_IN  = [78,191,80,81,82,13,312,311,310,415,308]
const LIP_LO_OUT = [61,146,91,181,84,17,314,405,321,375,291]
const LIP_LO_IN  = [78,95,88,178,87,14,317,402,318,324,308]
const L_EYE_FULL = [33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7]
const R_EYE_FULL = [263,466,388,387,386,385,384,398,362,382,381,380,374,373,390,249]
const L_LASH     = [33,246,161,160,159,158,157,173,133]
const R_LASH     = [263,466,388,387,386,385,384,398,362]
const L_BROW     = [70,63,105,66,107,55,65,52,53,46]
const R_BROW     = [300,293,334,296,336,285,295,282,283,276]
const FACE       = [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,
                    400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109]

// ── Renderer helpers ──────────────────────────────────────────────────────────
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
function blitBlurred(
  ctx: CanvasRenderingContext2D, oc: CanvasRenderingContext2D,
  blurPx: number, composite: GlobalCompositeOperation, alpha: number,
  drawFn: (c: CanvasRenderingContext2D) => void
) {
  const w = oc.canvas.width; const h = oc.canvas.height
  oc.clearRect(0,0,w,h); oc.filter='none'
  drawFn(oc)
  ctx.save()
  ctx.filter = blurPx > 0 ? `blur(${blurPx}px)` : 'none'
  ctx.globalAlpha = alpha; ctx.globalCompositeOperation = composite
  ctx.drawImage(oc.canvas,0,0); ctx.restore(); ctx.filter='none'
}
function smoothPath(c: CanvasRenderingContext2D, points: [number,number][], close = false) {
  if (!points.length) return
  c.moveTo(points[0][0], points[0][1])
  for (let i = 0; i < points.length - 1; i++) {
    const mx = (points[i][0]+points[i+1][0])*0.5
    const my = (points[i][1]+points[i+1][1])*0.5
    c.quadraticCurveTo(points[i][0],points[i][1],mx,my)
  }
  if (close) {
    const n = points.length-1
    const mx=(points[n][0]+points[0][0])*0.5; const my=(points[n][1]+points[0][1])*0.5
    c.quadraticCurveTo(points[n][0],points[n][1],mx,my)
  } else {
    c.lineTo(points[points.length-1][0],points[points.length-1][1])
  }
}
function lipShape(c: CanvasRenderingContext2D, outer: [number,number][], inner: [number,number][]) {
  const all = [...outer, ...[...inner].reverse()]
  c.beginPath(); c.moveTo(all[0][0],all[0][1])
  for (let i=0;i<all.length-1;i++) {
    const mx=(all[i][0]+all[i+1][0])*0.5; const my=(all[i][1]+all[i+1][1])*0.5
    c.quadraticCurveTo(all[i][0],all[i][1],mx,my)
  }
  c.closePath()
}

function renderMakeup(
  ctx: CanvasRenderingContext2D, oc: CanvasRenderingContext2D,
  lms: LM[], w: number, h: number, makeup: MakeupConfig
) {
  const faceW = Math.abs(lms[454].x - lms[234].x) * w

  // Foundation
  const fd = makeup.foundation
  if (fd) {
    const [r,g,b] = hex2rgb(fd.hex)
    blitBlurred(ctx,oc,20,'color',fd.opacity*0.60,(c)=>{
      const fp=pts(lms,FACE,w,h);c.beginPath();smoothPath(c,fp,true);c.fillStyle=`rgb(${r},${g},${b})`;c.fill()
    })
    blitBlurred(ctx,oc,26,'soft-light',fd.opacity*0.18,(c)=>{
      const fp=pts(lms,FACE,w,h);c.beginPath();smoothPath(c,fp,true);c.fillStyle=`rgb(${r},${g},${b})`;c.fill()
    })
  }

  // Contour
  const cn = makeup.contour
  if (cn) {
    const [r,g,b]=hex2rgb(cn.hex)
    const drawC=(c: CanvasRenderingContext2D)=>{
      const [lox,loy]=lmxy(lms,234,w,h);const [lix,liy]=lmxy(lms,93,w,h)
      const lcx=lox*0.40+lix*0.60;const lcy=(loy+liy)*0.5+faceW*0.02
      const [rox,roy]=lmxy(lms,454,w,h);const [rix,riy]=lmxy(lms,323,w,h)
      const rcx=rox*0.40+rix*0.60;const rcy=(roy+riy)*0.5+faceW*0.02
      const rx=faceW*0.22;const ry=faceW*0.065
      c.save();c.translate(lcx,lcy);c.rotate(-0.25)
      const lg=c.createRadialGradient(0,0,0,0,0,rx)
      lg.addColorStop(0,`rgba(${r},${g},${b},1.0)`);lg.addColorStop(1,`rgba(${r},${g},${b},0)`)
      c.fillStyle=lg;c.beginPath();c.ellipse(0,0,rx,ry,0,0,Math.PI*2);c.fill();c.restore()
      c.save();c.translate(rcx,rcy);c.rotate(0.25)
      const rg2=c.createRadialGradient(0,0,0,0,0,rx)
      rg2.addColorStop(0,`rgba(${r},${g},${b},1.0)`);rg2.addColorStop(1,`rgba(${r},${g},${b},0)`)
      c.fillStyle=rg2;c.beginPath();c.ellipse(0,0,rx,ry,0,0,Math.PI*2);c.fill();c.restore()
    }
    blitBlurred(ctx,oc,Math.max(16,faceW*0.12),'color',cn.opacity*0.72,drawC)
    blitBlurred(ctx,oc,Math.max(14,faceW*0.10),'soft-light',cn.opacity*0.58,drawC)
  }

  // Blush
  const bl = makeup.blush
  if (bl) {
    const [r,g,b]=hex2rgb(bl.hex)
    const rad=faceW*0.22
    const [lbx,lby]=lmxy(lms,116,w,h);const [rbx,rby]=lmxy(lms,345,w,h)
    const centers:[[number,number],[number,number]]=[[lbx,lby+faceW*0.01],[rbx,rby+faceW*0.01]] as any
    blitBlurred(ctx,oc,Math.max(12,rad*0.70),'color',bl.opacity*0.82,(c)=>{
      ;(centers as [number,number][]).forEach(([cx,cy])=>{
        const g2=c.createRadialGradient(cx,cy,0,cx,cy,rad)
        g2.addColorStop(0,`rgba(${r},${g},${b},1.0)`);g2.addColorStop(0.40,`rgba(${r},${g},${b},0.65)`);g2.addColorStop(1,`rgba(${r},${g},${b},0)`)
        c.fillStyle=g2;c.beginPath();c.ellipse(cx,cy,rad,rad*0.72,0,0,Math.PI*2);c.fill()
      })
    })
    blitBlurred(ctx,oc,Math.max(18,rad*1.0),'soft-light',bl.opacity*0.55,(c)=>{
      ;(centers as [number,number][]).forEach(([cx,cy])=>{
        const g2=c.createRadialGradient(cx,cy,0,cx,cy,rad*1.1)
        g2.addColorStop(0,`rgba(${r},${g},${b},0.90)`);g2.addColorStop(0.5,`rgba(${r},${g},${b},0.45)`);g2.addColorStop(1,`rgba(${r},${g},${b},0)`)
        c.fillStyle=g2;c.beginPath();c.ellipse(cx,cy,rad*1.1,rad*0.78,0,0,Math.PI*2);c.fill()
      })
    })
  }

  // Highlighter
  const hl = makeup.highlighter
  if (hl) {
    const [r,g,b]=hex2rgb(hl.hex)
    const drawHL=(c: CanvasRenderingContext2D,str: number)=>{
      const [lhx,lhy]=lmxy(lms,116,w,h);const [rhx,rhy]=lmxy(lms,345,w,h)
      const [nbx,nby]=lmxy(lms,6,w,h)
      const spots:[[number,number],number,number,number][]=[
        [[lhx,lhy-faceW*0.025],faceW*0.110,faceW*0.070,str*1.0],
        [[rhx,rhy-faceW*0.025],faceW*0.110,faceW*0.070,str*1.0],
        [[nbx,nby-faceW*0.005],faceW*0.038,faceW*0.038,str*0.80],
      ]
      spots.forEach(([[cx,cy],rx,ry,s])=>{
        const g2=c.createRadialGradient(cx,cy,0,cx,cy,Math.max(rx,ry))
        g2.addColorStop(0,`rgba(${r},${g},${b},${s})`);g2.addColorStop(0.40,`rgba(${r},${g},${b},${s*0.45})`);g2.addColorStop(1,`rgba(${r},${g},${b},0)`)
        c.fillStyle=g2;c.beginPath();c.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);c.fill()
      })
    }
    blitBlurred(ctx,oc,Math.max(10,faceW*0.07),'soft-light',hl.opacity*0.70,(c)=>drawHL(c,1.0))
    blitBlurred(ctx,oc,Math.max(6,faceW*0.04),'screen',hl.opacity*0.55,(c)=>drawHL(c,0.80))
  }

  // Eyeshadow
  const ey = makeup.eyeshadow
  if (ey) {
    const [r,g,b]=hex2rgb(ey.hex)
    ;([
      [L_LASH,L_BROW,L_EYE_FULL],[R_LASH,R_BROW,R_EYE_FULL]
    ] as [number[],number[],number[]][]).forEach(([lashIdx,browIdx,fullIdx])=>{
      const lashPts=pts(lms,lashIdx,w,h);const browPts=pts(lms,browIdx,w,h);const eyeFullPts=pts(lms,fullIdx,w,h)
      const lashTopY=Math.min(...lashPts.map(p=>p[1]));const browBottomY=Math.max(...browPts.map(p=>p[1]))
      const eyeBottomY=Math.max(...eyeFullPts.map(p=>p[1]));const creaseY=lashTopY-(lashTopY-browBottomY)*0.55
      const midX=lashPts.reduce((s,p)=>s+p[0],0)/lashPts.length
      const innerCorner=lashPts[0];const outerCorner=lashPts[lashPts.length-1]
      const minX=Math.min(...lashPts.map(p=>p[0]))-6;const maxW=Math.max(...lashPts.map(p=>p[0]))-minX+12
      const clipArch=(c: CanvasRenderingContext2D)=>{
        c.beginPath();smoothPath(c,lashPts,false)
        c.quadraticCurveTo((midX+outerCorner[0])*0.5,creaseY,midX,creaseY-faceW*0.008)
        c.quadraticCurveTo((midX+innerCorner[0])*0.5,creaseY,innerCorner[0],innerCorner[1])
        c.closePath();c.clip()
      }
      blitBlurred(ctx,oc,Math.max(3,faceW*0.012),'multiply',ey.opacity*0.55,(c)=>{
        c.save();clipArch(c)
        const grad=c.createLinearGradient(midX,eyeBottomY+2,midX,lashTopY-faceW*0.03)
        grad.addColorStop(0,`rgba(${r},${g},${b},1.0)`);grad.addColorStop(0.22,`rgba(${r},${g},${b},0.65)`)
        grad.addColorStop(0.55,`rgba(${r},${g},${b},0.20)`);grad.addColorStop(1,`rgba(${r},${g},${b},0)`)
        c.fillStyle=grad;c.fillRect(minX,creaseY-6,maxW,eyeBottomY-creaseY+12);c.restore()
      })
      blitBlurred(ctx,oc,Math.max(5,faceW*0.026),'color',ey.opacity*0.88,(c)=>{
        c.save();clipArch(c)
        const grad=c.createLinearGradient(midX,eyeBottomY+2,midX,creaseY-2)
        grad.addColorStop(0,`rgba(${r},${g},${b},1.0)`);grad.addColorStop(0.32,`rgba(${r},${g},${b},0.88)`)
        grad.addColorStop(0.68,`rgba(${r},${g},${b},0.42)`);grad.addColorStop(1,`rgba(${r},${g},${b},0)`)
        c.fillStyle=grad;c.fillRect(minX,creaseY-6,maxW,eyeBottomY-creaseY+12);c.restore()
      })
    })
  }

  // Eyeliner
  const el = makeup.eyeliner
  if (el) {
    const [r,g,b]=hex2rgb(el.hex)
    const lineW=Math.max(2.5,faceW*0.011)
    blitBlurred(ctx,oc,0.3,'multiply',el.opacity,(c)=>{
      ;([
        [L_LASH,33,133],[R_LASH,263,362]
      ] as [number[],number,number][]).forEach(([lashIdx,outerIdx,innerIdx])=>{
        const ep=pts(lms,lashIdx,w,h);const outer=lmxy(lms,outerIdx,w,h);const inner=lmxy(lms,innerIdx,w,h)
        for (let i=0;i<ep.length-1;i++) {
          const wMult=0.6+0.8*(1-i/(ep.length-1))
          const mx=(ep[i][0]+ep[i+1][0])*0.5;const my=(ep[i][1]+ep[i+1][1])*0.5
          c.beginPath();c.moveTo(ep[i][0],ep[i][1]);c.lineTo(mx,my)
          c.strokeStyle=`rgb(${r},${g},${b})`;c.lineWidth=lineW*wMult;c.lineCap='round';c.stroke()
        }
        const dx=outer[0]-inner[0];const dy=outer[1]-inner[1];const ang=Math.atan2(dy,dx)
        const wl=faceW*0.048;const upAngle=dx<0?ang+0.55:ang-0.55
        const wingTip:[number,number]=[outer[0]+Math.cos(upAngle)*wl,outer[1]+Math.sin(upAngle)*wl]
        c.beginPath();c.moveTo(outer[0],outer[1]);c.lineTo(wingTip[0],wingTip[1])
        const ep2=ep[ep.length-2]
        c.quadraticCurveTo((outer[0]+ep2[0])*0.5+Math.cos(upAngle-0.3)*lineW*1.5,(outer[1]+ep2[1])*0.5+Math.sin(upAngle-0.3)*lineW*1.5,ep2[0],ep2[1])
        c.fillStyle=`rgb(${r},${g},${b})`;c.fill()
      })
    })
  }

  // Mascara
  const ms = makeup.mascara
  if (ms) {
    const [r,g,b]=hex2rgb(ms.hex);const lashW=Math.max(2.5,faceW*0.011)
    blitBlurred(ctx,oc,0.5,'multiply',ms.opacity,(c)=>{
      ;([L_LASH,R_LASH] as number[][]).forEach(lashIdx=>{
        const ep=pts(lms,lashIdx,w,h)
        c.beginPath();smoothPath(c,ep,false)
        c.strokeStyle=`rgba(${r},${g},${b},0.95)`;c.lineWidth=lashW*1.1;c.lineCap='round';c.stroke()
        ep.forEach(([x,y],i)=>{
          const prev=ep[Math.max(0,i-1)];const next=ep[Math.min(ep.length-1,i+1)]
          const tdx=next[0]-prev[0];const tdy=next[1]-prev[1];const tlen=Math.sqrt(tdx*tdx+tdy*tdy)+0.001
          let nx=-tdy/tlen;let ny=tdx/tlen;if(ny>0){nx=-nx;ny=-ny}
          const variation=0.45+0.55*Math.abs(Math.sin(i*1.1))
          const lashLen=lashW*3.2*variation
          const tipX=x+nx*lashLen*0.90;const tipY=y+ny*lashLen*0.88
          const ctlX=x+nx*lashLen*0.50;const ctlY=y+ny*lashLen*0.50
          const pw=lashW*0.46*(0.55+0.45*variation);const pHx=ny;const pHy=-nx
          c.beginPath()
          c.moveTo(x-pHx*pw*0.5,y-pHy*pw*0.5)
          c.quadraticCurveTo(ctlX-pHx*pw*0.20,ctlY-pHy*pw*0.20,tipX,tipY)
          c.quadraticCurveTo(ctlX+pHx*pw*0.20,ctlY+pHy*pw*0.20,x+pHx*pw*0.5,y+pHy*pw*0.5)
          c.closePath();c.fillStyle=`rgba(${r},${g},${b},${0.90+0.10*variation})`;c.fill()
        })
      })
    })
  }

  // Lipstick
  const lp = makeup.lipstick
  if (lp) {
    const [r,g,b]=hex2rgb(lp.hex)
    const upOut=pts(lms,LIP_UP_OUT,w,h);const upIn=pts(lms,LIP_UP_IN,w,h)
    const loOut=pts(lms,LIP_LO_OUT,w,h);const loIn=pts(lms,LIP_LO_IN,w,h)
    const drawLips=(c: CanvasRenderingContext2D,fill?: string)=>{
      c.fillStyle=fill??`rgb(${r},${g},${b})`;lipShape(c,upOut,upIn);c.fill();lipShape(c,loOut,loIn);c.fill()
    }
    blitBlurred(ctx,oc,0.6,'source-over',lp.opacity*0.22,(c)=>drawLips(c))
    blitBlurred(ctx,oc,0.8,'color',lp.opacity*0.82,(c)=>drawLips(c))
    blitBlurred(ctx,oc,1.0,'saturation',lp.opacity*0.65,(c)=>drawLips(c))
    blitBlurred(ctx,oc,1.4,'soft-light',lp.opacity*0.35,(c)=>drawLips(c))
    blitBlurred(ctx,oc,1.6,'screen',lp.opacity*0.55,(c)=>{
      c.save();lipShape(c,loOut,loIn);c.clip()
      const lTop=Math.min(...loIn.map(p=>p[1]));const lBot=Math.max(...loOut.map(p=>p[1]))
      const lLeft=Math.min(...loOut.map(p=>p[0]));const lRight=Math.max(...loOut.map(p=>p[0]))
      const lCx=(lLeft+lRight)*0.50;const lCy=lTop+(lBot-lTop)*0.34;const lRx=(lRight-lLeft)*0.34
      const grad=c.createRadialGradient(lCx,lCy,0,lCx,lCy,lRx)
      grad.addColorStop(0,'rgba(255,255,255,0.92)');grad.addColorStop(0.30,'rgba(255,255,255,0.62)')
      grad.addColorStop(0.65,'rgba(255,255,255,0.18)');grad.addColorStop(1,'rgba(255,255,255,0)')
      c.fillStyle=grad;c.fillRect(lLeft,lTop,lRight-lLeft,lBot-lTop);c.restore()
    })
  }
}

// ── MediaPipe loader ──────────────────────────────────────────────────────────
const MP_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/'
async function loadFaceMesh(): Promise<any> {
  await new Promise<void>((res, rej) => {
    const id = 'mp-stl-script'
    if (document.getElementById(id)) { res(); return }
    const s = document.createElement('script')
    s.id = id; s.src = MP_CDN + 'face_mesh.js'
    s.onload = () => res(); s.onerror = rej
    document.head.appendChild(s)
  })
  const fm = new (window as any).FaceMesh({ locateFile: (f: string) => MP_CDN + f })
  fm.setOptions({ maxNumFaces:1, refineLandmarks:true, minDetectionConfidence:0.5, minTrackingConfidence:0.5 })
  return fm
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ShopTheLookPage() {
  const [activeLook,    setActiveLook]    = useState<Look>(LOOKS[0])
  const [uploadedImg,   setUploadedImg]   = useState<string | null>(null)
  const [processedImg,  setProcessedImg]  = useState<string | null>(null)
  const [isProcessing,  setIsProcessing]  = useState(false)
  const [products,      setProducts]      = useState<any[]>([])
  const [loadingProds,  setLoadingProds]  = useState(false)
  const [addedIds,      setAddedIds]      = useState<Set<string>>(new Set())
  const [addingAll,     setAddingAll]     = useState(false)
  const [isDragging,    setIsDragging]    = useState(false)

  const fileRef     = useRef<HTMLInputElement>(null)
  const faceMeshRef = useRef<any>(null)

  const { setCart, setOpen } = useCartStore()
  const { isAuthenticated }  = useAuthStore()

  // ── Fetch matched products ────────────────────────────────────────────────
  const fetchProducts = useCallback(async (look: Look) => {
    setLoadingProds(true)
    setProducts([])
    const seen = new Set<string>()
    const results: any[] = []

    for (const term of look.searchTerms.slice(0, 4)) {
      try {
        const res = await fetch(`${API_URL}/products/?search=${encodeURIComponent(term)}&limit=2&is_active=true`)
        if (!res.ok) continue
        const { products: found = [] } = await res.json()
        for (const p of found) {
          if (!seen.has(p.id) && results.length < 6) { seen.add(p.id); results.push(p) }
        }
      } catch {}
    }

    // Pad with makeup featured products if too few
    if (results.length < 3) {
      try {
        const res = await fetch(`${API_URL}/products/?category=makeup&limit=6`)
        if (res.ok) {
          const { products: extra = [] } = await res.json()
          for (const p of extra) {
            if (!seen.has(p.id) && results.length < 6) { seen.add(p.id); results.push(p) }
          }
        }
      } catch {}
    }

    // Last resort: any featured product
    if (results.length < 2) {
      try {
        const res = await fetch(`${API_URL}/products/featured`)
        if (res.ok) {
          const { products: feat = [] } = await res.json()
          for (const p of feat) {
            if (!seen.has(p.id) && results.length < 6) { seen.add(p.id); results.push(p) }
          }
        }
      } catch {}
    }

    setProducts(results)
    setLoadingProds(false)
  }, [])

  useEffect(() => { fetchProducts(activeLook) }, [activeLook, fetchProducts])

  // ── Apply makeup when image or look changes ───────────────────────────────
  useEffect(() => {
    if (uploadedImg) applyMakeupToPhoto()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLook, uploadedImg])

  const applyMakeupToPhoto = async () => {
    if (!uploadedImg) return
    setIsProcessing(true)
    try {
      if (!faceMeshRef.current) faceMeshRef.current = await loadFaceMesh()

      const img = new window.Image()
      img.src = uploadedImg
      await new Promise(res => { img.onload = res })

      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const oc = document.createElement('canvas')
      oc.width = canvas.width; oc.height = canvas.height
      const octx = oc.getContext('2d')!

      await new Promise<void>(resolve => {
        let done = false
        faceMeshRef.current.onResults((results: any) => {
          if (done) return; done = true
          const lms = results.multiFaceLandmarks?.[0]
          if (lms) {
            renderMakeup(ctx, octx, lms, canvas.width, canvas.height, activeLook.makeup)
            setProcessedImg(canvas.toDataURL('image/jpeg', 0.95))
          } else {
            toast.error('Aucun visage détecté — essayez une autre photo')
          }
          resolve()
        })
        faceMeshRef.current.send({ image: img }).catch(() => resolve())
      })
    } catch {
      toast.error('Impossible d\'appliquer le look')
    } finally {
      setIsProcessing(false)
    }
  }

  // ── File handling ─────────────────────────────────────────────────────────
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Veuillez uploader une image'); return }
    const reader = new FileReader()
    reader.onload = e => {
      setUploadedImg(e.target?.result as string)
      setProcessedImg(null)
    }
    reader.readAsDataURL(file)
  }

  // ── Cart ──────────────────────────────────────────────────────────────────
  const addToCart = async (product: any) => {
    if (!isAuthenticated) { toast.error('Connectez-vous pour ajouter au panier'); return }
    try {
      const { data } = await cartAPI.addItem(product.id, undefined, 1)
      setCart(data.cart)
      setAddedIds(prev => new Set(prev).add(product.id))
      toast.success(`${product.name} ajouté !`)
    } catch { toast.error('Erreur lors de l\'ajout') }
  }

  const addAllToCart = async () => {
    if (!isAuthenticated) { toast.error('Connectez-vous pour ajouter au panier'); return }
    if (!products.length) return
    setAddingAll(true)
    let added = 0
    for (const p of products) {
      try {
        const { data } = await cartAPI.addItem(p.id, undefined, 1)
        setCart(data.cart)
        setAddedIds(prev => new Set(prev).add(p.id))
        added++
      } catch {}
    }
    setAddingAll(false)
    if (added > 0) { setOpen(true); toast.success(`${added} produits ajoutés !`) }
  }

  const selectLook = (look: Look) => {
    setActiveLook(look)
    setProcessedImg(null)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="pt-[88px] min-h-screen" style={{ background: '#0D0B0A' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="py-20 text-center" style={{ borderBottom: '1px solid rgba(198,169,163,0.10)' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center justify-center gap-2.5 mb-5">
            <span className="h-px w-10" style={{ background: '#C6A9A3' }} />
            <Sparkles size={11} style={{ color: '#C6A9A3' }} />
            <span className="font-sans text-[10px] tracking-[0.38em] uppercase" style={{ color: '#C6A9A3' }}>
              AI Look Matching
            </span>
            <Sparkles size={11} style={{ color: '#C6A9A3' }} />
            <span className="h-px w-10" style={{ background: '#C6A9A3' }} />
          </div>
          <h1 className="font-display text-6xl md:text-7xl mb-5" style={{ color: '#F5F0EC' }}>
            Shop the{' '}
            <em className="not-italic" style={{ color: '#C6A9A3' }}>Look</em>
          </h1>
          <p className="font-serif text-xl max-w-lg mx-auto leading-relaxed" style={{ color: 'rgba(245,240,236,0.40)' }}>
            Choisissez un look éditorial, uploadez votre photo — et shopez chaque produit en un clic.
          </p>
        </motion.div>
      </section>

      {/* ── Look selector carousel ────────────────────────────────────────── */}
      <section
        className="overflow-x-auto py-8 px-4 md:px-8 scrollbar-hide"
        style={{ borderBottom: '1px solid rgba(198,169,163,0.08)' }}
      >
        <div className="flex gap-4 mx-auto" style={{ width: 'max-content', maxWidth: '100%' }}>
          {LOOKS.map((look, i) => (
            <motion.button
              key={look.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              onClick={() => selectLook(look)}
              className="relative flex-shrink-0 group"
              style={{ width: 170 }}
            >
              <div
                className="relative overflow-hidden transition-all duration-300"
                style={{
                  height: 230,
                  borderRadius: 16,
                  border: activeLook.id === look.id
                    ? '2px solid #C6A9A3'
                    : '2px solid rgba(198,169,163,0.12)',
                  boxShadow: activeLook.id === look.id
                    ? '0 0 0 4px rgba(198,169,163,0.12)'
                    : 'none',
                }}
              >
                <img
                  src={look.model}
                  alt={look.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(13,11,10,0.88) 0%, rgba(13,11,10,0.15) 55%, transparent 100%)' }}
                />

                {activeLook.id === look.id && (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: '#C6A9A3' }}
                  >
                    <Check size={11} style={{ color: '#0D0B0A' }} />
                  </motion.div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-display text-sm mb-2" style={{ color: '#F5F0EC' }}>{look.name}</p>
                  <div className="flex gap-1.5">
                    {look.palette.map((c, j) => (
                      <span
                        key={j}
                        className="w-3 h-3 rounded-full"
                        style={{ background: c, border: '1.5px solid rgba(245,240,236,0.25)' }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <p
                className="mt-2 font-sans text-[10px] tracking-wider text-center transition-colors"
                style={{ color: activeLook.id === look.id ? '#C6A9A3' : 'rgba(245,240,236,0.35)' }}
              >
                {look.vibe.split(' · ')[0]}
              </p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-14 grid grid-cols-1 lg:grid-cols-2 gap-14">

        {/* LEFT — Preview + Upload */}
        <div>
          <motion.div key={activeLook.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <p className="font-sans text-[10px] tracking-[0.32em] uppercase mb-2" style={{ color: '#C6A9A3' }}>
              {activeLook.vibe}
            </p>
            <h2 className="font-display text-4xl mb-1" style={{ color: '#F5F0EC' }}>{activeLook.name}</h2>
            <p className="font-serif text-lg mb-8" style={{ color: 'rgba(245,240,236,0.40)' }}>{activeLook.subtitle}</p>
          </motion.div>

          {/* Preview image */}
          <div
            className="relative mb-5 overflow-hidden"
            style={{ borderRadius: 20, aspectRatio: '3/4', background: '#1A1614' }}
          >
            <AnimatePresence mode="wait">
              {processedImg ? (
                <motion.img key="processed"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  src={processedImg}
                  className="w-full h-full object-cover"
                  alt="Votre photo avec le look appliqué"
                />
              ) : uploadedImg ? (
                <motion.img key="uploaded"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  src={uploadedImg}
                  className="w-full h-full object-cover"
                  alt="Photo uploadée"
                />
              ) : (
                <motion.img key={activeLook.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  src={activeLook.model}
                  className="w-full h-full object-cover"
                  alt={activeLook.name}
                />
              )}
            </AnimatePresence>

            {/* Bottom gradient on model photo */}
            {!uploadedImg && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(13,11,10,0.55) 0%, transparent 45%)' }}
              />
            )}

            {/* Processing overlay */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{ background: 'rgba(13,11,10,0.80)', backdropFilter: 'blur(8px)' }}
                >
                  <Loader2 size={36} className="animate-spin mb-4" style={{ color: '#C6A9A3' }} />
                  <p className="font-sans text-[10px] tracking-[0.3em] uppercase" style={{ color: '#C6A9A3' }}>
                    Application du look…
                  </p>
                  <p className="font-sans text-[9px] mt-1" style={{ color: 'rgba(245,240,236,0.35)' }}>
                    Détection du visage en cours
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Look label badge */}
            {!uploadedImg && (
              <div
                className="absolute bottom-4 left-4 px-3 py-1.5"
                style={{ background: 'rgba(13,11,10,0.70)', backdropFilter: 'blur(6px)', borderRadius: 8, border: '1px solid rgba(198,169,163,0.20)' }}
              >
                <p className="font-display text-sm" style={{ color: '#F5F0EC' }}>{activeLook.name}</p>
              </div>
            )}

            {/* Remove upload */}
            {uploadedImg && (
              <button
                onClick={() => { setUploadedImg(null); setProcessedImg(null) }}
                className="absolute top-4 right-4 p-2 rounded-full transition-colors"
                style={{ background: 'rgba(13,11,10,0.70)', backdropFilter: 'blur(4px)', color: 'rgba(245,240,236,0.60)' }}
              >
                <X size={14} />
              </button>
            )}

            {/* Re-apply button if uploaded */}
            {uploadedImg && !isProcessing && (
              <button
                onClick={applyMakeupToPhoto}
                className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 font-sans text-[9px] tracking-widest uppercase transition-all"
                style={{ background: '#C6A9A3', color: '#0D0B0A', borderRadius: 8 }}
              >
                <RefreshCw size={10} /> Réappliquer
              </button>
            )}
          </div>

          {/* Upload zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => {
              e.preventDefault(); setIsDragging(false)
              const f = e.dataTransfer.files[0]; if (f) handleFile(f)
            }}
            className="flex items-center justify-center gap-3 py-5 cursor-pointer transition-all"
            style={{
              borderRadius: 12,
              border: `1.5px dashed ${isDragging ? '#C6A9A3' : 'rgba(198,169,163,0.22)'}`,
              background: isDragging ? 'rgba(198,169,163,0.05)' : 'transparent',
            }}
          >
            <Upload size={14} style={{ color: isDragging ? '#C6A9A3' : 'rgba(198,169,163,0.50)' }} />
            <span className="font-sans text-xs tracking-wider" style={{ color: 'rgba(245,240,236,0.38)' }}>
              {uploadedImg ? 'Remplacer la photo' : 'Uploadez votre photo — essayez le look sur vous'}
            </span>
            <input
              ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
          </div>

          <Link
            href="/tryon"
            className="mt-3 flex items-center justify-center gap-2 font-sans text-xs tracking-wider transition-colors"
            style={{ color: 'rgba(198,169,163,0.45)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#C6A9A3')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(198,169,163,0.45)')}
          >
            <Camera size={11} />
            Utiliser la caméra en direct
          </Link>
        </div>

        {/* RIGHT — Products */}
        <div>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="font-sans text-[10px] tracking-[0.32em] uppercase mb-2" style={{ color: '#C6A9A3' }}>
                Complete the Look
              </p>
              <h2 className="font-display text-4xl" style={{ color: '#F5F0EC' }}>
                Shop This Look
              </h2>
            </div>

            {products.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={addAllToCart}
                disabled={addingAll}
                className="flex items-center gap-2 font-sans text-[10px] tracking-widest uppercase px-5 py-3 transition-all disabled:opacity-50"
                style={{ background: '#C6A9A3', color: '#0D0B0A', borderRadius: 8 }}
                onMouseEnter={e => !addingAll && ((e.currentTarget as HTMLElement).style.background = '#B09892')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#C6A9A3')}
              >
                {addingAll
                  ? <><Loader2 size={12} className="animate-spin" /> Ajout…</>
                  : <><ShoppingBag size={12} /> Tout ajouter ({products.length})</>
                }
              </motion.button>
            )}
          </div>

          {/* Product grid */}
          {loadingProds ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse"
                  style={{ borderRadius: 16, background: '#1A1614', height: 300 }}
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <ImageIcon size={36} className="mx-auto mb-4" style={{ color: 'rgba(245,240,236,0.12)' }} />
              <p className="font-serif mb-4" style={{ color: 'rgba(245,240,236,0.30)' }}>
                Aucun produit trouvé pour ce look.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 font-sans text-xs tracking-widest uppercase transition-colors"
                style={{ color: 'rgba(198,169,163,0.55)' }}
              >
                Voir tous les produits <ArrowRight size={11} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {products.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.40 }}
                  className="group relative overflow-hidden"
                  style={{ borderRadius: 16, background: '#1A1614', border: '1px solid rgba(198,169,163,0.08)' }}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
                    {p.primaryImage ? (
                      <img
                        src={p.primaryImage}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: '#221E1C' }}
                      >
                        <ImageIcon size={28} style={{ color: 'rgba(245,240,236,0.10)' }} />
                      </div>
                    )}

                    {/* Bottom gradient */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(to top, rgba(26,22,20,0.95) 0%, transparent 55%)' }}
                    />

                    {/* Add to bag — slides up */}
                    <button
                      onClick={() => addToCart(p)}
                      className="absolute bottom-0 left-0 right-0 py-3 font-sans text-[9px] tracking-widest uppercase
                                 flex items-center justify-center gap-1.5
                                 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                      style={{
                        background: addedIds.has(p.id) ? '#4A7A4A' : '#C6A9A3',
                        color: '#0D0B0A',
                      }}
                    >
                      {addedIds.has(p.id)
                        ? <><Check size={10} /> Ajouté</>
                        : <><ShoppingBag size={10} /> Ajouter</>
                      }
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    {p.brand && (
                      <p className="font-sans text-[9px] tracking-[0.15em] uppercase mb-1" style={{ color: '#C6A9A3' }}>
                        {p.brand.name || p.brand}
                      </p>
                    )}
                    <p
                      className="font-sans text-xs leading-snug line-clamp-2 mb-3"
                      style={{ color: 'rgba(245,240,236,0.80)' }}
                    >
                      {p.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-sm font-semibold" style={{ color: '#F5F0EC' }}>
                        ${p.price?.toFixed(2)}
                      </span>
                      <Link
                        href={`/products/${p.slug}`}
                        className="font-sans text-[9px] tracking-widest uppercase transition-colors"
                        style={{ color: 'rgba(198,169,163,0.45)' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#C6A9A3')}
                        onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(198,169,163,0.45)')}
                      >
                        Détails
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {products.length > 0 && (
            <div
              className="mt-8 pt-8 text-center"
              style={{ borderTop: '1px solid rgba(198,169,163,0.10)' }}
            >
              <Link
                href="/products?category=makeup"
                className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.28em] uppercase transition-colors"
                style={{ color: 'rgba(198,169,163,0.45)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#C6A9A3')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(198,169,163,0.45)')}
              >
                Explorer toute la collection <ArrowRight size={11} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
