import type { ThemeMessageRule, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// Warm paper by day and lamp-lit paper by night (the skill's own example).
const paper = makeColors({
  label: 'Paper notebook',
  roles: { accent: '#2f5d8c', danger: '#b3392f', success: '#4e7d3a', warning: '#a86f14', pro: '#6d4f94' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#efe6d3',
        'surface-1': '#f4ecdc',
        'surface-2': '#faf5e9',
        'text-primary': '#2a241d',
        'text-secondary': '#544a3d',
        'text-muted': '#6a5f50',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#1f1a15',
        'surface-1': '#28221b',
        'surface-2': '#312a22',
        'surface-3': '#3a3229',
        'text-primary': '#f0e7d7',
        'text-secondary': '#cfc4b2',
        'text-muted': '#aca08d',
      },
    },
  },
})

// Soft green-gray, like a greenhouse in the morning and a garden at dusk.
const sage = makeColors({
  label: 'Sage garden',
  roles: { accent: '#2f6f73', danger: '#b0413e', success: '#4f7f3a', warning: '#a8741a', pro: '#7a5a8c' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#e6ebe2',
        'surface-1': '#edf1ea',
        'surface-2': '#f5f7f2',
        'text-primary': '#1f2a20',
        'text-secondary': '#3f4d40',
        'text-muted': '#566457',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#161c17',
        'surface-1': '#1d241e',
        'surface-2': '#242c25',
        'surface-3': '#2b342c',
        'text-primary': '#e6ede4',
        'text-secondary': '#c3cdc1',
        'text-muted': '#9eab9c',
      },
    },
  },
})

// Deep navy, dark mode only, on a faint gradient.
const midnight = makeColors({
  label: 'Midnight harbor',
  only: 'dark',
  roles: { accent: '#5b9bd5', danger: '#e06c6c', success: '#6fbf8a', warning: '#e0a85a', pro: '#a98be0' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0d1420',
        'surface-1': '#131c2b',
        'surface-2': '#1a2436',
        'surface-3': '#202c40',
        'text-primary': '#e8eef7',
        'text-secondary': '#c0cbdb',
        'text-muted': '#97a5ba',
      },
    },
  },
})

// Sticky notes on a cork board: restyles the messages themselves.
const note: ThemeMessageRule = { color: '#2b2416', radius: 2, padding: 16, shadow: { y: 3, blur: 8, color: '#0005' } }
const corkGround: ThemeSetArgs = { backdrop: { scene: 'cork', glass: false }, overrideColorScheme: 'light' }
const cork: ThemeSetArgs = {
  ...corkGround,
  style: {
    Text: { fontFamily: ['cursive'], fontSize: 17, lineHeight: 26 },
    UserMessage: [
      { ...note, backgroundColor: '#fde68a', rotate: -1.5 },
      { ...note, backgroundColor: '#fbcfe8', rotate: 1 },
    ],
    AssistantMessage: {
      ...note,
      backgroundColor: '#fbf6e9',
      paddingTop: 28,
      fill: {
        vector: {
          viewBox: 96,
          slice: 40,
          paths: [
            { d: 'M0 8H96V84L84 96H0Z', color: '#fbf6e9' }, // paper, one corner folded
            { d: 'M84 96V84H96Z', color: '#e0d6bd' },
            { d: 'M8 2L38 0L39 16L9 18Z', color: '#f5d77ecc' }, // tape
          ],
        },
      },
    },
    ToolUse: { color: '#2b2416', backgroundColor: '#fff8', radius: 6, paddingX: 8 },
  },
}

// Northern lights over a night sky: vivid roles, gradient bubbles, a moving scene.
const aurora = makeColors({
  label: 'Aurora',
  only: 'dark',
  roles: { accent: '#8b5cf6', danger: '#f43f5e', success: '#10e0a0', warning: '#fbbf24', pro: '#e040fb' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0b0f1e',
        'surface-1': '#111633',
        'surface-2': '#171d3d',
        'surface-3': '#1d2446',
        'text-primary': '#f1f3ff',
        'text-secondary': '#c9cdf0',
        'text-muted': '#9ea5d0',
      },
    },
  },
})
const auroraGround: ThemeSetArgs = {
  colors: aurora.theme,
  backdrop: { scene: 'aurora', glass: { blur: 28, tint: '#0b0f1e', opacity: 0.55 } },
}
const auroraLook: ThemeSetArgs = {
  ...auroraGround,
  style: {
    Heading: { color: '#a5f3fc', fontWeight: 'bold' },
    UserMessage: {
      color: '#ffffff',
      backgroundColor: '#6d28d9',
      fill: { gradient: { stops: ['#6d28d9', '#a21caf'], angle: 135 } },
      radius: [18, 18, 4, 18],
      paddingX: 16,
      paddingY: 12,
      shadow: { x: 0, y: 6, blur: 18, color: '#7c3aed55' },
    },
    AssistantMessage: {
      color: '#f1f3ff',
      backgroundColor: '#121838f2',
      borderColor: '#8b5cf655',
      borderWidth: 1,
      radius: 16,
      padding: 16,
    },
    ToolUse: { color: '#c9cdf0', backgroundColor: '#0f1430f0', borderColor: '#22d3ee44', borderWidth: 1, radius: 10, paddingX: 10 },
  },
}

