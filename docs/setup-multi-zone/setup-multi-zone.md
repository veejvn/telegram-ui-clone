# Hướng dẫn cấu hình Multi-Zone: Main App truy cập Chat App

## 1. Kiến trúc tổng quan

- **main-app**: Cổng chính, truy cập các zone con qua các route ví dụ `/blog`, `/admin`, `/chat`.
- **chat-app**: Ứng dụng chat, chạy riêng port (ví dụ: `chat-domain.com`), phục vụ dưới dạng zone con.

## 2. Cấu hình main-app

### a. Thêm rewrites trong `next.config.ts`

```typescript
// filepath: d:\HocTap\TTTT\multi-zone-app\main-app\next.config.ts
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/chat/:path+",
        destination: "http://chat-domain.com/chat/:path+",
      },
    ];
  },
  // ...các config khác...
};
export default nextConfig;
```

### b. Thêm link truy cập Chat Zone trong trang chính

```tsx
// filepath: d:\HocTap\TTTT\multi-zone-app\main-app\src\app\page.tsx
<a href="/chat/chat">➡️ Đi đến Chat Zone</a>
```

## 3. Cấu hình chat-app

### a. Sử dụng assetPrefix và rewrites

```typescript
// filepath: d:\HocTap\TTTT\multi-zone-app\chat-app\next.config.ts
const nextConfig = {
  basePath: "/chat",
  // ...các config khác...
};
export default nextConfig;
```

### b. Khởi chạy chat-app trên port riêng (ví dụ: 3003)

```sh
cd chat-app
npm run build
npm start -p 3003
```

## 4. Quy trình hoạt động

- Khi truy cập `/chat/chat` trên main-app, request sẽ được proxy sang chat-app.

## 5. Kiểm tra

- Truy cập `http://main-domain.com/chat/chat` (main-app) sẽ hiển thị giao diện chat-app.

## 6. Hướng dẫn truyền option từ Main App sang Chat App để ẩn/hiện các tính năng

Để truyền các option (ví dụ: ẩn/hiện các nút như call, contact, setting, searchbar) từ main-app sang chat-app, bạn chỉ cần thêm các query param trên URL khi chuyển sang chat-app. Chat-app sẽ đọc các query param này và xử lý linh hoạt theo nhu cầu (ví dụ: ẩn/hiện các nút, thay đổi giao diện, ...).

**Ví dụ minh họa:**

- Nếu muốn ẩn các nút Call, Contact, Setting trên chat-app, bạn có thể tạo link như sau ở main-app:

  `http://main-domain.com/chat/chat?hide=call,contact,setting`

- Khi người dùng truy cập vào link này, chat-app sẽ nhận được thông tin cần ẩn các nút tương ứng.

- Các options:
  + call: ẩn Call ở Navigation Bar
  + setting: ẩn Setting ở Navigation Bar
  + contact: ẩn Contact ở Navigation Bar
  + search: ẩn Search Bar
  

## 7. Hướng dẫn trở về Main App từ Chat App bằng backUrl

Để khi truy cập từ một zone phụ (ví dụ: Blog) sang Chat Zone, người dùng có thể quay lại đúng trang trước đó, bạn có thể truyền tham số `backUrl` trên đường dẫn:

**Ví dụ ở trang Blog:**

```tsx
export default function BlogHome() {
  const backUrl = "/blog";

  return (
    <main>
      <h1 className="bg-blue-500">📝 Blog Zone (Zone phụ)</h1>
      <a href={`/chat/chat?backUrl=${encodeURIComponent(backUrl)}`}>
        ➡️ Đi đến Chat Zone
      </a>
    </main>
  );
}
```

**Lưu ý:**

- Luôn build lại chat-app sau khi thay đổi cấu hình.
- Nếu deploy lên production, thay đổi `destination` sang domain thực tế của chat-app.
