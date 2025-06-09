// This page allows admins or Sellers to view and edit specific products

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

// Define the product type
type Product = {
    productID: string;
    name: string;
    description: string;
    price: string;
    category: string;
    image: string;
    stock: number; // ✅ Added stock field
};

export default function ManageProductPage() {
    const { productID } = useParams();
    const router = useRouter();

    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [, setLoggedInUserID] = useState<string | null>(null);
    const [isSeller, setIsSeller] = useState<boolean>(false); // ✅ Track if user is the seller

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/get-product?productID=${productID}`);
                const data = await response.json();

                if (response.ok) {
                    setProduct(data.product);
                } else {
                    console.error("Failed to fetch product:", data.error);
                }

                // Fetch the logged-in user info
                const authResponse = await fetch("/api/auth-status");
                const authData = await authResponse.json();

                if (authData.loggedIn) {
                    setLoggedInUserID(authData.user.userID);
                    setIsSeller(authData.user.userID === data.product.sellerID); // ✅ Only sellers can edit stock
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [productID]);

    const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];

            // ✅ Check file type (Only allow JPG and PNG)
            if (!file.type.startsWith("image/jpeg") && !file.type.startsWith("image/png")) {
                alert("Only JPG and PNG images are allowed.");
                return;
            }

            // ✅ Check file size (Limit to 2MB)
            if (file.size > MAX_FILE_SIZE) {
                alert("File size exceeds 2MB. Please upload a smaller image.");
                return;
            }

            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleUpdateProduct = async () => {
        if (!product) return;

        const formData = new FormData();
        formData.append("productID", product.productID);
        formData.append("name", product.name);
        formData.append("description", product.description);
        formData.append("price", product.price);
        formData.append("category", product.category);
        formData.append("stock", product.stock.toString()); // ✅ Include stock
        if (imageFile) {
            formData.append("image", imageFile);
        }

        try {
            const response = await fetch("/api/update-product", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                alert("Product updated successfully!");
                router.push("/");
            } else {
                console.error("Failed to update product.");
            }
        } catch (error) {
            console.error("Error updating product:", error);
        }
    };

    const handleDeleteProduct = async () => {
        if (!product) return;

        const confirmed = confirm("Are you sure you want to delete this product?");
        if (!confirmed) return;

        try {
            const response = await fetch("/api/delete-product", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ productID: product.productID }),
            });

            if (response.ok) {
                alert("Product deleted successfully!");
                router.push("/");
            } else {
                console.error("Failed to delete product.");
            }
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    if (isLoading) return <p className="text-center mt-10 text-white">Loading product details...</p>;

    if (!product) return <p className="text-center mt-10 text-white">Product not found.</p>;

    return (
        <div className="min-h-screen bg-black flex flex-col items-center p-8 text-white">
            <h1 className="text-3xl font-bold mb-6">Manage Product</h1>

            <div className="bg-gray-800 rounded-lg p-6 shadow-lg max-w-3xl w-full">
                {/* Product Image Upload */}
                <div className="flex flex-col items-center mb-6">
                    <Image
                        src={imagePreview || product.image}
                        alt={product.name}
                        width={200}
                        height={200}
                        className="rounded-lg mb-4"
                    />
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

                    {/* Stock Field (Editable Only by Sellers) */}
                    {isSeller && (
                        <label className="flex flex-col">
                            <span className="text-sm font-semibold">Stock Quantity</span>
                            <input
                                type="number"
                                value={product.stock}
                                onChange={(e) =>
                                    setProduct({ ...product, stock: Math.max(0, Number(e.target.value)) })
                                }
                                className="p-2 bg-gray-700 text-white rounded"
                            />
                        </label>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between mt-6">
                    <button
                        onClick={handleUpdateProduct}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                    >
                        Save Changes
                    </button>
                    <button
                        onClick={handleDeleteProduct}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                    >
                        Delete Product
                    </button>
                </div>
            </div>
        </div>
    );
}
