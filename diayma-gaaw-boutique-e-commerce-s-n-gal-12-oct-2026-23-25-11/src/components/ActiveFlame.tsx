import React from 'react';

interface ActiveFlameProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showEmbers?: boolean;
  className?: string;
  glow?: boolean;
}

export const ActiveFlame: React.FC<ActiveFlameProps> = ({
  size = 'sm',
  showEmbers = true,
  className = '',
  glow = true
}) => {
  // Dimensions map
  const sizeMap = {
    xs: { w: 16, h: 16, container: 'w-4 h-4', embers: false },
    sm: { w: 20, h: 20, container: 'w-5 h-5', embers: true },
    md: { w: 28, h: 28, container: 'w-7 h-7', embers: true },
    lg: { w: 44, h: 44, container: 'w-11 h-11', embers: true },
    xl: { w: 64, h: 64, container: 'w-16 h-16', embers: true }
  };

  const currentSize = sizeMap[size];
  const displayEmbers = showEmbers && currentSize.embers;
  const uniqueId = React.useId().replace(/:/g, '_');

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${currentSize.container} ${className}`}>
      
      {/* Background radial fire glow */}
      {glow && (
        <div 
          className="absolute inset-0 -m-1 rounded-full bg-gradient-to-t from-red-600/50 via-amber-500/40 to-yellow-400/20 blur-xs pointer-events-none animate-fire-halo"
          aria-hidden="true"
        />
      )}

      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 overflow-visible"
        aria-hidden="true"
      >
        <defs>
          {/* Outer fire gradient: Crimson to fiery red-orange */}
          <linearGradient id={`fire-outer-${uniqueId}`} x1="12" y1="22" x2="12" y2="2" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#991B1B" />
            <stop offset="30%" stopColor="#DC2626" />
            <stop offset="70%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>

          {/* Inner flame gradient: Warm orange to intense amber */}
          <linearGradient id={`fire-inner-${uniqueId}`} x1="12" y1="20" x2="12" y2="6" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="45%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>

          {/* Core flame gradient: Bright gold to white heat */}
          <linearGradient id={`fire-core-${uniqueId}`} x1="12" y1="19" x2="12" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="60%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>

          {/* Filter for subtle ember bloom */}
          <filter id={`fire-blur-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* LAYER 1: Outer Dancing Flame Body */}
        <path
          d="M12 2C12 2 13.6 5.2 12.3 7.8C11.1 9.2 9.4 10.3 9.4 12.8C9.4 16.5 12.2 19.8 15.5 19.8C18.6 19.8 21 16.8 21 13.5C21 9.8 18.5 7.4 18.5 7.4C18.5 7.4 19.6 9.8 19 11.8C18.2 10.2 16.8 8.8 16.8 6.5C16.8 3.8 14.2 2 12 2Z"
          fill={`url(#fire-outer-${uniqueId})`}
          className="animate-fire-outer"
          filter={`url(#fire-blur-${uniqueId})`}
        />

        {/* Alternative realistic base flare */}
        <path
          d="M8.5 14.5C8.5 12.8 9.5 11.5 10.5 10C11.5 8.5 11 6.5 11 6.5C11 6.5 13.5 9 14 11.5C14.5 13.8 13.5 15.5 13.5 15.5C13.5 15.5 14.5 14 15.5 14C16.8 14 17.5 15.2 17.5 16.5C17.5 19 15 21.5 12 21.5C8.8 21.5 6.5 18.8 6.5 15.5C6.5 14.2 7 13 7.8 12C7.5 13.2 8.5 14.5 8.5 14.5Z"
          fill={`url(#fire-outer-${uniqueId})`}
          className="animate-fire-outer"
          opacity="0.9"
        />

        {/* LAYER 2: Middle Flickering Fire Tongue */}
        <path
          d="M12 7C12 7 13.2 9.5 12 11.5C11 12.8 10 13.8 10 15.5C10 17.8 11.8 19.5 13.8 19.5C15.8 19.5 17 17.8 17 15.8C17 13.5 15.2 11.8 15.2 11.8C15.2 11.8 16 13.2 15.5 14.5C15 13.5 14 12.5 14 10.5C14 8.5 12 7 12 7Z"
          fill={`url(#fire-inner-${uniqueId})`}
          className="animate-fire-inner"
        />

        {/* LAYER 3: Core Heart of Fire (Hot yellow & white core) */}
        <path
          d="M12 12C12 12 12.8 13.5 12 14.8C11.5 15.5 11 16.2 11 17.2C11 18.5 12 19.5 13 19.5C14 19.5 15 18.5 15 17.2C15 16 14.2 15 14.2 15C14.2 15 14.6 15.8 14.3 16.5C14 15.8 13.2 15 13.2 14C13.2 12.8 12 12 12 12Z"
          fill={`url(#fire-core-${uniqueId})`}
          className="animate-fire-core"
        />

        {/* Glowing Fire Base Dot */}
        <ellipse
          cx="12.5"
          cy="18"
          rx="2.2"
          ry="1.4"
          fill="#FFFBEB"
          className="animate-fire-core"
          opacity="0.9"
        />

        {/* LAYER 4: Rising Fire Sparks & Embers */}
        {displayEmbers && (
          <g>
            {/* Spark 1: center-left rising */}
            <circle
              cx="11"
              cy="7"
              r="0.85"
              fill="#FDE047"
              className="animate-ember-1"
            />
            {/* Spark 2: center-right rising */}
            <circle
              cx="15"
              cy="9"
              r="0.75"
              fill="#F97316"
              className="animate-ember-2"
            />
            {/* Spark 3: top tip spark */}
            <circle
              cx="13"
              cy="4"
              r="0.65"
              fill="#FEF08A"
              className="animate-ember-3"
            />
          </g>
        )}
      </svg>

    </div>
  );
};
