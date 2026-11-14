
import { useAtom } from 'jotai';
import { useLocation } from 'wouter';
import { nextRouteAtom } from '~/atoms';
import { useEffect, useState } from 'react';

import './Login.css';

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
        <div className="mt-5 mb-3"><span className='login-msg py-2 px-5'>{message}</span></div>

        <form name="login-form" className="form-root" onSubmit={(e) => handleSubmit(e)}>
            <div className="login-field">
                <label htmlFor="username">UserID</label>
                <input type="text" name="username" autoComplete='username' required placeholder='User ID' />
            </div>
            <div className="login-field">
                <label htmlFor="password">Password</label>
                <input type="password" name="password" autoComplete='current-password' required placeholder='Password' />
            </div>
            <button className="btn vrnt-brand" type="submit">
                Submit
            </button>

        </form>
    </>;
}