import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import './DepthCanvasBackground.css'

type DepthCanvasRgb = [number, number, number]
type DepthCanvasGradientStop = [number, DepthCanvasRgb]
export type DepthCanvasId = 'reef_cool' | 'twilight' | 'midnight' | 'abyssal' | 'hadal'
export type DepthCanvasVariant = 'A' | 'B' | 'C'

type DepthCanvasSunRays = {
  sun: {
    cx: number
    y: number
    intensity: number
    haloRadius: number
  }
  cone: {
    halfAngle: number
  }
  rays: {
    count: number
    baseAlpha: number
    sharpness: number
    widthNear: number
    widthFar: number
    stops: Array<[number, number]>
  }
  waves: Array<{
    freq: number
    speed: number
    amp: number
    phase: number
  }>
  rotation: number
  bias: number
  saturate: number
  jitter: number
  widthJitter: number
  blur: number
  tint: DepthCanvasRgb
}

type DepthCanvasParams = {
  name: string
  range: string
  notes: string
  gradient: DepthCanvasGradientStop[]
  particles: {
    density: number
    sizeMin: number
    sizeMax: number
    speed: number
    lift: number
    drift: number
    tint: [number, number, number, number]
    fall?: boolean
  }
  biolum: null | {
    rate: number
    color: DepthCanvasRgb
    life: number
    glow: number
    sizeMin: number
    sizeMax: number
    dim?: number
  }
  haze: {
    color: DepthCanvasRgb
    topA: number
    botA: number
  }
  vignette: number
  subject: null | {
    y: number
    w: number
    h: number
    alpha: number
  }
  flow?: number
  pressure?: boolean
  sunRays?: DepthCanvasSunRays
}

type DepthCanvasParticle = {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  phase: number
  drift: number
  a: number
  fill: string
}

type DepthCanvasBiolum = {
  x: number
  y: number
  r: number
  life: number
  maxLife: number
}

type DepthCanvasState = {
  particles: DepthCanvasParticle[]
  biolum: DepthCanvasBiolum[]
  biolumCooldown: number
  pointer: {
    x: number
    y: number
    wake: number
  }
  flowPhase: number
  rayJitter: Float32Array
  rayWidths: Float32Array
  rayAlphas: Float32Array
}

type DepthCanvasTick = (dt: number, time: number) => void

