import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import api from '../api/api';
export default function OwnerDashboard() {
    const [stats, setStats] = useState({ avg_rating: 0 });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('Authentication required');
                    return;
                }
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch average rating and user list in parallel
                const [avgResponse, usersResponse] = await Promise.all([
                    api.get('/store/owner/average', { headers }),
                    api.get('/store/owner/dashboard', { headers })
                ]);

                // Handle Average Rating Response
                // Expecting response.data.data.avg_rating or similar
                const avgData = avgResponse.data.data || avgResponse.data || {};
                const safeAvg = avgData.avg_rating || 0;

                // Handle Users List Response
                const usersData = Array.isArray(usersResponse.data) ? usersResponse.data :
                    (usersResponse.data.data && Array.isArray(usersResponse.data.data)) ? usersResponse.data.data : [];

                setStats({ avg_rating: safeAvg });
                setUsers(usersData);

            } catch (error) {
                console.error("Dashboard data fetch error:", error);
                toast.error('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const renderStars = (rating) => {
        const stars = [];
        const roundedRating = Math.round(Number(rating) || 0);
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={`text-xl ${i <= roundedRating ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ★
                </span>
            );
        }
        return stars;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-indigo-600 font-semibold text-lg">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Owner Dashboard</h1>

                    <p className="text-gray-500">View your store's performance and customer feedback.</p>
                </div>

                {/* Stats Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100 max-w-sm">
                    <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Average Rating</h2>
                    <div className="flex items-end">
                        <span className="text-4xl font-bold text-gray-900 mr-3">
                            {Number(stats.avg_rating).toFixed(1)}
                        </span>
                        <div className="flex pb-1">
                            {renderStars(stats.avg_rating)}
                        </div>
                    </div>
                </div>

                {/* Users List Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900">Recent Ratings</h2>
                    </div>

                    {users.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No ratings received yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 text-sm font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Customer Name</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3">Rating</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((user, index) => (
                                        <tr key={user.id || index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                            <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-semibold text-gray-900">{user.rating}</span>
                                                    <span className="text-yellow-400 text-sm">★</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
