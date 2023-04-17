# Home, Not Alone

Get yourself a home on the internet and have friends over!

What if we can form a neighborhood of websites that are all connected by conversations. A social network web of public websites, just like how it was. 
Instead of a simple "follow" button, the contact is established when you first reply to a post on another website, and both the original post and its replies are then reflected on both websites.

First watch [the introduction video](https://share.descript.com/view/4VaCkBkds0Z).

Second, check out [nisse.tech](https://nisse.tech) and [michaelaufreiter.com](https://michaelaufreiter.com) to see for yourself.

Third, create your own home, and leave us a comment. :) Deployment instructions below.

## How does it work?

Let's call a person that has a `home`-site and following the API contracts a `member`. 
1. When a member (e.g., iamfrank.com) wants to reply to a blog entry on another website (e.g., iamsusan.com), they are redirected back to their own website (e.g., iamfrank.com) with the blog entry URL as a query parameter.
2. The member logs in on their own website (iamfrank.com) using their password.
3. After successfull authentication a connection entry is created in the database and the user is redirected back to the blog post.
4. Now they can type their response and post it
5. The reply is created on the original site (iamsusan.com) and a "feed update" is sent to the author's site (iamfrank.com)
6. Now iamsusan.com shows a new reply and iamfrank.com shows an updated feed with the correct reply count and other metadata.


## Step 0 - Requirements

- Node.js 16+ or compatible JavaScript runtime
- Postgres 14+

These are needed to run the example as is, but you can choose any other database and file storage solution.

## Step 1 - Development setup

This is a full-fledged web app you want adjust to your own needs. So please **create a copy** or fork of the source code and rename the project accordingly. Then check out your own copy:

```bash
git clone https://github.com/your-user/your-website.git
cd your-website
```

Create a `.env` file and set the following environment variables to point to your development database and MinIO instance:

```bash
VITE_DB_URL=postgresql://$USER@localhost:5432/your-website
VITE_ORIGIN=your-website.com
VITE_ADMIN_PASSWORD=00000000000000000000000000000000000000
```

Seed the database:

```bash
psql -h localhost -U $USER -d homenotalone -a -f sql/schema.sql
```

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev
```

To create and test a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Step 2 - Making changes to your website

You can literally do everything that SvelteKit allows you to do. We recommend that in your fork you replace the HOME icon with a photo of yours. But you can also go wild and restyle the entire application.

## Step 3 - Making changes to the content

This project is a spin-off from [editable.website](https://editable.website) that enables in-place editing of website content. Navigate to `http://127.0.0.1:5173/login` and enter your secure admin password (`VITE_ADMIN_PASSWORD`). Now you see an additional ellipsis menu, which will provide you an "Edit page" or "Edit post" option for all pages that you have set up as "editable".


## Step 4 - Deployment

I will describe the steps to deploy to [Northflank](https://northflank.com/) (which I am using). I recommend to assign 0.2 vCPU and 512MB RAM to each resource (~ $17/month) but you can easily go lower to save some costs or higher if you expect your site to have significant traffic.

1. Create an instance Postgres 14 through the Northflank user interface.

2. Create a combined service, select the Heroku buildpack and assign the environment variables as they are exposed by the Postgres and MinIO addons. Use the same environment variables during the build step and runtime (yes, you have to type them twice).

You can deploy your website anywhere else as well. For instance if you'd like to go the "Serverless" path, you can deploy on Vercel, and use NeonDB (or DigitalOcean with Connection Pooling activated). You may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Roadmap

We are keeping this minimal for the start, but we are actively thinking about some next steps.

- Additionally expose posts as an RSS feed
- Support for assets (images, videos in posts)
- Manage connections (remove, block, etc.)
- Notification (see a little indicator that new unread items are in your feed)

What would you like to be added next?
