import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export default function Tooltip({ children, content, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, actualPosition: position });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const updateCoordinates = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = Math.min(288, window.innerWidth - 24);
    const tooltipHeight = 160;

    // Determine if placing on top will overflow viewport
    const spaceAbove = rect.top;
    let actualPos = position;
    if (position === 'top' && spaceAbove < tooltipHeight + 20) {
      actualPos = 'bottom';
    } else if (position === 'bottom' && window.innerHeight - rect.bottom < tooltipHeight + 20) {
      actualPos = 'top';
    }

    // Horizontal centering with edge clamping
    const centerX = rect.left + rect.width / 2;
    const halfWidth = tooltipWidth / 2;
    const minX = halfWidth + 12;
    const maxX = window.innerWidth - halfWidth - 12;
    const clampedX = Math.max(minX, Math.min(maxX, centerX));

    // Calculate pointer arrow offset relative to the tooltip box
    const tooltipLeft = clampedX - halfWidth;
    const arrowLeft = Math.max(20, Math.min(tooltipWidth - 20, centerX - tooltipLeft));

    let top = 0;
    if (actualPos === 'top') {
      top = rect.top - 8;
    } else {
      top = rect.bottom + 8;
    }

    setCoords({
      top,
      left: clampedX,
      arrowLeft,
      actualPosition: actualPos,
    });
  }, [position]);

  const handleMouseEnter = () => {
    updateCoordinates();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  // Keep coordinates updated on scroll or resize while visible
  useEffect(() => {
    if (!isVisible) return;
    const handleScroll = () => updateCoordinates();
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isVisible, updateCoordinates]);

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-flex items-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        onClick={() => {
          updateCoordinates();
          setIsVisible((prev) => !prev);
        }}
      >
        {children}
      </div>

      {isVisible &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: coords.actualPosition === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
              maxWidth: 'calc(100vw - 24px)',
            }}
            className="z-[9999] pointer-events-none w-72 p-3.5 rounded-2xl bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 shadow-2xl shadow-gray-900/15 dark:shadow-black/70 border border-gray-200 dark:border-gray-800 text-xs transition-all duration-150 animate-in fade-in zoom-in-95"
          >
            {content}

            {/* Pointer arrow with light/dark theme styling and dynamic alignment */}
            <div
              style={{ left: `${coords.arrowLeft ?? 144}px` }}
              className={`absolute w-0 h-0 border-4 -translate-x-1/2 ${
                coords.actualPosition === 'top'
                  ? 'top-full border-t-white dark:border-t-gray-900 border-x-transparent border-b-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]'
                  : 'bottom-full border-b-white dark:border-b-gray-900 border-x-transparent border-t-transparent drop-shadow-[0_-1px_1px_rgba(0,0,0,0.12)]'
              }`}
            />
          </div>,
          document.body
        )}
    </>
  );
}
