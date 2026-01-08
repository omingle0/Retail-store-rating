import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function AddStore() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        owner_id: ''
    });
    const [owners, setOwners] = useState([]); // List of potential owners
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch users to populate owner dropdown
        // Ideally filter for STORE_OWNER role
        const fetchOwners = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const response = await api.get('/admin/users?role=STORE_OWNER', { headers });

                const data = Array.isArray(response.data) ? response.data :
                    (response.data.data && Array.isArray(response.data.data)) ? response.data.data : [];

                setOwners(data);
                // Pre-select first owner if available
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, owner_id: data[0].u_id || data[0].id }));
                }
            } catch (error) {
                console.error("Failed to fetch owners:", error);
                toast.error("Could not load store owners list.");
            }
        };
        fetchOwners();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.owner_id) {
            toast.error('Please select a store owner');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await api.post('/admin/stores', formData, { headers });

            if (response.data.status === 'success' || response.data.data) {
                toast.success('Store created successfully!');
                navigate('/admin');
            } else {
                toast.success('Store created successfully!');
                navigate('/admin');
            }
        } catch (error) {
            console.error("Add store error:", error);
            const msg = error.response?.data?.error || error.response?.data?.message || 'Failed to create store';
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
                        <h2 className="text-2xl font-bold text-gray-900">Add New Store</h2>
                        <p className="text-sm text-gray-500 mt-2">Create a new store and assign it to an owner</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="My Awesome Store"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Store Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="contact@store.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                                name="address"
                                type="text"
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Store Location"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Owner</label>
                            <select
                                name="owner_id"
                                value={formData.owner_id}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="" disabled>Select an Owner</option>
                                {owners.map(owner => (
                                    <option key={owner.id || owner.u_id} value={owner.id || owner.u_id}>
                                        {owner.name} ({owner.email})
                                    </option>
                                ))}
                            </select>
                            {owners.length === 0 && <p className="text-xs text-red-500 mt-1">No store owners found. Create one first.</p>}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || owners.length === 0}
                                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading || owners.length === 0 ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Creating Store...' : 'Create Store'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
