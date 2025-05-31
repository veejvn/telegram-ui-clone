import BottomNavigattion from "@/app/components/BottomNavigation";

export default function SettingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <div className="min-h-screen bg-black text-white flex flex-col">
        {children}
      </div>
    </main>
  );
}
