import SettingClientLayout from "@/components/setting/SettingClientLayout";

export default function SettingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SettingClientLayout>{children}</SettingClientLayout>;
}
