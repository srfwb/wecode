// Sequence async operations so that concurrent calls queue up rather than
// interleave. Useful for transitions that are not safe to run in parallel —
// e.g. switching projects (stop watcher, read disk, hydrate VFS, start
// watcher). Rejections on one operation do not break the chain: subsequent
// operations still run after the failure.
export function createSerializeQueue(): <T>(fn: () => Promise<T>) => Promise<T> {
  let chain: Promise<unknown> = Promise.resolve();
  return function serialize<T>(fn: () => Promise<T>): Promise<T> {
    const next = chain.then(fn, fn);
    chain = next.catch(() => {});
    return next;
  };
}
