import type { LiveryTexture } from '../../types';

export interface TextureTabsProps {
    textures: LiveryTexture[];
    activeTextureId: string | null;
    onSelectTexture: (id: string) => void;
}

export function TextureTabs({ textures, activeTextureId, onSelectTexture }: TextureTabsProps) {
    if (textures.length === 0) return null;

    return (
        <div className="border-b border-border-default bg-background-base flex-shrink-0">
            <div className="flex justify-center gap-4 px-4 text-sm">
                {textures.map((texture) => {
                    const isActive = texture.id === activeTextureId;

                    return (
                        <button
                            key={texture.id}
                            onClick={() => onSelectTexture(texture.id)}
                            className={`px-6 pt-3 pb-[10px] rounded-t-lg border-b-2 transition-colors ${
                                isActive
                                    ? 'border-b-accent-blue text-text-primary bg-background-elevated'
                                    : 'border-b-transparent text-text-secondary hover:bg-background-elevated hover:text-text-primary'
                            }`}
                        >
                            {texture.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
