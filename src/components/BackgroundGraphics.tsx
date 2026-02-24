import React from 'react';

const BackgroundGraphics: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none w-full h-full">

            {/* Base Background with Subtle Red/White Gradient */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white via-red-50/30 to-white transition-colors duration-300" />

            {/* Ambient Glows - Red and Warm Tones */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/5 blur-[100px] animate-blob" />

            {/* Center-Right Warm Glow */}
            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/5 blur-[120px] animate-blob animation-delay-2000" />

            {/* Bottom-Left Red Accent */}
            <div className="absolute bottom-[-10%] left-[10%] w-[60%] h-[60%] rounded-full bg-red-600/5 blur-[130px] animate-blob animation-delay-4000" />

            {/* Subtle Diagonal Mesh/Overlay */}
            <div className="absolute inset-0 opacity-[0.4]"
                style={{
                    backgroundImage: `radial-gradient(#E10600 0.5px, transparent 0.5px), radial-gradient(#E10600 0.5px, #FAFAFA 0.5px)`,
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0, 12px 12px',
                    maskImage: 'linear-gradient(to bottom, transparent, black, transparent)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 10%, black 40%, black 70%, transparent 90%)'
                }}
            />
        </div>
    );
};

export default BackgroundGraphics;
