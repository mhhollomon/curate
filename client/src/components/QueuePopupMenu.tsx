import type { ReactNode } from "react";

import { DropdownMenu } from "radix-ui";
import { three_dots_vert } from "~/icons";
import Icon from "~/components/Icon";

interface QueuePopupMenuProps {
    children?: ReactNode; // but really must be one or more DropdownMenu.Item
}

export default function QueuePopupMenu({ children }: QueuePopupMenuProps) {

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <a className="bare-link" aria-label="Add to queue"><Icon size="1.25em" icon={three_dots_vert} /></a>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" className="menu-content">
                    {children}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>

        </DropdownMenu.Root>
    );

}