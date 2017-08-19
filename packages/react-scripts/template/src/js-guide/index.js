/* global holmes */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../guide/guide.css';

// import 'holmes.js';
// const holmes = require('holmes.js');

// const getAllSections = () => {
//   const firstSection = document.querySelector('#readme > article > h2:nth-of-type(2)')
//   let node = firstSection;
//   let sections = [];
//   while (node) {
//     if (node.tagName === 'H2') {
//       sections.push({
//         name: node.innerText,
//         nodes: [node],
//       });
//     }
//     else {
//       sections[sections.length - 1].nodes.push(node);
//     }
//     node = node.nextElementSibling;
//   }
//   console.log(sections);
// };

const wrapSections = () => {
  // const firstSection = document.querySelector('#readme > article > h2:nth-of-type(2)');
  const article = document.querySelector('#readme > article');
  const children = article.children;
  let tail = children.length;
  for (let i = children.length - 1; i >= 0; i--) {
    const node = children[i];
    if (node.tagName === 'H2') {
      const section = document.createElement('section');
      article.insertBefore(section, node);
      const howManyToMove = tail - i;
      for (let j = 0; j < howManyToMove; j++) {
        section.appendChild(children[i + 1]);
      }
      tail = i;
    }
  }
}

class Main extends React.Component {
  componentWillMount() {
    wrapSections();
  }

  componentDidMount() {
    var h = holmes({
      input: '.Main input[type=search]',
      find: '#readme > article > section',
      placeholder: '<h3>— No results, my dear Watson. —</h3>',
      mark: true,
      hiddenAttr: false,
      class: {
        visible: 'visible',
        hidden: 'hidden'
      },
      // onHidden(el) {
      //   console.log('hidden', el);
      // },
      // onFound(el) {
      //   console.log('found', el);
      // },
      // onInput(el) {
      //   console.log('input', el);
      // },
      // onVisible(el) {
      //   console.log('visible', el);
      // },
      // onEmpty(el) {
      //   console.log('empty', el);
      // }
    });

    h.start();

  }

  render() {
    return (
      <div className="Main">
        <input type="search" />
      </div>
    );
  }
}

console.log('Hello World!');

const ourContainer = document.createElement('div');
const readmeContainer = document.getElementById('readme');
readmeContainer.insertBefore(ourContainer, readmeContainer.firstChild);
ReactDOM.render(<Main />, ourContainer);