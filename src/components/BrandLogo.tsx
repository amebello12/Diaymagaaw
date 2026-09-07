import React from 'react';
import diaymaLogo from '../assets/images/diayma_gaaw_logo_1787611714084.jpg';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'symbol' | 'badge';
  className?: string;
  showSlogan?: boolean;
  isDark?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
  showSlogan = true,
  isDark = false
}) => {
  // Height presets for the official logo image
  const sizeClasses = {
    sm: 'h-10 sm:h-12',
    md: 'h-12 sm:h-14',
    lg: 'h-16 sm:h-20',
    xl: 'h-20 sm:h-28'
  };

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className="relative overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 p-0.5">
          <img
            src={diaymaLogo}
            alt="Diayma Gaaw - Vends-moi vite !"
            referrerPolicy="no-referrer"
            className="h-9 w-auto object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <div className="relative flex items-center">
        <img
          src={diaymaLogo}
          alt="Diayma Gaaw - Vends-Moi Vite !"
          referrerPolicy="no-referrer"
          className={`${sizeClasses[size]} w-auto object-contain rounded-lg transition-transform duration-300 group-hover:scale-105`}
        />
      </div>
    </div>
  );
};
