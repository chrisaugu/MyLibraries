class MyCache {
    private cache: Map<string, any> = new Map();

    set(key: string, value: any): void {
        this.cache.set(key, value);
    }

    get(key: string): any | undefined {
        return this.cache.get(key);
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }
}

const myCache = new MyCache();
myCache.set('key1', 42);
console.log(myCache.get('key1')); // Output: 42
myCache.delete('key1');
console.log(myCache.get('key1')); // Output: undefined