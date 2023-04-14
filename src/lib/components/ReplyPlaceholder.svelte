<script>
  import Reply from '$lib/components/Reply.svelte';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import SecondaryButton from '$lib/components/SecondaryButton.svelte';
  import { createEventDispatcher } from 'svelte';

  export let draft = false;
  let draftContent = '';

  const dispatch = createEventDispatcher();

  // TODO: focus on reply field when entering draft?
</script>

<section class="mt-4">
  {#if draft}
    <div class="border p-2 mb-2">
      <Reply editable={true} bind:content={draftContent} />
    </div>
    <PrimaryButton on:click={() => dispatch('save', draftContent)}>Post Reply</PrimaryButton>
    <SecondaryButton on:click={() => (draft = false)}>Cancel</SecondaryButton>
  {:else}
    <PrimaryButton on:click={() => (draft = true)}>Start Conversation</PrimaryButton>
  {/if}
</section>
