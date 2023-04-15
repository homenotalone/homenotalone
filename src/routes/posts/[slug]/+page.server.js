import { getPostBySlug, getRepliesByPostSlug } from '$lib/api';

export async function load({ params, locals }) {
  const currentUser = locals.user;
  const data = await getPostBySlug(params.slug);
  const replies = await getRepliesByPostSlug(params.slug);
  return {
    ...data,
    replies,
    currentUser
  };
}
