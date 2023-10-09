import { merge } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import path from 'path'
import {
  cleanWebpackPlugin,
  miniCssExtractPlugin,
  // imageMinimizerWebpackPlugin,
} from './plugins';
import { WebpackCommonConfig, config } from './common';

const plugins = [cleanWebpackPlugin, miniCssExtractPlugin];

const output = {
  publicPath: '/',
  path: path.resolve(__dirname, '../build'),
  filename: config.jsFileOutput,
};


const WebpackConfig = {
  plugins,
  output,
  optimization: {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin(),
      // imageMinimizerWebpackPlugin,
    ],
  },
};

export const WebpackProdConfig = merge(WebpackCommonConfig, WebpackConfig);
