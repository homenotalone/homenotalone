import slugify from 'slugify';
import _db from './_db';
import { dev } from '$app/environment';
import { fetchJSON } from '$lib/util';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
const ORIGIN = import.meta.env.VITE_ORIGIN;

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
    const result = t.one(
      'INSERT INTO posts (slug, title, content, teaser) values($1, $2, $3, $4) RETURNING slug, created_at',
      [slug, title, content, teaser]
    );


    return result;
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
    return await t.any('SELECT * FROM feed_entries ORDER BY created_at DESC');
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
    // We intentionally don't await this
    await updateRemoteFeedsForPost(t, postId);
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

/**
 * Create a new connection, or return an existing one if already established
 * @param targetOrigin
 */
export async function ensureEstablishedConnection(targetOrigin) {
  return await db.tx('ensure-connection', async t => {
    return t.oneOrNone(
      'INSERT INTO connections (origin) SELECT $1 WHERE NOT EXISTS (SELECT 1 FROM connections WHERE origin = $1) RETURNING connection_id',
      [targetOrigin]
    );
  });
}

/**
 * Create a new subscription, or return an existing one if already established
 * @param targetOrigin
 */
export async function ensureSubscription(targetOrigin) {
  return await db.tx('ensure-subscription', async t => {
    return t.oneOrNone(
      'INSERT INTO subscriptions (origin) SELECT $1 WHERE NOT EXISTS (SELECT 1 FROM subscriptions WHERE origin = $1) RETURNING subscription_id',
      [targetOrigin]
    );
  });
}

export async function checkConnection(origin) {
  return await db.tx('check-connection', async t => {
    return t.oneOrNone('SELECT connection_id FROM connections WHERE origin = $1', [origin]);
  });
}

/**
 * Used by /api/update-feed
 * 
 * NOTE: We currently treat postId as the unique id. Potentially this may
 * allow a post moving to a different domain (origin) in the future.
 */
export async function createOrUpdateFeedEntry({postId, origin, path, title, teaser, replies }) {
  return await db.tx('create-or-update-feed-entry', async t => {
    const hasConnection = Boolean(await t.oneOrNone('SELECT connection_id FROM connections WHERE origin = $1', [origin]));
    console.log('hasConnection', hasConnection);
    console.log('replies', replies);
    if (!hasConnection) throw new Error(`No conenction registered for ${origin}`);
    const entryExists = await t.oneOrNone('SELECT post_id FROM feed_entries WHERE post_id = $1', [postId]);
    const replyCount = replies.length; // for convenience

    if (entryExists) {
      return await t.one('UPDATE feed_entries SET origin = $1, path = $2, title = $3, teaser = $4, replies = $5, reply_count = $6, updated_at = NOW()  WHERE post_id = $7 RETURNING feed_entry_id', [
        origin,
        path,
        title,
        teaser,
        JSON.stringify(replies),
        replyCount,
        postId
      ]);
    } else {
      return await t.one('INSERT INTO feed_entries (post_id, origin, path, title, teaser, replies, reply_count) values($1, $2, $3, $4, $5, $6, $7) RETURNING feed_entry_id', [
        postId,
        origin,
        path,
        title,
        teaser,
        JSON.stringify(replies),
        replyCount
      ]);
    }
  });
}


// HNA-1 Protocol related stuff below this line:

/**
 * Create a new subscription, or return an existing one if already established. This
 * is done after a new connection has been established by a remote.
 * 
 * @param targetOrigin
 */
export async function hasConnection(remoteOrigin, origin) {
  try {
    const result = await fetch(
      `${dev ? 'http' : 'https'}://${remoteOrigin}/api/check-connection?${new URLSearchParams({origin})}`
    );
    return Boolean(await result.json());
  } catch(err) {
    console.log(err);
  }
}

/**
 * This should be called each time a new post/reply is created/updated.
 *
 * We could run these requests in parallel and don't care if they succeed or not
 * worst thing that could happen is that someone's feed is not updated
 */
export async function updateRemoteFeedsForPost(t, postId) {

  const subscriptions = await t.any('SELECT origin FROM subscriptions');
  // We include post_id so we can potentially update the feed-entry accordingly when a post's slug has changed
  const post = await t.one('SELECT post_id, title, teaser FROM posts WHERE post_id = $1', [postId]);
  const replies = await t.any('SELECT reply_id, origin FROM replies WHERE post_id = $1', [postId]);
  
  // NOTE we don't do synchronization here on purpose. We don't care too much if some origin's
  // aren't reachable. They'll just miss an update.

  for (let i = 0; i < subscriptions.length; i++) {
    const subscription = subscriptions[i];
    // console.log('fetching');
    try {
      const result = await fetchJSON('POST', `${dev ? 'http' : 'https'}://${subscription.origin}/api/update-feed`, {
        origin: ORIGIN,
        ...post,
        path: `/posts/${postId}`, // when you change the slug locally, this updates it at your subscriber's feed
        replies
      });
      console.log('update-feed result', result);
    } catch(err) {
      console.log('MEHEEHE');
      console.error(err);
    }
  }

  return true; // Sync started...
}
