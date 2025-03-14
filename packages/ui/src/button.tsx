import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps {
  text: string;
  variant: "primary" | "secondary" | "miniSecondary" | "danger";
  onClick?: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
}

export function Button({
  text,
  variant,
  onClick,
  icon,
  disabled,
  isLoading = false,
}: ButtonProps) {
  const ButtonVariant = {
    primary:
      "px-8 py-3 bg-white text-[#1A1F2C] rounded font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    secondary:
      "px-8 py-3 border border-white/20 text-white rounded font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    danger:
      "px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700  active:bg-red-800 shadow-md rounded",

    miniSecondary:
      "px-4 py-2 text-small font-medium bg-white/5 text-white rounded shadow-md hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  };

  return (
    <button
      onClick={onClick}
      className={`${
        disabled && variant === "secondary" ? "bg-white/10" : ""
      } cursor-pointer font-mono ${
        ButtonVariant[variant]
      } flex gap-2 items-center justify-center`}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <Loader2
            className={`h-4 w-4 animate-spin ${variant === "secondary" ? "text-white" : "text-[#1A1F2C]"}`}
          />
          <span className="opacity-70">{text}</span>
        </>
      ) : (
        <>
          {icon} {text}
        </>
      )}
    </button>
  );
}
