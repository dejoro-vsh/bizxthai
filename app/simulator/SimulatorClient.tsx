"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// 1. Initial Mock Data (Width and Depth)
const initialUsers = {
  "user_A": { id: "user_A", name: "Top Upline (คุณ)", parent_id: null, personal_volume: 20000, group_volume: 60000, current_rate: 0.015, earned_personal: 0, earned_group: 0 },
  
  // Leg 1 (Deep - 4 levels under A)
  "user_B": { id: "user_B", name: "นาย B (Leg 1 - ชั้น 1)", parent_id: "user_A", personal_volume: 15000, group_volume: 25000, current_rate: 0.008, earned_personal: 0, earned_group: 0 },
  "user_C": { id: "user_C", name: "นาย C (ชั้น 2)", parent_id: "user_B", personal_volume: 5000, group_volume: 10000, current_rate: 0.003, earned_personal: 0, earned_group: 0 },
  "user_D": { id: "user_D", name: "นาย D (ชั้น 3)", parent_id: "user_C", personal_volume: 5000, group_volume: 5000, current_rate: 0.001, earned_personal: 0, earned_group: 0 },
  "user_E": { id: "user_E", name: "นาย E (ชั้น 4 - น้องใหม่สุด)", parent_id: "user_D", personal_volume: 0, group_volume: 0, current_rate: 0.001, earned_personal: 0, earned_group: 0 },
  
  // Leg 2, 3, 4 (Direct width)
  "user_F": { id: "user_F", name: "นาย F (Leg 2)", parent_id: "user_A", personal_volume: 10000, group_volume: 10000, current_rate: 0.003, earned_personal: 0, earned_group: 0 },
  "user_G": { id: "user_G", name: "นาย G (Leg 3)", parent_id: "user_A", personal_volume: 5000, group_volume: 5000, current_rate: 0.001, earned_personal: 0, earned_group: 0 },
  "user_H": { id: "user_H", name: "นาย H (Leg 4 - เพิ่งสมัคร)", parent_id: "user_A", personal_volume: 0, group_volume: 0, current_rate: 0.001, earned_personal: 0, earned_group: 0 },
};

function getRateForVolume(volume: number): number {
  if (volume >= 100001) return 0.025;
  if (volume >= 50001) return 0.015;
  if (volume >= 20001) return 0.008;
  if (volume >= 5001) return 0.003;
  return 0.001;
}

