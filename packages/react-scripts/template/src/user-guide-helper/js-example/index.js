import * as React from 'react';
import './index.css';

(function() {
  var escapeEl = document.createElement('textarea');

  window.escapeHTML = function(html) {
      escapeEl.textContent = html;
      return escapeEl.innerHTML;
  };

  window.unescapeHTML = function(html) {
      escapeEl.innerHTML = html;
      return escapeEl.textContent;
  };
})();

const searchReadme = (queryString, callback) => {
  const query = new RegExp(`(${queryString})`, 'i');
  const firstSection = document.querySelector('#readme > article > h2:nth-of-type(2)')
  let node = firstSection;
  let curSection = null;
  let context = '';
  let results = [];
  while (node) {
    if (node.tagName === 'H2' || node.tagName === 'H3') {
      if (curSection && context.length) {
        results.push({
          heading: curSection.textContent,
          href: '#' + curSection.firstChild.id,
          __html: context,
        });
      }

      curSection = node;
      context = '';
    }
    else {
      if (context.length < 300) {
        const text = node.textContent;
        const contextLen = 100; // chars around the match
        let match = query.exec(text);
        if (match !== null) {
          const matchInContext = match.input.substring(match.index - contextLen, match.index + contextLen);
          const escaped = window.escapeHTML(matchInContext);
          const highlighted = escaped.replace(query, '<mark>$1</mark>');
          context += ' ... ' + highlighted;
        }
      }
    }
    node = node.nextElementSibling;
  }
  return results;
};

export default class JsExample extends React.Component {
  constructor() {
    super();
    this.state = {
      query: '',
      results: [],
    };
  }

  search = (event) => {
    const query = event.target.value;
    if (query.length > 1) {
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
          <div dangerouslySetInnerHTML={res} />
        </div>
      );
    });

    return (
      <div className="JsExample">
        <input type="search" value={this.query} onChange={this.search} />
        <div className="results">
          {resultDivs}
        </div>
      </div>
    );
  }
}