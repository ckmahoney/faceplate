import {
  htmlWebpackPlugin,
  copyWebpackPlugin,
} from './plugins';
import { css, fonts, images, javaScript, typeScript } from './modules';
const { copyFile, readFile } = require('node:fs/promises');

import path from 'path';

export const jsFileOutput = 'assets/js/[name].[contenthash].js'; // JavaScript file name once built
export const cssFileOutput = 'assets/css/[name].[contenthash].css'; // CSS file name once built

export const config = {
  JS_FILE_OUTPUT: jsFileOutput,
  CSS_FILE_OUTPUT: cssFileOutput,
  IS_DEV: process.env.NODE_ENV != 'service',
};

export const paths = {
  src: path.resolve(__dirname, '../src'), 
};

async function setEnvironmentFromProcess() {
    const environments = [ "local", "stage", "service" ]
    process.env.NODE_ENV = (process.env.NODE_ENV ?? "").toLowerCase()

    if (!environments.includes(process.env.NODE_ENV)) {
        throw new Error("Invalid deploy environment provided")
    }

    let confPath = path.resolve("./.env.d/" + process.env.NODE_ENV);

    return copyFile(confPath, path.resolve("./.env"))
    .then(async () => {
        const contents = await readFile(confPath, {encoding: "utf-8"})
        let vars = contents.split(/\n/).map(v => [v.slice(0, v.indexOf("=")), v.slice(1+ v.indexOf("="))])
        vars.forEach(pair => {
            process.env[pair[0]] = pair[1]
        })
        return vars
    })
    .catch((e) => { console.log("Error while setting application environment variables"); console.log(e); process.exit(1) })
}

class SetEnvironment {
    apply(compiler) {
        compiler.hooks.beforeRun.tap('SetFriendsEnvironment', async (compiler) => {
            let vs = await setEnvironmentFromProcess()
        });
    }
}
const entry = [`${paths.src}/index.ts`, `${paths.src}/css/styles.css`];

const output = {
  publicPath: '/',
  path: path.resolve(__dirname, '../stage'),
  filename: jsFileOutput,
};

const plugins = [
  htmlWebpackPlugin,
  copyWebpackPlugin,
  new SetEnvironment()
];

const modules = {
  rules: [css, fonts, images, javaScript, typeScript],
};

const resolve = {
  extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
  alias: {
    '@': paths.src,
  },
};

export const WebpackCommonConfig = {
  entry,
  output,
  plugins,
  resolve,
  module: modules,
  context: __dirname,
  target: config.IS_DEV ? 'web' : 'browserslist',
  mode: config.IS_DEV ? 'development' : 'production',
};