const DEPTH_CANVAS_BASE: Record<DepthCanvasId, DepthCanvasParams> = {
  reef_cool: {
    name: 'Sunlight reef - Caustic Veil',
    range: '0 - 200 m',
    notes: 'Snell-window halo and soft caustic beams over sparse fine particles.',
    gradient: [
      [0.00, [62, 150, 215]],
      [0.22, [24, 112, 205]],
      [0.48, [10, 76, 176]],
      [1.00, [8, 58, 150]],
    ],
    particles: {
      density: 0.00022, sizeMin: 0.4, sizeMax: 1.2,
      speed: 0.08, lift: 0.06, drift: 0.40,
      tint: [235, 248, 255, 0.50],
    },
    biolum: null,
    haze: { color: [20, 100, 180], topA: 0.04, botA: 0.06 },
    vignette: 0.08,
    subject: null,
    sunRays: {
      sun: { cx: 0.46, y: -0.01, intensity: 0.54, haloRadius: 0.78 },
      cone: { halfAngle: Math.PI / 3.55 },
      rays: {
        count: 42,
        baseAlpha: 0.078,
        sharpness: 1.25,
        widthNear: 10,
        widthFar: 68,
        stops: [[0, 0.64], [0.16, 0.38], [0.34, 0.16], [0.58, 0.04], [0.76, 0]],
      },
      waves: [
        { freq: 1.7, speed: 0.035, amp: 0.42, phase: 0.0 },
        { freq: 4.4, speed: -0.08, amp: 0.34, phase: 0.5 },
        { freq: 9.0, speed: 0.13, amp: 0.24, phase: 2.2 },
        { freq: 17.0, speed: -0.22, amp: 0.12, phase: 4.0 },
      ],
      rotation: 0.008,
      bias: -0.07,
      saturate: 0.76,
      jitter: 1.65,
      widthJitter: 1.25,
      blur: 8,
      tint: [240, 250, 255],
    },
  },
  twilight: {
    name: 'Twilight descent',
    range: '200 - 1,000 m',
    notes: 'Deep blue column, sparse particles, first blue bioluminescent points.',
    gradient: [
      [0.00, [28, 84, 122]],
      [0.42, [10, 58, 108]],
      [1.00, [3, 24, 64]],
    ],
    particles: {
      density: 0.00060, sizeMin: 0.5, sizeMax: 1.8,
      speed: 0.13, lift: 0.03, drift: 0.30,
      tint: [220, 235, 245, 0.45],
    },
    biolum: { rate: 0.05, color: [80, 200, 230], life: 1.7, glow: 9, sizeMin: 1.0, sizeMax: 2.4 },
    haze: { color: [8, 44, 88], topA: 0.02, botA: 0.18 },
    vignette: 0.24,
    subject: null,
  },
  midnight: {
    name: 'Midnight water',
    range: '1,000 - 4,000 m',
    notes: 'Aphotic open water. Calm transparency, sparse blue-green light.',
    gradient: [
      [0.00, [9, 20, 40]],
      [0.50, [4, 12, 26]],
      [1.00, [2, 8, 18]],
    ],
    particles: {
      density: 0.00020, sizeMin: 0.4, sizeMax: 1.3,
      speed: 0.07, lift: 0.00, drift: 0.5,
      tint: [180, 210, 230, 0.22],
    },
    biolum: { rate: 0.16, color: [110, 220, 200], life: 2.4, glow: 14, sizeMin: 1.2, sizeMax: 2.6 },
    haze: { color: [8, 16, 28], topA: 0.40, botA: 0.55 },
    vignette: 0.50,
    subject: { y: 0.50, w: 0.28, h: 0.14, alpha: 0.05 },
  },
  abyssal: {
    name: 'Abyssal snow',
    range: '4,000 - 6,000 m',
    notes: 'Low-energy darkness, falling marine snow, sediment warmth.',
    gradient: [
      [0.00, [4, 8, 16]],
      [0.60, [10, 12, 20]],
      [1.00, [32, 24, 18]],
    ],
    particles: {
      density: 0.00085, sizeMin: 0.6, sizeMax: 2.4,
      speed: 0.05, lift: 0.00, drift: 0.15,
      tint: [240, 232, 215, 0.55],
      fall: true,
    },
    biolum: { rate: 0.05, color: [120, 200, 180], life: 2.2, glow: 10, sizeMin: 1.0, sizeMax: 2.2 },
    haze: { color: [22, 18, 14], topA: 0.32, botA: 0.50 },
    vignette: 0.46,
    subject: { y: 0.52, w: 0.28, h: 0.15, alpha: 0.06 },
  },
  hadal: {
    name: 'Hadal stillness',
    range: '6,000 m +',
    notes: 'Sealed water. Almost no motion or spectacle. Pressure absorbs.',
    gradient: [
      [0.00, [2, 6, 14]],
      [0.50, [1, 4, 10]],
      [1.00, [3, 3, 8]],
    ],
    particles: {
      density: 0.00010, sizeMin: 0.3, sizeMax: 0.9,
      speed: 0.02, lift: 0.00, drift: 0.05,
      tint: [200, 215, 220, 0.18],
    },
    biolum: { rate: 0.012, color: [100, 180, 200], life: 3.2, glow: 6, sizeMin: 0.8, sizeMax: 1.6, dim: 0.55 },
    haze: { color: [4, 8, 14], topA: 0.55, botA: 0.68 },
    vignette: 0.72,
    subject: { y: 0.50, w: 0.26, h: 0.13, alpha: 0.03 },
    pressure: true,
  },
}

const subscribers = new Set<DepthCanvasTick>()
let schedRunning = false
let lastTickT = 0

function schedTick(now: number) {
  if (now - lastTickT >= 33) {
    const dt = lastTickT === 0 ? 0.033 : Math.min(0.05, (now - lastTickT) / 1000)
    lastTickT = now
    subscribers.forEach((fn) => {
      try {
        fn(dt, now / 1000)
      } catch {
        // One failed canvas should not stop the shared animation loop.
      }
    })
  }
  if (subscribers.size > 0) requestAnimationFrame(schedTick)
  else schedRunning = false
}

