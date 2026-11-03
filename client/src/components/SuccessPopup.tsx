
interface SuccessPopupProps {
    show : boolean;
    message : string;
}

export default function SuccessPopup({show, message} : SuccessPopupProps) {

    const disp = show ? '' : ' no-display';

    const classes = 'notification queue-note has-background-success m-1 p-1' + disp;
    return (
        <div className={classes} >{message}</div>

    );

}