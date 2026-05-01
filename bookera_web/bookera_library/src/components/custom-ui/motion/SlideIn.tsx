"use client";

import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { ReactNode } from "react";

interface SlideInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "left" | "right" | "up" | "down";
  distance?: number;
  as?: any;
}

export const SlideIn = ({
  children,
  delay = 0,
  duration = 0.5,
  direction = "left",
  distance = 50,
  as: Component = motion.div,
  ...props
}: SlideInProps) => {
  const getInitialProps = () => {
    switch (direction) {
      case "left":
        return { x: -distance, opacity: 0 };
      case "right":
        return { x: distance, opacity: 0 };
      case "up":
        return { y: distance, opacity: 0 };
      case "down":
        return { y: -distance, opacity: 0 };
      default:
        return { x: -distance, opacity: 0 };
    }
  };

  const variants: Variants = {
    hidden: getInitialProps(),
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        duration,
        delay,
        ease: "easeOut",
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
