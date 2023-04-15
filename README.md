# Home, Not Alone
Get yourself a home on the internet and have friends over!

What if we can form a neighborhood of websites that are all connected by conversations. A social network web of public websites, just like how it was. 
Instead of a simple "follow" button, the contact is established when you first reply to a post on another website, and both the original post and its replies are then reflected on both websites.

## How it works:
Let's call a person that has a `home`-site and following the API contracts a `member`. 
1. When a member (e.g., iamfrank) wants to reply to a blog entry on another website (e.g., iamsusan.com), they are redirected back to their own website (e.g., iamfrank.com) with the blog entry URL as a query parameter.
2. The member logs in on their own website (iamfrank.com) using their password.
3. After successful authentication, the member is presented with a UI/form to create a reply. The form should include the original blog entry URL (from the query parameter) and the reply content.
4. The member submits the form, and their website (iamfrank.com) sends a request to the original website's API (iamsusan.com) with the reply content and the user's identifier (e.g., username or URL).
5. The original website (iamsusan.com) creates the reply and associates it with the member.

## API endpoints to handle replies:
1. `POST /replies`: To create a new reply, the member's website sends a request to this endpoint with the user's identifier, blog entry URL, and reply content. The server creates a reply associated with the user.
2. `GET /replies/:articleId`: To fetch all replies for a specific blog entry, a member sends a request to this endpoint with the entry ID.

This project is a spin-off from [editable.website](https://editable.website).
A SvelteKit template for coding **completely custom website**, while allowing non-technical people to **make edits** to the content by simply logging in with a secure admin password.

## Step 0 - Requirements

- Node.js 16+ or compatible JavaScript runtime
- Postgres 14+
- MinIO or other S3-compatible storage solution

For media storage this template is configured to use S3 compatible storage. For local development you can run a container with MinIO using this docker image:
```bash
docker run \
   -p 9000:9000 \
   -p 9090:9090 \
   --name minio \
   -v ~/minio/data:/data \
   -e "MINIO_ROOT_USER=ROOTNAME" \
   -e "MINIO_ROOT_PASSWORD=CHANGEME123" \
   quay.io/minio/minio server /data --console-address ":9090"
```

These are needed to run the example as is, but you can choose any other database and file storage solution.

## Step 1 - Development setup

This is a full-fledged web app you want adjust to your own needs. So please **create a copy** or fork of the source code and rename the project accordingly. Then check out your own copy:

```bash
git clone https://github.com/your-user/your-website.git
cd your-website
```

Create a `.env` file and set the following environment variables to point to your development database and MinIO instance:

```bash
VITE_DB_URL=postgresql://$USER@localhost:5432/homenotalone
VITE_S3_ACCESS_KEY=000000000000000000
VITE_S3_SECRET_ACCESS_KEY=00000000000000000000000000000000000000
VITE_S3_ENDPOINT=https://minio.ew-dev-assets--000000000000.addon.code.run
VITE_S3_BUCKET=homenotalone
VITE_ASSET_PATH=https://minio.ew-dev-assets--000000000000.addon.code.run/homenotalone
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

You can literally do everything that SvelteKit allows you to do. Below is the source code for the /imprint page, which has a `<PlainText>` title and `<RichText>` content.

```svelte
<svelte:head>
  <title>Imprint</title>
</svelte:head>

{#if showUserMenu}
  <Modal on:close={() => (showUserMenu = false)}>
    <div class="w-full flex flex-col space-y-4 p-4 sm:p-6">
      <PrimaryButton on:click={toggleEdit}>Edit page</PrimaryButton>
      <LoginMenu {currentUser} />
    </div>
  </Modal>
{/if}

{#if editable}
  <EditorToolbar on:cancel={initOrReset} on:save={savePage} />
{/if}

<WebsiteNav bind:showUserMenu {currentUser} bind:editable />

<div class="py-12 sm:py-24">
  <div class="max-w-screen-md mx-auto px-6 md:text-xl">
    <h1 class="text-4xl md:text-7xl font-bold pb-8">
      <PlainText {editable} bind:content={title} />
    </h1>
    <div class="prose md:prose-xl pb-12 sm:pb-24">
      <RichText multiLine {editable} bind:content={imprint} />
    </div>
  </div>
</div>

<Footer counter="/imprint" />
```

To see the full picture, open [src/routes/imprint/+page.svelte](src/routes/imprint/%2Bpage.svelte) and [src/routes/imprint/+page.server.js](src/routes/imprint/%2Bpage.server.js).

Please use this as a starting point for new pages you want to add to your website. `editable-website` is not a widget-library on purpose. Instead you are encouraged to inspect and adjust all source code, including the [schema](./src/lib/prosemirrorSchemas.js) for the editors. I want you to be in control of everything. No behind-the-scene magic.

## Step 3 - Making changes to the content

Just navigate to `http://127.0.0.1:5173/login` and enter your secure admin password (`VITE_ADMIN_PASSWORD`). Now you see an additional ellipsis menu, which will provide you an "Edit page" or "Edit post" option for all pages that you have set up as "editable".

## Step 4 - Deployment

I will describe the steps to deploy to [Northflank](https://northflank.com/) (which I am using). I recommend to assign 0.2 vCPU and 512MB RAM to each resource (~ $17/month) but you can go lower to save some costs or higher if you expect your site to have significant traffic.

1. Create instances for Postgres 14 and MinIO through the Northflank user interface.

2. Create a combined service, select the Heroku buildpack and assign the environment variables as they are exposed by the Postgres and MinIO addons. Use the same environment variables during the build step and runtime (yes, you have to type them twice).

You can deploy your editable website anywhere else as well. For instance if you'd like to go the "Serverless" path, you can deploy on Vercel, and use NeonDB (or DigitalOcean with Connection Pooling activated). You may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Roadmap

We are keeping this minimal for the start, but we are actively thinking about some next steps.

- Additionally expose posts as an RSS feed
- Support for assets (images, videos in posts)
- Manage connections (remove, block, etc.)
- Notification (see a little indicator that new unread items are in your feed)

What would you like to be added next?