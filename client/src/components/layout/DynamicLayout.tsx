"use client";

import { useEffect } from 'react';
import { useSidebarStore } from '@/stores/sidebarStore';

export function DynamicLayout() {
  const { isExpanded, isHovered } = useSidebarStore();

  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      const shouldShowExpanded = isExpanded || isHovered;
      mainContent.style.paddingLeft = shouldShowExpanded ? '16rem' : '4rem';
    }
  }, [isExpanded, isHovered]);

  return null;
}