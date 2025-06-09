import { redirect } from "next/navigation";

export default function Home() {
  // Khôi phục lệnh chuyển hướng tự động đến trang chat
  // Khi vào trang chủ, sẽ tự động chuyển hướng đến trang chat
  redirect("/chat");
  return null; // Không cần render gì ở đây vì đã redirect
  // Loại bỏ nội dung placeholder
  // return (
  //   // Có thể thêm nội dung placeholder cho trang gốc nếu cần, hoặc để trống
  //   // Middleware sẽ xử lý chuyển hướng nếu chưa đăng nhập
  //   // Nếu đã đăng nhập, middleware sẽ chuyển hướng đến /chat
  //   null 
  // ); 
}
