const {join, normalize} = require('path');

const basePluginShortPath = 'TEMPLATED_pluginsFile';
const integrationFileShortPaths = TEMPLATED_integrationFileShortPaths;

const runfiles = require(process.env['BAZEL_NODE_RUNFILES_HELPER']);
const basePlugin = require(runfiles.resolveWorkspaceRelative(basePluginShortPath));
const cwd = process.cwd();

const browserifyFactory = require(normalize(`TEMPLATED_@cypress/browserify-preprocessor`));
const browserify = browserifyFactory(browserifyFactory.defaultOptions);

module.exports = (on, config) => {
  // Set env variables needed usually set by for `bazel test` invocations
  // (they are not set automatically for `bazel run`).
  process.env.RUNFILES_DIR = process.env.RUNFILES_DIR || join(cwd, '../');
  process.env.RUNFILES_MANIFEST_FILE =
      process.env.RUNFILES_MANIFEST_FILE || join(cwd, '../', 'MANIFEST');

  // Set test files to tests passed as `srcs`
  config.integrationFolder = cwd;
  config.testFiles = integrationFileShortPaths;

  // Set screenshots/videos folder to a writable directory
  config.screenshotsFolder = process.env['TEST_UNDECLARED_OUTPUTS_DIR'] || process.env.RUNFILES_DIR;
  config.videosFolder = process.env['TEST_UNDECLARED_OUTPUTS_DIR'] || process.env.RUNFILES_DIR;

  // Set file preprocessing output path to writable directory.
  on('file:preprocessor', (file) => {
    file.outputPath =
        join(process.env['TEST_TMPDIR'], file.outputPath.split('/bundles/').slice(1).join());
    return browserify(file);
  });

  // Load in the user's cypress plugin
  return basePlugin(on, config);
};
