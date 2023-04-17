<script>
  import { onMount } from 'svelte';
  import { fetchJSON } from '$lib/util';
  import NotEditable from '$lib/components/NotEditable.svelte';

  export let counter = undefined;
  export let editable = false;
  let count;

  onMount(async () => {
    if (counter) {
      const result = await fetchJSON('GET', `/api/counter?c=${counter}`);
      count = result.count;
    }
  });
</script>

<NotEditable {editable}>
  <div class="">
    <div class="max-w-screen-md mx-auto px-6 py-12 flex space-x-8 text-sm">
      <!-- <div>I'm a proud member of the <a class="underline font-medium" href="https://github.com/homenotalone/homenotalone">Home, Not Alone</a> network. Page viewed {count || '…'} times.</div> -->
      <div>Running on <a class="underline font-medium" href="https://github.com/homenotalone/homenotalone">HNA-1</a>, the "Home, Not Alone" network. Page viewed {count || '…'} times.</div>
    </div>
  </div>
</NotEditable>
