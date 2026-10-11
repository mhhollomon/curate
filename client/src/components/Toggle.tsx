import { Button } from 'react-bootstrap';
import './toggle.css'

// import { useEffect, useRef, useState } from 'react';

const file_icon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file" viewBox="0 0 16 16">
  <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1"/>
</svg>

const file_check_fill_icon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-check-fill" viewBox="0 0 16 16">
  <path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2m-1.146 6.854-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 8.793l2.646-2.647a.5.5 0 0 1 .708.708"/>
</svg>

export interface ToggleProps {
    state : boolean,
    title : string,
    onStateChange : (new_state : boolean) => void
}

export default function Toggle({state, title, onStateChange} : ToggleProps) {

    function handleStateChange() {
        onStateChange(!state)
    }

    return <div>
        <Button onClick={handleStateChange}>
            {state ? file_check_fill_icon : file_icon}
            &nbsp;
            {title}
        </Button>
    </div>
}