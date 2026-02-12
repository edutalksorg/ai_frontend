import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Play, Phone, User, Calendar, Clock, Volume2, Shield, ArrowLeft, Trash2 } from 'lucide-react';
import { callsService } from '../../services/calls';
import Button from '../../components/Button';
import { callLogger } from '../../utils/callLogger';

interface VoiceRecord {
    callId: string;
    callerName: string;
    calleeName: string;
    startedAt: string;
    initiatedAt?: string;
    startTime?: string;
    startedat?: string;
    createdAt?: string;
    created_at?: string;
    timestamp?: string;
    time?: string;
    date?: string;
    durationSeconds: number;
    status: string;
    recordingUrl?: string;
    id?: string;
    Id?: string;
    Created?: string;
    DateTime?: string;
    Time?: string;
    loggedAt?: string;
    LoggedAt?: string;
    StartedAt?: string;
    InitiatedAt?: string;
    CreatedAt?: string;
}

const VoiceRecordsPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [records, setRecords] = useState<VoiceRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [playingId, setPlayingId] = useState<string | number | null>(null);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchRecords = async (search?: string) => {
        try {
            setLoading(true);
            const response: any = await callsService.adminGetAllCalls({ search });
            let items = response.data || response || [];

            // Senior Dev: Sort by recency (most recent at top)
            items = [...items].sort((a, b) => {
                const dateA = new Date(a.startedAt || a.initiatedAt || a.startTime || a.startedat || a.createdAt || a.created_at || a.timestamp || a.time || a.date || a.StartedAt || a.InitiatedAt || a.CreatedAt || a.Created || a.DateTime || a.Time || a.loggedAt || a.LoggedAt || 0).getTime();
                const dateB = new Date(b.startedAt || b.initiatedAt || b.startTime || b.startedat || b.createdAt || b.created_at || b.timestamp || b.time || b.date || b.StartedAt || b.InitiatedAt || b.CreatedAt || b.Created || b.DateTime || b.Time || b.loggedAt || b.LoggedAt || 0).getTime();

                if (dateB !== dateA) return dateB - dateA;

                // Secondary sort by ID if dates are missing or same
                const idA = parseInt(String(a.callId || a.id || a.Id || 0));
                const idB = parseInt(String(b.callId || b.id || b.Id || 0));
                return idB - idA;
            });

            setRecords(items);
        } catch (error) {
            callLogger.error('Failed to fetch voice records', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords(debouncedSearch);
    }, [debouncedSearch]);

    const handleDownload = async (record: VoiceRecord | any) => {
        const url = record.recordingUrl || record.recording_url;
        if (!url) {
            console.warn('No recording URL available for download');
            return;
        }

        try {
            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            const fullUrl = url.startsWith('http') ? url : `${apiUrl}${url}`;

            // Fetch the file as a blob
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'audio/webm,audio/*,*/*'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to download: ${response.statusText}`);
            }

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            // Create download link
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `call_recording_${record.callId}_${new Date().toISOString().slice(0, 10)}.webm`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up blob URL
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);

            callLogger.info('Recording downloaded successfully');
        } catch (error) {
            callLogger.error('Failed to download recording', error);
            alert('Failed to download recording. Please try again.');
        }
    };

    const handleDelete = async (callId: string) => {
        if (!window.confirm('Are you sure you want to delete this call record and its recording? This action cannot be undone.')) {
            return;
        }

        try {
            setLoading(true);
            await callsService.adminDeleteCall(callId);
            setRecords(prev => prev.filter(r => r.callId !== callId));
            callLogger.info(`Call record ${callId} deleted successfully`);
        } catch (error) {
            callLogger.error(`Failed to delete call record ${callId}`, error);
            alert('Failed to delete call record. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // We use server-side search now
    const filteredRecords = records;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Go Back"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Volume2 className="text-violet-500" />
                            Voice Call Records
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Monitor and manage all call recordings across the platform.
                        </p>
                    </div>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by Name, Email, Phone or ID..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Call Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Participants</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Recording</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 animate-pulse">
                                        Loading voice records...
                                    </td>
                                </tr>
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No call records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => (
                                    <tr key={record.callId} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white">ID: {record.callId || (record as any).id || (record as any).Id}</span>
                                                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                                                    <Calendar size={12} className="text-violet-500" />
                                                    {(() => {
                                                        const dateVal = record.startedAt || record.initiatedAt || record.startTime || record.startedat || record.createdAt || record.created_at || record.timestamp || record.time || record.date || record.StartedAt || record.InitiatedAt || record.CreatedAt || record.Created || record.DateTime || record.Time || record.loggedAt || record.LoggedAt;
                                                        if (!dateVal) return 'N/A';
                                                        // Robust date parsing
                                                        const dateStr = String(dateVal);
                                                        // Ensure Z if it looks like ISO but lacks it, but only if not already containing offset
                                                        let finalDateStr = dateStr;
                                                        if (dateStr.includes('-') && !dateStr.includes('Z') && !dateStr.includes('+') && dateStr.includes(':')) {
                                                            finalDateStr = `${dateStr}Z`;
                                                        }
                                                        const date = new Date(finalDateStr.includes('T') || finalDateStr.includes('-') || isNaN(Number(finalDateStr)) ? finalDateStr : Number(finalDateStr));
                                                        if (isNaN(date.getTime())) return 'N/A';
                                                        return date.toLocaleString();
                                                    })()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    <span className="w-5 h-5 bg-blue-500/10 text-blue-600 rounded flex items-center justify-center text-[10px] font-bold border border-blue-500/20">C</span>
                                                    {record.callerName || (record as any).callerFullName || (record as any).caller?.fullName || (record as any).CallerName || 'N/A'}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    <span className="w-5 h-5 bg-green-500/10 text-green-600 rounded flex items-center justify-center text-[10px] font-bold border border-green-500/20">R</span>
                                                    {record.calleeName || (record as any).calleeFullName || (record as any).callee?.fullName || (record as any).CalleeName || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                                <Clock size={14} />
                                                {(() => {
                                                    const dur = record.durationSeconds !== undefined ? record.durationSeconds : ((record as any).duration || (record as any).DurationSeconds || (record as any).Duration || 0);
                                                    return `${Math.floor(dur / 60)}:${(dur % 60).toString().padStart(2, '0')}`;
                                                })()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${['completed', 'ended', 'accepted', 'ongoing', 'active'].includes(record.status?.toLowerCase())
                                                ? 'bg-green-100 text-green-800'
                                                : record.status?.toLowerCase().includes('reject') || record.status?.toLowerCase().includes('fail') || record.status?.toLowerCase().includes('miss')
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {(() => {
                                                    const s = (record.status || '').toLowerCase();
                                                    if (s === 'completed' || s === 'ended') return t('voiceCall.completed');
                                                    if (s === 'accepted') return t('voiceCall.accepted');
                                                    if (s.includes('reject')) return t('voiceCall.rejected');
                                                    if (s.includes('miss')) return t('voiceCall.missed');
                                                    if (s === 'initiated' || s === 'ringing' || s === 'outgoing') return t('voiceCall.outgoing');
                                                    if (s === 'incoming') return t('voiceCall.incoming');
                                                    return record.status;
                                                })()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(record.recordingUrl || (record as any).recording_url) ? (
                                                <div className="flex items-center gap-4">
                                                    {String(playingId) === String(record.callId) ? (
                                                        <audio
                                                            autoPlay
                                                            controls
                                                            className="h-8 w-48"
                                                            src={(record.recordingUrl || (record as any).recording_url).startsWith('http')
                                                                ? (record.recordingUrl || (record as any).recording_url)
                                                                : `${import.meta.env.VITE_API_BASE_URL}${record.recordingUrl || (record as any).recording_url}`}
                                                        />
                                                    ) : (
                                                        <button
                                                            onClick={() => setPlayingId(record.callId)}
                                                            className="flex items-center gap-2 text-xs font-bold text-violet-600 hover:text-violet-500 transition-colors"
                                                        >
                                                            <Play size={14} fill="currentColor" />
                                                            Play Recording
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">No recording available</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    disabled={!(record.recordingUrl || (record as any).recording_url)}
                                                    onClick={() => handleDownload(record)}
                                                    className="px-2"
                                                >
                                                    <Download size={16} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => handleDelete(record.callId)}
                                                    className="px-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    title="Delete Record"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VoiceRecordsPage;
