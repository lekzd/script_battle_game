const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const isDevServer = process.argv.find(v => v.includes('webpack-dev-server'));

function getHtmlWebpackConfig(directory) {
    const outputPath = path.join('public', directory, 'index.html');

    return {
        template: path.resolve('src', directory, 'index.html'),
        templateParameters: {isDevServer},
        filename: isDevServer ? outputPath : path.join(__dirname, outputPath)
    }
}

module.exports = function(env = {}) {
    const config = {
        mode: 'development',
        devtool: 'source-map',
        entry: './src/App.ts',
        output: {
            path: path.join(__dirname, 'public'),
            filename: 'script.js'
        },
        plugins: [
            new HtmlWebpackPlugin(getHtmlWebpackConfig('master')),
            new HtmlWebpackPlugin(getHtmlWebpackConfig('left')),
            new HtmlWebpackPlugin(getHtmlWebpackConfig('right')),
            new HtmlWebpackPlugin(getHtmlWebpackConfig('leaders')),
            new HtmlWebpackPlugin(getHtmlWebpackConfig(''))
        ],
        resolve: {
            extensions: ['.ts', '.tsx', '.js']
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        {loader: 'ts-loader'}
                    ]
                },
                {
                    test: /\.template\.html?$/,
                    use: [
                        {loader: 'raw-loader'}
                    ]
                }
            ]
        }
    };

    return config;
};