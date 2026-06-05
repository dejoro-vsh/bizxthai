import { sql } from "@vercel/postgres";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function ShortLinkRedirect({ params }: { params: { code: string } }) {
  const code = params.code;
  
  if (!code) {
    redirect("/");
  }

  try {
    // Look up the user's line_user_id or id using the short_code
    // Note: We use the line_user_id as the referrer ID in this system
    const { rows } = await sql`
      SELECT line_user_id FROM users WHERE short_code = ${code}
    `;

    if (rows.length > 0) {
      const referrerLineId = rows[0].line_user_id;
      
      // Save it in the cookie for 24 hours
      cookies().set({
        name: "bizxthai_ref_code",
        value: referrerLineId,
        path: "/",
        maxAge: 86400,
        httpOnly: false, // Must be readable by client JS just in case
      });
    }
  } catch (error) {
    console.error("ShortLink Error:", error);
  }

  // Redirect to the beautifully clean landing page
  redirect("/");
}
