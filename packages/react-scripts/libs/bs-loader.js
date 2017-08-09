'use strict';

const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const child_process = require('child-process-promise');
const { getOptions } = require('loader-utils');

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

const makeBsbContext = bsbOutputPath => {
  const context = bsbOutputPath;
  fs.ensureDirSync(context);

  // Symlink node_modules so bs-platform is found.
  const nodeModulesInContext = path.join(context, 'node_modules');
  fs.removeSync(nodeModulesInContext);
  fs.symlinkSync(
    path.join(process.cwd(), 'node_modules'),
    nodeModulesInContext
  );

  // Rsync all the sources.
  const bsconfig = path.join(process.cwd(), 'bsconfig.json');
  const bsbSources = require(bsconfig).sources;
  const pathsToRsync = ['bsconfig.json'].concat(bsbSourceDirs(bsbSources));
  return child_process
    .execFile('rsync', ['-avR', '--delete'].concat(pathsToRsync, [context]), {
      maxBuffer: Infinity,
    })
    .then(() => context);
};

const transformSrc = (moduleDir, src) =>
  moduleDir === 'es6'
    ? src.replace(es6ReplaceRegex, '$1$3')
    : src.replace(commonJsReplaceRegex, '$1$3');

const runBsb = (compilation, bsbOutputPath) => {
  return new Promise(resolve => {
    if (compilation.__BSB_CONTEXT) {
      resolve(compilation.__BSB_CONTEXT);
      return;
    }

    log("Running BuckleScript's bsb in", bsbOutputPath);
    makeBsbContext(bsbOutputPath)
      .then(context => {
        compilation.__BSB_CONTEXT = context;
        return child_process.execFile(bsb, ['-make-world'], {
          cwd: context,
          maxBuffer: Infinity,
        });
      })
      .then(() => resolve(compilation.__BSB_CONTEXT));
  });
};

const getJsFile = (context, moduleDir, resourcePath) => {
  const mlFileName = resourcePath.replace(process.cwd(), '');
  const jsFileName = mlFileName.replace(fileNameRegex, '.js');
  return path.join(context, 'lib', moduleDir, jsFileName);
};

const getBsbErrorMessages = err => err.match(getErrorRegex);

const getCompiledFile = (compilation, resourcePath, options) => {
  return new Promise((resolve, reject) => {
    runBsb(compilation, options.bsbOutputPath).then(context => {
      const jsFile = getJsFile(context, options.module, resourcePath);
      fs.readFile(jsFile, (err, contents) => {
        if (err) {
          reject(err);
        } else {
          const src = transformSrc(options.module, contents.toString());
          resolve(src);
        }
      });
    });
  });
};

let log = console.log;

module.exports = function loader() {
  const options = getOptions(this) || {};
  options.module = options.module || 'js';
  options.bsbOutputPath =
    options.bsbOutputPath || path.join(os.tmpdir(), 'bs-loader');
  if (options.quiet) {
    log = () => {};
  }

  this.addContextDependency(this.context);
  const callback = this.async();

  getCompiledFile(this._compilation, this.resourcePath, options)
    .then(src => callback(null, src))
    .catch(err => {
      if (err instanceof Error) {
        throw err;
      }

      const errorMessages = getBsbErrorMessages(err);
      if (!errorMessages) {
        throw err;
      }

      for (let i = 0; i < errorMessages.length - 1; ++i) {
        this.emitError(new Error(errorMessages[i]));
      }

      callback(new Error(errorMessages[errorMessages.length - 1]), null);
    });
};
