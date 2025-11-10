interface RadioOptionProps {
  name: string;
  label: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
}

export default function RadioOption({ name, label, checked, onChange, value }: RadioOptionProps) {
  return (
    <label className="flex items-center gap-3 p-3 rounded-lg bg-[#222222] border-2 border-transparent has-[:checked]:border-primary cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="form-radio flex items-center justify-center appearance-none w-5 h-5 rounded-full bg-[#1E1E1E] border-2 border-gray-600 checked:bg-primary checked:border-primary focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#222222] focus:ring-primary after:checked:content-[''] after:checked:block after:checked:w-2 after:checked:h-2 after:checked:rounded-full after:checked:bg-[#1E1E1E]"
      />
      <span className="text-text-light text-sm font-medium">{label}</span>
    </label>
  );
}
