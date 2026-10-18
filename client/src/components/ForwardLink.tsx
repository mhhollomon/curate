import { useSetAtom } from "jotai";
import { Link, useLocation } from "wouter";
import { backURLAtom } from "~/atoms";

export interface ForwardLinkProps {
    href : string;
    title : string;
}
export default function ForwardLink({href, title} : ForwardLinkProps) {
    const [location,] = useLocation()
    const setBackURL = useSetAtom(backURLAtom)

    function setBackLink() {
        setBackURL(location)
    }

    return (<>
        <Link href={href} onClick={setBackLink}>{title}</Link>

    </>)

}