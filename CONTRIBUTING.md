# Contributing to Create React WebExtension (CRX)

Thank you for looking at this document and for considering contributing to Create React WebExtension (CRX from hereon, for brevity)!

Please take a moment to review the information here to make the contribution process easy and effective.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue or assessing patches and features.

## Core Ideas

CRX is forked from the excellent [Create React App (CRA)](https://github.com/facebook/create-react-app) and follows the same philosophy. As much as possible, we try to avoid adding configuration and flags. The purpose of this tool is to provide the best experience for people getting started with WebExtensions, and this will always be our first priority. This means that sometimes we sacrifice additional functionality in the name of robustness and simplicity.

We prefer **convention, heuristics, or interactivity** over configuration.

## Directory Structure

The upstream project (Create React App) is a monorepo, which contains several sub-packages in the `packages/` directory. In our fork, we only modify the `react-scripts` package and hence, when you look in our `packages/` directory, you will only see `react-scripts` there. The rest of the sub-packages of CRA are unmodified and are used as is (installed from npm.)

#### [react-scripts-webextension]

This package is the heart of the project, which contains the scripts for setting up the development server, building production builds, configuring all software used, etc.<br>
All functionality must be retained (and configuration given to the user) if they choose to eject.

## Setting Up a Local Copy

1. Clone the repo with `git clone https://github.com/constfun/create-react-WebExtension`

2. Run `yarn` in the root `create-react-WebExtension` folder.

Once it is done, you can modify any file locally and run `yarn start`, `yarn test` or `yarn build` just like in a generated project.

If you want to try out the end-to-end flow with the global CLI, you can do this too:

```
# Run the following command, if you want to use the local dev version of react-scripts-webextension
# cd packages/react-scripts && yarn link && cd -

yarn create-react-app --scripts-version react-scripts-webextension my-extension
cd my-extension

# Run the following command, if you want to use the local dev version of react-scripts-webextension
# yarn link react-scripts-webextension
```

and then run `yarn start` or `yarn build`.

## Cutting a Release

1. Tag all merged pull requests that go into the release with the relevant milestone. Each merged PR should also be labeled with one of the [labels](https://github.com/facebook/create-react-app/labels) named `tag: ...` to indicate what kind of change it is.
2. Close the milestone.
3. In most releases, only `react-scripts` needs to be released. If you don’t have any changes to the `packages/create-react-app` folder, you don’t need to bump its version or publish it (the publish script will publish only changed packages).
4. Note that files in `packages/create-react-app` should be modified with extreme caution. Since it’s a global CLI, any version of `create-react-app` (global CLI) including very old ones should work with the latest version of `react-scripts`.
5. Create a change log entry for the release:
  * You'll need an [access token for the GitHub API](https://help.github.com/articles/creating-an-access-token-for-command-line-use/). Save it to this environment variable: `export GITHUB_AUTH="..."`
  * Run `yarn changelog`. The command will find all the labeled pull requests merged since the last release and group them by the label and affected packages, and create a change log entry with all the changes and links to PRs and their authors. Copy and paste it to `CHANGELOG.md`.
  * Add a four-space indented paragraph after each non-trivial list item, explaining what changed and why. For each breaking change also write who it affects and instructions for migrating existing code.
  * Maybe add some newlines here and there. Preview the result on GitHub to get a feel for it. Changelog generator output is a bit too terse for my taste, so try to make it visually pleasing and well grouped.
6. Make sure to include “Migrating from ...” instructions for the previous release. Often you can copy and paste them.
7. Run `npm run publish`. (It has to be `npm run publish` exactly, not just `npm publish` or `yarn publish`.)
8. Wait for a long time, and it will get published. Don’t worry that it’s stuck. In the end the publish script will prompt for versions before publishing the packages.
9. After publishing, create a GitHub Release with the same text as the changelog entry. See previous Releases for inspiration.

Make sure to test the released version! If you want to be extra careful, you can publish a prerelease by running `npm run publish -- --tag next` instead of `npm run publish`.