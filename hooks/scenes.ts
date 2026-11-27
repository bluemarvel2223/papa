import { AURORA_BODY } from './aurora'
import { hudMarkup, hudSpace } from './meter'
import type { HudItem } from './meter'

// Each look's ground, drawn in a 1600 by 1000 box that fills the window (slice).
const flat = (light: string, dark: string) =>
  `<style>.gr{fill:${light}}@media (prefers-color-scheme: dark){.gr{fill:${dark}}}</style>` +
  `<rect class="gr" width="1600" height="1000"/>`

// A calm, modern ground: flat in light and dark, with two faint washes of the
// indicators' blues in opposite corners, for depth. Nothing moves.
const FROST =
  `<defs>` +
  `<radialGradient id="w1" cx="0.92" cy="0" r="0.8"><stop offset="0" stop-color="#3b82f6" stop-opacity="0.24"/><stop offset="1" stop-color="#3b82f6" stop-opacity="0"/></radialGradient>` +
  `<radialGradient id="w2" cx="0" cy="1" r="0.75"><stop offset="0" stop-color="#38bdf8" stop-opacity="0.2"/><stop offset="1" stop-color="#38bdf8" stop-opacity="0"/></radialGradient>` +
  `</defs>` +
  `<style>.fg{fill:#edf2f9}.f1{opacity:0.6}.f2{opacity:0.45}` +
  `@media (prefers-color-scheme: dark){.fg{fill:#0a111e}.f1{opacity:1}.f2{opacity:0.7}}</style>` +
  `<rect class="fg" width="1600" height="1000"/>` +
  `<rect class="f2" width="1600" height="1000" fill="url(#w2)"/>` +
  `<rect class="f1" width="1600" height="1000" fill="url(#w1)"/>`

// A medium-blue ground in the indicators' own blue: a soft sky-blue gradient by
// day, deep navy by night, with a bright wash in the top right (where the
// indicators sit) and a faint white one in the bottom left. Nothing moves.
const AZURE =
  `<defs>` +
  `<linearGradient id="zg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="z0"/><stop offset="1" class="z1"/></linearGradient>` +
  `<radialGradient id="zw1" cx="0.92" cy="0" r="0.75"><stop offset="0" stop-color="#3b82f6" stop-opacity="0.5"/><stop offset="1" stop-color="#3b82f6" stop-opacity="0"/></radialGradient>` +
  `<radialGradient id="zw2" cx="0" cy="1" r="0.8"><stop offset="0" stop-color="#ffffff" stop-opacity="0.45"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>` +
  `</defs>` +
  `<style>.z0{stop-color:#b5d1fa}.z1{stop-color:#e4eefd}.za{opacity:0.6}.zb{opacity:0.8}` +
  `@media (prefers-color-scheme: dark){.z0{stop-color:#0f2250}.z1{stop-color:#070f22}.za{opacity:0.55}.zb{opacity:0.1}}</style>` +
  `<rect width="1600" height="1000" fill="url(#zg)"/>` +
  `<rect class="zb" width="1600" height="1000" fill="url(#zw2)"/>` +
  `<rect class="za" width="1600" height="1000" fill="url(#zw1)"/>`

const GROUNDS: Record<string, string> = {
  aurora: AURORA_BODY,
  frost: FROST,
  azure: AZURE,
  paper: flat('#efe6d3', '#1f1a15'),
  sage: flat('#e6ebe2', '#161c17'),
  midnight:
    `<defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1420"/><stop offset="1" stop-color="#1a2436"/></linearGradient></defs>` +
    `<rect width="1600" height="1000" fill="url(#mg)"/>`,
  cork: `<rect width="1600" height="1000" fill="#b98a5a"/>`,
}

export const sceneIds = Object.keys(GROUNDS)

/**
 * A whole backdrop: the look's ground, filling the window, and the HUD pinned to
 * its top right corner. The root has no viewBox of its own, so each nested svg
 * is the size of the window and places its own drawing (the ground fills it;
 * the HUD sits in its corner, whole, at any window shape).
 */
export function sceneSvg(id: string, items: HudItem[], isPhone: boolean): string {
  const { w, h } = hudSpace(isPhone)
  const hud = hudMarkup(items, isPhone)

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">` +
    `<svg width="100%" height="100%" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">${GROUNDS[id] ?? ''}</svg>` +
    (hud === ''
      ? ''
      : `<svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMaxYMin meet">${hud}</svg>`) +
    `</svg>`
  )
}
