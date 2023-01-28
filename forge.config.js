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

const logoNameWithoutSuffix =
  buildMode === BUILD_MODE_DEVELOPMENT ? 'logo-dev' : 'logo';

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
    ignore: [
      // If we don't specify this, we get a huge executable that includes all of our project files. electron-builder by default only prunes the root node_modules folder, but copies everything else as-is.
      new RegExp(/^\/(?!(package\.json)|(node_modules)|(main-process))/),
      // Only keep the `build` directory in the `main-process` directory. (This could also have been done with the first Regex, but separating this makes everything a bit easier to understand.)
      new RegExp(/^\/main-process\/(?!(build))/),
    ],
    icon: `assets/application-icons/${logoNameWithoutSuffix}`,
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

        icon: `assets/application-icons/${logoNameWithoutSuffix}.ico`,
        setupIcon: `assets/application-icons/${logoNameWithoutSuffix}.ico`,
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
