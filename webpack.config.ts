import * as path from "path";
import * as webpack from "webpack";
import * as sass from "sass";

import MiniCssExtractPlugin from "mini-css-extract-plugin";
import TerserPlugin from "terser-webpack-plugin";

const isProduction = process.env.NODE_ENV === "prod";

const config: webpack.Configuration = {
    // documentation: https://webpack.js.org/configuration/dev-server/
    devServer: {
        historyApiFallback: true,
        noInfo: true,
        hot: true,
    },

    devtool: isProduction? "source-map" : "eval-source-map",

    resolve: {
        extensions: [".ts", ".js", ".sass", ".css"],
    },

    entry: "./src/app.ts",

    mode: isProduction ? "production": "development",

    // ugly as hell.
    optimization: {
        minimizer: [
            new TerserPlugin({
                include: /\.(js|jsx|tsx|ts)$/,
                sourceMap: true,
                terserOptions: {
                    output: {
                        comments: /^\**!|@preserve|@license|@cc_on/i,
                    },
                },
            }),
        ],
        splitChunks: {
            cacheGroups: {
                styles: {
                    name: "styles",
                    test: /\.css$/,
                    chunks: "all",
                    enforce: true,
                },
            },
        },
    },

    output: {
        path: path.resolve(__dirname, "./dist"),
        publicPath: "/dist/",
        filename: isProduction ? "[name].[hash].js" : "[name].js",
    },
    performance: {
        hints: "warning",
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: isProduction ? "[name].[hash].css" : "[name].css",
        }),
    ],

    module: {
        rules: [
            {
                test: /\.(js|jsx|tsx|ts)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            sourceMap: !isProduction,
                            presets: [
                                [
                                    "@babel/preset-env",
                                    {
                                        targets: {
                                            browsers: ["> 0.25%", "not dead", "IE >= 8",],
                                        },
                                        corejs: 3,
                                        useBuiltIns: "usage",
                                    },
                                ],
                                "@babel/preset-typescript",
                            ],
                            plugins: [
                                [
                                    "@babel/plugin-proposal-decorators",
                                    {legacy: true},
                                ],
                                [
                                    "@babel/proposal-class-properties",
                                    {loose: true},
                                ],
                            ],
                        },
                    },
                ],
            },

            // https://github.com/webpack-contrib/mini-css-extract-plugin#advanced-configuration-example
            {
                test: /\.scss$/,
                loader: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: "./dist/bundle.css",
                            hmr: !isProduction,
                        },
                    },
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: !isProduction,
                        },
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: !isProduction,
                            implementation: sass,
                        },
                    },
                ],
            },
        ],
    },
};

export default config;
if (isProduction) {
    module.exports.devtool = "source-map";
    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.LoaderOptionsPlugin({
            minimize: true,
        })
    ]);
}
