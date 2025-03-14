import { User } from "lucide-react";

interface UserAvatarProps {
  name?: string;
}

export const UserAvatar = ({ name }: UserAvatarProps) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center shadow-md">
        <User className="w-7 h-7 text-gray-300" />
      </div>
      <span className="text-sm text-gray-300 font-medium">{name}</span>
    </div>
  );
};
