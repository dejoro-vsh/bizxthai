import Link from "next/link";
import { sql } from "@vercel/postgres";
import { unstable_noStore as noStore } from "next/cache";
import NetworkTree from "./NetworkTree";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NetworkDashboard() {
  noStore();
  const currentMonthYear = new Date().toISOString().substring(0, 7);

  // In a real app, get this from session. For now, get the first user in DB as mock user
  const { rows: users } = await sql`SELECT id FROM users LIMIT 1`;
  const rootUserId = users.length > 0 ? users[0].id : null;

  if (!rootUserId) {
    return <div>No users found in database.</div>;
  }

  // Fetch the entire downline tree using a Recursive CTE
  // We get: user info, current month's group volume, and tier rate
  const { rows: networkData } = await sql`
    WITH RECURSIVE downline AS (
      -- Base case: the root user
      SELECT 
        u.id, 
        u.display_name, 
        u.referrer_id, 
        0 AS level,
        COALESCE(mgv.group_volume, 0) as group_volume,
        COALESCE(mgv.current_rate, 0.001) as current_rate,
        COALESCE(mgv.commission_earned, 0) as commission_earned
      FROM users u
      LEFT JOIN monthly_group_volume mgv ON u.id = mgv.user_id AND mgv.month_year = ${currentMonthYear}
      WHERE u.id = ${rootUserId}
      
      UNION ALL
      
      -- Recursive step: find children
      SELECT 
        u.id, 
        u.display_name, 
        u.referrer_id, 
        d.level + 1,
        COALESCE(mgv.group_volume, 0) as group_volume,
        COALESCE(mgv.current_rate, 0.001) as current_rate,
        COALESCE(mgv.commission_earned, 0) as commission_earned
      FROM users u
      INNER JOIN downline d ON u.referrer_id = d.id
      LEFT JOIN monthly_group_volume mgv ON u.id = mgv.user_id AND mgv.month_year = ${currentMonthYear}
    )
    SELECT * FROM downline ORDER BY level ASC, display_name ASC;
  `;

  // Total Group Volume and Estimated Commission for the top user
  const topUser = networkData.find((n) => n.id === rootUserId);
  const totalVolume = topUser ? Number(topUser.group_volume) : 0;
  const currentRate = topUser ? Number(topUser.current_rate) : 0.001;

  // Build the tree structure
  const userMap = new Map();
  networkData.forEach(user => {
    userMap.set(user.id, { ...user, children: [] });
  });

  const tree: any[] = [];
  networkData.forEach(user => {
    if (user.id === rootUserId) {
      tree.push(userMap.get(user.id));
    } else {
      const parent = userMap.get(user.referrer_id);
      if (parent) {
        parent.children.push(userMap.get(user.id));
      }
    }
  });

  return (
    <div style={{ backgroundColor: "#111827", minHeight: "100vh", color: "white" }}>
      {/* Header */}
      <div style={{ padding: "24px 20px", borderBottom: "1px solid #374151" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <Link href="/seller/dashboard" style={{ textDecoration: "none", color: "#9CA3AF", fontSize: "24px" }}>←</Link>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#F3F4F6" }}>โครงสร้างสายงาน (MLM Tree)</h1>
        </div>
        
        {/* Summary Card */}
        <div style={{ 
          background: "linear-gradient(135deg, #4B5563 0%, #1F2937 100%)", 
          borderRadius: "16px", 
          padding: "20px", 
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
          border: "1px solid #4B5563"
        }}>
          <p style={{ margin: "0 0 4px 0", color: "#D1D5DB", fontSize: "14px" }}>ยอดซื้อกลุ่ม (Group Volume) เดือนนี้</p>
          <h2 style={{ margin: "0 0 16px 0", fontSize: "32px", color: "#FBBF24", fontWeight: "bold" }}>
            {totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{fontSize: "20px"}}>THB</span>
          </h2>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "16px" }}>
            <div>
              <p style={{ margin: 0, fontSize: "12px", color: "#9CA3AF" }}>เรทคอมมิชชันปัจจุบัน</p>
              <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: "bold", color: "#10B981" }}>{(currentRate * 100).toFixed(1)}%</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: "12px", color: "#9CA3AF" }}>คาดการณ์ปันผลสุทธิ</p>
              <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: "bold", color: "#3B82F6" }}>
                {(Number(topUser?.commission_earned) || 0).toLocaleString()} BX
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Network Tree UI (Client Component) */}
      <div style={{ padding: "20px" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", color: "#F3F4F6" }}>ผังองค์กรแบบย่อ/ขยาย (Accordion)</h3>
        {tree.length > 0 && <NetworkTree data={tree[0]} isRoot={true} />}
      </div>
    </div>
  );
}
