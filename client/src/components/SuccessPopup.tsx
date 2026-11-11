import { useEffect, useRef, useState } from "react";

import "./SuccessPopup.css";

interface SuccessPopupProps {
    show: boolean;
    message: string;
    onOpenChange : (open : boolean) => void;
}


export default function SuccessPopup({ show, message, onOpenChange }: SuccessPopupProps) {
    const [_, setToastOpen] = useState(false);

    const toastRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        let timer : number|undefined = undefined;

        if (show) {
            setToastOpen((oldOpen) => {
                if (oldOpen != show) {
                    toastRef.current?.showPopover();
                    timer = setTimeout(() => {
                        toastRef.current?.hidePopover();
                        onOpenChange(false);},
                    2000);
                }
                return show;
            });

        } else {
            setToastOpen((oldOpen) => {
                if (oldOpen != show) {
                    toastRef.current?.hidePopover();
                }
                return show;
            });

        }

        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };

    }, [show]);

    return (<>

        <div className="success-toast" ref={toastRef} popover="auto"><span>{message}</span></div>

    </>);

}