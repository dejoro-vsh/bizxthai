import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { sellerId, title, description, priceTotal, acceptCashPct, imageUrl } = await request.json();

    if (!sellerId || !title || !priceTotal) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Check User Tier to enforce rules
    const { rows: users } = await sql`SELECT member_tier FROM users WHERE id = ${sellerId}`;
    if (users.length === 0) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const tier = users[0].member_tier;
    
    // 2. Enforce Cash Percentage limits
    // Normal Tier -> max 0% (must be 100% BX)
    // VIP Tier -> max 50%
    let validatedPct = Number(acceptCashPct);
    
    if (tier === 'normal') {
      validatedPct = 0; // Forced to 0% cash
    } else if (tier === 'vip') {
      if (validatedPct > 50) validatedPct = 50; // Cap at 50%
    } else {
      validatedPct = 0;
    }

    // 3. Insert into idle_deals
    const { rows } = await sql`
      INSERT INTO idle_deals (seller_id, title, description, price_total, accept_cash_pct, image_url, status)
      VALUES (${sellerId}, ${title}, ${description}, ${priceTotal}, ${validatedPct}, ${imageUrl}, 'open')
      RETURNING id
    `;

    return NextResponse.json({ success: true, dealId: rows[0].id, cashPctSet: validatedPct });
  } catch (error: any) {
    console.error("Create Deal Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
