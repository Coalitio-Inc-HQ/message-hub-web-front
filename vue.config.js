const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})

// module.exports = {
//   // devServer: {
//   //   host: "0.0.0.0",
//   //   port: 8080,
//   //   disableHostCheck: true
//   // }
//   devServer: {
//     static: {
//       directory: path.join(__dirname, 'public'),
//     },
//     compress: true,
//     port: 9000,
//   },
// }