function subscribe(fn: DepthCanvasTick) {
  subscribers.add(fn)
  if (!schedRunning) {
    schedRunning = true
    lastTickT = 0
    requestAnimationFrame(schedTick)
  }
}

function unsubscribe(fn: DepthCanvasTick) {
  subscribers.delete(fn)
}

function applyVariant(p: DepthCanvasParams, variant: DepthCanvasVariant): DepthCanvasParams {
  const out = JSON.parse(JSON.stringify(p)) as DepthCanvasParams
  if (variant === 'A') return out
  if (variant === 'B') {
    out.particles.density *= 1.75
    out.particles.drift *= 1.4
    if (out.biolum) {
      out.biolum.rate *= 1.45
      out.biolum.glow *= 1.1
    }
    out.haze.topA *= 0.92
    out.haze.botA *= 0.92
    out.flow = 1
    return out
  }
  if (variant === 'C') {
    out.gradient = out.gradient.map(([t, rgb], index) => {
      if (index === out.gradient.length - 1) return [t, rgb]
      const factor = index === 0 ? 0.78 : 0.62
      return [t, rgb.map((value) => Math.round(value * factor)) as DepthCanvasRgb]
    })
    out.vignette = Math.min(0.85, out.vignette * 1.55 + 0.05)
    out.particles.density *= 0.72
    if (out.biolum) {
      out.biolum.glow *= 1.25
      out.biolum.rate *= 0.9
    }
    out.haze.topA *= 1.15
    out.haze.botA *= 1.05
    return out
  }
  return out
}

function rgba(r: number, g: number, b: number, a: number) { return `rgba(${r | 0},${g | 0},${b | 0},${a})` }
function rgbStr(arr: DepthCanvasRgb, a?: number) { return rgba(arr[0], arr[1], arr[2], a == null ? 1 : a) }

