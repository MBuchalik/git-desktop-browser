module.exports = {
  root: true,
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  // Ignore all folders except for '/src'.
  ignorePatterns: ['/*', '!/src'],
  overrides: [
    {
      files: ['*.js'],
      plugins: ['prettier'],
      extends: ['plugin:prettier/recommended'],
      rules: {
        'prettier/prettier': 'warn',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: ['eslint-config-mbuchalik/react'],
    },
  ],
};
