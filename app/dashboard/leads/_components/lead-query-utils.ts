type SortQuery = 'newest' | 'oldest' | 'price-desc' | 'price-asc';

export function getRegularSearchFilter(searchQuery: string) {
  if (!searchQuery) return {};
  return {
    OR: [
      { customerName: { contains: searchQuery, mode: 'insensitive' as const } },
      { customerEmail: { contains: searchQuery, mode: 'insensitive' as const } },
      { customerPhone: { contains: searchQuery, mode: 'insensitive' as const } },
      { tour: { title: { contains: searchQuery, mode: 'insensitive' as const } } },
    ],
  };
}

export function getCustomSearchFilter(searchQuery: string) {
  if (!searchQuery) return {};
  return {
    OR: [
      { fullName: { contains: searchQuery, mode: 'insensitive' as const } },
      { email: { contains: searchQuery, mode: 'insensitive' as const } },
      { phone: { contains: searchQuery, mode: 'insensitive' as const } },
      { destinations: { contains: searchQuery, mode: 'insensitive' as const } },
    ],
  };
}

export function getRegularOrderBy(sortQuery: SortQuery) {
  if (sortQuery === 'oldest') return { createdAt: 'asc' as const };
  if (sortQuery === 'price-desc') return { totalPrice: 'desc' as const };
  if (sortQuery === 'price-asc') return { totalPrice: 'asc' as const };
  return { createdAt: 'desc' as const };
}

export function getCustomOrderBy(sortQuery: SortQuery) {
  if (sortQuery === 'oldest') return { createdAt: 'asc' as const };
  return { createdAt: 'desc' as const };
}
