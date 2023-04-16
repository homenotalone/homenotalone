import { fail, json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { createReply } from '$lib/api.js';

export async function POST({ request, locals }) {
  const currentUser = locals.user;
  try {
    const { replyingMember, origin, content, postId } = await request.json();

    // Bypass check if user is admin
    if (!currentUser) {
      const hasConnection = await fetch(
        `${dev ? 'http' : 'https'}://${replyingMember}/api/check-connection?origin=${origin}`
      );
      const result = await hasConnection.json();
      if (!result) {
        return fail(403, { notConnected: true });
      }
    }

    const { replyId } = await createReply(postId, origin, content);
    return json({ replyId });
  } catch (err) {
    console.error(err);
    return fail(400, { incorrect: true });
  }
}
