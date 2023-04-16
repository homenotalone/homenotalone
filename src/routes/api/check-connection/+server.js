import { checkConnection } from '$lib/api';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
  const origin = url.searchParams.get('origin');
  const result = await checkConnection(origin);
  return json(result);
}
