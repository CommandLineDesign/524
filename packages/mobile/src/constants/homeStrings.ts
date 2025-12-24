// HomeScreen localized strings for future i18n support
export const homeStrings = {
  bookingLabel: {
    withBooking: (userName: string, daysUntilBooking: number) =>
      `${userName}님의 예약이 ${daysUntilBooking}일 남았어요. 탭하여 예약 상세 보기`,
    withoutBooking: (userName: string) => `${userName}님, 예약이 없습니다`,
  },
  notifications: {
    title: 'Notifications',
    label: 'Notifications',
    hint: 'View your notifications',
    comingSoon: 'Notifications feature coming soon!',
  },
  buttons: {
    bookService: '예약 시작하기',
    bookServiceLabel: 'Book a service',
  },
  carousels: {
    myBookings: '내 예약',
    bestReviews: '우리 동네 베스트 리뷰',
    bestArtists: '우리 동네 베스트 아티스트',
  },
} as const;
