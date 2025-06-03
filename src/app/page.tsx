import { redirect } from "next/navigation";

export default function Home() {
  // Khi vào trang chủ, sẽ tự động chuyển hướng đến trang chat
  redirect("/chat");
  return null; // Không cần render gì ở đây vì đã redirect
}
