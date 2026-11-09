/**
 * KisaanBuddy World-Class Motion Design System
 * 
 * Engineered for authentic agricultural technology:
 * - Fluid, restrained, and intentional (inspired by Apple, Linear, Stripe, Framer)
 * - Exclusively utilizes performant transform & opacity properties (120fps capable)
 * - Complete prefers-reduced-motion resilience
 * - Standardized duration tokens, physical spring configurations & Apple-grade deceleration curves
 */

import type { Variants, Transition } from "framer-motion";

// ============================================================================
// DURATION & EASING DESIGN TOKENS
// ============================================================================

export const MOTION_DURATIONS = {
  instant: 0.08,   // 80ms - tactile micro-clicks, active depression
  fast: 0.16,      // 160ms - hover micro-interactions, badge pulses, icons
  standard: 0.24,  // 240ms - card hovers, button presses, dropdowns
  page: 0.28,      // 280ms - page routing transitions
  modal: 0.32,     // 320ms - dialog & overlay entrances
  reveal: 0.48,    // 480ms - section reveals, grid items
  relaxed: 0.65,   // 650ms - complex chart & hero elements
  cinematic: 0.85, // 850ms - hero word reveals, atmospheric waves
} as const;

export const MOTION_EASINGS = {
  // Apple-grade gentle deceleration curve (calm, authoritative feel)
  gentle: [0.16, 1, 0.3, 1] as const,
  // Linear-style snappy curve for menus and tabs
  snappy: [0.25, 0.1, 0.25, 1] as const,
  // Standard ease-in-out for responsive bidirectional switches
  standard: [0.4, 0, 0.2, 1] as const,
  // Physics springs
  spring: {
    type: "spring",
    stiffness: 420,
    damping: 32,
    mass: 0.8,
  } as Transition,
  softSpring: {
    type: "spring",
    stiffness: 280,
    damping: 28,
    mass: 1,
  } as Transition,
  bouncySpring: {
    type: "spring",
    stiffness: 400,
    damping: 22,
  } as Transition,
  drawerSpring: {
    type: "spring",
    damping: 34,
    stiffness: 380,
    mass: 0.9,
  } as Transition,
};

// ============================================================================
// TEXT & WORD REVEAL ANIMATIONS (Apple & Linear style)
// ============================================================================

export const textStaggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

export const wordReveal: Variants = {
  initial: {
    opacity: 0,
    y: 18,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: MOTION_DURATIONS.reveal,
      ease: MOTION_EASINGS.gentle,
    },
  },
};

export const letterReveal: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: MOTION_EASINGS.gentle,
    },
  },
};

// ============================================================================
// SURFACE & CARD TRANSITIONS
// ============================================================================

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: MOTION_DURATIONS.standard, ease: MOTION_EASINGS.gentle },
  },
  exit: {
    opacity: 0,
    transition: { duration: MOTION_DURATIONS.fast, ease: MOTION_EASINGS.standard },
  },
};

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATIONS.reveal, ease: MOTION_EASINGS.gentle },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: MOTION_DURATIONS.fast, ease: MOTION_EASINGS.standard },
  },
};

export const fadeDown: Variants = {
  initial: { opacity: 0, y: -16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATIONS.standard, ease: MOTION_EASINGS.gentle },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: MOTION_DURATIONS.fast, ease: MOTION_EASINGS.standard },
  },
};

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -24 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: MOTION_DURATIONS.reveal, ease: MOTION_EASINGS.gentle },
  },
  exit: {
    opacity: 0,
    x: -16,
    transition: { duration: MOTION_DURATIONS.fast, ease: MOTION_EASINGS.standard },
  },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 24 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: MOTION_DURATIONS.reveal, ease: MOTION_EASINGS.gentle },
  },
  exit: {
    opacity: 0,
    x: 16,
    transition: { duration: MOTION_DURATIONS.fast, ease: MOTION_EASINGS.standard },
  },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.94 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: MOTION_DURATIONS.standard, ease: MOTION_EASINGS.gentle },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: MOTION_DURATIONS.fast, ease: MOTION_EASINGS.standard },
  },
};

// ============================================================================
// STAGGER CONTAINERS FOR GRIDS, COMMODITY TICKERS & WORKER CARDS
// ============================================================================

export function staggerContainer(staggerDelay = 0.05, delayChildren = 0.03): Variants {
  return {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1,
      },
    },
  };
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATIONS.reveal, ease: MOTION_EASINGS.gentle },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: MOTION_DURATIONS.fast },
  },
};

// ============================================================================
// MODAL, DRAWER & SHEET TRANSITIONS
// ============================================================================

export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: MOTION_DURATIONS.modal, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: MOTION_DURATIONS.fast, ease: "easeIn" },
  },
};

export const modalDialogVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 16 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: MOTION_DURATIONS.modal, ease: MOTION_EASINGS.gentle },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: MOTION_DURATIONS.fast, ease: "easeIn" },
  },
};

export const bottomSheetVariants: Variants = {
  initial: { y: "100%", opacity: 0.5 },
  animate: {
    y: 0,
    opacity: 1,
    transition: MOTION_EASINGS.drawerSpring,
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: MOTION_DURATIONS.fast, ease: MOTION_EASINGS.standard },
  },
};

export const rightDrawerVariants: Variants = {
  initial: { x: "100%" },
  animate: {
    x: 0,
    transition: MOTION_EASINGS.drawerSpring,
  },
  exit: {
    x: "100%",
    transition: { duration: MOTION_DURATIONS.fast, ease: MOTION_EASINGS.standard },
  },
};

export const dropdownVariants: Variants = {
  initial: { opacity: 0, y: -6, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: MOTION_DURATIONS.fast, ease: MOTION_EASINGS.gentle },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.97,
    transition: { duration: 0.12, ease: "easeIn" },
  },
};

export const tabPaneVariants: Variants = {
  initial: { opacity: 0, y: 8, scale: 0.99 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: MOTION_DURATIONS.standard, ease: MOTION_EASINGS.gentle },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.99,
    transition: { duration: 0.14, ease: "easeIn" },
  },
};

// ============================================================================
// MICRO-INTERACTION FEEDBACK TOKENS
// ============================================================================

export const pressFeedback = {
  scale: 0.97,
  transition: { duration: 0.08, ease: "easeOut" },
};

export const cardHover = {
  y: -4,
  boxShadow: "0 14px 28px -10px rgba(23, 75, 53, 0.12), 0 0 1px 1px rgba(23, 75, 53, 0.08)",
  transition: { duration: 0.22, ease: MOTION_EASINGS.gentle },
};

export const subtleElevation = {
  y: -2,
  boxShadow: "0 10px 25px -8px rgba(20, 83, 45, 0.12)",
  transition: { duration: 0.2, ease: MOTION_EASINGS.gentle },
};

// Error shake animation for auth & invalid form inputs
export const shakeAnimation: Variants = {
  idle: { x: 0 },
  shake: {
    x: [-8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.45, ease: "easeInOut" },
  },
};

// Ambient floating animation for badges and hero service chips
export const floatingAnimation = {
  y: [-4, 4, -4],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// Radiating beacon pulse for live mandi updates & voice recording
export const beaconPulse = {
  scale: [1, 1.35, 1],
  opacity: [0.7, 0, 0.7],
  transition: {
    duration: 1.8,
    repeat: Infinity,
    ease: "easeOut",
  },
};
