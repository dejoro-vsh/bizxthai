import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { lineUserId, displayName, referrerId } = await request.json();

    if (!lineUserId || !displayName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const { rows: existingUsers } = await sql`SELECT id FROM users WHERE line_user_id = ${lineUserId}`;
    if (existingUsers.length > 0) {
      return NextResponse.json({ message: "User already exists", user: existingUsers[0] });
    }

    // Transaction to insert User + Wallet safely
    // Since Vercel Postgres does not have a strict transaction wrapper out-of-the-box easily exposed in single query, 
    // we'll run sequentially (for production, pg client transaction is better)
    
    // Insert User
    let insertedUserId = null;
    if (referrerId) {
      const { rows } = await sql`
        INSERT INTO users (line_user_id, display_name, referrer_id)
        VALUES (${lineUserId}, ${displayName}, ${referrerId})
        RETURNING id
      `;
      insertedUserId = rows[0].id;
    } else {
      const { rows } = await sql`
        INSERT INTO users (line_user_id, display_name)
        VALUES (${lineUserId}, ${displayName})
        RETURNING id
      `;
      insertedUserId = rows[0].id;
    }

    // Insert Wallet (Normal tier gets 0 OD initially)
    await sql`
      INSERT INTO wallets (user_id, bx_balance, cash_balance, od_limit)
      VALUES (${insertedUserId}, 0.00, 0.00, 0.00)
    `;


    return NextResponse.json({ success: true, userId: insertedUserId });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
