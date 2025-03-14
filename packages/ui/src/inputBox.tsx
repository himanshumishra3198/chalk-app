interface InputProps {
  disabled?: boolean;
  text?: string;
  reference?: any;
  placeholder?: string;
  fullWidth?: boolean;
  type: "text" | "password";
}
export function InputBox({
  text,
  disabled,
  reference,
  placeholder,
  fullWidth,
  type,
}: InputProps) {
  return (
    <div className="flex justify-center items-center">
      <input
        type={type}
        ref={reference}
        disabled={disabled}
        value={text}
        className={` focus:ui-outline-none ui-py-2 ui-bg-neutral-600 p-2 py-2 text-white border-none text-center ${
          fullWidth ? "w-full" : ""
        }  rounded`}
        placeholder={placeholder}
      />
    </div>
  );
}
