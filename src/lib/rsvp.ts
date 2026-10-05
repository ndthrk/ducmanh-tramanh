export type RsvpData = {
  requestId: string;
  fullName: string;
  attending: boolean;
  guestCount: number;
  wishes: string;
};

export function validateRsvp(input: unknown): { data: RsvpData; error?: never } | { error: string; data?: never } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: 'Thông tin xác nhận không hợp lệ.' };
  const value = input as Record<string, unknown>;
  if (typeof value.requestId !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value.requestId)) {
    return { error: 'Mã xác nhận không hợp lệ. Vui lòng tải lại trang.' };
  }
  const fullName = typeof value.fullName === 'string' ? value.fullName.trim().replace(/\s+/g, ' ') : '';
  if (!fullName || fullName.length > 100) return { error: 'Vui lòng nhập họ và tên (tối đa 100 ký tự).' };
  if (typeof value.attending !== 'boolean') return { error: 'Vui lòng chọn bạn có tham dự hay không.' };
  if (typeof value.guestCount !== 'number' || !Number.isInteger(value.guestCount) || (value.attending ? value.guestCount < 1 || value.guestCount > 50 : value.guestCount !== 0)) {
    return { error: 'Số người tham dự cần là số nguyên từ 1 đến 50.' };
  }
  if (typeof value.wishes !== 'string' || value.wishes.length > 1000) return { error: 'Lời chúc tối đa 1.000 ký tự.' };
  if (value.website !== undefined && value.website !== '') return { error: 'Không thể gửi xác nhận này.' };
  return { data: { requestId: value.requestId, fullName, attending: value.attending, guestCount: value.guestCount, wishes: value.wishes.trim() } };
}
