// You can use ES6 modules and JSX.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import

// Absolute imports from node_modules.
import * as React from 'react';
import * as ReactDOM from 'react-dom';
// Absolute import of a module from src/node_modules
import checkFeature from '@app/check-feature';
// Import relative to the location of the current file.
import Dispenser from './components/Dispenser';
// This import marks the ./index.css file as a CSS dependency of this module.
// These styles will be loaded/unloaded along with this module, automatically.
import './index.css';

// This is a stateless React component implemented as a function.
const Main = () => {
  const flavors = [
    { name: 'js-flavor', human: 'a JavaScript' },
    { name: 'typescript-flavor', human: 'a TypeScript' },
    { name: 'ocaml-flavor', human: 'an Ocaml' },
    { name: 'reasonml-flavor', human: 'a ReasonML' },
  ];
  for (let fl of flavors) {
    fl.isAvailable = checkFeature(fl.name);
  }

  return (
    <div className="Main">
      <p>Hey there,</p>
      <p>
        This extension is a demo of available features when using Create React
        WebExtension.<br />
        You should look through the code for detailed and important comments.
      </p>
      <p>
        To get more code and donuts, give these a try (followed by{' '}
        <code>git diff</code>)
      </p>
      <Dispenser flavors={flavors} />
    </div>
  );
};

const mainEl = document.createElement('div');
mainEl.className = 'web-ext-donut';
document.body.appendChild(mainEl);
ReactDOM.render(<Main />, mainEl);
