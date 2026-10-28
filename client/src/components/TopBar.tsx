import { HamburgerMenuIcon } from "@radix-ui/react-icons"
export default function Topbar() {

    return (<div className="bg-primary text-white d-flex justify-content-between mb-3">
        <div className="d-inline-block">
            <HamburgerMenuIcon className="mb-1 ms-1" />
        </div>
        <div className="d-inline-block">Curate</div>
        <div className="d-inline-block">&nbsp;</div>
    </div>)
}