// Drawing for the usage-limit meter, all in blues: glowing gradient rings with
// a pulsing head and a slow orbiting spark. Urgency shows as a deeper blue and
// a faster pulse, never a change of hue. Pure functions, no `$`.

export type Tone = { stops: readonly [string, string, string]; ink: string; track: string; pulse: number }

// Plenty left: ice to sky to royal. Half: light to mid to deep. Low: deep, quick pulse.
const HIGH: Tone = { stops: ['#bae6fd', '#38bdf8', '#2563eb'], ink: '#7dd3fc', track: '#38bdf8', pulse: 4.2 }
const MID: Tone = { stops: ['#93c5fd', '#3b82f6', '#1d4ed8'], ink: '#93c5fd', track: '#3b82f6', pulse: 3 }
const LOW: Tone = { stops: ['#60a5fa', '#2563eb', '#1e40af'], ink: '#60a5fa', track: '#2563eb', pulse: 1.3 }

export const toneOf = (left: number): Tone => (left < 20 ? LOW : left < 50 ? MID : HIGH)

const FONT = 'system-ui, -apple-system, Segoe UI, sans-serif'
const clamp = (left: number) => Math.max(0, Math.min(100, left))
const n = (x: number) => Number(x.toFixed(2))

type Ring = { cx: number; cy: number; r: number; w: number; left: number; uid: string }

/** One ring: its defs, its drawing and its animation rules. `uid` keeps ids and classes apart in one document. */
function ring({ cx, cy, r, w, left, uid }: Ring) {
  const tone = toneOf(left)
  const [a, b, c] = tone.stops
  const len = 2 * Math.PI * r
  const arc = (len * clamp(left)) / 100
  const dash = `${n(arc)} ${n(len)}`
  const angle = -Math.PI / 2 + (2 * Math.PI * clamp(left)) / 100
  const hx = n(cx + r * Math.cos(angle))
  const hy = n(cy + r * Math.sin(angle))
  const hasArc = left > 0

  const defs =
    `<linearGradient id="${uid}g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${a}"/><stop offset="0.5" stop-color="${b}"/><stop offset="1" stop-color="${c}"/>` +
    `</linearGradient>` +
    `<filter id="${uid}f" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${n(r * 0.12)}"/></filter>`

  const css =
    `.${uid}p{animation:${uid}pu ${tone.pulse}s ease-in-out infinite alternate}` +
    `.${uid}o{animation:${uid}sp 7s linear infinite;transform-origin:${n(cx)}px ${n(cy)}px}` +
    `@keyframes ${uid}pu{from{opacity:.5}to{opacity:1}}` +
    `@keyframes ${uid}sp{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`

  const body =
    `<circle cx="${n(cx)}" cy="${n(cy)}" r="${r}" fill="none" stroke="${tone.track}" stroke-opacity="0.18" stroke-width="${w}"/>` +
    (hasArc
      ? `<g transform="rotate(-90 ${n(cx)} ${n(cy)})">` +
        `<circle class="${uid}p" cx="${n(cx)}" cy="${n(cy)}" r="${r}" fill="none" stroke="url(#${uid}g)" stroke-width="${n(w * 1.5)}" stroke-linecap="round" stroke-dasharray="${dash}" filter="url(#${uid}f)"/>` +
        `<circle cx="${n(cx)}" cy="${n(cy)}" r="${r}" fill="none" stroke="url(#${uid}g)" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${dash}"/>` +
        `</g>` +
        `<circle class="${uid}p" cx="${hx}" cy="${hy}" r="${n(w * 1.15)}" fill="${a}" filter="url(#${uid}f)"/>` +
        `<circle cx="${hx}" cy="${hy}" r="${n(w * 0.42)}" fill="#ffffff"/>` +
        `<circle class="${uid}o" cx="${n(cx)}" cy="${n(cy)}" r="${r}" fill="none" stroke="#e0f2fe" stroke-opacity="0.55" stroke-width="${n(w * 0.3)}" stroke-linecap="round" stroke-dasharray="${n(len * 0.045)} ${n(len)}"/>`
      : '')

  return { defs, css, body, tone }
}

const percentText = (cx: number, cy: number, r: number, left: number) =>
  `<text x="${n(cx)}" y="${n(cy + r * 0.3)}" text-anchor="middle" font-family="${FONT}" font-weight="800" fill="#e0f2fe">` +
  `<tspan font-size="${n(r * 0.74)}">${left}</tspan><tspan font-size="${n(r * 0.42)}" dx="0.5">%</tspan></text>`

