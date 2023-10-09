import path from 'path'
import { merge } from 'webpack-merge';
import { WebpackCommonConfig } from './common';

const host = 'localhost';
const port = 9000; 
const devServer = {
  open: true,
  compress: false,
  port,
  host,
  hot: true,
  client: {
    progress: true,
  },
  static: [
    {
      watch: true,
      directory: path.resolve(__dirname, '../public'),
    },
  ],
};

const WebpackConfig = {
  devServer,
  devtool: 'cheap-module-source-map',
};

export const WebpackDevConfig = merge(WebpackCommonConfig, WebpackConfig);