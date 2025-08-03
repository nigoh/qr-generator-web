import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  maxWidth = '2xl',
  padding = true,
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-none',
  };

  const paddingClasses = padding ? 'px-4 sm:px-6 lg:px-8' : '';

  return (
    <main
      className={`
        ${maxWidthClasses[maxWidth]}
        mx-auto
        ${paddingClasses}
        ${className}
      `}
    >
      {children}
    </main>
  );
};
