
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
                <Dialog.Content className="DialogContent">
                    <Dialog.Title>About</Dialog.Title>
                    <table className="table is-primary">
                        <tbody>
                            <tr><td>Version</td><td>{data.projectVersion}</td></tr>
                            <tr><td>Commit</td><td>{data.commitId}</td></tr>
                            <tr><td>Branch</td><td>{data.branchName}</td></tr>
                            <tr><td>Build Time</td><td>{data.buildTime}</td></tr>
                        </tbody>
                    </table>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}