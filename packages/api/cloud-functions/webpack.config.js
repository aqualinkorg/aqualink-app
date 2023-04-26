const path = require('path');
const webpack = require('webpack');

const lazyImports = [
  '@nestjs/microservices',
  '@nestjs/microservices/microservices-module',
  '@nestjs/websockets/socket-module',
  '@nestjs/platform-express',
];

module.exports = {
  target: 'node',
  mode: 'production',
  entry: {
    main: './cloud-functions/index.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['ts-loader', path.join(__dirname, './add-entities.js')],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
  },
  devtool: 'inline-source-map',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
    libraryTarget: 'commonjs',
  },
  externals: {
    'firebase-admin': 'firebase-admin',
    'firebase-functions': 'firebase-functions',
    'cache-manager': 'cache-manager',
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new webpack.IgnorePlugin({
      checkResource(resource) {
        if (lazyImports.includes(resource)) {
          try {
            require.resolve(resource);
          } catch (err) {
            return true;
          }
        }
        return false;
      },
    }),
  ],
};
