/**
 * Utility functions for rendering star ratings
 */

/**
 * Renders a star rating as a string of filled and empty stars
 * Supports both integer ratings (simple filled/empty) and decimal ratings (with half stars)
 *
 * @param rating - The rating value (0-5), can be integer or decimal
 * @returns A string of star characters (★ for filled, ☆ for empty/half)
 */
export function renderStars(rating: number): string {
  // Validate input bounds (0-5 range)
  if (rating < 0 || rating > 5 || !Number.isFinite(rating)) {
    return '☆☆☆☆☆';
  }

  // Handle decimal ratings with half stars
  if (rating % 1 !== 0) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = '★'.repeat(fullStars);
    if (hasHalfStar) stars += '☆';
    stars += '☆'.repeat(emptyStars);

    return stars;
  }

  // Handle integer ratings (simple version)
  const fullStars = '★'.repeat(rating);
  const emptyStars = '☆'.repeat(5 - rating);
  return fullStars + emptyStars;
}
