const path = require('path');

module.exports = {
    mode: 'production',
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
        filename: 'runtypes.umd.js',
        path: path.resolve(__dirname, 'dist'),
    },
};