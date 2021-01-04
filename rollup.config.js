import batchPackages from "@lerna/batch-packages"
import filterPackages from "@lerna/filter-packages"
import { getPackages } from "@lerna/project"
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import path from 'path'
import sourcemaps from 'rollup-plugin-sourcemaps'
import { string } from 'rollup-plugin-string'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript'

const __PRODUCTION__ = process.env.NODE_ENV === 'production'

/**
 * 获得排序后的 packages
 * https://github.com/lerna/lerna/issues/1848#issuecomment-451762317
 */
async function getSortedPackages(scope, ignore) {
  const packages = await getPackages(__dirname)
  const filtered = filterPackages(packages, scope, ignore, false)
  return batchPackages(filtered).reduce((arr, batch) => arr.concat(batch), [])
}

const main = async () => {

    const commonPlugins = [
        sourcemaps(),
        resolve({
            browser: true,
            preferBuiltins: false,
        }),
        commonjs(),
        json(),
        typescript(),
        string({
            include: [
                '**/*.frag',
                '**/*.vert',
            ],
        }),
    ]

    const plugins = [
        ...commonPlugins
    ]

    const prodPlugins = [
        ...commonPlugins,
        terser({
            output: {
                comments: (node, comment) => comment.line === 1,
            },
        })
    ]

  const packages = await getSortedPackages()
  return packages
    .map(pkg => {
      const external = Object.keys(pkg.dependencies || []).join(',')
      const basePath = path.relative(__dirname, pkg.location)
      const input = path.join(basePath, 'src/index.ts')
      return {
        input,
        output: [
          {
            name: pkg.name,
            file: path.join(basePath, pkg.get('main')),
            format: 'umd',
          }
        ],
        external,
        plugins,
      }
    })
}

export default main()
