import path from 'path';

const jsFileOutput = 'assets/js/[name].[contenthash].js'; 
const cssFileOutput = 'assets/css/[name].[contenthash].css'; 

export const config = {
  JS_FILE_OUTPUT: jsFileOutput,
  CSS_FILE_OUTPUT: cssFileOutput,
  IS_DEV: process.env.NODE_ENV != 'service',
};


export const paths = {
  src: path.resolve(__dirname, '../../src'), 
  dist: path.resolve(__dirname, '../../dist'), 
  public: path.resolve(__dirname, '../../public'), 
};
