import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Limit } from '../types'
import { LOOKS } from './looks'
import type { Look } from './looks'
import { barCells, coarse, ringSvg, toneOf } from './meter'
import type { HudItem } from './meter'
import { sceneIds, sceneSvg } from './scenes'

const DEFAULT = 'frost'
const STORE_LOOK = 'look'
const STORE_HUD = 'hud'
const COMMAND = 'look'
const MINUTE = 60_000

// ---------------------------------------------------------------------------
// Looks
// ---------------------------------------------------------------------------

const listing = (look: string, hud: string) =>
  [
    'Looks: ' + Object.entries(LOOKS).map(([id, l]) => `${id === look ? '*' : ''}${id} (${l.label})`).join(', '),
    `Use /${COMMAND} <name> to switch, or /${COMMAND} off for the app's own look.`,
    `Indicators: ${hud === 'top' ? 'top right' : 'bar above the prompt'}. /${COMMAND} hud top, or /${COMMAND} hud band, to move them.`,
  ].join('\n')

async function apply($: EngineInterface, entry: Look) {
  const unpainted = entry.problems.find(line => line.startsWith("Desktop won't paint"))

  if (unpainted !== undefined) {
    $.ui.toast(unpainted)
  }
  let set
  try {
    set = await $.theme.set(entry.look)
  } catch (error) {
    if (entry.fallback === undefined) {
      throw error
    }
    // An older build that doesn't take `style`: set the look without it.
    $.ui.log(String(error))
    set = await $.theme.set(entry.fallback)
  }

  return set
}

// ---------------------------------------------------------------------------
// Usage-limit meter
// ---------------------------------------------------------------------------

const limits = atom({ plugin: 'theme-examples', key: 'limits' } as const, [] as Limit[], { shape: 'limits-1' })
const minute = atom({ plugin: 'theme-examples', key: 'minute' } as const, 0)
const hud = atom({ plugin: 'theme-examples', key: 'hud' } as const, 'top' as 'top' | 'band')
const look = atom({ plugin: 'theme-examples', key: 'look' } as const, DEFAULT)

const NAMES: Record<string, string> = {
  five_hour: '5-hour',
  seven_day: 'Weekly',
  seven_day_opus: 'Weekly Opus',
  seven_day_sonnet: 'Weekly Sonnet',
  spend_limit: 'Spend',
}
const nameOf = (kind: string) => NAMES[kind] ?? kind.replace(/[^A-Za-z0-9]+/g, ' ').trim()
const leftOf = (limit: Limit) => Math.max(0, Math.round(100 - limit.percentUsed))

function countdown(resetsAt: string | undefined, now: number) {
  if (resetsAt === undefined) {
    return ''
  }
  const ms = Date.parse(resetsAt) - now

  if (!Number.isFinite(ms)) {
    return ''
  }
  if (ms <= 0) {
    return 'resetting now'
  }
  const mins = Math.ceil(ms / MINUTE)
  const days = Math.floor(mins / 1440)
  const hours = Math.floor((mins % 1440) / 60)
  const rest = mins % 60

  if (days > 0) {
    return `resets in ${days}d ${hours}h`
  }
  if (hours > 0) {
    return `resets in ${hours}h ${rest}m`
  }

  return `resets in ${rest}m`
}

// Warn once per window as it crosses each line (kept per reset, so a new window warns again).
const WARN_AT = [20, 5]
const warned = new Map<string, number>()

function warn($: EngineInterface, list: Limit[], now: number) {
  for (const limit of list) {
    const left = leftOf(limit)
    const id = `${limit.kind}@${limit.resetsAt ?? ''}`
    const line = WARN_AT.filter(at => left < at).pop()

    if (line !== undefined && (warned.get(id) ?? 101) > line) {
      warned.set(id, line)
      $.ui.toast(`${nameOf(limit.kind)} usage limit: ${left}% left. ${countdown(limit.resetsAt, now)}`, {
        timeoutMs: 8000,
      })
    }
  }
}

