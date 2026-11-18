import { round } from "radashi";
import type { ReactNode } from "react";

type dirType = "col"|"row"|"column";

interface FlexProps {
    children : ReactNode;
    gap? : number;
    className? : string | string[];
    dir? : dirType;
};

export default function Flex({children, gap, className, dir} : FlexProps) {

    let class_string = 'd-flex';

    if (gap) {
        gap = Math.min(Math.max(round(gap), 0), 6);
        class_string += ' ' + `gap-${gap}`;
    }

    if (dir) {
       class_string += ' flex-dir-' + dir.substring(0,3);
    }

    if (Array.isArray(className)) {
        class_string += ' ' + className.join(' ');
    } else if (className) {
        class_string += ' ' + className;
    }

    return (<div className={class_string}>{children}</div>)

}