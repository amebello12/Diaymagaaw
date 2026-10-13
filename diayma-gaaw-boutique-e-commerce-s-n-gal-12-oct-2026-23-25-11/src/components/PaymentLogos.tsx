import React from 'react';

interface PaymentLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Official Authentic Wave Senegal Logo
 */
export const WaveLogo: React.FC<PaymentLogoProps & { showText?: boolean }> = ({ 
  className = '', 
  size = 'md',
  showText = true 
}) => {
  const heightClass = size === 'sm' ? 'h-5' : size === 'lg' ? 'h-9' : 'h-7';
  return (
    <div className={`inline-flex items-center gap-1.5 bg-[#00C2FF] text-white px-2.5 py-1 rounded-xl shadow-xs font-sans select-none ${className}`}>
      {/* Wave Iconic Penguin / Waveform Mark */}
      <svg className={`${heightClass} w-auto aspect-square`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="24" fill="#00C2FF" />
        {/* Penguin shape in authentic Wave style */}
        <path
          d="M24 8C17.37 8 12 13.37 12 20C12 24.2 14.15 27.9 17.43 30.08C17.06 31.33 16.31 33.72 14.5 35.5C18.2 35.5 21.5 33.8 23.2 31.9C23.46 31.95 23.73 32 24 32C30.63 32 36 26.63 36 20C36 13.37 30.63 8 24 8Z"
          fill="white"
        />
        <circle cx="20.5" cy="18.5" r="2.5" fill="#1C274C" />
        <path d="M26 21L31 23L26 25V21Z" fill="#FFA500" />
      </svg>
      {showText && (
        <span className="font-black tracking-tight text-white font-sans text-xs sm:text-sm">
          wave
        </span>
      )}
    </div>
  );
};

/**
 * Official Authentic Orange Money Logo
 */
export const OrangeMoneyLogo: React.FC<PaymentLogoProps & { showText?: boolean }> = ({ 
  className = '', 
  size = 'md',
  showText = true 
}) => {
  const heightClass = size === 'sm' ? 'h-5' : size === 'lg' ? 'h-9' : 'h-7';
  return (
    <div className={`inline-flex items-center gap-1.5 bg-[#FF7900] text-white px-2.5 py-1 rounded-xl shadow-xs font-sans select-none ${className}`}>
      <svg className={`${heightClass} w-auto aspect-square`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="8" fill="#FF7900" />
        {/* Orange Money distinctive OM concentric shapes */}
        <circle cx="24" cy="24" r="14" stroke="white" strokeWidth="4" fill="none" />
        <circle cx="24" cy="24" r="7" fill="white" />
        <rect x="22" y="6" width="4" height="6" fill="white" />
        <rect x="22" y="36" width="4" height="6" fill="white" />
      </svg>
      {showText && (
        <div className="flex flex-col leading-none text-left">
          <span className="font-black text-[10px] sm:text-xs text-white uppercase tracking-wider">orange</span>
          <span className="font-extrabold text-[9px] sm:text-[11px] text-gray-900 bg-white px-1 rounded-xs uppercase tracking-tight">money</span>
        </div>
      )}
    </div>
  );
};

/**
 * Official Authentic Free Money Logo
 */
export const FreeMoneyLogo: React.FC<PaymentLogoProps & { showText?: boolean }> = ({ 
  className = '', 
  size = 'md',
  showText = true 
}) => {
  const heightClass = size === 'sm' ? 'h-5' : size === 'lg' ? 'h-9' : 'h-7';
  return (
    <div className={`inline-flex items-center gap-1.5 bg-[#CC0000] text-white px-2.5 py-1 rounded-xl shadow-xs font-sans select-none ${className}`}>
      <svg className={`${heightClass} w-auto aspect-square`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="8" fill="#CC0000" />
        <text
          x="24"
          y="31"
          textAnchor="middle"
          fill="white"
          fontFamily="sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="24"
        >
          free
        </text>
      </svg>
      {showText && (
        <div className="flex flex-col leading-none text-left">
          <span className="font-black text-[11px] sm:text-xs text-white italic tracking-tight">free</span>
          <span className="font-extrabold text-[8px] sm:text-[10px] text-yellow-300 uppercase tracking-widest">MONEY</span>
        </div>
      )}
    </div>
  );
};

/**
 * Cash on Delivery Logo (Espèces à la livraison)
 */
export const CashOnDeliveryLogo: React.FC<PaymentLogoProps & { showText?: boolean }> = ({
  className = '',
  size = 'md',
  showText = true
}) => {
  const heightClass = size === 'sm' ? 'h-5' : size === 'lg' ? 'h-9' : 'h-7';
  return (
    <div className={`inline-flex items-center gap-1.5 bg-emerald-700 text-white px-2.5 py-1 rounded-xl shadow-xs font-sans select-none ${className}`}>
      <svg className={`${heightClass} w-auto aspect-square`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="8" fill="#047857" />
        <rect x="10" y="14" width="28" height="20" rx="3" stroke="white" strokeWidth="2.5" fill="none" />
        <circle cx="24" cy="24" r="5" stroke="white" strokeWidth="2.5" fill="none" />
        <circle cx="16" cy="24" r="1.5" fill="white" />
        <circle cx="32" cy="24" r="1.5" fill="white" />
      </svg>
      {showText && (
        <div className="flex flex-col leading-none text-left">
          <span className="font-extrabold text-[10px] sm:text-xs text-white">À la livraison</span>
          <span className="text-[8px] sm:text-[9px] text-emerald-200 uppercase font-medium">Espèces / Cash</span>
        </div>
      )}
    </div>
  );
};

/**
 * Grouped official payment badges bar
 */
export const PaymentMethodsGroup: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'sm',
  className = ''
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <WaveLogo size={size} />
      <OrangeMoneyLogo size={size} />
      <FreeMoneyLogo size={size} />
      <CashOnDeliveryLogo size={size} />
    </div>
  );
};
