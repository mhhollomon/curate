import { useAtom } from "jotai";
import { Link } from "wouter";
import { backURLAtom } from "~/atoms";
import { arrow_left } from "~/icons";


export default function BackLink() {
    const [backURL, setBackURL] = useAtom(backURLAtom);

    const href = backURL || '/';

    function clickHandler() {
        setBackURL(null);
    }

    return (<>
        <Link className="bare-link" href={href} onClick={clickHandler}><span  className="ms-2">{arrow_left}</span></Link>
    </>)
}