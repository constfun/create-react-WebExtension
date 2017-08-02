import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
// import * as donutSvg from 'file-loader!./donut.svg';

// declare module "file-loader!*" {
//     const value: any;
//     export default value;
// }

// const a = require('file-module!./donut.svg');
// const donutSvg = require(a);

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