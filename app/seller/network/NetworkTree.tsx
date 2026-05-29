"use client";

import { useState } from "react";

export default function NetworkTree({ data, isRoot = false }: { data: any, isRoot?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(isRoot);
  const hasChildren = data.children && data.children.length > 0;

  const toggleExpand = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div style={{ marginBottom: "8px", marginLeft: isRoot ? "0" : "16px" }}>
      {/* Node Card */}
      <div 
        onClick={toggleExpand}
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "16px",
          backgroundColor: isRoot ? "#374151" : "#1F2937",
          border: isRoot ? "2px solid #FBBF24" : "1px solid #374151",
          borderRadius: "12px",
          cursor: hasChildren ? "pointer" : "default",
          transition: "all 0.2s ease-in-out",
          boxShadow: isRoot ? "0 4px 14px 0 rgba(251, 191, 36, 0.2)" : "none",
        }}
        onMouseEnter={(e) => { if (hasChildren) e.currentTarget.style.borderColor = "#6B7280" }}
        onMouseLeave={(e) => { if (hasChildren) e.currentTarget.style.borderColor = isRoot ? "#FBBF24" : "#374151" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "20px",
              backgroundColor: isRoot ? "#FBBF24" : "#4B5563",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              color: isRoot ? "#111827" : "#F3F4F6",
              fontSize: "18px"
            }}>
              {data.display_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#F3F4F6", display: "flex", alignItems: "center", gap: "8px" }}>
                {data.display_name} 
                {isRoot && <span style={{ fontSize: "10px", padding: "2px 6px", backgroundColor: "#FBBF24", color: "#111827", borderRadius: "10px", fontWeight: "bold" }}>YOU</span>}
              </h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#9CA3AF" }}>
                สายงานตรง: {data.children?.length || 0} คน
              </p>
            </div>
          </div>
          
          <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: "0 0 2px 0", fontSize: "14px", fontWeight: "bold", color: "#10B981" }}>
                ยอด {(Number(data.group_volume) || 0).toLocaleString()} ฿
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#60A5FA" }}>
                เรท: {(Number(data.current_rate) * 100).toFixed(1)}%
              </p>
            </div>
            {hasChildren && (
              <div style={{ 
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", 
                transition: "transform 0.3s ease",
                color: "#9CA3AF" 
              }}>
                ▼
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Children Container with Animation */}
      <div style={{
        marginTop: "8px",
        display: "grid",
        gridTemplateRows: isExpanded ? "1fr" : "0fr",
        transition: "grid-template-rows 0.3s ease-in-out",
      }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ 
            borderLeft: "2px dashed #374151", 
            marginLeft: "20px", 
            paddingLeft: "12px" 
          }}>
            {data.children?.map((child: any) => (
              <NetworkTree key={child.id} data={child} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
