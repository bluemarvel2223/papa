import { expect, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'

const NOW = Date.parse('2026-11-27T20:00:00Z')

const BAND = {
  plugin: 'theme-examples',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isCollapsed: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 10 },
    view: {},
  },
} as const

const UNDERLAY = {
  plugin: 'theme-examples',
  component: 'Underlay',
  surface: 'terminal',
  props: { columns: 120, rows: 40, isWorking: false, view: {} },
} as const

const backdrop = (scene: string, surface: 'desktop' | 'mobile') =>
  ({
    plugin: 'theme-examples',
    component: 'Backdrop',
    surface,
    props: { scene, plugin: 'theme-examples', glass: false },
  }) as const

const LIMITS = [
  { kind: 'five_hour', percentUsed: 62.4, resetsAt: '2026-11-27T22:14:00Z' },
  { kind: 'seven_day', percentUsed: 85, resetsAt: '2026-12-01T00:00:00Z' },
]

type On = Parameters<TestBody>[1]
type Engine = Parameters<TestBody>[0]

// What the engine stamps on a typed command.
const look = ($: Engine, args: string) =>
  $.command.run({
    command: 'look',
    args,
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 100 },
  })

function engine(on: On, rateLimits: typeof LIMITS, toasts: string[] = [], themes: unknown[] = []) {
  const store = new Map<string, unknown>()
  on('command.register', () => ({ value: { command: 'look' } }))
  on('theme.set', (_, e) => {
    themes.push(e)

    return { value: { isDrawn: true, requestId: 't' } }
  })
  on('store.get', (_, e) => ({ value: store.get(e.key) }))
  on('store.set', (_, e) => {
    store.set(e.key, e.value)

    return { value: undefined }
  })
  on('clock.every', () => ({ value: undefined }))
  on('clock.now', () => ({ value: NOW }))
  on('ui.toast', (_, e) => {
    toasts.push(e.text)

    return { value: undefined }
  })
  on('session.usage', () => ({ value: { startedAt: NOW, context: { window: 200000 }, rateLimits } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
}

test('the terminal draws the indicators in its top right corner, in blues', async ($, on) => {
  const toasts: string[] = []
  engine(on, LIMITS, toasts)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  // The weekly window is under 20% left, so it warns once; the 5-hour one doesn't.
  expect(toasts).toEqual(['Weekly usage limit: 15% left. resets in 3d 4h'])

  const ui = await $.ui.mount(UNDERLAY)
  expect((await ui.find({ type: 'Text', text: /^5-hour$/ }))?.text).toBe('5-hour')
  expect((await ui.find({ type: 'Text', text: /^38%$/ }))?.text).toBe('38%')
  expect((await ui.find({ type: 'Text', text: /^2h$/ }))?.text).toBe('2h')
  expect((await ui.find({ type: 'Text', text: /^15%$/ }))?.text).toBe('15%')
  expect((await ui.find({ type: 'Text', text: /^3d 4h$/ }))?.text).toBe('3d 4h')
  await ui.unmount()
})

test('every look draws its backdrop with the indicators, on the desktop and the phone', async ($, on) => {
  engine(on, LIMITS)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  for (const scene of ['azure', 'frost', 'aurora', 'paper', 'sage', 'midnight', 'cork']) {
    for (const surface of ['desktop', 'mobile'] as const) {
      const ui = await $.ui.mount(backdrop(scene, surface))
      const svg = await ui.find({ type: 'Svg' })

      expect(svg).toBeDefined()
      await ui.unmount()
    }
  }
})

test('the indicators stay out of the band above the prompt while they are at the top right', async ($, on) => {
  engine(on, LIMITS)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect(await ui.find({ type: 'Text', text: /limit/ })).toBeUndefined()
  await ui.unmount()
})

test('/look hud band brings the bar back above the prompt, on every surface', async ($, on) => {
  engine(on, LIMITS)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  const said = await look($, 'hud band')
  expect(said.text).toMatch(/above the prompt/)

  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BAND, surface })
    expect((await ui.find({ type: 'Text', text: /^5-hour limit$/ }))?.text).toBe('5-hour limit')
    expect((await ui.find({ type: 'Text', text: /^38% left/ }))?.text).toBe('38% left · resets in 2h 14m')
    expect((await ui.find({ type: 'Text', text: /^15% left/ }))?.text).toBe('15% left · resets in 3d 4h')
    await ui.unmount()
  }

  const term = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await term.find({ type: 'Text', text: /^38% left$/ }))?.text).toBe('38% left')
  await term.unmount()

  const back = await look($, 'hud top')
  expect(back.text).toMatch(/top right/)
})

test('with no reading yet, the band says so', async ($, on) => {
  engine(on, [])
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await look($, 'hud band')
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })

  expect((await ui.find({ type: 'Text', text: /after a reply/ }))?.text).toMatch(/Usage limits/)
  await ui.unmount()
})

test('Azure is switched on once, with its scene, and the other looks name theirs', async ($, on) => {
  const themes: unknown[] = []
  engine(on, LIMITS, [], themes)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  expect(JSON.stringify(themes[0])).toContain('"scene":"azure"')

  for (const name of ['frost', 'aurora', 'paper', 'sage', 'midnight', 'cork']) {
    await look($, name)
    expect(JSON.stringify(themes.at(-1))).toContain(`"scene":"${name}"`)
  }
})
