import type { LiveryTexture } from '../../types';

/**
 * Texture tab switcher for multi-texture liveries
 * Extracted from Stitch main_editor design
 */
export interface TextureTabsProps {
    textures: LiveryTexture[];
    activeTextureId: string | null;
    onSelectTexture: (id: string) => void;
}

export function TextureTabs({ textures, activeTextureId, onSelectTexture }: TextureTabsProps) {
    if (textures.length === 0) return null;

    return (
        <div className="flex border-b border-border-default px-2 text-sm bg-background-base flex-shrink-0">
            {textures.map((texture) => {
                const isActive = texture.id === activeTextureId;

                return (
                    <button
                        key={texture.id}
                        onClick={() => onSelectTexture(texture.id)}
                        className={`
              flex items-center justify-center gap-2 px-4 pt-3 pb-[10px]
              border-b-2 transition-colors
              ${isActive
                                ? 'border-b-accent-blue text-text-primary bg-background-elevated'
                                : 'border-b-transparent text-text-secondary hover:bg-background-elevated hover:text-text-primary'
                            }
            `}
                    >
                        <p>{texture.name}</p>
                        <span
                            className="text-base text-text-secondary hover:text-text-primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Close texture
                            }}
                            title="Close texture"
                        >
                            ×
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
