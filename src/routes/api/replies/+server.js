import { json } from '@sveltejs/kit';
import { createReply } from '$lib/api';

export async function POST({ request }) {
  const { articleId, author, content } = await request.json();
  const { replyId } = await createReply(articleId, author, content);
  return json({ replyId });
}
