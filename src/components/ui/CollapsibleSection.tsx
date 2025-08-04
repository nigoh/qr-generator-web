import React, { useState } from 'react';
import clsx from 'clsx';

interface CollapsibleSectionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  'data-tour'?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = false,
  className,
  'data-tour': dataTour,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div 
      className={clsx('border border-gray-200 rounded-lg overflow-hidden', className)}
      data-tour={dataTour}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left flex items-center justify-between transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-800">{title}</span>
        <svg
          className={clsx(
            'w-5 h-5 text-gray-500 transition-transform duration-200',
            isOpen ? 'rotate-180' : 'rotate-0'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      
      {isOpen && (
        <div className="p-4 bg-white border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};
