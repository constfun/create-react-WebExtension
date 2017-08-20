// You can use ES6 modules and JSX.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import

// Absolute imports from node_modules.
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.css';

// This is a stateless React component implemented as a function.
const Main = () => {
  const examples = [
    'js-example',
    'typescript-example',
    'ocaml-example',
    'reasonml-example',
  ];

  const exampleComponents = [];
  for (let example of examples) {
    let Component;
    try {
      Component = require(`../${example}`).default;
    }
    catch (_) {
      continue;
    }

    exampleComponents.push(
      <Component key={example} />
    );
  }

  return (
    <div className="Main">
      <div className="welcome-message">
        <h1>Welcome to Create React WebExtension</h1>
        <p>
          This message is injected by `user-guide/index.js` which is listed as a content script in `manifest.json`.
          {/* If broken, please be kind and <a>report an issue</a>. */}
        </p>
      </div>
      {exampleComponents}
    </div>
  );
};

const ourContainer = document.createElement('div');
const readme = document.getElementById('readme');
const article = readme.querySelector('article');
readme.insertBefore(ourContainer, article);
ReactDOM.render(<Main />, ourContainer);
