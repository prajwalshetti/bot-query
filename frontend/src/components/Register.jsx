import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { UserPlus, Mail, Lock, LogIn, Home, AlertCircle, CheckCircle } from 'lucide-react';

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const loginUser = async () => {
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:8000/api/v1/user/loginuser", {
                email,
                password
            }, { withCredentials: true });

            if (response.status === 200) {
                // setTimeout(() => navigate("/dashboard"), 1500);
            } else {
                console.log("User Login Failed");
            }
        } catch (error) {
            console.log("User Login Failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:8000/api/v1/user/register", {
                username,
                email,
                password
            });
            if (response.status === 200) {
                setSuccess("User registered successfully");
                await loginUser();
                navigate("/dashboard")
            } else {
                setError("User registration failed");
            }
        } catch (error) {
            setError("User registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8" style={{
            backgroundImage: "url('/chess-background.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: "overlay"
        }}>
            <div className="max-w-md w-full mx-auto space-y-8">
                {/* Chess-themed Card Container */}
                <div className="bg-black/70 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden p-8 space-y-6 border border-gray-700">
                    {/* Header */}
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 bg-gradient-to-r from-amber-600 to-amber-800 rounded-full flex items-center justify-center">
                            <UserPlus className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="mt-4 text-3xl font-bold text-white tracking-tight">
                            Join the Chess World
                        </h2>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="flex items-center p-4 bg-red-900/50 rounded-lg text-red-200 animate-fade-in border border-red-700">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center p-4 bg-green-900/50 rounded-lg text-green-200 animate-fade-in border border-green-700">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            {/* Username Field */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserPlus className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="pl-10 w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-white"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-white"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-white"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                            ) : (
                                'Register'
                            )}
                        </button>
                    </form>

                    {/* Footer Actions */}
                    <div className="space-y-4">
                        <div className="text-center">
                            <span className="text-sm text-gray-400">Already a player?</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => navigate("/login")}
                                className="flex items-center justify-center py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                            >
                                <LogIn className="h-4 w-4 mr-2" />
                                Login
                            </button>
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="flex items-center justify-center py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                            >
                                <Home className="h-4 w-4 mr-2" />
                                Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;