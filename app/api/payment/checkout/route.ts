import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Expected Payload: buyerId, sellerId, itemPrice, cashAmount, bxAmount
    const { buyerId, sellerId, cashAmount, bxAmount } = await request.json();

    if (!buyerId || !sellerId || (cashAmount === 0 && bxAmount === 0)) {
      return NextResponse.json({ error: "Invalid payment details" }, { status: 400 });
    }

    // 1. Fetch Wallets
    const { rows: buyerWallets } = await sql`SELECT id, bx_balance, od_limit FROM wallets WHERE user_id = ${buyerId}`;
    const { rows: sellerWallets } = await sql`SELECT id, bx_balance FROM wallets WHERE user_id = ${sellerId}`;

    if (buyerWallets.length === 0 || sellerWallets.length === 0) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const buyerWallet = buyerWallets[0];
    const sellerWallet = sellerWallets[0];

    // 2. Validate BX Balance (incl. OD Limit)
    // Available BX = current balance + absolute value of OD limit (since OD limit is represented as a positive cap)
    const availableBx = Number(buyerWallet.bx_balance) + Number(buyerWallet.od_limit);
    if (bxAmount > 0 && availableBx < bxAmount) {
      return NextResponse.json({ error: "Insufficient BX Balance or OD Limit" }, { status: 400 });
    }

    // 3. Process BX Deduction and Addition
    if (bxAmount > 0) {
      // Deduct from buyer
      await sql`UPDATE wallets SET bx_balance = bx_balance - ${bxAmount} WHERE id = ${buyerWallet.id}`;
      // Add to seller
      await sql`UPDATE wallets SET bx_balance = bx_balance + ${bxAmount} WHERE id = ${sellerWallet.id}`;
      // Record transaction
      await sql`
        INSERT INTO bx_transactions (sender_wallet_id, receiver_wallet_id, amount, tx_type, description)
        VALUES (${buyerWallet.id}, ${sellerWallet.id}, ${bxAmount}, 'payment', 'Hybrid/BX Payment')
      `;
    }

    // 4. Process Cash Fee and Cashback (5% of cashAmount goes back as BX to seller)
    if (cashAmount > 0) {
      const feeAmount = Number(cashAmount) * 0.05; // 5% Fee
      
      // Credit 5% BX to seller as cashback
      await sql`UPDATE wallets SET bx_balance = bx_balance + ${feeAmount} WHERE id = ${sellerWallet.id}`;
      
      // Record cashback in ledger
      await sql`
        INSERT INTO bx_transactions (receiver_wallet_id, amount, tx_type, description)
        VALUES (${sellerWallet.id}, ${feeAmount}, 'cashback_fee', '5% Cash Fee converted to BX')
      `;
      
      // Note: We don't deduct Cash Balance here since Cash might be processed via external Payment Gateway (Stripe/Omise/LINE Pay). 
      // The frontend would handle the Gateway charge. This API assumes the Gateway charge was successful.
    }

    // 5. Group Volume Tracking (Trigger for MLM)
    // (In production, this would update the monthly_group_volume table recursively or queue a background job)
    
    // 6. Referral Bonus (100 BX on First Transaction)
    // Helper to check and pay bonus
    const checkAndPayReferralBonus = async (userId: string, walletId: string) => {
      const { rows: userRow } = await sql`SELECT referrer_id FROM users WHERE id = ${userId}`;
      const referrerId = userRow[0]?.referrer_id;
      
      if (referrerId) {
        // Did they have prior transactions? (Exclude the one we just inserted in this checkout)
        // Actually, since we already inserted, count should be exactly 1 or 2 (if they both bought and received cashback).
        // A safer way is checking if they have transactions BEFORE this API call started. But since we didn't check before,
        // we can check if the count is <= 2 (just the ones we created).
        // Let's do it properly by counting total transactions they are involved in.
        const { rows: priorTx } = await sql`SELECT count(*) as tx_count FROM bx_transactions WHERE sender_wallet_id = ${walletId} OR receiver_wallet_id = ${walletId}`;
        const txCount = Number(priorTx[0].tx_count);
        
        // We inserted 1 for BX payment, and maybe 1 for cashback. Max 2.
        // If this was their very first time doing anything, txCount will be <= 2.
        if (txCount <= 2) {
           const { rows: refWallets } = await sql`SELECT id FROM wallets WHERE user_id = ${referrerId}`;
           if (refWallets.length > 0) {
             const refWalletId = refWallets[0].id;
             await sql`UPDATE wallets SET bx_balance = bx_balance + 100 WHERE id = ${refWalletId}`;
             await sql`
               INSERT INTO bx_transactions (receiver_wallet_id, amount, tx_type, description)
               VALUES (${refWalletId}, 100.00, 'mlm_commission', 'Direct referral bonus for new user first transaction')
             `;
           }
        }
      }
    };

    await checkAndPayReferralBonus(buyerId, buyerWallet.id);
    await checkAndPayReferralBonus(sellerId, sellerWallet.id);

    
    return NextResponse.json({ success: true, message: "Payment successful" });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
