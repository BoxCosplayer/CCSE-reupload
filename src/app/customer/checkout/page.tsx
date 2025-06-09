// This allows a user to "purchase" products, which decreases stock level
// Financial processing should go here

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
    const [statusMessage, setStatusMessage] = useState("Processing your order...");
    const router = useRouter();

    useEffect(() => {
        const processCheckout = async () => {
            try {
                const response = await fetch("/api/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                });

                if (!response.ok) {
                    throw new Error("Checkout failed. Please try again.");
                }

                const data = await response.json();
                setStatusMessage(data.message || "Order processed successfully!");

                // Redirect to order confirmation page after a delay
                setTimeout(() => {
                    router.push("/order-confirmation");
                }, 2000);
            } catch (error) {
                setStatusMessage(error instanceof Error ? error.message : "An unexpected error occurred");
            }
        };

        processCheckout();
    }, [router]);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
            <h1 className="text-3xl font-bold">{statusMessage}</h1>
        </div>
    );
}
