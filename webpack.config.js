const path = require('path');
const package = require('./package.json');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

const config = require( './config.json' );

// Naming and path settings
var appName = 'app';
var entryPoint = {
    frontend: './assets/src/frontend/main.js',
    admin: './assets/src/admin/main.js',
    vendor: Object.keys(package.dependencies)
    // style: './assets/less/style.less',
};

var exportPath = path.resolve(__dirname, './assets/js');

// Enviroment flag
var plugins = [];

// add vue loader plugin
const vueLoaderPlugin = new VueLoaderPlugin()

plugins.push(vueLoaderPlugin);

// extract css into its own file
const extractCss = new MiniCssExtractPlugin({
    filename: "../css/[name].css",
});

plugins.push(extractCss);

plugins.push(new BrowserSyncPlugin( {
    proxy: {
        target: config.proxyURL
    },
    files: [
        '**/*.php'
    ],
    cors: true,
    reloadDelay: 0
} ));

// Generate a 'manifest' chunk to be inlined in the HTML template
// plugins.push(new webpack.optimize.CommonsChunkPlugin('manifest'));

// Compress extracted CSS. We are using this plugin so that possible
// duplicated CSS from different components can be deduped.
plugins.push(new OptimizeCSSPlugin({
    cssProcessorOptions: {
        safe: true,
        map: {
            inline: false
        }
    }
}));

appName = '[name].js'

module.exports = {
    mode: process.env.WEBPACK_ENV,
    entry: entryPoint,
    output: {
        path: exportPath,
        filename: appName,
        jsonpFunction: 'pluginWebpack'
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: "vendor",
                chunks: "all"
                }
            }
        }
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            '@': path.resolve('./assets/src/'),
            'frontend': path.resolve('./assets/src/frontend/'),
            'admin': path.resolve('./assets/src/admin/'),
        },
        modules: [
            path.resolve('./node_modules'),
            path.resolve(path.join(__dirname, 'assets/src/')),
        ]
    },

    plugins,

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                        hmr: process.env.NODE_ENV === 'development',
                        reloadAll: true
                        },
                    },
                    'vue-style-loader',
                    'css-loader',
                    'less-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.css$/,
            use: [
                    {
                        loader: 'vue-style-loader'
                    },
                    {
                        loader: 'css-loader',
                        options: {
                        modules: true,
                        localIdentName: '[local]_[hash:base64:8]'
                        }
                    }
                ]
            }
        ]
    },
}
