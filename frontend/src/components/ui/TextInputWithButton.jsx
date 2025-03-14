import { cn } from "../../utils/utils";

function TextInputWithButton({
  type,
  placeholder,
  buttonText,
  className,
  onClick,
  onChange,
}) {
  return (
    <div
      className={cn(
        "flex w-fit items-center border-2 border-primary focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500/60",
        className,
      )}
    >
      <input
        type={type}
        placeholder={placeholder}
        className={cn(
          "bg-transparent px-5 py-3 outline-none placeholder:text-white/50 text-white",
          className,
        )}
        onChange={onChange}
      />
      <button
        className="bg-primary px-5 py-3 text-orange-950"
        onClick={onClick}
      >
        {buttonText}
      </button>
    </div>
  );
}

export default TextInputWithButton;
