"use client";

import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";

export default function CheckoutForm({ amount, onSuccess }: { amount: number, onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) return;

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) return;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          onSuccess();
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: window.location.href,
      },
      redirect: 'if_required', // Avoids full page redirect if possible
    });

    if (error) {
      setMessage(error.message || "An unexpected error occurred.");
    } else {
      // Payment successful without redirect
      setMessage("Payment succeeded!");
      onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      <button 
        disabled={isLoading || !stripe || !elements} 
        id="submit" 
        className="btn btn-primary"
      >
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner">กำลังประมวลผล...</div> : "ชำระเงินตอนนี้"}
        </span>
      </button>
      {/* Show any error or success messages */}
      {message && <div id="payment-message" style={{ color: "var(--error-color)", fontSize: "14px", textAlign: "center" }}>{message}</div>}
    </form>
  );
}
