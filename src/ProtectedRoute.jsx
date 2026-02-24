import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

function ProtectedRoute() {

    const { loading, isAuthenticated } = useAuth();

    if (loading) return <LoadingSpinner />;

    if (!loading && !isAuthenticated) return <Navigate to="/login" replace />;

    return (
        <Outlet />
    )
}

export default ProtectedRoute;