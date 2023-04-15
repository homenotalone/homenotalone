import { getPosts, getFeedEntries, getPage } from '$lib/api';

export async function load({ locals }) {
  const currentUser = locals.user;
  const posts = await getPosts();
  const feedEntries = await getFeedEntries();
  const page = await getPage('home');

  return {
    currentUser,
    posts,
    feedEntries,
    page
  };
}
