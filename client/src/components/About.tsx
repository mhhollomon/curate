
import { Dialog } from "radix-ui";

import "./About.css";
import { useEffect, useState } from 'react';
import Icon from "~/components/Icon";
import { question_circle } from "~/icons";

interface AboutProps {
    className? : string;
}

export default function About({className} : AboutProps) {
    const [data, setData] = useState<any>({commitId : '', buildTime : '', branchName : '', projectVersion : ''});

    useEffect(() => {
        fetch('/json/version.json').then((resp) => resp.json()).then((json_data) => {
            console.log("About data =", json_data)
            setData(json_data);
        });
    }, []);

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <a className={"bare-link hover-underline  " + className}><Icon icon={question_circle} size="1.25em"/></a>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay" />
                <Dialog.Content className="DialogContent theme-light">
                    <Dialog.Title className="is-size-6">About</Dialog.Title>
                    <Dialog.Description className="is-size-7 mb-2">Cool Thing&trade; I built.</Dialog.Description>
                    <table className="table is-primary">
                        <tbody>
                            <tr><th>Version</th><td>{data.projectVersion}</td></tr>
                            <tr><th>Commit</th><td>{data.commitId}</td></tr>
                            <tr><th>Branch</th><td>{data.branchName}</td></tr>
                            <tr><th>Build Time</th><td>{data.buildTime}</td></tr>
                        </tbody>
                    </table>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}