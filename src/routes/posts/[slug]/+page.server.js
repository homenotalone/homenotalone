import { createReply, getPostBySlug, getRepliesByPostSlug, ensureSubscription, hasConnection } from '$lib/api';
import { fail } from '@sveltejs/kit';

import sanitizeHtml from 'sanitize-html';

const ORIGIN = import.meta.env.VITE_ORIGIN;

export async function load({ params, locals, url, cookies }) {
  const as = url.searchParams.get('as');
  // HACK: When as is set as a query parameter (we update the cookie to hold it for later)
  // I'm sure there's a better way for this though.
  if (as) {
    cookies.set('as', as);
  }

  const currentUser = locals.user;
  const data = await getPostBySlug(params.slug);
  const replies = await getRepliesByPostSlug(params.slug);

  // HACK: As soon as `as` parameter is present we register a subscription
  // TODO: create the subscription as part of an atomic two-way handshake "add connection" transaction.
  if (await hasConnection(as, ORIGIN)) {
    await ensureSubscription(as);
  }

  return {
    ...data,
    replies,
    currentUser,
    as: cookies.get('as') // TODO: fetch more user data, such as favicon?
  };
}

export const actions = {
  reply: async ({ request, locals }) => {
    const data = await request.formData();
    const replyingMember = data.get('replyingMember');
    const content = data.get('replyContent');
    const postId = data.get('postId');
    const currentUser = locals.user;

    // Sanitize content
    const sanitizedContent = sanitizeHtml(content);

    try {
      // Bypass check if user is admin
      if (!currentUser && !await hasConnection(replyingMember, ORIGIN)) {
        return fail(403, { notConnected: true });
      }

      const { replyId } = await createReply(postId, replyingMember, sanitizedContent);
      return {
        replyId
      };
    } catch (err) {
      console.error(err);
      return fail(400, { unableToReply: true });
    }
  }
};
