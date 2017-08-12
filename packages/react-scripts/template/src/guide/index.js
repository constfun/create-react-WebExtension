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
    { name: 'js-flavor', human: 'JavaScript' },
    { name: 'typescript-flavor', human: 'TypeScript' },
    { name: 'ocaml-flavor', human: 'Ocaml' },
    { name: 'reasonml-flavor', human: 'ReasonML' },
  ];
  for (let fl of flavors) {
    fl.isAvailable = checkFeature(fl.name);
  }

  return (
    <div className="Main">
      <p>Welcome to Create React WebExtension</p>
      <p>
        This <code>src/guide/</code> and some examples:
      </p>
      <Dispenser flavors={flavors} />
      <p>
        Delete the contents of <code>src/</code> and <code>public/</code> to
        start from scratch.
      </p>
      <p>
        If lost, and if not, read the <code>README.md</code>.
      </p>
      <p>
        If broken, be kind and <a>please report an issue</a>.
      </p>
    </div>
  );
};

const mainEl = document.createElement('div');
mainEl.className = 'web-ext-donut';
document.body.appendChild(mainEl);
ReactDOM.render(<Main />, mainEl);
