import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminModules } from '../hooks/useAdminModules';
import { Loader } from 'lucide-react';

interface ProtectedAdminRouteProps {
    children: React.ReactNode;
    requiredModule: string;
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({
    children,
    requiredModule,
}) => {
    const { hasModule, loading, modules } = useAdminModules();

    console.log('[ProtectedAdminRoute] Checking access:', {
        requiredModule,
        loading,
        hasAccess: hasModule(requiredModule),
        assignedModules: modules
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!hasModule(requiredModule)) {
        console.log('[ProtectedAdminRoute] Access DENIED - redirecting to unauthorized');
        return <Navigate to="/admin/unauthorized" replace />;
    }

    console.log('[ProtectedAdminRoute] Access GRANTED');
    return <>{children}</>;
};

export default ProtectedAdminRoute;
