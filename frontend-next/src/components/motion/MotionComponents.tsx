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
} from '@/lib/motion';

/**
 * PageTransition:
 * Provides a gentle fade/slide entrance when navigating between routes.
 * Gracefully disables if user prefers reduced motion.
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
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
 * MotionSection:
 * Reveals full sections as they scroll into view.
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
      initial={{ opacity: 0, y: 20 }}
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
 * Ideal for card grids, lists of recommendations, mandi prices, workers.
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
 * Premium interactive surface with restrained elevation on hover and press feedback.
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
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedCounter:
 * Animates a numeric metric from an initial value to target.
 * Never invents numbers — strictly animates actual prop value.
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
      // Ease out cubic
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

  const formatted = decimals > 0 
    ? displayValue.toFixed(decimals) 
    : Math.round(displayValue).toLocaleString();

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
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
