/*
  This script is bundled into the js/guide-popup.js file because:
      - There is an empty _bundle file in this directory.
      - The current file is named 'index.js' making it the entry point for the bundle.
      - The bundle path becomes the bundle name.
        guide/popup -> guide-popup.js
*/

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './Popup.css';

const Popup = () => {
  const openTheUserGuide = () => {
    browser.tabs.create({
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