import "./About.css";
import Icon from "~/framework/components/Icon";
import { question_circle } from "~/icons";
import { useEffect, useRef, useState } from "react";

const x_large = <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
</svg>



declare const __BUILD_INFO__: {
  name: string;
  version: string;
  commitHash: string;
  commitShort: string;
  commitTime: string;
  branch: string;
  isDirty: boolean;
  lastTag: string;
  commitsSinceTag: number;
  buildTime: string;
};

interface AboutProps {
    className? : string;
}

export default function About({className} : AboutProps) {

    const [dialogOpen, setDialogOpen] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);

    const {version, commitHash, isDirty, branch, buildTime} = __BUILD_INFO__;

    useEffect(() => {
        if (dialogOpen) {
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }

    }, [dialogOpen]);

    const timestamp = buildTime.substring(0, buildTime.length - 5) + 'Z';

    return (
        <>
            <button className={"bare-btn  " + className} onClick={()=>setDialogOpen(true)}><Icon icon={question_circle} size="1.25em"/></button>
            <dialog className="about-dialog" ref={dialogRef} onClose={()=>setDialogOpen(false)}>
                    <header className="d-flex justify-content-between fs-6">
                        <span className="fs-5 fw-bold">About <span className="txt-brand">Curate</span></span>
                        <button className="dialog-close" onClick={() => setDialogOpen(false)}><Icon className="closer" size={"1.2em"} icon={x_large} /></button>
                    </header>
                    <div className="fs-7 mb-2">Cool Thing&trade; I built.</div>
                    <table className="table vrnt-brand txt-left">
                        <tbody>
                            <tr><th>Version</th><td>{version}</td></tr>
                            <tr><th>Commit</th><td>{(commitHash.substring(0, 10)) + (isDirty?'+':'')}</td></tr>
                            <tr><th>Branch</th><td>{branch}</td></tr>
                            <tr><th>Build Time</th><td>{timestamp}</td></tr>
                        </tbody>
                    </table>
            </dialog>
        </>
    );
}