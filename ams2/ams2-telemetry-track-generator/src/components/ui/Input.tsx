interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, className = "", ...props }: InputProps) {
  return (
    <label className="flex flex-col">
      {label && <p className="text-text-light text-sm font-medium pb-1.5">{label}</p>}
      <input
        className={`form-input flex w-full resize-none overflow-hidden rounded-lg text-text-light focus:outline-0 focus:ring-2 focus:ring-primary border-none bg-[#222222] h-12 placeholder:text-gray-500 p-3 text-base font-normal leading-normal ${className}`}
        {...props}
      />
    </label>
  );
}
