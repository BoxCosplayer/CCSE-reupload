// This page allows anonymous users to create an account

"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
    // State to store form inputs
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        password: "",
        addLine1: "",
        addLine2: "",
        addLine3: "",
        city: "",
        postcode: "",
        role: "customer", // Default to customer
    });

    const [message, setMessage] = useState(""); // Success/Error Message
    const [loading, setLoading] = useState(false); // Loading state

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    // Handle form submission
    // Handle form submission
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(""); // Reset message

        try {
            const response = await fetch("/api/new-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            setLoading(false);

            if (!response.ok) {
                throw new Error(data.error || "Signup failed");
            }

            setMessage("Signup successful! Redirecting...");
            setTimeout(() => {
                window.location.href = "/account/login"; // Redirect after signup
            }, 2000);
        } catch (error: any) {
            setMessage(error.message);
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
            {/* Page Title */}
            <h1 className="text-4xl font-bold mb-10 text-center">Signup</h1>

            {/* Display Success/Error Message */}
            {message && (
                <p className={`mb-4 ${message.includes("successful") ? "text-green-600" : "text-red-600"}`}>
                    {message}
                </p>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSignup} className="w-full max-w-md bg-gray-100 p-8 rounded-lg shadow-lg">
                {/* Full Name */}
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                        required
                    />
                </div>

                {/* Username */}
                <div className="mb-4">
                    <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Choose a username"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                        required
                    />
                </div>

                {/* Password */}
                <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                        required
                    />
                </div>

                {/* Address Line 1 */}
                <div className="mb-4">
                    <label htmlFor="addLine1" className="block text-gray-700 font-medium mb-2">
                        Address Line 1
                    </label>
                    <input
                        type="text"
                        id="addLine1"
                        value={formData.addLine1}
                        onChange={handleChange}
                        placeholder="House Number / Street"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                        required
                    />
                </div>

                {/* Address Line 2 */}
                <div className="mb-4">
                    <label htmlFor="addLine2" className="block text-gray-700 font-medium mb-2">
                        Address Line 2
                    </label>
                    <input
                        type="text"
                        id="addLine2"
                        value={formData?.addLine2 ?? ""}
                        onChange={handleChange}
                        placeholder="Apartment, Suite, etc."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    />
                </div>

                {/* Address Line 3 */}
                <div className="mb-4">
                    <label htmlFor="addLine3" className="block text-gray-700 font-medium mb-2">
                        Address Line 3
                    </label>
                    <input
                        type="text"
                        id="addLine3"
                        value={formData?.addLine3 ?? ""}
                        onChange={handleChange}
                        placeholder="Additional address information"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    />
                </div>

                {/* City */}
                <div className="mb-4">
                    <label htmlFor="city" className="block text-gray-700 font-medium mb-2">
                        City
                    </label>
                    <input
                        type="text"
                        id="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Enter your city"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                        required
                    />
                </div>

                {/* Postcode */}
                <div className="mb-4">
                    <label htmlFor="postcode" className="block text-gray-700 font-medium mb-2">
                        Postcode
                    </label>
                    <input
                        type="text"
                        id="postcode"
                        value={formData.postcode}
                        onChange={handleChange}
                        placeholder="Enter your postcode"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                        required
                    />
                </div>

                {/* User Type Selection (Dropdown) */}
                <div className="mb-6">
                    <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
                        Register As
                    </label>
                    <select
                        id="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                        required
                    >
                        <option value="customer" className="text-black">Customer</option>
                        <option value="seller" className="text-black">Seller</option>
                    </select>
                </div>

                {/* Signup Button */}
                <button
                    type="submit"
                    className={`w-full px-4 py-2 text-white font-medium rounded-lg transition ${
                        loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                    }`}
                    disabled={loading}
                >
                    {loading ? "Signing up..." : "Signup"}
                </button>
            </form>

            {/* Login Redirect */}
            <p className="mt-6 text-gray-600">
                Already have an account?{" "}
                <Link href="/account/login" className="text-blue-500 hover:underline hover:text-blue-600">
                    Login here
                </Link>
            </p>
        </div>
    );
}
