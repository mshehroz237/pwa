const WebpackPwaManifest = require("webpack-pwa-manifest");

new WebpackPwaManifest({
    name: "Food Event",
    short_name: "Foodies",
    description: "An app that allows you to view upcoming food events.",
    start_url: "../index.html",
    background_color: "#01579b",
    theme_color: "#ffffff",
    fingerprints: false,
    inject: false,
    icons: [{
      src: path.resolve("assets/img/icons/icon-512x512.png"),
      sizes: [96, 128, 192, 256, 384, 512],
      destination: path.join("assets", "icons")
    }]
  })
  