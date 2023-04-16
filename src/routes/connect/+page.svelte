<script>
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  export let data;
  export let form;
  let password;

  const ORIGIN = import.meta.env.VITE_ORIGIN;
</script>

<div class="max-w-screen-sm mx-auto px-6 pb-12 sm:pb-24 pt-24">
  {#if form?.incorrect}
    <p class="p-4 bg-red-100 text-red-600 my-4 rounded-md">Login incorrect. Please try again.</p>
  {/if}
  {#if form?.connectionFailed}
    <p class="p-4 bg-red-100 text-red-600 my-4 rounded-md">
      Unable to add connection to target origin. Please try again.
    </p>
  {/if}
  <form class="w-full block" method="POST">
    <h1 class="text-2xl sm:text-3xl font-bold pt-1">Connect {data.origin} .with {ORIGIN}? *</h1>
    <p class="py-4">Confirm with your password:</p>
    <input
      class="block w-full mb-6"
      bind:value={password}
      placeholder="homenotalone.net"
      type="password"
      name="password"
    />
    <input type="hidden" name="origin" value={data.origin} />
    <input type="hidden" name="path" value={data.path} />
    <PrimaryButton type="submit">Connect</PrimaryButton>
    <p class="text-sm pt-8">
      * You will be able to reply to their posts as {ORIGIN} and {data.origin} will be added to your
      feed.
    </p>
  </form>
</div>
