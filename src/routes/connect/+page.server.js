import { redirect, fail } from '@sveltejs/kit';
import { ensureEstablishedConnection } from '$lib/api';
import { dev } from '$app/environment';

const ORIGIN = import.meta.env.VITE_ORIGIN;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

/** @type {import('./$types').PageServerLoad} */
export function load({ url }) {
  const origin = url.searchParams.get('origin');
  const path = url.searchParams.get('path');

  return {
    origin,
    path
  };
}

// This should handle the post request
export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const password = data.get('password');
    const origin = data.get('origin');
    const path = data.get('path');
    if (password !== ADMIN_PASSWORD) {
      return fail(403, { incorrect: true });
    }
    try {
      await ensureEstablishedConnection(origin);
    } catch (err) {
      return fail(400, { connectionFailed: true });
    }
    throw redirect(303, `${dev ? 'http' : 'https'}://${origin}${path}?as=${ORIGIN}`);
  }
};
