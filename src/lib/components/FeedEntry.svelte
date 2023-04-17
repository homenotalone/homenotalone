<script>
  export let feedEntry;
  import { classNames, formatDate } from '$lib/util';
  import { dev } from '$app/environment';

  function getPostUrl(feedEntry) {
    return [
      dev ? 'http:/' : 'https:/',
      feedEntry.origin,
      feedEntry.path
    ].join('/')
  }

  function getOriginUrl(feedEntry) {
    return [
      dev ? 'http:/' : 'https:/',
      feedEntry.origin
    ].join('/')
  }
</script>

<div>
  <div
    class={classNames(
      'max-w-screen-md mx-auto px-6 md:text-lg pb-6 sm:pb-10'
    )}
  >
    <div>
      <div>
        <a
          class={classNames('mb-12 text-2xl md:text-3xl font-bold')}
          href={getPostUrl(feedEntry)}
        >
          {feedEntry.title}
        </a>
      </div>
      <div class="pt-2 pb-4">
        <div class="line-clamp-4">
          <a href={getPostUrl(feedEntry)}>
            {feedEntry.teaser}
          </a>
        </div>
      </div>
    </div>
    <div class="pt-2 flex space-x-2 text-sm">
      <!-- Website favicon goes here -->
      <img class="w-5 h-5" src={getOriginUrl(feedEntry)+'/favicon-48x48.png'} alt={feedEntry.origin} />
      <div>
        <a class="underline" href={getOriginUrl(feedEntry)}>{feedEntry.origin}</a> · {formatDate(feedEntry.createdAt)} · <a class="underline" href={getPostUrl(feedEntry)+'#replies'}>{feedEntry.replyCount} replies</a>
      </div>
    </div>
  </div>
</div>
