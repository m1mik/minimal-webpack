const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const filesThreshold = 8196;
const webpack = require('webpack');

module.exports = {
  entry: { index: path.resolve(__dirname, 'src', 'index.js') },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'], // using import without file-extensions
    plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })], // plugin makes mapping from tsconfig.json to weback:alias
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          'babel-loader', // transpile *.js, *.jsx, *.ts, *.tsx to result according to .browserlistrc and babel.config.js files
          {
            loader: 'ts-loader', // transpile *.ts to *.js, despite babel-loader deals with typeScript without restrictions but doesn't have .browserlist support
            options: {
              transpileOnly: true, // we don't type checking during the compilation - it's task for CodeEditor
            },
          },
          // optional: "ifdef-loader" // prodives conditinal compilation: https://github.com/nippur72/ifdef-loader
          // optional: "eslint-loader" //provides lint-errors into wepback output
        ],
      },
      {
        test: /\.(png|jpe?g|gif|webp)(\?.*)?$/, // optional: optimizing images via pngo etc.
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'url-loader', // it converts images that have size less 'limit' option into inline base64-css-format
            options: {
              name: 'images/[name].[ext]',
              limit: filesThreshold, // if file-size more then limit, file-loader copies one into outputPath
              // by default it uses fallback: 'file-loader'
              // optional: fallback: 'responsive-loader' //it converts image to multiple images using srcset (IE isn't supported): https://caniuse.com/#search=srcset
            },
          },
        ],
      },
      // rule for svg-images
      {
        test: /\.(svg)(\?.*)?$/, // for reducing file-size: OptimizeCSSAssetsPlugin > cssnano > SVGO, that congigured in webpack.prod.js
        exclude: /(node_modules)|(fonts\\.+\.svg)(\?.*)?/,
        use: [
          {
            loader: 'svg-url-loader', // despite url-loader that converts images into base64 format it converts images to native svg-css format
            options: {
              limit: filesThreshold,
              iesafe: filesThreshold >= 4000, // https://github.com/bhovhannes/svg-url-loader#iesafe
              name: 'images/[name].[ext]', // if file-size more then limit, [file-loader] copies ones into outputPath
            },
          },
        ],
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: filesThreshold,
              name: 'fonts/[name].[ext]', // if file-size more then limit, [file-loader] copies ones into outputPath
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
        ],
      },
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, 'build'),
    compress: true,
    hot: true,
    port: 3000,
    historyApiFallback: true,
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/index.html',
    }),
    new webpack.DefinePlugin({
      // it adds custom Global definition to the project like BASE_URL for index.html
      'process.env': {
        BASE_URL: '"/"',
      },
    }),
    new CaseSensitivePathsPlugin(), // it fixes bugs between OS in caseSensitivePaths (since Windows isn't CaseSensitive but Linux is)
    new FriendlyErrorsWebpackPlugin(),
  ],
};
