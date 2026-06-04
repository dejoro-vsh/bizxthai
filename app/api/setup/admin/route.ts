import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const SUPER_ADMIN_LINE_ID = 'U8b0bd1d26e337c3b73efe5a53bb4b628';
    
    await sql`UPDATE users SET role = 'admin' WHERE line_user_id = ${SUPER_ADMIN_LINE_ID}`;
    
    return NextResponse.json({ 
      success: true, 
      message: "User upgraded to admin. Please go back to /simulator and refresh the page." 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
