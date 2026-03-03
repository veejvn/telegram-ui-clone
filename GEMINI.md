# Project Overview: Telegram UI Clone

## Introduction
This project is a sophisticated clone of the Telegram user interface, built using modern web technologies. It aims to replicate the core features and aesthetic of Telegram, including real-time messaging, voice/video calls, and a responsive design.

## Core Technologies
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS & Framer Motion (for animations)
- **UI Components**: shadcn/ui (based on Radix UI)
- **State Management**: Zustand
- **Authentication**: NextAuth.js
- **Icons**: Lucide React, Boxicons, Heroicons
- **Communication**: Matrix JS SDK (Integration with Matrix protocol)
- **Others**: 
    - `react-leaflet` for map integration
    - `wavesurfer.js` for audio visualization
    - `emoji-picker-react` for rich messaging

## Key Features
- **(auth)**: Complete authentication flow (Login, Register, Forgot Password, Email Verification).
- **(chat)**: Real-time messaging interface with support for emojis, file sharing, and diverse message types.
- **(call)**: Voice and video calling capabilities.
- **(contact)**: Contact management and searching.
- **(setting)**: Comprehensive user settings and profile management.
- **Responsive Design**: Optimized for both desktop and mobile viewing.

## Project Structure
- `src/app`: Application routes and pages using Next.js App Router.
- `src/components`: Reusable UI components categorized by feature (chat, call, auth, etc.).
- `src/lib`: Utility functions and shared logic.
- `public`: Static assets including images and fonts.

---

# Tổng quan dự án: Telegram UI Clone

## Giới thiệu
Dự án này là một phiên bản clone giao diện người dùng của Telegram, được xây dựng bằng các công nghệ web hiện đại. Mục tiêu là tái hiện các tính năng cốt lõi và thẩm mỹ của Telegram, bao gồm nhắn tin thời gian thực, gọi thoại/video và thiết kế phản hồi (responsive).

## Công nghệ cốt lõi
- **Framework**: Next.js 15 (App Router)
- **Ngôn ngữ**: TypeScript
- **Styling**: TailwindCSS & Framer Motion (cho hoạt ảnh)
- **Thành phần UI**: shadcn/ui (dựa trên Radix UI)
- **Quản lý trạng thái**: Zustand
- **Xác thực**: NextAuth.js
- **Icons**: Lucide React, Boxicons, Heroicons
- **Giao tiếp**: Matrix JS SDK (Tích hợp với giao thức Matrix)
- **Các công nghệ khác**:
    - `react-leaflet` để tích hợp bản đồ
    - `wavesurfer.js` để hiển thị dạng sóng âm thanh
    - `emoji-picker-react` cho các tính năng tin nhắn phong phú

## Các tính năng chính
- **(auth)**: Quy trình xác thực đầy đủ (Đăng nhập, Đăng ký, Quên mật khẩu, Xác minh email).
- **(chat)**: Giao diện nhắn tin thời gian thực hỗ trợ emoji, chia sẻ tệp và các loại tin nhắn đa dạng.
- **(call)**: Khả năng gọi thoại và gọi video.
- **(contact)**: Quản lý và tìm kiếm danh bạ.
- **(setting)**: Quản lý hồ sơ và cài đặt người dùng toàn diện.
- **Thiết kế phản hồi**: Được tối ưu hóa cho cả máy tính và thiết bị di động.

## Cấu trúc dự án
- `src/app`: Các route và trang ứng dụng sử dụng Next.js App Router.
- `src/components`: Các thành phần giao diện có thể tái sử dụng, được phân loại theo tính năng (chat, call, auth, v.v.).
- `src/lib`: Các hàm tiện ích và logic dùng chung.
- `public`: Tài nguyên tĩnh bao gồm hình ảnh và font chữ.
