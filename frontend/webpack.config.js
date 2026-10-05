// Configures Webpack 5 development and production builds for the React 18 frontend.
const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const frontendEnvPath = path.resolve(__dirname, ".env");
if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(frontendEnvPath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

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
      }),
      new webpack.DefinePlugin({
        "process.env.API_BASE_URL": JSON.stringify(
          process.env.API_BASE_URL || "http://localhost:5001/api"
        )
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
