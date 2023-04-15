import slugify from 'slugify';
import _db from './_db';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

/** Use a singleton DB instance */
const db = _db.instance;

/**
 * Create a new post
 */
export async function createPost(title, content, teaser, currentUser) {
  if (!currentUser) throw new Error('Not authorized');

  const slug = slugify(title, {
    lower: true,
    strict: true
  });

  return await db.tx('create-post', async t => {
    return t.one(
      'INSERT INTO posts (slug, title, content, teaser) values($1, $2, $3, $4) RETURNING slug, created_at',
      [slug, title, content, teaser]
    );
  });
}

/**
 * We automatically extract a teaser text from the document's content.
 */
export async function updatePost(slug, title, content, teaser, currentUser) {
  if (!currentUser) throw new Error('Not authorized');
  return await db.tx('update-post', async t => {
    return await t.one(
      'UPDATE posts SET title= $1, content = $2, teaser = $3, updated_at = NOW() WHERE slug = $4 RETURNING slug, updated_at',
      [title, content, teaser, slug]
    );
  });
}

/*
  This can be replaced with any user-based authentication system
*/
export async function authenticate(password, sessionTimeout) {
  return await db.tx('create-session', async t => {
    const expires = __getDateTimeMinutesAfter(sessionTimeout);
    if (password === ADMIN_PASSWORD) {
      const { sessionId } = await t.one(
        'INSERT INTO sessions (expires) values($1) returning session_id',
        [expires]
      );
      return { sessionId };
    } else {
      throw 'Authentication failed.';
    }
  });
}

/*
  Log out of the admin session ...
*/
export async function destroySession(sessionId) {
  return await db.tx('destroy-session', async t => {
    await t.any('DELETE FROM sessions WHERE session_id = $1', [sessionId]);
    return true;
  });
}

/**
 * List all posts
 */
export async function getPosts() {
  return await db.tx('get-posts', async t => {
    return await t.any(`
      SELECT
        p.*,
        (SELECT COUNT(*) FROM replies WHERE post_id = p.post_id) AS reply_count
      FROM posts p ORDER BY created_at DESC
    `);
  });
}

/**
 * Get my feed
 */
export async function getFeedEntries() {
  return await db.tx('get-feed-entries', async t => {
    return await t.any(
      'SELECT * FROM feed_entries ORDER BY created_at DESC'
    );
  });
}


/**
 * Retrieve post by a given slug
 */
export async function getPostBySlug(slug) {
  return await db.tx('get-post-by-slug', async t => {
    return t.one('SELECT * FROM posts WHERE slug = $1', [slug]);
  });
}

export async function getPostById(postId) {
  return await db.tx('get-post-by-id', async t => {
    const post = await t.one('SELECT * FROM posts WHERE post_id = $1', [postId]);
    return post;
  });
}

export async function getRepliesByPostSlug(slug) {
  return await db.tx('get-replies-by-post-slug', async t => {
    const replies = await t.any(
      'SELECT replies.* FROM posts JOIN replies ON posts.post_id = replies.post_id WHERE slug = $1',
      [slug]
    );
    return replies;
  });
}

export async function createReply(postId, origin, content) {
  return await db.tx('create-reply', async t => {
    const reply = await t.one(
      'INSERT INTO replies (post_id, origin, content) values($1, $2, $3) RETURNING reply_id, created_at',
      [postId, origin, content]
    );
    return reply;
  });
}

/**
 * Remove the entire post
 */
export async function deletePost(slug, currentUser) {
  if (!currentUser) throw new Error('Not authorized');
  return await db.tx('delete-post', async t => {
    await t.any('DELETE FROM posts WHERE slug = $1', [slug]);
    return true;
  });
}

/**
 * In this minimal setup there is only one user, the website admin.
 * If you want to support multiple users/authors you want to return the current user record here.
 */
export async function getCurrentUser(sessionId) {
  return await db.tx('get-current-user', async t => {
    const session = await t.oneOrNone('SELECT session_id FROM sessions WHERE session_id = $1', [
      sessionId
    ]);
    if (session) {
      return {
        name: 'Admin'
      };
    } else {
      return null;
    }
  });
}

/**
 * Update the page
 */
export async function createOrUpdatePage(pageId, page, currentUser) {
  if (!currentUser) throw new Error('Not authorized');
  return await db.tx('create-or-update-page', async t => {
    const pageExists = await t.oneOrNone('SELECT page_id FROM pages WHERE page_id = $1', [pageId]);
    if (pageExists) {
      return await t.one('UPDATE pages SET data = $1 WHERE page_id = $2 RETURNING page_id', [
        page,
        pageId
      ]);
    } else {
      return await t.one('INSERT INTO pages (page_id, data) values($1, $2) RETURNING page_id', [
        pageId,
        page
      ]);
    }
  });
}

/**
 * E.g. getPage("home") gets all dynamic data for the home page
 */
export async function getPage(pageId) {
  return await db.tx('get-page', async t => {
    const page = await t.oneOrNone('SELECT data FROM pages WHERE page_id = $1', [pageId]);
    return page?.data;
  });
}

/**
 * TODO: Turn this into a Postgres function
 */
export async function createOrUpdateCounter(counterId) {
  return await db.tx('create-or-update-counter', async t => {
    const counterExists = await t.oneOrNone(
      'SELECT counter_id FROM counters WHERE counter_id = $1',
      [counterId]
    );
    if (counterExists) {
      return await t.one(
        'UPDATE counters SET count = count + 1 WHERE counter_id = $1 RETURNING count',
        [counterId]
      );
    } else {
      return await t.one('INSERT INTO counters (counter_id, count) values($1, 1) RETURNING count', [
        counterId
      ]);
    }
  });
}

/**
 * Helpers
 */
function __getDateTimeMinutesAfter(minutes) {
  return new Date(new Date().getTime() + minutes * 60000).toISOString();
}
