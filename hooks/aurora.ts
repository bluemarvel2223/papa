// The Aurora look's backdrop: a night sky with drifting ribbons of light.
// Pure vector, animated with slow CSS only; at rest (reduced motion) every
// ribbon sits in its plain-markup place, so the still scene looks finished.

function stars(): string {
  // A small fixed pseudo-random walk, so the sky is the same every load.
  let seed = 7
  const next = () => {
    seed = (seed * 16807) % 2147483647

    return seed / 2147483647
  }
  const out: string[] = []

  for (let i = 0; i < 110; i += 1) {
    const x = (next() * 1600).toFixed(0)
    const y = (next() * 640).toFixed(0)
    const r = (0.6 + next() * 1.5).toFixed(1)
    const o = (0.35 + next() * 0.6).toFixed(2)
    const cls = i % 3 === 0 ? ' class="tw"' : i % 3 === 1 ? ' class="tw2"' : ''
    out.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" opacity="${o}"${cls}/>`)
  }

  return out.join('')
}

// The sky's markup, drawn in a 1600 by 1000 box (see scenes.ts, which nests it).
export const AURORA_BODY =
  `<defs>` +
  `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">` +
  `<stop offset="0" stop-color="#03050f"/><stop offset="0.5" stop-color="#0a0f2c"/><stop offset="1" stop-color="#1b0e3d"/>` +
  `</linearGradient>` +
  `<radialGradient id="haze" cx="0.5" cy="0.3" r="0.7">` +
  `<stop offset="0" stop-color="#7c5cff" stop-opacity="0.28"/><stop offset="1" stop-color="#7c5cff" stop-opacity="0"/>` +
  `</radialGradient>` +
  `<linearGradient id="green" x1="0" y1="0" x2="0" y2="1">` +
  `<stop offset="0" stop-color="#2ee6a6" stop-opacity="0"/>` +
  `<stop offset="0.45" stop-color="#2ee6a6" stop-opacity="0.6"/>` +
  `<stop offset="0.75" stop-color="#22d3ee" stop-opacity="0.3"/>` +
  `<stop offset="1" stop-color="#22d3ee" stop-opacity="0"/>` +
  `</linearGradient>` +
  `<linearGradient id="violet" x1="0" y1="0" x2="0" y2="1">` +
  `<stop offset="0" stop-color="#a855f7" stop-opacity="0"/>` +
  `<stop offset="0.5" stop-color="#a855f7" stop-opacity="0.5"/>` +
  `<stop offset="0.8" stop-color="#ec4899" stop-opacity="0.28"/>` +
  `<stop offset="1" stop-color="#ec4899" stop-opacity="0"/>` +
  `</linearGradient>` +
  `<linearGradient id="cyan" x1="0" y1="0" x2="0" y2="1">` +
  `<stop offset="0" stop-color="#38bdf8" stop-opacity="0"/>` +
  `<stop offset="0.55" stop-color="#38bdf8" stop-opacity="0.45"/>` +
  `<stop offset="1" stop-color="#6366f1" stop-opacity="0"/>` +
  `</linearGradient>` +
  `<filter id="soft" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="14"/></filter>` +
  `</defs>` +
  `<style>` +
  `.a { animation: driftA 46s ease-in-out infinite alternate; }` +
  `.b { animation: driftB 61s ease-in-out infinite alternate; }` +
  `.c { animation: driftC 53s ease-in-out infinite alternate; }` +
  `.tw { animation: twinkle 9s ease-in-out infinite alternate; }` +
  `.tw2 { animation: twinkle 13s ease-in-out infinite alternate-reverse; }` +
  `@keyframes driftA { from { transform: translate(-70px, 0px); opacity: 0.8; } to { transform: translate(90px, -18px); opacity: 1; } }` +
  `@keyframes driftB { from { transform: translate(60px, 10px); opacity: 0.65; } to { transform: translate(-80px, -10px); opacity: 0.95; } }` +
  `@keyframes driftC { from { transform: translate(-40px, -6px); opacity: 0.55; } to { transform: translate(70px, 14px); opacity: 0.9; } }` +
  `@keyframes twinkle { from { opacity: 0.25; } to { opacity: 0.9; } }` +
  `</style>` +
  `<rect width="1600" height="1000" fill="url(#sky)"/>` +
  `<rect width="1600" height="1000" fill="url(#haze)"/>` +
  `<g>${stars()}</g>` +
  `<g>` +
  `<g class="a"><path filter="url(#soft)" fill="url(#green)" d="M-200 330 C 100 180 380 360 700 230 S 1250 120 1800 260 L 1800 560 C 1350 430 1050 600 700 480 S 150 600 -200 640 Z"/></g>` +
  `<g class="b"><path filter="url(#soft)" fill="url(#violet)" d="M-200 210 C 200 120 520 260 860 150 S 1400 90 1800 170 L 1800 420 C 1400 330 1100 460 820 380 S 250 470 -200 470 Z"/></g>` +
  `<g class="c"><path filter="url(#soft)" fill="url(#cyan)" d="M-200 430 C 250 330 600 470 950 360 S 1450 300 1800 380 L 1800 620 C 1450 540 1150 650 900 590 S 300 660 -200 700 Z"/></g>` +
  `</g>` +
  `<path fill="#0d1030" d="M0 860 L 140 760 L 250 820 L 400 700 L 540 800 L 660 740 L 820 830 L 980 720 L 1120 810 L 1260 750 L 1420 830 L 1600 760 L 1600 1000 L 0 1000 Z"/>` +
  `<path fill="#060818" d="M0 920 L 180 850 L 330 900 L 480 830 L 650 910 L 820 860 L 1000 930 L 1180 860 L 1340 920 L 1480 880 L 1600 910 L 1600 1000 L 0 1000 Z"/>`
