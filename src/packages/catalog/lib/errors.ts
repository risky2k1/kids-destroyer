const MESSAGES: Record<string, string> = {
  '23503': 'Đang được dùng, không xóa được',
  '23505': 'Tên đã tồn tại',
};

export const catalogErrorMessage = (err: { code?: string }) =>
  (err.code && MESSAGES[err.code]) || 'Có lỗi, thử lại';
