# Create React WebExtension [![Build Status](https://travis-ci.org/constfun/create-react-WebExtension.svg?branch=master)](https://travis-ci.org/constfun/create-react-WebExtension)

Develop WebExtensions with no build configuration.<br>

WebExtension API is the widely adopted system for extending and modifying the capability of a browser.<br>

* [Quick Start](#quick-start) – How to create a new extension.
* [User Guide](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md) – How to develop extensions bootstrapped with Create React WebExtension.
* [WebExtensions on MDN](https://developer.mozilla.org/en-US/Add-ons/WebExtensions) - API reference and tutorials for developing extensions.
* [Examples](https://github.com/mdn/webextensions-examples) - Example extensions from MDN.

**This project is a fork of the excellent [Create React App (CRA)](https://github.com/facebookincubator/create-react-app) project.**

The latest version of Create React WebExtension (CRWX) is in sync with [create-react-app#v1.0.10](https://github.com/facebookincubator/create-react-app/tree/v1.0.10).<br>

## Highlights

- Get started immediately, no need to install or configure tools like Webpack or Babel.<br>
They are preconfigured and hidden so that you can focus on the code.
- Live reload of JavaScript and CSS as you work on your extension. Works seamlessly in Chrome, Firefox, and Opera, even on pages protected by HTTPS and Content Security Policy.
- You can use TypeScript, Ocaml, ReasonML, or JavaScript and import modules between them.
- At any time, you can "eject" Create React WebExtension from your project to relinquish full control over the webpack configuration.

## Limitations

- Although based on a mature project, this is a new project that introduces significant changes. You'd be an early adopter.
- The User Guide is 90% relevant, but hasn't been updated yet. This project is mostly a super set of CRA features.
- No Windows support.
- The example extension works in all major browsers. However, CRWX does not automatically make your extension code cross platform. To target multiple browsers you have to take care to use [polyfills](https://github.com/mozilla/webextension-polyfill) and to not use incompatible properties in the `manifest.json` file. 
- CRWX will create a production build, ready for packaging. However, the packaging process itself varries significantly between browsers and is considered out of scope for this project.

If something doesn’t work please be kind and [report an issue](https://github.com/constfun/create-react-WebExtension/issues/new).

## Quick Start

### Installation

Install [yarn](https://yarnpkg.com/lang/en/docs/install/) or [npm](https://www.npmjs.com/get-npm).

Install [facebookincubator/create-react-app](https://github.com/facebookincubator/create-react-app) once globally:

```sh
yarn global add create-react-app
```

### Create a New Extension

To start working on a new extension, run:

```sh
create-react-app my-extension --scripts-version react-scripts-webextension
cd my-extension
yarn start
```

Follow the instructions on the screen to install the extension in your browser:

![yarn start](images/compiled.png)

Once installed in your browser, the example extension navigates to the [latest version of the User Guide](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md) and injects itself as a [content script](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Content_scripts) on that page.

## Directory Structure

The directory structure of a newly generated project looks like this:
```
.
├── README.md
├── package.json
├── public
│   ├── icon-128.png
│   ├── icon-16.png
│   └── manifest.json
└── src
    └── guide
        ├── background-script
        │   ├── _bundle
        │   └── index.js
        └── content-script
            ├── _bundle
            ├── index.js
            ├── Search.js
            ├── PoweredBy.js
            └── styles.css
```

## List of Commands

Create React WebExtension supports four commands:

* `start` - Build and watch the extension in development mode.
* `test` - Run the test watcher in an interactive mode.
* `build` - Create a production build.
* `eject` - Remove Create React WebExtension from your project and relinquish control.

Each command is described in more detail bellow.

### `yarn start` (or `npm run start`)

Running `yarn start` populates the `build/` directory with the development build of the example extension.<br>

Changing any JavaScript in the `src/` directory or any file in the `public/` directory will intelligently reload the extension and all affected tabs.

Changing any CSS in the `src/` directory will live update the extension on the screen, without reloading.

You will see any build errors and lint warnings in the console.

![Build errors](images/syntax-error.png)

### `yarn test` (or `npm run test`)

By default, runs tests related to files changed since the last commit.

[Read more about testing.](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#running-tests)

### `yarn build` (or `npm run build`) 

When you’re ready to package your extension for distribution, create minified code with `yarn build`.

Since the procedure for packaging extensions varries significantly between browsers and distribution channels, you will have to do this step manually or using additional tools.

### `yarn eject` (or `npm run eject`)

**If you’re a power user** and you aren’t happy with the default configuration, you can “eject” from the tool and use it as a boilerplate generator.

Running `yarn eject` copies all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. Commands like `yarn start` and `yarn build` will still work, but they will point to the copied scripts so you can tweak them. At this point, you’re on your own.

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

## Starting an Extension from Scratch

If you find the example code confusion or not helpful you can easily start with an empty code base:

1. Delete everything from the `src` and `public` directories. 
2. Run `yarn start` and follow the error messages.

Refer to the User Guide for solutions to common tasks.


<br>
<br>
<br>
<br>
<br>
<br>

## User Guide

The [User Guide](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md) includes information on different topics, such as:

- [Updating to New Releases](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#updating-to-new-releases)
- [Folder Structure](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#folder-structure)
- [Available Scripts](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#available-scripts)
- [Supported Language Features and Polyfills](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#supported-language-features-and-polyfills)
- [Syntax Highlighting in the Editor](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#syntax-highlighting-in-the-editor)
- [Displaying Lint Output in the Editor](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#displaying-lint-output-in-the-editor)
- [Formatting Code Automatically](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#formatting-code-automatically)
- [Debugging in the Editor](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#debugging-in-the-editor)
- [Changing the Page `<title>`](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#changing-the-page-title)
- [Installing a Dependency](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#installing-a-dependency)
- [Importing a Component](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#importing-a-component)
- [Code Splitting](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#code-splitting)
- [Adding a Stylesheet](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#adding-a-stylesheet)
- [Post-Processing CSS](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#post-processing-css)
- [Adding a CSS Preprocessor (Sass, Less etc.)](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#adding-a-css-preprocessor-sass-less-etc)
- [Adding Images, Fonts, and Files](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#adding-images-fonts-and-files)
- [Using the `public` Folder](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#using-the-public-folder)
- [Using Global Variables](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#using-global-variables)
- [Adding Bootstrap](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#adding-bootstrap)
- [Adding Flow](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#adding-flow)
- [Adding Custom Environment Variables](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#adding-custom-environment-variables)
- [Can I Use Decorators?](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#can-i-use-decorators)
- [Integrating with an API Backend](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#integrating-with-an-api-backend)
- [Proxying API Requests in Development](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#proxying-api-requests-in-development)
- [Using HTTPS in Development](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#using-https-in-development)
- [Generating Dynamic `<meta>` Tags on the Server](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#generating-dynamic-meta-tags-on-the-server)
- [Pre-Rendering into Static HTML Files](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#pre-rendering-into-static-html-files)
- [Running Tests](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#running-tests)
- [Developing Components in Isolation](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#developing-components-in-isolation)
- [Making a Progressive Web App](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#making-a-progressive-web-app)
- [Analyzing the Bundle Size](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#analyzing-the-bundle-size)
- [Deployment](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#deployment)
- [Advanced Configuration](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#advanced-configuration)
- [Troubleshooting](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#troubleshooting)

A copy of the user guide will be created as `README.md` in your project folder.

## How to Update to New Versions?

Please refer to the [User Guide](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md#updating-to-new-releases) for this and other information.

## Alternatives

* [mi-g/weh](https://github.com/mi-g/weh)
* [mozilla/web-ext](https://github.com/mozilla/web-ext)
* [flybayer/create-react-webextension](https://github.com/flybayer/create-react-webextension)

Happy hacking! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:camel:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:cactus:
