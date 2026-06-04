import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// Utility to calculate tier based on monthly group volume
function getRateForVolume(volume: number): number {
  if (volume >= 100001) return 0.025; // 2.5%
  if (volume >= 50001) return 0.015; // 1.5%
  if (volume >= 20001) return 0.008; // 0.8%
  if (volume >= 5001) return 0.003; // 0.3%
  return 0.001; // 0.1% for 0 - 5000
}

export async function POST(request: Request) {
  try {
    const { buyer_id, purchase_amount } = await request.json();
    
    if (!buyer_id || !purchase_amount || purchase_amount <= 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const currentMonthYear = new Date().toISOString().substring(0, 7); // e.g., '2026-05'
    
    // 1. Get the buyer and their referrer.
    let currentUserQuery = await sql`SELECT id, referrer_id FROM users WHERE id = ${buyer_id}`;
    if (currentUserQuery.rowCount === 0) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }
    
    let currentUser = currentUserQuery.rows[0];
    let currentReferrerId = currentUser.referrer_id;
    
    // Add the purchase_amount to the buyer's own monthly_group_volume (Personal Volume)
    const buyerVolumeQuery = await sql`
      INSERT INTO monthly_group_volume (user_id, month_year, personal_volume, group_volume)
      VALUES (${buyer_id}, ${currentMonthYear}, ${purchase_amount}, ${purchase_amount})
      ON CONFLICT (user_id, month_year) 
      DO UPDATE SET 
        personal_volume = monthly_group_volume.personal_volume + EXCLUDED.personal_volume,
        group_volume = monthly_group_volume.group_volume + EXCLUDED.group_volume
      RETURNING group_volume
    `;

    const newBuyerVolume = buyerVolumeQuery.rows[0].group_volume;
    const buyerTierRate = getRateForVolume(Number(newBuyerVolume));

    await sql`
      UPDATE monthly_group_volume 
      SET current_rate = ${buyerTierRate}
      WHERE user_id = ${buyer_id} AND month_year = ${currentMonthYear}
    `;

    const payouts = [];
    let rateToSubtract = buyerTierRate; // The rate that has already been paid out

    // Pay Personal Rebate to Buyer
    if (buyerTierRate > 0) {
      const personalRebateAmount = Number(purchase_amount) * buyerTierRate;
      
      payouts.push({
        user_id: buyer_id,
        rate: buyerTierRate,
        amount: personalRebateAmount,
        total_rate_so_far: buyerTierRate,
        type: 'personal_rebate'
      });

      await sql`
        INSERT INTO wallets (user_id, bx_balance)
        VALUES (${buyer_id}, 0)
        ON CONFLICT (user_id) DO NOTHING
      `;

      await sql`
        UPDATE wallets 
        SET bx_balance = bx_balance + ${personalRebateAmount}
        WHERE user_id = ${buyer_id}
      `;

      await sql`
        INSERT INTO bx_transactions (sender_wallet_id, receiver_wallet_id, amount, tx_type, description)
        VALUES (
          NULL,
          (SELECT id FROM wallets WHERE user_id = ${buyer_id}),
          ${personalRebateAmount},
          'mlm_personal_rebate',
          ${`Personal rebate from own purchase (Rate: ${(buyerTierRate*100).toFixed(2)}%)`}
        )
      `;
    }

    // Now, trace up the line to update group_volumes and calculate differential commission
    while (currentReferrerId) {
      // Find the referrer
      const referrerQuery = await sql`SELECT id, referrer_id FROM users WHERE id = ${currentReferrerId}`;
      if (referrerQuery.rowCount === 0) break; // Referrer not found, end of line
      
      const referrer = referrerQuery.rows[0];
      
      // Update their group volume
      const updateVolumeQuery = await sql`
        INSERT INTO monthly_group_volume (user_id, month_year, group_volume)
        VALUES (${currentReferrerId}, ${currentMonthYear}, ${purchase_amount})
        ON CONFLICT (user_id, month_year) 
        DO UPDATE SET 
          group_volume = monthly_group_volume.group_volume + EXCLUDED.group_volume
        RETURNING group_volume
      `;
      
      const newGroupVolume = updateVolumeQuery.rows[0].group_volume;
      const currentTierRate = getRateForVolume(Number(newGroupVolume));
      
      // Update the current_rate in the DB for record keeping
      await sql`
        UPDATE monthly_group_volume 
        SET current_rate = ${currentTierRate}
        WHERE user_id = ${currentReferrerId} AND month_year = ${currentMonthYear}
      `;

      // Calculate differential commission
      let diffRate = currentTierRate - rateToSubtract;
      
      // Ensure no floating point precision issues
      diffRate = Math.round(diffRate * 10000) / 10000;
      
      if (diffRate > 0) {
        // Calculate payout amount
        const payoutAmount = Number(purchase_amount) * diffRate;
        
        payouts.push({
          user_id: currentReferrerId,
          rate: diffRate,
          amount: payoutAmount,
          total_rate_so_far: currentTierRate
        });
        
        // Make sure wallet exists first
        await sql`
          INSERT INTO wallets (user_id, bx_balance)
          VALUES (${currentReferrerId}, 0)
          ON CONFLICT (user_id) DO NOTHING
        `;

        // Update wallet
        await sql`
          UPDATE wallets 
          SET bx_balance = bx_balance + ${payoutAmount}
          WHERE user_id = ${currentReferrerId}
        `;
        
        // Log transaction
        await sql`
          INSERT INTO bx_transactions (sender_wallet_id, receiver_wallet_id, amount, tx_type, description)
          VALUES (
            NULL, -- Minted by system
            (SELECT id FROM wallets WHERE user_id = ${currentReferrerId}),
            ${payoutAmount},
            'mlm_commission',
            ${`Differential commission from purchase by ${buyer_id} (Diff Rate: ${(diffRate*100).toFixed(2)}%)`}
          )
        `;
        
        // Set the new rate to subtract for the next upline
        rateToSubtract = currentTierRate;
      }
      
      // Move to next upline
      currentReferrerId = referrer.referrer_id;
    }

    return NextResponse.json({ 
      success: true, 
      message: "Commission distributed and volumes updated successfully",
      payouts: payouts
    });

  } catch (error: any) {
    console.error("Commission Distribution Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
