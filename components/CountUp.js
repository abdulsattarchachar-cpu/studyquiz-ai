"use client";

import { useEffect, useState } from "react";
import { animate } from "framer-motion";

export default function CountUp({ value, duration = 0.8, suffix = "" }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, duration]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}
