import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Help from './components/Help';

const mainEl = document.createElement('div');
mainEl.className = 'donut-main';
document.body.appendChild(mainEl);

ReactDOM.render(<Help />, mainEl);
