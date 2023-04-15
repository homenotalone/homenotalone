<script>
  export let post;
  import { classNames, formatDate } from '$lib/util';
  import SecondaryButton from './SecondaryButton.svelte';

  const ORIGIN = import.meta.env.VITE_ORIGIN;
</script>

<div>
  <div
    class={classNames(
      'max-w-screen-md mx-auto px-6 md:text-xl py-6 sm:py-10'
    )}
  >
    <div>
      <div>
        <a
          class={classNames('mb-12 text-2xl md:text-3xl font-bold')}
          href={`/posts/${post.slug}`}
        >
          {post.title}
        </a>
      </div>
      <div class="pt-2 pb-4">
        <div class="line-clamp-4">
          <a href={`/posts/${post.slug}`}>
            {post.teaser}
          </a>
        </div>
      </div>
    </div>
    <div class="pt-2 flex space-x-2 text-sm">
      <div>
        {formatDate(post.createdAt)} · <a class="underline" href={`/posts/${post.slug}#replies`}>{post.replyCount} replies</a>
      </div>
    </div>
    <!-- <div class="pt-2">
      <SecondaryButton size="sm" href={`/posts/${post.slug}`}>
        Continue reading&nbsp;→
      </SecondaryButton>
    </div> -->
  </div>
</div>
