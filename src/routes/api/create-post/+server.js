import { json } from '@sveltejs/kit';
import { createPost } from '$lib/api';

export async function POST({ request, locals }) {
  const currentUser = locals.user;
  const { title, content, teaser } = await request.json();
  const { slug } = await createPost(title, content, teaser, currentUser);
  return json({ slug });
}
