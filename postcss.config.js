module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production'
      ? {
          'cssnano': {
            preset: ['default', {
              discardComments: {
                removeAll: true,
              },
              normalizeWhitespace: false,
            }]
          },
          '@fullhuman/postcss-purgecss': {
            content: [
              './src/**/*.{js,jsx,ts,tsx}',
              './src/**/*.{css,scss}',
            ],
            defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
            safelist: ['html', 'body']
          }
        }
      : {})
  }
}
