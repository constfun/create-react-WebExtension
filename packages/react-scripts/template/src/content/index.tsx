import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
import {hello} from '../other';

const donut = browser.extension.getURL(require('./donut.svg'));

console.log(hello, donut);

// import * as donutSvg from 'file-loader!./donut.svg';

// const a = require('file-module!./donut.svg');
// const donutSvg = require(a);

const Donut = () => <img className="donut" src={donut} />;

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