function paintGradient(ctx: CanvasRenderingContext2D, p: DepthCanvasParams, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  p.gradient.forEach(([t, rgb]) => g.addColorStop(t, rgbStr(rgb, 1)))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function paintHaze(ctx: CanvasRenderingContext2D, p: DepthCanvasParams, w: number, h: number) {
  if (!p.haze) return
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, rgbStr(p.haze.color, p.haze.topA))
  g.addColorStop(1, rgbStr(p.haze.color, p.haze.botA))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function rayIntensity(sunRays: DepthCanvasSunRays, theta: number, time: number) {
  const angularTime = theta + sunRays.rotation * time
  let value = 0
  for (let i = 0; i < sunRays.waves.length; i++) {
    const wave = sunRays.waves[i]
    value += wave.amp * Math.sin(wave.freq * angularTime + wave.speed * time + wave.phase)
  }
  const raw = Math.pow(Math.max(0, value + sunRays.bias), sunRays.rays.sharpness)
  return 1 - Math.exp(-raw * sunRays.saturate)
}

function paintSunRays(ctx: CanvasRenderingContext2D, state: DepthCanvasState, p: DepthCanvasParams, w: number, h: number, time: number) {
  const sunRays = p.sunRays
  if (!sunRays) return

  const sunX = w * sunRays.sun.cx
  const sunY = h * sunRays.sun.y
  const tint = sunRays.tint.join(',')

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'

  const haloR = h * sunRays.sun.haloRadius
  const halo = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, haloR)
  halo.addColorStop(0, `rgba(${tint},${sunRays.sun.intensity * 0.70})`)
  halo.addColorStop(0.35, `rgba(${tint},${sunRays.sun.intensity * 0.28})`)
  halo.addColorStop(0.75, `rgba(${tint},${sunRays.sun.intensity * 0.06})`)
  halo.addColorStop(1, `rgba(${tint},0)`)
  ctx.fillStyle = halo
  ctx.fillRect(0, 0, w, h)

  ctx.filter = `blur(${sunRays.blur}px)`
  const half = sunRays.cone.halfAngle
  const beamLen = Math.hypot(w, h) * 1.4
  for (let i = 0; i < sunRays.rays.count; i++) {
    const theta = -half + (i + 0.5 + state.rayJitter[i]) / sunRays.rays.count * (2 * half)
    const intensity = rayIntensity(sunRays, theta, time)
    if (intensity < 0.02) continue

    const alpha = intensity * sunRays.rays.baseAlpha * state.rayAlphas[i]
    const widthScale = state.rayWidths[i]
    ctx.save()
    ctx.translate(sunX, sunY)
    ctx.rotate(theta)
    const beamGradient = ctx.createLinearGradient(0, 0, 0, beamLen)
    for (let k = 0; k < sunRays.rays.stops.length; k++) {
      const stop = sunRays.rays.stops[k]
      beamGradient.addColorStop(stop[0], `rgba(${tint},${alpha * stop[1]})`)
    }
    ctx.fillStyle = beamGradient
    ctx.beginPath()
    ctx.moveTo(-sunRays.rays.widthNear * widthScale / 2, 0)
    ctx.lineTo(sunRays.rays.widthNear * widthScale / 2, 0)
    ctx.lineTo(sunRays.rays.widthFar * widthScale / 2, beamLen)
    ctx.lineTo(-sunRays.rays.widthFar * widthScale / 2, beamLen)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
  ctx.filter = 'none'
  ctx.restore()
}

function paintParticles(ctx: CanvasRenderingContext2D, state: DepthCanvasState, p: DepthCanvasParams) {
  const ps = p.particles
  if (!ps) return
  const arr = state.particles
  for (let i = 0; i < arr.length; i++) {
    const pt = arr[i]
    ctx.globalAlpha = pt.a
    ctx.fillStyle = pt.fill
    ctx.beginPath()
    ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function paintBiolum(ctx: CanvasRenderingContext2D, state: DepthCanvasState, p: DepthCanvasParams) {
  if (!p.biolum) return
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < state.biolum.length; i++) {
    const b = state.biolum[i]
    const fade = b.life / b.maxLife
    const env = Math.sin(fade * Math.PI)
    const a = env * (p.biolum.dim || 1)
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * p.biolum.glow)
    g.addColorStop(0, rgba(p.biolum.color[0], p.biolum.color[1], p.biolum.color[2], 0.85 * a))
    g.addColorStop(0.3, rgba(p.biolum.color[0], p.biolum.color[1], p.biolum.color[2], 0.30 * a))
    g.addColorStop(1, rgba(p.biolum.color[0], p.biolum.color[1], p.biolum.color[2], 0))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r * p.biolum.glow, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = rgba(230, 255, 245, 0.9 * a)
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r * 0.5, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function paintPointerWake(ctx: CanvasRenderingContext2D, state: DepthCanvasState) {
  const pw = state.pointer
  if (!pw || pw.wake <= 0.001) return
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const r = 60 + (1 - pw.wake) * 80
  const g = ctx.createRadialGradient(pw.x, pw.y, 0, pw.x, pw.y, r)
  g.addColorStop(0, `rgba(200,230,240,${0.12 * pw.wake})`)
  g.addColorStop(0.5, `rgba(160,210,220,${0.05 * pw.wake})`)
  g.addColorStop(1, 'rgba(160,210,220,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(pw.x, pw.y, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function paintSubjectZone(ctx: CanvasRenderingContext2D, p: DepthCanvasParams, w: number, h: number) {
  if (!p.subject) return
  const s = p.subject
  const cx = w / 2
  const cy = h * s.y
  const rx = w * s.w * 0.5
  const ry = h * s.h * 0.5
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx)
  g.addColorStop(0, `rgba(0,0,0,${s.alpha})`)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
}

function paintVignette(ctx: CanvasRenderingContext2D, p: DepthCanvasParams, w: number, h: number) {
  if (!p.vignette) return
  const g = ctx.createRadialGradient(w / 2, h * 0.55, Math.min(w, h) * 0.2, w / 2, h * 0.55, Math.max(w, h) * 0.75)
  g.addColorStop(0, 'rgba(0,0,0,0)')
  g.addColorStop(1, `rgba(0,0,0,${p.vignette})`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function paintPressure(ctx: CanvasRenderingContext2D, p: DepthCanvasParams, w: number, h: number, time: number) {
  if (!p.pressure) return
  const pulse = 0.5 + 0.5 * Math.sin(time * 0.18)
  const g = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * (0.05 + pulse * 0.05),
    w / 2,
    h / 2,
    Math.max(w, h) * 0.6,
  )
  g.addColorStop(0, 'rgba(0,0,0,0)')
  g.addColorStop(1, `rgba(0,0,0,${0.18 + 0.06 * pulse})`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function makeParticle(p: DepthCanvasParams, w: number, h: number, fresh: boolean): DepthCanvasParticle {
  const ps = p.particles
  const r = ps.sizeMin + Math.random() * (ps.sizeMax - ps.sizeMin)
  const x = Math.random() * w
  const y = ps.fall && fresh ? -Math.random() * h * 0.5 : Math.random() * h
  const tint = ps.tint
  const ar = 0.4 + Math.random() * 0.6
  return {
    x, y, r,
    vx: (Math.random() - 0.5) * ps.drift * 0.6,
    vy: ps.fall ? (ps.speed * (0.5 + Math.random() * 1.0)) : -ps.lift * (0.4 + Math.random() * 1.0),
    phase: Math.random() * Math.PI * 2,
    drift: ps.drift,
    a: tint[3] * ar,
    fill: rgba(tint[0], tint[1], tint[2], 1),
  }
}

function makeRayField(p: DepthCanvasParams): Pick<DepthCanvasState, 'rayJitter' | 'rayWidths' | 'rayAlphas'> {
  const count = p.sunRays?.rays.count ?? 0
  const rayJitter = new Float32Array(count)
  const rayWidths = new Float32Array(count)
  const rayAlphas = new Float32Array(count)
  if (!p.sunRays) return { rayJitter, rayWidths, rayAlphas }

  let seed = ((count * 73856093) ^ Math.round(p.sunRays.sun.cx * 1e6)) >>> 0
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 0xffffffff
  }
  for (let i = 0; i < count; i++) {
    rayJitter[i] = (random() - 0.5) * p.sunRays.jitter
    rayWidths[i] = 1 - p.sunRays.widthJitter * 0.5 + random() * p.sunRays.widthJitter
    rayAlphas[i] = random() < 0.22 ? 0.18 + random() * 0.22 : 0.48 + random() * 0.58
  }
  return { rayJitter, rayWidths, rayAlphas }
}

function initState(p: DepthCanvasParams, w: number, h: number): DepthCanvasState {
  const count = Math.max(8, Math.round(p.particles.density * w * h))
  const particles = new Array(count).fill(0).map(() => makeParticle(p, w, h, false))
  const rays = makeRayField(p)
  return {
    particles,
    biolum: [],
    biolumCooldown: 1 / Math.max(0.001, (p.biolum?.rate || 0.001)),
    pointer: { x: w / 2, y: h / 2, wake: 0 },
    flowPhase: Math.random() * Math.PI * 2,
    ...rays,
  }
}

function stepState(state: DepthCanvasState, p: DepthCanvasParams, w: number, h: number, dt: number) {
  state.pointer.wake = Math.max(0, state.pointer.wake - dt * 1.2)

  const flow = p.flow ? Math.sin((state.flowPhase += dt * 0.4)) * 4 : 0

  const arr = state.particles
  for (let i = 0; i < arr.length; i++) {
    const pt = arr[i]
    pt.phase += dt * 0.7
    const wob = Math.sin(pt.phase) * pt.drift
    pt.x += (pt.vx + flow * 0.04 + wob * 0.4) * dt * 60
    pt.y += pt.vy * dt * 60

    const pw = state.pointer
    if (pw.wake > 0.01) {
      const dx = pt.x - pw.x
      const dy = pt.y - pw.y
      const d2 = dx * dx + dy * dy
      const R = 70
      if (d2 < R * R && d2 > 1) {
        const d = Math.sqrt(d2)
        const f = (1 - d / R) * pw.wake * 12
        pt.x += (dx / d) * f * dt
        pt.y += (dy / d) * f * dt
      }
    }

    if (pt.x < -4) pt.x = w + 4
    else if (pt.x > w + 4) pt.x = -4
    if (p.particles.fall) {
      if (pt.y > h + 4) { pt.y = -4; pt.x = Math.random() * w }
    } else {
      if (pt.y < -4) pt.y = h + 4
      else if (pt.y > h + 4) pt.y = -4
    }
  }

  if (p.biolum) {
    state.biolumCooldown -= dt
    while (state.biolumCooldown <= 0) {
      const ttl = p.biolum.life * (0.6 + Math.random() * 0.8)
      state.biolum.push({
        x: Math.random() * w,
        y: h * (0.1 + Math.random() * 0.8),
        r: p.biolum.sizeMin + Math.random() * (p.biolum.sizeMax - p.biolum.sizeMin),
        life: ttl, maxLife: ttl,
      })
      state.biolumCooldown += (1 / p.biolum.rate) * (0.6 + Math.random() * 0.8)
    }
    for (let i = state.biolum.length - 1; i >= 0; i--) {
      state.biolum[i].life -= dt
      if (state.biolum[i].life <= 0) state.biolum.splice(i, 1)
    }
  }
}

function DepthCanvasScene({
  depth,
  variant,
  width = 720,
  height = 460,
  showSubjectZone = true,
  className,
  style,
}: {
  depth: DepthCanvasId
  variant: DepthCanvasVariant
  width?: number
  height?: number
  showSubjectZone?: boolean
  className?: string
  style?: CSSProperties
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<DepthCanvasState | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const renderW = Math.round(width * 0.7)
    const renderH = Math.round(height * 0.7)
    canvas.width = renderW * dpr
    canvas.height = renderH * dpr
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return
    ctx.scale(dpr, dpr)

    const params = applyVariant(DEPTH_CANVAS_BASE[depth], variant)
    stateRef.current = initState(params, renderW, renderH)
    if (!showSubjectZone) params.subject = null

    let visible = true
    const tick = (dt: number, t: number) => {
      if (!visible || !stateRef.current) return
      stepState(stateRef.current, params, renderW, renderH, dt)
      paintGradient(ctx, params, renderW, renderH)
      paintHaze(ctx, params, renderW, renderH)
      paintSunRays(ctx, stateRef.current, params, renderW, renderH, t)
      paintSubjectZone(ctx, params, renderW, renderH)
      paintParticles(ctx, stateRef.current, params)
      paintBiolum(ctx, stateRef.current, params)
      paintPointerWake(ctx, stateRef.current)
      paintPressure(ctx, params, renderW, renderH, t)
      paintVignette(ctx, params, renderW, renderH)
    }
    subscribe(tick)

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { visible = entry.isIntersecting })
    }, { rootMargin: '200px' })
    io.observe(canvas)

    const onMove = (event: PointerEvent) => {
      if (!stateRef.current) return
      const r = canvas.getBoundingClientRect()
      const sx = renderW / r.width
      const sy = renderH / r.height
      const px = (event.clientX - r.left) * sx
      const py = (event.clientY - r.top) * sy
      stateRef.current.pointer.x = px
      stateRef.current.pointer.y = py
      stateRef.current.pointer.wake = 1
    }
    canvas.addEventListener('pointermove', onMove)

    return () => {
      unsubscribe(tick)
      io.disconnect()
      canvas.removeEventListener('pointermove', onMove)
    }
  }, [variant, depth, width, height, showSubjectZone])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: 'block',
        width: width + 'px',
        height: height + 'px',
        background: '#000',
        ...style,
      }}
    />
  )
}

export function DepthCanvasUnderlay({
  depth,
  variant,
  zoom = 1,
}: {
  depth: DepthCanvasId
  variant: DepthCanvasVariant
  zoom?: number
}) {
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === 'undefined' ? 1440 : window.innerWidth,
    height: typeof window === 'undefined' ? 900 : window.innerHeight,
  }))

  useEffect(() => {
    function handleResize() {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="depth-canvas-underlay-frame" aria-hidden="true">
      <DepthCanvasScene
        depth={depth}
        variant={variant}
        width={viewport.width}
        height={viewport.height}
        className="depth-canvas-underlay"
        style={{ transform: `scale(${zoom})` }}
      />
    </div>
  )
}
