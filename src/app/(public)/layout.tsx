import Sidebar from '@/components/layout/Sidebar';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 md:pl-72">
        {children}
      </main>
    </div>
  );
} 