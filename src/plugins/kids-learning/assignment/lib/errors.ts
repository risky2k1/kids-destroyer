const MESSAGES: Record<string, string> = {
  '23503': 'Bài đã có lần làm, không xóa được',
  '23505': 'Bài đã nộp',
};

export const assignmentErrorMessage = (err: { code?: string }) =>
  (err.code && MESSAGES[err.code]) || 'Có lỗi, thử lại';