// A clean, modern, Apple-style look in the indicators' blues: quiet blue-tinted
// grays, white cards in light and deep navy in dark, system-blue accents, soft
// frosted panels. Follows the person's light or dark mode.
const frost = makeColors({
  label: 'Frost',
  roles: { accent: '#2563eb', danger: '#d03a2f', success: '#1f8a4c', warning: '#b7791f', pro: '#5b5bd6' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#edf2f9',
        'surface-1': '#f4f7fc',
        'surface-2': '#ffffff',
        'text-primary': '#0f1b2e',
        'text-secondary': '#34445e',
        'text-muted': '#55667f',
      },
    },
  },
  dark: {
    roles: { accent: '#5aa2ff', danger: '#f06a60', success: '#4cc38a', warning: '#f0b44c', pro: '#8f8ff0' },
    gray: {
      anchors: {
        'surface-0': '#0a111e',
        'surface-1': '#101827',
        'surface-2': '#162133',
        'surface-3': '#1c2a40',
        'text-primary': '#f2f6ff',
        'text-secondary': '#c3cee3',
        'text-muted': '#97a6c2',
      },
    },
  },
})
const frostGround: ThemeSetArgs = {
  colors: frost.theme,
  backdrop: { scene: 'frost' },
}
const frostLook: ThemeSetArgs = {
  ...frostGround,
  style: {
    Text: { fontFamily: ['sans'], letterSpacing: -0.1 },
    Heading: { color: 'text-primary', fontWeight: 'semibold' },
    UserMessage: {
      color: '#ffffff',
      backgroundColor: '#2563eb',
      fill: { gradient: { stops: ['#3b82f6', '#2563eb'], angle: 160 } },
      radius: [20, 20, 6, 20],
      paddingX: 16,
      paddingY: 11,
      shadow: { x: 0, y: 4, blur: 14, color: '#2563eb40' },
    },
    AssistantMessage: {
      color: 'text-primary',
      backgroundColor: 'surface-2',
      borderColor: 'border',
      borderWidth: 1,
      radius: 18,
      paddingX: 18,
      paddingY: 14,
      shadow: { x: 0, y: 1, blur: 4, color: '#0f1b2e14' },
    },
    ToolUse: { color: 'text-secondary', backgroundColor: 'surface-1', borderColor: 'border', borderWidth: 1, radius: 12, paddingX: 10 },
  },
}

// A medium-blue look in the indicators' own blue (#3b82f6): a soft sky-blue page
// by day and deep navy by night, white cards, deep navy ink and a serif for
// headings. Follows the person's light or dark mode.
const azure = makeColors({
  label: 'Azure',
  roles: { accent: '#2563eb', danger: '#d03a2f', success: '#1f8a4c', warning: '#b7791f', pro: '#6a63c9' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#d3e3fb',
        'surface-1': '#e7f0fd',
        'surface-2': '#ffffff',
        'text-primary': '#0c1d3a',
        'text-secondary': '#2c416a',
        'text-muted': '#4a6190',
      },
    },
  },
  dark: {
    roles: { accent: '#60a5fa', danger: '#f06a60', success: '#4cc38a', warning: '#f0b44c', pro: '#a7a0f0' },
    gray: {
      anchors: {
        'surface-0': '#0a1426',
        'surface-1': '#101c36',
        'surface-2': '#17264a',
        'surface-3': '#1b2a4a',
        'text-primary': '#eef4ff',
        'text-secondary': '#c4d2ee',
        'text-muted': '#98aacd',
      },
    },
  },
})
const azureGround: ThemeSetArgs = {
  colors: azure.theme,
  backdrop: { scene: 'azure' },
}
const azureLook: ThemeSetArgs = {
  ...azureGround,
  style: {
    Text: { fontFamily: ['sans'], letterSpacing: -0.1 },
    Heading: { color: 'text-primary', fontFamily: ['serif'], fontWeight: 'semibold' },
    UserMessage: {
      color: '#ffffff',
      backgroundColor: '#2563eb',
      fill: { gradient: { stops: ['#3b82f6', '#2563eb'], angle: 160 } },
      radius: [20, 20, 6, 20],
      paddingX: 16,
      paddingY: 11,
      shadow: { x: 0, y: 4, blur: 14, color: '#2563eb55' },
    },
    AssistantMessage: {
      color: 'text-primary',
      backgroundColor: 'surface-2',
      borderColor: '#3b82f655',
      borderWidth: 1,
      radius: 18,
      paddingX: 18,
      paddingY: 14,
      shadow: { x: 0, y: 1, blur: 4, color: '#0c1d3a14' },
    },
    ToolUse: { color: 'text-secondary', backgroundColor: 'surface-1', borderColor: '#3b82f644', borderWidth: 1, radius: 12, paddingX: 10 },
  },
}

export type Look = { label: string; look: ThemeSetArgs; fallback?: ThemeSetArgs; problems: string[] }

export const LOOKS: Record<string, Look> = {
  frost: { label: 'Frost (clean, frosted, light and dark)', look: frostLook, fallback: frostGround, problems: frost.problems },
  azure: { label: 'Azure (medium blue, light and dark)', look: azureLook, fallback: azureGround, problems: azure.problems },
  aurora: { label: 'Aurora (dark, moving sky)', look: auroraLook, fallback: auroraGround, problems: aurora.problems },
  paper: { label: 'Paper notebook', look: { colors: paper.theme, backdrop: { scene: 'paper', glass: false } }, problems: paper.problems },
  sage: { label: 'Sage garden', look: { colors: sage.theme, backdrop: { scene: 'sage', glass: false } }, problems: sage.problems },
  midnight: {
    label: 'Midnight harbor (dark only)',
    look: { colors: midnight.theme, backdrop: { scene: 'midnight', glass: false } },
    problems: midnight.problems,
  },
  cork: { label: 'Cork board (sticky-note messages)', look: cork, fallback: corkGround, problems: [] },
}

