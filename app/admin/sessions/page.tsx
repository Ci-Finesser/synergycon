import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ActiveSessions from '@/components/admin/active-sessions';

export const metadata: Metadata = {
  title: 'Active Sessions | Admin Dashboard',
  description: 'Manage your active login sessions across all devices',
};

export default async function SessionsPage() {
  // Check if admin is authenticated
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');

  if (!adminSession) {
    redirect('/admin/login');
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <ActiveSessions autoRefresh={true} refreshInterval={30000} />
    </div>
  );
}
