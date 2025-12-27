import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Share2, Award, Users, DollarSign, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideUp } from '../../constants/animations';
import Button from '../../components/Button';
import { referralsService } from '../../services/referrals';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/uiSlice';

const UserReferrals: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [referralCode, setReferralCode] = useState<string>('');
    const [referralLink, setReferralLink] = useState<string>('');
    const [stats, setStats] = useState<any>({ earnings: 0, referralsCount: 0 });
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReferralData();
    }, []);

    const fetchReferralData = async () => {
        try {
            setLoading(true);
            const [codeRes, statsRes, historyRes] = await Promise.all([
                referralsService.getMyCode(),
                referralsService.getStats(),
                referralsService.getHistory()
            ]);

            const codeData = (codeRes as any)?.data || codeRes;
            setReferralCode(codeData?.code || '');
            setReferralLink(codeData?.shareableUrl || '');

            const statsData = (statsRes as any)?.data || statsRes;
            setStats({
                earnings: statsData?.totalEarnings || 0,
                referralsCount: statsData?.totalReferrals || 0,
                pendingReferrals: statsData?.pendingReferrals || 0,
                successfulReferrals: statsData?.successfulReferrals || 0
            });

            const historyData = Array.isArray(historyRes) ? historyRes : (historyRes as any)?.data || [];
            setHistory(historyData);

        } catch (error) {
            console.error('Failed to load referrals:', error);
            // dispatch(showToast({ message: 'Failed to load referral data', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        dispatch(showToast({ message: 'Referral link copied!', type: 'success' }));
    };

    if (loading) return <div className="text-center py-12 text-slate-500">Loading referral program...</div>;

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex items-center gap-8">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(-1)}
                    className="w-14 h-14 flex items-center justify-center bg-slate-100 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-primary-500/10 dark:border-white/10 text-slate-900 dark:text-white transition-all hover:bg-slate-200 dark:hover:bg-white/10 shadow-2xl"
                >
                    <ArrowLeft size={24} />
                </motion.button>
                <div>
                    <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
                        REFERRAL <span className="text-primary-600 dark:text-primary-400">PROGRAM</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 opacity-70">
                        Expand the Network & Earn Rewards
                    </p>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-6 md:p-10 text-white shadow-2xl border border-white/5">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary-500/5 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />

                <div className="relative z-10 text-center max-w-4xl mx-auto">
                    <h2 className="text-xl md:text-2xl font-semibold tracking-tight leading-tight mb-4 uppercase">
                        Invite Friends & <span className="text-primary-400">Earn Rewards</span>
                    </h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 opacity-80">Get a month of Premium for every friend who joins!</p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                        {/* Link Section */}
                        <div className="space-y-4 text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary-400 ml-1">Your Referral Link</p>
                            <div className="flex gap-3">
                                <div className="flex-1 bg-white/[0.02] border border-white/10 rounded-2xl px-6 h-14 flex items-center overflow-hidden">
                                    <p className="text-xs font-medium text-slate-400 truncate w-full tracking-wider">{referralLink}</p>
                                </div>
                                <button
                                    onClick={() => { navigator.clipboard.writeText(referralLink); dispatch(showToast({ message: 'Link copied!', type: 'success' })); }}
                                    className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20 hover:scale-110 active:scale-95 transition-all shrink-0"
                                >
                                    <Copy size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Code Section */}
                        <div className="space-y-4 text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary-400 ml-1">Your Referral Code</p>
                            <div className="flex gap-3">
                                <div className="flex-1 bg-white/[0.02] border border-white/10 rounded-2xl px-6 h-14 flex items-center overflow-hidden">
                                    <p className="text-xl font-black text-white tracking-[0.2em] w-full">{referralCode}</p>
                                </div>
                                <button
                                    onClick={() => { navigator.clipboard.writeText(referralCode); dispatch(showToast({ message: 'Code copied!', type: 'success' })); }}
                                    className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20 hover:scale-110 active:scale-95 transition-all shrink-0"
                                >
                                    <Copy size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="glass-card p-6 md:p-8 rounded-3xl text-center space-y-6 border border-white/5 shadow-2xl">
                    <div className="w-16 h-16 bg-primary-600/10 text-primary-600 rounded-2xl flex items-center justify-center mx-auto">
                        <Users size={28} />
                    </div>
                    <div>
                        <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter">{stats.referralsCount}</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">Friends Joined</p>
                    </div>
                </div>
                <div className="glass-card p-6 md:p-8 rounded-3xl text-center space-y-6 border border-white/5 shadow-2xl">
                    <div className="w-16 h-16 bg-primary-600/10 text-primary-600 rounded-2xl flex items-center justify-center mx-auto">
                        <DollarSign size={28} />
                    </div>
                    <div>
                        <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter">₹{stats.earnings}</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">Total Earnings</p>
                    </div>
                </div>
                <div className="glass-card p-6 md:p-8 rounded-3xl text-center space-y-6 border border-white/5 shadow-2xl">
                    <div className="w-16 h-16 bg-primary-600/10 text-primary-600 rounded-2xl flex items-center justify-center mx-auto">
                        <Award size={28} />
                    </div>
                    <div>
                        <h3 className="text-5xl font-black text-white tracking-tighter">Tier 1</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">Elite Status</p>
                    </div>
                </div>
            </div>

            {/* History */}
            <div className="glass-card rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                        <Award size={16} className="text-primary-600" /> Referral History
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <th className="px-8 py-6">Identity</th>
                                <th className="px-8 py-6">Timestamp</th>
                                <th className="px-8 py-6">Protocol Status</th>
                                <th className="px-8 py-6 text-right">Settlement</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary-500/5">
                            {history.length > 0 ? (
                                history.map((item, i) => (
                                    <tr key={i} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-6">
                                            <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{item.refereeName || 'Anonymous User'}</p>
                                        </td>
                                        <td className="px-8 py-6 text-xs text-slate-500 font-medium">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.status === 'converted' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                {item.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right font-black text-green-500 text-sm">
                                            {item.rewardAmount ? `+₹${item.rewardAmount}` : '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-50">No data records in the referral protocols</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserReferrals;

