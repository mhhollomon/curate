
import { Dialog } from "radix-ui";

import "./About.css";
import { useEffect, useState } from 'react';
import Icon from "~/components/Icon";
import { question_circle } from "~/icons";

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
    const {version, commitShort, isDirty, branch, buildTime} = __BUILD_INFO__;
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
                            <tr><th>Version</th><td>{version}</td></tr>
                            <tr><th>Commit</th><td>{commitShort + (isDirty?'+':'')}</td></tr>
                            <tr><th>Branch</th><td>{branch}</td></tr>
                            <tr><th>Build Time</th><td>{buildTime}</td></tr>
                        </tbody>
                    </table>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}