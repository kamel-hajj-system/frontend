import React, { useMemo } from 'react';
import { Table, Grid } from 'antd';

const { useBreakpoint } = Grid;

/**
 * Shared responsive Table wrapper:
 * - Mobile: horizontal scroll enabled automatically
 * - Desktop: normal table
 * - Uses `scroll.x = 'max-content'` by default to prevent squishing columns
 */
export function ResponsiveTable({
  scroll,
  size,
  sticky,
  pagination,
  className,
  ...props
}) {
  const screens = useBreakpoint();
  const isMobile = !(screens.md ?? true);

  const resolvedScroll = useMemo(() => {
    if (scroll) return scroll;
    return { x: 'max-content' };
  }, [scroll]);

  const resolvedSize = size ?? (isMobile ? 'small' : 'middle');
  const resolvedSticky = sticky ?? true;
  const resolvedPagination = pagination ?? false;

  return (
    <div className={className ? `kamel-table-wrap ${className}` : 'kamel-table-wrap'}>
      <Table
        {...props}
        size={resolvedSize}
        sticky={resolvedSticky}
        scroll={resolvedScroll}
        pagination={resolvedPagination}
      />
    </div>
  );
}

