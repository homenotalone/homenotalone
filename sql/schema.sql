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
  slug varchar(100) UNIQUE NOT NULL,
  title varchar(100) NOT NULL,
  teaser varchar(1000) NOT NULL,
  reply_count integer NOT NULL,
  created_at timestamptz DEFAULT NOW()::timestamptz,
  updated_at timestamptz NULL -- content has been updated or new reply
);

-- connections (notify all connections when a new post or reply is created)
DROP TABLE IF EXISTS connections cascade;
CREATE TABLE connections (
  connection_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin varchar(100) UNIQUE NOT NULL
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

---------------------------------------------------------------------------------
-- Optional seed (useful for initial development)
---------------------------------------------------------------------------------

-- posts
INSERT INTO posts (slug, title, teaser, content, created_at) VALUES
  ('i-am-frank', 'I am Frank', 'Lorem ipsum dolor sit amet...', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In eu neque urna. Sed consequat ornare ipsum, ac auctor magna bibendum feugiat. Cras fringilla pharetra nisi vitae consectetur.', (NOW() - INTERVAL '1 DAY'));

-- replies
INSERT INTO replies (post_id, origin, content) VALUES
  ((SELECT post_id FROM posts WHERE slug='i-am-frank'), '127.0.0.1:5174', 'Hi Frank, nice to meet you!');

-- feed
INSERT INTO feed_entries (origin, slug, title, teaser, reply_count, created_at) VALUES
('127.0.0.1:5174', 'i-am-susan', 'I am Susan', 'Lorem ipsum dolor sit amet...', 1, (NOW() - INTERVAL '2 DAY'));