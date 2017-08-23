'use strict';

const chalk = require('chalk');
const clearConsole = require('react-dev-utils/clearConsole');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');

const printInstructions = useYarn => {
  console.log();
  console.log(
    chalk.green(
      `You can now install the ${chalk.bold(
        'build/dev'
      )} directory as a temporary extension.`
    )
  );
  console.log();
  console.log('For Firefox:');
  console.log('    * Visit about:debugging');
  console.log('    * Check Enable add-on debugging');
  console.log('    * Click Load Temporary Add-on');
  console.log('    * Select the build/manifest.json file');
  console.log();
  console.log('For Chrome and Opera:');
  console.log('    * Visit chrome://extensions or opera://extensions');
  console.log('    * Enable Developer Mode');
  console.log('    * Click Load unpacked extension');
  console.log('    * Select the build/ directory');
  console.log();
  console.log('For Edge:');
  console.log('    https://docs.microsoft.com/en-us/microsoft-edge/extensions/guides/adding-and-removing-extensions');
  console.log();
  console.log('Note that the development build is not optimized.');
  console.log(
    `To create a production build, use ` +
      `${chalk.cyan(`${useYarn ? 'yarn' : 'npm run'} build`)}.`
  );
  console.log();
};

const withInstructions = (compiler, useYarn) => {
  let isFirstCompilation = true;
  compiler.plugin('done', stats => {
    console.log('first', isFirstCompilation);
    const isSuccessful = !stats.hasErrors() && !stats.hasWarnings();
    if (isSuccessful && isFirstCompilation) {
      console.log(chalk.green('Compiled successfully!'));
      printInstructions(useYarn);
    }
    isFirstCompilation = false;
  });
  return compiler;
};


const printCompilationStats = ({
  stats,
  isFirstCompilation,
  useYarn,
}) => {
  const isInteractive = process.stdout.isTTY;
  if (isInteractive) {
    clearConsole();
  }

  const messages = formatWebpackMessages(stats.toJson({}, true));
  const isSuccessful = !messages.errors.length && !messages.warnings.length;
  if (isSuccessful) {
    console.log(chalk.green('Compiled successfully!'));
  }
  if (isSuccessful && (isInteractive || isFirstCompilation)) {
    printInstructions(useYarn);
  }

  // If errors exist, only show errors.
  if (messages.errors.length) {
    console.log(chalk.red('Failed to compile.\n'));
    console.log(messages.errors.join('\n\n'));
    return;
  }

  // Show warnings if no errors were found.
  if (messages.warnings.length) {
    console.log(chalk.yellow('Compiled with warnings.\n'));
    console.log(messages.warnings.join('\n\n'));

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
  withInstructions,
  printInstructions,
  printCompilationStats,
};
