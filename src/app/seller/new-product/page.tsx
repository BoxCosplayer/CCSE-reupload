// This page allows sellers to create and publish new products

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NewProductPage() {
    const router = useRouter();

    // Product form state
    const [product, setProduct] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: 1, // Default to 1 stock
    });

    // Image upload state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Track logged-in seller ID
    const [loggedInUserID, setLoggedInUserID] = useState<string | null>(null);

    useEffect(() => {
        // Fetch authentication status to check if the user is a seller
        const fetchAuthStatus = async () => {
            try {
                const response = await fetch("/api/auth-status");
                const data = await response.json();

                if (data.loggedIn) {
                    setLoggedInUserID(data.user.userID);
                } else {
                    alert("You must be logged in to create a product.");
                    router.push("/account/login");
                }
            } catch (error) {
                console.error("Error fetching authentication status:", error);
            }
        };

        fetchAuthStatus();
    }, []);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];

            if (!file.type.startsWith("image/jpeg") && !file.type.startsWith("image/png")) {
                alert("Only JPG and PNG images are allowed.");
                return;
            }

            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCreateProduct = async () => {
        if (!loggedInUserID) {
            alert("Error: User not authenticated.");
            return;
        }

        const formData = new FormData();
        formData.append("name", product.name);
        formData.append("description", product.description);
        formData.append("price", product.price);
        formData.append("category", product.category);
        formData.append("stock", product.stock.toString());
        formData.append("sellerID", loggedInUserID); // Attach seller ID

        if (imageFile) {
            formData.append("image", imageFile);
        }

        try {
            const response = await fetch("/api/new-product", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                alert("Product created successfully!");
                router.push("/"); // Redirect to seller dashboard
            } else {
                console.error("Failed to create product.");
            }
        } catch (error) {
            console.error("Error creating product:", error);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center p-8 text-white">
            <h1 className="text-3xl font-bold mb-6">Create New Product</h1>

            <div className="bg-gray-800 rounded-lg p-6 shadow-lg max-w-3xl w-full">
                {/* Product Image Upload */}
                <div className="flex flex-col items-center mb-6">
                    {imagePreview ? (
                        <Image src={imagePreview} alt="Product Preview" width={200} height={200} className="rounded-lg mb-4" />
                    ) : (
                        <p className="text-gray-400">No image selected</p>
                    )}
                    <input type="file" accept="image/png, image/jpeg" onChange={handleImageChange} />
                </div>

                {/* Product Form */}
                <div className="grid grid-cols-1 gap-4">
                    <label className="flex flex-col">
                        <span className="text-sm font-semibold">Product Name</span>
                        <input
                            type="text"
                            value={product.name}
                            onChange={(e) => setProduct({ ...product, name: e.target.value })}
                            className="p-2 bg-gray-700 text-white rounded"
                        />
                    </label>

                    <label className="flex flex-col">
                        <span className="text-sm font-semibold">Description</span>
                        <textarea
                            value={product.description}
                            onChange={(e) => setProduct({ ...product, description: e.target.value })}
                            className="p-2 bg-gray-700 text-white rounded"
                        />
                    </label>

                    <label className="flex flex-col">
                        <span className="text-sm font-semibold">Price (£)</span>
                        <input
                            type="number"
                            value={product.price}
                            onChange={(e) => setProduct({ ...product, price: e.target.value })}
                            className="p-2 bg-gray-700 text-white rounded"
                        />
                    </label>

                    <label className="flex flex-col">
                        <span className="text-sm font-semibold">Category</span>
                        <select
                            value={product.category}
                            onChange={(e) => setProduct({ ...product, category: e.target.value })}
                            className="p-2 bg-gray-700 text-white rounded"
                        >
                            <option value="Electronics">Electronics</option>
                            <option value="Fashion">Fashion</option>
                            <option value="Home">Home & Living</option>
                        </select>
                    </label>

                    <label className="flex flex-col">
                        <span className="text-sm font-semibold">Stock Quantity</span>
                        <input
                            type="number"
                            value={product.stock}
                            onChange={(e) => setProduct({ ...product, stock: Math.max(0, Number(e.target.value)) })}
                            className="p-2 bg-gray-700 text-white rounded"
                        />
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center mt-6">
                    <button
                        onClick={handleCreateProduct}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                        Create Product
                    </button>
                </div>
            </div>
        </div>
    );
}
