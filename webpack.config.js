const path = require('path');

module.exports = {
    entry: ['@babel/polyfill', './src/index.ts'],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'awesome-typescript-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        library: 'runtypes',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
};