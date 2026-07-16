import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import AuthProvider from '@/components/providers/AuthProvider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden w-full max-w-full">
        <Header />
        <main className="flex-1 overflow-y-auto w-full max-w-full bg-background/50">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
    </AuthProvider>
  );
}
