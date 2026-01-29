import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ActiveSessions from '@/components/admin/active-sessions';
import { AdminNavigation } from "@/components/admin-navigation";
import { getAdminUser } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Active Sessions | Admin Dashboard',
  description: 'Manage your active login sessions across all devices',
};

export default async function SessionsPage() {
  try {
    await getAdminUser();
  } catch (error) {
    redirect('/admin/login');
  }

  return (
    <>
      <AdminNavigation />
      <main className="min-h-screen py-12 px-4 md:px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Active Sessions</h1>
            <p className="text-sm text-muted-foreground">
              Manage your active login sessions across all devices
            </p>
          </div>
          <ActiveSessions autoRefresh={true} refreshInterval={30000} />
        </div>
      </main>
    </>
  );
}
