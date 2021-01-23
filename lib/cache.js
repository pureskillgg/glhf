import cacheManager from 'cache-manager'

export const createCache = () => cacheManager.caching({ ttl: 60 })
