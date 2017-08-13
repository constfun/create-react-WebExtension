// @remove-file-on-eject
'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const inquirer = require('react-dev-utils/inquirer');
const ensureGitStatus = require('../lib/git-status');
const features = require('./utils/features');

ensureGitStatus();

const choices = features.map(feat => ({ name: feat.name, value: feat }));

inquirer
  .prompt({
    type: 'list',
    name: 'feature',
    message: 'Add support for additional languages:',
    choices,
  })
  .then(({ feature }) => feature.inject());
