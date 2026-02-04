import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mic, Rocket, Bell } from 'lucide-react';
import Button from '../../components/Button';
import { settingsService } from '../../services/settingsService';

interface ComingSoonPageProps {
    title?: string;
    settingKey?: 'footer_about' | 'footer_success' | 'footer_blog';
}

const StructuredContent: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');

    return (
        <div className="space-y-8">
            {lines.map((line, index) => {
                const trimmed = line.trim();
                // Simple heuristic for headers: terminates with colon, or short and starts with common header words
                const isHeader = trimmed.endsWith(':') || (trimmed.length < 50 && /^(Our|Why|What|Who|How|Join|Contact)/i.test(trimmed));

                if (isHeader) {
                    return (
                        <h3 key={index} className="text-2xl md:text-3xl font-bold text-white mt-12 mb-4 first:mt-0 flex items-center gap-3">
                            <span className="w-8 h-1 bg-blue-600 rounded-full" />
                            {trimmed.replace(/:$/, '')}
                        </h3>
                    );
                }

                return (
                    <p key={index} className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium">
                        {trimmed}
                    </p>
                );
            })}
        </div>
    );
};

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
    title = "Coming Soon",
    settingKey
}) => {
    const [content, setContent] = useState({
        title: title,
        description: "We're working hard to bring you the best English learning experience. This feature is currently under development and will be launching very soon!"
    });

    useEffect(() => {
        if (settingKey) {
            fetchContent();
        }
    }, [settingKey]);

    const fetchContent = async () => {
        try {
            const settings = await settingsService.getSiteSettings();
            const pageData = settings[settingKey!];

            if (pageData) {
                try {
                    const parsed = typeof pageData === 'string' ? JSON.parse(pageData) : pageData;
                    setContent({
                        title: parsed.title || title,
                        description: parsed.description || content.description
                    });
                } catch (e) {
                    // Fallback for plain string
                    setContent({
                        ...content,
                        description: pageData as string
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch page content:', error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col p-6 relative overflow-x-hidden">
            {/* Soft Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/4" />

            <div className={`z-10 ${settingKey ? 'w-full max-w-5xl' : 'text-center max-w-2xl'} mx-auto py-12 md:py-20 animate-in fade-in slide-in-from-bottom-6 duration-1000`}>
                {/* Top Navigation for Content Pages */}
                {settingKey && (
                    <div className="flex justify-start mb-12">
                        <Link
                            to="/"
                            className="flex items-center gap-3 text-slate-400 hover:text-white transition-all group px-4 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="font-bold text-sm tracking-wide">Back to Home</span>
                        </Link>
                    </div>
                )}

                {/* Hero Branding Section */}
                <div className={`${settingKey ? 'text-left' : 'text-center text-center-items'} mb-16`}>
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-2xl group-hover:scale-110 transition-transform shadow-xl shadow-blue-600/20">
                            <Mic className="w-7 h-7 text-white" />
                        </div>
                        <span className="font-bold text-3xl tracking-tight text-white italic">EduTalks</span>
                    </Link>
                </div>

                {!settingKey && (
                    <div className="relative inline-block text-center w-full mb-12">
                        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl inline-block">
                            <Rocket className="w-16 h-16 text-blue-500 animate-bounce" />
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className={`${settingKey ? 'glass-panel p-8 md:p-16 rounded-[2.5rem]' : 'space-y-6'}`}>
                    <div className={`mb-12 ${settingKey ? 'text-left' : 'text-center'}`}>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tight leading-[1.1] mb-6">
                            {content.title}
                        </h1>
                        {settingKey && <div className="h-2 w-32 bg-blue-600 rounded-full" />}
                    </div>

                    <div className={`${settingKey ? 'text-left' : 'text-center'}`}>
                        {settingKey ? (
                            <StructuredContent text={content.description} />
                        ) : (
                            <p className="text-xl text-slate-400 leading-relaxed font-medium">
                                {content.description}
                            </p>
                        )}
                    </div>
                </div>

                {!settingKey && (
                    <div className="mt-16 bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-2xl shadow-2xl text-center max-w-xl mx-auto">
                        <h3 className="text-white text-xl font-bold mb-6 flex items-center justify-center gap-3">
                            <Bell size={24} className="text-yellow-500" /> Stay in the loop
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="email"
                                placeholder="name@email.com"
                                className="bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-white"
                            />
                            <Button className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-bold">
                                Join Waitlist
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Sticky Footer */}
            <div className="z-10 mt-auto pt-20 pb-10 text-center">
                <div className="inline-flex items-center gap-6 px-8 py-3 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
                    <span className="text-slate-500 text-xs font-bold tracking-widest uppercase">
                        © {new Date().getFullYear()} EduTalks AI — Professional English Learning
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ComingSoonPage;
