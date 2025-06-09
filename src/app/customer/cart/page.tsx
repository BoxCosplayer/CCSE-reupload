// This page allows a customer to view their cart

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Define the product type
type Product = {
    productID: string;
    name: string;
    image: string;
    avgRating: string;
    sellerName: string;
    amount: number; // Quantity from itemsHeld table
    price: string; // Price of the product
    stock: number; // ✅ Added stock field
};

export default function CartPage() {
    const [cartItems, setCartItems] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalPrice, setTotalPrice] = useState(0);
    const [discountCode, setDiscountCode] = useState("");
    const [discountApplied, setDiscountApplied] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const response = await fetch("/api/get-cart-items");
                const data = await response.json();

                if (response.ok && data.cartItems) {
                    setCartItems(data.cartItems);
                    calculateTotalPrice(data.cartItems);
                } else {
                    console.error("Failed to fetch cart items:", data.error);
                }
            } catch (error) {
                console.error("Error fetching cart items:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCartItems();
    }, []);

    const calculateTotalPrice = (items: Product[], discount = 0) => {
        const total = items.reduce((sum, item) => sum + Number(item.price) * item.amount, 0);
        const discountedTotal = discount ? total - (total * discount) / 100 : total;
        setTotalPrice(discountedTotal);
    };

    const handleApplyDiscount = async () => {
        try {
            const response = await fetch("/api/get-discount", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: discountCode }),
            });

            const data = await response.json();

            if (response.ok && data.discount) {
                setDiscountApplied(data.discount);
                calculateTotalPrice(cartItems, data.discount);
            } else {
                alert("Invalid or expired discount code.");
                setDiscountApplied(null);
                calculateTotalPrice(cartItems);
            }
        } catch (error) {
            console.error("Error applying discount:", error);
        }
    };

    const handleUpdateQuantity = async (productID: string, newAmount: number) => {
        const product = cartItems.find((item) => item.productID === productID);

        if (!product) {
            console.error("Product not found in cart.");
            return;
        }

        if (newAmount > product.stock) {
            alert(`Only ${product.stock} units available in stock.`);
            return;
        }

        if (newAmount <= 0) {
            // Remove product from cart if quantity <= 0
            const response = await fetch(`/api/remove-cart-item`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productID }),
            });

            if (response.ok) {
                const updatedCart = cartItems.filter((item) => item.productID !== productID);
                setCartItems(updatedCart);
                calculateTotalPrice(updatedCart);
            } else {
                console.error("Failed to remove product from cart.");
            }
            return;
        }

        // Update the amount in the cart
        const response = await fetch(`/api/update-cart-item`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productID, amount: newAmount }),
        });

        if (response.ok) {
            const updatedCart = cartItems.map((item) =>
                item.productID === productID ? { ...item, amount: newAmount } : item
            );
            setCartItems(updatedCart);
            calculateTotalPrice(updatedCart);
        } else {
            console.error("Failed to update product quantity.");
        }
    };

    const handleCheckout = () => {
        router.push("/customer/checkout");
    };

    if (isLoading) {
        return <p className="text-center mt-10 text-white">Loading cart items...</p>;
    }

    if (cartItems.length === 0) {
        return <p className="text-center mt-10 text-white">Your cart is empty.</p>;
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Your Cart</h1>
                <div className="flex items-center gap-4">
                    {/* Discount Code Section */}
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Enter discount code"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            className="px-4 py-2 bg-gray-700 text-white rounded border border-gray-600"
                        />
                        <button
                            onClick={handleApplyDiscount}
                            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
                        >
                            Apply
                        </button>
                    </div>

                    {/* Total Price Display */}
                    <p className="text-xl font-bold text-green-400">
                        Total: £{totalPrice.toFixed(2)}
                    </p>

                    {/* Checkout Button */}
                    <button
                        onClick={handleCheckout}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                    >
                        Checkout
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cartItems.map((item) => (
                    <div key={item.productID} className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
                        {/* Product Image */}
                        <Image src={item.image} alt={item.name} width={150} height={150} className="mb-4 rounded" />

                        {/* Product Details */}
                        <Link href={`/product/${item.productID}`} className="text-lg font-bold hover:underline">
                            {item.name}
                        </Link>
                        <p className="text-sm text-gray-400">Sold by: {item.sellerName}</p>
                        <p className="text-sm text-gray-400">Rating: {item.avgRating}/5</p>
                        <p className="text-lg text-green-400 font-bold mt-2">£{item.price}</p>

                        {/* Stock Left Indicator */}
                        <p className="text-sm font-bold mt-1">
                            Stock Left:{" "}
                            <span className={item.stock > 10 ? "text-green-400" : item.stock > 0 ? "text-yellow-400" : "text-red-500"}>
                                {item.stock > 0 ? item.stock : "Out of Stock"}
                            </span>
                        </p>

                        {/* Quantity and Update */}
                        <div className="mt-4 flex items-center gap-2">
                            <input
                                type="number"
                                value={item.amount}
                                onChange={(e) => handleUpdateQuantity(item.productID, Number(e.target.value))}
                                className="w-16 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                            />
                            <button
                                onClick={() => handleUpdateQuantity(item.productID, item.amount)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
