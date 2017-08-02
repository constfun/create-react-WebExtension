import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
// import donut from './donut.svg';

const Donut = () => <img className="donut" src="donut.svg" />;

browser.runtime.onMessage.addListener(() => {
    const mainEl = document.createElement('div');
    mainEl.className = 'donut-extension-main';
    document.body.appendChild(mainEl);

    ReactDOM.render(
        <Donut />,
        mainEl
    );

    return true;
});