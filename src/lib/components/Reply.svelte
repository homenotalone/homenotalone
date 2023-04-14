<script>
  import RichText from '$lib/components/RichText.svelte';
  import { formatDate } from '$lib/util.js';

  export let content = '';
  export let editable = false;
  export let author = null;
  export let published = null;
</script>

<div class="m-0 p-0">
  {#if editable}
    <RichText bind:content {editable} multiLine={true} />
  {:else}
    {@html content}
  {/if}
</div>
{#if author}
  <div class="flex gap-x-4 text-gray-400 uppercase text-sm pb-12">
    <svg class="w-4" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M164 110L64 163.768V200L164 147.059V110Z" fill="#111827" />
      <path d="M136 66L36 119.768V156L136 103.059V66Z" fill="#111827" />
      <path d="M164 0L64 53.7684V90L164 37.0588V0Z" fill="#111827" />
    </svg>
    <span class="text-gray-600 underline">{author}</span>
    <span>{formatDate(published)}</span>
  </div>
{/if}
