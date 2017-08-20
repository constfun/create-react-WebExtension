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

module.exports = searchReadme (queryString, callback) {
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
}