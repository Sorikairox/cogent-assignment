// eslint-disable @typescript-eslint/no-var-requires
const esbuild = require('esbuild');
const esbuildPluginTsc = require('esbuild-plugin-tsc');

esbuild.build({
  entryPoints: ['./src/main.ts'],
  bundle: true,
  packages: 'external',
  outfile: 'dist/app.js',
  plugins: [esbuildPluginTsc()],
});
