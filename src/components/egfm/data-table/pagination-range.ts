/** Page buttons to show, with "..." gaps once there are too many to list. */
export function getPaginationRange(currentPage: number, totalPages: number, siblingCount = 1): (number | string)[] {
  const totalPageNumbers = siblingCount * 2 + 5;
  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    return [...Array.from({ length: leftItemCount }, (_, i) => i + 1), "...", totalPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    return [1, "...", ...Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1)];
  }

  const middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
  return [1, "...", ...middleRange, "...", totalPages];
}
