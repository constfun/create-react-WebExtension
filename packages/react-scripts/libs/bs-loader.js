'use strict';

const path = require('path');
const fs = require('fs-extra');
const child_process = require('child-process-promise');
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
  const context = bsbOutputPath;
  fs.ensureDirSync(context);

  // Symlink node_modules so bs-platform is found.
  const nodeModulesInContext = path.join(context, 'node_modules');
  fs.removeSync(nodeModulesInContext);
  fs.symlinkSync(
    path.join(path.dirname(bsconfig), 'node_modules'),
    nodeModulesInContext
  );

  // Rsync all the sources.
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

const runBsb = (compilation, options) => {
  return new Promise(resolve => {
    if (compilation.__BSB_CONTEXT) {
      resolve(compilation.__BSB_CONTEXT);
      return;
    }

    log("Running BuckleScript's bsb in", options.bsbOutputPath);
    makeBsbContext(options)
      .then(context => {
        compilation.__BSB_CONTEXT = context;
        return child_process.execFile(bsb, ['-make-world'], {
          cwd: context,
          maxBuffer: Infinity,
        });
      })
      .then(() => {
        const context = compilation.__BSB_CONTEXT;
        fs.copySync(
          path.join(context, '.merlin'),
          path.join(path.dirname(options.bsconfig), '.merlin')
        );
        resolve(compilation.__BSB_CONTEXT);
      });
  });
};

const getBsbErrorMessages = err => err.match(getErrorRegex);

const getCompiledFile = (compilation, resourcePath, options) => {
  return new Promise((resolve, reject) => {
    runBsb(compilation, options).then(context => {
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
    });
  });
};

module.exports = function loader() {
  const options = getOptions(this) || {};
  options.module = options.module || 'js';
  options.bsconfig =
    options.bsconfig || path.join(process.cwd(), 'bsconfig.json');
  options.bsbOutputPath =
    options.bsbOutputPath || path.join(path.dirname(options.bsconfig), '_bsb');

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
