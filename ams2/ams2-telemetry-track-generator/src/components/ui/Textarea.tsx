interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export default function Textarea({ label, className = "", ...props }: TextareaProps) {
  return (
    <label className="flex flex-col">
      {label && <p className="text-text-light text-sm font-medium pb-1.5">{label}</p>}
      <textarea
        className={`form-input flex w-full resize-none overflow-hidden rounded-lg text-text-light focus:outline-0 focus:ring-2 focus:ring-primary border-none bg-[#222222] min-h-24 placeholder:text-gray-500 p-3 text-base font-normal leading-normal ${className}`}
        {...props}
      />
    </label>
  );
}
