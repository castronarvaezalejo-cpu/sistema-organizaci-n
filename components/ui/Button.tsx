import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-[#0B4A92] text-white hover:bg-[#0B75C9] border-transparent",
    secondary:
      "bg-white text-slate-700 hover:bg-slate-50 border-slate-200",
    danger:
      "bg-red-600 text-white hover:bg-red-700 border-transparent",
  };

  return (
    <button
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-lg
        border
        px-3.5
        py-2
        text-[13px]
        font-semibold
        shadow-sm
        transition
        disabled:opacity-60
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
      {...props}
    />
  );
}
