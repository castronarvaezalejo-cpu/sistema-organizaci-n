import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const baseClassName = `
  w-full
  rounded-lg
  border
  border-slate-200
  bg-white
  px-3
  py-2
  text-[13px]
  text-slate-800
  shadow-sm
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-blue-500
  focus:ring-4
  focus:ring-blue-100
`;

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${baseClassName} ${className}`} {...props} />;
}

export function Select({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${baseClassName} ${className}`} {...props} />;
}

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${baseClassName} ${className}`} {...props} />;
}
