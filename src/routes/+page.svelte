<script>
  import EditorToolbar from '$lib/components/EditorToolbar.svelte';
  import PlainText from '$lib/components/PlainText.svelte';
  import RichText from '$lib/components/RichText.svelte';
  import { fetchJSON } from '$lib/util';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import WebsiteNav from '$lib/components/WebsiteNav.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import PostTeaser from '$lib/components/PostTeaser.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Image from '$lib/components/Image.svelte';
  import NotEditable from '$lib/components/NotEditable.svelte';
  import SectionLabel from '$lib/components/SectionLabel.svelte';
  import FeedEntry from '../lib/components/FeedEntry.svelte';

  export let data;
  $: currentUser = data.currentUser;


  // --------------------------------------------------------------------------
  // DEFAULT PAGE CONTENT - AJDUST TO YOUR NEEDS
  // --------------------------------------------------------------------------

  const BIO_PLACEHOLDER = `
		<p>You can write a short bio about yourself here. Possibly you want to include contact information.</p>
	`;

  let editable,
    title,
    bioTitle,
    bioPicture,
    bio,
    contact,
    showUserMenu;

  function initOrReset() {
    title = data.page?.title || 'Untitled Website';
    bioPicture = data.page?.bioPicture || '/images/person-placeholder.jpg';
    bioTitle = data.page?.bioTitle || "Hi, I'm John Doe - Enter introduction here.";
    bio = data.page?.bio || BIO_PLACEHOLDER;
    contact = data.page?.contact || "Reach me via email, instagram, or facebook";
    editable = false;
  }

  // --------------------------------------------------------------------------
  // Page logic
  // --------------------------------------------------------------------------

  function toggleEdit() {
    editable = true;
    showUserMenu = false;
  }

  async function savePage() {
    try {
      // Only persist the start page when logged in as an admin
      if (currentUser) {
        await fetchJSON('POST', '/api/save-page', {
          pageId: 'home',
          page: {
            title,
            bioPicture,
            bioTitle,
            bio,
            contact
          }
        });
      }
      editable = false;
    } catch (err) {
      console.error(err);
      alert('There was an error. Please try again.');
    }
  }

  initOrReset();
</script>

<svelte:head>
  <title>{title}</title>
	<meta name="robots" content="index, follow" />
</svelte:head>

{#if editable}
  <EditorToolbar {currentUser} on:cancel={initOrReset} on:save={savePage} />
{/if}

<WebsiteNav bind:showUserMenu {currentUser} bind:editable />

{#if showUserMenu}
  <Modal on:close={() => (showUserMenu = false)}>
    <form class="w-full block" method="POST">
      <div class="w-full flex flex-col space-y-4 p-4 sm:p-6">
        <PrimaryButton type="button" on:click={() => goto('/blog/new')}>
          New post
        </PrimaryButton>
        <PrimaryButton on:click={toggleEdit}>Edit page</PrimaryButton>
        <LoginMenu {currentUser} />
      </div>
    </form>
  </Modal>
{/if}

<div>
  <div class="max-w-screen-md mx-auto px-6 pt-12 sm:pt-24">
    <NotEditable {editable}>
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" class="pb-8 w-14 sm:w-24 mx-auto">
        <g clip-path="url(#clip0_6_128)">
        <rect width="96" height="96" fill="white"/>
        <path d="M93.336 9.15999V29.88H88.296V14.2H20.648V45.56H93.336V87H1.944V66.28H6.984V81.96H74.632V50.6H1.944V9.15999H93.336ZM79.672 50.6V81.96H88.296V50.6H79.672ZM15.496 14.2H6.984V45.56H15.496V14.2Z" fill="black"/>
        </g>
        <defs>
        <clipPath id="clip0_6_128">
        <rect width="96" height="96" fill="white"/>
        </clipPath>
        </defs>
      </svg>
    </NotEditable>
    <h1 class="text-4xl md:text-7xl font-medium text-center">
      <PlainText {editable} bind:content={title} />
    </h1>
  </div>
</div>

{#if data.posts.length > 0}
  <NotEditable {editable}>
    <div class="bg-white pb-10 sm:pb-16" id="posts">
      <div class="max-w-screen-md mx-auto px-6 pt-12 sm:pt-24">
        <SectionLabel>My posts</SectionLabel>
      </div>
      {#each data.posts as post, i}
        <PostTeaser {post} />
      {/each}
      <!-- <div class="max-w-screen-md mx-auto px-6">
        <a class="block px-4 py-2 border border-black text-center uppercase text-sm font-medium" href="/blog">Show all blog posts</a>
      </div> -->
    </div>
  </NotEditable>
{/if}

{#if data.feedEntries.length > 0}
  <NotEditable {editable}>
    <div class="bg-white pb-10 sm:pb-16" id="feed">
      <div class="max-w-screen-md mx-auto px-6 pt-12 sm:pt-24">
        <SectionLabel>My feed</SectionLabel>
      </div>
      {#each data.feedEntries as feedEntry, i}
        <FeedEntry {feedEntry} />
      {/each}
      <!-- <div class="max-w-screen-md mx-auto px-6">
        <a class="block px-4 py-2 border border-black text-center uppercase text-sm font-medium" href="/blog">Show all blog posts</a>
      </div> -->
    </div>
  </NotEditable>
{/if}


<!-- Bio -->
<div id="contact" class="bg-white pb-12 sm:pb-24">
  <div class="max-w-screen-md mx-auto px-6">
    <div class="pt-12 sm:pt-24 pb-12 text-center">
      <Image
        class="inline-block w-48 h-48 md:w-72 md:h-72 rounded-full"
        maxWidth="384"
        maxHeight="384"
        quality="0.8"
        {editable}
        {currentUser}
        bind:src={bioPicture}
        alt="Michael Aufreiter"
      />
    </div>
    <div class="">
      <h1 class="text-3xl md:text-5xl font-medium">
        <PlainText {editable} bind:content={bioTitle} />
      </h1>
    </div>
    <div class="prose md:prose-xl pb-6">
      <RichText multiLine {editable} bind:content={bio} />
    </div>
  </div>
</div>

<Footer counter="/" {editable} />
