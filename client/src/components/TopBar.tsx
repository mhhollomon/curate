import Icon from "~/framework/components/Icon";
import About from "~/components/About";
import { hamburger } from "~/icons";
import { navigate } from "wouter/use-browser-location";

import "./TopBar.css";

export default function Topbar() {

    return (
        <header className="d-flex vrnt-brand justify-content-between mb-3 pt-1">
            <div className="d-inline-block ms-2">
                <div className="header-menu">
                    <button className="bare-link menu-trigger"
                        popoverTarget="header-menu"
                        popoverTargetAction="toggle"
                        aria-label="Navigate"><Icon size="20px" icon={hamburger} /></button>
                    <ul id="header-menu" popover="auto" className="header-menu__content">
                        <li><button popoverTargetAction="hide"
                                popoverTarget="header-menu"
                                className="bare-link hover-underline" onClick={() => navigate("/artists")}>Artists</button></li>
                        <li><button popoverTargetAction="hide"
                                popoverTarget="header-menu"
                                className="bare-link hover-underline" onClick={() => navigate("/albums")}>Albums</button></li>
                        <li><button popoverTargetAction="hide"
                                popoverTarget="header-menu"
                                className="bare-link hover-underline" onClick={() => navigate("/queue")}>Queue</button></li>
                    </ul>
                </div>

            </div>

            <div className="is-inline-block">Curate</div>

            <div className="is-inline-block"><About className="me-2" /></div>
        </header>
    );
}