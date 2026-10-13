import { useLocation } from "wouter";
import { nextRouteAtom } from "../atoms";
import { useSetAtom } from "jotai";
import { useEffect } from "react";

interface hookProps {
    url : string;
    data_proc : (data : any) => void
}

export function useProtectedData({url, data_proc} : hookProps) {
    const [location, navigate] = useLocation();
    const setNextUrl = useSetAtom(nextRouteAtom);

    useEffect( () => {
        fetch(url).then((response) => {
            console.log("-- inside useProtectedData ", url)
            if (response.ok) {
                console.log("-- response ok")
                response.json().then((data) => {
                console.log("-- calling data_proc")
                data_proc(data)})
            } else {
                console.log("-- response not ok")
                if (response.status == 401) {
                    setNextUrl(location);
                    navigate("/login", {replace : true});
                } else {
                    throw Error(`Response code = ${response.status} : ${response.statusText}`)
                }
            }


        })

    }, []);

}
