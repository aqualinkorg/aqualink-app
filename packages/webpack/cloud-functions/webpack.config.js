const path = require("path");

module.exports = {
  target: "node",
  mode: "production",
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"],
    modules: ["node_modules", "../../api/node_modules"],
  },
  devtool: "inline-source-map",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "../../webpack/cloud-functions/dist"),
    libraryTarget: "commonjs",
  },
  externals: {
    "firebase-admin": "firebase-admin",
    "firebase-functions": "firebase-functions",
  },
};
