module.exports = {
  root: true,
  reportUnusedDisableDirectives: true,
  parserOptions: {
    ecmaVersion: 2021,
  },
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
