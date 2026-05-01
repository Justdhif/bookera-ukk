"use client";

import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { ReactNode } from "react";

interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  as?: any;
}

export const StaggerContainer = ({
  children,
  staggerDelay = 0.1,
  delayChildren = 0,
  as: Component = motion.div,
  ...props
}: StaggerContainerProps) => {
  const variants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delayChildren,
      },
    },
  };

  return (
    <Component
      initial="hidden"
      animate="visible"
      variants={variants}
      {...props}
    >
      {children}
    </Component>
  );
};