export default function SimulatorClient({ 
  userRole, 
  lineUserId 
}: { 
  userRole: string; 
  lineUserId: string; 
}) {
  const router = useRouter();

  const [users, setUsers] = useState<Record<string, any>>(JSON.parse(JSON.stringify(initialUsers)));
  const [buyerId, setBuyerId] = useState("user_D");
  const [cashAmount, setCashAmount] = useState<number>(5000);
  const [bxAmount, setBxAmount] = useState<number>(5000);
  const [logs, setLogs] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // We don't need status check here anymore since the Server Component handles redirects
  if (userRole !== 'admin') {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#111827", color: "white", padding: "40px", textAlign: "center" }}>
        <h2>🚫 ไม่มีสิทธิ์เข้าถึง (Access Denied)</h2>
        <p>คุณต้องเป็นผู้ดูแลระบบ (Admin) เท่านั้นถึงจะเข้าหน้านี้ได้</p>
        <div style={{ margin: "20px auto", padding: "20px", backgroundColor: "#1F2937", borderRadius: "10px", maxWidth: "500px" }}>
          <p style={{ color: "#FBBF24" }}>รหัสผู้ใช้งานของคุณ (LINE User ID) คือ:</p>
          <code style={{ fontSize: "18px", userSelect: "all", backgroundColor: "black", padding: "10px", borderRadius: "5px", display: "block" }}>
            {lineUserId}
          </code>
          <p style={{ marginTop: "20px", fontSize: "14px", color: "#9CA3AF" }}>กรุณาคัดลอกรหัสนี้ส่งให้ทีมงาน เพื่อเปิดสิทธิ์ใช้งานแอดมินครับ</p>
        </div>
        <Link href="/seller/dashboard">
          <button style={{ backgroundColor: "#4B5563", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}>
            กลับหน้าหลัก
          </button>
        </Link>
      </div>
    );
  }

  const [isMonthEnded, setIsMonthEnded] = useState(false);

  const resetSimulation = () => {
    setUsers(JSON.parse(JSON.stringify(initialUsers)));
    setLogs([]);
    setIsMonthEnded(false);
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  // Action 1: Add Purchase (Accumulate Volume during the month)
  const addPurchase = async () => {
    if (isSimulating || isMonthEnded) return;
    setIsSimulating(true);

    const totalPurchase = cashAmount + bxAmount;
    if (totalPurchase <= 0) {
      alert("กรุณากรอกยอดซื้อที่มากกว่า 0");
      setIsSimulating(false);
      return;
    }

    let currentLogs: any[] = [];
    const addLog = (msg: string, type: 'info' | 'success' | 'warning' = 'info') => {
      currentLogs.push({ id: Date.now() + Math.random(), msg, type });
      setLogs((prevLogs) => [...prevLogs, ...currentLogs]);
      currentLogs = [];
    };

    addLog(`🛒 บันทึกการซื้อ: ${users[buyerId].name} ยอดรวม ${totalPurchase.toLocaleString()} บาท (เงินสด ${cashAmount}, BX ${bxAmount})`, 'info');
    await delay(500);

    const newUsers = { ...users };

    // Update buyer's volume
    newUsers[buyerId].personal_volume += totalPurchase;
    newUsers[buyerId].group_volume += totalPurchase;
    newUsers[buyerId].current_rate = getRateForVolume(newUsers[buyerId].group_volume);
    
    // Instant Retail Cashback
    let cashback = 0;
    if (cashAmount > 0) {
      cashback = cashAmount * 0.05;
      newUsers[buyerId].earned_personal += cashback;
      addLog(`🎁 ระบบจ่าย Cashback ทันที 5% จากยอดเงินสด: ${cashback.toLocaleString()} BX`, 'success');
    }
    await delay(500);

    setUsers({ ...newUsers });

    // Ripple the group volume up the tree
    let currentReferrerId = newUsers[buyerId].parent_id;
    while (currentReferrerId) {
      const referrer = newUsers[currentReferrerId];
      if (!referrer) break;

      referrer.group_volume += totalPurchase;
      referrer.current_rate = getRateForVolume(referrer.group_volume);

      addLog(`⬆️ อัปเดตยอดกลุ่มให้ ${referrer.name} -> ยอดใหม่ ${referrer.group_volume.toLocaleString()} (เรท ${(referrer.current_rate*100).toFixed(1)}%)`, 'info');
      
      setUsers({ ...newUsers });
      await delay(500);

      currentReferrerId = referrer.parent_id;
    }

    setIsSimulating(false);
  };

  // Action 2: End of Month Calculation (31st)
  const calculateMonthEnd = async () => {
    if (isSimulating || isMonthEnded) return;
    setIsSimulating(true);
    setIsMonthEnded(true);
    
    let currentLogs: any[] = [];
    const addLog = (msg: string, type: 'info' | 'success' | 'warning' = 'info') => {
      currentLogs.push({ id: Date.now() + Math.random(), msg, type });
      setLogs((prevLogs) => [...prevLogs, ...currentLogs]);
      currentLogs = [];
    };

    addLog(`\n📅 เริ่มต้นการคำนวณปิดยอดวันที่ 31...`, 'info');
    await delay(1000);

    const newUsers = { ...users };
    let totalSystemPayout = 0;

    // Iterate through every user to calculate their Month End Commissions
    for (const userId of Object.keys(newUsers)) {
      const user = newUsers[userId];
      let userTotalGained = 0;

      // 1. Calculate Personal Rebate
      if (user.personal_volume > 0 && user.current_rate > 0) {
        const personalRebate = user.personal_volume * user.current_rate;
        user.earned_personal += personalRebate;
        userTotalGained += personalRebate;
        totalSystemPayout += personalRebate;
        addLog(`⭐ ${user.name} รับคอมฯ ส่วนตัว ${(user.current_rate*100).toFixed(1)}% จากยอด ${user.personal_volume.toLocaleString()} = ${personalRebate.toLocaleString()} BX`, 'success');
        await delay(300);
      }

      // 2. Calculate Group Differential Commission from DIRECT downlines
      const directDownlines = Object.values(newUsers).filter(u => u.parent_id === userId);
      for (const downline of directDownlines) {
        const diffRate = user.current_rate - downline.current_rate;
        const safeDiffRate = Math.round(diffRate * 10000) / 10000;

        if (safeDiffRate > 0 && downline.group_volume > 0) {
          const groupCommission = downline.group_volume * safeDiffRate;
          user.earned_group += groupCommission;
          userTotalGained += groupCommission;
          totalSystemPayout += groupCommission;
          addLog(`💰 ${user.name} รับส่วนต่าง ${(safeDiffRate*100).toFixed(1)}% จากสาย ${downline.name} (ยอด ${downline.group_volume.toLocaleString()}) = ${groupCommission.toLocaleString()} BX`, 'success');
          await delay(300);
        } else if (downline.group_volume > 0) {
          addLog(`⚠️ ${user.name} ไม่ได้ส่วนต่างจาก ${downline.name} (เรทชนกันที่ ${(user.current_rate*100).toFixed(1)}%)`, 'warning');
          await delay(100);
        }
      }
      
      setUsers({ ...newUsers });
    }

    addLog(`\n✅ สรุปการคำนวณวันที่ 31 เสร็จสิ้น! ระบบจ่ายคอมมิชชันออกไปทั้งหมด: ${totalSystemPayout.toLocaleString()} BX`, 'success');
    setIsSimulating(false);
  };

  // Helper to build tree for rendering
  const buildTree = (parentId: string | null): any[] => {
    return Object.values(users)
      .filter(u => u.parent_id === parentId)
      .map(u => ({
        ...u,
        children: buildTree(u.id)
      }));
  };

  const tree = buildTree(null);

  const renderNode = (node: any, level: number = 0) => {
    const isBuyer = node.id === buyerId;
    return (
      <div key={node.id} style={{ marginLeft: level === 0 ? "0" : "24px", marginTop: "12px", borderLeft: level === 0 ? "none" : "2px dashed #4B5563", paddingLeft: level === 0 ? "0" : "16px" }}>
        <div style={{
          padding: "16px",
          backgroundColor: isBuyer ? "#374151" : "#1F2937",
          border: isBuyer ? "2px solid #3B82F6" : "1px solid #374151",
          borderRadius: "12px",
          boxShadow: isBuyer ? "0 0 15px rgba(59, 130, 246, 0.3)" : "none",
          transition: "all 0.3s ease",
          position: "relative"
        }}>
          <div style={{ position: "absolute", top: "-12px", right: "-10px", display: "flex", gap: "6px" }}>
            {node.earned_personal > 0 && (
              <div style={{
                backgroundColor: "#10B981", color: "white", padding: "4px 10px",
                borderRadius: "20px", fontWeight: "bold", fontSize: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.3)", animation: "bounce 0.5s ease"
              }}>
                +{node.earned_personal.toLocaleString()} BX (ส่วนตัว)
              </div>
            )}
            {node.earned_group > 0 && (
              <div style={{
                backgroundColor: "#FBBF24", color: "#111827", padding: "4px 10px",
                borderRadius: "20px", fontWeight: "bold", fontSize: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.3)", animation: "bounce 0.5s ease"
              }}>
                +{node.earned_group.toLocaleString()} BX (กลุ่ม)
              </div>
            )}
          </div>
          <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#F3F4F6", display: "flex", alignItems: "center", gap: "8px" }}>
            {node.name}
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", fontSize: "12px" }}>
            <div>
              <p style={{ margin: 0, color: "#9CA3AF" }}>ยอดส่วนตัว</p>
              <p style={{ margin: 0, color: "#34D399", fontWeight: "bold" }}>{node.personal_volume.toLocaleString()} ฿</p>
            </div>
            <div>
              <p style={{ margin: 0, color: "#9CA3AF" }}>ยอดกลุ่ม</p>
              <p style={{ margin: 0, color: "#FBBF24", fontWeight: "bold" }}>{node.group_volume.toLocaleString()} ฿</p>
            </div>
            <div>
              <p style={{ margin: 0, color: "#9CA3AF" }}>เรทคอมมิชชัน</p>
              <p style={{ margin: 0, color: "#60A5FA", fontWeight: "bold" }}>{(node.current_rate * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div>
          {node.children.map((child: any) => renderNode(child, level + 1))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: "#111827", minHeight: "100vh", color: "white", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <Link href="/seller/dashboard" style={{ textDecoration: "none", color: "#9CA3AF", fontSize: "24px" }}>←</Link>
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "#F3F4F6" }}>🧪 MLM Stair-step Simulator</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        
        {/* Left: Control Panel & Logs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div style={{ backgroundColor: "#1F2937", padding: "20px", borderRadius: "16px", border: "1px solid #374151" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#F3F4F6" }}>แผงควบคุมการจำลอง</h3>
            
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", color: "#9CA3AF" }}>1. เลือกผู้ซื้อ (Buyer)</label>
              <select 
                value={buyerId} 
                onChange={(e) => setBuyerId(e.target.value)}
                disabled={isSimulating}
                style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "#374151", color: "white", border: "1px solid #4B5563" }}
              >
                {Object.values(users).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "8px", color: "#9CA3AF" }}>2. ยอดชำระด้วยเงินสด (Cash)</label>
                <input 
                  type="number" 
                  value={cashAmount}
                  onChange={(e) => setCashAmount(Number(e.target.value))}
                  disabled={isSimulating}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "#374151", color: "white", border: "1px solid #4B5563" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "8px", color: "#9CA3AF" }}>3. ยอดชำระด้วยแต้ม (BX)</label>
                <input 
                  type="number" 
                  value={bxAmount}
                  onChange={(e) => setBxAmount(Number(e.target.value))}
                  disabled={isSimulating}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "#374151", color: "white", border: "1px solid #4B5563" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
              <button 
                onClick={addPurchase}
                disabled={isSimulating || isMonthEnded}
                style={{ flex: 1, backgroundColor: "#3B82F6", color: "white", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "bold", cursor: (isSimulating || isMonthEnded) ? "not-allowed" : "pointer", opacity: (isSimulating || isMonthEnded) ? 0.7 : 1 }}
              >
                {isSimulating ? "กำลังอัปเดตยอด..." : "🛒 บันทึกการซื้อ (สะสมยอด)"}
              </button>
              <button 
                onClick={calculateMonthEnd}
                disabled={isSimulating || isMonthEnded}
                style={{ flex: 1, backgroundColor: "#10B981", color: "white", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "bold", cursor: (isSimulating || isMonthEnded) ? "not-allowed" : "pointer", opacity: (isSimulating || isMonthEnded) ? 0.7 : 1 }}
              >
                {isMonthEnded ? "คำนวณแล้ว" : "📅 คำนวณรายได้วันที่ 31"}
              </button>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button 
                onClick={resetSimulation}
                disabled={isSimulating}
                style={{ width: "100%", backgroundColor: "#4B5563", color: "white", border: "none", padding: "12px 20px", borderRadius: "8px", fontWeight: "bold", cursor: isSimulating ? "not-allowed" : "pointer" }}
              >
                รีเซ็ตข้อมูลใหม่
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: "#111827", padding: "20px", borderRadius: "16px", border: "1px solid #374151", flex: 1, minHeight: "300px" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#F3F4F6" }}>บันทึกการทำงาน (System Logs)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "400px", overflowY: "auto" }}>
              {logs.map((log) => (
                <div key={log.id} style={{ 
                  padding: "12px", 
                  borderRadius: "8px", 
                  fontSize: "14px",
                  backgroundColor: log.type === 'success' ? "rgba(16, 185, 129, 0.1)" : log.type === 'warning' ? "rgba(245, 158, 11, 0.1)" : "rgba(59, 130, 246, 0.1)",
                  color: log.type === 'success' ? "#34D399" : log.type === 'warning' ? "#FBBF24" : "#93C5FD",
                  borderLeft: `4px solid ${log.type === 'success' ? "#10B981" : log.type === 'warning' ? "#F59E0B" : "#3B82F6"}`
                }}>
                  {log.msg}
                </div>
              ))}
              {logs.length === 0 && <p style={{ color: "#6B7280", fontStyle: "italic", textAlign: "center", marginTop: "40px" }}>รอการรันจำลอง...</p>}
            </div>
          </div>

        </div>

        {/* Right: Network Tree */}
        <div style={{ backgroundColor: "#1F2937", padding: "20px", borderRadius: "16px", border: "1px solid #374151", maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
          <h3 style={{ margin: "0 0 20px 0", color: "#F3F4F6" }}>ผังสายงานจำลอง (Live Network Tree)</h3>
          <div>
            {tree.map(node => renderNode(node))}
          </div>
        </div>

      </div>
    </div>
  );
}
