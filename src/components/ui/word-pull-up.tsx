"use client";

import { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";

interface WordPullUpProps {
  words: string;
  delayMultiple?: number;
  wrapperFramerProps?: Variants;
  framerProps?: Variants;
  className?: string;
  once?: boolean;
}

export default function WordPullUp({
  words,
  wrapperFramerProps = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  },
  framerProps = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  },
  className,
  once = false,
}: WordPullUpProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inViewResult = useInView(ref, { once, margin: "-50px" });

  return (
    <motion.p
      ref={ref}
      variants={wrapperFramerProps}
      initial="hidden"
      animate={inViewResult ? "show" : "hidden"}
      className={className}
    >
      {words.split(" ").map((word, i) => (
        <motion.span
          key={i}
          variants={framerProps}
          style={{ display: "inline-block", paddingRight: "8px" }}
        >
          {word === "" ? <span>&nbsp;</span> : word}
        </motion.span>
      ))}
    </motion.p>
  );
}
