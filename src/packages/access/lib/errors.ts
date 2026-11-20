const MESSAGES: Record<string, string> = {
  '23505': 'Mã hoặc tên vai trò đã tồn tại',
  '23503': 'Vai trò đang có tài khoản dùng. Chuyển các tài khoản sang vai trò khác trước',
  '42501': 'Bạn không có quyền thực hiện thao tác này',
  P0001: 'Phải còn ít nhất một quản trị tối cao',
  '23514': 'Vai trò Phụ huynh cần thuộc một gia đình',
};

export function accessErrorMessage(error: { code?: string } | null): string {
  if (error?.code && MESSAGES[error.code]) {
    return MESSAGES[error.code];
  }
  return 'Không lưu được';
}
