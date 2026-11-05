import type { Transition, Variants } from 'framer-motion'

export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

export const SPRING: Transition = { type: 'spring', stiffness: 420, damping: 32 }

export const listContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.04 } },
}

export const listItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE_OUT } },
}

// Horizontal slide used when moving between days / weeks; `custom` is the direction (-1 or 1).
export const slide: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 28 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.28, ease: EASE_OUT } },
  exit: (direction: number) => ({ opacity: 0, x: direction * -28, transition: { duration: 0.16, ease: 'easeIn' } }),
}

export const fadeSwap: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.24, ease: EASE_OUT } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.14, ease: 'easeIn' } },
}
