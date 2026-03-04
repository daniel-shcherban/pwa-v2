import { y as hydrate, C as dehydrate, l as hashKey, w as partialMatchKey, e as notifyManager, u as matchQuery } from './notifyManager-DgMMGEIW.js';
import './timeoutManager-CEr9Wjj5.js';

var cacheEventTypes = ["added", "removed", "updated"];
function isCacheEventType(eventType) {
  return cacheEventTypes.includes(eventType);
}
async function persistQueryClientRestore({
  queryClient,
  persister,
  maxAge = 1e3 * 60 * 60 * 24,
  buster = "",
  hydrateOptions
}) {
  try {
    const persistedClient = await persister.restoreClient();
    if (persistedClient) {
      if (persistedClient.timestamp) {
        const expired = Date.now() - persistedClient.timestamp > maxAge;
        const busted = persistedClient.buster !== buster;
        if (expired || busted) {
          return persister.removeClient();
        } else {
          hydrate(queryClient, persistedClient.clientState, hydrateOptions);
        }
      } else {
        return persister.removeClient();
      }
    }
  } catch (err) {
    await persister.removeClient();
    throw err;
  }
}
async function persistQueryClientSave({
  queryClient,
  persister,
  buster = "",
  dehydrateOptions
}) {
  const persistClient = {
    buster,
    timestamp: Date.now(),
    clientState: dehydrate(queryClient, dehydrateOptions)
  };
  await persister.persistClient(persistClient);
}
function persistQueryClientSubscribe(props) {
  const unsubscribeQueryCache = props.queryClient.getQueryCache().subscribe((event) => {
    if (isCacheEventType(event.type)) {
      persistQueryClientSave(props);
    }
  });
  const unsubscribeMutationCache = props.queryClient.getMutationCache().subscribe((event) => {
    if (isCacheEventType(event.type)) {
      persistQueryClientSave(props);
    }
  });
  return () => {
    unsubscribeQueryCache();
    unsubscribeMutationCache();
  };
}
function persistQueryClient(props) {
  let hasUnsubscribed = false;
  let persistQueryClientUnsubscribe;
  const unsubscribe = () => {
    hasUnsubscribed = true;
    persistQueryClientUnsubscribe?.();
  };
  const restorePromise = persistQueryClientRestore(props).then(() => {
    if (!hasUnsubscribed) {
      persistQueryClientUnsubscribe = persistQueryClientSubscribe(props);
    }
  });
  return [unsubscribe, restorePromise];
}

// src/retryStrategies.ts
var removeOldestQuery = ({ persistedClient }) => {
  const mutations = [...persistedClient.clientState.mutations];
  const queries = [...persistedClient.clientState.queries];
  const client = {
    ...persistedClient,
    clientState: { mutations, queries }
  };
  const sortedQueries = [...queries].sort(
    (a, b) => a.state.dataUpdatedAt - b.state.dataUpdatedAt
  );
  if (sortedQueries.length > 0) {
    const oldestData = sortedQueries.shift();
    client.clientState.queries = queries.filter((q) => q !== oldestData);
    return client;
  }
  return void 0;
};