async function tick($: EngineInterface) {
  const now = await $.clock.now()
  await update($, minute, () => Math.floor(now / MINUTE) * MINUTE)

  return now
}

async function record($: EngineInterface, list: Limit[]) {
  await update($, limits, () => list)
  warn($, list, await tick($))
}

// ---------------------------------------------------------------------------

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: COMMAND,
      description: 'Switch looks (frost, aurora, paper, sage, midnight, cork, off) or move the indicators (hud top, hud band)',
    })
    // Once, when Frost arrives: switch to it. After that the person's pick stands.
    if ((await $.store.get('introduced')) !== 'frost') {
      await $.store.set('introduced', 'frost')
      await $.store.set(STORE_LOOK, 'frost')
    }
    const saved = await $.store.get(STORE_LOOK)
    const savedHud = await $.store.get(STORE_HUD)
    await update($, hud, () => (savedHud === 'band' ? 'band' : 'top'))
    await update($, look, () => (typeof saved === 'string' ? saved : DEFAULT))

    if (saved !== 'off') {
      const entry = (typeof saved === 'string' ? LOOKS[saved] : undefined) ?? LOOKS[DEFAULT]

      if (entry !== undefined) {
        await apply($, entry).catch(error => $.ui.log(String(error)))
      }
    }

    // Seed the meter with whatever reading the session already has, then tick
    // each minute so the reset countdown moves between replies.
    const usage = await $.session.usage()
    await record($, usage.rateLimits)
    $.clock.every(MINUTE, () => {
      void tick($)
    })

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('rateLimits')) {
      await record($, e.rateLimits)
    }

    return next(e)
  })

  // The apps: every look's backdrop is its own ground plus the indicators pinned top right.
  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    if (!sceneIds.includes(e.props.scene) || (e.surface !== 'desktop' && e.surface !== 'mobile')) {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)
    const list = (await read($, hud)) === 'top' ? await read($, limits) : []
    const now = (await read($, minute)) || (await $.clock.now())
    const items: HudItem[] = list.map(limit => ({
      name: nameOf(limit.kind),
      left: leftOf(limit),
      reset: coarse(limit.resetsAt, now),
    }))
    const said = items.map(i => `${i.name} ${i.left}% left`).join(', ')

    return (
      <Svg
        source={sceneSvg(e.props.scene, items, e.surface === 'mobile')}
        alt={`${e.props.scene} backdrop${items.length === 0 ? '' : `, with usage limits at the top right: ${said}`}`}
      />
    )
  })

  // The terminal's fullscreen layout: the same indicators in the top right corner.
  on('ui.render', { component: 'Underlay' }, async ($, e, next) => {
    const list = await read($, limits)

    if ((await read($, hud)) !== 'top' || list.length === 0) {
      return next(e)
    }
    const now = (await read($, minute)) || (await $.clock.now())
    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box>
        <Box position="absolute" top={0} right={2} flexDirection="column" alignItems="flex-end">
          {list.map(limit => {
            const left = leftOf(limit)
            const tone = toneOf(left)
            const reset = coarse(limit.resetsAt, now)

            return (
              <Box key={limit.kind} flexDirection="row" gap={1}>
                <Text bold color={tone.ink}>
                  {nameOf(limit.kind)}
                </Text>
                <Text>
                  {barCells(left, 14).map(cell => (
                    <Text color={cell.color}>{cell.text}</Text>
                  ))}
                </Text>
                <Text bold color={tone.ink}>
                  {left}%
                </Text>
                {reset !== '' && <Text color="#64748b">{reset}</Text>}
              </Box>
            )
          })}
        </Box>
      </Box>
    )
  })

  // The bar above the prompt: for `/look hud band`, and for the apps while no look is on.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) {
      return next(e)
    }
    const isBand = (await read($, hud)) === 'band'
    const isBare = (await read($, look)) === 'off' && e.surface !== 'terminal'

    if (!isBand && !isBare) {
      return next(e)
    }
    const list = await read($, limits)
    const now = (await read($, minute)) || (await $.clock.now())

    if (e.surface === 'terminal') {
      const { Box, Text } = $.ui.resolve(e)

      if (list.length === 0) {
        return (
          <Box>
            <Text dimColor>Usage limits: no reading yet (shows after a reply, on a Claude subscription)</Text>
          </Box>
        )
      }

      return (
        <Box flexDirection="column">
          {list.map(limit => {
            const left = leftOf(limit)
            const tone = toneOf(left)
            const reset = countdown(limit.resetsAt, now)

            return (
              <Box key={limit.kind} flexDirection="row" gap={1}>
                <Text bold color={tone.ink}>
                  {nameOf(limit.kind).padEnd(7)}
                </Text>
                <Text>
                  {barCells(left).map(cell => (
                    <Text color={cell.color}>{cell.text}</Text>
                  ))}
                </Text>
                <Text bold color={tone.ink}>
                  {left}% left
                </Text>
                {reset !== '' && <Text dimColor>· {reset}</Text>}
              </Box>
            )
          })}
        </Box>
      )
    }

    const { Box, Text, Svg } = $.ui.resolve(e)

    if (list.length === 0) {
      return (
        <Box>
          <Text dimColor size="footnote">
            Usage limits show here after a reply (on a Claude subscription)
          </Text>
        </Box>
      )
    }

    return (
      <Box flexDirection="row" flexWrap="wrap" gap={2}>
        {list.map(limit => {
          const left = leftOf(limit)
          const tone = toneOf(left)
          const reset = countdown(limit.resetsAt, now)
          const name = nameOf(limit.kind)

          return (
            <Box
              key={limit.kind}
              flexDirection="row"
              alignItems="center"
              gap={1}
              paddingX={1}
              borderStyle="round"
              borderColor={tone.track}
            >
              <Svg
                source={ringSvg(left)}
                alt={`${name} usage limit: ${left}% left${reset === '' ? '' : `, ${reset}`}`}
                width={35}
                height={35}
              />
              <Box flexDirection="column">
                <Text weight="bold">{name} limit</Text>
                <Text dimColor size="footnote" tabular>
                  {left}% left{reset === '' ? '' : ` · ${reset}`}
                </Text>
              </Box>
            </Box>
          )
        })}
      </Box>
    )
  })

  on('command.run', { command: COMMAND }, async ($, e) => {
    const words = e.args.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const saved = await $.store.get(STORE_LOOK)
    const current = typeof saved === 'string' ? saved : DEFAULT
    const place = (await $.store.get(STORE_HUD)) === 'band' ? 'band' : 'top'

    if (words.length === 0) {
      return { text: listing(current, place) }
    }
    if (words[0] === 'hud') {
      const where = words[1]

      if (where !== 'top' && where !== 'band') {
        return { text: `Say where: /${COMMAND} hud top (top right corner) or /${COMMAND} hud band (bar above the prompt).` }
      }
      await $.store.set(STORE_HUD, where)
      await update($, hud, () => where)

      return {
        text: where === 'top' ? 'Indicators moved to the top right.' : 'Indicators moved to a bar above the prompt.',
      }
    }
    const wanted = words[0] ?? ''

    if (wanted === 'off') {
      await $.theme.clear()
      await $.store.set(STORE_LOOK, 'off')
      await update($, look, () => 'off')

      return { text: `Look cleared: back to the app's own. /${COMMAND} <name> turns one back on.` }
    }
    const entry = LOOKS[wanted]

    if (entry === undefined) {
      return { text: `No look named "${wanted}".\n${listing(current, place)}` }
    }
    try {
      const set = await apply($, entry)
      await $.store.set(STORE_LOOK, wanted)
      await update($, look, () => wanted)

      return {
        text: set.isDrawn
          ? `Switched to ${entry.label}.`
          : `Saved ${entry.label}, but nothing draws it here: ${set.reason}`,
      }
    } catch (error) {
      return { text: `Couldn't set ${entry.label}: ${String(error)}` }
    }
  })
}
