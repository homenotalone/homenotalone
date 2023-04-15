<script>
  import { classNames } from '$lib/util';
  import NotEditable from './NotEditable.svelte';
  export let editable = false;
  export let currentUser;

  export let showUserMenu = undefined;
  export let showSearch = undefined;
  export let isDark = undefined;

  function onKeyDown(e) {
    // Close modals
    if (e.key === 'Escape') {
      showSearch = false;
      showUserMenu = false;
    }
    // Turn on editing
    if (e.key === 'e' && e.metaKey) {
      editable = true;
    }
  }
</script>

<div
  class={classNames(
    'backdrop-blur-sm  z-10 text-sm',
    !editable ? 'sticky top-0' : '',
    isDark ? 'bg-black text-white': 'bg-white bg-opacity-95'
  )}
>
  <div class="max-w-screen-md mx-auto py-4 px-6">
    <NotEditable {editable}>
      <div class="flex items-center relative">
        <a class={classNames('mr-6')} href="/">
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6">
            <g clip-path="url(#clip0_6_128)">
            <path fill={isDark ? "white" : "black"} d="M93.336 9.15999V29.88H88.296V14.2H20.648V45.56H93.336V87H1.944V66.28H6.984V81.96H74.632V50.6H1.944V9.15999H93.336ZM79.672 50.6V81.96H88.296V50.6H79.672ZM15.496 14.2H6.984V45.56H15.496V14.2Z"/>
            </g>
          </svg>
        </a>
        <div class="flex-1" />
        <a class="mr-4 font-medium px-2 py-1 rounded-md" href="/#posts">Posts</a>
        <a class="mr-4 font-medium px-2 py-1 rounded-md" href="/#feed">Feed</a>
        <a class="mr-4 font-medium px-2 py-1 rounded-md" href="/#contact">
          Contact
        </a>
        {#if currentUser}
          <button
            on:click={() => (showUserMenu = !showUserMenu)}
            class="ml-0"
            title={currentUser.name}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
              />
            </svg>
          </button>
        {/if}
      </div>
    </NotEditable>
  </div>
</div>

<svelte:window on:keydown={onKeyDown} />
