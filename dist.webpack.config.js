const webpack = require('webpack')
const path = require('path')
const { Compilation, sources } = webpack
const { copyFile } = require('node:fs/promises');

async function setEnvironmentFromProcess() {
    const environments = [ "local", "stage", "service" ]
    process.env.NODE_ENV = (process.env.NODE_ENV ?? "").toLowerCase()

    if (!environments.includes(process.env.NODE_ENV)) {
        throw new Error("Invalid deploy environment provided")
    }
    let template = path.resolve(`src/conf-${process.env.NODE_ENV}.ts`)

    return copyFile(template, path.resolve('src/conf.ts'))
    .catch((e) => { console.log("Error while setting application environment variables"); console.log(e); process.exit(1) })
}

class SetEnvironment {
    apply(compiler) {
        compiler.hooks.beforeRun.tap('SetFriendsEnvironment', async (compiler) => {
            let vs = await setEnvironmentFromProcess()
        });
    }
}

module.exports = {
    devtool: 'inline-source-map',
    entry: {
        app: { 
            import: path.resolve(__dirname, "src/index.ts"), 
            filename: process.env.NODE_ENV + "-faceplate-client.js" 
        }
    },
    mode: process.env.NODE_ENV == "service" ? 'production' : 'development',
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: [/node_modules/],
                loader: 'ts-loader',
                options: {
                    configFile: "tsconfig.json"
                }
            }
        ]
    },
    resolve: { 
        modules: [ path.resolve('./node_modules') ],
        extensions: ['.ts', '.js'] 
    },
    plugins: [
        new webpack.IgnorePlugin({resourceRegExp: /\/index\.html$/}),
        new webpack.IgnorePlugin({resourceRegExp: /.cs$/}),
        new SetEnvironment(),
    ],
    target: 'web',
}
