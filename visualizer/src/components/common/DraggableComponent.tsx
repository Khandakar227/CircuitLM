"use client";

import React, { useRef, useState, useCallback } from 'react';

interface DraggableComponentProps {
  children: React.ReactNode;
  id: string;
  x: number;
  y: number;
  onMove: (id: string, newX: number, newY: number) => void;
  className?: string;
  isDraggable?: boolean;
}

export const DraggableComponent: React.FC<DraggableComponentProps> = ({
  children,
  id,
  x,
  y,
  onMove,
  className = "",
  isDraggable = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef<SVGGElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isDraggable) return;
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);

    if (elementRef.current) {
      const svgRect = elementRef.current.ownerSVGElement?.getBoundingClientRect();

      if (svgRect) {
        // Convert mouse position to SVG coordinates
        const svgX = (e.clientX - svgRect.left) * (800 / svgRect.width);
        const svgY = (e.clientY - svgRect.top) * (600 / svgRect.height);

        setDragOffset({
          x: svgX - x,
          y: svgY - y
        });
      }
    }
  }, [x, y, isDraggable]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !elementRef.current) return;

    const svgRect = elementRef.current.ownerSVGElement?.getBoundingClientRect();
    if (!svgRect) return;

    // Convert mouse position to SVG coordinates
    const svgX = (e.clientX - svgRect.left) * (800 / svgRect.width);
    const svgY = (e.clientY - svgRect.top) * (600 / svgRect.height);

    const newX = svgX - dragOffset.x;
    const newY = svgY - dragOffset.y;

    // Constrain to canvas bounds
    const constrainedX = Math.max(0, Math.min(newX, 800 - 100)); // Assuming max width of 100 for components
    const constrainedY = Math.max(0, Math.min(newY, 600 - 100)); // Assuming max height of 100 for components

    onMove(id, constrainedX, constrainedY);
  }, [isDragging, dragOffset, id, onMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <g
      ref={elementRef}
      id={id}
      transform={`translate(${x}, ${y})`}
      onMouseDown={handleMouseDown}
      className={`${isDraggable ? 'cursor-move' : 'cursor-default'} select-none ${isDragging ? 'pointer-events-none' : ''} ${className}`}
      style={{
        cursor: isDraggable ? (isDragging ? 'grabbing' : 'grab') : 'default',
        userSelect: 'none'
      }}
    >
      {children}
    </g>
  );
};
