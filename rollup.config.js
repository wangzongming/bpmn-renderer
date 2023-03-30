import babel from "@rollup/plugin-babel";
import svgr from "@svgr/rollup";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import url from "@rollup/plugin-url";
import postcss from "rollup-plugin-postcss";
import external from "rollup-plugin-peer-deps-external";
import { terser } from "rollup-plugin-terser";

const fs = require("fs");
const path = require("path");

const production = !process.env.ROLLUP_WATCH;
if (production) {
	//删除dist文件夹
	console.log("删除dist文件夹中...");
	fs.existsSync(path) && deleteFolder(path.resolve(__dirname, `dist`));
	console.log("删除dist文件夹完毕！开始打包...");
}

export default {
	input: "src/index.js",
	output: [
		{
			dir: "dist/es",
			format: "es",
			sourcemap: !production,
			// exports: "named",
		},
	],
	external: ["diagram-js", "bpmn-js", "tiny-svg", "min-dash"],

	plugins: [
		resolve({
			extensions: [".js", ".jsx", ".ts", ".tsx"],
		}),

		external(),
		url(),
		svgr(),
		postcss({
			modules: true,
			plugins: [
				require("postcss-preset-env")({
					autoprefixer: {
						flexbox: "no-2009",
					},
					stage: 3,
				}),
			],
		}),
		babel({
			babelrc: false,
			babelHelpers: production ? "bundled" : "inline",
			exclude: [/core-js/, /node_modules/],
			extensions: [".js", ".jsx", ".ts", ".tsx"],
			presets: [
				// [
				// 	"@babel/typescript",
				// 	{
				// 		allowDeclareFields: true,
				// 	},
				// ],
				[
					"@babel/env",
					{
						modules: false,
						corejs: 3,
						useBuiltIns: "usage",
						targets: {
							browsers: ["last 2 versions", "iOS >= 7", "Android >= 5"],
						},
					},
				],
				// [
				// 	"@babel/react",
				// 	{
				// 		runtime: "automatic",
				// 	},
				// ],
			],
			plugins: [
				[
					"babel-plugin-named-asset-import",
					{
						loaderMap: {
							svg: {
								ReactComponent: "@svgr/webpack?-svgo![path]",
							},
						},
					},
				],
				"@babel/plugin-proposal-object-rest-spread",
				"@babel/plugin-syntax-dynamic-import",
				[
					"@babel/plugin-proposal-class-properties",
					{
						loose: true,
					},
				],
				"react-loadable/babel",
				"babel-plugin-transform-object-assign",
				["@babel/plugin-proposal-decorators", { legacy: true }],
				"@babel/plugin-proposal-optional-chaining",

			],
		}),
		commonjs({
			extensions: [".js", ".ts", ".tsx"],
		}),

		production && terser(),
	],
	context: "window"
};

function deleteFolder(path) {
	let files = [];
	if (fs.existsSync(path)) {
		files = fs.readdirSync(path);
		files.forEach(function (file, index) {
			let curPath = path + "/" + file;
			if (fs.statSync(curPath).isDirectory()) {
				deleteFolder(curPath);
			} else {
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
}
