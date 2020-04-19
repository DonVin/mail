let storage = null;
const envFilter = (fn) => {
    return function filter(...args) {
        if (!storageAvailable()) {
            return null;
        }
        return fn.apply(this, args);
    };
};

const storageAvailable = (() => {
    try {
        storage = window.sessionStorage;
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return () => true;
    } catch (e) {
        return () => false;
    }
})();

const sessionStorage = {
    set: envFilter((key, value, options = {}) => {
		const wrappedValue = JSON.stringify({
            value,
            expire: Date.now() + (options.expire || 1 )* 3600 * 1000,
        });

        try {
            storage.setItem(key, wrappedValue);
        } catch (e) {
            if (e.code === 22) {
                storage.clear();
                storage.setItem(key, wrappedValue);
            }
        }
    }),
    get: envFilter(function get(key) {
        try {
            const wrappedValue = JSON.parse(storage.getItem(key));
            if (!wrappedValue) {
                return null;
            }

            if (Date.now() <= wrappedValue.expire) {
                return wrappedValue.value;
            }

            storage.remove(key);
            return null;
        } catch (e) {
            // 不做处理
        }
    }),
    remove: envFilter((key) => {
        storage.removeItem(key);
    }),
    clear: envFilter(() => {
        storage.clear();
    })
};

export default sessionStorage;
