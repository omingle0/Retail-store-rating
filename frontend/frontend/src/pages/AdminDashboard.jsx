import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import api from '../api/api';
export default function AdminDashboard() {
    const [stats, setStats] = useState({ users: 0, stores: 0, ratings: 0 });
    const [users, setUsers] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('Authentication required');
                    return;
                }
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch all required data in parallel
                const [dashboardRes, usersRes, storesRes] = await Promise.all([
                    api.get('/admin/dashboard', { headers }),
                    api.get('/admin/users', { headers }),
                    api.get('/admin/stores', { headers })
                ]);

                // Update Stats
                const statsData = dashboardRes.data.data || dashboardRes.data || {};
                setStats(statsData);

                // Update Users List
                const usersData = Array.isArray(usersRes.data) ? usersRes.data :
                    (usersRes.data.data && Array.isArray(usersRes.data.data)) ? usersRes.data.data : [];
                setUsers(usersData);

                // Update Stores List
                const storesData = Array.isArray(storesRes.data) ? storesRes.data :
                    (storesRes.data.data && Array.isArray(storesRes.data.data)) ? storesRes.data.data : [];
                setStores(storesData);

            } catch (error) {
                console.error("Admin data fetch error:", error);
                toast.error('Failed to load admin dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesSearch = (
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.address?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesRole = roleFilter ? user.role === roleFilter : true;
        return matchesSearch && matchesRole;
    });

    const filteredStores = stores.filter(store => {
        return (
            store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.address?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-indigo-600 font-semibold text-lg">Loading admin dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>

                    <p className="text-gray-500">Overview of system users, stores, and ratings.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Users</div>
                        <div className="mt-2 text-3xl font-bold text-gray-900">{stats.users}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Stores</div>
                        <div className="mt-2 text-3xl font-bold text-gray-900">{stats.stores}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Ratings</div>
                        <div className="mt-2 text-3xl font-bold text-gray-900">{stats.ratings}</div>
                    </div>
                </div>

                {/* Filters and Controls */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Tabs */}
                        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg self-start">
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Users
                            </button>
                            <button
                                onClick={() => setActiveTab('stores')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'stores' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Stores
                            </button>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row gap-4 flex-1 justify-end">
                            <input
                                type="text"
                                placeholder="Search by name, email, or address..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 max-w-md"
                            />

                            {activeTab === 'users' && (
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
                                >
                                    <option value="">All Roles</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="STORE_OWNER">Store Owner</option>
                                    <option value="USER">User</option>
                                </select>
                            )}
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">System Users</h2>
                            <span className="text-sm text-gray-500">{filteredUsers.length} records found</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 text-sm font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3">Address</th>
                                        <th className="px-6 py-3">Role</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                No users found matching your filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user, idx) => (
                                            <tr key={user.id || user.u_id || idx} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                                <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                                <td className="px-6 py-4 text-gray-500">{user.address}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                        user.role === 'STORE_OWNER' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Stores Table */}
                {activeTab === 'stores' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">Stores Overview</h2>
                            <span className="text-sm text-gray-500">{filteredStores.length} records found</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 text-sm font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Store Name</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3">Address</th>
                                        <th className="px-6 py-3">Rating</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredStores.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                No stores found matching your filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStores.map((store, idx) => (
                                            <tr key={store.id || store.s_id || idx} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 font-medium text-gray-900">{store.name}</td>
                                                <td className="px-6 py-4 text-gray-500">{store.email}</td>
                                                <td className="px-6 py-4 text-gray-500">{store.address}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <span className="font-semibold text-gray-900 mr-1">
                                                            {store.rating ? parseFloat(store.rating).toFixed(1) : 'N/A'}
                                                        </span>
                                                        {store.rating && <span className="text-yellow-400 text-sm">★</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
