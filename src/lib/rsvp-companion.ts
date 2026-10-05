export function getCompanionState(attending: boolean | null, guestCount: number, sending: boolean) {
  if (sending) return { mood: 'sending', caption: 'Đang gửi lời hẹn…' };
  if (attending === false) return { mood: 'love', caption: '♡ ❤︎ ♡' };
  if (attending === null) return { mood: 'curious', caption: 'Chờ lời hẹn của bạn' };
  if (guestCount >= 3) return { mood: 'excited', caption: 'Càng đông, càng vui!' };
  if (guestCount === 2) return { mood: 'paired', caption: 'Đi cùng nhau, vui gấp đôi!' };
  return { mood: 'happy', caption: 'Có bạn là vui rồi!' };
}
