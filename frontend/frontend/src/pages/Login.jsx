import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/user/login', { email, password });

            console.log('Login response:', response.data);

            let { token, role } = response.data.data;

            console.log('Extracted token:', token);
            console.log('Extracted role:', role);

            // Fix truncated role from backend (database column too short)
            if (role === 'STORE_O') {
                role = 'STORE_OWNER';
                console.log('Normalized truncated role to: STORE_OWNER');
            }

            localStorage.setItem('token', token);
            localStorage.setItem('role', role);

            console.log('Stored in localStorage - role:', localStorage.getItem('role'));

            toast.success('Login successful!');

            // Small delay to ensure localStorage is set
            setTimeout(() => {
                if (role === 'ADMIN') {
                    console.log('Navigating to /admin');
                    navigate('/admin');
                } else if (role === 'STORE_OWNER') {
                    console.log('Navigating to /owner');
                    navigate('/owner');
                } else {
                    console.log('Navigating to /stores');
                    navigate('/stores');
                }
            }, 100);
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-[380px] bg-white p-8 rounded-xl shadow-lg space-y-4">
                <h1 className="text-2xl font-semibold text-gray-800 text-center">Welcome Back</h1>
                <p className="text-sm text-gray-500 text-center">Enter your credentials to access your account</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-medium transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="text-sm text-center text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-indigo-600 hover:underline">
                        Register
                    </Link>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}
