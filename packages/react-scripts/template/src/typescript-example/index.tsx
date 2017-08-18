import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';

const donut = browser.extension.getURL(require('./donut.svg'));
const Donut = () => <div style={{ color: 'red' }}>HELLO<img className="donut" src={donut} />WORLD</div>;

const mainEl = document.createElement('div');
mainEl.className = 'donut-extension-main';
document.body.appendChild(mainEl);

ReactDOM.render(
    <Donut />,
    mainEl
);