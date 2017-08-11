import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Step0 from './Step0';
import './index.css';

const mainEl = document.createElement('div');
mainEl.className = 'donut-main';
document.body.appendChild(mainEl);

ReactDOM.render(<Step0 />, mainEl);
