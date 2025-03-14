import { cn, containSpaces } from "../../utils/utils";

function Avatar({ src, name, size = "sm", shape = "circle", className }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden bg-stone-500",
        //size
        size === "sm" && "h-8 w-8",
        size === "md" && "h-12 w-12",
        size === "lg" && "h-16 w-16",
        //shape
        shape === "rounded" && "rounded-md",
        shape === "square" && "rounded-none",
        shape === "circle" && "rounded-full",
        className,
      )}
    >
      {src ? (
        <img src={src} alt={src} className="h-full w-full object-cover" />
      ) : (
        <p
          className={cn(
            size === "sm" && "text-xs",
            size === "md" && "text-base",
            size === "lg" && "text-lg",
          )}
        >
          {containSpaces(name)
            ? name.split(" ").map((n) => n[0].toUpperCase())
            : name.charAt(0).toUpperCase()}
        </p>
      )}
    </div>
  );
}

export default Avatar;
