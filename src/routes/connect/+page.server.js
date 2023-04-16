import { redirect, fail } from '@sveltejs/kit';
import { addConnection } from '$lib/api';
import { dev } from '$app/environment';

const ORIGIN = import.meta.env.VITE_ORIGIN;

/** @type {import('./$types').PageServerLoad} */
export function load({url}) {
  const origin = url.searchParams.get('origin');
  const path = url.searchParams.get('path');

  return {
    origin,
    path
  }
}

// This should handle the post request
export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const password = data.get('password');
    const origin = data.get('origin');
    const path = data.get('path');
    let connected = false;

    try {
      // TODO: implement addConnection
      connected = await addConnection(password, origin);
    } catch (err) {
      console.error(err);
      // TODO: Set up some error handling
      return fail(400, { incorrect: true });
    }
    if (connected) {
      throw redirect(303, `${dev ? 'http' : 'https'}://${origin}${path}?as=${ORIGIN}`);
    }
  }
};
