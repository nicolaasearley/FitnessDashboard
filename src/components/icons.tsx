import type { SVGProps } from "react";

/* Ultra-light line icons, 24px grid, 1.5 stroke, currentColor. One coherent set. */

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const RunIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="15.5" cy="4.5" r="1.6" />
    <path d="M14 8.5l-3.2 2 1.6 3 .9 5M11.8 10.2 8 12l-1.5 3.2" />
    <path d="M13 13.5l3.4 1.2 1.4 3.3" />
  </Svg>
);

export const StrengthIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 9v6M7 7v10M17 7v10M20 9v6" />
    <path d="M7 12h10" />
  </Svg>
);

export const RideIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="6" cy="17" r="3.2" />
    <circle cx="18" cy="17" r="3.2" />
    <path d="M6 17l4-7h5l-3 7M9.5 7.5H12" />
    <circle cx="14.5" cy="6.4" r="1.2" />
  </Svg>
);

export const CrossIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
  </Svg>
);

export const RecoveryIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 20s-7-4.4-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.6 12 20 12 20Z" />
  </Svg>
);

export const FlameIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3c.7 3-1.8 4.2-1.8 6.6 0 1 .6 1.8 1.4 2.2.3-1 .9-1.7 1.6-2.3 1.4 1.3 2.3 2.8 2.3 4.6a5.5 5.5 0 1 1-11 0c0-3.4 2.6-5.4 4-7.6C9.4 5 11 4 12 3Z" />
  </Svg>
);

export const TrophyIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
    <path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3M10 13.5h4M9 20h6M12 13.5V20" />
  </Svg>
);

export const BoltIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M11 21v-6H7l6-12v6h4l-6 12Z" />
  </Svg>
);

export const ArrowUpRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </Svg>
);

export const PulseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 12h4l2 6 4-12 2 6h6" />
  </Svg>
);

export const MountainIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 19 10 7l4 6 2-3 5 9z" />
  </Svg>
);

export const ClockIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

export const TargetIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none" />
  </Svg>
);

export const ChevronRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 6l6 6-6 6" />
  </Svg>
);

export const ShoeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 9c2 .3 3.4 1 4.6 2l1.9 1.7c.9.8 2 1.3 3.2 1.5l5.2.8c1.6.2 2.6 1 2.9 2.4l.1 1.3H3z" />
    <path d="M3 9v6M7.5 13l1-2.5" />
  </Svg>
);

export const HeartIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 20s-7-4.4-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.6 12 20 12 20Z" />
  </Svg>
);

export const CalendarIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="5.5" width="16" height="15" rx="2.5" />
    <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
  </Svg>
);

export const GridIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="4" width="7" height="7" rx="1.6" />
    <rect x="13" y="4" width="7" height="7" rx="1.6" />
    <rect x="4" y="13" width="7" height="7" rx="1.6" />
    <rect x="13" y="13" width="7" height="7" rx="1.6" />
  </Svg>
);

export const MapPinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21c4-4.5 6.5-7.6 6.5-10.8A6.5 6.5 0 0 0 5.5 10.2C5.5 13.4 8 16.5 12 21Z" />
    <circle cx="12" cy="10" r="2.2" />
  </Svg>
);

export const SparkIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
  </Svg>
);

export const categoryIcon: Record<string, (p: IconProps) => React.ReactElement> = {
  run: RunIcon,
  strength: StrengthIcon,
  ride: RideIcon,
  cross: CrossIcon,
  recovery: RecoveryIcon,
  other: PulseIcon,
};
