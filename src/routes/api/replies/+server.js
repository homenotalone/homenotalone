import { json } from '@sveltejs/kit';
import { createReply } from '$lib/api';

export async function POST({ request }) {
  const { postId, origin, content } = await request.json();
  const { replyId } = await createReply(postId, origin, content);
  return json({ replyId });
}
