import { fetchJSON } from '$lib/util.js';

export async function load({ locals, url }) {
  const currentUser = locals.user;
  const sourceId = url.searchParams.get('postId');
  const homeUrl = url.searchParams.get('homeUrl');
  const replyUrl = `${homeUrl}/api/replies/${sourceId}`;
  const post = await fetchJSON('GET', replyUrl);
  // Do we need the full post origin url as well perhaps

  return {
    currentUser,
    post,
    homeUrl,
    sourceId
  };
}
