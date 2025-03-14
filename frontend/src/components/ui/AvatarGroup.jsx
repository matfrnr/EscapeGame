import { cn } from "../../utils/utils.jsx";

function AvatarGroup({ children, groupName, className }) {
    return (
        <div
            className={cn(
                "bg-neutral-700 p-1 flex items-center gap-1 w-fit max-w-full overflow-x-auto rounded-full",
                className
            )}
        >
            <div className="flex items-center -space-x-4 shrink-0">
                {children.map((child, index) => {
                    return (
                        <div
                            key={index}
                            className="rounded-full border-2 border-neutral-700 w-8 h-8 sm:w-6 sm:h-6 md:w-5 md:h-5"
                        >
                            {child}
                        </div>
                    );
                })}
            </div>
            <span className="text-white text-xs pr-2 font-mono sm:text-xs md:text-xs">{groupName}</span>
        </div>
    );
}

export default AvatarGroup;
