export type PageItem = number | 'ellipsis';

/** Slice one page out of `items`. `page` is 1-based. */
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function getPageCount(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

/**
 * Page buttons to render, collapsing long ranges with ellipses:
 * 1 2 3 4 5 … 12  ·  1 … 5 6 7 … 12  ·  1 … 8 9 10 11 12
 */
export function getPageItems(page: number, pageCount: number): PageItem[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }
  if (page <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', pageCount];
  }
  if (page >= pageCount - 3) {
    return [
      1,
      'ellipsis',
      ...Array.from({ length: 5 }, (_, index) => pageCount - 4 + index),
    ];
  }
  return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', pageCount];
}
