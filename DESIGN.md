# Design

Visual system for the training dashboard. Aesthetic lane: **Electric Ice** —
a dark-first, instrument-grade surface with a single electric-cyan accent and a
cool→hot heart-rate ramp. Tokens live in `src/app/globals.css`.

## Theme

Dark only. Deep cool graphite surfaces under two faint top-corner light sources
(fixed radial gradients on `body`). The mood: a flagship hardware display in a
dim room at 6am.

## Color (OKLCH)

| Role | Token | Value |
| --- | --- | --- |
| Background | `--bg` | `oklch(0.158 0.012 248)` |
| Panel | `--panel` | `oklch(0.206 0.0135 250)` |
| Raised | `--panel-2` / `--panel-3` | `0.238` / `0.27` L |
| Hairline | `--line` / `--line-2` | white @ 8.5% / 14% |
| Ink (primary) | `--ink` | `oklch(0.975 0.004 250)` |
| Ink (secondary) | `--ink-2` | `oklch(0.82 0.011 250)` |
| Ink (muted, body) | `--ink-3` | `oklch(0.685 0.014 252)` |
| Ink (faint, large only) | `--ink-4` | `oklch(0.575 0.016 252)` |
| Accent | `--accent` / `--accent-bright` | cyan `0.82 0.13 213` / `0.9 0.146 204` |
| Positive | `--pos` | `oklch(0.82 0.14 168)` |
| Negative | `--neg` | `oklch(0.72 0.16 26)` |
| Zones Z1–Z5 | `--z1`…`--z5` | slate → blue → cyan → amber → red |

Strategy: **Restrained-to-Committed**. Surfaces are tinted neutrals; the single
cyan accent carries live/current/record states and primary emphasis only. The
zone ramp is the one place multiple hues appear, and only for data.

Contrast: `--ink`, `--ink-2`, `--ink-3` all clear 4.5:1 on `--bg`/`--panel`.
`--ink-4` is reserved for large text, labels and decorative meta.

## Typography

One type system: **Geist Sans** (UI, headings, body) + **Geist Mono** (all
numerics, clocks, labels, `.kicker`). Pairing is on the sans/mono contrast axis,
not two similar sans. Numerals use `tabular-nums` so clocks and stats don't jitter.

- Display numerals (countdown, live clock, big stats): Geist Mono, `clamp()`
  capped well under 6rem, letter-spacing ≥ −0.03em.
- Headings: Geist Sans 600, tight tracking, `text-balance`.
- Body: Geist Sans, muted ink; long prose `text-pretty`.
- `.kicker`: mono, 11px, 0.18em tracking, uppercase — used sparingly, never as an
  eyebrow above every section.

## Layout

- Fixed slim icon **rail** (68px) on `lg+` with scroll-spy; collapses away on
  smaller screens where the top bar carries identity.
- Content max-width 1320px, single scrolling column of sections.
- Sections compose with a 12→3→1 responsive panel grid; `repeat`/`minmax` and
  `flex-wrap`, not fixed breakpoints everywhere.
- **Panel** is the only surface primitive — single level, hairline border, inner
  highlight, soft drop shadow. Panels never nest inside panels; lists are rows.
- The hero (race countdown) earns a richer `panel-hero` with an accent wash.

## Motion

Engineered, cinematic, reduced-motion-safe. Custom easings only.

- Easings: `--ease-out` `cubic-bezier(0.23,1,0.32,1)`, `--ease-out-expo`
  `cubic-bezier(0.16,1,0.3,1)`, `--ease-in-out` `cubic-bezier(0.77,0,0.175,1)`.
- Scroll reveals: fade + 18px rise + 6px blur clearing over ~720ms, staggered
  60–140ms. Content is visible by default; entrance is added only when the
  document is marked motion-ready before paint (no flash, SSR-safe, safety sweep
  guarantees nothing stays hidden).
- Live treatment: pulsing dot + ring, ticking clock, marching sheen on the
  progress bar, 1s linear width transitions.
- Count-ups on key stats, triggered on view, ease-out-expo.
- `prefers-reduced-motion`: reveals become a short opacity fade, all looping
  animations stop, count-ups show final values.

## Components

`Panel`, `RailNav` (scroll-spy), `TopBar`, `RaceCountdown` (live), `BlockPanel`
(phase rail + position marker), `WeekPanel` (+ `Sparkline`), `ZonePanel`
(stacked bar + legend), `TargetPaces`, `LiveSession` (live demo), `RecentList`,
`PrPanel`, `HighlightsPanel`, plus `CountUp`, `Reveal`, `Sparkline`, and one
coherent ultra-light line-icon set in `icons.tsx`.
