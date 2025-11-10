interface ActionCardProps {
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
}

export default function ActionCard({ icon, title, description, onClick }: ActionCardProps) {
  return (
    <div
      className="group flex cursor-pointer flex-col gap-4 rounded-xl border border-border-dark bg-card-dark p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
      onClick={onClick}
    >
      <span className="material-symbols-outlined text-4xl text-text-muted transition-colors group-hover:text-primary">
        {icon}
      </span>
      <div>
        <p className="text-text-light text-xl font-medium leading-normal">{title}</p>
        <p className="text-text-muted text-base font-normal leading-normal">{description}</p>
      </div>
    </div>
  );
}
