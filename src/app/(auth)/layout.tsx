import AuthClientLayout from "@/components/layouts/AuthClientLayout";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return <AuthClientLayout>{children}</AuthClientLayout>;
}
