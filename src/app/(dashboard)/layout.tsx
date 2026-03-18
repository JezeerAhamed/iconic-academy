export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
    // No Footer here — marketing footer is excluded from all /dashboard/* routes.
    // Sidebar and auth checks are handled by dashboard/layout.tsx (the inner layout).
    return <>{children}</>;
}
