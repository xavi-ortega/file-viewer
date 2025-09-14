
# File Viewer — Technical README
Finder-like file picker for a Google Drive connection that lets users index / de-index content into a Stack AI Knowledge Base (KB).   
The UI is fast, uses cursor pagination, window virtualization, optimistic updates with rollback, and preserves previously indexed files when creating a new KB.

## Why proxy Stack AI through our backend (Next.js Route Handlers)
* Centralized error shaping, retries, throttling, and logging.
* Normalize responses.
* Hide third party providers (e.g., parameter names) behind a small layer.
* Enable consistent caching rules.
* One place to handle auth, cookie writes, and orgId/kbId plumbing.

## Internal app state
* TanStack Query: remote state & cache
    * Keys
        * Connection children: ["conn","children",{ connId, resourceId }]
        * KB children: ["kb","children",{ kbId, resourcePath }]
        * Infinite queries (cursor), granular invalidation per folder, and polling only when needed.
* Zustand: local state
    * getAllNodes() builds connection_source_ids: folders + loose files not covered by those folders (no duplication).
    * folderCheckState() yields true | false | "indeterminate" without loading the entire tree.

## Performance & UX optimizations
### Pagination (cursor) + controlled prefetch
* Connection listing uses `useInfiniteQuery` with a cursor.
* We don’t preload the entire drive; we fetch per folder on demand.
* The very next folders to be expanded are prefetched

### Window virtualization
* `@tanstack/react-virtual` with window scrolling (not an inner scroll container).
* Measures rows and shows skeleton rows instead of spinners to avoid layout shift.
* Infinite load triggers when the last virtual row becomes visible.

### Optimistic updates
#### Creating a KB (useCreateKnowledgeBase)
* ID expansion before calling the backend:
    * Start with the user’s selected connection_source_ids.
    * Add resource ids that are already present in the previous KB (read from the KB caches).
    * Respect exclusions and avoid duplicates (if a selected folder already covers an item).
* Optimistic seeding per folder in onMutate:
    * For selected folders, recursively populate each folder cache with files marked as `OptimisticItemStatus.PENDING`.
    * For selected files, add to their parent folder cache as `PENDING`.
    * For items we kept from the previous KB, add them as `OptimisticItemStatus.INDEXED` to their folder caches so the UI does not “lose” them while the new KB syncs.
* Success: Copy all old KB folder caches to the new kbId (so the UI stays populated), then invalidate queries for the new KB.
* Error: Full rollback to snapshots, restore previous kbId and show a toast error.

#### De-indexing (useDeindexFiles)
* Optimistic UNINDEXED: mark selected resource paths as `OptimisticItemStatus.UNINDEXED` in all affected KB folder caches.
* Success: invalidate queries for that KB.
* Error: restore snapshots; toast error.

#### Merging server + optimistic (useKbChildrenStatus)
* Fetch fresh KB children for a folder.
* Preserve “sticky” optimistic states:
    * Optimistic INDEXED: if server hasn’t confirmed INDEXED, keep our INDEXED. This is mainly used for the resources indexing flow. When a knowledge base already exists and the  user wants to index more resources, a new knowledge base is created, keeping the old resources.
    * Optimistic PENDING: if server hasn’t listed the item yet, keep our PENDING. This is mainly used for the resources indexing flow.
    * Optimistic UNINDEXED: if server still includes the item, suppress it in the merged result. This is mainly used for the resources unindexing flow.
    * Return the merged list combined with the fresh data.

**Why this works**: the merge function prefers optimistic statuses where appropriate, so refetches don’t erase intent.   
As soon as the server confirms pending/indexed or removes de-indexed files, the optimistic copies naturally drop out.

### Error Handling & UX
* Mutations snapshot affected caches in onMutate; onError restores them.
* Toasts via sonner.
## Setup

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
STACK_BACKEND_URL=https://api.stack-ai.com
STACK_AUTH_URL=https://sb.stack-ai.com
STACK_SUPABASE_ANON_KEY=...
DEMO_USER=stackaitest@gmail.com
DEMO_PASSWORD=...   # from the exercise
```

```bash  
npm i
npm dev
```
