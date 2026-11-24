const MESSAGES: Record<string, string> = {
  '23505': 'Tên này đã có rồi',
  '23514': 'Dữ liệu không hợp lệ',
  '42501': 'Bạn không có quyền làm việc này',
};

/** Postgres error → Vietnamese message for the UI. */
export function dbErrorMessage(error: { code?: string } | null): string {
  return (error?.code && MESSAGES[error.code]) || 'Không lưu được, thử lại nhé';
}
