import { json } from '@sveltejs/kit';
import { createOrUpdateFeedEntry } from '$lib/api';

export async function POST({ request, locals }) {
  console.log('/api/update-feed')
  const currentUser = locals.user;
  const data = await request.json();
  await createOrUpdateFeedEntry(data, currentUser);
  return json({ status: 'ok' });
}
