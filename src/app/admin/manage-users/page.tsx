// This page allows admins to view, delete and create users

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type User = {
    id: string;
    name: string;
    username: string;
    roleID: string;
    roleName: string;
    city: string;
    postcode: string;
    addLine1: string;
    addLine2?: string;
    addLine3?: string;
};

export default function ManageUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [newUser, setNewUser] = useState({
        name: "",
        username: "",
        password: "",
        roleID: "42661565-0374-48d1-9bb5-0ccf6c1d3300", // Default to Customer
        addLine1: "",
        addLine2: "",
        addLine3: "",
        city: "",
        postcode: "",
    });

    const router = useRouter();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("/api/get-users");
                const data = await response.json();
                if (response.ok) {
                    setUsers(data.users);
                } else {
                    console.error("Failed to fetch users:", data.error);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        // Map roleID to corresponding role string
        const roleMap: { [key: string]: string } = {
            "42661565-0374-48d1-9bb5-0ccf6c1d3300": "customer",
            "b746d3c3-e78f-4ca6-9fd4-e54282fd6564": "seller",
            "dd3c917f-d074-4570-9633-acd9255d0da6": "admin"
        };

        // Convert roleID to role string
        const userRole = roleMap[newUser.roleID];

        try {
            const response = await fetch("/api/new-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newUser,
                    role: userRole // ✅ Send role as string, not ID
                }),
            });

            if (response.ok) {
                alert("User added successfully!");
                setNewUser({
                    name: "",
                    username: "",
                    password: "",
                    roleID: "42661565-0374-48d1-9bb5-0ccf6c1d3300", // Reset to default
                    addLine1: "",
                    addLine2: "",
                    addLine3: "",
                    city: "",
                    postcode: "",
                });
                location.reload(); // Reload users
            } else {
                alert("Failed to add user.");
            }
        } catch (error) {
            console.error("Error adding user:", error);
        }
    };


    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const response = await fetch(`/api/delete-user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userID: userId }),
            });

            if (response.ok) {
                setUsers((prev) => prev.filter((user) => user.id !== userId));
            } else {
                alert("Failed to delete user.");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-3xl font-bold text-center mb-6">Manage Users</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side: Add New User Form */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Add New User</h2>
                    <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            required
                            className="p-2 rounded bg-gray-700 text-white"
                        />
                        <input
                            type="text"
                            placeholder="Username"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            required
                            className="p-2 rounded bg-gray-700 text-white"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            required
                            className="p-2 rounded bg-gray-700 text-white"
                        />
                        <input
                            type="text"
                            placeholder="Address Line 1"
                            value={newUser.addLine1}
                            onChange={(e) => setNewUser({ ...newUser, addLine1: e.target.value })}
                            required
                            className="p-2 rounded bg-gray-700 text-white"
                        />
                        <input
                            type="text"
                            placeholder="Address Line 2 (Optional)"
                            value={newUser.addLine2}
                            onChange={(e) => setNewUser({ ...newUser, addLine2: e.target.value })}
                            className="p-2 rounded bg-gray-700 text-white"
                        />
                        <input
                            type="text"
                            placeholder="Address Line 3 (Optional)"
                            value={newUser.addLine3}
                            onChange={(e) => setNewUser({ ...newUser, addLine3: e.target.value })}
                            className="p-2 rounded bg-gray-700 text-white"
                        />
                        <input
                            type="text"
                            placeholder="City"
                            value={newUser.city}
                            onChange={(e) => setNewUser({ ...newUser, city: e.target.value })}
                            required
                            className="p-2 rounded bg-gray-700 text-white"
                        />
                        <input
                            type="text"
                            placeholder="Postcode"
                            value={newUser.postcode}
                            onChange={(e) => setNewUser({ ...newUser, postcode: e.target.value })}
                            required
                            className="p-2 rounded bg-gray-700 text-white"
                        />
                        <select
                            value={newUser.roleID}
                            onChange={(e) => setNewUser({ ...newUser, roleID: e.target.value })}
                            className="p-2 rounded bg-gray-700 text-white"
                        >
                            <option value="42661565-0374-48d1-9bb5-0ccf6c1d3300">Customer</option>
                            <option value="b746d3c3-e78f-4ca6-9fd4-e54282fd6564">Seller</option>
                            <option value="dd3c917f-d074-4570-9633-acd9255d0da6">Admin</option>
                        </select>
                        <button type="submit" className="w-full bg-blue-600 py-2 font-bold rounded hover:bg-blue-700 transition">
                            Add User
                        </button>
                    </form>
                </div>

                {/* Right Side: Manage Users */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Search & Manage Users</h2>
                    <input
                        type="text"
                        placeholder="Search by name or username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 rounded bg-gray-700 text-white mb-4"
                    />
                    {isLoading ? (
                        <p className="text-gray-300">Loading users...</p>
                    ) : (
                        // ✅ Increased scrollable area height & formatted name (username)
                        <div className="h-[500px] overflow-y-auto"> {/* Adjust height as needed */}
                            {users
                                .filter((user) =>
                                    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    user.username.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map((user) => (
                                    <div key={user.id} className="bg-gray-700 p-4 rounded-lg mb-2 flex justify-between items-center">
                                        <div>
                                            {/* ✅ Updated format to show Name (Username) */}
                                            <p className="text-lg font-bold">{user.name} <span className="text-gray-400">({user.username})</span></p>
                                            <p className="text-sm text-gray-400">Role: {user.roleName}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => router.push(`/admin/manage-users/${user.id}`)} className="bg-yellow-600 px-3 py-2 rounded hover:bg-yellow-700 transition">Edit</button>
                                            <button onClick={() => handleDeleteUser(user.id)} className="bg-red-600 px-3 py-2 rounded hover:bg-red-700 transition">Remove</button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
