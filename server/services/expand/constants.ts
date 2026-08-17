/** Product knobs for Expand / bootstrap fan-out. */

/** Default daily Expand ledger budget when config/env unset. */
export const DEFAULT_EXPAND_DAILY_BUDGET = 50

/** Forks requested when the user clicks Expand on a node. */
export const EXPAND_TAKE_DEFAULT = 3

/** Bootstrap: forks from the seed node. */
export const BOOTSTRAP_SEED_TAKE = 3

/** Bootstrap: forks from each seed child. */
export const BOOTSTRAP_CHILD_TAKE = 2

/** Max title length stored for a Rabbit Hole (matches Zod schemas). */
export const RABBIT_HOLE_TITLE_MAX = 200
