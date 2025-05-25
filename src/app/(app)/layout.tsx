import BottomNavigattion from "@/app/components/BottomNavigation";


export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
        <div className="min-h-screen bg-black text-white flex flex-col">
          {children}
          <BottomNavigattion />
        </div>
    </main>
  );
}