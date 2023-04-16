import { getPostBySlug, getRepliesByPostSlug } from '$lib/api';

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
  return {
    ...data,
    replies,
    currentUser
  };
}
