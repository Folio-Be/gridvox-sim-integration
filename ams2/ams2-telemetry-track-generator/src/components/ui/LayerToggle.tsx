interface LayerToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function LayerToggle({ label, checked, onChange }: LayerToggleProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5 has-[:checked]:text-primary">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer hidden"
      />
      <span className={`material-symbols-outlined ${checked ? "text-primary" : "text-gray-400"}`}>
        {checked ? "check_box" : "check_box_outline_blank"}
      </span>
      <p className="text-sm font-medium leading-normal text-white">{label}</p>
    </label>
  );
}
