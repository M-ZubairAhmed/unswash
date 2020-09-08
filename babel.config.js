module.exports = function (api) {
  if (api) {
    //   https://babeljs.io/docs/en/config-files#apicache
    api.cache.using(() => process.env.NODE_ENV)
  }

  const presets = [
    '@babel/preset-env',
    {
      useBuiltIns: 'entry',
      corejs: 3,
    },
    '@babel/preset-react',
  ]

  const plugins = [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-throw-expressions',
    '@babel/plugin-syntax-dynamic-import',
  ]

  return {
    presets,
    plugins,
  }
}
