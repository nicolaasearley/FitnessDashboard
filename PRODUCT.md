# Product

## Register

product

## Users

A single endurance athlete — Nicolaas, training in London, Ontario — using this
as a personal command center. He runs and strength-trains near-daily and is
mid-way through a long build toward HYROX Toronto (Oct 1–3, 2026), where the
Pro Doubles race (sub-60 target) is the A-goal. Context of use: a quick daily
glance ("where am I in the block, what did I just do, am I trending up?") plus
the occasional deep read of records and season totals. Desktop-first but checked
on a phone. Dark environments, early mornings.

## Product Purpose

Surface the athlete's real training state at a glance and make the goal feel
present every day. Five jobs: (1) count down to the goal races; (2) locate the
athlete in the current training block (phase, weekly volume/load, zones, trend);
(3) show personal records with real deltas; (4) show recent and in-progress
sessions; (5) celebrate streaks, milestones and season totals. Success = it
feels like an expensive, trustworthy instrument, not an admin template, and
every number is real (sourced from Strava) or clearly the athlete's own config.

## Brand Personality

Instrument-grade, composed, quietly premium. Three words: precise, cinematic,
motivating. The voice is confident and sparing — numbers lead, chrome recedes.
Emotionally it should read like a flagship hardware product's display: calm dark
surfaces, one electric accent, motion that feels engineered rather than
decorative.

## Anti-references

- Generic admin/SaaS dashboard templates (sidebar + identical stat cards + bar
  chart). The thing this must NOT look like.
- Strava's own busy social feed; the consumer-fitness "rings everywhere" look.
- Neon gamer dashboards, gradient-text hero metrics, glassmorphism-by-default.
- Nested cards, side-stripe accents, an eyebrow above every section.

## Design Principles

1. **Numbers are the hero.** Mono, tabular, large where it matters; chrome stays
   quiet. The data earns the drama.
2. **One accent, used as signal.** Electric cyan marks the live, the current, the
   record — never decoration.
3. **The goal is always on screen.** The HYROX countdown anchors the page; every
   section ties back to the build.
4. **Real or honestly labeled.** Strava data is real; anything synthesized (the
   live demo session, zone estimates) says so plainly.
5. **Motion is engineered, not sprinkled.** Cinematic reveals and a live pulse;
   everything degrades to a clean static state under reduced motion or no JS.

## Accessibility & Inclusion

- WCAG AA targets: body text ≥4.5:1, large text ≥3:1, verified against the dark
  surfaces.
- `prefers-reduced-motion` fully honored — reveals become instant, the live
  pulse and sheen stop, count-ups show final values.
- Keyboard-navigable nav and focus-visible rings throughout.
- Content is present at SSR / without JS; motion only enhances an already-visible
  default.
- Colour is never the only signal (zones carry labels and bpm ranges; deltas
  carry sign glyphs and arrows).
