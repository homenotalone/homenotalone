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
    return await t.any('SELECT * FROM feed_entries ORDER BY created_at DESC');
  });
}

/**
 * After another domain added you as a connection, you create a subscription to send them
 * "push notifications" to update their feed.
 */
export async function addSubscription(origin) {
  console.info('TODO: Implement');
}

/**
 * This should be called each time a new post/reply is created/updated.
 *
 * We could run these requests in parallel and don't care if they succeed or not
 * worst thing that could happen is that someone's feed is not updated
 */
export async function updateRemoteFeeds(path) {
  // go through all subscriptions and update the feed
  //
  // Feed entry is identified by origin+path and for now we push the following data to
  // update the remote feed:
  //
  // - title, teaser, replies
  //
  // replies contains an array of reply meta info, used for verification
  // For example:
  // { id: 'acb4edde-ad86-4c9b-9e69-1fcfa0c48aaf', origin: 'foo.com' }

  // Iterate through all remotes and do something like this...
  // await fetchJSON('POST', 'https://remotehost.com/api/update-feed', ...)

  console.info('TODO: Implement');
}

/**
 * This is what is called on the receiver end by /api/update-feed
 */
export async function updateRemoteFeeds2(origin, path) {
  // POST /api/update-feed should have CORS set up in such a way,
  // that it accepts requests from all origins listed in connections, and rejects any other
  // create or update feed_entry at given origin+path
  console.info('TODO: Implement');
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

export async function checkConnection(origin) {
  return await db.tx('check-connection', async t => {
    return t.oneOrNone('SELECT connection_id FROM connections WHERE origin = $1', [origin]);
  });
}
