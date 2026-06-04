import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import SimulatorClient from "./SimulatorClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SimulatorPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const userRole = (session?.user as any)?.role || "user";
  const lineUserId = (session?.user as any)?.lineUserId || "unknown";

  return <SimulatorClient userRole={userRole} lineUserId={lineUserId} />;
}
