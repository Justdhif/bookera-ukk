"use client";

import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { ReactNode } from "react";

interface RotateInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  initialRotate?: number;
}

export const RotateIn = ({
  children,
  delay = 0,
  duration = 0.5,
  initialRotate = -10,
  ...props
}: RotateInProps) => {
  const variants: Variants = {
    hidden: { rotate: initialRotate, opacity: 0, scale: 0.9 },
    visible: {
      rotate: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration,
        delay,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      {...props}
    >
      {children}
    </motion.div>
  );
};
