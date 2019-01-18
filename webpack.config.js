const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');

module.exports = {
    entry: './src/main.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ['ts-loader', 'angular2-template-loader'],
                exclude: /node_modules/
            },
            {
                test: /\.(html|css)$/,
                loader: 'raw-loader'
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                loaders: ['raw-loader', 'sass-loader'] // sass-loader not scss-loader
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.scss'],
        alias: {
            '@': path.resolve(__dirname, 'src/app/'),
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
            inject: 'body'
        }),
        new webpack.DefinePlugin({
            config: JSON.stringify({
                apiUrl: 'http://localhost:4000'
            })
        }),
        new UglifyJsPlugin({
            uglifyOptions: {
                ie8: false,
                output: {
                    ascii_only: true,
                    comments: false,
                    beautify: false,
                    webkit: true,
                },
            },
        })
    ],
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
        runtimeChunk: true
    },
    devServer: {
        historyApiFallback: true
    }
};