 # Phân Tích Tính Năng: Xác thực & Quản lý tài khoản (Authenticate)

---

## 1. Mục đích/Tổng quan

- Cho phép người dùng đăng ký, đăng nhập, xác thực danh tính, quản lý thông tin cá nhân và các phiên đăng nhập trên nhiều thiết bị.
- Đảm bảo an toàn, bảo mật cho tài khoản, hỗ trợ khôi phục tài khoản, xác thực đa yếu tố, và kiểm soát quyền riêng tư.

---

## 2. Nguyên lý hoạt động

- Người dùng có thể đăng ký tài khoản mới hoặc đăng nhập bằng tài khoản Matrix hiện có (qua username, email, số điện thoại, hoặc SSO).
- Sau khi đăng nhập, hệ thống tạo phiên làm việc (session) và lưu trữ thông tin xác thực.
- Hỗ trợ xác thực đa yếu tố (2FA), xác minh thiết bị, xác thực phiên mới, xác thực qua email/SMS/SSO.
- Người dùng có thể quản lý các phiên đăng nhập, đăng xuất khỏi các thiết bị khác, xác minh hoặc thu hồi quyền truy cập.
- Hỗ trợ khôi phục tài khoản qua email, số điện thoại hoặc mã bảo mật.

---

## 3. Giao diện người dùng (UI/UX)

- Trang đăng nhập/đăng ký: Cho phép nhập username, mật khẩu, email, số điện thoại hoặc chọn đăng nhập bằng SSO.
- Cửa sổ xác thực thiết bị/phiên: Hiển thị khi có thiết bị mới đăng nhập hoặc cần xác minh bảo mật.
- Tab quản lý tài khoản/cài đặt: Cho phép đổi mật khẩu, thêm/xóa email/số điện thoại, quản lý các phiên đăng nhập, xác thực thiết bị, xóa tài khoản.
- Thông báo bảo mật: Hiển thị cảnh báo khi có phiên chưa xác thực, đăng nhập bất thường, hoặc yêu cầu xác minh.

---

## 4. Các chức năng con

- Đăng ký tài khoản mới.
- Đăng nhập bằng nhiều phương thức (username, email, SSO, QR code).
- Đăng xuất khỏi phiên hiện tại hoặc tất cả các phiên khác.
- Xác thực hai yếu tố (2FA), xác minh thiết bị, xác thực phiên mới.
- Đổi mật khẩu, khôi phục tài khoản khi quên mật khẩu.
- Thêm/xóa email, số điện thoại liên kết tài khoản.
- Quản lý danh sách thiết bị, xác thực hoặc thu hồi quyền truy cập.
- Xóa tài khoản vĩnh viễn.

---

## 5. Liên kết với các thành phần khác

- Kết nối chặt chẽ với hệ thống mã hóa đầu-cuối (E2EE) để xác thực thiết bị và bảo vệ tin nhắn.
- Tích hợp với hệ thống thông báo, quản lý phiên, bảo mật phòng chat.
- Liên quan đến các tính năng quản lý quyền riêng tư, chặn người dùng, và khôi phục dữ liệu.

---

## 6. Vị trí mã nguồn

- Giao diện xác thực & quản lý tài khoản:
    - `src/components/structures/auth/Registration.tsx` – Đăng ký, đăng nhập, xác thực tài khoản.
    - `src/components/views/settings/tabs/user/AccountUserSettingsTab.tsx` – Quản lý tài khoản, đổi mật khẩu, email, số điện thoại.
    - `src/components/views/settings/tabs/user/SessionManagerTab.tsx` – Quản lý phiên đăng nhập, xác thực thiết bị, đăng xuất từ xa.
    - `src/components/views/dialogs/LogoutDialog.tsx` – Đăng xuất.
- Logic xác thực & session:
    - `src/stores/oidc/OidcClientStore.ts` – Hỗ trợ xác thực OIDC/SSO.
    - `src/Lifecycle.ts` – Quản lý session, đăng nhập, đăng xuất, khôi phục tài khoản.
    - `src/i18n/strings/vi.json` – Các chuỗi giao diện liên quan đến xác thực, đăng nhập, đăng ký, xác minh thiết bị, bảo mật tài khoản.

---

## 7. Lưu ý/Bảo mật/Quy tắc đặc biệt

- Luôn sử dụng mật khẩu mạnh, bảo vệ thông tin xác thực cá nhân.
- Nên xác thực tất cả các thiết bị và đăng xuất khỏi các phiên không nhận ra để đảm bảo an toàn.
- Khi xóa tài khoản, dữ liệu sẽ bị mất vĩnh viễn và không thể khôi phục.
- Cẩn trọng khi chia sẻ email/số điện thoại liên kết với tài khoản.
- Hệ thống hỗ trợ xác thực đa yếu tố và xác minh thiết bị để tăng cường bảo mật.

---

**Gợi ý:**

- Khi nghiên cứu hoặc phát triển tính năng này, nên bắt đầu từ các component giao diện đăng nhập/đăng ký và quản lý tài khoản, sau đó tìm hiểu logic session và xác thực thiết bị.
- Có thể bổ sung sơ đồ luồng xác thực hoặc ảnh chụp màn hình giao diện để minh họa rõ hơn.
- [Xem chi tiết tài liệu](https://drive.google.com/drive/folders/1xodlx8dTJq2qSz5V4V6jhOi9qzVmQmNz?usp=sharing)
