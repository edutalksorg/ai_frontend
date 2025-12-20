import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { permissionService } from '../services/permissionService';

// Module definitions
export interface ModuleDefinition {
    id: string;
    name: string;
    routes: string[];
    backendModules: string[]; // Backend module names from API
    icon?: string;
}

export const MODULE_DEFINITIONS: Record<string, ModuleDefinition> = {
    users: {
        id: 'users',
        name: 'User Management',
        routes: ['/admin/users', '/admin/instructors'],
        backendModules: ['UserManagement', 'InstructorApproval'],
    },
    payments: {
        id: 'payments',
        name: 'Payment Management',
        routes: ['/admin/payments'],
        backendModules: ['PaymentManagement', 'WalletManagement'],
    },
    subscriptions: {
        id: 'subscriptions',
        name: 'Subscription Management',
        routes: ['/admin/subscriptions'],
        backendModules: ['SubscriptionManagement'],
    },
    coupons: {
        id: 'coupons',
        name: 'Coupon Management',
        routes: ['/admin/coupons'],
        backendModules: ['CouponManagement'],
    },
    referrals: {
        id: 'referrals',
        name: 'Referral Management',
        routes: ['/admin/referrals'],
        backendModules: ['ReferralManagement'],
    },
    analytics: {
        id: 'analytics',
        name: 'Analytics',
        routes: ['/admin/analytics'],
        backendModules: ['ContentAnalysis', 'ReportManagement'],
    },
    profile: {
        id: 'profile',
        name: 'Profile Settings',
        routes: ['/admin/profile'],
        backendModules: ['ProfileManagement'],
    },
    settings: {
        id: 'settings',
        name: 'Settings',
        routes: ['/admin/settings'],
        backendModules: ['SystemManagement'],
    },
};

interface UseAdminModulesReturn {
    modules: string[];
    loading: boolean;
    error: string | null;
    hasModule: (moduleId: string) => boolean;
    hasAnyModule: (moduleIds: string[]) => boolean;
    canAccessRoute: (route: string) => boolean;
    refetch: () => Promise<void>;
}

// Cache for permissions to avoid refetching on every navigation
let permissionsCache: {
    userId: string | null;
    modules: string[];
    timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useAdminModules = (): UseAdminModulesReturn => {
    const [modules, setModules] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useSelector((state: RootState) => state.auth);

    const fetchModules = async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        // Check cache first
        const now = Date.now();
        if (
            permissionsCache &&
            permissionsCache.userId === user.id &&
            now - permissionsCache.timestamp < CACHE_DURATION
        ) {
            console.log('[useAdminModules] Using cached permissions');
            setModules(permissionsCache.modules);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Fetch user's assigned permission names
            const userPermData: any = await permissionService.getUserPermissions(user.id);
            const userPermissionNames: string[] = userPermData?.permissions || userPermData?.effectivePermissions || [];

            console.log('[useAdminModules] User permission names:', userPermissionNames);

            // Fetch all system permissions to get module information
            const allPermissionsData: any = await permissionService.getAllPermissions();
            console.log('[useAdminModules] All permissions RAW:', allPermissionsData);

            // Handle both array response and object with data property
            const allPermissions: any[] = Array.isArray(allPermissionsData)
                ? allPermissionsData
                : (allPermissionsData?.data || []);

            console.log('[useAdminModules] All permissions count:', allPermissions.length);

            // Extract unique backend modules from user's permissions
            const userBackendModules = new Set<string>();

            allPermissions.forEach((perm: any) => {
                // Check if this permission is assigned to the user
                if (userPermissionNames.includes(perm.name) && perm.module) {
                    userBackendModules.add(perm.module);
                }
            });

            console.log('[useAdminModules] User ID:', user.id);
            console.log('[useAdminModules] Backend modules from permissions:', Array.from(userBackendModules));

            // Map backend modules to our frontend modules
            const assignedModules = new Set<string>();

            Object.entries(MODULE_DEFINITIONS).forEach(([moduleId, moduleDef]) => {
                // Check if user has any backend module that matches this frontend module
                const hasModuleAccess = moduleDef.backendModules.some(backendModule =>
                    userBackendModules.has(backendModule)
                );

                console.log(`[useAdminModules] Module: ${moduleId}, Backend Modules: ${moduleDef.backendModules}, Has Access: ${hasModuleAccess}`);

                if (hasModuleAccess) {
                    assignedModules.add(moduleId);
                }
            });

            console.log('[useAdminModules] Assigned frontend modules:', Array.from(assignedModules));
            const modulesArray = Array.from(assignedModules);
            setModules(modulesArray);

            // Save to cache
            permissionsCache = {
                userId: user.id,
                modules: modulesArray,
                timestamp: Date.now()
            };
        } catch (err: any) {
            console.error('Failed to fetch admin modules:', err);
            setError(err.message || 'Failed to load modules');
            setModules([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModules();
    }, [user?.id]);

    const hasModule = (moduleId: string): boolean => {
        return modules.includes(moduleId);
    };

    const hasAnyModule = (moduleIds: string[]): boolean => {
        return moduleIds.some(id => modules.includes(id));
    };

    const canAccessRoute = (route: string): boolean => {
        // Always allow access to base admin route and profile/settings
        if (route === '/admin' || route === '/admindashboard' || route === '/admin/profile' || route === '/admin/settings') {
            return true;
        }

        // Check if route belongs to any assigned module
        return modules.some(moduleId => {
            const moduleDef = MODULE_DEFINITIONS[moduleId];
            return moduleDef?.routes.some(moduleRoute =>
                route.startsWith(moduleRoute)
            );
        });
    };

    return {
        modules,
        loading,
        error,
        hasModule,
        hasAnyModule,
        canAccessRoute,
        refetch: fetchModules,
    };
};

// Helper function to get module by route
export const getModuleByRoute = (route: string): string | null => {
    for (const [moduleId, moduleDef] of Object.entries(MODULE_DEFINITIONS)) {
        if (moduleDef.routes.some(r => route.startsWith(r))) {
            return moduleId;
        }
    }
    return null;
};
