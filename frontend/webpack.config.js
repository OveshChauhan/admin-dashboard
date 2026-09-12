// Configures Webpack 5 development and production builds for the React 18 frontend.
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = function (env, argv) {
  const isProduction = argv.mode === "production";

  return {
    entry: "./src/main.jsx",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isProduction ? "assets/[name].[contenthash].js" : "assets/bundle.js",
      publicPath: "/",
      clean: true
    },
    resolve: {
      extensions: [".js", ".jsx"]
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                ["@babel/preset-env", { targets: "defaults" }],
                ["@babel/preset-react", { runtime: "automatic" }]
              ]
            }
          }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./public/index.html"
      })
    ],
    devServer: {
      port: 5173,
      historyApiFallback: true,
      hot: true,
      static: {
        directory: path.join(__dirname, "public")
      }
    },
    devtool: isProduction ? "source-map" : "eval-source-map"
  };
};
