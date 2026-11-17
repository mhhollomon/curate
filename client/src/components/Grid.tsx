import { createContext, useContext, type ReactNode } from "react";
import * as rad from 'radashi';

const ColCount = createContext(0);

interface GridProps {
    children? : ReactNode;
    className? : string;
    columns : number;
    colspec ? : string;
}
export function Grid({children, columns, colspec, className=''} : GridProps) {

    const area = new Array(columns).fill('a').join(' ');

    colspec = colspec ? colspec : new Array(columns).fill('1fr').join(' ');

    const grid_style = {
        display : 'grid',
        gridTemplateArea : area,
        gridTemplateColumns : colspec,
        width : '100%',

    };


    return <div style={grid_style} className={"grid-parent " + className}>
        <ColCount value={columns}>
            {children}
        </ColCount>
    </div>
}


interface GRowProps {
    children? : ReactNode;
    header? : boolean;
    className? : string;
}

export function GRow({children, header=false, className=''} : GRowProps) {
    const colCount = useContext(ColCount);

    const styles : any = {
        'display' : 'grid',
        'gridTemplateColumns' : 'subgrid',
        'gridTemplateArea' : 'inherit',
        'gridColumn' : 'auto / span ' + colCount,
        ...(header ? {fontWeight: 'bold'} : {})
    };

    return <div style={styles} className={'grid-row ' + className}>
        {children}
    </div>

}

interface GCellProps {
    children? : ReactNode;
    className? : string;
    span? : number;
}

export function GCell({children, className='', span} : GCellProps) {
    const styles = {
        ...(span? { gridColumn : 'auto / span ' + rad.round(span)} : {}),
    };

    return (<div style={styles} className={className}>
        {children}
    </div>);
}