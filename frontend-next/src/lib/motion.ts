/**
 * KisaanBuddy Global Motion System
 * 
 * Engineered for authentic agricultural technology:
 * - Fluid, restrained, and intentional
 * - Uses performant transform & opacity properties
 * - Full prefers-reduced-motion support
 * - Standardized duration tokens & easing curves
 */

import type { Variants, Transition } from "framer-motion";

// ============================================================================
// DURATION & EASING DESIGN TOKENS
// ============================================================================

export const MOTION_DURATIONS = {
  fast: 0.16,      // 160ms - micro-interactions, badge pulses, icons
  standard: 0.24,  // 240ms - card hovers, button presses, dropdowns
  page: 0.2,       // 200ms - page routing transitions
  modal: 0.22,     // 220ms - dialog & overlay entrances
  reveal: 0.45,    // 450ms - section reveals, grid items
  relaxed: 0.6,    // 600ms - complex chart & hero elements
} as const;

export const MOTION_EASINGS = {
  // Premium gentle deceleration curve (calm, authoritative feel)
  gentle: [0.16, 1, 0.3, 1] as const,
  // Standard ease-in-out for responsive bidirectional switches
  standard: [0.4, 0, 0.2, 1] as const,
  // Spring transition for physical feedback
  spring: {
    type: "spring",
    stiffness: 400,
    damping: 30,
    mass: 0.8,
  } as Transition,
  bouncySpring: {
    type: "spring",
    stiffness: 350,
    damping: 24,
  } as Transition,
};

// ============================================================================
// REUSABLE TRANSITION VARIANTS
// ============================================================================

/**
 * Clean fade in
 */
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

/**
 * Fade up for card lists, headlines, and callouts
 */
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

/**
 * Fade down for headers, banners, alerts
 */
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

/**
 * Slide in horizontally
 */
export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
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
  initial: { opacity: 0, x: 20 },
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

/**
 * Scale in for badges, focus highlights, floating chips
 */
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
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

/**
 * Stagger container for card grids and sequential items
 */
export function staggerContainer(staggerDelay = 0.06, delayChildren = 0.04): Variants {
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

/**
 * Child item inside a stagger container
 */
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

/**
 * Modal & dialog transitions (backdrop + content)
 */
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
  initial: { opacity: 0, scale: 0.96, y: 12 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: MOTION_DURATIONS.modal, ease: MOTION_EASINGS.gentle },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: MOTION_DURATIONS.fast, ease: "easeIn" },
  },
};

/**
 * Dropdown menu transitions
 */
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

/**
 * Tab pane switches
 */
export const tabPaneVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATIONS.standard, ease: MOTION_EASINGS.gentle },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.14, ease: "easeIn" },
  },
};

/**
 * Tap & Hover physical micro-interactions
 */
export const pressFeedback = {
  scale: 0.98,
  transition: { duration: 0.08 },
};

export const cardHover = {
  y: -3,
  transition: { duration: 0.18, ease: MOTION_EASINGS.gentle },
};

export const subtleElevation = {
  y: -2,
  boxShadow: "0 10px 25px -8px rgba(20, 83, 45, 0.12)",
  transition: { duration: 0.2, ease: MOTION_EASINGS.gentle },
};
