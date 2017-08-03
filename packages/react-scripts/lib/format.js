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

const printCompilationStats = ({
  stats,
  isFirstCompile,
  useYarn,
  isInteractive,
}) => {
  if (isInteractive) {
    clearConsole();
  }

  const messages = formatWebpackMessages(stats.toJson({}, true));
  const isSuccessful = !messages.errors.length && !messages.warnings.length;
  if (isSuccessful) {
    console.log(chalk.green('Compiled successfully!'));
  }
  if (isSuccessful && (isInteractive || isFirstCompile)) {
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
  printInstructions,
  printCompilationStats,
};
