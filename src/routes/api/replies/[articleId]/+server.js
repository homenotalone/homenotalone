import { json } from '@sveltejs/kit';
import { getArticleById, getRepliesByArticleSlug } from '$lib/api.js';

export async function GET({ params }) {
  const article = await getArticleById(params.articleId);
  const replies = await getRepliesByArticleSlug(article.slug);
  return json({ article, replies });
}
