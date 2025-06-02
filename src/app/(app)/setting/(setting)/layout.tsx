import BottomNavigattion from "@/app/components/BottomNavigation";

export default function SettingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className="flex flex-col">
        {children}
      </div>
  );
}
