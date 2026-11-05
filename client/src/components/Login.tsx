
import { useAtom } from 'jotai';
import { useLocation } from 'wouter';
import { nextRouteAtom } from '~/atoms';
import { useEffect, useState } from 'react';

export interface loginProps {
    msg: string;
}

export default function Login({ msg }: loginProps) {
    const [message, setMessage] = useState<string>()
    const [nextUrl, setNextUrl] = useAtom(nextRouteAtom);
    const [_, navigate] = useLocation();

    useEffect(() => {
        setMessage(msg)
    }, [msg])

    async function handleSubmit(event : any) {

        event.preventDefault();

        // make sure the controls have a name attribute set.
        const data = new FormData(event.currentTarget);

        const response = await fetch('/api/login', {
            method: 'POST',
            body: data,
        })

        if (response.ok) {
            const url = nextUrl;
            console.log("okay - routing to ", url)
            setNextUrl('/');
            navigate(url, { replace: true });
        } else {
            setMessage("Invalid Login")
        }
    }

    return <>
        <div><span>{message}</span></div>
        <form onSubmit={handleSubmit}>
                <label>User Id</label>
                <input type="text" placeholder="User ID"
                    name="username"
                    autoComplete='username'
                    />

                <label>Password</label>
                <input type="password" placeholder="Password"
                    autoComplete='current-password'
                    name="password"
                    />
            <button className="button is-primary" type="submit">
                Submit
            </button>
        </form>
    </>;
}