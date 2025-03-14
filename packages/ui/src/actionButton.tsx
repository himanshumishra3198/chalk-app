import { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  variant = "primary",
}: ActionButtonProps) => {
  const variantClasses =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-gray-700 text-gray-200 hover:bg-gray-600";

  return (
    <button
      onClick={onClick}
      className={`ui-cursor-pointer flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${variantClasses}`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
};