var PERSISTER_KEY_PREFIX = "tanstack-query";
function experimental_createQueryPersister({
  storage,
  buster = "",
  maxAge = 1e3 * 60 * 60 * 24,
  serialize = JSON.stringify,
  deserialize = JSON.parse,
  prefix = PERSISTER_KEY_PREFIX,
  refetchOnRestore = true,
  filters
}) {
  function isExpiredOrBusted(persistedQuery) {
    if (persistedQuery.state.dataUpdatedAt) {
      const queryAge = Date.now() - persistedQuery.state.dataUpdatedAt;
      const expired = queryAge > maxAge;
      const busted = persistedQuery.buster !== buster;
      if (expired || busted) {
        return true;
      }
      return false;
    }
    return true;
  }
  async function retrieveQuery(queryHash, afterRestoreMacroTask) {
    if (storage != null) {
      const storageKey = `${prefix}-${queryHash}`;
      try {
        const storedData = await storage.getItem(storageKey);
        if (storedData) {
          let persistedQuery;
          try {
            persistedQuery = await deserialize(storedData);
          } catch {
            await storage.removeItem(storageKey);
            return;
          }
          if (isExpiredOrBusted(persistedQuery)) {
            await storage.removeItem(storageKey);
          } else {
            if (afterRestoreMacroTask) {
              notifyManager.schedule(
                () => afterRestoreMacroTask(persistedQuery)
              );
            }
            return persistedQuery.state.data;
          }
        }
      } catch (err) {
        await storage.removeItem(storageKey);
      }
    }
    return;
  }
  async function persistQueryByKey(queryKey, queryClient) {
    if (storage != null) {
      const query = queryClient.getQueryCache().find({ queryKey });
      if (query) {
        await persistQuery(query);
      }
    }
  }
  async function persistQuery(query) {
    if (storage != null) {
      const storageKey = `${prefix}-${query.queryHash}`;
      storage.setItem(
        storageKey,
        await serialize({
          state: query.state,
          queryKey: query.queryKey,
          queryHash: query.queryHash,
          buster
        })
      );
    }
  }
  async function persisterFn(queryFn, ctx, query) {
    const matchesFilter = filters ? matchQuery(filters, query) : true;
    if (matchesFilter && query.state.data === void 0 && storage != null) {
      const restoredData = await retrieveQuery(
        query.queryHash,
        (persistedQuery) => {
          query.setState({
            dataUpdatedAt: persistedQuery.state.dataUpdatedAt,
            errorUpdatedAt: persistedQuery.state.errorUpdatedAt
          });
          if (refetchOnRestore === "always" || refetchOnRestore === true && query.isStale()) {
            query.fetch();
          }
        }
      );
      if (restoredData !== void 0) {
        return Promise.resolve(restoredData);
      }
    }
    const queryFnResult = await queryFn(ctx);
    if (matchesFilter && storage != null) {
      notifyManager.schedule(() => {
        persistQuery(query);
      });
    }
    return Promise.resolve(queryFnResult);
  }
  async function persisterGc() {
    if (storage?.entries) {
      const storageKeyPrefix = `${prefix}-`;
      const entries = await storage.entries();
      for (const [key, value] of entries) {
        if (key.startsWith(storageKeyPrefix)) {
          let persistedQuery;
          try {
            persistedQuery = await deserialize(value);
          } catch {
            await storage.removeItem(key);
            continue;
          }
          if (isExpiredOrBusted(persistedQuery)) {
            await storage.removeItem(key);
          }
        }
      }
    }
  }
  async function restoreQueries(queryClient, filters2 = {}) {
    const { exact, queryKey } = filters2;
    if (storage?.entries) {
      const storageKeyPrefix = `${prefix}-`;
      const entries = await storage.entries();
      for (const [key, value] of entries) {
        if (key.startsWith(storageKeyPrefix)) {
          let persistedQuery;
          try {
            persistedQuery = await deserialize(value);
          } catch {
            await storage.removeItem(key);
            continue;
          }
          if (isExpiredOrBusted(persistedQuery)) {
            await storage.removeItem(key);
            continue;
          }
          if (queryKey) {
            if (exact) {
              if (persistedQuery.queryHash !== hashKey(queryKey)) {
                continue;
              }
            } else if (!partialMatchKey(persistedQuery.queryKey, queryKey)) {
              continue;
            }
          }
          queryClient.setQueryData(
            persistedQuery.queryKey,
            persistedQuery.state.data,
            {
              updatedAt: persistedQuery.state.dataUpdatedAt
            }
          );
        }
      }
    }
  }
  async function removeQueries(filters2 = {}) {
    const { exact, queryKey } = filters2;
    if (storage?.entries) {
      const entries = await storage.entries();
      const storageKeyPrefix = `${prefix}-`;
      for (const [key, value] of entries) {
        if (key.startsWith(storageKeyPrefix)) {
          if (!queryKey) {
            await storage.removeItem(key);
            continue;
          }
          let persistedQuery;
          try {
            persistedQuery = await deserialize(value);
          } catch {
            await storage.removeItem(key);
            continue;
          }
          if (exact) {
            if (persistedQuery.queryHash !== hashKey(queryKey)) {
              continue;
            }
          } else if (!partialMatchKey(persistedQuery.queryKey, queryKey)) {
            continue;
          }
          await storage.removeItem(key);
        }
      }
    }
  }
  return {
    persisterFn,
    persistQuery,
    persistQueryByKey,
    retrieveQuery,
    persisterGc,
    restoreQueries,
    removeQueries
  };
}

export { PERSISTER_KEY_PREFIX, experimental_createQueryPersister, persistQueryClient, persistQueryClientRestore, persistQueryClientSave, persistQueryClientSubscribe, removeOldestQuery };
