const { container } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/main.ts',

    output: {
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },

    resolve: {
        extensions: ['.ts', '.js'],
    },

    module: {
            rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
    ],
    },

    plugins: [
        new container.ModuleFederationPlugin({
            name: 'navigationButtonsComponent',
            filename: 'remoteEntry.js',
            exposes: {
                './NavigationButtons': './src/components/navigation-buttons.ts',
            },
        }),
        new HtmlWebpackPlugin({
            template: './index.html',
        }),
    ],

    devServer: {
        port: 3001,
        open: true,
    },
};
