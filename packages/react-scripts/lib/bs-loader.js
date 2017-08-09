'use strict';

const path = require('path');
const fs = require('fs-extra');
const child_process = require('child-process-promise');
const ChildProcessError = require('child-process-promise/lib/ChildProcessError');
const { getOptions } = require('loader-utils');

// We'll make this noop if quiet.
let log = console.log;

let bsb;
try {
  bsb = require.resolve('bs-platform/bin/bsb.exe');
} catch (e) {
  bsb = 'bsb';
}

const fileNameRegex = /\.(ml|re)$/;
const es6ReplaceRegex = /(from\ "\.\.?\/.*)(\.js)("\;)/g;
const commonJsReplaceRegex = /(require\("\.\.?\/.*)(\.js)("\);)/g;
const getErrorRegex = /(File [\s\S]*?:\n|Fatal )[eE]rror: [\s\S]*?(?=ninja|\n\n|$)/g;

const bsbSourceDirs = bsbSources => {
  if (typeof bsbSources === 'string') {
    return [bsbSources];
  } else if (Array.isArray(bsbSources)) {
    return bsbSources.reduce((acc, item) =>
      acc.concat(bsbSourceDirs(item), [])
    );
  } else {
    return [bsbSources.dir];
  }
};

const makeBsbContext = ({ bsconfig, bsbOutputPath }) => {
  const rootPath = path.dirname(bsconfig);
  const context = bsbOutputPath;
  fs.ensureDirSync(context);

  // Symlink node_modules so bs-platform is found.
  const nodeModulesInContext = path.join(context, 'node_modules');
  fs.removeSync(nodeModulesInContext);
  fs.symlinkSync(path.join(rootPath, 'node_modules'), nodeModulesInContext);

  // Rsync all the sources.
  const bsbSources = require(bsconfig).sources;
  const pathsToRsync = ['bsconfig.json'].concat(bsbSourceDirs(bsbSources));
  return child_process
    .execFile('rsync', ['-avR', '--delete'].concat(pathsToRsync, [context]), {
      cwd: rootPath,
      maxBuffer: Infinity,
    })
    .then(() => context);
};

const transformSrc = (moduleDir, src) =>
  moduleDir === 'es6'
    ? src.replace(es6ReplaceRegex, '$1$3')
    : src.replace(commonJsReplaceRegex, '$1$3');

const runBsb = (compilation, options) => {
  return new Promise((resolve, reject) => {
    if (compilation.__BSB_CONTEXT) {
      resolve(compilation.__BSB_CONTEXT);
      return;
    }

    log("Running BuckleScript's bsb in", options.bsbOutputPath);
    makeBsbContext(options)
      .then(context => {
        compilation.__BSB_CONTEXT = context;
        return child_process
          .execFile(bsb, ['-make-world'], {
            cwd: context,
            maxBuffer: Infinity,
          })
          .then(() => context);
      })
      .then(context =>
        patchAndCopyMerlinFile(context, options).then(() => context)
      )
      .then(resolve)
      .catch(reject);
  });
};

const merlinRegex = /B lib\/bs\/src\//;
const patchAndCopyMerlinFile = (context, options) => {
  const srcPath = path.join(context, '.merlin');
  const destPath = path.join(path.dirname(options.bsconfig), '.merlin');
  return fs.readFile(srcPath).then(buf => {
    const patchedContent = buf
      .toString()
      .replace(merlinRegex, `B ${context}/lib/bs/src/`);
    return fs.writeFile(destPath, patchedContent);
  });
};

const getBsbErrorMessages = text => text.match(getErrorRegex);

const getCompiledFile = (compilation, resourcePath, options) => {
  return new Promise((resolve, reject) => {
    runBsb(compilation, options)
      .then(context => {
        const rootPath = path.dirname(options.bsconfig);
        const mlFile = resourcePath.replace(rootPath, '');
        const jsFile = path.join(
          context,
          'lib',
          options.module,
          mlFile.replace(fileNameRegex, '.js')
        );
        fs.readFile(jsFile, (err, contents) => {
          if (err) {
            reject(err);
          } else {
            const src = transformSrc(options.module, contents.toString());
            resolve(src);
          }
        });
      })
      .catch(reject);
  });
};

module.exports = function loader() {
  const options = getOptions(this) || {};
  options.module = options.module || 'js';
  options.bsconfig =
    options.bsconfig || path.join(process.cwd(), 'bsconfig.json');
  options.bsbOutputPath =
    options.bsbOutputPath ||
    path.join(path.dirname(options.bsconfig), '.tmp/bsb');

  if (options.quiet) {
    log = () => {};
  }

  this.addContextDependency(this.context);
  const callback = this.async();

  getCompiledFile(this._compilation, this.resourcePath, options)
    .then(src => callback(null, src))
    .catch(err => {
      if (err instanceof ChildProcessError) {
        err.message += `\n\nStdout follows:\n${err.stdout}'\n\nStderr follows:${err.stderr}`;

        const errorMessages = getBsbErrorMessages(err.message);
        if (errorMessages) {
          callback(new Error(errorMessages.join('\n')), null);
          return;
        }
      }

      throw err;
    });
};
