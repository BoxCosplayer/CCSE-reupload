// This page allows user to login


"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [message, setMessage] = useState(""); // Success/Error Message
    const [loading, setLoading] = useState(false); // Loading state

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    // Handle login submission
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(""); // Reset message

        try {
            // Verifies login attempt
            const response = await fetch("/api/verify-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            setLoading(false);

            if (!response.ok) {
                throw new Error(data.error || "Login failed");
            }

            setMessage("Login successful! Redirecting...");
            setTimeout(() => {
                window.location.href = "/"; // Redirect after login
            }, 2000);
        } catch (error) {
            setLoading(false);
            setMessage(error instanceof Error ? error.message : "An unexpected error occurred");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
            {/* Page Title */}
            <h1 className="text-4xl font-bold mb-10 text-center">Login</h1>

            {/* Display Success/Error Message */}
            {message && (
                <p className={`mb-4 ${message.includes("successful") ? "text-green-600" : "text-red-600"}`}>
                    {message}
                </p>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="w-full max-w-md bg-gray-100 p-8 rounded-lg shadow-lg">
                <div className="mb-6">
                    <label
                        htmlFor="username"
                        className="block text-gray-700 font-medium mb-2"
                    >
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter your username"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-[#000000]"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label
                        htmlFor="password"
                        className="block text-gray-700 font-medium mb-2"
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-[#000000]"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className={`w-full px-4 py-2 text-white font-medium rounded-lg transition ${
                        loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                    }`}
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            {/* Signup Redirect */}
            <p className="mt-6 text-gray-600">
                Don&#39;t have an account?{" "}
                <Link
                    href="/account/signup"
                    className="text-blue-500 hover:underline hover:text-blue-600"
                >
                    Sign up here
                </Link>
            </p>
        </div>
    );
}
