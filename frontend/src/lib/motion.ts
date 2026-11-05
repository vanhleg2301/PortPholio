import type { Transition, Variants } from 'framer-motion'

export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

export const SPRING: Transition = { type: 'spring', stiffness: 420, damping: 32 }

const itemHidden = { opacity: 0, y: 10 }
const itemShown = { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE_OUT } }
const stagger = { transition: { staggerChildren: 0.045, delayChildren: 0.04 } }

// Lists answer to both label pairs: "hidden/show" when they animate on their own,
// "enter/center" when they follow a parent panel (e.g. the sliding day panel).
export const listContainer: Variants = { hidden: {}, show: stagger, enter: {}, center: stagger }
export const listItem: Variants = { hidden: itemHidden, show: itemShown, enter: itemHidden, center: itemShown }

// A block inside a sliding panel: fades up in turn after the panel arrives.
export const section: Variants = { enter: itemHidden, center: itemShown }

// Horizontal slide used when moving between days / weeks; `custom` is the direction (-1, 0 or 1).
export const slide: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 28 }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: EASE_OUT, staggerChildren: 0.06, delayChildren: 0.02 },
  },
  exit: (direction: number) => ({ opacity: 0, x: direction * -28, transition: { duration: 0.16, ease: 'easeIn' } }),
}

export const fadeSwap: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.24, ease: EASE_OUT } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.14, ease: 'easeIn' } },
}

// Fade-up for content that mounts later (data arriving), with an optional per-item delay.
export function appear(index = 0) {
  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.28, ease: EASE_OUT, delay: Math.min(index, 8) * 0.04 },
  } as const
}
