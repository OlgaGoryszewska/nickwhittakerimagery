"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function Reveal({
  children,
  className = "",
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "ul";
}) {
  const ref = useRef<HTMLDivElement & HTMLUListElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const combinedClassName = `reveal${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`;
  const style = delay ? { transitionDelay: `${delay}ms` } : undefined;

  if (as === "ul") {
    return (
      <ul ref={ref} className={combinedClassName} style={style}>
        {children}
      </ul>
    );
  }

  return (
    <div ref={ref} className={combinedClassName} style={style}>
      {children}
    </div>
  );
}
