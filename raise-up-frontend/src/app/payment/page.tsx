"use client";

import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import "./styles/payment.css";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const searchParams = new URLSearchParams(window.location.search);
    const campaignId = searchParams.get('campaign_id');
    const [email, setEmail] = useState("");
    const [amount, setAmount] = useState<number | string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (!stripe || !elements) return;

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            setMessage("Please enter a valid amount.");
            return;
        }

        try {
            setIsLoading(true);

            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment`, {
                amount,
                email,
                currency: "usd",
                campaign_id: campaignId
            });

            const { client_secret } = data;

            const result = await stripe.confirmCardPayment(client_secret, {
                payment_method: {
                    card: elements.getElement(CardElement)!,
                    billing_details: { email },
                },
            });

            if (result.error) {
                setMessage(result.error.message || "Payment failed. Please try again.");
            } else if (result.paymentIntent?.status === "succeeded") {
                setMessage("Payment successful! Thank you for your donation.");
            }
        } catch (err) {
            setMessage("Payment failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="payment-container">
            {campaignId && (
                <p className="campaign-id">
                    Campaign ID: {campaignId}
                </p>
            )}
            <h2 className="payment-title">
                Complete Your Payment
            </h2>

            <form onSubmit={handleSubmit} className="payment-form">
                <div className="form-group">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        placeholder="you@example.com"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                        Donation Amount (USD)
                    </label>
                    <input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        placeholder="Enter amount (e.g., 50)"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="card-details" className="block text-sm font-medium text-gray-700">
                        Card Details
                    </label>
                    <div className="px-4 py-2 border rounded-md bg-white">
                        <CardElement
                            id="card-details"
                            className="focus:outline-none text-gray-900"
                            options={{
                                style: {
                                    base: {
                                        fontSize: "16px",
                                        color: "#424770",
                                        "::placeholder": {
                                            color: "#9CA3AF",
                                        },
                                    },
                                    invalid: {
                                        color: "#E63946",
                                    },
                                },
                            }}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="submit-button"
                    disabled={isLoading || !stripe}
                >
                    {isLoading ? "Processing..." : "Pay Now"}
                </button>
            </form>

            {message && (
                <p className={`message ${message.includes("successful") ? "success" : "error"}`}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default function PaymentPage() {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm />
        </Elements>
    );
}
