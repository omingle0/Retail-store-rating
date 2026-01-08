import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Stores from './pages/Stores'
import AdminDashboard from './pages/AdminDashboard'
import OwnerDashboard from './pages/OwnerDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import UpdatePassword from './pages/UpdatePassword'
import AddUser from './pages/AddUser'
import AddStore from './pages/AddStore'
import Navbar from './components/Navbar'

const Layout = ({ children }) => (
    <>
        <Navbar />
        {children}
    </>
);

function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Search/User Routes */}
            <Route
                path="/stores"
                element={
                    <ProtectedRoute allowedRoles={['USER']}>
                        <Layout>
                            <Stores />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/update-password"
                element={
                    <ProtectedRoute allowedRoles={['USER', 'STORE_OWNER', 'ADMIN']}>
                        <Layout>
                            <UpdatePassword />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            {/* Admin Routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <Layout>
                            <AdminDashboard />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/add-user"
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <Layout>
                            <AddUser />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/add-store"
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <Layout>
                            <AddStore />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            {/* Owner Routes */}
            <Route
                path="/owner"
                element={
                    <ProtectedRoute allowedRoles={['STORE_OWNER']}>
                        <Layout>
                            <OwnerDashboard />
                        </Layout>
                    </ProtectedRoute>
                }
            />
        </Routes>
    )
}

export default App
