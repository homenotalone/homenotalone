<script>
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  export let data;
  let password

  const ORIGIN = import.meta.env.VITE_ORIGIN;

</script>

<div class="max-w-screen-sm mx-auto px-6 pb-12 sm:pb-24 pt-24">
  <!-- TODO: Implement POST action (if password matches create connection and then forward to https://$otherOrigin/$path?as=$thisOrigin) -->
  <form class="w-full block" method="POST">
    <h1 class="text-2xl sm:text-3xl font-bold pt-1">Connect {data.origin} .with {ORIGIN}? *</h1>
    <p class="py-4">Confirm with your password:</p>
    <input class="block w-full mb-6" bind:value={password} placeholder="homenotalone.net" type="password" />
    <input type="hidden" name="origin" value={data.origin} />
    <input type="hidden" name="path" value={`/posts/${data.slug}`}/>
    <!-- Make that button submit the form -->
    <PrimaryButton type="submit">Connect</PrimaryButton>
    <p class="text-sm pt-8">
      * You will be able to reply to their posts as nisse.tech and michaelaufreiter.com will be added to your feed.
    </p>
  </form>
</div>