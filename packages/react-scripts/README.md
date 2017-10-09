# react-scripts-webextension

This package includes scripts and configuration used by [Create React WebExtension](https://github.com/constfun/create-react-WebExtension).<br>
Please refer to its documentation:

* [Getting Started](https://github.com/constfun/create-react-WebExtension/blob/master/README.md#getting-started) – How to create a new extension.
* [User Guide](https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md) – How to develop extensions bootstrapped with Create React WebExtension.

## Differences to react-scripts (upstream)

### TypeScript support

### Multiple create-react-app "bundles"

WebExtensions are comprised of background scripts, content scripts, option pages, and popup pages. Each of these is a separate set of HTML, CSS, and JavaScript.

However, `create-react-app` produces a single set of `index.html`, `main.js`, and `main.css` as its build output. This is a simple and sensible default considering the goals of the upstream project.

As noted above, the need for multiple sets of HTML, CSS, and JS files is unavoidable even for the simplest of extensions. Create React WebExtensions addresses this need by introducing a simple concept of packs on top of `create-react-app`.

**Any subdirectory containing an empty file named `_bundle` will produce its own set of HTML, CSS, and JavaScript files.**

This feature is opt in. Simply create a new project and use the same workflow as with any Create React app, the directory structure should make sense.