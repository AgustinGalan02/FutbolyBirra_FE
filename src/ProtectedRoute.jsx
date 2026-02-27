import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

function ProtectedRoute() {

    const { loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }
    if (!loading && !isAuthenticated) return <Navigate to="/" replace />;

    return (<Outlet />)
}

export default ProtectedRoute;