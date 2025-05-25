# Phân Tích Tính Năng: Nhắn tin & Phòng chat

---

## 1. Mục đích/Tổng quan

- Cho phép người dùng gửi, nhận tin nhắn văn bản, hình ảnh, file, emoji, sticker, tin nhắn thoại trong các phòng chat.
- Hỗ trợ tạo, tham gia, quản lý nhiều phòng chat (công khai, riêng tư, threads).
- Đem lại trải nghiệm giao tiếp tức thời, tiện lợi, bảo mật cho cá nhân, nhóm và cộng đồng.

---

## 2. Nguyên lý hoạt động

- Người dùng có thể tạo phòng mới hoặc tham gia phòng có sẵn (qua link, tìm kiếm, mời).
- Tin nhắn được gửi/nhận qua giao thức Matrix, đồng bộ thời gian thực giữa các thiết bị.
- Hỗ trợ các loại tin nhắn: văn bản, hình ảnh, file, emoji, sticker, tin nhắn thoại, reactions, trả lời, trích dẫn, chỉnh sửa, xóa.
- Hỗ trợ threads (chủ đề con), ghim tin nhắn, tìm kiếm, chia sẻ liên kết phòng.
- Tin nhắn có thể được mã hóa đầu-cuối nếu phòng bật E2EE.

---

## 3. Giao diện người dùng (UI/UX)

- Danh sách phòng chat ở sidebar, có thể tìm kiếm, ghim, sắp xếp.
- Giao diện phòng chat: khung soạn thảo (WYSIWYG, markdown, code block), khung hiển thị tin nhắn, nút gửi file, emoji, sticker, reactions, trả lời, chỉnh sửa, xóa.
- Hỗ trợ xem trước file, hình ảnh, phát audio/video trực tiếp trong phòng.
- Tính năng threads hiển thị dạng cây hoặc tab riêng.
- Tìm kiếm tin nhắn, ghim, chia sẻ liên kết phòng qua menu phòng.

---

## 4. Các chức năng con

- Gửi/nhận tin nhắn văn bản, hình ảnh, file, emoji, sticker, tin nhắn thoại.
- Chỉnh sửa, xóa, trả lời, trích dẫn, reactions cho tin nhắn.
- Tạo, tham gia, rời khỏi phòng chat (công khai, riêng tư, protected).
- Tạo threads, ghim tin nhắn, tìm kiếm tin nhắn trong phòng.
- Chia sẻ liên kết phòng, mời thành viên, quản lý quyền truy cập.

---

## 5. Liên kết với các thành phần khác

- Kết nối với hệ thống mã hóa đầu-cuối (E2EE) để bảo mật tin nhắn.
- Tích hợp với tính năng thông báo, quản lý tài khoản, Spaces, Widget.
- Liên quan đến các tính năng gọi thoại/video, chia sẻ file, quản lý quyền phòng.

---

## 6. Vị trí mã nguồn

- Giao diện phòng chat:
    - `src/components/views/rooms/RoomView.tsx` – Giao diện chính của phòng chat.
    - `src/components/views/messages/` – Các component hiển thị, soạn thảo, gửi tin nhắn.
    - `src/components/views/rooms/MessageComposer.tsx` – Khung soạn thảo tin nhắn.
    - `src/components/views/rooms/ThreadView.tsx` – Giao diện threads.
- Logic gửi/nhận tin nhắn:
    - `src/dispatcher/` – Xử lý các hành động gửi/nhận, chỉnh sửa, xóa tin nhắn.
    - `src/client/` – Kết nối và đồng bộ với server Matrix.
- Tìm kiếm, ghim, chia sẻ phòng:
    - `src/components/views/rooms/RoomHeader.tsx`, `src/components/views/dialogs/ShareDialog.tsx`

---

## 7. Lưu ý/Bảo mật/Quy tắc đặc biệt

- Tin nhắn trong phòng có thể được mã hóa đầu-cuối, chỉ các thiết bị đã xác thực mới đọc được.
- Quản trị viên phòng có thể giới hạn quyền gửi tin nhắn, xóa, chỉnh sửa, mời thành viên.
- Cần cẩn trọng khi chia sẻ file, link, thông tin nhạy cảm trong phòng công khai.
- Tính năng threads giúp tổ chức thảo luận theo chủ đề, tránh loãng nội dung.

---

**Gợi ý:**

- Khi nghiên cứu, nên bắt đầu từ giao diện RoomView và MessageComposer, sau đó tìm hiểu các component hiển thị tin nhắn, logic gửi/nhận và đồng bộ với server.
- Có thể bổ sung sơ đồ luồng gửi/nhận tin nhắn hoặc ảnh chụp màn hình giao diện để minh họa.
- [Xem chi tiết tài liệu](https://drive.google.com/drive/folders/1xodlx8dTJq2qSz5V4V6jhOi9qzVmQmNz?usp=sharing)