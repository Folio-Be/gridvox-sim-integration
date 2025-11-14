import type { LiveryTexture } from '../../types';

interface CanvasViewportProps {
    texture?: LiveryTexture;
}

export function CanvasViewport({ texture }: CanvasViewportProps) {
    if (!texture) {
        return (
            <div className="flex h-full items-center justify-center text-text-secondary">
                <p className="text-14">Load a texture to start editing</p>
            </div>
        );
    }

    return (
        <div className="relative flex-1 overflow-hidden bg-[#0f141d]">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                <div className="w-[760px] h-[420px] rounded-[28px] bg-gradient-to-br from-[#101726] via-[#0d111a] to-[#080b12] shadow-[0_40px_120px_rgba(0,0,0,0.45)] border border-[#1f2937] flex items-center justify-center">
                    <div className="w-[660px] h-[320px] rounded-[32px] bg-[#111827] border border-[#1f2937] flex items-center justify-center">
                        <div className="w-[580px] h-[280px] rounded-[32px] bg-[#dcdfe7] shadow-inner relative">
                            <div className="absolute inset-x-14 top-10 h-8 rounded-full bg-[#b0b7c6] opacity-70"></div>
                            <div className="absolute inset-x-14 top-24 h-8 rounded-full bg-[#cbd2e1] opacity-70"></div>
                            <div className="absolute inset-x-12 bottom-16 h-8 rounded-full bg-[#b0b7c6] opacity-70"></div>
                            <p className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-[#5f6470]">
                                {texture.name} Preview
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
