<script>
  import RichText from '$lib/components/RichText.svelte';
  import { formatDate } from '$lib/util.js';

  export let content = '';
  export let editable = false;
  export let author = null;
  export let published = null;
</script>

<div class="py-2">
  {#if editable}
    <RichText bind:content {editable} multiLine={true} />
  {:else}
    {@html content}
  {/if}
</div>
{#if author}
  <div class="flex gap-x-4 text-gray-400 uppercase text-sm">
    <span>{formatDate(published)}</span>
    <span>by <strong>{author}</strong></span>
  </div>
{/if}
