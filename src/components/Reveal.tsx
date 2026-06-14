import type { CSSProperties, ElementType, ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Stagger delay in ms. */
  delay?: number;
  className?: string;
  as?: ElementType;
  style?: CSSProperties;
  id?: string;
}

/**
 * Server-friendly wrapper that opts an element into the scroll-reveal system.
 * Renders plain markup; MotionProvider handles the entrance. Content is fully
 * present in the DOM at SSR time.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
  style,
  id,
}: RevealProps) {
  return (
    <Tag
      id={id}
      className={`reveal ${className}`}
      style={{ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
