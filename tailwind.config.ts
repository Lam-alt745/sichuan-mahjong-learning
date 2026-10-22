import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-page": "#e6ddca",
        "bg-base": "#f6f0e2",
        "bg-panel": "#fbf7ec",
        "bg-panel-2": "#f1f0e0",
        "bg-bar": "#ece1cb",
        line: "#e0d6bf",
        "line-strong": "#cdbf9f",
        bamboo: "#5a7d4f",
        "bamboo-deep": "#3f5e36",
        "bamboo-bright": "#8fae7f",
        "bamboo-ink": "#f6f0e2",
        clay: "#b4622f",
        "text-hi": "#2c2519",
        "text-body": "#5b5341",
        "text-mute": "#988b6f",
        ok: "#5a7d4f",
        err: "#c0492f",
        "tile-face": "#fcf8ee",
        "tile-edge": "#ddcfb2",
        "suit-wan": "#b23a2e",
        "suit-tiao": "#5a7d4f",
        "suit-tiao-node": "#3f5e36",
        "suit-tong": "#3f6f8a"
      },
      fontFamily: {
        display: ["Georgia", "Songti SC", "Noto Serif SC", "serif"],
        ui: [
          "-apple-system",
          "BlinkMacSystemFont",
          "PingFang SC",
          "Hiragino Sans GB",
          "Segoe UI",
          "sans-serif"
        ],
        mono: ["SF Mono", "Menlo", "Consolas", "Courier New", "monospace"]
      },
      borderRadius: {
        DEFAULT: "12px",
        sm: "8px",
        xs: "6px"
      }
    }
  },
  plugins: []
};

export default config;
