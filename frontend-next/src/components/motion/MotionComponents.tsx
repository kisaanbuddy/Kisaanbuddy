'use client';

import React, { useEffect, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  HTMLMotionProps,
} from 'framer-motion';
import {
  fadeIn,
  fadeUp,
  scaleIn,
  staggerContainer,
  staggerItem,
  modalBackdropVariants,
  modalDialogVariants,
  pressFeedback,
  cardHover,
  MOTION_DURATIONS,
  MOTION_EASINGS,
  textStaggerContainer,
  wordReveal,
} from '@/lib/motion';

/**
 * PageTransition:
 * Provides an Apple/Vercel-grade smooth entrance between route changes.
 * Gracefully respects prefers-reduced-motion.
 */
export function PageTransition({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: MOTION_DURATIONS.page,
        ease: MOTION_EASINGS.gentle,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * CinematicWordReveal:
 * Apple-grade headline reveal that splits text into individual words
 * and staggers them with subtle blur deceleration.
 */
export function CinematicWordReveal({
  text,
  className = '',
  highlightWords = [],
  highlightClassName = 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent',
}: {
  text: string;
  className?: string;
  highlightWords?: string[];
  highlightClassName?: string;
}) {
  const prefersReduced = useReducedMotion();
  const words = text.split(' ');

  if (prefersReduced) {
    return <span className={className}>{text}</span>;
  }

  return (
    <motion.span
      key={text}
      variants={textStaggerContainer}
      initial="initial"
      animate="animate"
      className={`inline-block ${className}`}
    >
      {words.map((word, i) => {
        const cleanWord = word.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '');
        const isHighlight = highlightWords.some(
          (hw) => hw.toLowerCase() === cleanWord.toLowerCase()
        );

        return (
          <motion.span
            key={`${word}-${i}`}
            variants={wordReveal}
            className={`inline-block mr-[0.28em] ${
              isHighlight ? highlightClassName : ''
            }`}
          >
            {word}
          </motion.span>
        );
      })}
    </motion.span>
  );
}

/**
 * MotionSection:
 * Reveals full sections as they scroll into view using native passive IntersectionObserver.
 */
interface MotionSectionProps extends HTMLMotionProps<'section'> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function MotionSection({
  children,
  className = '',
  delay = 0,
  ...props
}: MotionSectionProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return (
      <section className={className} {...(props as any)}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: MOTION_DURATIONS.reveal,
        delay,
        ease: MOTION_EASINGS.gentle,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.section>
  );
}

/**
 * StaggerList & StaggerItem:
 * For card grids, recommendations, mandi prices, and worker directories.
 */
export function StaggerList({
  children,
  className = '',
  staggerDelay = 0.05,
  delayChildren = 0.02,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={staggerContainer(staggerDelay, delayChildren)}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-30px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * MotionCard:
 * Premium interactive surface with restrained elevation on hover and tactile press feedback.
 */
export function MotionCard({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return (
      <div onClick={onClick} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={cardHover}
      whileTap={pressFeedback}
      onClick={onClick}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
}

/**
 * MagneticButton / TactileButton:
 * High-precision tactile button with physical spring feedback.
 */
export function TactileButton({
  children,
  className = '',
  onClick,
  disabled = false,
  type = 'button',
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced || disabled) {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={className}
      >
        {children}
      </button>
    );
  }

  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.02 }}
      whileTap={pressFeedback}
      onClick={onClick}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.button>
  );
}

/**
 * ActivePillIndicator:
 * Framer-motion layoutId animated pill for fluid tab & filter transitions.
 */
export function ActivePillIndicator({
  layoutId = 'activeTabPill',
  className = 'absolute inset-0 bg-emerald-800 dark:bg-emerald-700 rounded-xl -z-10 shadow-sm',
}: {
  layoutId?: string;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className} />;
  }

  return (
    <motion.div
      layoutId={layoutId}
      className={className}
      transition={{
        type: 'spring',
        stiffness: 450,
        damping: 32,
      }}
    />
  );
}

/**
 * AnimatedCounter:
 * Animates a numeric metric from an initial value to target with zero frame drops.
 * Strictly displays authentic prop values.
 */
export function AnimatedCounter({
  value,
  duration = 0.8,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (prefersReduced) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = value;
    const startTime = performance.now();
    const durationMs = duration * 1000;

    let frameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Apple-grade cubic ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setDisplayValue(end);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration, prefersReduced]);

  const formatted =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toLocaleString('en-IN');

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/**
 * SkeletonShimmer:
 * Elegant loading placeholder with subtle light shimmer wave.
 */
export function SkeletonShimmer({
  className = 'h-5 w-full rounded-lg',
}: {
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-stone-200/80 dark:bg-stone-800/80 ${className}`}
    >
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent"
      />
    </div>
  );
}

/**
 * ModalWrapper:
 * Standardized dialog entrance with backdrop and accessibility escape listener.
 */
export function ModalWrapper({
  isOpen,
  onClose,
  children,
  className = '',
  maxWidthClass = 'max-w-xl',
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  maxWidthClass?: string;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            variants={modalBackdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-default"
            aria-hidden="true"
          />

          {/* Dialog Container */}
          <motion.div
            variants={modalDialogVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            role="dialog"
            aria-modal="true"
            className={`relative z-10 w-full ${maxWidthClass} rounded-2xl border border-border bg-card shadow-2xl overflow-hidden ${className}`}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * ViewfinderScanner:
 * Laser scanning sweep effect for Crop Disease Leaf Analysis and Satellite diagnostics.
 */
export function ViewfinderScanner({
  isScanning = false,
  className = 'absolute inset-0 pointer-events-none',
}: {
  isScanning: boolean;
  className?: string;
}) {
  if (!isScanning) return null;

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: '-10%' }}
        animate={{ y: '110%' }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: 'easeInOut',
          repeatType: 'reverse',
        }}
        className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_4px_rgba(52,211,153,0.7)]"
      />
    </div>
  );
}

/**
 * AnimatedBadge:
 * Live badge with soft pulsing beacon.
 */
export function AnimatedBadge({
  children,
  className = '',
  dotColor = 'bg-emerald-500',
}: {
  children: React.ReactNode;
  className?: string;
  dotColor?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}
        />
      </span>
      {children}
    </span>
  );
}
