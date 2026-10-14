
import { useAtom } from 'jotai';
import { Button, Form } from 'react-bootstrap'
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
        <Form  onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="username">
                <Form.Label>User Id</Form.Label>
                <Form.Control type="text" placeholder="User ID"
                    name="username"
                    autoComplete='username'
                    />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password"
                    autoComplete='current-password'
                    name="password"
                    />
            </Form.Group>
            <Button variant="primary" type="submit">
                Submit
            </Button>
        </Form>
    </>;
}