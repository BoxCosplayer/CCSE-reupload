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
                const response = await fetch("/api/process-checkout", {
                    method: "POST",
                });

                const data = await response.json();

                if (response.ok) {
                    setStatusMessage("🎉 Thank you for your purchase!");
                } else {
                    setStatusMessage(`❌ Error: ${data.error}`);
                }
            } catch (error) {
                setStatusMessage("❌ An error occurred during checkout.");
            }

            // ✅ Redirect to home after 3 seconds
            setTimeout(() => router.push("/"), 3000);
        };

        processCheckout();
    }, [router]);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
            <h1 className="text-3xl font-bold">{statusMessage}</h1>
        </div>
    );
}
