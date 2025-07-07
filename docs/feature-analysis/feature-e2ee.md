# Phân Tích Tính Năng: Mã hóa đầu-cuối & Bảo mật (E2EE & Security)

---

## 1. Mục đích/Tổng quan

- Đảm bảo mọi tin nhắn, file, dữ liệu trao đổi giữa các thành viên trong phòng chat được bảo vệ an toàn, chỉ người nhận mới đọc được (end-to-end encryption - E2EE).
- Bảo vệ tài khoản, thiết bị, quyền riêng tư và dữ liệu người dùng khỏi truy cập trái phép.

---

## 2. Nguyên lý hoạt động

- Khi phòng chat bật E2EE, mọi tin nhắn được mã hóa trên thiết bị gửi, chỉ giải mã trên thiết bị nhận đã xác thực.
- Mỗi thiết bị có khóa mã hóa riêng, người dùng cần xác minh thiết bị để đảm bảo an toàn.
- Hệ thống hỗ trợ backup & khôi phục khóa mã hóa (qua passphrase hoặc file), xác thực thiết bị mới, xác thực hai yếu tố (2FA).
- Quản lý danh sách thiết bị, xác minh hoặc thu hồi quyền truy cập thiết bị.
- Cảnh báo khi có thiết bị chưa xác thực hoặc có dấu hiệu bất thường.

---

## 3. Giao diện người dùng (UI/UX)

- Thông báo "Phòng đã được mã hóa đầu-cuối" khi vào phòng E2EE.
- Tab bảo mật trong cài đặt tài khoản: quản lý thiết bị, xác minh thiết bị, backup/khôi phục khóa mã hóa, đổi passphrase.
- Dialog xác minh thiết bị mới, xác thực phiên, cảnh báo bảo mật.
- Giao diện nhập mã bảo mật, passphrase hoặc tải lên file backup khi khôi phục khóa.

---

## 4. Các chức năng con

- Bật/tắt mã hóa đầu-cuối cho phòng chat.
- Xác minh thiết bị mới, xác thực phiên đăng nhập.
- Backup & khôi phục khóa mã hóa (qua passphrase hoặc file).
- Đổi passphrase bảo mật.
- Quản lý danh sách thiết bị, thu hồi quyền truy cập thiết bị lạ.
- Cảnh báo và xử lý khi có thiết bị chưa xác thực hoặc có nguy cơ rò rỉ khóa.

---

## 5. Liên kết với các thành phần khác

- Kết nối chặt chẽ với tính năng xác thực & quản lý tài khoản (authenticate).
- Tích hợp với hệ thống gửi/nhận tin nhắn, quản lý phòng, thông báo bảo mật.
- Liên quan đến các tính năng khôi phục tài khoản, quản lý thiết bị, quyền riêng tư.

---

## 6. Vị trí mã nguồn

- Logic mã hóa, xác minh thiết bị:
    - `src/components/views/settings/tabs/user/SecurityUserSettingsTab.tsx` – Tab bảo mật tài khoản.
    - `src/components/views/dialogs/VerificationDialog.tsx` – Dialog xác minh thiết bị.
    - `src/components/views/dialogs/KeyBackupDialog.tsx` – Backup/khôi phục khóa mã hóa.
    - `src/crypto/` – Thư mục chứa các module xử lý mã hóa, xác thực thiết bị, backup khóa.
    - `src/components/views/settings/tabs/user/SessionManagerTab.tsx` – Quản lý thiết bị, xác thực phiên.
- Chuỗi giao diện:
    - `src/i18n/strings/vi.json` – Các chuỗi liên quan đến mã hóa, xác minh thiết bị, backup khóa, cảnh báo bảo mật.

---

## 7. Lưu ý/Bảo mật/Quy tắc đặc biệt

- Người dùng nên xác minh tất cả thiết bị của mình để đảm bảo an toàn tuyệt đối.
- Nên thường xuyên backup khóa mã hóa và lưu trữ passphrase ở nơi an toàn.
- Không chia sẻ passphrase, khóa bảo mật cho bất kỳ ai.
- Khi phát hiện thiết bị lạ hoặc cảnh báo bảo mật, nên thu hồi quyền truy cập hoặc đổi passphrase ngay.
- Một số thao tác (bật E2EE, backup/khôi phục khóa) không thể hoàn tác, cần cân nhắc kỹ trước khi thực hiện.

---

**Gợi ý:**

- Khi nghiên cứu, nên bắt đầu từ giao diện bảo mật trong cài đặt tài khoản, sau đó tìm hiểu các dialog xác minh thiết bị, backup/khôi phục khóa và logic mã hóa trong src/crypto/.
- Có thể bổ sung sơ đồ luồng xác minh thiết bị hoặc ảnh chụp màn hình giao diện để minh họa.
- [Xem chi tiết tài liệu](https://drive.google.com/drive/folders/1xodlx8dTJq2qSz5V4V6jhOi9qzVmQmNz?usp=sharing)