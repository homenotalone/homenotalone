CREATE EXTENSION IF NOT EXISTS pgcrypto;

---------------------------------------------------------------------------------
-- Schema
---------------------------------------------------------------------------------

-- posts
DROP TABLE IF EXISTS posts cascade;
CREATE TABLE posts (
  post_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar(100) UNIQUE NOT NULL,
  title varchar(100) NOT NULL,
  teaser varchar(1000) NOT NULL,
  content text,
  created_at timestamptz DEFAULT NOW()::timestamptz,
  updated_at timestamptz NULL
);

-- replies
DROP TABLE IF EXISTS replies cascade;
CREATE TABLE replies (
  reply_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid,
  origin varchar(100) NOT NULL,
  content text,
  created_at timestamptz DEFAULT NOW()::timestamptz,
     CONSTRAINT fk_post
        FOREIGN KEY(post_id)
        REFERENCES posts(post_id)
        ON DELETE CASCADE
);

-- feed
DROP TABLE IF EXISTS feed_entries cascade;
CREATE TABLE feed_entries (
  feed_entry_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin varchar(100) NOT NULL,
  path varchar(100) UNIQUE NOT NULL, -- !! this has changed from slug -> path
  title varchar(100) NOT NULL,
  teaser varchar(1000) NOT NULL,
  replies json NOT NULL,
  reply_count integer NOT NULL, -- this is redundant with replies, but convenient (and faster!) for display purposes
  created_at timestamptz DEFAULT NOW()::timestamptz,
  updated_at timestamptz NULL -- content has been updated or new reply
);

-- connections (notify all connections when a new post or reply is created)
DROP TABLE IF EXISTS connections cascade;
CREATE TABLE connections (
  connection_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin varchar(100) UNIQUE NOT NULL
);

-- subscriptions (counterpart to connections on the other host)
-- Used to update all "connected" domains when new posts or replies are created
DROP TABLE IF EXISTS subscriptions cascade;
CREATE TABLE subscriptions (
  subscription_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin varchar(100) UNIQUE NOT NULL -- origin of the remote/subscriber
);

-- sessions
DROP TABLE IF EXISTS sessions cascade;
CREATE TABLE sessions (
  session_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expires timestamptz NOT NULL
);

-- pages
DROP TABLE IF EXISTS pages cascade;
CREATE TABLE pages (
	page_id varchar(100) PRIMARY KEY,
	data json NOT NULL
);

-- counters (for view counts and everything you want to track anonymously)
DROP TABLE IF EXISTS counters cascade;
CREATE TABLE counters (
	counter_id varchar(100) PRIMARY KEY,
	count integer NOT NULL
);
