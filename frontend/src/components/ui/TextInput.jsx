import { cn } from "../../utils/utils";

function TextInput({ className, ...attributes }) {
  return (
    <input
      type="text"
      className={cn(
        "border-b-2 border-white bg-transparent p-2 outline-none placeholder:text-white/50 focus:ring-2 focus:ring-blue-500/60",
        className,
      )}
      {...attributes}
    />
  );
}

export default TextInput;
