const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ENV = process.env.NODE_ENV || 'dev';

console.log('NODE_ENV=', ENV);

const config = module.exports = {
	entry: ENV === 'dev' ? [
		'./app/src/app.js', // main entry
		'webpack-dev-server/client?http://localhost:3000', // no need to do --inline
		'webpack/hot/only-dev-server' // no need to do --hot
	] : './app/src/app.js',

	output: {
		path: './app/public',
		filename: 'app.js',
		publicPath: '/'
	},

	module: {
		resolve: {
			extensions: ['', '.js', '.styl', 'css']
		},

		loaders: [{
			test: /(\.js$)|(\.jsx$)/,
			exclude: /node_modules/,
			loaders: ENV === 'dev' ? ['react-hot', 'babel?cacheDirectory'] : ['babel']
		}, {
			test: /\.(png|jpe?g|gif|woff|woff2|eot|ttf|svg)$/,
			loader: 'url-loader?limit=10000'
		}, {
			test: /\.css$/,
			loader: 'style-loader!css-loader'
		}, {
			test: /\.styl$/,
			loader: 'style-loader!css-loader!postcss-loader!stylus-loader'
		}, {
			test: /\.json$/,
			loaders: ['json']
		}]
	},

	postcss: [
		autoprefixer()
	],

	plugins: [
		new HtmlWebpackPlugin({
			title: 'Fantasy Cubing',
			template: './app/src/index.html',
			favicon: './app/src/favicon.png'
		}),
		new HtmlWebpackPlugin({
			filename: '404.html',
			title: 'Fantasy Cubing',
			template: './app/src/index.html',
			favicon: './app/src/favicon.png'
		}),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.NoErrorsPlugin()
	]
};

if (ENV === 'dev') { // dev specific stuff
	config.devtool = 'eval';
	config.devServer = {
		quiet: false,
		noInfo: false,
		lazy: false,
		historyApiFallback: true,
		hot: true,
		inline: true,
		progress: true,
		publicPath: '/',
		stats: {colors: false},
		port: 3000
	};
} else { // Produciton stuff
	config.plugins.push(
		new webpack.optimize.DedupePlugin(),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('production')
			}
		}),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			},
			output: {
				comments: false
			},
			sourceMap: false
		}),
		new ExtractTextPlugin(config.output.cssFilename, {
			allChunks: true
		})
	);
}

