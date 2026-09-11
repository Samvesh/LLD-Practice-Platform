interface LogoProps {
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LogoMark = ({ size = 38, className = '' }: { size?: number; className?: string }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      {/* Top Diamond */}
      <path
        d="M19 4L32 10.5L19 17L6 10.5L19 4Z"
        stroke="#D4622C"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#FAF6F0"
      />
      {/* Middle Layer Chevron */}
      <path
        d="M6 16.5L19 23L32 16.5"
        stroke="#D4622C"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bottom Layer Chevron */}
      <path
        d="M6 22.5L19 29L32 22.5"
        stroke="#D4622C"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function Logo({ showTagline = true, size = 'md', className = '' }: LogoProps) {
  const iconSizes = {
    sm: 32,
    md: 40,
    lg: 48,
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const taglineSizes = {
    sm: 'text-[11px]',
    md: 'text-[12px]',
    lg: 'text-sm',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark size={iconSizes[size]} />
      <div className="flex flex-col justify-center">
        <span className={`font-bold text-navy ${textSizes[size]} tracking-tight leading-tight`}>
          LLD Practice
        </span>
        {showTagline && (
          <span className={`text-slate-subtext font-normal ${taglineSizes[size]} leading-tight mt-0.5`}>
            Design. Build. Improve.
          </span>
        )}
      </div>
    </div>
  );
}
