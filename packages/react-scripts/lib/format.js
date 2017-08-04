'use strict';

const chalk = require('chalk');
const clearConsole = require('react-dev-utils/clearConsole');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');

const printInstructions = useYarn => {
  console.log();
  console.log(
    chalk.green(
      `You can now load the ${chalk.bold(
        'build'
      )} directory as a temporary extension.`
    )
  );
  console.log();
  console.log('Note that the development build is not optimized.');
  console.log(
    `To create a production build, use ` +
      `${chalk.cyan(`${useYarn ? 'yarn' : 'npm run'} build`)}.`
  );
  console.log();
};

const allErrors = new Map();
const allWarnings = new Map();
const allOk = new Map();
const all = new Map();

const chunksWithErrors = new Map();

const printCompilationStats = ({
  stats,
  // isFirstCompile,
  // useYarn,
  // isInteractive,
}) => {
  const statReq = {
    // Add asset Information
    assets: true,
    // Sort assets by a field
    // assetsSort: "field",
    // Add information about cached (not built) modules
    cached: true,
    // Show cached assets (setting this to `false` only shows emitted files)
    cachedAssets: true,
    // Add children information
    children: true,
    // Add chunk information (setting this to `false` allows for a less verbose output)
    chunks: true,
    // Add built modules information to chunk information
    chunkModules: true,
    // Add the origins of chunks and chunk merging info
    chunkOrigins: true,
    // Sort the chunks by a field
    // chunksSort: "field",
    // Context directory for request shortening
    // context: "../src/",
    // `webpack --colors` equivalent
    colors: true,
    // Display the distance from the entry point for each module
    depth: false,
    // Display the entry points with the corresponding bundles
    entrypoints: false,
    // Add errors
    errors: true,
    // Add details to errors (like resolving log)
    errorDetails: true,
    // Add the hash of the compilation
    hash: true,
    // Set the maximum number of modules to be shown
    // maxModules: 15,
    // Add built modules information
    modules: true,
    // Sort the modules by a field
    // modulesSort: "field",
    // Show dependencies and origin of warnings/errors (since webpack 2.5.0)
    moduleTrace: true,
    // Show performance hint when file size exceeds `performance.maxAssetSize`
    performance: true,
    // Show the exports of the modules
    providedExports: false,
    // Add public path information
    publicPath: true,
    // Add information about the reasons why modules are included
    reasons: true,
    // Add the source code of modules
    source: true,
    // Add timing information
    timings: true,
    // Show which exports of a module are used
    usedExports: false,
    // Add webpack version information
    version: true,
    // Add warnings
    warnings: true,
  };

  const st = stats.toJson(statReq);
  // const chunksWithErrors = st.children.
  // st.children.filter(c => c.errors.length > 0).forEach(compil => compil.assets.forEach(ass => all.set(compil.publicPath, ass.name, compil)));
  // console.log(Array.from(all.keys()).join(' '));

  fmt(st);

  // if (isInteractive) {
  //   clearConsole();
  // }
};

const fmt = st => {
  // const messages = [].concat.apply([], (st.children.map((st) => formatWebpackMessages(st))));
  // const formattedMess = st.children.map((st) => formatWebpackMessages(st));

  // const {errors, warnings} = formattedMess.reduce((acc, msg) => ({
  //   errors: acc.errors.concat(msg.errors),
  //   warnings: acc.warnings.concat(msg.warnings),
  // }), {errors: [], warnings: []});

  const { errors, warnings } = formatWebpackMessages(st);

  const isSuccessful = !errors.length && !warnings.length;
  if (isSuccessful) {
    console.log(chalk.green('Compiled successfully!'));
  }
  // if (isSuccessful && (isInteractive || isFirstCompile)) {
  //   printInstructions(useYarn);
  // }

  // If errors exist, only show errors.
  if (errors.length) {
    console.log(chalk.red('Failed to compile.\n'));
    console.log(errors.join('\n\n'));
    return;
  }

  // Show warnings if no errors were found.
  if (warnings.length) {
    console.log(chalk.yellow('Compiled with warnings.\n'));
    console.log(warnings.join('\n\n'));

    // Teach some ESLint tricks.
    console.log(
      '\nSearch for the ' +
        chalk.underline(chalk.yellow('keywords')) +
        ' to learn more about each warning.'
    );
    console.log(
      'To ignore, add ' +
        chalk.cyan('// eslint-disable-next-line') +
        ' to the line before.\n'
    );
  }
};

module.exports = {
  printInstructions,
  printCompilationStats,
};
