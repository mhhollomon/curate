import type { ReactNode } from "react";
import Icon from "./Icon";


interface IconBtnProps {
    className? : string;
    icon : ReactNode;
    text : string;
    variant? : string;
    disabled? : boolean;
    onClick? : () => void;
}

export default function IconBtn({className, icon, text, variant="brand", disabled=false, onClick} : IconBtnProps) {
    const classes = "btn btn-icon-text" +
        ` vrnt-${variant}` +
        (className ? ' ' + className : '');

    return <button className={classes} onClick={onClick} disabled={disabled}>
        <Icon icon={icon} />
        {text}
    </button>



}