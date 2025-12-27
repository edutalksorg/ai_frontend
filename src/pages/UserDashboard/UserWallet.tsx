import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, Clock, ArrowLeft, AlertCircle, CheckCircle, XCircle, Gift } from 'lucide-react';
import Button from '../../components/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideUp, buttonClick } from '../../constants/animations';
import { walletService } from '../../services/wallet';
import { referralsService } from '../../services/referrals';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/uiSlice';

interface WalletBalance {
    balance: number;
    currency: string;
    frozenAmount: number;
    availableBalance: number;
    totalEarnings: number;
    totalSpent: number;
    pendingTransactions: any[];
}

interface Transaction {
    id: string;
    type: string;
    status: string;
    amount: number;
    currency: string;
    description: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
    createdAt: string;
    failureReason?: string;
}

const UserWallet: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [walletData, setWalletData] = useState<WalletBalance>({
        balance: 0,
        currency: 'INR',
        frozenAmount: 0,
        availableBalance: 0,
        totalEarnings: 0,
        totalSpent: 0,
        pendingTransactions: []
    });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [referralEarnings, setReferralEarnings] = useState(0);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const [balanceRes, transactionsRes, referralStatsRes] = await Promise.all([
                walletService.getBalance(),
                walletService.getTransactions(),
                referralsService.getStats().catch(() => ({ data: { totalEarnings: 0 } }))
            ]);

            const balanceData = (balanceRes as any)?.data || balanceRes;
            setWalletData({
                balance: balanceData?.balance || 0,
                currency: balanceData?.currency || 'INR',
                frozenAmount: balanceData?.frozenAmount || 0,
                availableBalance: balanceData?.availableBalance || 0,
                totalEarnings: balanceData?.totalEarnings || 0,
                totalSpent: balanceData?.totalSpent || 0,
                pendingTransactions: balanceData?.pendingTransactions || []
            });

            const txList = Array.isArray(transactionsRes) ? transactionsRes : (transactionsRes as any)?.data || [];
            // Sort transactions by date (most recent first)
            const sortedTransactions = txList.sort((a: Transaction, b: Transaction) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            setTransactions(sortedTransactions);

            // Fetch referral earnings
            const referralData = (referralStatsRes as any)?.data || referralStatsRes;
            setReferralEarnings(referralData?.totalEarnings || 0);
        } catch (error) {
            console.error('Failed to load wallet:', error);
            dispatch(showToast({ message: 'Failed to load wallet info', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };



    const [showWithdraw, setShowWithdraw] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const amount = parseFloat(formData.get('amount') as string);

        if (amount <= 0) {
            dispatch(showToast({ message: 'Invalid amount', type: 'error' }));
            return;
        }

        const bankDetails = {
            bankName: formData.get('bankName') as string,
            accountHolderName: formData.get('accountHolderName') as string,
            accountNumber: formData.get('accountNumber') as string,
            ifsc: formData.get('ifsc') as string,
            routingNumber: '', // Optional/Default
            upi: formData.get('upi') as string || ''
        };

        try {
            setWithdrawLoading(true);
            await walletService.withdraw({
                amount,
                currency: 'INR',
                bankDetails
            });
            dispatch(showToast({ message: 'Withdrawal requested successfully', type: 'success' }));
            setShowWithdraw(false);
            fetchWalletData();
        } catch (error) {
            console.error('Withdrawal failed:', error);
            dispatch(showToast({ message: 'Withdrawal failed', type: 'error' }));
        } finally {
            setWithdrawLoading(false);
        }
    };

    if (loading) return <div className="text-center py-12 text-slate-500">Loading wallet...</div>;

    // Helper function to determine transaction icon and color
    const getTransactionStyle = (type: string) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('credit') || lowerType.includes('reward') || lowerType.includes('refund')) {
            return {
                icon: <TrendingUp size={20} />,
                bgColor: 'bg-green-100 dark:bg-green-900/30',
                textColor: 'text-green-600 dark:text-green-400',
                amountColor: 'text-green-600',
                prefix: '+'
            };
        } else {
            return {
                icon: <TrendingDown size={20} />,
                bgColor: 'bg-red-100 dark:bg-red-900/30',
                textColor: 'text-red-600 dark:text-red-400',
                amountColor: 'text-slate-900 dark:text-white',
                prefix: '-'
            };
        }
    };

    // Helper function to get status badge
    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle size={12} /> Completed
                    </span>
                );
            case 'pending':
            case 'processing':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <AlertCircle size={12} /> {status}
                    </span>
                );
            case 'failed':
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <XCircle size={12} /> {status}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6 md:space-y-10">
            {/* Header */}
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
                        FINANCIAL <span className="text-primary-600 dark:text-primary-400">ASSETS</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 opacity-70">
                        Liquid Balance & Transaction History
                    </p>
                </div>
            </div>

            {/* Main Balance Card */}
            <motion.div
                variants={slideUp}
                initial="initial"
                animate="animate"
                className="glass-card backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-primary-500/10 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-600/10 rounded-2xl flex items-center justify-center">
                                <Wallet className="text-primary-600" size={24} />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-tight">Total Available Balance</h3>
                                <p className="text-[9px] font-black text-primary-600 uppercase tracking-widest mt-0.5 opacity-70">Verified Capital</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight uppercase leading-tight">
                                {walletData.currency} {walletData.balance.toLocaleString()}
                            </h4>
                            <div className="flex flex-wrap items-center gap-6 mt-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available: {walletData.currency} {walletData.availableBalance.toLocaleString()}</span>
                                </div>
                                {walletData.frozenAmount > 0 && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-amber-500 rounded-full" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Locked: {walletData.currency} {walletData.frozenAmount.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 min-w-[200px] w-full md:w-auto">
                        <Button
                            size="md"
                            onClick={() => setShowWithdraw(!showWithdraw)}
                            className="h-14 px-8 bg-primary-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all w-full"
                        >
                            {showWithdraw ? 'CANCEL WITHDRAWAL' : 'WITHDRAW CAPITAL'}
                        </Button>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center opacity-70">Standard Settlement: T+2</p>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-primary-600/10 text-primary-600 rounded-xl flex items-center justify-center">
                            <TrendingUp size={20} />
                        </div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gross Yield</h4>
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">₹{walletData.totalEarnings.toLocaleString()}</p>
                </div>
                <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-primary-600/10 text-primary-600 rounded-xl flex items-center justify-center">
                            <Gift size={20} />
                        </div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Voucher Accruals</h4>
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">₹{referralEarnings.toLocaleString()}</p>
                </div>
                <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center">
                            <TrendingDown size={20} />
                        </div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Outbound Flows</h4>
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">₹{walletData.totalSpent.toLocaleString()}</p>
                </div>
            </div>

            {/* Withdrawal Interface */}
            <AnimatePresence>
                {showWithdraw && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="glass-card rounded-3xl p-6 md:p-10 border border-[#433355]/20 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-red-400/10 rounded-2xl flex items-center justify-center">
                                <TrendingDown className="text-red-400" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Withdrawal Authorization</h3>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 opacity-70">Secured Settlement Channel</p>
                            </div>
                        </div>

                        <form onSubmit={handleWithdraw} className="space-y-10">
                            <div className="space-y-8">
                                {/* Amount Input */}
                                <div className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 ml-1 opacity-70">Transfer Volume</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-900 dark:text-white opacity-20">₹</span>
                                        <input
                                            name="amount"
                                            type="number"
                                            min="1"
                                            max={walletData.availableBalance}
                                            required
                                            className="w-full pl-16 pr-8 h-20 bg-slate-100/50 dark:bg-white/[0.03] border border-primary-500/10 dark:border-white/10 rounded-2xl text-2xl font-black focus:border-primary-600 text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mt-6 flex items-center gap-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        MAXIMUM LIQUIDITY: ₹{walletData.availableBalance.toLocaleString()}
                                    </p>
                                </div>

                                {/* Bank Configuration */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 opacity-70">Banking Institution</label>
                                        <input name="bankName" required className="w-full px-6 h-14 bg-slate-100/50 dark:bg-white/[0.02] border border-primary-500/10 dark:border-white/10 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] focus:border-primary-600 text-slate-900 dark:text-white outline-none placeholder:text-slate-400" placeholder="BANK NAME" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 opacity-70">IFSC Credentials</label>
                                        <input name="ifsc" required className="w-full px-6 h-14 bg-slate-100/50 dark:bg-white/[0.02] border border-primary-500/10 dark:border-white/10 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] focus:border-primary-600 text-slate-900 dark:text-white outline-none placeholder:text-slate-400" placeholder="IFSC CODE" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 opacity-70">Target Account ID</label>
                                        <input name="accountNumber" required className="w-full px-6 h-14 bg-slate-100/50 dark:bg-white/[0.02] border border-primary-500/10 dark:border-white/10 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] focus:border-primary-600 text-slate-900 dark:text-white outline-none placeholder:text-slate-400" placeholder="ACCOUNT NUMBER" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 opacity-70">Legal Beneficiary</label>
                                        <input name="accountHolderName" required className="w-full px-6 h-14 bg-slate-100/50 dark:bg-white/[0.02] border border-primary-500/10 dark:border-white/10 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] focus:border-primary-600 text-slate-900 dark:text-white outline-none placeholder:text-slate-400" placeholder="NAME AS PER BANK" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 opacity-70">Unified Payments Interface (UPI)</label>
                                    <input name="upi" className="w-full px-6 h-14 bg-slate-100/50 dark:bg-white/[0.02] border border-primary-500/10 dark:border-white/10 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] focus:border-primary-600 text-slate-900 dark:text-white outline-none placeholder:text-slate-400" placeholder="USER@UPI" />
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pt-4">
                                <Button
                                    type="submit"
                                    isLoading={withdrawLoading}
                                    className="h-14 px-12 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    Confirm Settlement
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => setShowWithdraw(false)}
                                    className="h-14 px-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-slate-900 dark:hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Transaction History */}
            <motion.div
                variants={fadeIn}
                initial="initial"
                animate="animate"
                className="glass-card rounded-3xl border border-white/5 shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] flex items-center gap-3">
                        <Clock size={16} className="text-primary-600" /> Transaction Logs
                    </h3>
                </div>

                <div className="divide-y divide-white/5">
                    {transactions.length > 0 ? (
                        transactions.map((tx, idx) => {
                            const style = getTransactionStyle(tx.type);
                            return (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-6 hover:bg-white/[0.02] transition-colors group"
                                >
                                    <div className="flex justify-between items-center gap-8">
                                        <div className="flex items-center gap-6 flex-1">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${style.bgColor} ${style.textColor}`}>
                                                {style.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                                                    <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.1em]">{tx.description || tx.type}</p>
                                                    <div className="scale-90 origin-left">
                                                        {getStatusBadge(tx.status)}
                                                    </div>
                                                </div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-60">
                                                    {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} • {new Date(tx.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`text-2xl md:text-3xl font-black tracking-tighter ${style.amountColor}`}>
                                            {style.prefix}₹{Math.abs(tx.amount).toLocaleString()}
                                        </div>
                                    </div>
                                    {tx.failureReason && (
                                        <div className="mt-6 p-4 bg-red-500/5 rounded-2xl border border-red-500/10 flex items-center gap-3">
                                            <XCircle size={16} className="text-red-400" />
                                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">
                                                REJECTED: {tx.failureReason}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="p-32 text-center">
                            <Clock size={48} className="mx-auto text-slate-800 mb-6 opacity-30" />
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">No Assets Logged</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default UserWallet;

