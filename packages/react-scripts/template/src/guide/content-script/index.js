/*
  This script is bundled into the build/js/guide-content-script.js file because:
      - There is an empty _bundle file in this directory.
      - The current file is named 'index.js' making it the entry point for the bundle.
      - The bundle path becomes the bundle name.
        guide/content-script -> guide-content-script.js
*/

import * as React from 'react';
import * as ReactDOM from 'react-dom';

// CSS can be imported, marking it a dependency of this module.
// These styles will be automatically loaded/unloaded along with the module.
import './styles.css';

const Main = () => {
  // The search bar is re-implemented in a number of languages, as an example.
  const searchBars = [
    'Search',
    'SearchTypeScript',
    'SearchOcaml',
    'SearchReasonML',
  ].reduce((comps, compName) => {
    // We display any examples that exist in the project.
    try {
      const Component = require(`./${compName}`).default;
      comps.push(<Component key={compName} />);
    }
    catch (err) {
      // Make sure we're ignoring the right error, re-throw if not.
      if (!err.message.startsWith('Cannot find module')) {
        throw err;
      }
    }
    return comps;
  }, []);

  return (
    <div className="Main">
      <div className="welcome-message">
        <h2>Welcome to Create React WebExtension</h2>
        <p>This message and the search bar bellow are displayed by the example extension from <code>src/guide/content-script/index.js</code>.</p>
        <p>This page contains a modified version of the <a href="https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md">Create React App User Guide</a>.</p>
        <p>The search bar bellow is reimplemented in several programming languages. Run <code>yarn inject</code> for more.</p>
      </div>
      {searchBars}
    </div>
  );
};

// Insert our Main component at the top of the README.md document on GitHub.
const ourContainer = document.createElement('div');
const readme = document.getElementById('readme');
const article = readme.querySelector('article');
readme.insertBefore(ourContainer, article);
ReactDOM.render(<Main />, ourContainer);