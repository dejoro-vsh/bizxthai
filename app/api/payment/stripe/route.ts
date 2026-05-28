import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-04-10",
});

export async function POST(request: Request) {
  try {
    const { amount, currency = "thb" } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Include the 4% Gateway Fee in the charge (as discussed)
    // For example, if the item cash price is 500 THB, we charge 520 THB.
    const amountWithFee = amount + (amount * 0.04);
    
    // Stripe expects amount in the smallest currency unit (e.g., satang for THB)
    const stripeAmount = Math.round(amountWithFee * 100);

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency: currency,
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      originalAmount: amount,
      totalCharged: amountWithFee
    });
  } catch (error: any) {
    console.error("Stripe API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
