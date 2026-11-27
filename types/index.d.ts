/** One usage-limit window, as the session reports it. */
export type Limit = { kind: string; percentUsed: number; resetsAt?: string }

declare module 'claude-code' {
  interface PluginState {
    'theme-examples': {
      /** The usage-limit windows from the last reading. */
      limits: Shaped<Limit[]>
      /** The current time, rounded to the minute, so the reset countdown redraws. */
      minute: number
      /** Where the indicators sit: pinned top right, or as a bar above the prompt. */
      hud: 'top' | 'band'
      /** The look in use (a key of LOOKS, or `off`). */
      look: string
    }
  }
}
