"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

// Define the user type
export default function EditUserPage() {
    const { userID } = useParams();
    const [userData, setUserData] = useState({
        name: "",
        username: "",
        password: "",
        addLine1: "",
        addLine2: "",
        addLine3: "",
        city: "",
        postcode: "",
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    // Fetch user data when the component mounts
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`/api/get-user?userID=${userID}`);
                const data = await response.json();
                if (response.ok) {
                    setUserData(data); // API directly returns user object
                } else {
                    setMessage("Failed to load user details.");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setMessage("Error loading user details.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserData({ ...userData, [e.target.id]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch("/api/update-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            const result = await response.json();
            if (response.ok) {
                setMessage("Profile updated successfully!");
            } else {
                setMessage(result.error || "Failed to update profile.");
            }
        } catch (error) {
            console.error("Update error:", error);
            setMessage("An error occurred while updating.");
        }
    };

    if (loading) {
        return <div className="min-h-screen flex justify-center items-center text-xl">Loading...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col items-center p-8">
            {/* Page Title */}
            <h1 className="text-4xl font-bold mb-6">My Profile</h1>

            {/* Display Success/Error Message */}
            {message && <p className={`mb-4 ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>{message}</p>}

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="w-full max-w-lg bg-gray-100 p-6 rounded-lg shadow-lg">
                {/* Full Name */}
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Full Name</label>
                    <input type="text" id="name" value={userData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black" required />
                </div>

                {/* Username */}
                <div className="mb-4">
                    <label htmlFor="username" className="block text-gray-700 font-medium mb-2">Username</label>
                    <input type="text" id="username" value={userData.username} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black" required />
                </div>

                {/* Password */}
                <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700 font-medium mb-2">New Password (Optional)</label>
                    <input type="password" id="password" value={userData.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black" />
                </div>

                {/* Address Fields */}
                <div className="mb-4">
                    <label htmlFor="addLine1" className="block text-gray-700 font-medium mb-2">Address Line 1</label>
                    <input type="text" id="addLine1" value={userData.addLine1} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="addLine2" className="block text-gray-700 font-medium mb-2">Address Line 2</label>
                    <input type="text" id="addLine2" value={userData.addLine2 || ""} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black" />
                </div>
                <div className="mb-4">
                    <label htmlFor="addLine3" className="block text-gray-700 font-medium mb-2">Address Line 3</label>
                    <input type="text" id="addLine3" value={userData.addLine3 || ""} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black" />
                </div>

                {/* City & Postcode */}
                <div className="mb-4">
                    <label htmlFor="city" className="block text-gray-700 font-medium mb-2">City</label>
                    <input type="text" id="city" value={userData.city} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black" required />
                </div>
                <div className="mb-6">
                    <label htmlFor="postcode" className="block text-gray-700 font-medium mb-2">Postcode</label>
                    <input type="text" id="postcode" value={userData.postcode} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black" required />
                </div>

                {/* Save Changes Button */}
                <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition">
                    Save Changes
                </button>
            </form>
        </div>
    );
}