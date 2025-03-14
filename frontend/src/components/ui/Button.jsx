import { cn } from "../../utils/utils";

function Button({
  className,
  children,
  variant = "default",
  size = "default",
  disabled,
  ...attributes
}) {
  return (
    <button
      className={cn(
        "px-4 py-2 text-white",

        // variant
        variant === "default" && "bg-primary",
        variant === "outline" && "border-2 border-primary text-primary",
        variant === "secoundary" &&
          "bg-orange-500/20 text-stone-50 transition-all ease-out hover:bg-orange-500/40",
        variant === "dark" && "rounded-full bg-neutral-700/20 text-stone-50",
        // size
        size === "default" && "text-base",
        size === "sm" && "text-sm",
        size === "lg" && "text-lg",
        size === "xl" && "text-xl",
        size === "xs" && "text-xs",
        className,

        //disabled
        disabled && "cursor-not-allowed opacity-50",
      )}
      disabled={disabled}
      {...attributes}
    >
      {children}
    </button>
  );
}

export default Button;
