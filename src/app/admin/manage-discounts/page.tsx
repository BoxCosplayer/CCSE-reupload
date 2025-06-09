"use client";

import { useEffect, useState } from "react";

export default function ManageDiscountsPage() {
    // ✅ State for input fields
    const [discountCode, setDiscountCode] = useState("");
    const [discountAmount, setDiscountAmount] = useState<number>(1); // Default to 1%
    const [discounts, setDiscounts] = useState<{ discountID: string; code: string; amount: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ✅ Fetch existing discounts
    useEffect(() => {
        const fetchDiscounts = async () => {
            try {
                const response = await fetch("/api/get-discounts");
                const data = await response.json();

                if (response.ok) {
                    setDiscounts(data.discounts);
                } else {
                    console.error("Failed to fetch discounts:", data.error);
                }
            } catch (error) {
                console.error("Error fetching discounts:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDiscounts();
    }, []);

    // ✅ Handle discount creation
    const handleCreateDiscount = async () => {
        if (!discountCode) {
            alert("Please enter a discount code.");
            return;
        }

        try {
            const response = await fetch("/api/create-discount", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code: discountCode,
                    amount: discountAmount, // ✅ Whole number between 1-99
                }),
            });

            if (response.ok) {
                alert("Discount created successfully!");
                setDiscountCode("");
                setDiscountAmount(1);
                window.location.reload(); // ✅ Refresh to see new discount
            } else {
                alert("Failed to create discount.");
            }
        } catch (error) {
            console.error("Error creating discount:", error);
        }
    };

    // ✅ Handle discount deletion
    const handleDeleteDiscount = async (discountID: string) => {
        const confirmed = confirm("Are you sure you want to delete this discount?");
        if (!confirmed) return;

        try {
            const response = await fetch("/api/delete-discount", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ discountID }),
            });

            if (response.ok) {
                alert("Discount deleted successfully!");
                setDiscounts((prev) => prev.filter((discount) => discount.discountID !== discountID));
            } else {
                alert("Failed to delete discount.");
            }
        } catch (error) {
            console.error("Error deleting discount:", error);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center p-8">
            <h1 className="text-3xl font-bold mb-8">Manage Discounts</h1>

            <div className="flex flex-wrap justify-center gap-8 w-full max-w-5xl">
                {/* Left Side: Create Discount */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
                    <h2 className="text-xl font-bold mb-4">Create Discount</h2>
                    <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        className="w-full px-3 py-2 mb-4 border border-gray-600 rounded bg-gray-700 text-white"
                        placeholder="Enter discount code"
                    />
                    <input
                        type="number"
                        min="1"
                        max="99"
                        step="1"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(Math.max(1, Math.min(99, Math.floor(Number(e.target.value)))))}
                        className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white"
                        placeholder="Enter discount %"
                    />
                    <button
                        onClick={handleCreateDiscount}
                        className="mt-4 w-full bg-green-600 py-2 text-white font-bold rounded hover:bg-green-700 transition"
                    >
                        Create Discount
                    </button>
                </div>

                {/* Right Side: Display Existing Discounts */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
                    <h2 className="text-xl font-semibold mb-4">Existing Discounts</h2>
                    <ul className="space-y-2">
                        {isLoading ? (
                            <p className="text-gray-400">Loading discounts...</p>
                        ) : discounts.length === 0 ? (
                            <p className="text-gray-400">No discounts available.</p>
                        ) : (
                            discounts.map((discount) => (
                                <li
                                    key={discount.discountID}
                                    className="bg-gray-700 p-4 rounded flex justify-between items-center"
                                >
                                    <span>
                                        {discount.code} - {Math.floor(Number(discount.amount))}%
                                    </span>
                                    <button
                                        onClick={() => handleDeleteDiscount(discount.discountID)}
                                        className="ml-2 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition"
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
