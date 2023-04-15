<script>
  import { extractTeaser, fetchJSON } from '$lib/util';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import WebsiteNav from '$lib/components/WebsiteNav.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import { goto } from '$app/navigation';
  import Footer from '$lib/components/Footer.svelte';
  import Post from '$lib/components/Post.svelte';
  import EditorToolbar from '$lib/components/EditorToolbar.svelte';
  import Reply from '$lib/components/Reply.svelte';

  export let data;

  let showUserMenu = false;
  let editable, title, teaser, content, createdAt, updatedAt, replies;

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
      fetchJSON('POST', '/api/delete-article', {
        slug: data.slug
      });
      goto('/blog');
    } catch (err) {
      console.error(err);
      alert('Error deleting the article. Try again.');
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
        'There was an error. You can try again, but before that, please just copy and paste your article into a safe place.'
      );
    }
  }

  async function handleStartConversation() {
    let origin = prompt(
      'Please provide your Home origin to authorize the conversation',
      'https://'
    );
    if (origin == null || origin === '') return;

    const convoUrl = `${origin}/conversations/new?postId=${data.postId}&homeUrl=${window.location.origin}`;
    window.open(convoUrl); // This def needs a proper UI
  }
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

<Post
  bind:title
  bind:content
  bind:createdAt
  {editable}
  on:cancel={initOrReset}
  on:save={savePost}
/>

<!-- Reply placeholder -->
<div class="max-w-screen-md mx-auto px-6 pb-12 sm:pb-24 sm:pl-16">
  <div id="article_replies" class="prose-sm sm:prose-xl">
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
        <Reply content={reply.content} published={reply.createdAt} author={reply.authorDomain} />
      {/if}
    {/each}
    <PrimaryButton on:click={handleStartConversation}>Start conversation!</PrimaryButton>
    <!--<ReplyPlaceholder on:cancel={initOrReset} on:save={postReply} bind:draft={editable} />-->
  </div>
</div>

<Footer counter={`/blog/${data.slug}`} />
