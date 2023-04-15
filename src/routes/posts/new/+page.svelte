<script>
  import { extractTeaser, fetchJSON } from '$lib/util';
  import WebsiteNav from '$lib/components/WebsiteNav.svelte';
  import { goto } from '$app/navigation';
  import Footer from '$lib/components/Footer.svelte';
  import Post from '$lib/components/Post.svelte';
  import EditorToolbar from '$lib/components/EditorToolbar.svelte';

  export let data;

  let showUserMenu = false,
    editable = true,
    title = 'Untitled',
    content = 'Copy and paste your text here.';

  $: currentUser = data.currentUser;

  async function createPost() {
    if (!currentUser) {
      return alert('Sorry, you are not authorized to create new articles.');
    }
    const teaser = extractTeaser(document.getElementById('post_content'));
    try {
      const { slug } = await fetchJSON('POST', '/api/create-post', {
        title,
        content,
        teaser
      });
      goto(`/posts/${slug}`);
    } catch (err) {
      console.error(err);
      alert('A document with that title has already been published. Choose a different title.');
    }
  }

  async function discardDraft() {
    goto('/#posts');
  }
</script>

<svelte:head>
  <title>New blog post</title>
</svelte:head>

{#if editable}
  <EditorToolbar {currentUser} on:cancel={discardDraft} on:save={createPost} />
{/if}

<WebsiteNav bind:editable bind:showUserMenu {currentUser} />
<Post bind:title bind:content {editable} />

<Footer {editable} />
