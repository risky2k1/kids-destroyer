const MESSAGES: Record<string, string> = {
  '23503': 'Đang được dùng, không xóa được',
  '23505': 'Câu này đã có',
  '23514': 'Dữ liệu không hợp lệ',
};

export const questionErrorMessage = (err: { code?: string } | null | undefined) =>
  (err?.code && MESSAGES[err.code]) || 'Có lỗi, thử lại';
