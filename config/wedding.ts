/**
 * Chỉnh toàn bộ nội dung thiệp và đường dẫn ảnh tại đây.
 * Ảnh đặt trong public/assets và khai báo đường dẫn bắt đầu bằng /assets/.
 */
export const weddingConfig = {
  couple: {
    groomFullName: 'Phan Đức Mạnh',
    groomShortName: 'Đức Mạnh',
    groomLabel: 'Út Nam',
    brideFullName: 'Nguyễn Trâm Anh',
    brideShortName: 'Trâm Anh',
    brideLabel: 'Trưởng Nữ',
  },
  families: {
    groom: {
      label: 'Nhà trai',
      father: '',
      mother: 'Bà Lê Thị Lý',
      address: 'Tổ 84, Khu 6, Nông Trang, Việt Trì, Phú Thọ',
    },
    bride: {
      label: 'Nhà gái',
      father: 'Ông Nguyễn Tiến Minh',
      mother: 'Bà Phạm Thị Thúy',
      address: 'Ngách 1, ngõ 243 Nguyệt Cư, Nông Trang, Việt Trì, Phú Thọ',
    },
  },
  event: {
    date: '2026-10-24T17:30:00+07:00',
    displayDate: '24 · 10 · 2026',
    weekday: 'Thứ Bảy',
    receptionTime: '16:30',
    ceremonyTime: '17:30',
    lunarDate: '15/09 năm Bính Ngọ âm lịch',
    venue: 'Khu Đông Lạnh',
    address: 'Khu Đông Lạnh, Cao Đại, Minh Phương (Địa chỉ cũ)',
    mapUrl: 'https://maps.google.com/?q=21.325417,105.370583',
    mapEmbedUrl: 'https://maps.google.com/maps?q=21.325417,105.370583&z=15&output=embed',
    calendarUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=L%E1%BB%85+c%C6%B0%E1%BB%9Bi+%C4%90%E1%BB%A9c+M%E1%BA%A1nh+%26+Tr%C3%A2m+Anh&dates=20261024T103000Z%2F20261024T140000Z&location=Khu+%C4%90%C3%B4ng+L%E1%BA%A1nh%2C+Cao+%C4%90%E1%BA%A1i%2C+Minh+Ph%C6%B0%C6%A1ng&details=Tr%C3%A2n+tr%E1%BB%8Dng+k%C3%ADnh+m%E1%BB%9Di+b%E1%BA%A1n+%C4%91%E1%BA%BFn+chung+vui.',
  },
  messages: {
    intro: 'Tình yêu không cần phải hoàn hảo, chỉ cần chân thật và cùng nhau đi qua những ngày bình dị.',
    invitation: 'Trân trọng kính mời bạn đến dự bữa tiệc thân mật, chung vui cùng gia đình và chứng kiến khoảnh khắc chúng mình về chung một nhà.',
    thanks: 'Sự hiện diện của bạn là món quà quý giá nhất trong ngày vui của chúng mình.',
  },
  timeline: [
    { time: '16:00', label: 'Đón khách' },
    { time: '17:00', label: 'Chụp ảnh check-in' },
    { time: '17:30', label: 'Khai tiệc' },
    { time: '21:00', label: 'Kết thúc tiệc' },
  ],
  dressCode: [
    { label: 'Trắng', color: '#ffffff' },
    { label: 'Đen', color: '#15251f' },
    { label: 'Xanh khói', color: '#a9b8c8' },
  ],
  music: {
    src: '/assets/music/wedding-song.mp3',
    startAt: 18,
  },
  assets: {
    hero: '/assets/photos/photo-01.jpg',
    gallery: [
      '/assets/photos/photo-01.jpg',
      '/assets/photos/photo-02.jpg',
      '/assets/photos/photo-03.jpg',
      '/assets/photos/photo-04.jpg',
      '/assets/photos/photo-05.jpg',
      '/assets/photos/photo-06.jpg',
      '/assets/photos/photo-07.jpg',
      '/assets/photos/photo-08.jpg',
      '/assets/photos/photo-09.jpg',
    ],
    giftQr: '/assets/gifts/wedding-gift.jpg',
    dragon: '/assets/ornaments/dragon.webp',
    phoenix: '/assets/ornaments/phoenix.webp',
  },
} as const;
