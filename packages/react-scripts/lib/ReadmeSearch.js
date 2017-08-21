'use strict';

const React = require('react');
require('./ReadmeSearch.css');

const escapeEl = document.createElement('textarea');
const escapeHTML = function(html) {
    escapeEl.textContent = html;
    return escapeEl.innerHTML;
};

function readmeSearch(queryString) {
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
          const escaped = escapeHTML(matchInContext);
          const highlighted = escaped.replace(query, '<mark>$1</mark>');
          context += ' ... ' + highlighted;
        }
      }
    }
    node = node.nextElementSibling;
  }
  return results;
}

const ReadmeSearch = (props) => {
  const el = React.createElement;
  let resultDivs = [];
  if (props.query.length > 1) {
    const results = readmeSearch(props.query);
    resultDivs = results.map(res => {
      return (
        el('div',
          { key: res.href, className: "result" },
          [
            el('a', { href: res.href }, res.heading),
            el('div', { dangerouslySetInnerHTML: res }, null),
          ]
        )
      );
    });
  }

  return el('div', { className: ReadmeSearch }, resultDivs);
};

module.exports = ReadmeSearch;