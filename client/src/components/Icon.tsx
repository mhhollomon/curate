import type { ReactNode } from "react";

interface IconProps {
    size? : string;
    icon : ReactNode;
}
export default function Icon({icon, size="1em"} : IconProps) {

    return (
        <div style={{width : size, height : size, display: 'inline-block'}}>{icon}</div>
    )
}