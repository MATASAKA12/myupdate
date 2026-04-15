// app/dashboard/layout.tsx
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar"
import { ProtectedRoute } from "@/components/protected-route" // if still needed

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute> {/* ← keeps your auth guard */}
      <div className="relative min-h-screen bg-background">
        <DashboardNavbar />
        <main className="pt-14"> {/* ← space for fixed navbar height */}
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}