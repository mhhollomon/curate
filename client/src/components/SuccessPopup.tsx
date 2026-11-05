
import { Toast } from "radix-ui";

import "./SuccessPopup.css";

interface SuccessPopupProps {
    show: boolean;
    message: string;
    onOpenChange : (open : boolean) => void;
}


export default function SuccessPopup({ show, message, onOpenChange }: SuccessPopupProps) {

    return (<>

        <Toast.Root open={show} onOpenChange={onOpenChange} duration={2000} className="ToastRoot has-background-success has-text-black p-1">
            <Toast.Description><span className="has-text-black">{message}</span></Toast.Description>
            <Toast.Close />
        </Toast.Root>

        <Toast.Viewport className="ToastViewport" />
    </>);

}