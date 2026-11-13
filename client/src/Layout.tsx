import TopBar from "~/components/TopBar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({children} : LayoutProps) {

    return (
        <>
            <TopBar/>
            {children}
        </>
    )
}