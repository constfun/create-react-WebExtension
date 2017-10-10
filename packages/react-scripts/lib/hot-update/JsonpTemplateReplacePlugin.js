'use strict';

const url = require('url');
const Template = require('webpack/lib/Template');

// Make Webpack's hot reloading work for WebExtensions.
// The two main issues with the original runtime from Webpack:
//   - Hot reload server url cannot be inferred from location inside the extension sandbox.
//   - Scripts cannot be injected using a script tag, again because we're in a sandbox.

module.exports = class JsonpTemplateReplacePlugin {
  constructor(options) {
    this.options = options;
    this.hotUpdateUrl = options.hotUpdateUrl;
  }

  apply(compiler) {
    const { hotUpdateUrl } = this.options;
    compiler.plugin('compilation', compilation => {
      compilation.mainTemplate.plugin('hot-bootstrap', function(
        source,
        chunk,
        hash
      ) {
        // Forgive me reader for I have sinned here, twice.

        // This plugin only works to patch JsonpMainTemplate.runtime for WebExtensions.
        // HtmlWebpackPlugin is an example of a plugin that complicates things,
        // since it uses the NodeMainTemplate in a child compiler.
        // The node template will handle hot updates differently.
        // Unfortunately it doesn't seem trivial to figure out _which_ runtime we are bootstrapping here.
        //
        // Our options are poor:
        //   - Detect the HotWebpackPlugin's compiler. This is possible because the compiler name is set.
        //     This may sound pretty good, but will only handle the HtmlWebpackPlugin,
        //     other plugins may still use the node template and will fail if we replace the runtime from under them.
        //   - Do not patch if there is any compiler name set at all, which means it is _probably_ a child compiler.
        //     Again, this may sound ok, but what about plugins that output js that _does_ need the runtime patched.
        //   - Really what we want is to detect if the 'source' is the jsonp runtime that we are interested in.
        //     We use the following heuristic to do this:
        //     If the runtime is trying to create a script element anywhere in its source,
        //     we know it will fail in a WebExtension and replace it.
        if (!source.match(/document\.createElement\( {0,1}['"]script['"]/)) {
          return source;
        }

        // At this point it is reasonably safe to replace the runtime...
        // We do this with some copy pasted code (eh) from JsonpMainTemplatePlugin since we need to
        // do all the same things as that plugin, except inject a different runtime.
        const hotUpdateChunkFilename = this.outputOptions
          .hotUpdateChunkFilename;
        const hotUpdateMainFilename = this.outputOptions.hotUpdateMainFilename;
        const hotUpdateFunction = this.outputOptions.hotUpdateFunction;
        const currentHotUpdateChunkFilename = this.applyPluginsWaterfall(
          'asset-path',
          JSON.stringify(hotUpdateChunkFilename),
          {
            hash: `" + ${this.renderCurrentHashCode(hash)} + "`,
            hashWithLength: length =>
              `" + ${this.renderCurrentHashCode(hash, length)} + "`,
            chunk: {
              id: '" + chunkId + "',
            },
          }
        );
        const currentHotUpdateMainFilename = this.applyPluginsWaterfall(
          'asset-path',
          JSON.stringify(hotUpdateMainFilename),
          {
            hash: `" + ${this.renderCurrentHashCode(hash)} + "`,
            hashWithLength: length =>
              `" + ${this.renderCurrentHashCode(hash, length)} + "`,
          }
        );
        const { protocol, host } = url.parse(hotUpdateUrl);
        const hotUpdateRootUrl = `${protocol}//${host}/`;
        const currentHotUpdateManifestUrl =
          '"' + hotUpdateRootUrl + currentHotUpdateMainFilename.substr(1);
        const runtimeSource = Template.getFunctionContent(
          require('./JsonpMainTemplate.runtime.js')
        )
          .replace(/\/\/\$semicolon/g, ';')
          .replace(/\$hotUpdateManifestUrl\$/g, currentHotUpdateManifestUrl)
          .replace(/\$hotChunkFilename\$/g, currentHotUpdateChunkFilename)
          .replace(/\$hash\$/g, JSON.stringify(hash));
        return `
function hotDisposeChunk(chunkId) {
    delete installedChunks[chunkId];
}
var parentHotUpdateCallback = this[${JSON.stringify(hotUpdateFunction)}];
this[${JSON.stringify(hotUpdateFunction)}] = ${runtimeSource}`;
      });
    });
  }
};
