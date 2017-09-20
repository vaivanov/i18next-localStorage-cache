import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import { argv } from 'yargs';

const format = argv.format || argv.f || 'iife';
const compress = argv.uglify;

const babelOptions = {
  exclude: 'node_modules/**',
  presets: [['env', { modules: false }]],
  babelrc: false
};
const commonjsOptions = {
  include: 'node_modules/**'
}
const dest = {
  amd: `dist/amd/i18nextLocalStorageCache${compress ? '.min' : ''}.js`,
  umd: `dist/umd/i18nextLocalStorageCache${compress ? '.min' : ''}.js`,
  iife: `dist/iife/i18nextLocalStorageCache${compress ? '.min' : ''}.js`
}[format];

export default {
  entry: 'src/index.js',
  format,
  plugins: [
    babel(babelOptions),
    commonjs(commonjsOptions),
    nodeResolve({ jsnext: true })
  ].concat(compress ? uglify() : []),
  moduleName: 'i18nextLocalStorageCache',
  // moduleId: 'i18nextLocalStorageCache',
  dest
};
