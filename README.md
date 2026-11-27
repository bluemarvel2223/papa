# theme-examples

A Claude Code mod with seven example looks for the desktop and mobile apps, plus glowing blue usage-limit indicators pinned to the top right corner that show how much of your 5-hour and weekly limits you have left.

## Install

At the prompt of a terminal session:

```
/plugin install theme-examples --marketplace bluemarvel2223/papa
```

From a shell:

```
claude plugin install theme-examples --marketplace bluemarvel2223/papa
```

Answer `y` to add the marketplace, then pick a scope.

## Looks

Switch with `/look <name>`. `/look` alone lists them, and `/look off` goes back to the app's own look. Your pick is remembered between sessions.

| Name | What it is |
| --- | --- |
| `azure` | The indicators' own medium blue: a sky-blue page by day and deep navy by night, white cards, system-blue message bubbles and a serif for headings. Follows your light or dark mode, and is the default. |
| `frost` | A clean, modern, Apple-style look in the indicators' blues: quiet blue-tinted surfaces, white cards by day and deep navy by night, system-blue message bubbles, soft frosted panels. Follows your light or dark mode. |
| `aurora` | Dark. A night sky with slowly drifting northern lights, gradient message bubbles, frosted reply cards. |
| `paper` | Warm cream paper by day, lamp-lit paper by night. |
| `sage` | Soft green-gray in light and dark. |
| `midnight` | Deep navy on a faint gradient. Dark only. |
| `cork` | A cork board, with messages drawn as tilted sticky notes. |

Looks draw in the desktop and mobile apps. The terminal draws no look.

## Usage indicators

One glass pill per limit, pinned to the top right corner under every look, drawn from the rate-limit readings the API reports after each reply:

- A glowing ring that empties as you use the limit, with the percent left in the middle, a bright head on the ring, and a slow orbiting spark.
- Blue throughout. Plenty left is ice to sky to royal blue with a slow pulse; as a limit runs down it deepens to navy and the pulse quickens.
- The name, percent left and time to reset beside the ring.
- In the terminal's fullscreen layout, the same figures sit in the top right as a blue gradient bar.
- A toast warns once when a limit drops under 20% and again under 5%.

Readings only exist on a Claude subscription, and appear after the first reply of a session.

Prefer them as a bar above the prompt? `/look hud band` moves them there, and `/look hud top` moves them back. Under `/look off` the apps show the bar above the prompt.

## Files

- `hooks/looks.ts`: the look definitions. Copy one and change the colors to make your own.
- `hooks/scenes.ts`: each look's backdrop, with the indicators pinned in its corner.
- `hooks/aurora.ts`: the moving sky.
- `hooks/meter.ts`: the ring, pill and bar drawing.
- `hooks/register.tsx`: the `/look` command and the indicators.
- `hooks/make-colors.js`: color helper copied from Claude Code's plugin-authoring skill.
- `tests/meter.test.tsx`: run with `claude plugin test .`
