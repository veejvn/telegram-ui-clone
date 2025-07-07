# Hướng dẫn sử dụng chức năng đăng ký

## Cấu hình Server

### 1. Tạo file .env.local

Tạo file `.env.local` trong thư mục gốc của dự án với nội dung:

```env
# Matrix Server Configuration
NEXT_PUBLIC_MATRIX_BASE_URL="https://matrix.teknix.dev"
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
```

### 2. Khởi động dự án

```bash
npm run dev
```

## Tính năng đăng ký

### Các tính năng chính:

1. **Validation mạnh mẽ:**
   - Username: 3-20 ký tự, chỉ cho phép chữ cái, số và dấu gạch dưới
   - Password: tối thiểu 8 ký tự
   - Xác nhận password phải khớp

2. **Kiểm tra trạng thái server:**
   - Hiển thị trạng thái kết nối với Matrix server
   - Icon trực quan: xanh (online), đỏ (offline), vàng (đang kiểm tra)

3. **Xử lý lỗi chi tiết:**
   - Username đã tồn tại
   - Username không hợp lệ
   - Lỗi kết nối mạng
   - Lỗi server

4. **UX/UI tốt:**
   - Loading states
   - Toast notifications
   - Dark/Light mode support
   - Responsive design

### Quy trình đăng ký:

1. Người dùng truy cập `/register`
2. Nhập thông tin đăng ký
3. Hệ thống validate dữ liệu
4. Gửi request đến Matrix server
5. Nếu thành công:
   - Tự động đăng nhập
   - Lưu token vào localStorage
   - Chuyển hướng đến `/chat`
   - Hiển thị thông báo thành công
6. Nếu thất bại:
   - Hiển thị lỗi cụ thể
   - Cho phép thử lại

### Các lỗi có thể gặp:

- **M_USER_IN_USE**: Username đã được sử dụng
- **M_INVALID_USERNAME**: Username không hợp lệ
- **M_FORBIDDEN**: Server từ chối đăng ký
- **Network Error**: Lỗi kết nối mạng

### Bảo mật:

- Password được mã hóa trước khi gửi
- Token được lưu an toàn trong localStorage
- Validation cả client và server side
- Xử lý lỗi không để lộ thông tin nhạy cảm

## Tùy chỉnh

### Thay đổi server:

Chỉ cần thay đổi `NEXT_PUBLIC_MATRIX_BASE_URL` trong file `.env.local`:

```env
NEXT_PUBLIC_MATRIX_BASE_URL="https://your-matrix-server.com"
```

### Thay đổi validation rules:

Chỉnh sửa file `src/validations/registerSchema.ts`:

```typescript
const registerSchema = Joi.object({
    username: Joi.string()
        .min(3)  // Thay đổi độ dài tối thiểu
        .max(20) // Thay đổi độ dài tối đa
        .pattern(/^[a-zA-Z0-9_]+$/) // Thay đổi pattern
        .required(),
    // ...
});
```

### Thay đổi UI:

- Form styling: `src/components/auth/RegisterForm.tsx`
- Page layout: `src/app/(auth)/register/page.tsx`
- Error messages: `src/constants/error-messages.ts` 