const electronForgeCore = require('@electron-forge/core');

const BUILD_MODE_FLAG = '--buildMode=';

const buildModeArg = process.argv.find((item) =>
  item.startsWith(BUILD_MODE_FLAG),
);
if (!buildModeArg) {
  throw Error('You need to provide the "--buildMode" flag.');
}

const buildMode = buildModeArg.replace(BUILD_MODE_FLAG, '');

const BUILD_MODE_PRODUCTION = 'prod';
const BUILD_MODE_DEVELOPMENT = 'dev';
const knownBuildModes = [BUILD_MODE_PRODUCTION, BUILD_MODE_DEVELOPMENT];
if (!knownBuildModes.includes(buildMode)) {
  throw Error('Unknown value for the Build Mode flag.');
}

module.exports = {
  buildIdentifier: buildMode,
  packagerConfig: {
    name:
      buildMode === BUILD_MODE_PRODUCTION
        ? 'Git Desktop Browser'
        : 'Git Desktop Browser (Dev)',
    appBundleId: electronForgeCore.utils.fromBuildIdentifier({
      [BUILD_MODE_PRODUCTION]: 'git-desktop-browser',
      [BUILD_MODE_DEVELOPMENT]: 'git-desktop-browser-dev',
    }),
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name:
          buildMode === BUILD_MODE_PRODUCTION
            ? 'git-desktop-browser'
            : 'git-desktop-browser-dev',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};
