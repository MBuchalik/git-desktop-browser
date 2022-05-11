module.exports = (config, options) => {
  config.target = 'electron-renderer';

  // TODO: Not sure if the file replacements (i.e. 'environment.ts' --> 'environment.prod.ts') still work.

  return config;
};
