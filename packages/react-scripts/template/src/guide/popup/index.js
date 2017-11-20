import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';

const Popup = () => {
  const openTheUserGuide = () => {
    const brow = /Chrome/.test(navigator.userAgent) ? chrome : browser;
    brow.tabs.create({
        active: true,
        url: 'https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md',
    });
  };

  return (
    <div className="Popup" onClick={openTheUserGuide}>
      This popup is just an example.<br/>
      Click it to open the user guide.
    </div>
  );
};

ReactDOM.render(<Popup />, document.querySelector('main'));