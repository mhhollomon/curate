import React, { type ReactNode, Children, isValidElement, useId } from "react";
import { three_dots_vert } from "~/icons";
import Icon from "~/framework/components/Icon";

import "./QueuePopupMenu.css";

interface QueuePopupMenuProps {
    children?: ReactNode;
}

export default function QueuePopupMenu({ children }: QueuePopupMenuProps) {

    const popover_id = useId();

    return (
        <>
            <button className="bare-btn"
                popoverTarget={popover_id}
                popoverTargetAction="show"
                style ={{
                    anchorName : `--anc-${popover_id}`
                }}


                >
                    <Icon size="1.25em" icon={three_dots_vert} />
            </button>

            <div popover="auto" id={popover_id}
                className="queue-menu__content"
                style = {{
                    positionAnchor : `--anc-${popover_id}`
                }}
                >
                {Children.map(children, (child) => {
                    if (isValidElement(child) && (child.type === (<button />).type)) {
                        return React.cloneElement(child, {
                            // These work, but the React typing thinks they are wrong. So ignore.
                            // @ts-ignore
                            popoverTargetAction: 'hide',
                            popoverTarget: popover_id
                        });
                    } else {
                        return child;
                    }
                })}
            </div>
        </>
    );

}