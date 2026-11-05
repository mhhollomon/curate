
import { useAtom } from 'jotai';
import { useLocation } from 'wouter';
import { nextRouteAtom } from '~/atoms';
import { useEffect, useState } from 'react';
import { Form } from "radix-ui";

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
        <div><span>{message}</span></div>
        <Form.Root className="form-root" onSubmit={handleSubmit}>
            <Form.Field name="username" className="field-group">
                <Form.Label>User ID</Form.Label>
                <Form.Control autoComplete='username' placeholder='User ID' />
            </Form.Field>
            <Form.Field name="password" className="field-group">
                <Form.Label>Password</Form.Label>
                <Form.Control autoComplete='current-password' placeholder='Password' />
            </Form.Field>
            <Form.Submit asChild>
            <button className="button is-primary" type="submit">
                Submit
            </button>
            </Form.Submit>
        </Form.Root>
    </>;
}