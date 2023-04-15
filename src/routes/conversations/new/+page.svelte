<script>
  import { invalidateAll } from '$app/navigation';
  import { fetchJSON } from '$lib/util.js';
  import Reply from '$lib/components/Reply.svelte';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';

  export let data;
  let content = '';
  $: currentUser = data.currentUser;

  // Potentially move this to a Form Action to simplify and reduce amount of server routes
  async function postReply() {
    if (!currentUser) return alert('Sorry, you are not authorized. Please login first'); // TODO: redirect to login page server side.
    const postURL = `${data.homeUrl}/api/replies`;
    try {
      await fetchJSON('POST', postURL, {
        postId: data.sourceId,
        origin: 'HOMEREPLYER', //todo: get author origin here
        content
      });
      // TODO: create feedItem based on post+reply

      // TODO: create connection entity
      void invalidateAll();
    } catch (err) {
      console.error(err);
      alert('There was an error');
    }
  }
</script>

<div class="max-w-screen-md mx-auto px-6 py-8">
  <h1 class="text-xl text-gray-800 uppercase pt-4">Replying to post:</h1>
  <pre class="text-sm text-gray-600">
  {JSON.stringify(data.post, null, 2)}
  </pre>
  <section class="mt-4">
    <div class="border p-2 mb-2">
      <Reply editable={true} bind:content />
    </div>
    <PrimaryButton on:click={postReply}>Post Reply</PrimaryButton>
  </section>
</div>
