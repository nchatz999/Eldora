import * as esbuild from 'https://deno.land/x/esbuild@v0.24.2/mod.js';
import { denoPlugins } from 'jsr:@luca/esbuild-deno-loader@^0.11.1';

await esbuild.build({
  entryPoints: ['./src/index.ts'],
  outfile: './public/bundle.js',
  plugins: [...denoPlugins()],
  bundle: true,
  format: 'esm',
  logLevel: 'warning',
  platform: 'browser',
  jsx: 'automatic',
  jsxImportSource: '@nchatz999/eldora',
});
