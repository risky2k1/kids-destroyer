import type { Place } from './types';

export function originLabel(origin: Place['origin'], review: Place['reviewStatus']): string {
  if (review === 'pending') return 'Chờ duyệt';
  return origin === 'community' ? 'Community' : 'Rcmd';
}

export function isApprovedPlace(place: { reviewStatus: Place['reviewStatus'] }): boolean {
  return place.reviewStatus === 'approved';
}
