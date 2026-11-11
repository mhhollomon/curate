import type { ReactNode } from "react";

interface IconProps {
    size? : string;
    icon : ReactNode;
    className? : string;
}
export default function Icon({icon, size="1em", className} : IconProps) {

    return (
        <div className={className} style={{width : size, height : size, display: 'inline-block'}}>{icon}</div>
    )
}