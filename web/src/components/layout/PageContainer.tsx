/**
 * PageContainer — max-width prose container with consistent vertical padding.
 * Wraps routed page content. Provides the framer-motion entrance animation
 * per spec §7: fade only (no Y translate to honour the blog's minimal motion).
 *
 * Width target: max-w-[660px] (spec §7 — prose column for Cormorant at 19px).
 */

import { motion, type Transition } from "framer-motion";

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

const pageTransition: Transition = {
  duration: 0.18,
  ease: "easeOut",
};

export function PageContainer({
  children,
  className = "",
  id = "main-content",
}: PageContainerProps) {
  return (
    <motion.main
      id={id}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
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
