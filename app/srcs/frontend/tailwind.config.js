/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts}",   // 扫描你的 TS/JS 文件里的 class
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
