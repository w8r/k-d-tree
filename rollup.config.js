import { version, author, name, license, description } from './package.json';
import buble   from 'rollup-plugin-buble';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';


const banner = `\
/**
 * ${name} v${version}
 * ${description}
 *
 * @author ${author}
 * @license ${license}
 * @preserve
 */
`;
export default [{
  banner,
  entry:      'index.js',
  sourceMap:  true,
  format:     'umd',
  dest:       'dist/kdtree.js',
  moduleName: 'KDTree',
  plugins:    [ buble() ]
}, {
  entry:      'example/index.js',
  dest:       'example/bundle.js',
  format:     'iife',
  moduleName: 'demo',
  plugins:    [ resolve({
    extensions: [ '.js', '.json' ]
  }), commonjs(), json(), buble() ]
}];
