'use strict';

const path = require('path');
const fs = require('fs-extra');
const child_process = require('child-process-promise');
const chalk = require('chalk');
const ChildProcessError = require('child-process-promise/lib/ChildProcessError');
const { getOptions } = require('loader-utils');

module.exports = function loader() {
  // const options = getOptions(this) || {};
  // options.module = options.module || 'js';
  // options.bsconfig =
  //   options.bsconfig || path.join(process.cwd(), 'bsconfig.json');
  // options.bsbOutputPath =
  //   options.bsbOutputPath ||
  //   path.join(this._compilation.options.output.path, '_bsb');

  // this.addContextDependency(this.context);
  // const callback = this.async();
  console.log(this.resourcePath);

  // getCompiledFile(this._compilation, this.resourcePath, options)
  //   .then(src => callback(null, src))
  //   .catch(err => {
  //     if (err instanceof ChildProcessError) {
  //       err.message += `\n\nStdout follows:\n${err.stdout}'\n\nStderr follows:\n${err.stderr}`;

  //       if (err.code === 23) {
  //         callback(
  //           new Error(
  //             '\n\n' +
  //               chalk.red(
  //                 "BuckleScript likely did not find one of the paths listed in bsconfig.json 'sources'\n\n"
  //               ) +
  //               err.message
  //           )
  //         );
  //         return;
  //       }

  //       const errorMessages = getBsbErrorMessages(err.message);
  //       if (errorMessages) {
  //         callback(new Error(errorMessages.join('\n')), null);
  //         return;
  //       }
  //     }

  //     callback(err);
  //   });
};
