import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import api from '../api/api';
export default function Stores() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // State to track which store is currently being rated
    const [activeRatingStoreId, setActiveRatingStoreId] = useState(null);
    const [ratingValue, setRatingValue] = useState(0);

    const fetchStores = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/store', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const storesData = Array.isArray(response.data) ? response.data :
                (response.data.data && Array.isArray(response.data.data)) ? response.data.data : [];

            setStores(storesData);
        } catch (error) {
            console.error("Error fetching stores:", error);
            toast.error('Failed to load stores. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    const handleRateClick = (store) => {
        setActiveRatingStoreId(store.s_id);
        // If user already rated, pre-fill with their rating, otherwise 0
        setRatingValue(store.user_rating || 0);
    };

    const handleCancelRating = () => {
        setActiveRatingStoreId(null);
        setRatingValue(0);
    };

    const handleSubmitRating = async (storeId) => {
        if (ratingValue === 0) {
            toast.warning('Please select a star rating first.');
            return;
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');
            await api.post('/store/rate',
                { s_id: storeId, rating: ratingValue },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Rating submitted successfully!');
            setActiveRatingStoreId(null);
            setRatingValue(0);
            // Re-fetch to update averages and user rating
            await fetchStores();

        } catch (error) {
            console.error("Error submitting rating:", error);
            toast.error(error.response?.data?.message || 'Failed to submit rating.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating, isInteractive = false) => {
        const stars = [];
        const roundedRating = Math.round(rating);

        for (let i = 1; i <= 5; i++) {
            let starClass = 'text-2xl ';

            if (isInteractive) {
                starClass += 'cursor-pointer transition-all hover:scale-125 ';
                starClass += i <= ratingValue ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-300';
            } else {
                starClass += i <= roundedRating ? 'text-yellow-400' : 'text-gray-300';
            }

            stars.push(
                <span
                    key={i}
                    className={starClass}
                    onClick={isInteractive ? () => setRatingValue(i) : undefined}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    const filteredStores = stores.filter(store => {
        return (
            store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.address?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-indigo-600 font-semibold text-lg">Loading stores...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Stores Dashboard</h1>
                    <p className="text-gray-500">Discover and rate the best retail stores around you.</p>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search stores by name or address..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 border-0 focus:outline-none focus:ring-0 text-sm text-gray-900 placeholder-gray-400"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {filteredStores.length === 0 ? (
                    <div className="text-center py-16">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-300 mb-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <p className="text-gray-500 text-lg">No stores found matching your search.</p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-sm text-gray-500">
                            Showing {filteredStores.length} {filteredStores.length === 1 ? 'store' : 'stores'}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredStores.map((store) => {
                                const avgRating = store.avg_rating ? parseFloat(store.avg_rating).toFixed(1) : null;
                                const isRatingThisStore = activeRatingStoreId === store.s_id;

                                return (
                                    <div key={store.s_id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-gray-100 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h2 className="text-xl font-semibold text-gray-900">{store.name}</h2>
                                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                                        </svg>
                                                        {store.email}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-start text-sm text-gray-600 mb-4 h-10 overflow-hidden text-ellipsis line-clamp-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gray-400 mt-0.5 flex-shrink-0">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                                </svg>
                                                <span>{store.address}</span>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 pt-4 mt-2">
                                            {/* Average Rating Display */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-1">
                                                    {avgRating ? (
                                                        <>
                                                            <div className="flex">{renderStars(avgRating, false)}</div>
                                                            <span className="text-sm text-gray-600 ml-2 font-medium">{avgRating}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-sm text-gray-400 italic">No ratings yet</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* User Rating Action Area */}
                                            <div>
                                                {isRatingThisStore ? (
                                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border-2 border-indigo-200">
                                                        <p className="text-xs font-medium text-gray-700 mb-2 text-center">Select your rating</p>
                                                        <div className="flex justify-center space-x-1 mb-3">
                                                            {renderStars(ratingValue, true)}
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleSubmitRating(store.s_id)}
                                                                disabled={submitting || ratingValue === 0}
                                                                className="flex-1 bg-indigo-600 text-white text-sm py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md"
                                                            >
                                                                {submitting ? (
                                                                    <span className="flex items-center justify-center gap-2">
                                                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                        </svg>
                                                                        Submitting...
                                                                    </span>
                                                                ) : 'Submit Rating'}
                                                            </button>
                                                            <button
                                                                onClick={handleCancelRating}
                                                                disabled={submitting}
                                                                className="flex-1 bg-white text-gray-700 border-2 border-gray-300 text-sm py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-all font-medium"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {store.user_rating ? (
                                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-600">
                                                                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                                                                        </svg>
                                                                        <span className="text-sm font-medium text-gray-700">
                                                                            Your rating: <span className="text-indigo-600 font-bold">{store.user_rating} ★</span>
                                                                        </span>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleRateClick(store)}
                                                                        className="text-xs bg-white text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 rounded-md border border-indigo-200 hover:bg-indigo-50 transition-colors"
                                                                    >
                                                                        Update
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleRateClick(store)}
                                                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                                                </svg>
                                                                Rate This Store
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
