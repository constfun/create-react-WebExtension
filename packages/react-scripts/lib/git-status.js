'use strict';

const chalk = require('chalk');
const execSync = require('child_process').execSync;

function getGitStatus() {
  try {
    let stdout = execSync(`git status --porcelain`, {
      stdio: ['pipe', 'pipe', 'ignore'],
    }).toString();
    return stdout.trim();
  } catch (e) {
    return '';
  }
}

module.exports = function() {
  const gitStatus = getGitStatus();
  if (gitStatus) {
    console.error(
      chalk.red(
        `This git repository has untracked files or uncommitted changes:\n\n` +
          gitStatus.split('\n').map(line => '  ' + line) +
          '\n\n' +
          'Remove untracked files, stash or commit any changes, and try again.'
      )
    );
    process.exit(1);
  }
};
