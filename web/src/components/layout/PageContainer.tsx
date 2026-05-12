/**
 * PageContainer — max-width prose container with consistent vertical padding.
 * Wraps routed page content. Provides the framer-motion entrance animation
 * per spec §7: fade only (no Y translate to honour the blog's minimal motion).
 *
 * Respects prefers-reduced-motion: when reduced motion is preferred, animations
 * are disabled and the content renders instantly (spec §7, §17).
 *
 * Width target: max-w-[660px] — reading-column constraint, ~58ch in Geist Sans.
 */

import { motion, type Transition, useReducedMotion } from "framer-motion";

interface PageContainerProps {
  children: React.ReactNode;
  /** Optional extra className on the outer wrapper */
  className?: string;
  /** id for the "Skip to content" skip-link target */
  id?: string;
}

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const pageVariantsReduced = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 1 },
};

const pageTransition: Transition = {
  duration: 0.18,
  ease: "easeOut",
};

const pageTransitionReduced: Transition = {
  duration: 0,
};

export function PageContainer({
  children,
  className = "",
  id = "main-content",
}: PageContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.main
      id={id}
      variants={shouldReduceMotion ? pageVariantsReduced : pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={shouldReduceMotion ? pageTransitionReduced : pageTransition}
      className={[
        "flex-1 min-w-0",
        "px-6 py-10 md:px-10 md:py-12",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Inner prose column — max-width for comfortable reading */}
      <div className="max-w-[660px] mx-auto">{children}</div>
    </motion.main>
  );
}
