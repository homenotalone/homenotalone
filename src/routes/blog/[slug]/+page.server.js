import { getArticleBySlug, getNextArticle, getRepliesByArticleSlug } from '$lib/api';

export async function load({ params, locals }) {
  const currentUser = locals.user;
  const data = await getArticleBySlug(params.slug);
  const replies = await getRepliesByArticleSlug(params.slug);
  const articles = [await getNextArticle(params.slug)];
  return {
    ...data,
    replies,
    currentUser,
    articles
  };
}
