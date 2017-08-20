import * as React from 'react';
import './Flavor.css';

export default function Flavor(props) {
    return (
        <div className="Flavor">
            {props.essence}
        </div>
    );
}