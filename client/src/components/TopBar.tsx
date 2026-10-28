import { useAtomValue } from "jotai"
import { backURLAtom } from "~/atoms"
import BackLink from "~/components/BackLink";



export default function Topbar() {

    const backUrl = useAtomValue(backURLAtom);

    return (<div className="bg-primary text-white d-flex justify-content-between mb-3">
        <div className="d-inline-block">
            {backUrl ? <BackLink/> : <>&nbsp;</>}
        </div>
        <div className="d-inline-block">Curate</div>
        <div className="d-inline-block">&nbsp;</div>
    </div>)
}