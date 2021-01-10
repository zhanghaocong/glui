const batchPackages = require("@lerna/batch-packages")
const filterPackages = require("@lerna/filter-packages")
const { getPackages } = require("@lerna/project")
const path = require('path')

/**
 * 获得排序后的 packages
 * https://github.com/lerna/lerna/issues/1848#issuecomment-451762317
 */
async function getSortedPackages(scope, ignore) {
  const packages = await getPackages(__dirname)
  const filtered = filterPackages(packages, scope, ignore, false)
  return batchPackages(filtered).reduce((arr, batch) => arr.concat(batch), [])
}

module.exports = async () => {

  const __PRODUCTION__ = process.env.NODE_ENV === 'production'
  const packages = await getSortedPackages()
  const configs = packages.map(pkg => {

    // throw path.join(path.relative(__dirname, pkg.location), pkg.get('main'))
    
    return {
      mode: 'production',
      context: path.join(pkg.location, 'src'),
      entry: './index.ts',
      externals: pkg.dependencies ? Object.keys(pkg.dependencies) : [],
      resolve: {
        extensions: [".ts", ".tsx", ".js", "jsx"]
      },
      output: {
        path: pkg.location,
        filename: pkg.get('main'),
        library: pkg.name,
        libraryTarget: 'umd',
      },
      module: {
        rules: [
          // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
          { test: /\.tsx?$/, loader: "ts-loader" }
        ]
      }
    }
  })

  if (__PRODUCTION__) {
    
  }

  return configs
}