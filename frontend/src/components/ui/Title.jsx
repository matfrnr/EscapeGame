import {cn} from "../../utils/utils.jsx";

export default function Title({
    children,
    className,
    level = 3,
                              ...rest}) {
    return (
        <h2 className={cn(
            "font-extrabold",
            level === 1 && "text-3xl",
            level === 2 && "text-2xl",
            level === 3 && "text-xl",
            level === 4 && "text-lg",
            className
        )}
            {...rest}
        >
            {children}
        </h2>
)}