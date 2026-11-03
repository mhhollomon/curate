import { HamburgerMenuIcon } from "@radix-ui/react-icons"
import Flex from "~/components/bulma/flex"

export default function Topbar() {

    return (
        <Flex className="has-background-primary has-text-white is-justify-content-space-between mb-3">
            <div className="is-inline-block">
                <HamburgerMenuIcon className="ml-1" />
            </div>
            <div className="is-inline-block">Curate</div>
            <div className="is-inline-block">&nbsp;</div>
        </Flex>
    );
}