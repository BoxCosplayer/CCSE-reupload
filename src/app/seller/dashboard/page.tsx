// This is the Seller's landing page

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SellerDashboard() {
    const router = useRouter();
    const [sellerName, setSellerName] = useState<string | null>(null);

    useEffect(() => {
        const fetchSellerDetails = async () => {
            try {
                const response = await fetch("/api/auth-status");
                const data = await response.json();

                if (!data.loggedIn || !data.user?.userID) {
                    router.push("/account/login"); // Redirect if not logged in
                    return;
                }

                setSellerName(data.user.name); // Display seller's name
            } catch (error) {
                console.error("Error fetching seller details:", error);
            }
        };

        fetchSellerDetails();
    }, [router]);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center p-8">
            {/* Title */}
            <h1 className="text-3xl font-bold mb-6">Seller Dashboard</h1>

            {/* Welcome Message */}
            {sellerName && (
                <p className="text-lg text-gray-400 mb-6">
                    Welcome, <span className="text-blue-400 font-semibold">{sellerName}</span>!
                </p>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col gap-4">
                <Link href="/seller/manage-products">
                    <button className="w-64 bg-blue-600 py-3 text-white font-bold rounded hover:bg-blue-700 transition">
                        Manage Products
                    </button>
                </Link>
                <Link href="/seller/new-product">
                    <button className="w-64 bg-blue-600 py-3 text-white font-bold rounded hover:bg-blue-700 transition">
                        Create Products
                    </button>
                </Link>
            </div>
        </div>
    );
}