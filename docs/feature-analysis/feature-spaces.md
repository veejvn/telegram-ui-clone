# Phân Tích Tính Năng: Spaces, Communities & Quản lý phòng

---

## 1. Mục đích/Tổng quan

- **Spaces** là tính năng cho phép tổ chức các phòng chat (rooms) thành nhóm/phân loại, giúp người dùng quản lý, truy cập và phân quyền các phòng một cách khoa học.
- Spaces tương tự như "community" hoặc "folder", hỗ trợ cấu trúc cây (có thể lồng nhau).
- Tính năng này giúp người dùng dễ dàng tìm kiếm, phân loại, quản lý các phòng chat và thành viên trong tổ chức hoặc cộng đồng lớn.

---

## 2. Nguyên lý hoạt động

- Mỗi Space là một loại phòng đặc biệt trong Matrix, có thể chứa nhiều phòng con (rooms) và cả các Space con (subspaces).
- Người dùng có thể tạo, tham gia, rời khỏi, mời người khác vào Space.
- Khi chọn một Space, chỉ các phòng thuộc Space đó sẽ được hiển thị ở sidebar.
- Có thể thêm/xóa phòng vào Space, sắp xếp thứ tự phòng, phân quyền truy cập (restricted join rule).
- Spaces hỗ trợ tìm kiếm, lọc, sắp xếp phòng, và có các MetaSpace đặc biệt như Home, People, Favourites, Orphans.

---

## 3. Giao diện người dùng (UI/UX)

- **Sidebar (SpacePanel):** Hiển thị danh sách Spaces, cho phép chuyển đổi, tạo mới, quản lý Space.
- **Dialog quản lý quyền truy cập:** Cho phép cấu hình quyền truy cập phòng dựa trên Space.
- **Cài đặt phòng:** Có thể thêm/xóa phòng vào Space, thiết lập quyền truy cập, mô tả, avatar phòng.
- **Tìm kiếm:** Hỗ trợ tìm kiếm phòng, Space, public rooms.
- **Vị trí:** Thanh bên trái (sidebar) của ứng dụng Element Web.

---

## 4. Các chức năng con

- Tạo mới Space, chỉnh sửa thông tin Space (tên, mô tả, avatar).
- Thêm/xóa phòng vào Space, thêm subspace.
- Mời thành viên vào Space, phân quyền quản trị viên/thành viên.
- Thiết lập quyền truy cập phòng (restricted join rule).
- Tìm kiếm, lọc, sắp xếp phòng trong Space.
- Rời khỏi hoặc xóa Space.
- Quản lý MetaSpaces (Home, People, Favourites, Orphans).

---

## 5. Liên kết với các thành phần khác

- Kết nối chặt chẽ với hệ thống phòng chat (rooms) và quyền truy cập phòng.
- Tích hợp với hệ thống phân quyền, quản lý thành viên.
- Tương tác với các tính năng tìm kiếm, thông báo, và giao diện sidebar.

---

## 6. Vị trí mã nguồn

- **Logic quản lý Spaces:**
    - `src/stores/spaces/SpaceStore.ts`
        - Class `SpaceStoreClass`: quản lý cây Space, thêm/xóa phòng, kiểm tra phòng thuộc Space, quản lý trạng thái, sự kiện.
        - Các hàm tiêu biểu: `addRoomToSpace`, `getChildSpaces`, `getChildRooms`, `isRoomInSpace`, `traverseSpace`, `rebuildSpaceHierarchy`.
- **Giao diện người dùng:**
    - `src/components/views/spaces/SpacePanel.tsx`: Hiển thị danh sách Spaces ở sidebar.
    - `src/components/views/dialogs/ManageRestrictedJoinRuleDialog.tsx`: Dialog quản lý quyền truy cập phòng theo Space.
    - `src/components/views/settings/JoinRuleSettings.tsx`: Cấu hình quyền truy cập phòng.
    - `src/components/views/dialogs/spotlight/SpotlightDialog.tsx`: Tìm kiếm phòng, Space.
- **Các file liên quan khác:**
    - `src/components/views/rooms/`, `src/components/views/settings/`, `src/stores/`.

---

## 7. Lưu ý/Bảo mật/Quy tắc đặc biệt

- Quyền truy cập phòng có thể bị giới hạn bởi Space (restricted join rule), cần phân quyền hợp lý khi thêm thành viên/phòng.
- Khi xóa Space, các phòng con không bị xóa nhưng sẽ mất liên kết với Space đó.
- Cần đồng bộ trạng thái Space khi có thay đổi từ server (sự kiện Matrix).
- MetaSpaces là các Space đặc biệt, không thể xóa hoặc chỉnh sửa như Space thông thường.

---

**Gợi ý:**

- Khi nghiên cứu hoặc phát triển tính năng này, nên bắt đầu từ `SpaceStore.ts` để hiểu logic, sau đó đến các component giao diện như `SpacePanel.tsx`.
- [Xem chi tiết tài liệu](https://drive.google.com/drive/folders/1xodlx8dTJq2qSz5V4V6jhOi9qzVmQmNz?usp=sharing)