import React, { useEffect, useState } from 'react';
import { Search, Loader, Users, Shield, GraduationCap, BookOpen, Filter, Calendar, X } from 'lucide-react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { adminService } from '../../services/admin';

const AllUsersPage: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'admin' | 'instructor' | 'user'>('all');
    const [platformStats, setPlatformStats] = useState({ total: 0, admins: 0, instructors: 0, learners: 0 });

    const fetchPlatformStats = async () => {
        try {
            const res = await adminService.getDashboardStats();
            const data = (res as any)?.data || res;
            if (data) {
                const adminCount = data.userRoleDistribution?.find((r: any) => String(r.role).toLowerCase() === 'admin')?.value || 0;
                const instructorCount = data.userRoleDistribution?.find((r: any) => String(r.role).toLowerCase() === 'instructor')?.value || 0;
                const learnerCount = data.userRoleDistribution?.find((r: any) => String(r.role).toLowerCase() === 'user')?.value || 0;

                setPlatformStats({
                    total: parseInt(data.totalUsers) || 0,
                    admins: parseInt(adminCount),
                    instructors: parseInt(instructorCount),
                    learners: parseInt(learnerCount)
                });
            }
        } catch (error) {
            console.error('Failed to fetch platform stats:', error);
        }
    };

    useEffect(() => {
        fetchPlatformStats();
    }, []);

    useEffect(() => {
        if (dateFilter === 'all' ||
            (dateFilter === 'custom' && startDate && endDate) ||
            (dateFilter === 'single' && startDate) ||
            ['today', 'yesterday', 'last7days', 'last30days'].includes(dateFilter)) {
            loadAllUsers();
        }
    }, [dateFilter, startDate, endDate]);

    const loadAllUsers = async () => {
        try {
            setLoading(true);
            let all: any[] = [];
            let page = 1;
            let hasMore = true;
            const pageSize = 100;

            while (hasMore) {
                const res = await adminService.getAllUsers(pageSize, page, {
                    search: searchTerm || undefined,
                    dateFilter: dateFilter !== 'all' ? dateFilter : undefined,
                    startDate: (dateFilter === 'custom' || dateFilter === 'single') ? startDate : undefined,
                    endDate: (dateFilter === 'custom' || dateFilter === 'single') ? (dateFilter === 'single' ? startDate : endDate) : undefined
                });
                const data = (res as any)?.data || res;
                const items = Array.isArray(data) ? data : data?.items || [];

                if (items.length === 0) {
                    hasMore = false;
                } else {
                    all = [...all, ...items];
                    if (items.length < pageSize) hasMore = false;
                    else page++;
                }

                if (page > 50) hasMore = false; // Safety
            }

            // Filter out SuperAdmin for clean display
            const filtered = all.filter((u: any) => !(u.role || '').toLowerCase().includes('superadmin'));

            setUsers(filtered);
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setLoading(false);
        }
    };

    // Derived Lists
    const getRole = (u: any) => (u.role || '').toLowerCase();

    const admins = users.filter(u => getRole(u).includes('admin'));
    const instructors = users.filter(u => getRole(u).includes('instructor'));
    const learners = users.filter(u => getRole(u).includes('user') || getRole(u).includes('learner'));

    // Filtering by Tab
    let displayedUsers = users;
    if (activeTab === 'admin') displayedUsers = admins;
    if (activeTab === 'instructor') displayedUsers = instructors;
    if (activeTab === 'user') displayedUsers = learners;

    // Search Filter
    if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        displayedUsers = displayedUsers.filter(u =>
            (u.fullName || '').toLowerCase().includes(lower) ||
            (u.email || '').toLowerCase().includes(lower) ||
            (u.phoneNumber || '').includes(lower)
        );
    }

    const StatCard = ({ title, count, icon: Icon, color, isActive, onClick }: any) => (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 w-full
                ${isActive
                    ? `bg-${color}-50 border-${color}-500 ring-1 ring-${color}-500 dark:bg-${color}-900/20`
                    : 'bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800'
                }
            `}
        >
            <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400 mb-3`}>
                <Icon size={24} />
            </div>
            <span className="text-2xl font-bold text-slate-800 dark:text-white">{count}</span>
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</span>
        </button>
    );

    return (
        <SuperAdminLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All Users Directory</h1>
                <p className="text-slate-600 dark:text-slate-400"> comprehensive view of all registered users across the platform.</p>
            </div>

            {/* Stats / Tabs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Total Users"
                    count={platformStats.total}
                    icon={Users}
                    color="indigo"
                    isActive={activeTab === 'all'}
                    onClick={() => setActiveTab('all')}
                />
                <StatCard
                    title="Admins"
                    count={platformStats.admins}
                    icon={Shield}
                    color="emerald"
                    isActive={activeTab === 'admin'}
                    onClick={() => setActiveTab('admin')}
                />
                <StatCard
                    title="Instructors"
                    count={platformStats.instructors}
                    icon={GraduationCap}
                    color="orange"
                    isActive={activeTab === 'instructor'}
                    onClick={() => setActiveTab('instructor')}
                />
                <StatCard
                    title="Learners"
                    count={platformStats.learners}
                    icon={BookOpen}
                    color="blue"
                    isActive={activeTab === 'user'}
                    onClick={() => setActiveTab('user')}
                />
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">

                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 transition-all duration-200">
                        <Calendar className="text-indigo-500" size={16} />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight leading-none mb-0.5">Date</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    if (e.target.value) setDateFilter('single');
                                    else setDateFilter('all');
                                }}
                                className="bg-transparent border-none p-0 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer focus:ring-0"
                            />
                        </div>
                        {startDate && (
                            <button
                                onClick={() => {
                                    setStartDate('');
                                    setDateFilter('all');
                                }}
                                className="ml-1 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                                title="Clear date filter"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        Showing {displayedUsers.length} results
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader className="animate-spin text-indigo-600" size={40} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-sm">User</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-sm">Role</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-sm">Status</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-sm">Contact</th>
                                    {/* <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-sm text-right">Actions</th> */}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {displayedUsers.length > 0 ? (
                                    displayedUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 flex-shrink-0">
                                                        {user.avatar ? <img src={user.avatar} className="w-10 h-10 rounded-full" /> : user.fullName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{user.fullName}</p>
                                                        <p className="text-xs text-slate-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`
                                                    px-2.5 py-0.5 rounded-full text-xs font-bold uppercase
                                                    ${getRole(user).includes('admin') ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                                        getRole(user).includes('instructor') ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}
                                                `}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {/* Assuming some inactive status exists, otherwise Active */}
                                                <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                                                    <span className={`w-2 h-2 rounded-full ${user.isActive === false ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                                    {user.isActive === false ? 'Inactive' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-slate-900 dark:text-white font-medium">
                                                        {user.phoneNumber || <span className="text-slate-400">N/A</span>}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                                        <Calendar size={10} className="text-slate-400" />
                                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </SuperAdminLayout>
    );
};

export default AllUsersPage;
