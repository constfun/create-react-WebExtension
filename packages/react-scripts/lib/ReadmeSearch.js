'use strict';

const React = require('react');
require('./ReadmeSearch.css');

const escapeEl = document.createElement('textarea');
const escapeHTML = function(html) {
    escapeEl.textContent = html;
    return escapeEl.innerHTML;
};

const filterToc = (node) => {
  return node.innerText === 'Table of Contents';
};

const rankedSearch = (text, query, numContextChars) => {
  const fmtQuery = query.trim().replace(/ +/, '|');
  const reSearch = new RegExp(fmtQuery, 'ig'); 
  let matchCount = 0;
  let avgIndex = 0;
  let match;
  while ((match = reSearch.exec(text)) !== null) {
    matchCount++; 
    avgIndex = avgIndex + (match.index - avgIndex) / matchCount;
  }
  if (matchCount) {
    const start = Math.max(avgIndex - numContextChars / 2);
    const end = Math.min(start + numContextChars, text.length);
    const context = text.substring(start, end);
    const reMark = new RegExp(`(${fmtQuery})`, 'ig'); 
    const markedContext = context.replace(reMark, '<mark>$1</mark>')
    return {
      rank: matchCount,
      context: '...' + markedContext + '...',
    };
  }
  else {
    return null;
  }
};

function readmeSearch(sections, queryString, opts = {}) {
  opts.numContextChars = opts.numContextChars || 300;
  const results = [];
  for (let sec of sections) {
    const res = rankedSearch(sec.text, queryString, opts.numContextChars);
    if (res) {
      results.push({
        heading: sec.name,
        href: '#' + sec.id,
        rank: res.rank,
        __html: res.context,
      });
    }
  }
  return results.sort((a, b) => b.rank - a.rank);
}

const indexSections = (opts = {}) => {
  opts.filterFn = opts.filter || filterToc;
  opts.readmeSelector = opts.readmeSelector || '#readme > article';
  opts.sectionTagNames = ['H1', 'H2', 'H3', 'H4'];
  const sections = [];
  let curNode = document.querySelector(opts.readmeSelector).firstChild;
  let curSec = null;
  let curSecText = '';
  while (curNode) {
    if (opts.filterFn && opts.filterFn(curNode)) {
      // Skip to next section.
      curNode = curNode.nextElementSibling;
      while (curNode && !opts.sectionTagNames.includes(curNode.tagName)) {
        curNode = curNode.nextElementSibling;
      }
      continue;
    }
    if (opts.sectionTagNames.includes(curNode.tagName)) {
      if (curSec) {
        sections.push({
          name: curSec.textContent,
          id: curSec.firstChild.id,
          text: curSecText,
        });
      }
      curSec = curNode;
      curSecText = '';
    }
    else {
      curSecText += escapeHTML(curNode.textContent) + ' ';
    }
    curNode = curNode.nextElementSibling;
  }
  return sections;
};

class ReadmeSearch extends React.Component {
  constructor(props) {
    super();
    this.sections = indexSections(props.opts);
  }

  render() {
    const el = React.createElement;
    let resultDivs = [];
    if (this.props.query.length > 1) {
      const results = readmeSearch(
        this.sections,
        this.props.query,
        this.props.opts
      ).slice(0, 10);
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

    return el('div', { className: 'ReadmeSearch' }, resultDivs);
  }
}

module.exports = ReadmeSearch;