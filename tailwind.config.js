module.exports = {
  purge: ['./src/**/*.js'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      xl: '1280px',
    },
    extend: {
      backgroundOpacity: {
        90: '0.90',
      },
      minHeight: {
        'screen-25': '25vh',
      },
    },
  },
  variants: {},
  plugins: [],
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
}
