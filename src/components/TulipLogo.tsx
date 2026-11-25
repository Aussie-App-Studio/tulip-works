interface TulipLogoProps {
  className?: string;
  variant?: 'auto' | 'light' | 'dark';
  alt?: string;
}

/**
 * Renders the user's actual Tulip Works logo, seamlessly switching between the
 * crisp white logo (light mode) and deep slate logo (dark mode).
 */
export function TulipLogo({
  className = 'w-11 h-11 rounded-xl',
  variant = 'auto',
  alt = 'Tulip Works logo',
}: TulipLogoProps) {
  if (variant === 'light') {
    return (
      <img
        src="./images/tulip-logo-light.jpg"
        alt={alt}
        className={`object-cover bg-white ${className}`}
      />
    );
  }

  if (variant === 'dark') {
    return (
      <img
        src="./images/tulip-logo-dark.jpg"
        alt={alt}
        className={`object-cover bg-[#242B35] ${className}`}
      />
    );
  }

  return (
    <span className={`relative inline-block overflow-hidden shrink-0 ${className}`}>
      <img
        src="./images/tulip-logo-light.jpg"
        alt={alt}
        className="w-full h-full object-cover bg-white block dark:hidden"
      />
      <img
        src="./images/tulip-logo-dark.jpg"
        alt={alt}
        className="w-full h-full object-cover bg-[#242B35] hidden dark:block"
      />
    </span>
  );
}
