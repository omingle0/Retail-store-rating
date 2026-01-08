import { Navigate } from 'react-router-dom';
import { isAuthenticated, getRole } from '../utils/auth';

export default function ProtectedRoute({ children, allowedRoles }) {
    if (!isAuthenticated()) {
        return <Navigate to="/" replace />;
    }

    const userRole = getRole();
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />;
    }

    return children;
}
