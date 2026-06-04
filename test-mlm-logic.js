// test-mlm-logic.js
// Script to simulate MLM Stair-step Differential Commission logic

function getRateForVolume(volume) {
  if (volume >= 100001) return 0.025; // 2.5%
  if (volume >= 50001) return 0.015; // 1.5%
  if (volume >= 20001) return 0.008; // 0.8%
  if (volume >= 5001) return 0.003; // 0.3%
  return 0.001; // 0.1% for 0 - 5000
}

function runSimulation() {
  console.log("=== เริ่มการทดลองระบบแจกจ่ายคอมมิชชันแบบขั้นบันได ===");
  
  // 1. Setup mock database
  const users = {
    'user_A': { id: 'user_A', name: 'นาย A (Top Upline)', referrer_id: null },
    'user_B': { id: 'user_B', name: 'นาย B', referrer_id: 'user_A' },
    'user_C': { id: 'user_C', name: 'นาย C', referrer_id: 'user_B' },
    'user_D': { id: 'user_D', name: 'นาย D (ผู้ซื้อ)', referrer_id: 'user_C' }
  };

  const monthly_volume = {
    'user_A': { group_volume: 120000 }, // Tier 5 (2.5%)
    'user_B': { group_volume: 40000 },  // Tier 3 (0.8%)
    'user_C': { group_volume: 6000 },   // Tier 2 (0.3%)
    'user_D': { group_volume: 0 }       // Tier 1 (0.1%)
  };

  const wallets = {
    'user_A': 0, 'user_B': 0, 'user_C': 0, 'user_D': 0
  };

  const purchase_amount = 10000;
  console.log(`\nสถานการณ์: 'นาย D' สั่งซื้อสินค้ามูลค่า ${purchase_amount.toLocaleString()} บาท\n`);

  // Step 1: Update buyer's volume
  monthly_volume['user_D'].group_volume += purchase_amount;
  console.log(`[+] อัปเดตยอดกลุ่มให้ผู้ซื้อ: นาย D ยอดใหม่ = ${monthly_volume['user_D'].group_volume.toLocaleString()} บาท`);

  // Step 2: Trace uplines and calculate
  let currentReferrerId = users['user_D'].referrer_id;
  let rateToSubtract = 0.0;
  
  let totalMinted = 0;

  while (currentReferrerId) {
    const referrer = users[currentReferrerId];
    if (!referrer) break;

    // Update their volume
    monthly_volume[currentReferrerId].group_volume += purchase_amount;
    const newVol = monthly_volume[currentReferrerId].group_volume;
    
    // Calculate rate
    const currentTierRate = getRateForVolume(newVol);
    
    let diffRate = currentTierRate - rateToSubtract;
    diffRate = Math.round(diffRate * 10000) / 10000; // prevent precision issues
    
    console.log(`\n> กำลังคำนวณให้ Upline: ${referrer.name}`);
    console.log(`  - ยอดกลุ่มใหม่ (รวมบิลนี้) = ${newVol.toLocaleString()} บาท`);
    console.log(`  - เพดานเปอร์เซ็นต์ (ตามยอดใหม่) = ${(currentTierRate * 100).toFixed(1)}%`);
    console.log(`  - หักเปอร์เซ็นต์ดาวน์ไลน์ที่จ่ายไปแล้ว = ${(rateToSubtract * 100).toFixed(1)}%`);
    console.log(`  - ✨ เปอร์เซ็นต์ส่วนต่างที่ได้รับ = ${(diffRate * 100).toFixed(1)}%`);

    if (diffRate > 0) {
      const payout = purchase_amount * diffRate;
      wallets[currentReferrerId] += payout;
      totalMinted += payout;
      console.log(`  => โอนเข้ากระเป๋า: ${payout.toLocaleString()} BX`);
      rateToSubtract = currentTierRate;
    } else {
      console.log(`  => โอนเข้ากระเป๋า: 0 BX (โดนดาวน์ไลน์ดันเรทชนกัน หรือเรทต่ำกว่า)`);
    }

    currentReferrerId = referrer.referrer_id;
  }

  console.log(`\n=== สรุปยอดการสร้างแต้ม (Minted BX) ===`);
  console.log(`ยอดซื้อขาย: ${purchase_amount.toLocaleString()} บาท`);
  console.log(`ระบบจ่ายคอมมิชชันทั้งหมด: ${totalMinted.toLocaleString()} BX`);
  console.log(`(คิดเป็น ${(totalMinted / purchase_amount * 100).toFixed(2)}% ของยอดขาย ซึ่งไม่เกินเพดาน 2.5% ตามกฎ)`);
  console.log("==================================================");
}

runSimulation();
