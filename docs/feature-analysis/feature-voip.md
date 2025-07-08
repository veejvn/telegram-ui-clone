# Phân Tích Tính Năng: Cuộc gọi & Hội nghị (Voice/Video Calls)

---

## 1. Mục đích/Tổng quan

- Cho phép người dùng thực hiện cuộc gọi thoại, gọi video 1-1 hoặc nhóm, hội nghị trực tuyến ngay trong phòng chat.
- Hỗ trợ chia sẻ màn hình, tham gia phòng video, nâng cao trải nghiệm giao tiếp và làm việc nhóm từ xa.

---

## 2. Nguyên lý hoạt động

- Người dùng có thể bắt đầu cuộc gọi thoại/video từ giao diện phòng chat hoặc phòng nhóm.
- Hệ thống sử dụng giao thức Matrix và tích hợp các dịch vụ như Jitsi, Element Call để thiết lập kết nối peer-to-peer hoặc server relay.
- Khi bắt đầu cuộc gọi, ứng dụng gửi sự kiện tới các thành viên phòng, thiết lập kết nối WebRTC giữa các thiết bị.
- Hỗ trợ chia sẻ màn hình, mời thêm thành viên, quản lý quyền micro/camera.
- Đối với group calls hoặc video rooms, có thể sử dụng server trung gian để tối ưu chất lượng và số lượng người tham gia.

---

## 3. Giao diện người dùng (UI/UX)

- Nút gọi thoại, gọi video, chia sẻ màn hình trong giao diện phòng chat.
- Giao diện cuộc gọi: hiển thị video, avatar, tên người tham gia, trạng thái micro/camera, nút mời thêm người, nút rời cuộc gọi.
- Dialog xác nhận khi bắt đầu hoặc kết thúc cuộc gọi, thông báo khi có cuộc gọi đến.
- Giao diện phòng video (video rooms) cho phép nhiều người tham gia cùng lúc.

---

## 4. Các chức năng con

- Gọi thoại 1-1, gọi video 1-1.
- Gọi nhóm (group calls), phòng video (video rooms).
- Chia sẻ màn hình trong cuộc gọi.
- Mời thêm thành viên vào cuộc gọi.
- Quản lý trạng thái micro, camera, rời cuộc gọi.
- Nhận thông báo khi có cuộc gọi đến, từ chối hoặc trả lời cuộc gọi.

---

## 5. Liên kết với các thành phần khác

- Tích hợp chặt chẽ với hệ thống nhắn tin, phòng chat, quản lý tài khoản.
- Kết nối với các dịch vụ ngoài như Jitsi, Element Call để mở rộng khả năng hội nghị.
- Liên quan đến quyền truy cập micro, camera, thông báo hệ thống.

---

## 6. Vị trí mã nguồn

- Giao diện và logic cuộc gọi:
    - `src/components/views/rooms/RoomView.tsx` – Giao diện phòng chat, nút gọi.
    - `src/components/views/voip/` – Các component quản lý cuộc gọi, video, audio, chia sẻ màn hình.
    - `src/components/views/dialogs/CallViewDialog.tsx` – Dialog cuộc gọi.
    - `src/components/views/rooms/VideoRoomView.tsx` – Giao diện phòng video.
- Tích hợp Jitsi/Element Call:
    - `src/jitsi/` – Tích hợp Jitsi.
    - `src/components/views/elements/ElementCallButton.tsx` – Nút gọi Element Call.
- Cấu hình liên quan:
    - `config.json` – Cấu hình domain Jitsi, Element Call.

---

## 7. Lưu ý/Bảo mật/Quy tắc đặc biệt

- Người dùng cần cấp quyền truy cập micro, camera cho trình duyệt/ứng dụng.
- Quản trị viên phòng có thể giới hạn quyền gọi, chia sẻ màn hình.
- Đối với group calls lớn, nên sử dụng server relay để đảm bảo chất lượng.
- Cẩn trọng khi chia sẻ màn hình, tránh lộ thông tin nhạy cảm.
- Một số dịch vụ hội nghị ngoài (Jitsi, Element Call) có thể có chính sách bảo mật riêng.

---

**Gợi ý:**

- Khi nghiên cứu, nên bắt đầu từ giao diện RoomView và các component trong src/components/views/voip/, sau đó tìm hiểu tích hợp Jitsi/Element Call và cấu hình liên quan.
- Có thể bổ sung sơ đồ luồng thiết lập cuộc gọi hoặc ảnh chụp màn hình giao diện để minh họa.
- [Xem chi tiết tài liệu](https://drive.google.com/drive/folders/1xodlx8dTJq2qSz5V4V6jhOi9qzVmQmNz?usp=sharing)