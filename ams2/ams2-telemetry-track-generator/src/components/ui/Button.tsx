interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
}

export default function Button({ variant = "primary", children, className = "", ...props }: ButtonProps) {
  const baseStyles = "flex items-center justify-center rounded-lg h-11 px-6 text-base font-medium focus:outline-none focus:ring-2 transition-all";

  const variantStyles = {
    primary: "bg-primary text-[#1E1E1E] font-bold hover:brightness-110 focus:ring-offset-2 focus:ring-offset-[#2A2A2A] focus:ring-primary",
    secondary: "bg-gray-600 text-text-light hover:bg-gray-500 focus:ring-primary",
    ghost: "bg-transparent text-text-light hover:bg-white/10 focus:ring-primary",
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
