// Force all admin routes to be dynamically rendered
// This prevents prerendering during build when Supabase env vars may not be available
export const dynamic = 'force-dynamic'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
