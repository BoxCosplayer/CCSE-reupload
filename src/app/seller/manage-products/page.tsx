// This page allows sellers to view all their products

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Define the product type
type Product = {
    productID: string;
    name: string;
    image: string;
    avgRating: string;
    sellerID: string;
    stock: number;
    category: string;
    price: string;
};

export default function ManageProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [selectedSort, setSelectedSort] = useState<string | null>(null);
    const [loggedInSellerID, setLoggedInSellerID] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch authentication status
                const authResponse = await fetch("/api/auth-status");
                const authData = await authResponse.json();

                if (!authData.loggedIn || !authData.user?.userID) {
                    console.error("User not authenticated.");
                    return;
                }

                setLoggedInSellerID(authData.user.userID);

                // Fetch products
                const response = await fetch("/api/get-products?category=all");
                const data = await response.json();

                if (!response.ok) {
                    console.error("Failed to fetch products:", data.error);
                    return;
                }

                // Filter only products belonging to the logged-in seller
                const sellerProducts = data.products.filter(
                    (product: Product) => product.sellerID === authData.user.userID
                );

                setProducts(sellerProducts);
                setFilteredProducts(sellerProducts);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            }
        };

        fetchProducts();
    }, []);

    // Sorting function
    const sortProducts = (sortType: string) => {
        setSelectedSort(sortType);
        const sortedProducts = [...filteredProducts];

        if (sortType === "price") {
            sortedProducts.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sortType === "name") {
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortType === "rating") {
            sortedProducts.sort((a, b) => Number(b.avgRating) - Number(a.avgRating));
        }

        setFilteredProducts(sortedProducts);
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-8 bg-black text-white">
            {/* Page Title */}
            <h1 className="text-4xl font-bold mb-6 text-center">Manage Your Products</h1>

            {/* Sort Controls */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
                {/* Sort Buttons */}
                <button
                    onClick={() => sortProducts("price")}
                    className={`px-4 py-2 rounded ${selectedSort === "price" ? "bg-blue-600" : "bg-gray-700"} text-white hover:bg-gray-600 transition`}
                >
                    Sort by Price
                </button>
                <button
                    onClick={() => sortProducts("name")}
                    className={`px-4 py-2 rounded ${selectedSort === "name" ? "bg-blue-600" : "bg-gray-700"} text-white hover:bg-gray-600 transition`}
                >
                    Sort by Name
                </button>
                <button
                    onClick={() => sortProducts("rating")}
                    className={`px-4 py-2 rounded ${selectedSort === "rating" ? "bg-blue-600" : "bg-gray-700"} text-white hover:bg-gray-600 transition`}
                >
                    Sort by Rating
                </button>
            </div>

            {/* Grid Layout for Products */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {filteredProducts.map((product) => (
                    <div
                        key={product.productID}
                        className="border border-gray-500 rounded-lg p-4 bg-gray-900 shadow-md flex flex-col items-center text-center"
                    >
                        {/* Product Image */}
                        <Link href={`/product/manage/${product.productID}`} className="flex justify-center">
                            <Image
                                src={product.image}
                                alt={product.name}
                                width={120}
                                height={120}
                                className="mb-2 object-contain cursor-pointer hover:opacity-80 transition"
                            />
                        </Link>

                        {/* Product Details */}
                        <Link href={`/product/manage/${product.productID}`} className="hover:underline">
                            <p className="font-semibold text-base truncate w-full">{product.name}</p>
                        </Link>
                        <p className="text-gray-400 text-sm">Stock: {product.stock}</p>
                        <p className="text-green-400 font-bold text-lg">£{product.price}</p>

                        {/* Manage Buttons */}
                        <div className="mt-2 flex flex-col gap-2 w-full">
                            <Link href={`/product/manage/${product.productID}`}>
                                <button className="px-4 py-2 w-full bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition">
                                    Edit
                                </button>
                            </Link>

                            <Link href={`/product/manage/${product.productID}`}>
                                <button className="px-4 py-2 w-full bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition">
                                    Remove
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
