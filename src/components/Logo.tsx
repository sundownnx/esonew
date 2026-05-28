import React from 'react';

interface LogoProps {
  className?: string;
  shieldSize?: number;
  withText?: boolean;
}

export default function Logo({ className = '', shieldSize = 44, withText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Absolute high-fidelity vector representation of the Euro Second Opinion shield */}
      <svg
        width={shieldSize}
        height={shieldSize * 1.15}
        viewBox="0 0 100 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md select-none"
      >
        <defs>
          {/* Deep royal forest-green smooth clinical gradient */}
          <linearGradient id="shieldGradient" x1="50" y1="0" x2="50" y2="115" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#005232" />
            <stop offset="100%" stopColor="#003520" />
          </linearGradient>

          {/* Luxurious 3D metallic gold gradient */}
          <linearGradient id="goldGradient" x1="0" y1="30" x2="100" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="40%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#AA7C11" />
          </linearGradient>
        </defs>

        {/* 1. Shield Background in Rich Forest Green */}
        <path
          d="M50 4C75 2 92 12 92 48C92 78 74 96 50 111C26 96 8 78 8 48C8 12 25 2 50 4Z"
          fill="url(#shieldGradient)"
          stroke="#003520"
          strokeWidth="1.5"
        />

        {/* 2. Pristine White Medical Cross in the center/upper area */}
        {/* We place it such that it interacts beautifully with the gold profile */}
        <path
          d="M 40 46 H 60 V 58 H 40 Z"
          fill="#FFFFFF"
        />
        <path
          d="M 46 40 H 54 V 64 H 46 Z"
          fill="#FFFFFF"
        />

        {/* 3. Luxurious Curling Gold Curve / Face Profile Ribbon */}
        {/* Sweeping from the bottom-left up and around, wrapping the left side of the cross */}
        <path
          d="M 23 83 
             C 18 68, 20 42, 30 35 
             C 33 32, 38 34, 38 39 
             C 38 46, 29 55, 30 68 
             C 31 79, 39 84, 46 88 
             C 53 92, 48 98, 41 98 
             C 32 98, 25 93, 23 83 Z"
          fill="url(#goldGradient)"
        />

        <path
          d="M 23 83
             C 24 73, 30 63, 33 55
             C 35 50, 41 53, 39 60
             C 37 68, 29 76, 29 83
             C 29 88, 32 90, 31 93
             C 29 95, 25 92, 23 83 Z"
          fill="#FFFFFF"
          opacity="0.3"
        />

        {/* 4. Golden Stars of Europe (6 stars sweeping gracefully on the right side) */}
        {/* Star 1 */}
        <polygon points="76,28 77.5,31 80.5,31 78,33 79,36 76,34.5 73,36 74,33 71.5,31 74.5,31" fill="url(#goldGradient)" />
        {/* Star 2 */}
        <polygon points="84,38 85.5,41 88.5,41 86,43 87,46 84,44.5 81,46 82,43 79.5,41 82.5,41" fill="url(#goldGradient)" />
        {/* Star 3 */}
        <polygon points="88,50 89.5,53 92.5,53 90,55 91,58 88,56.5 85,58 86,55 83.5,53 86.5,53" fill="url(#goldGradient)" />
        {/* Star 4 */}
        <polygon points="86,63 87.5,66 90.5,66 88,68 89,71 86,69.5 83,71 84,68 81.5,66 84.5,66" fill="url(#goldGradient)" />
        {/* Star 5 */}
        <polygon points="80,75 81.5,78 84.5,78 82,80 83,83 80,81.5 77,83 78,80 75.5,78 78.5,78" fill="url(#goldGradient)" />
        {/* Star 6 */}
        <polygon points="71,85 72.5,88 75.5,88 73,90 74,93 71,91.5 68,93 69,90 66.5,88 69.5,88" fill="url(#goldGradient)" />
      </svg>

      {/* Corporate branding text aligned alongside the shield */}
      {withText && (
        <div className="flex flex-col text-left leading-none font-sans select-none">
          <span className="text-xl font-extrabold tracking-tight text-[#004F2D] uppercase leading-none">
            EURO
          </span>
          <span className="text-sm font-bold tracking-wider text-[#004F2D] uppercase leading-tight">
            SECOND
          </span>
          <span className="text-sm font-bold tracking-widest text-[#004F2D] uppercase leading-none">
            OPINION
          </span>
        </div>
      )}
    </div>
  );
}
