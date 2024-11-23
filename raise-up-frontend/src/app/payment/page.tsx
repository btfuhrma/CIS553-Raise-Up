"use client";

import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import "../globals.css";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
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
        <div className="max-w-lg mx-auto mt-10 p-6 shadow-lg rounded-lg bg-gray-50">
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
                Complete Your Payment
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
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

                <div>
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

                <div>
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
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                    disabled={isLoading || !stripe}
                >
                    {isLoading ? "Processing..." : "Pay Now"}
                </button>
            </form>

            {message && (
                <p className={`mt-4 text-center ${message.includes("successful") ? "text-green-600" : "text-red-600"}`}>
                    {message}
                </p>
            )}
        </div>
    );
};

const PaymentPage = () => (
    <Elements stripe={stripePromise}>
        <CheckoutForm />
    </Elements>
);

export default PaymentPage;