/** A stand-alone ring gauge (the apps' band), % left in its middle. */
export function ringSvg(left: number): string {
  const l = clamp(left)
  const { defs, css, body } = ring({ cx: 28, cy: 28, r: 21, w: 6, left: l, uid: 'q' })

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" width="56" height="56">` +
    `<defs>${defs}</defs><style>${css}</style>${body}${percentText(28, 28, 21, left)}</svg>`
  )
}

export type HudItem = { name: string; left: number; reset: string }

/** The reset time, coarse so the picture only changes when the figure does: 3d 4h, 2h, 41m. */
export function coarse(resetsAt: string | undefined, now: number): string {
  if (resetsAt === undefined) {
    return ''
  }
  const ms = Date.parse(resetsAt) - now

  if (!Number.isFinite(ms)) {
    return ''
  }
  if (ms <= 0) {
    return 'resetting'
  }
  const mins = Math.ceil(ms / 60_000)

  if (mins >= 1440) {
    return `${Math.floor(mins / 1440)}d ${Math.floor((mins % 1440) / 60)}h`
  }
  if (mins >= 60) {
    return `${Math.floor(mins / 60)}h`
  }

  return `${mins}m`
}

/** The size of the HUD's drawing space: wide for a window, tall for a phone. */
export const hudSpace = (isPhone: boolean) => (isPhone ? { w: 400, h: 860 } : { w: 1600, h: 1000 })

/**
 * The indicators as one stack of glass pills, to sit in the top right corner of a
 * `hudSpace` viewBox (the caller pins that viewBox with `xMaxYMin meet`).
 */
export function hudMarkup(items: HudItem[], isPhone: boolean): string {
  const { w: W } = hudSpace(isPhone)
  const u = isPhone ? 0.69 : 1.04
  const pillW = 262 * u
  const pillH = 86 * u
  const gap = 14 * u
  const margin = 26 * u
  const top = 22 * u
  const r = 24 * u
  const ringW = 7 * u
  let defs = ''
  let css = ''
  let body = ''

  items.forEach((item, i) => {
    const uid = `h${i}`
    const x = n(W - margin - pillW)
    const y = n(top + i * (pillH + gap))
    const cx = x + pillW - 16 * u - r - ringW
    const cy = y + pillH / 2
    const parts = ring({ cx, cy, r, w: ringW, left: item.left, uid })
    const [a, b, c] = parts.tone.stops
    defs +=
      parts.defs +
      `<linearGradient id="${uid}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="0.55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>` +
      `<linearGradient id="${uid}s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0a1630"/><stop offset="1" stop-color="#10234a"/></linearGradient>`
    css += parts.css
    body +=
      `<rect class="${uid}p" x="${x}" y="${y}" width="${n(pillW)}" height="${n(pillH)}" rx="${n(18 * u)}" fill="${parts.tone.track}" fill-opacity="0.28" filter="url(#${uid}f)"/>` +
      `<rect x="${x}" y="${y}" width="${n(pillW)}" height="${n(pillH)}" rx="${n(18 * u)}" fill="url(#${uid}s)" fill-opacity="0.86" stroke="url(#${uid}b)" stroke-width="${n(1.6 * u)}"/>` +
      parts.body +
      percentText(cx, cy, r, item.left) +
      `<text x="${n(x + 20 * u)}" y="${n(y + pillH * 0.43)}" font-family="${FONT}" font-weight="700" font-size="${n(18 * u)}" fill="#e0f2fe">${item.name}</text>` +
      `<text x="${n(x + 20 * u)}" y="${n(y + pillH * 0.72)}" font-family="${FONT}" font-weight="500" font-size="${n(14 * u)}" fill="${parts.tone.ink}">${item.left}% left${item.reset === '' ? '' : ` · ${item.reset}`}</text>`
  })

  return items.length === 0 ? '' : `<defs>${defs}</defs><style>${css}</style>${body}`
}

function mix(from: string, to: string, t: number): string {
  const p = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
  const ch = (i: number) => Math.round(p(from, i) + (p(to, i) - p(from, i)) * t).toString(16).padStart(2, '0')

  return `#${ch(0)}${ch(1)}${ch(2)}`
}

/** The color at `t` (0 to 1) along a tone's three stops. */
export function along(tone: Tone, t: number): string {
  const [a, b, c] = tone.stops

  return t < 0.5 ? mix(a, b, t * 2) : mix(b, c, (t - 0.5) * 2)
}

/** A terminal bar: each filled cell takes its own blue along the gradient. */
export function barCells(left: number, width = 18): { text: string; color: string; isFilled: boolean }[] {
  const tone = toneOf(left)
  const filled = Math.round((clamp(left) / 100) * width)

  return Array.from({ length: width }, (_, i) => ({
    text: '━',
    color: i < filled ? along(tone, width === 1 ? 0 : i / (width - 1)) : '#334155',
    isFilled: i < filled,
  }))
}
