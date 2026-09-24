// Outlined icon set — consistent 1.75 stroke, currentColor.
type P = { className?: string; size?: number; strokeWidth?: number };

const base = (size = 24, strokeWidth = 1.75) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const TurnLeft = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M9 20V10a4 4 0 0 1 4-4h4" />
    <path d="m11 4-4 4 4 4" />
  </svg>
);

export const TurnRight = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M15 20V10a4 4 0 0 0-4-4H7" />
    <path d="m13 4 4 4-4 4" />
  </svg>
);

export const Pin = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M12 21s7-5.686 7-11a7 7 0 1 0-14 0c0 5.314 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const Layers = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </svg>
);

export const Home = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M4 11.5 12 4l8 7.5" />
    <path d="M6 10v9h12v-9" />
  </svg>
);

export const RouteNodes = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <circle cx="7" cy="18" r="2.5" />
    <circle cx="17" cy="6" r="2.5" />
    <path d="M9 16.2 15 7.8" />
  </svg>
);

export const Doc = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M7 3h7l4 4v14H7Z" />
    <path d="M14 3v4h4" />
    <path d="M9.5 12h5M9.5 15.5h5" />
  </svg>
);

export const Bell = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M6 16V10a6 6 0 0 1 12 0v6l1.5 2H4.5L6 16Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
);

export const Globe = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c2.5 2.4 3.8 5.6 3.8 9s-1.3 6.6-3.8 9c-2.5-2.4-3.8-5.6-3.8-9S9.5 5.4 12 3Z" />
  </svg>
);

export const Warning = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M12 4 21 20H3L12 4Z" />
    <path d="M12 10v4" />
    <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

export const Check = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const Spinner = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
  </svg>
);

export const Camera = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export const CloudUpload = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

export const ChevronRight = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const ChevronDown = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const Clock = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15 15" />
  </svg>
);

export const XIcon = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const WifiOff = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <line x1="2" y1="2" x2="22" y2="22" />
    <path d="M8.5 16.5a5 5 0 0 1 7 0" />
    <path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
    <path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76" />
    <path d="M16.85 11.25a10 10 0 0 1 2.22 1.68" />
    <path d="M5 12.5C6.5 11 8.3 10 10.3 9.6" />
    <circle cx="12" cy="20" r=".5" fill="currentColor" />
  </svg>
);

export const Expand = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);

export const Collapse = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
  </svg>
);

export const ChevronLeft = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const User = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

export const Download = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M12 3v13M7 11l5 5 5-5" />
    <path d="M4 19h16" />
  </svg>
);

export const Truck = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <rect x="1" y="3" width="15" height="13" rx="1" />
    <path d="M16 8h4l3 5v3h-7V8Z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

export const Shield = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M12 3 4 6v6c0 5 3.5 9 8 10.5C17.5 21 21 17 21 12V6l-9-3Z" />
  </svg>
);

export const RefreshCw = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />
  </svg>
);

export const Plus = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const FileText = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M7 3h7l4 4v14H7Z" />
    <path d="M14 3v4h4" />
    <path d="M9.5 11h5M9.5 14.5h5M9.5 18h3" />
  </svg>
);

export const Settings = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

export const Filter = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z" />
  </svg>
);

export const MapPin = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M20 10c0 7-8 13-8 13S4 17 4 10a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const Package = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="m12 3 9 4.5V16.5L12 21l-9-4.5V7.5L12 3Z" />
    <path d="M12 3v18M3 7.5l9 4.5 9-4.5" />
  </svg>
);

export const Menu = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

export const Search = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const Users = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
    <path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M18 14c2.4.5 4 2.6 4 6" />
  </svg>
);

export const BarChart = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M4 20V4" />
    <path d="M4 20h16" />
    <rect x="7" y="12" width="3" height="5" />
    <rect x="12" y="8" width="3" height="9" />
    <rect x="17" y="14" width="3" height="3" />
  </svg>
);

export const Sparkle = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
    <path d="M18 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
  </svg>
);

export const Building = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
    <path d="M14 9h4a2 2 0 0 1 2 2v10" />
    <path d="M2 21h20" />
    <path d="M7 7h3M7 11h3M7 15h3M17 13h0M17 17h0" />
  </svg>
);

export const Broadcast = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <circle cx="12" cy="12" r="2" />
    <path d="M7.5 7.5a6 6 0 0 0 0 9M16.5 16.5a6 6 0 0 0 0-9" />
    <path d="M4.5 4.5a10 10 0 0 0 0 15M19.5 19.5a10 10 0 0 0 0-15" />
  </svg>
);

export const Eye = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOff = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a18.09 18.09 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

export const EditIcon = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
  </svg>
);

export const Lock = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const LogOut = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const Sun = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

export const Moon = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </svg>
);

export const Monitor = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

export const Key = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3" />
  </svg>
);

export const Smartphone = ({ className, size, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <path d="M12 18h.01" />
  </svg>
);
