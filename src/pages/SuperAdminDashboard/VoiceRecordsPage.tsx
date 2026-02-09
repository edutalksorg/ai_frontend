import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Play, Phone, User, Calendar, Clock, Volume2, Shield, ArrowLeft } from 'lucide-react';
import { callsService } from '../../services/calls';
import Button from '../../components/Button';
import { callLogger } from '../../utils/callLogger';

interface VoiceRecord {
    callId: string;
    callerName: string;
    calleeName: string;
    startedAt: string;
    durationSeconds: number;
    status: string;
    recordingUrl?: string;
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
            setRecords(response.data || response || []);
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
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white">ID: {record.callId}</span>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {new Date(record.startedAt).toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                    <span className="w-4 h-4 bg-blue-500/10 text-blue-500 rounded flex items-center justify-center text-[10px] font-bold">C</span>
                                                    {record.callerName}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                    <span className="w-4 h-4 bg-green-500/10 text-green-500 rounded flex items-center justify-center text-[10px] font-bold">R</span>
                                                    {record.calleeName}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                                <Clock size={14} />
                                                {Math.floor(record.durationSeconds / 60)}:{(record.durationSeconds % 60).toString().padStart(2, '0')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${record.status?.toLowerCase() === 'completed'
                                                ? 'bg-green-500/10 text-green-600'
                                                : 'bg-red-500/10 text-red-600'
                                                }`}>
                                                {record.status}
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
                                                    variant="outline"
                                                    className="px-2"
                                                    title="Security Audit"
                                                >
                                                    <Shield size={16} />
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
