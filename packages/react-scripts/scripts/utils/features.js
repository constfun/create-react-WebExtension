// @remove-file-on-eject
'use strict';

const path = require('path');
const fs = require('fs');
const spawnSync = require('react-dev-utils/crossSpawn').sync;
const paths = require('../../config/paths');

const useYarn = fs.existsSync(paths.yarnLockFile);

const rsyncFeatureSources = sources => {
  spawnSync('rsync', ['-avR'].concat(sources, [paths.appPath]), {
    cwd: path.join(paths.ownPath, 'template'),
    stdio: 'inherit',
  });
};

module.exports = [
  {
    name: 'TypeScript',
    sources: ['tsconfig.json', 'tslint.json', 'src/typescript-example'],
    dependencies: [
      '@types/node',
      '@types/react',
      '@types/react-dom',
      '@types/jest',
      'web-ext-types',
    ],
    inject: function() {
      rsyncFeatureSources(this.sources);

      // Fix relative paths for type roots.
      // While in packages/react-scripts/template tsconfig.json typeRoots refer to
      // node_modules in the parent directory. In a new app, they should point to
      // node_modules in the current directory instead.
      const appTsconfigPath = path.join(paths.appPath, 'tsconfig.json');
      const appTsconfig = require(appTsconfigPath);
      // Turn ../node_modules into ./node_modules
      appTsconfig.compilerOptions.typeRoots = appTsconfig.compilerOptions.typeRoots.map(
        path => path.substring(1)
      );
      fs.writeFileSync(appTsconfigPath, JSON.stringify(appTsconfig, null, 2));
    },
  },
];
