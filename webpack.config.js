const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const isDevServer = process.argv.find(v => v.includes('webpack-dev-server'));

module.exports = function(env = {}) {
    const config = {
        mode: 'development',
        devtool: 'source-map',
        entry: './src/ts/App.ts',
        output: {
            path: path.join(__dirname, 'public', 'js'),
            filename: 'script.js'
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: path.resolve('src', 'index.html'),
                templateParameters: {isDevServer},
                filename: isDevServer ? 'index.html' : path.join(__dirname, 'index.html')
            })
        ],
        resolve: {
            extensions: ['.ts', '.js']
        },
        module: {
            rules: [
                {
                    test: /\.ts?$/,
                    use: [
                        {loader: 'ts-loader'}
                    ]
                }
            ]
        }
    };

    return config;
};