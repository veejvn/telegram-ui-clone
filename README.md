# Dự án Next.js Clone Telegram 

Đây là một dự án [Next.js](https://nextjs.org) được khởi tạo với [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app), sử dụng TypeScript, TailwindCSS và [shadcn/ui](https://ui.shadcn.com/).

## Bắt đầu

1. Cài đặt các package cần thiết:

```bash
npm install
```

2. Chạy server phát triển:

```bash
npm run dev
```

Sau đó, mở [http://localhost:3000](http://localhost:3000) trên trình duyệt để xem kết quả.
Nếu muồn thay đổi cổng, ví dụ 3001
```bash
npm run dev -- -p 3001
```

## Cấu trúc dự án

- Mã nguồn chính nằm trong thư mục `src/app` và `src/components`.
- Các thành phần UI sử dụng thư viện [shadcn/ui].
- Style sử dụng TailwindCSS.

## Hướng dẫn sử dụng shadcn/ui

1. **Cài đặt shadcn/ui** (nếu chưa cài):

```bash
npx shadcn-ui@latest init
```

2. **Thêm component mới từ shadcn/ui:**

```bash
npx shadcn-ui@latest add button
```

Thay `button` bằng tên component bạn muốn thêm (xem danh sách tại [shadcn/ui docs](https://ui.shadcn.com/docs/components)).

3. **Sử dụng component:**

Import và sử dụng trong file TypeScript/TSX:

```tsx
import { Button } from "@/components/ui/button";

<Button>Click me</Button>;
```

## Tài liệu tham khảo

- [Tài liệu Next.js](https://nextjs.org/docs)
- [Tài liệu shadcn/ui](https://ui.shadcn.com/docs)
- [Tài liệu TailwindCSS](https://tailwindcss.com/docs)
- [Tài liệu phân tích các tính năng của dự án Element Chat](https://drive.google.com/drive/folders/1xodlx8dTJq2qSz5V4V6jhOi9qzVmQmNz?usp=sharing)
- [Tài liệu Git Flow](https://docs.google.com/document/d/1uxeyBp04b6oOXwip6zDV41C53XpnqSc-/edit#heading=h.6jm5b2gvho41)

## Quy ước làm việc nhóm với Git
### 🔹 Branch convention
- `main` : code chính đã test
- `dev`: nhánh phát triển
- `feature/<task-name>`: tính năng mới
- `fix/<bug-name>`: sửa lỗi

---

> Dự án này là bản clone giao diện Telegram, phục vụ mục đích học tập và thử nghiệm.
