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
import ts from 'rollup-plugin-ts'

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

const minName = (name) => {
  return name.replace(/\.(m)?js$/, '.min.$1js');
}

const main = async () => {

  const plugins = [
      sourcemaps(),
      resolve({
          browser: true,
          preferBuiltins: false,
      }),
      commonjs(),
      json(),
      ts({
        hook: {
          outputPath: (prevPath, kind) => {
            // 重定向 d.ts
            if (kind === 'declaration') {
              // 此时 path 是这样的路径
              // `/Users/.../react-canvas-ui/packages/renderer/dist/esm/index.d.ts`
              // 我们将最终文件移动到 dist 目录，变成
              // `/Users/.../react-canvas-ui/packages/renderer/dist/esm/index.d.ts`
              const info = path.parse(prevPath)

              // 移除 min.d.ts 中 `min` 部分
              const base = info.base.replace(/\.min\.d\.ts/, '.d.ts')

              // 将输出目录移动到 dist/
              const dir = path.resolve(info.dir, '../types')
              const nextPath = path.resolve(dir, base)
              return nextPath
            }
          }
        }
      }),
      string({
          include: [
              '**/*.frag',
              '**/*.vert',
          ],
      }),
  ]

  const outputPlugins = [
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
      const output = [
        {
          name: pkg.name,
          sourcemap: true,
          file: path.join(basePath, pkg.get('main')),
          format: 'umd',
        },
        {
          name: pkg.name,
          sourcemap: true,
          file: path.join(basePath, pkg.get('module')),
          format: 'esm',
        },
      ]

      // 额外输出压缩版本
      if (__PRODUCTION__) {
        output.push(...output.map(it => {
          return {
            ...it,
            plugins: outputPlugins,
            file: minName(it.file)
          }
        }))
      }

      return {
        input,
        output,
        external,
        plugins,
      }
    })
}

export default main()
