import { sveltekit } from '@sveltejs/kit/vite';
import { nodeLoaderPlugin } from '@vavite/node-loader/plugin';

const config = {
  plugins: [nodeLoaderPlugin(), sveltekit()]
};

export default config;
