import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Users, Loader, AlertCircle, CheckCircle, X, Eye, ArrowLeft } from 'lucide-react';
import { RootState } from '../../store';
import { adminService } from '../../services/admin';
import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

interface UserData {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    role: string;
    subscriptionStatus?: string;
    isApproved?: boolean;
    createdAt?: string;
    avatar?: string;
}

const AdminUsersPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<UserData[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
    const [stats, setStats] = useState({ total: 0, instructors: 0, learners: 0 });
    const [filterRole, setFilterRole] = useState<'all' | 'instructor' | 'user'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    // Only allow admin role
    if (!user || String(user.role).toLowerCase() !== 'admin') {
        return <Navigate to="/" replace />;
    }

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const res = await adminService.getAllUsers(1000, 1);
            const responseData = (res as any)?.data || res;
            const allUsers = Array.isArray(responseData) ? responseData : responseData?.items || [];

            setUsers(allUsers);
            setFilteredUsers(allUsers);

            // Calculate stats
            const instructorCount = allUsers.filter((u: UserData) =>
                String(u.role).toLowerCase() === 'instructor'
            ).length;
            const learnerCount = allUsers.filter((u: UserData) =>
                String(u.role).toLowerCase() === 'user'
            ).length;

            setStats({
                total: allUsers.length,
                instructors: instructorCount,
                learners: learnerCount,
            });
        } catch (error) {
            console.error('Failed to load users:', error);
            Toast({ type: 'error', message: 'Failed to load users' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = users;

        // Filter by role
        if (filterRole !== 'all') {
            filtered = filtered.filter(u => String(u.role).toLowerCase() === filterRole);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(u =>
                u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.phoneNumber?.includes(searchTerm)
            );
        }

        setFilteredUsers(filtered);
    }, [filterRole, searchTerm, users]);

    const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive' | 'banned') => {
        try {
            await adminService.changeUserStatus(userId, newStatus);
            Toast({ type: 'success', message: 'User status updated successfully' });
            loadUsers();
        } catch (error) {
            console.error('Failed to update user status:', error);
            Toast({ type: 'error', message: 'Failed to update user status' });
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admindashboard')}
                            className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-full transition-colors text-blue-600 dark:text-blue-400"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">
                                Manage all users, instructors, and learners
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/admin/instructors')}
                    >
                        Manage Instructors
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Users</p>
                                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">{stats.total}</p>
                            </div>
                            <Users className="w-12 h-12 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">Instructors</p>
                                <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">{stats.instructors}</p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Learners</p>
                                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">{stats.learners}</p>
                            </div>
                            <AlertCircle className="w-12 h-12 text-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                        <div className="flex gap-2">
                            <Button
                                variant={filterRole === 'all' ? 'primary' : 'secondary'}
                                onClick={() => setFilterRole('all')}
                            >
                                All Users ({users.length})
                            </Button>
                            <Button
                                variant={filterRole === 'instructor' ? 'primary' : 'secondary'}
                                onClick={() => setFilterRole('instructor')}
                            >
                                Instructors ({stats.instructors})
                            </Button>
                            <Button
                                variant={filterRole === 'user' ? 'primary' : 'secondary'}
                                onClick={() => setFilterRole('user')}
                            >
                                Learners ({stats.learners})
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredUsers.map((userData) => (
                                    <tr key={userData.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                                        {userData.fullName?.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {userData.fullName}
                                                    </div>
                                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                                        {userData.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${userData.role === 'Instructor'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                {userData.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${userData.isApproved
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                {userData.isApproved ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(userData);
                                                    setShowDetails(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-slate-500 dark:text-slate-400">No users found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* User Details Modal */}
            {showDetails && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">User Details</h2>
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Name</label>
                                    <p className="text-lg text-slate-900 dark:text-white">{selectedUser.fullName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</label>
                                    <p className="text-lg text-slate-900 dark:text-white">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Phone</label>
                                    <p className="text-lg text-slate-900 dark:text-white">{selectedUser.phoneNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Role</label>
                                    <p className="text-lg text-slate-900 dark:text-white">{selectedUser.role}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</label>
                                    <p className="text-lg text-slate-900 dark:text-white">
                                        {selectedUser.isApproved ? 'Approved' : 'Pending'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminUsersPage;
