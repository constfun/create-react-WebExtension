// @remove-file-on-eject
'use strict';

const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const spawnSync = require('react-dev-utils/crossSpawn').sync;
const paths = require('../../config/paths');

const rsyncFeatureSources = sources => {
  console.log('Copying files...');
  spawnSync('rsync', ['-avRq'].concat(sources, [paths.appPath]), {
    cwd: path.join(paths.ownPath, 'template'),
    stdio: 'inherit',
  });
};

const installFeatureDependencies = deps => {
  console.log('Installing dependencies...');
  const useYarn = fs.existsSync(paths.yarnLockFile);

  let command, args;
  if (useYarn) {
    command = 'yarnpkg';
    args = ['add'];
  } else {
    command = 'npm';
    args = ['install', '--save'];
  }

  const proc = spawnSync(command, args.concat(deps), {
    stdio: 'inherit',
  });
  if (proc.status !== 0) {
    console.error(`\`${command} ${args.join(' ')}\` failed`);
    process.exit(1);
  }
};

const printSuccessMessage = function() {
  console.log();
  console.log(
    chalk.green(
      `Success. Run ${chalk.bold('git status')} to see what was added.`
    )
  );
};

const injectFeature = function(feature, onSuccess) {
  console.log(chalk.green(`Adding ${feature.name} support...`));
  rsyncFeatureSources(feature.sources);
  installFeatureDependencies(feature.dependencies);
  if (onSuccess) {
    onSuccess();
  }
  printSuccessMessage(feature);
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
      injectFeature(this, () => {
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
      });
    },
  },
  {
    name: 'Ocaml',
    sources: ['bsconfig.json', 'src/ocaml-example'],
    dependencies: require(path.join(paths.ownPath, 'template/bsconfig.json'))[
      'bs-dependencies'
    ],
    inject: function() {
      injectFeature(this);
    },
  },
];
