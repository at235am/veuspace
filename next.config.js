/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack(config, { webpack }) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    config.plugins.push(
      new webpack.ProvidePlugin({
        PIXI: "pixi.js-legacy",
      })
    );

    // const e = new webpack.ProvidePlugin({
    //   PIXI: "pixi.js",
    // });
    // config.ProvidePlugin()
    // console.log(config);

    return config;
  },
};

module.exports = nextConfig;
