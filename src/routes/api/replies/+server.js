import { json } from '@sveltejs/kit';
import { createReply } from '$lib/api';

export async function POST({ url, request }) {
  const { articleId, content } = await request.json();
  const { replyId } = await createReply(articleId, url.host, content);
  return json({ replyId });
}
