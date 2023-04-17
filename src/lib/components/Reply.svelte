<script>
  import RichText from '$lib/components/RichText.svelte';
  import { formatDate } from '$lib/util.js';
  import { dev } from '$app/environment';

  export let content = '';
  export let editable = false;
  export let origin = null;
  export let published = null;
</script>

<div class="m-0 pb-8 sm:pb-12">
  <div class="prose sm:prose-lg">
    {#if editable}
      <RichText bind:content {editable} multiLine={true} />
    {:else}
      {@html content}
    {/if}
  </div>
  <div class="pt-2 flex space-x-2 text-sm">
    <!-- Assuming favicon-48x48.png is present. -->
    <img class="w-5 h-5" src={`${dev ? 'http://' : 'https://'}${origin}/favicon-48x48.png`} alt={origin} />
    <div>
      <a class="underline" href={`${dev ? 'http://' : 'https://'}${origin}`}>{origin}</a> · {formatDate(published, true)}
    </div>
  </div>
  
</div>
