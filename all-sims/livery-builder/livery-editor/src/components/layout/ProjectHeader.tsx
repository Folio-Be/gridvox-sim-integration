interface ProjectHeaderProps {
    thumbnail: string;
    name: string;
    simulator?: string;
    car?: string;
    onSave: () => void;
    onExport: () => void;
    tabs?: React.ReactNode;
}

export function ProjectHeader({
    thumbnail,
    name,
    simulator,
    car,
    onSave,
    onExport,
    tabs,
}: ProjectHeaderProps) {
    return (
        <div className="flex h-16 items-center justify-between gap-6 border-b border-border-default bg-gradient-to-b from-[#131822] to-[#10141c] px-6">
            <div className="flex flex-1 items-center gap-4">
                <div className="h-12 w-12 rounded-xl border border-border-default bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${thumbnail})` }} />
                <div className="flex flex-col leading-tight">
                    <p className="text-sm font-semibold text-text-primary">{name}</p>
                    <p className="text-xs text-text-secondary">
                        {simulator || 'Simulator'} · {car || 'Car'}
                    </p>
                </div>
            </div>
            <div className="flex flex-1 items-center justify-center">
                {tabs}
            </div>
            <div className="flex flex-1 items-center justify-end gap-3">
                <button
                    onClick={onSave}
                    className="h-10 rounded-lg border border-border-default bg-[#1d2430] px-4 text-sm font-semibold text-text-primary transition hover:bg-border-default"
                >
                    Save
                </button>
                <button
                    onClick={onExport}
                    className="h-10 rounded-lg bg-[#22d2ee] px-5 text-sm font-semibold text-[#05131a] transition hover:opacity-90"
                >
                    Export
                </button>
            </div>
        </div>
    );
}
