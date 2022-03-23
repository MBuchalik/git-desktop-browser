module.exports = {
  root: true,
  reportUnusedDisableDirectives: true,
  overrides: [
    {
      files: ['*.js', '*.md', '*.json'],
      plugins: ['prettier'],
      extends: ['plugin:prettier/recommended'],
      rules: {
        'prettier/prettier': 'warn',
      },
    },
  ],
};
