import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/api';

export default function UpdatePassword() {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.oldPassword || !formData.newPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        /* Client-side validation for new password (optional but good UX) */
        if (formData.newPassword.length < 8) {
            toast.error('New password must be at least 8 characters');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api.put('/user/password', formData, { headers });

            if (response.data.status === 'success' || response.data.data) {
                toast.success('Password updated successfully!');
                setFormData({ oldPassword: '', newPassword: '' });
            } else {
                // Handle cases where status isn't explicit
                toast.success('Password updated successfully!');
                setFormData({ oldPassword: '', newPassword: '' });
            }
        } catch (error) {
            console.error("Update password error:", error);
            const msg = error.response?.data?.error || error.response?.data?.message || 'Failed to update password';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Update Password</h2>
                        <p className="text-sm text-gray-500 mt-2">Secure your account with a new password</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                            <input
                                name="oldPassword"
                                type="password"
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter current password"
                                value={formData.oldPassword}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                name="newPassword"
                                type="password"
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter new password (min 8 chars)"
                                value={formData.newPassword}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
