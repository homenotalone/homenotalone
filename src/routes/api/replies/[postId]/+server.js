import { json } from '@sveltejs/kit';
import { getPostById, getRepliesByPostSlug } from '$lib/api.js';

export async function GET({ params }) {
  const post = await getPostById(params.postId);
  const replies = await getRepliesByPostSlug(post.slug);
  return json({ post, replies });
}
