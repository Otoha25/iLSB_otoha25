const path = require("node:path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "production",

    entry: {
        "repository": "./src/repository/index.ts",
        "tree": "./src/tree/index.ts",
        "background": "./src/background/index.ts",
    },

    module: {
        rules: [
            {
                test: /\.(ts)$/,
                use: "ts-loader",
            },
            {
                test: /\.(html)$/,
                use: "html-loader",
            },
            {
                test: /\.(css)$/,
                use: [
                    "style-loader",
                    "css-loader",
                ],
            },
        ]
    },

    resolve: {
        extensions: [".ts", ".js"],
        //alias を追加するときは，tsconfig.json の conpilerOptions.paths にも書くこと
        alias: {
            "@lib": path.resolve(__dirname, "src/lib"),
        }
    },

    plugins: [
        new HtmlWebpackPlugin({
            chunks: ["repository"],
            template: "./src/repository/index.html",
            filename: "repository.html",
        }),
        new HtmlWebpackPlugin({
            chunks: ["tree"],
            template: "./src/tree/index.html",
            filename: "tree.html",
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: "./src/manifest.json",
                    to: "./manifest.json",
                },
            ],
        }),
    ],
}
