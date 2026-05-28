import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { rows: deals } = await sql`SELECT * FROM idle_deals ORDER BY created_at DESC`;
    const { rows: users } = await sql`SELECT * FROM users`;
    
    return NextResponse.json({ 
      dealsCount: deals.length, 
      deals,
      usersCount: users.length,
      users
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
