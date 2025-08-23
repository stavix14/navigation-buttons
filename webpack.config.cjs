const { container } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = (_env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
    mode: argv.mode || 'development',
    entry: './src/main.ts',

    output: {
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        publicPath: isProduction ?
            'https://wondrous-meerkat-c46ad7.netlify.app/' :
            'http://localhost:3001/'
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
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        },
    }
    }
};
