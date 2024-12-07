/** @type {import('next').NextConfig} */

const { FREE_TUNNEL_HUB_ADDRESS } = process.env

const nextConfig = {
  pageExtensions: ['jsx', 'tsx'],
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: '*',
          },
          {
            key: "Access-Control-Allow-Methods",
            value: 'GET',
          },
          {
            key: "Access-Control-Allow-Headers",
            value: 'X-Requested-With, content-type, Authorization',
          },
        ],
      },
    ]
  },
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.FREE_TUNNEL_HUB_ADDRESS': JSON.stringify(FREE_TUNNEL_HUB_ADDRESS),
      })
    )

    return config
  }
}

export default nextConfig
