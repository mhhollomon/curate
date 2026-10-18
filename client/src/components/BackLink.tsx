import { useAtomValue } from "jotai";
import { Link } from "wouter";
import { backURLAtom } from "~/atoms";
import { arrow_left } from "~/icons";


export default function BackLink() {
    const backURL = useAtomValue(backURLAtom)

    return (<>
        <Link className="bare-link" href={backURL}><span  className="ms-2">{arrow_left}</span></Link>
    </>)
}