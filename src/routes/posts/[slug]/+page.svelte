<script>
  import { extractTeaser, fetchJSON } from '$lib/util';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import WebsiteNav from '$lib/components/WebsiteNav.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import { goto, invalidateAll } from '$app/navigation';
  import Footer from '$lib/components/Footer.svelte';
  import Post from '$lib/components/Post.svelte';
  import EditorToolbar from '$lib/components/EditorToolbar.svelte';
  import Reply from '$lib/components/Reply.svelte';
  import { enhance } from '$app/forms';

  import { dev } from '$app/environment';

  const ORIGIN = import.meta.env.VITE_ORIGIN;

  export let data;
  export let form;

  let showUserMenu = false;
  let editable, title, teaser, content, createdAt, updatedAt, replies;
  let showConnectPrompt;
  let connectTo;

  $: as = data.as; // guest session
  $: currentUser = data.currentUser;
  $: {
    // HACK: To make sure this is only run when the parent passes in new data
    data = data;
    initOrReset();
  }

  function initOrReset() {
    title = data.title;
    teaser = data.teaser;
    content = data.content;
    createdAt = data.createdAt;
    updatedAt = data.updatedAt;
    replies = data.replies;
    editable = false;
  }

  function toggleEdit() {
    editable = true;
    showUserMenu = false;
  }

  async function deletePost() {
    if (!currentUser) return alert('Sorry, you are not authorized.');
    try {
      await fetchJSON('POST', '/api/delete-post', {
        slug: data.slug
      });
      goto('/blog');
    } catch (err) {
      console.error(err);
      alert('Error deleting the post. Try again.');
      window.location.reload();
    }
  }

  async function savePost() {
    if (!currentUser) return alert('Sorry, you are not authorized.');
    const teaser = extractTeaser(document.getElementById('post_content'));
    try {
      const result = await fetchJSON('POST', '/api/update-post', {
        slug: data.slug,
        title,
        content,
        teaser
      });
      updatedAt = result.updatedAt;
      editable = false;
    } catch (err) {
      console.error(err);
      alert(
        'There was an error. You can try again, but before that, please just copy and paste your post into a safe place.'
      );
    }
  }

  $: replyingMember = currentUser ? ORIGIN : as;

  let replyMessage = '';
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={teaser} />
</svelte:head>

{#if editable}
  <EditorToolbar {currentUser} on:cancel={initOrReset} on:save={savePost} />
{/if}

<WebsiteNav bind:editable bind:showUserMenu {currentUser} />

{#if showUserMenu}
  <Modal on:close={() => (showUserMenu = false)}>
    <form class="w-full block" method="POST">
      <div class="w-full flex flex-col space-y-4 p-4 sm:p-6">
        <PrimaryButton on:click={toggleEdit}>Edit post</PrimaryButton>
        <PrimaryButton type="button" on:click={deletePost}>Delete post</PrimaryButton>
        <LoginMenu {currentUser} />
      </div>
    </form>
  </Modal>
{/if}

{#if showConnectPrompt}
  <Modal on:close={() => (showConnectPrompt = false)}>
    <form
      class="w-full block"
      action={`${dev ? 'http' : 'https'}://${connectTo}/connect`}
      method="GET"
    >
      <div class="w-full flex flex-col space-y-4 p-4 sm:p-6">
        <h1 class="text-2xl sm:text-3xl font-bold pt-1">Enter your domain to authenticate *</h1>
        <input bind:value={connectTo} placeholder="homenotalone.net" type="text" />
        <input type="hidden" name="origin" value={ORIGIN} />
        <input type="hidden" name="path" value={`/posts/${data.slug}`} />
        <PrimaryButton type="submit">Continue</PrimaryButton>
        <p class="text-sm pt-8">
          * You need a website that supports the HNA (Home, Not Alone) protocol. <a
            class="underline"
            href="https://github.com/homenotalone/homenotalone"
            target="_blank"
            rel="noreferrer">Follow these steps</a
          > to set one up for yourself.
        </p>
      </div>
    </form>
  </Modal>
{/if}

<Post
  bind:title
  bind:content
  bind:createdAt
  {editable}
  on:cancel={initOrReset}
  on:save={savePost}
/>

<!-- Reply placeholder -->
<div class="max-w-screen-md mx-auto px-6 pb-12 sm:pb-24">
  <div id="replies" class="prose-sm sm:prose-xl">
    {#if replies.length}
      <div class="flex items-baseline gap-x-2 text-gray-500">
        {replies.length}
        {replies.length === 1 ? 'reply' : 'replies'}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 9.5C9.27614 9.5 9.5 9.27614 9.5 9L9.5 4.5C9.5 4.22386 9.27614 4 9 4C8.72386 4 8.5 4.22386 8.5 4.5L8.5 8.5L4.5 8.5C4.22386 8.5 4 8.72386 4 9C4 9.27614 4.22386 9.5 4.5 9.5L9 9.5ZM0.646447 1.35355L8.64645 9.35355L9.35355 8.64645L1.35355 0.646447L0.646447 1.35355Z"
            fill="black"
          />
        </svg>
      </div>
    {:else}
      <div class="">No replies yet</div>
    {/if}

    {#each replies as reply}
      {#if reply.content}
        <Reply content={reply.content} published={reply.createdAt} author={reply.origin} />
      {/if}
    {/each}

    <form class="w-full block" method="POST" action="?/reply" use:enhance>
      <div class="border border-black p-4 mt-8 mb-6">
        <div class="text-sm">
          {#if replyingMember}
            <span class="text-gray-500">Replying as</span>
            <span class="font-bold">{replyingMember}</span>
            &nbsp;(<a class="underline" href="#xyz" on:click={() => (showConnectPrompt = true)}>Not you?</a>)
          {:else}
            <a class="underline" href="#xyz" on:click={() => (showConnectPrompt = true)}
              >Connect your domain</a
            > to reply.
          {/if}
        </div>
        <textarea
          class="w-full border-0 p-0 mt-6 focus:outline-none focus:border-none focus:ring-0"
          rows="5"
          placeholder="Your message"
          bind:value={replyMessage}
          name="replyContent"
          required
          on:keydown={e => {
            if (!replyingMember) e.preventDefault();
          }}
          on:click={() => {
            if (!replyingMember) {
              showConnectPrompt = true;
            }
          }}
        />
        <input type="hidden" name="replyingMember" value={replyingMember} />
        <input type="hidden" name="postId" value={data.postId} />
      </div>
      <PrimaryButton type="submit">Send reply</PrimaryButton>
      {#if form?.notConnected}
        <p class="p-4 bg-red-100 text-red-600 my-4 rounded-md">
          Could not get connection details from reply origin. Please try again.
        </p>
      {/if}
      {#if form?.unableToReply}
        <p class="p-4 bg-red-100 text-red-600 my-4 rounded-md">
          Oops! Can't post reply right now. Please try again.
        </p>
      {/if}
    </form>
  </div>
</div>

<Footer counter={`/blog/${data.slug}`} />
