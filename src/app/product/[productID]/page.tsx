// This is the individual product page for any given product

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Define the product type
type Product = {
    productID: string;
    name: string;
    image: string;
    avgRating: string;
    description: string;
    price: string;
    stock: number; // ✅ Added stock field
    sellerID: string;
    sellerName: string;
};

export default function ProductPage() {
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loggedInSellerID, setLoggedInSellerID] = useState<string | null>(null);
    const params = useParams();
    const router = useRouter(); // ✅ Moved to the top level

    useEffect(() => {
        const fetchProduct = async () => {
            const productID = params?.productID;

            if (!productID) {
                console.error("Product ID not found in route.");
                setIsLoading(false);
                return;
            }

            try {
                const productResponse = await fetch(`/api/get-product?productID=${productID}`);
                const productData = await productResponse.json();

                if (productData.product) {
                    setProduct(productData.product);
                } else {
                    console.error("Product not found.");
                }

                // Fetch logged-in user's seller ID
                const authResponse = await fetch("/api/auth-status");
                const authData = await authResponse.json();

                if (authData.loggedIn) {
                    setLoggedInSellerID(authData.user.userID);
                }
            } catch (error) {
                console.error("Failed to fetch product or user authentication status:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [params]);

    const handleBuyProduct = async () => {
        try {
            const authResponse = await fetch("/api/auth-status");
            const authData = await authResponse.json();

            if (!authData.loggedIn || !authData.user?.userID) {
                alert("You must be logged in to buy products.");
                return;
            }

            const response = await fetch("/api/buy-product", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userID: authData.user.userID, // ✅ Get real user ID dynamically
                    productID: product?.productID,
                }),
            });

            if (response.ok) {
                router.push("/customer/cart");
            } else {
                alert("Failed to add product to cart: Product already in cart.");
            }
        } catch (error) {
            console.error("Error while adding product to cart:", error);
            alert("An error occurred. Please try again.");
        }
    };

    // Loading state
    if (isLoading) {
        return <p className="text-center mt-10 text-white">Loading product details...</p>;
    }

    // Error state if product is not found
    if (!product) {
        return <p className="text-center mt-10 text-white">Product not found.</p>;
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center p-8">
            {/* Product Name and Seller */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white">{product.name}</h1>
                <p className="text-lg text-gray-400 mt-1">Sold by: {product.sellerName}</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 shadow-lg max-w-5xl w-full">
                {/* Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {/* Product Image */}
                    <div className="flex flex-col items-center">
                        <Image
                            src={product.image}
                            alt={product.name}
                            width={300}
                            height={300}
                            className="rounded-lg"
                        />
                        <p className="mt-4 text-lg font-semibold text-gray-300">
                            Rating: {product.avgRating}/10
                        </p>
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col justify-between">
                        {/* Description */}
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-white mb-2">Description:</h2>
                            <p className="text-gray-300">{product.description}</p>
                        </div>

                        {/* Stock Indicator ✅ */}
                        <div className="mb-4">
                            <p className="text-lg font-semibold text-gray-300">
                                Stock Left:{" "}
                                <span
                                    className={`${
                                        product.stock > 10
                                            ? "text-green-400"
                                            : product.stock > 0
                                                ? "text-yellow-400"
                                                : "text-red-500"
                                    } font-bold`}
                                >
                                    {product.stock > 0 ? product.stock : "Out of Stock"}
                                </span>
                            </p>
                        </div>

                        {/* Price and Buy Button */}
                        <div>
                            <p className="text-2xl font-bold text-green-500 mb-4">£{product.price}</p>
                            <button
                                onClick={handleBuyProduct}
                                disabled={product.stock === 0} // ✅ Disable button if stock is 0
                                className={`mt-4 px-6 py-3 rounded-lg font-medium transition ${
                                    product.stock === 0
                                        ? "bg-gray-500 text-gray-300 cursor-not-allowed" // ✅ Greyed-out style when disabled
                                        : "bg-blue-600 text-white hover:bg-blue-700" // ✅ Normal style
                                }`}
                            >
                                {product.stock === 0 ? "Out of Stock" : "Buy Now"} {/* ✅ Change button text */}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seller-Only Actions */}
            {loggedInSellerID === product.sellerID && (
                <div className="flex justify-center gap-6 mt-6">
                    <Link href={`/seller/product-analytics/${product.productID}`}>
                        <button className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-gray-800 transition">
                            View Product Analytics
                        </button>
                    </Link>
                    <Link href={`/seller/edit-product/${product.productID}`}>
                        <button className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-gray-800 transition">
                            Edit Product
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}
