import React from 'react';

const BackgroundGraphics: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300" />

            {/* Ambient Glows - Visible mostly in dark mode */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/20 blur-[120px] mix-blend-screen dark:mix-blend-overlay animate-blob" />
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/20 blur-[120px] mix-blend-screen dark:mix-blend-overlay animate-blob animation-delay-2000" />
            <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-fuchsia-500/20 blur-[120px] mix-blend-screen dark:mix-blend-overlay animate-blob animation-delay-4000" />

            {/* Mesh pattern overlay for texture */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            />
        </div>
    );
};

export default BackgroundGraphics;
