interface CalloutProps {
  icon: string;
  title: string;
  description: string;
}

export default function Callout({ icon, title, description }: CalloutProps) {
  return (
    <div className="flex items-start gap-4 rounded-lg bg-[#444444]/30 p-4 border border-[#444444]">
      <div className="text-primary flex items-center justify-center shrink-0 size-8 mt-1">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-white text-base font-medium leading-normal">{title}</p>
        <p className="text-[#9E9E9E] text-sm font-normal leading-normal">{description}</p>
      </div>
    </div>
  );
}
