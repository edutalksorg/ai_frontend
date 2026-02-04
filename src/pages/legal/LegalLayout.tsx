import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mic } from 'lucide-react';
import Button from '../../components/Button';

interface LegalLayoutProps {
    title: string;
    children: React.ReactNode;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({ title, children }) => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
            {/* Header */}
            <header className="border-b border-slate-900 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-blue-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                            <Mic className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white italic">EduTalks</span>
                    </Link>
                    <Link to="/">
                        <Button variant="secondary" className="gap-2 text-sm h-9">
                            <ArrowLeft size={16} /> Back to Home
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                        {title}
                    </h1>
                    <div className="h-1.5 w-20 bg-blue-600 rounded-full"></div>
                </div>

                <div className="prose prose-invert prose-blue max-w-none 
                    prose-headings:text-white prose-headings:font-bold 
                    prose-p:text-slate-400 prose-p:leading-relaxed
                    prose-li:text-slate-400
                    prose-strong:text-blue-400 prose-strong:font-semibold
                ">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-900 bg-slate-950 py-8">
                <div className="max-w-4xl mx-auto px-6 text-center text-slate-500 text-sm">
                    <p>© {new Date().getFullYear()} EduTalks. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LegalLayout;
