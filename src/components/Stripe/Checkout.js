import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";

// Load the Stripe public key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_TEST_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cardElement = elements.getElement(CardElement);

    try {
      // Create a payment intent by calling the backend
      const { data } = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/checkout`, {
        amount: 5000, // Replace with dynamic amount (in cents)
        currency: "eur", // Replace with dynamic currency
      });

      const { clientSecret } = data;

      // Confirm the card payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (result.error) {
        setMessage(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        setMessage("Payment successful!");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setMessage("Payment failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Pay
      </button>
      {message && <p>{message}</p>}
    </form>
  );
};

const Checkout = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default Checkout;
