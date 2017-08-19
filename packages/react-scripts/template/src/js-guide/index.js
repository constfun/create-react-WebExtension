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

// const wrapSections = () => {
//   // const firstSection = document.querySelector('#readme > article > h2:nth-of-type(2)');
//   const article = document.querySelector('#readme > article');
//   const children = article.children;
//   let tail = children.length;
//   for (let i = children.length - 1; i >= 0; i--) {
//     const node = children[i];
//     if (node.tagName === 'H2') {
//       const section = document.createElement('section');
//       article.insertBefore(section, node);
//       const howManyToMove = tail - i;
//       for (let j = 0; j < howManyToMove; j++) {
//         section.appendChild(children[i + 1]);
//       }
//       tail = i;
//     }
//   }
// }

const searchReadme = (query, callback) => {
  const firstSection = document.querySelector('#readme > article > h2:nth-of-type(2)')
  let node = firstSection;
  let curSection = null;
  let matches = '';
  let results = [];
  while (node) {
    if (node.tagName === 'H2') {
      if (curSection && matches) {
        results.push({
          heading: curSection.textContent,
          href: curSection.firstChild.id,
          matches: matches,
        });
      }

      curSection = node;
      matches = '';
    }
    else {
      const text = node.textContent;
      if (text.indexOf(query) !== -1) {
        matches += text;
      }
    }
    node = node.nextElementSibling;
  }
  return results;
};

class Main extends React.Component {
  constructor() {
    super();
    this.state = {
      query: '',
      results: [],
    };
  }

  search = (event) => {
    const query = event.target.value;
    if (query.length > 2) {
      this.setState({
        query,
        results: searchReadme(query),
      });
    }
    else {
      this.setState({ query });
    }
  }

  displayResults = (results) => {
    this.setState({ results });
  }

  render() {
    const resultDivs = this.state.results.map(res => {
      return (
        <div key={res.href} className="result">
          <a href={res.href}>{res.heading}</a>
          <div className="matches">{res.matches}</div>
        </div>
      );
    });

    return (
      <div className="Main">
        <input type="search" value={this.query} onChange={this.search} />
        {resultDivs}
      </div>
    );
  }
}

const ourContainer = document.createElement('div');
const readmeContainer = document.getElementById('readme');
readmeContainer.insertBefore(ourContainer, readmeContainer.firstChild);
ReactDOM.render(<Main />, ourContainer);