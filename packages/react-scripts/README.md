# react-scripts-webextension

This package includes scripts and configuration used by [Create React WebExtension](https://github.com/constfun/create-react-WebExtension).<br>
Please refer to its documentation:

* [Getting Started](https://github.com/facebookincubator/create-react-app/blob/master/README.md#getting-started) – How to create a new extension.
* [User Guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md) – How to develop extensions bootstrapped with Create React WebExtension.

This project is a fork of the excellent *react-scripts*, referred to as *upstream* in the rest of this document.

This fork can be thought of as a superset of react-scripts, with features added to support seamless WebExtension development across different browser platforms. Features that did not make sense in a WebExtension context were removed from the project.

## Differences to react-scripts (upstream)

### TypeScript

As the basis for this project I've forked `create-react-typescript#2.5.0` and pulled in the latest release version of `create-react-app#1.0.10`. _(July 2017)_

### Multiple create-react-app "packs"

WebExtensions are comprised of background scripts, content scripts, option pages, and popup pages. Each of these is a separate set of HTML, CSS, and JavaScript.

However, `create-react-app` produces a single set of `index.html`, `main.js`, and `main.css` as its build output. This is a simple and sensible default considering the goals of the upstream project.

As noted above, the need for multiple sets of HTML, CSS, and JS files is unavoidable even for the simplest of extensions. Create React WebExtensions addresses this need by introducing a simple concept of packs on top of `create-react-app`.

**Any subdirectory containing an empty file named `.pack` will produce its own set of HTML, CSS, and JavaScript, using the same rules as any stand alone Create React app. This feature is strictly opt-in.**

Mostly, this is a difference that you don't have to worry about. This addition does not change the workflow at all. Simply create a new project and use the same workflow as with any Create React app, the directory structure should make sense.

*The rest of this document is taken almost entirely verbatim from Create React App.*
*All the same rules apply.*