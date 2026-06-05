import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Add short_code column if it doesn't exist
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS short_code VARCHAR(10) UNIQUE;
    `;

    // 2. Generate short_code for users who don't have one
    const { rows: usersWithoutCode } = await sql`
      SELECT id FROM users WHERE short_code IS NULL;
    `;

    for (const user of usersWithoutCode) {
      // Generate a random 6-character string
      const code = Math.random().toString(36).substring(2, 8);
      await sql`
        UPDATE users SET short_code = ${code} WHERE id = ${user.id};
      `;
    }

    return NextResponse.json({ 
      success: true, 
      message: "Database migration successful.", 
      usersUpdated: usersWithoutCode.length 
    });
  } catch (error: any) {
    console.error("Migration Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
