import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { config } from '../configuration';

export const fonts = {
    test: /\.(eot|ttf|woff?2)$/,
    type: 'asset/resource',
    generator: {
      filename: 'assets/fonts/[contenthash][ext]',
    },
};

export const typeScript = {
    test: /\.(ts|tsx)$/,
    loader: 'ts-loader',
    exclude: /node_modules/,
};
  
export const javaScript = {
    test: /\.(js|jsx)$/,
    loader: 'babel-loader',
    exclude: /node_modules/,
};
  
export const images = {
    test: /\.(gif|ico|jpe?g|png|svg|webp)$/,
    type: 'asset/resource',
    generator: {
      filename: 'assets/images/[contenthash][ext]',
    },
};

export const css = {
    test: /\.css$/,
    use: [
        config.IS_DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
        'css-loader',
        'postcss-loader',
    ],
    exclude: /node_modules/,
}