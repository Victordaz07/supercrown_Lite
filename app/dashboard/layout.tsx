import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = session.user.role;
  if (!["MASTER", "ADMIN", "SALES"].includes(role)) redirect("/");

  const isMasterOrAdmin = role === "MASTER" || role === "ADMIN";
  const isSalesOrAbove = isMasterOrAdmin || role === "SALES";

  return (
    <DashboardShell
      userName={session.user.name}
      role={role}
      isMasterOrAdmin={isMasterOrAdmin}
      isSalesOrAbove={isSalesOrAbove}
    >
      {children}
    </DashboardShell>
  );
}
