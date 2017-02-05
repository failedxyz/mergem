var webpack = require("webpack");

module.exports = {
    "entry": "./src/main.ts",
    "output": {
        "path": __dirname,
        "filename": "bundle.js"
    },
    "devtool": "source-map",
    "resolve": {
        "extensions": [".ts"],
    },
    "module": {
        "loaders": [
            { "test": /\.ts$/, "loader": "ts-loader" }
        ],
        "preLoaders": [
            { "test": /\.js$/, "loader": "source-map-loader" }
        ]
    },
    "plugins": [
        new webpack.optimize.UglifyJsPlugin({ "sourceMap": true })
    ],
    "externals": {
        "howl": "Howl",
        "jquery": "jQuery",
        "yaml": "jsyaml",
    }
};