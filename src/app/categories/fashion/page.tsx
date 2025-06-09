// This page displays all fashion items

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
    sellerName: string;
    stock: number;
    category: string;
    price: string;
};

export default function FashionPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [sellers, setSellers] = useState<string[]>([]);
    const [selectedSeller, setSelectedSeller] = useState<string | null>(null);
    const [selectedSort, setSelectedSort] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("/api/get-products?category=Fashion");
                const data = await response.json();
                setProducts(data.products);
                setFilteredProducts(data.products);

                // Extract unique seller names
                const uniqueSellers: string[] = Array.from(new Set(data.products.map((p: Product) => p.sellerName)));
                setSellers(uniqueSellers);
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

    // Filter by seller
    const filterBySeller = (seller: string | null) => {
        setSelectedSeller(seller);
        setSelectedSort(null); // **Reset sorting when changing sellers**

        if (seller) {
            setFilteredProducts(products.filter((product) => product.sellerName === seller));
        } else {
            setFilteredProducts(products); // Reset to all products when "All Sellers" is selected
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-8 bg-black text-white">
            {/* Page Title */}
            <h1 className="text-4xl font-bold mb-6 text-center">Fashion Products</h1>

            {/* Sort and Filter Controls */}
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

            {/* Seller Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
                <button
                    onClick={() => filterBySeller(null)}
                    className={`px-4 py-2 rounded ${selectedSeller === null ? "bg-blue-600" : "bg-gray-700"} text-white hover:bg-gray-600 transition`}
                >
                    Reset Filters
                </button>
                {sellers.map((seller) => (
                    <button
                        key={seller}
                        onClick={() => filterBySeller(seller)}
                        className={`px-4 py-2 rounded ${selectedSeller === seller ? "bg-blue-600" : "bg-gray-700"} text-white hover:bg-gray-600 transition`}
                    >
                        {seller}
                    </button>
                ))}
            </div>

            {/* Grid Layout for Products */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {filteredProducts.map((product) => (
                    <div
                        key={product.productID}
                        className="border border-gray-500 rounded-lg p-4 bg-gray-900 shadow-md flex flex-col items-center text-center"
                    >
                        {/* Product Image */}
                        <Link href={`/product/${product.productID}`} className="flex justify-center">
                            <Image
                                src={product.image}
                                alt={product.name}
                                width={120}
                                height={120}
                                className="mb-2 object-contain cursor-pointer hover:opacity-80 transition"
                            />
                        </Link>

                        {/* Product Details */}
                        <Link href={`/product/${product.productID}`} className="hover:underline">
                            <p className="font-semibold text-base truncate w-full">{product.name}</p>
                        </Link>
                        <p className="text-gray-400 text-sm">Seller: {product.sellerName}</p>
                        <p className="text-gray-400 text-sm">Rating: {product.avgRating}/10</p>
                        <p className="text-green-400 font-bold text-lg">£{product.price}</p>

                        {/* Buy Button (Clickable) */}
                        <Link href={`/product/${product.productID}`}>
                            <button className="mt-2 px-5 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition">
                                Buy
                            </button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}