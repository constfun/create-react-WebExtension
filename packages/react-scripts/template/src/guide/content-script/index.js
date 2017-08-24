import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
import Search from './Search';

const Main = () => {
  return (
    <div className="Main">
      <div className="message">
        <h2>Welcome to Create React WebExtension</h2>
        <p>
          This page is a modified version of the
          <a href="https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md">
          &nbsp;Create React App User Guide</a>.
        </p>
        <p>
          This message and the search bar bellow are displayed by the
          example extension from <code>src/guide/content-script/index.js</code>
        </p>
      </div>
      <Search />
    </div>
  );
};

const ourContainer = document.createElement('div');
const readme = document.getElementById('readme');
const article = readme.querySelector('article');
readme.insertBefore(ourContainer, article);
ReactDOM.render(<Main />, ourContainer);