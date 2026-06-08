import React, { useId, useState } from 'react';
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
  const reactId = useId();
  const buttonId = `${reactId}-trigger`;
  const panelId = `${reactId}-panel`;

  return (
    <div
      className={clsx('border border-gray-200 rounded-lg overflow-hidden', className)}
      data-tour={dataTour}
    >
      <button
        id={buttonId}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left flex items-center justify-between transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
        aria-expanded={isOpen}
        aria-controls={panelId}
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
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className="p-4 bg-white border-t border-gray-200"
      >
        {children}
      </div>
    </div>
  );
};
