export function mediaDbError(err: { code?: string; message?: string }): string {
  if (err.code === '23505') return 'Tên đã tồn tại trong thư mục này';
  if (err.code === '23503') {
    return 'Thư mục đang có tệp hoặc thư mục con, hãy di chuyển hoặc xoá trước';
  }
  return 'Không thực hiện được thao tác';
}
