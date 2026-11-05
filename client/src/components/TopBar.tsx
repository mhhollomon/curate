import { DropdownMenu } from "radix-ui";
import Flex from "~/components/bulma/flex"
import Icon from "~/components/Icon";
import { hamburger } from "~/icons";
import { navigate } from "wouter/use-browser-location";

export default function Topbar() {

    return (
        <Flex className="has-background-primary has-text-white is-justify-content-space-between mb-3">
            <div className="is-inline-block">
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                        <a className="bare-link" aria-label="Navigate"><Icon size="20px" icon={hamburger} /></a>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                        <DropdownMenu.Content align="start" className="menu-content">
                            <DropdownMenu.Label><span className="is-italic">Go To</span></DropdownMenu.Label>
                            {/* Using `Link` doesn't allow the menu to close after click */}
                            <DropdownMenu.Item><a className="bare-link hover-underline has-text-black" onClick={() => navigate("/artists")}>Artists</a></DropdownMenu.Item>
                            <DropdownMenu.Item><a className="bare-link hover-underline has-text-black" onClick={() => navigate("/albums")}>Albums</a></DropdownMenu.Item>
                            <DropdownMenu.Item><a className="bare-link hover-underline has-text-black" onClick={() => navigate("/queue")}>Queue</a></DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>

                </DropdownMenu.Root>


            </div>
            <div className="is-inline-block">Curate</div>
            <div className="is-inline-block">&nbsp;</div>
        </Flex>
    );
}