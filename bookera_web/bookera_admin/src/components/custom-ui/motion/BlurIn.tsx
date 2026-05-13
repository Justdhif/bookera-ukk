"use client";

import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { ReactNode } from "react";

interface BlurInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  blurAmount?: string;
}

export const BlurIn = ({
  children,
  delay = 0,
  duration = 0.8,
  blurAmount = "10px",
  ...props
}: BlurInProps) => {
  const variants: Variants = {
    hidden: { filter: `blur(${blurAmount})`, opacity: 0 },
    visible: {
      filter: "blur(0px)",
      opacity: 1,
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
