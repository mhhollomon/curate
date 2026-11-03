import './flex.css';

import { round } from "radashi";
import type { ReactNode } from "react";

type dirType = "column"|"row";

interface FlexProps {
    children : ReactNode;
    gap? : number;
    className? : string | string[];
    dir? : dirType;
};

export default function Flex({children, gap, className, dir} : FlexProps) {

    let class_string = 'is-flex';

    if (gap) {
        gap = Math.min(Math.max(round(gap), 0), 6);
        class_string += ' ' + `gap-${gap}`;
    }

    if (dir) {
       class_string += ' is-flex-direction-' + dir;
    }

    if (Array.isArray(className)) {
        class_string += ' ' + className.join(' ');
    } else if (className) {
        class_string += ' ' + className;
    }

    return (<div className={class_string}>{children}</div>)

}