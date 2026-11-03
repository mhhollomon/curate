import TopBar from "~/components/TopBar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({children} : LayoutProps) {

    return (
        <div className="topDiv theme-light">
            <TopBar/>
            {children}
        </div>
    )
}