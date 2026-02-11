import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { settingsService } from '../../services/settingsService';
import { Cookie, Loader, ArrowLeft, Mic } from 'lucide-react';

const CookiePage: React.FC = () => {
    const [content, setContent] = useState<{ title: string; description: string; imageUrl?: string }>({
        title: 'Cookie Policy',
        description: '',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const settings = await settingsService.getSiteSettings();
                if (settings.footer_cookies) {
                    try {
                        const parsed = typeof settings.footer_cookies === 'string'
                            ? JSON.parse(settings.footer_cookies)
                            : settings.footer_cookies;
                        setContent(parsed);
                    } catch (e) {
                        setContent(prev => ({ ...prev, description: settings.footer_cookies }));
                    }
                }
            } catch (error) {
                console.error('Failed to load cookie policy:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col p-6 relative overflow-x-hidden">
            {/* Soft Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-600/10 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/4" />

            <div className="z-10 w-full max-w-5xl mx-auto py-12 md:py-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {/* Top Navigation */}
                <div className="flex justify-start mb-12">
                    <Link
                        to="/"
                        className="flex items-center gap-3 text-slate-400 hover:text-white transition-all group px-4 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold text-sm tracking-wide">Back to Home</span>
                    </Link>
                </div>

                {/* Hero Branding Section */}
                <div className="text-left mb-16">
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <div className="bg-gradient-to-br from-amber-600 to-orange-600 p-2.5 rounded-2xl group-hover:scale-110 transition-transform shadow-xl shadow-amber-600/20">
                            <Mic className="w-7 h-7 text-white" />
                        </div>
                        <span className="font-bold text-3xl tracking-tight text-white italic">EduTalks</span>
                    </Link>
                </div>

                {/* Main Content Area */}
                <div className="bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl p-8 md:p-16 rounded-[2.5rem]">
                    <div className="mb-12 text-left">
                        <div className="inline-flex items-center justify-center p-3 bg-amber-600/20 rounded-2xl mb-6 backdrop-blur-sm border border-amber-500/20">
                            <Cookie size={32} className="text-amber-400" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
                            {content.title}
                        </h1>
                        <div className="h-2 w-32 bg-amber-600 rounded-full" />
                    </div>

                    {content.imageUrl && (
                        <img
                            src={content.imageUrl}
                            alt={content.title}
                            className="w-full h-64 md:h-96 object-cover rounded-3xl mb-12 shadow-2xl border border-white/10"
                        />
                    )}

                    <div className="prose prose-lg prose-invert max-w-none">
                        {content.description ? (
                            content.description.split('\n').map((paragraph, index) => (
                                <p key={index} className="text-xl text-slate-300 leading-relaxed font-medium mb-6 last:mb-0">
                                    {paragraph}
                                </p>
                            ))
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                <p>No content available yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-20 text-center">
                    <div className="inline-flex items-center gap-6 px-8 py-3 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
                        <span className="text-slate-500 text-xs font-bold tracking-widest uppercase">
                            © {new Date().getFullYear()} EduTalks AI
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookiePage;
