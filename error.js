// Tạo ra 1 lỗi cụ thể( lỗi đc chỉ định ): Nhận vào trạng thái lỗi và thông báo 
export const createErr = (status, message) => {
  const err = new Error();
  err.status = status;
  err.message = message;
  return err;
}
