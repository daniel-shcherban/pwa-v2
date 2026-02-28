import { _ as __vitePreload } from './preload-helper-C7Zd8gLW.js';
import { h as host__loadShare__react__loadShare__, R as React } from './host__loadShare__react__loadShare__-Cshx09tR.js';
import { h as host__mf_v__runtimeInit__mf_v__, a as index_cjs } from './host__mf_v__runtimeInit__mf_v__-CjaOuR8C.js';
import { a as getAugmentedNamespace, g as getDefaultExportFromCjs, c as commonjsGlobal } from './_commonjsHelpers-BAGoDD49.js';

/* eslint-disable local-rules/disallow-side-effects */
/**
 * Keep references on console methods to avoid triggering patched behaviors
 *
 * NB: in some setup, console could already be patched by another SDK.
 * In this case, some display messages can be sent by the other SDK
 * but we should be safe from infinite loop nonetheless.
 */
const ConsoleApiName = {
    log: 'log',
    debug: 'debug',
    info: 'info',
    warn: 'warn',
    error: 'error',
};
/**
 * When building JS bundles, some users might use a plugin[1] or configuration[2] to remove
 * "console.*" references. This causes some issue as we expect `console.*` to be defined.
 * As a workaround, let's use a variable alias, so those expressions won't be taken into account by
 * simple static analysis.
 *
 * [1]: https://babeljs.io/docs/babel-plugin-transform-remove-console/
 * [2]: https://github.com/terser/terser#compress-options (look for drop_console)
 */
const globalConsole = console;
const originalConsoleMethods = {};
Object.keys(ConsoleApiName).forEach((name) => {
    originalConsoleMethods[name] = globalConsole[name];
});
const PREFIX = 'Datadog Browser SDK:';
const display = {
    debug: originalConsoleMethods.debug.bind(globalConsole, PREFIX),
    log: originalConsoleMethods.log.bind(globalConsole, PREFIX),
    info: originalConsoleMethods.info.bind(globalConsole, PREFIX),
    warn: originalConsoleMethods.warn.bind(globalConsole, PREFIX),
    error: originalConsoleMethods.error.bind(globalConsole, PREFIX),
};
const DOCS_ORIGIN = 'https://docs.datadoghq.com';
const DOCS_TROUBLESHOOTING = `${DOCS_ORIGIN}/real_user_monitoring/browser/troubleshooting`;
const MORE_DETAILS = 'More details:';

function catchUserErrors(fn, errorMsg) {
    return (...args) => {
        try {
            return fn(...args);
        }
        catch (err) {
            display.error(errorMsg, err);
        }
    };
}

/**
 * Return true if the draw is successful
 *
 * @param threshold - Threshold between 0 and 100
 */
function performDraw(threshold) {
    return threshold !== 0 && Math.random() * 100 <= threshold;
}
function round(num, decimals) {
    return +num.toFixed(decimals);
}
function isPercentage(value) {
    return isNumber(value) && value >= 0 && value <= 100;
}
function isNumber(value) {
    return typeof value === 'number';
}

function shallowClone(object) {
    return { ...object };
}
function objectHasValue(object, value) {
    return Object.keys(object).some((key) => object[key] === value);
}
function isEmptyObject(object) {
    return Object.keys(object).length === 0;
}
function mapValues(object, fn) {
    const newObject = {};
    for (const key of Object.keys(object)) {
        newObject[key] = fn(object[key]);
    }
    return newObject;
}

/**
 * inspired by https://mathiasbynens.be/notes/globalthis
 */
function getGlobalObject() {
    if (typeof globalThis === 'object') {
        return globalThis;
    }
    Object.defineProperty(Object.prototype, '_dd_temp_', {
        get() {
            return this;
        },
        configurable: true,
    });
    // @ts-ignore _dd_temp is defined using defineProperty
    let globalObject = _dd_temp_;
    // @ts-ignore _dd_temp is defined using defineProperty
    delete Object.prototype._dd_temp_;
    if (typeof globalObject !== 'object') {
        // on safari _dd_temp_ is available on window but not globally
        // fallback on other browser globals check
        if (typeof self === 'object') {
            globalObject = self;
        }
        else if (typeof window === 'object') {
            globalObject = window;
        }
        else {
            globalObject = {};
        }
    }
    return globalObject;
}
/**
 * Cached reference to the global object so it can be imported and re-used without
 * re-evaluating the heavyweight fallback logic in `getGlobalObject()`.
 */
// eslint-disable-next-line local-rules/disallow-side-effects
const globalObject = getGlobalObject();
const isWorkerEnvironment = 'WorkerGlobalScope' in globalObject;

/**
 * Gets the original value for a DOM API that was potentially patched by Zone.js.
 *
 * Zone.js[1] is a library that patches a bunch of JS and DOM APIs. It usually stores the original
 * value of the patched functions/constructors/methods in a hidden property prefixed by
 * __zone_symbol__.
 *
 * In multiple occasions, we observed that Zone.js is the culprit of important issues leading to
 * browser resource exhaustion (memory leak, high CPU usage). This method is used as a workaround to
 * use the original DOM API instead of the one patched by Zone.js.
 *
 * [1]: https://github.com/angular/angular/tree/main/packages/zone.js
 */
function getZoneJsOriginalValue(target, name) {
    const browserWindow = getGlobalObject();
    let original;
    if (browserWindow.Zone && typeof browserWindow.Zone.__symbol__ === 'function') {
        original = target[browserWindow.Zone.__symbol__(name)];
    }
    if (!original) {
        original = target[name];
    }
    return original;
}

let onMonitorErrorCollected;
let debugMode = false;
function startMonitorErrorCollection(newOnMonitorErrorCollected) {
    onMonitorErrorCollected = newOnMonitorErrorCollected;
}
function setDebugMode(newDebugMode) {
    debugMode = newDebugMode;
}
function monitor(fn) {
    return function (...args) {
        return callMonitored(fn, this, args);
    }; // consider output type has input type
}
function callMonitored(fn, context, args) {
    try {
        return fn.apply(context, args);
    }
    catch (e) {
        monitorError(e);
    }
}
function monitorError(e) {
    displayIfDebugEnabled(e);
    if (onMonitorErrorCollected) {
        try {
            onMonitorErrorCollected(e);
        }
        catch (e) {
            displayIfDebugEnabled(e);
        }
    }
}
function displayIfDebugEnabled(...args) {
    if (debugMode) {
        display.error('[MONITOR]', ...args);
    }
}

function setTimeout$1(callback, delay) {
    return getZoneJsOriginalValue(getGlobalObject(), 'setTimeout')(monitor(callback), delay);
}
function clearTimeout$1(timeoutId) {
    getZoneJsOriginalValue(getGlobalObject(), 'clearTimeout')(timeoutId);
}
function setInterval(callback, delay) {
    return getZoneJsOriginalValue(getGlobalObject(), 'setInterval')(monitor(callback), delay);
}
function clearInterval(timeoutId) {
    getZoneJsOriginalValue(getGlobalObject(), 'clearInterval')(timeoutId);
}

function queueMicrotask(callback) {
    var _a;
    const nativeImplementation = (_a = globalObject.queueMicrotask) === null || _a === void 0 ? void 0 : _a.bind(globalObject);
    if (typeof nativeImplementation === 'function') {
        nativeImplementation(monitor(callback));
    }
    else {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- the callback is monitored, so it'll never throw
        Promise.resolve().then(monitor(callback));
    }
}

// eslint-disable-next-line no-restricted-syntax
class Observable {
    constructor(onFirstSubscribe) {
        this.onFirstSubscribe = onFirstSubscribe;
        this.observers = [];
    }
    subscribe(observer) {
        this.addObserver(observer);
        return {
            unsubscribe: () => this.removeObserver(observer),
        };
    }
    notify(data) {
        this.observers.forEach((observer) => observer(data));
    }
    addObserver(observer) {
        this.observers.push(observer);
        if (this.observers.length === 1 && this.onFirstSubscribe) {
            this.onLastUnsubscribe = this.onFirstSubscribe(this) || undefined;
        }
    }
    removeObserver(observer) {
        this.observers = this.observers.filter((other) => observer !== other);
        if (!this.observers.length && this.onLastUnsubscribe) {
            this.onLastUnsubscribe();
        }
    }
}
function mergeObservables(...observables) {
    return new Observable((globalObservable) => {
        const subscriptions = observables.map((observable) => observable.subscribe((data) => globalObservable.notify(data)));
        return () => subscriptions.forEach((subscription) => subscription.unsubscribe());
    });
}
// eslint-disable-next-line no-restricted-syntax
class BufferedObservable extends Observable {
    constructor(maxBufferSize) {
        super();
        this.maxBufferSize = maxBufferSize;
        this.buffer = [];
    }
    notify(data) {
        this.buffer.push(data);
        if (this.buffer.length > this.maxBufferSize) {
            this.buffer.shift();
        }
        super.notify(data);
    }
    subscribe(observer) {
        let closed = false;
        const subscription = {
            unsubscribe: () => {
                closed = true;
                this.removeObserver(observer);
            },
        };
        queueMicrotask(() => {
            for (const data of this.buffer) {
                if (closed) {
                    return;
                }
                observer(data);
            }
            if (!closed) {
                this.addObserver(observer);
            }
        });
        return subscription;
    }
    /**
     * Drop buffered data and don't buffer future data. This is to avoid leaking memory when it's not
     * needed anymore. This can be seen as a performance optimization, and things will work probably
     * even if this method isn't called, but still useful to clarify our intent and lowering our
     * memory impact.
     */
    unbuffer() {
        queueMicrotask(() => {
            this.maxBufferSize = this.buffer.length = 0;
        });
    }
}

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_YEAR = 365 * ONE_DAY;
function relativeToClocks(relative) {
    return { relative, timeStamp: getCorrectedTimeStamp(relative) };
}
function timeStampToClocks(timeStamp) {
    return { relative: getRelativeTime(timeStamp), timeStamp };
}
function getCorrectedTimeStamp(relativeTime) {
    const correctedOrigin = (dateNow() - performance.now());
    // apply correction only for positive drift
    if (correctedOrigin > getNavigationStart()) {
        return Math.round(addDuration(correctedOrigin, relativeTime));
    }
    return getTimeStamp(relativeTime);
}
function currentDrift() {
    return Math.round(dateNow() - addDuration(getNavigationStart(), performance.now()));
}
function toServerDuration(duration) {
    if (!isNumber(duration)) {
        return duration;
    }
    return round(duration * 1e6, 0);
}
function dateNow() {
    // Do not use `Date.now` because sometimes websites are wrongly "polyfilling" it. For example, we
    // had some users using a very old version of `datejs`, which patched `Date.now` to return a Date
    // instance instead of a timestamp[1]. Those users are unlikely to fix this, so let's handle this
    // case ourselves.
    // [1]: https://github.com/datejs/Datejs/blob/97f5c7c58c5bc5accdab8aa7602b6ac56462d778/src/core-debug.js#L14-L16
    return new Date().getTime();
}
function timeStampNow() {
    return dateNow();
}
function relativeNow() {
    return performance.now();
}
function clocksNow() {
    return { relative: relativeNow(), timeStamp: timeStampNow() };
}
function clocksOrigin() {
    return { relative: 0, timeStamp: getNavigationStart() };
}
function elapsed(start, end) {
    return (end - start);
}
function addDuration(a, b) {
    return a + b;
}
// Get the time since the navigation was started.
function getRelativeTime(timestamp) {
    return (timestamp - getNavigationStart());
}
function getTimeStamp(relativeTime) {
    return Math.round(addDuration(getNavigationStart(), relativeTime));
}
function looksLikeRelativeTime(time) {
    return time < ONE_YEAR;
}
/**
 * Navigation start slightly change on some rare cases
 */
let navigationStart;
/**
 * Notes: this does not use `performance.timeOrigin` because:
 * - It doesn't seem to reflect the actual time on which the navigation has started: it may be much farther in the past,
 * at least in Firefox 71. (see: https://bugzilla.mozilla.org/show_bug.cgi?id=1429926)
 * - It is not supported in Safari <15
 */
function getNavigationStart() {
    var _a, _b;
    if (navigationStart === undefined) {
        // ServiceWorkers do not support navigationStart (it's deprecated), so we fallback to timeOrigin
        navigationStart = ((_b = (_a = performance.timing) === null || _a === void 0 ? void 0 : _a.navigationStart) !== null && _b !== void 0 ? _b : performance.timeOrigin);
    }
    return navigationStart;
}

// use lodash API
function throttle(fn, wait, options) {
    const needLeadingExecution = options && options.leading !== undefined ? options.leading : true;
    const needTrailingExecution = options && options.trailing !== undefined ? options.trailing : true;
    let inWaitPeriod = false;
    let pendingExecutionWithParameters;
    let pendingTimeoutId;
    return {
        throttled: (...parameters) => {
            if (inWaitPeriod) {
                pendingExecutionWithParameters = parameters;
                return;
            }
            if (needLeadingExecution) {
                fn(...parameters);
            }
            else {
                pendingExecutionWithParameters = parameters;
            }
            inWaitPeriod = true;
            pendingTimeoutId = setTimeout$1(() => {
                if (needTrailingExecution && pendingExecutionWithParameters) {
                    fn(...pendingExecutionWithParameters);
                }
                inWaitPeriod = false;
                pendingExecutionWithParameters = undefined;
            }, wait);
        },
        cancel: () => {
            clearTimeout$1(pendingTimeoutId);
            inWaitPeriod = false;
            pendingExecutionWithParameters = undefined;
        },
    };
}
// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() { }

/**
 * UUID v4
 * from https://gist.github.com/jed/982883
 */
function generateUUID(placeholder) {
    return placeholder
        ? // eslint-disable-next-line  no-bitwise
            (parseInt(placeholder, 10) ^ ((Math.random() * 16) >> (parseInt(placeholder, 10) / 4))).toString(16)
        : `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, generateUUID);
}
// Assuming input string is following the HTTP Cookie format defined in
// https://www.ietf.org/rfc/rfc2616.txt and https://www.ietf.org/rfc/rfc6265.txt, we don't need to
// be too strict with this regex.
const COMMA_SEPARATED_KEY_VALUE = /(\S+?)\s*=\s*(.+?)(?:;|$)/g;
/**
 * Returns the value of the key with the given name
 * If there are multiple values with the same key, returns the first one
 */
function findCommaSeparatedValue(rawString, name) {
    COMMA_SEPARATED_KEY_VALUE.lastIndex = 0;
    while (true) {
        const match = COMMA_SEPARATED_KEY_VALUE.exec(rawString);
        if (match) {
            if (match[1] === name) {
                return match[2];
            }
        }
        else {
            break;
        }
    }
}
/**
 * Returns a map of all the values with the given key
 * If there are multiple values with the same key, returns all the values
 */
function findAllCommaSeparatedValues(rawString) {
    const result = new Map();
    COMMA_SEPARATED_KEY_VALUE.lastIndex = 0;
    while (true) {
        const match = COMMA_SEPARATED_KEY_VALUE.exec(rawString);
        if (match) {
            const key = match[1];
            const value = match[2];
            if (result.has(key)) {
                result.get(key).push(value);
            }
            else {
                result.set(key, [value]);
            }
        }
        else {
            break;
        }
    }
    return result;
}
/**
 * Returns a map of the values with the given key
 * ⚠️ If there are multiple values with the same key, returns the LAST one
 *
 * @deprecated use `findAllCommaSeparatedValues()` instead
 */
function findCommaSeparatedValues(rawString) {
    const result = new Map();
    COMMA_SEPARATED_KEY_VALUE.lastIndex = 0;
    while (true) {
        const match = COMMA_SEPARATED_KEY_VALUE.exec(rawString);
        if (match) {
            result.set(match[1], match[2]);
        }
        else {
            break;
        }
    }
    return result;
}
function safeTruncate(candidate, length, suffix = '') {
    const lastChar = candidate.charCodeAt(length - 1);
    const isLastCharSurrogatePair = lastChar >= 0xd800 && lastChar <= 0xdbff;
    const correctedLength = isLastCharSurrogatePair ? length + 1 : length;
    if (candidate.length <= correctedLength) {
        return candidate;
    }
    return `${candidate.slice(0, correctedLength)}${suffix}`;
}

function isChromium() {
    return detectBrowserCached() === 0 /* Browser.CHROMIUM */;
}
function isSafari() {
    return detectBrowserCached() === 1 /* Browser.SAFARI */;
}
let browserCache;
function detectBrowserCached() {
    return browserCache !== null && browserCache !== void 0 ? browserCache : (browserCache = detectBrowser());
}
// Exported only for tests
function detectBrowser(browserWindow = window) {
    var _a;
    const userAgent = browserWindow.navigator.userAgent;
    if (browserWindow.chrome || /HeadlessChrome/.test(userAgent)) {
        return 0 /* Browser.CHROMIUM */;
    }
    if (
    // navigator.vendor is deprecated, but it is the most resilient way we found to detect
    // "Apple maintained browsers" (AKA Safari). If one day it gets removed, we still have the
    // useragent test as a semi-working fallback.
    ((_a = browserWindow.navigator.vendor) === null || _a === void 0 ? void 0 : _a.indexOf('Apple')) === 0 ||
        (/safari/i.test(userAgent) && !/chrome|android/i.test(userAgent))) {
        return 1 /* Browser.SAFARI */;
    }
    return 2 /* Browser.OTHER */;
}

function normalizeUrl(url) {
    return buildUrl(url, location.href).href;
}
function isValidUrl(url) {
    try {
        return !!buildUrl(url);
    }
    catch (_a) {
        return false;
    }
}
function getPathName(url) {
    const pathname = buildUrl(url).pathname;
    return pathname[0] === '/' ? pathname : `/${pathname}`;
}
function buildUrl(url, base) {
    const { URL } = getPristineWindow();
    try {
        return base !== undefined ? new URL(url, base) : new URL(url);
    }
    catch (error) {
        throw new Error(`Failed to construct URL: ${String(error)}`);
    }
}
/**
 * Get native URL constructor from a clean iframe
 * This avoids polyfill issues by getting the native implementation from a fresh iframe context
 * Falls back to the original URL constructor if iframe approach fails
 */
let getPristineGlobalObjectCache;
function getPristineWindow() {
    if (!getPristineGlobalObjectCache) {
        let iframe;
        let pristineWindow;
        try {
            iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            pristineWindow = iframe.contentWindow;
        }
        catch (_a) {
            pristineWindow = globalObject;
        }
        getPristineGlobalObjectCache = {
            URL: pristineWindow.URL,
        };
        iframe === null || iframe === void 0 ? void 0 : iframe.remove();
    }
    return getPristineGlobalObjectCache;
}

function setCookie(name, value, expireDelay = 0, options) {
    const date = new Date();
    date.setTime(date.getTime() + expireDelay);
    const expires = `expires=${date.toUTCString()}`;
    const sameSite = options && options.crossSite ? 'none' : 'strict';
    const domain = options && options.domain ? `;domain=${options.domain}` : '';
    const secure = options && options.secure ? ';secure' : '';
    const partitioned = options && options.partitioned ? ';partitioned' : '';
    document.cookie = `${name}=${value};${expires};path=/;samesite=${sameSite}${domain}${secure}${partitioned}`;
}
/**
 * Returns the value of the cookie with the given name
 * If there are multiple cookies with the same name, returns the first one
 */
function getCookie(name) {
    return findCommaSeparatedValue(document.cookie, name);
}
/**
 * Returns all the values of the cookies with the given name
 */
function getCookies(name) {
    return findAllCommaSeparatedValues(document.cookie).get(name) || [];
}
let initCookieParsed;
/**
 * Returns a cached value of the cookie. Use this during SDK initialization (and whenever possible)
 * to avoid accessing document.cookie multiple times.
 *
 * ⚠️ If there are multiple cookies with the same name, returns the LAST one (unlike `getCookie()`)
 */
function getInitCookie(name) {
    if (!initCookieParsed) {
        initCookieParsed = findCommaSeparatedValues(document.cookie);
    }
    return initCookieParsed.get(name);
}
function deleteCookie(name, options) {
    setCookie(name, '', 0, options);
}
function areCookiesAuthorized(options) {
    if (document.cookie === undefined || document.cookie === null) {
        return false;
    }
    try {
        // Use a unique cookie name to avoid issues when the SDK is initialized multiple times during
        // the test cookie lifetime
        const testCookieName = `dd_cookie_test_${generateUUID()}`;
        const testCookieValue = 'test';
        setCookie(testCookieName, testCookieValue, ONE_MINUTE, options);
        const isCookieCorrectlySet = getCookie(testCookieName) === testCookieValue;
        deleteCookie(testCookieName, options);
        return isCookieCorrectlySet;
    }
    catch (error) {
        display.error(error);
        return false;
    }
}
/**
 * No API to retrieve it, number of levels for subdomain and suffix are unknown
 * strategy: find the minimal domain on which cookies are allowed to be set
 * https://web.dev/same-site-same-origin/#site
 */
let getCurrentSiteCache;
function getCurrentSite(hostname = location.hostname, referrer = document.referrer) {
    if (getCurrentSiteCache === undefined) {
        const defaultHostName = getCookieDefaultHostName(hostname, referrer);
        if (defaultHostName) {
            // Use a unique cookie name to avoid issues when the SDK is initialized multiple times during
            // the test cookie lifetime
            const testCookieName = `dd_site_test_${generateUUID()}`;
            const testCookieValue = 'test';
            const domainLevels = defaultHostName.split('.');
            let candidateDomain = domainLevels.pop();
            while (domainLevels.length && !getCookie(testCookieName)) {
                candidateDomain = `${domainLevels.pop()}.${candidateDomain}`;
                setCookie(testCookieName, testCookieValue, ONE_SECOND, { domain: candidateDomain });
            }
            deleteCookie(testCookieName, { domain: candidateDomain });
            getCurrentSiteCache = candidateDomain;
        }
    }
    return getCurrentSiteCache;
}
function getCookieDefaultHostName(hostname, referrer) {
    try {
        return hostname || buildUrl(referrer).hostname;
    }
    catch (_a) {
        // Ignore
    }
}

const SESSION_STORE_KEY = '_dd_s';

function findLast(array, predicate) {
    for (let i = array.length - 1; i >= 0; i -= 1) {
        const item = array[i];
        if (predicate(item, i, array)) {
            return item;
        }
    }
    return undefined;
}
// Keep the following wrapper functions as it can be mangled and will result in smaller bundle size that using
// the native Object.values and Object.entries directly
function objectValues(object) {
    return Object.values(object);
}
function objectEntries(object) {
    return Object.entries(object);
}

const SESSION_TIME_OUT_DELAY = 4 * ONE_HOUR;
const SESSION_EXPIRATION_DELAY = 15 * ONE_MINUTE;
const SESSION_COOKIE_EXPIRATION_DELAY = ONE_YEAR;
const SESSION_NOT_TRACKED = '0';
/**
 * @internal
 */
const SessionPersistence = {
    COOKIE: 'cookie',
    MEMORY: 'memory',
    LOCAL_STORAGE: 'local-storage',
};

const SESSION_ENTRY_REGEXP = /^([a-zA-Z]+)=([a-z0-9-]+)$/;
const SESSION_ENTRY_SEPARATOR = '&';
function isValidSessionString(sessionString) {
    return (!!sessionString &&
        (sessionString.indexOf(SESSION_ENTRY_SEPARATOR) !== -1 || SESSION_ENTRY_REGEXP.test(sessionString)));
}

const EXPIRED = '1';
function getExpiredSessionState(previousSessionState, configuration) {
    const expiredSessionState = {
        isExpired: EXPIRED,
    };
    if (configuration.trackAnonymousUser && (previousSessionState === null || previousSessionState === void 0 ? void 0 : previousSessionState.anonymousId)) {
        expiredSessionState.anonymousId = previousSessionState === null || previousSessionState === void 0 ? void 0 : previousSessionState.anonymousId;
    }
    return expiredSessionState;
}
function isSessionInNotStartedState(session) {
    return isEmptyObject(session);
}
function isSessionStarted(session) {
    return !isSessionInNotStartedState(session);
}
function isSessionInExpiredState(session) {
    return session.isExpired !== undefined || !isActiveSession(session);
}
// An active session is a session in either `Tracked` or `NotTracked` state
function isActiveSession(sessionState) {
    // created and expire can be undefined for versions which was not storing them
    // these checks could be removed when older versions will not be available/live anymore
    return ((sessionState.created === undefined || dateNow() - Number(sessionState.created) < SESSION_TIME_OUT_DELAY) &&
        (sessionState.expire === undefined || dateNow() < Number(sessionState.expire)));
}
function expandSessionState(session) {
    session.expire = String(dateNow() + SESSION_EXPIRATION_DELAY);
}
function toSessionString(session) {
    return (objectEntries(session)
        // we use `aid` as a key for anonymousId
        .map(([key, value]) => (key === 'anonymousId' ? `aid=${value}` : `${key}=${value}`))
        .join(SESSION_ENTRY_SEPARATOR));
}
function toSessionState(sessionString) {
    const session = {};
    if (isValidSessionString(sessionString)) {
        sessionString.split(SESSION_ENTRY_SEPARATOR).forEach((entry) => {
            const matches = SESSION_ENTRY_REGEXP.exec(entry);
            if (matches !== null) {
                const [, key, value] = matches;
                if (key === 'aid') {
                    // we use `aid` as a key for anonymousId
                    session.anonymousId = value;
                }
                else {
                    session[key] = value;
                }
            }
        });
    }
    return session;
}

const OLD_SESSION_COOKIE_NAME = '_dd';
const OLD_RUM_COOKIE_NAME = '_dd_r';
const OLD_LOGS_COOKIE_NAME = '_dd_l';
// duplicate values to avoid dependency issues
const RUM_SESSION_KEY$1 = 'rum';
const LOGS_SESSION_KEY = 'logs';
/**
 * This migration should remain in the codebase as long as older versions are available/live
 * to allow older sdk versions to be upgraded to newer versions without compatibility issues.
 */
function tryOldCookiesMigration(cookieStoreStrategy) {
    const sessionString = getInitCookie(SESSION_STORE_KEY);
    if (!sessionString) {
        const oldSessionId = getInitCookie(OLD_SESSION_COOKIE_NAME);
        const oldRumType = getInitCookie(OLD_RUM_COOKIE_NAME);
        const oldLogsType = getInitCookie(OLD_LOGS_COOKIE_NAME);
        const session = {};
        if (oldSessionId) {
            session.id = oldSessionId;
        }
        if (oldLogsType && /^[01]$/.test(oldLogsType)) {
            session[LOGS_SESSION_KEY] = oldLogsType;
        }
        if (oldRumType && /^[012]$/.test(oldRumType)) {
            session[RUM_SESSION_KEY$1] = oldRumType;
        }
        if (isSessionStarted(session)) {
            expandSessionState(session);
            cookieStoreStrategy.persistSession(session);
        }
    }
}

const SESSION_COOKIE_VERSION = 0;
function selectCookieStrategy(initConfiguration) {
    const cookieOptions = buildCookieOptions(initConfiguration);
    return cookieOptions && areCookiesAuthorized(cookieOptions)
        ? { type: SessionPersistence.COOKIE, cookieOptions }
        : undefined;
}
function initCookieStrategy(configuration, cookieOptions) {
    const cookieStore = {
        /**
         * Lock strategy allows mitigating issues due to concurrent access to cookie.
         * This issue concerns only chromium browsers and enabling this on firefox increases cookie write failures.
         */
        isLockEnabled: isChromium(),
        persistSession: (sessionState) => storeSessionCookie(cookieOptions, configuration, sessionState, SESSION_EXPIRATION_DELAY),
        retrieveSession: () => retrieveSessionCookie(cookieOptions, configuration),
        expireSession: (sessionState) => storeSessionCookie(cookieOptions, configuration, getExpiredSessionState(sessionState, configuration), SESSION_TIME_OUT_DELAY),
    };
    tryOldCookiesMigration(cookieStore);
    return cookieStore;
}
function storeSessionCookie(options, configuration, sessionState, defaultTimeout) {
    let sessionStateString = toSessionString(sessionState);
    if (configuration.betaEncodeCookieOptions) {
        sessionStateString = toSessionString({
            ...sessionState,
            // deleting a cookie is writing a new cookie with an empty value
            // we don't want to store the cookie options in this case otherwise the cookie will not be deleted
            ...(!isEmptyObject(sessionState) ? { c: encodeCookieOptions(options) } : {}),
        });
    }
    setCookie(SESSION_STORE_KEY, sessionStateString, configuration.trackAnonymousUser ? SESSION_COOKIE_EXPIRATION_DELAY : defaultTimeout, options);
}
/**
 * Retrieve the session state from the cookie that was set with the same cookie options
 * If there is no match, return the first cookie, because that's how `getCookie()` works
 */
function retrieveSessionCookie(cookieOptions, configuration) {
    if (configuration.betaEncodeCookieOptions) {
        return retrieveSessionCookieFromEncodedCookie(cookieOptions);
    }
    const sessionString = getCookie(SESSION_STORE_KEY);
    const sessionState = toSessionState(sessionString);
    return sessionState;
}
function buildCookieOptions(initConfiguration) {
    const cookieOptions = {};
    cookieOptions.secure =
        !!initConfiguration.useSecureSessionCookie || !!initConfiguration.usePartitionedCrossSiteSessionCookie;
    cookieOptions.crossSite = !!initConfiguration.usePartitionedCrossSiteSessionCookie;
    cookieOptions.partitioned = !!initConfiguration.usePartitionedCrossSiteSessionCookie;
    if (initConfiguration.trackSessionAcrossSubdomains) {
        const currentSite = getCurrentSite();
        if (!currentSite) {
            return;
        }
        cookieOptions.domain = currentSite;
    }
    return cookieOptions;
}
function encodeCookieOptions(cookieOptions) {
    const domainCount = cookieOptions.domain ? cookieOptions.domain.split('.').length - 1 : 0;
    /* eslint-disable no-bitwise */
    let byte = 0;
    byte |= SESSION_COOKIE_VERSION << 5; // Store version in upper 3 bits
    byte |= domainCount << 1; // Store domain count in next 4 bits
    byte |= cookieOptions.crossSite ? 1 : 0; // Store useCrossSiteScripting in next bit
    /* eslint-enable no-bitwise */
    return byte.toString(16); // Convert to hex string
}
/**
 * Retrieve the session state from the cookie that was set with the same cookie options.
 * If there is no match, fallback to the first cookie, (because that's how `getCookie()` works)
 * and this allows to keep the current session id when we release this feature.
 */
function retrieveSessionCookieFromEncodedCookie(cookieOptions) {
    const cookies = getCookies(SESSION_STORE_KEY);
    const opts = encodeCookieOptions(cookieOptions);
    let sessionState;
    // reverse the cookies so that if there is no match, the cookie returned is the first one
    for (const cookie of cookies.reverse()) {
        sessionState = toSessionState(cookie);
        if (sessionState.c === opts) {
            break;
        }
    }
    // remove the cookie options from the session state as this is not part of the session state
    sessionState === null || sessionState === void 0 ? true : delete sessionState.c;
    return sessionState !== null && sessionState !== void 0 ? sessionState : {};
}

const LOCAL_STORAGE_TEST_KEY = '_dd_test_';
function selectLocalStorageStrategy() {
    try {
        const id = generateUUID();
        const testKey = `${LOCAL_STORAGE_TEST_KEY}${id}`;
        localStorage.setItem(testKey, id);
        const retrievedId = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        return id === retrievedId ? { type: SessionPersistence.LOCAL_STORAGE } : undefined;
    }
    catch (_a) {
        return undefined;
    }
}
function initLocalStorageStrategy(configuration) {
    return {
        isLockEnabled: false,
        persistSession: persistInLocalStorage,
        retrieveSession: retrieveSessionFromLocalStorage,
        expireSession: (sessionState) => expireSessionFromLocalStorage(sessionState, configuration),
    };
}
function persistInLocalStorage(sessionState) {
    localStorage.setItem(SESSION_STORE_KEY, toSessionString(sessionState));
}
function retrieveSessionFromLocalStorage() {
    const sessionString = localStorage.getItem(SESSION_STORE_KEY);
    return toSessionState(sessionString);
}
function expireSessionFromLocalStorage(previousSessionState, configuration) {
    persistInLocalStorage(getExpiredSessionState(previousSessionState, configuration));
}

const LOCK_RETRY_DELAY = 10;
const LOCK_MAX_TRIES = 100;
// Locks should be hold for a few milliseconds top, just the time it takes to read and write a
// cookie. Using one second should be enough in most situations.
const LOCK_EXPIRATION_DELAY = ONE_SECOND;
const LOCK_SEPARATOR = '--';
const bufferedOperations = [];
let ongoingOperations;
function processSessionStoreOperations(operations, sessionStoreStrategy, numberOfRetries = 0) {
    var _a;
    const { isLockEnabled, persistSession, expireSession } = sessionStoreStrategy;
    const persistWithLock = (session) => persistSession({ ...session, lock: currentLock });
    const retrieveStore = () => {
        const { lock, ...session } = sessionStoreStrategy.retrieveSession();
        return {
            session,
            lock: lock && !isLockExpired(lock) ? lock : undefined,
        };
    };
    if (!ongoingOperations) {
        ongoingOperations = operations;
    }
    if (operations !== ongoingOperations) {
        bufferedOperations.push(operations);
        return;
    }
    if (isLockEnabled && numberOfRetries >= LOCK_MAX_TRIES) {
        next(sessionStoreStrategy);
        return;
    }
    let currentLock;
    let currentStore = retrieveStore();
    if (isLockEnabled) {
        // if someone has lock, retry later
        if (currentStore.lock) {
            retryLater(operations, sessionStoreStrategy, numberOfRetries);
            return;
        }
        // acquire lock
        currentLock = createLock();
        persistWithLock(currentStore.session);
        // if lock is not acquired, retry later
        currentStore = retrieveStore();
        if (currentStore.lock !== currentLock) {
            retryLater(operations, sessionStoreStrategy, numberOfRetries);
            return;
        }
    }
    let processedSession = operations.process(currentStore.session);
    if (isLockEnabled) {
        // if lock corrupted after process, retry later
        currentStore = retrieveStore();
        if (currentStore.lock !== currentLock) {
            retryLater(operations, sessionStoreStrategy, numberOfRetries);
            return;
        }
    }
    if (processedSession) {
        if (isSessionInExpiredState(processedSession)) {
            expireSession(processedSession);
        }
        else {
            expandSessionState(processedSession);
            if (isLockEnabled) {
                persistWithLock(processedSession);
            }
            else {
                persistSession(processedSession);
            }
        }
    }
    if (isLockEnabled) {
        // correctly handle lock around expiration would require to handle this case properly at several levels
        // since we don't have evidence of lock issues around expiration, let's just not do the corruption check for it
        if (!(processedSession && isSessionInExpiredState(processedSession))) {
            // if lock corrupted after persist, retry later
            currentStore = retrieveStore();
            if (currentStore.lock !== currentLock) {
                retryLater(operations, sessionStoreStrategy, numberOfRetries);
                return;
            }
            persistSession(currentStore.session);
            processedSession = currentStore.session;
        }
    }
    // call after even if session is not persisted in order to perform operations on
    // up-to-date session state value => the value could have been modified by another tab
    (_a = operations.after) === null || _a === void 0 ? void 0 : _a.call(operations, processedSession || currentStore.session);
    next(sessionStoreStrategy);
}
function retryLater(operations, sessionStore, currentNumberOfRetries) {
    setTimeout$1(() => {
        processSessionStoreOperations(operations, sessionStore, currentNumberOfRetries + 1);
    }, LOCK_RETRY_DELAY);
}
function next(sessionStore) {
    ongoingOperations = undefined;
    const nextOperations = bufferedOperations.shift();
    if (nextOperations) {
        processSessionStoreOperations(nextOperations, sessionStore);
    }
}
function createLock() {
    return generateUUID() + LOCK_SEPARATOR + timeStampNow();
}
function isLockExpired(lock) {
    const [, timeStamp] = lock.split(LOCK_SEPARATOR);
    return !timeStamp || elapsed(Number(timeStamp), timeStampNow()) > LOCK_EXPIRATION_DELAY;
}

/**
 * Key used to store session state in the global object.
 * This allows RUM and Logs SDKs to share the same session when using memory storage.
 */
const MEMORY_SESSION_STORE_KEY = '_DD_SESSION';
function selectMemorySessionStoreStrategy() {
    return { type: SessionPersistence.MEMORY };
}
function initMemorySessionStoreStrategy(configuration) {
    return {
        expireSession: (sessionState) => expireSessionFromMemory(sessionState, configuration),
        isLockEnabled: false,
        persistSession: persistInMemory,
        retrieveSession: retrieveFromMemory,
    };
}
function retrieveFromMemory() {
    const globalObject = getGlobalObject();
    if (!globalObject[MEMORY_SESSION_STORE_KEY]) {
        globalObject[MEMORY_SESSION_STORE_KEY] = {};
    }
    return shallowClone(globalObject[MEMORY_SESSION_STORE_KEY]);
}
function persistInMemory(state) {
    const globalObject = getGlobalObject();
    globalObject[MEMORY_SESSION_STORE_KEY] = shallowClone(state);
}
function expireSessionFromMemory(previousSessionState, configuration) {
    persistInMemory(getExpiredSessionState(previousSessionState, configuration));
}

/**
 * Every second, the storage will be polled to check for any change that can occur
 * to the session state in another browser tab, or another window.
 * This value has been determined from our previous cookie-only implementation.
 */
const STORAGE_POLL_DELAY = ONE_SECOND;
/**
 * Selects the correct session store strategy type based on the configuration and storage
 * availability. When an array is provided, tries each persistence type in order until one
 * successfully initializes.
 */
function selectSessionStoreStrategyType(initConfiguration) {
    const { sessionPersistence } = initConfiguration;
    const persistenceList = normalizePersistenceList(sessionPersistence, initConfiguration);
    for (const persistence of persistenceList) {
        const strategyType = selectStrategyForPersistence(persistence, initConfiguration);
        if (strategyType !== undefined) {
            return strategyType;
        }
    }
    return undefined;
}
function normalizePersistenceList(sessionPersistence, initConfiguration) {
    if (Array.isArray(sessionPersistence)) {
        return sessionPersistence;
    }
    if (sessionPersistence !== undefined) {
        return [sessionPersistence];
    }
    // Legacy default behavior: cookie first, with optional localStorage fallback
    return initConfiguration.allowFallbackToLocalStorage
        ? [SessionPersistence.COOKIE, SessionPersistence.LOCAL_STORAGE]
        : [SessionPersistence.COOKIE];
}
function selectStrategyForPersistence(persistence, initConfiguration) {
    switch (persistence) {
        case SessionPersistence.COOKIE:
            return selectCookieStrategy(initConfiguration);
        case SessionPersistence.LOCAL_STORAGE:
            return selectLocalStorageStrategy();
        case SessionPersistence.MEMORY:
            return selectMemorySessionStoreStrategy();
        default:
            display.error(`Invalid session persistence '${String(persistence)}'`);
            return undefined;
    }
}
function getSessionStoreStrategy(sessionStoreStrategyType, configuration) {
    return sessionStoreStrategyType.type === SessionPersistence.COOKIE
        ? initCookieStrategy(configuration, sessionStoreStrategyType.cookieOptions)
        : sessionStoreStrategyType.type === SessionPersistence.LOCAL_STORAGE
            ? initLocalStorageStrategy(configuration)
            : initMemorySessionStoreStrategy(configuration);
}
/**
 * Different session concepts:
 * - tracked, the session has an id and is updated along the user navigation
 * - not tracked, the session does not have an id but it is updated along the user navigation
 * - inactive, no session in store or session expired, waiting for a renew session
 */
function startSessionStore(sessionStoreStrategyType, configuration, productKey, computeTrackingType, sessionStoreStrategy = getSessionStoreStrategy(sessionStoreStrategyType, configuration)) {
    const renewObservable = new Observable();
    const expireObservable = new Observable();
    const sessionStateUpdateObservable = new Observable();
    const watchSessionTimeoutId = setInterval(watchSession, STORAGE_POLL_DELAY);
    let sessionCache;
    startSession();
    const { throttled: throttledExpandOrRenewSession, cancel: cancelExpandOrRenewSession } = throttle(() => {
        processSessionStoreOperations({
            process: (sessionState) => {
                if (isSessionInNotStartedState(sessionState)) {
                    return;
                }
                const synchronizedSession = synchronizeSession(sessionState);
                expandOrRenewSessionState(synchronizedSession);
                return synchronizedSession;
            },
            after: (sessionState) => {
                if (isSessionStarted(sessionState) && !hasSessionInCache()) {
                    renewSessionInCache(sessionState);
                }
                sessionCache = sessionState;
            },
        }, sessionStoreStrategy);
    }, STORAGE_POLL_DELAY);
    function expandSession() {
        processSessionStoreOperations({
            process: (sessionState) => (hasSessionInCache() ? synchronizeSession(sessionState) : undefined),
        }, sessionStoreStrategy);
    }
    /**
     * allows two behaviors:
     * - if the session is active, synchronize the session cache without updating the session store
     * - if the session is not active, clear the session store and expire the session cache
     */
    function watchSession() {
        const sessionState = sessionStoreStrategy.retrieveSession();
        if (isSessionInExpiredState(sessionState)) {
            processSessionStoreOperations({
                process: (sessionState) => isSessionInExpiredState(sessionState) ? getExpiredSessionState(sessionState, configuration) : undefined,
                after: synchronizeSession,
            }, sessionStoreStrategy);
        }
        else {
            synchronizeSession(sessionState);
        }
    }
    function synchronizeSession(sessionState) {
        if (isSessionInExpiredState(sessionState)) {
            sessionState = getExpiredSessionState(sessionState, configuration);
        }
        if (hasSessionInCache()) {
            if (isSessionInCacheOutdated(sessionState)) {
                expireSessionInCache();
            }
            else {
                sessionStateUpdateObservable.notify({ previousState: sessionCache, newState: sessionState });
                sessionCache = sessionState;
            }
        }
        return sessionState;
    }
    function startSession() {
        processSessionStoreOperations({
            process: (sessionState) => {
                if (isSessionInNotStartedState(sessionState)) {
                    sessionState.anonymousId = generateUUID();
                    return getExpiredSessionState(sessionState, configuration);
                }
            },
            after: (sessionState) => {
                sessionCache = sessionState;
            },
        }, sessionStoreStrategy);
    }
    function expandOrRenewSessionState(sessionState) {
        if (isSessionInNotStartedState(sessionState)) {
            return false;
        }
        const trackingType = computeTrackingType(sessionState[productKey]);
        sessionState[productKey] = trackingType;
        delete sessionState.isExpired;
        if (trackingType !== SESSION_NOT_TRACKED && !sessionState.id) {
            sessionState.id = generateUUID();
            sessionState.created = String(dateNow());
        }
    }
    function hasSessionInCache() {
        return (sessionCache === null || sessionCache === void 0 ? void 0 : sessionCache[productKey]) !== undefined;
    }
    function isSessionInCacheOutdated(sessionState) {
        return sessionCache.id !== sessionState.id || sessionCache[productKey] !== sessionState[productKey];
    }
    function expireSessionInCache() {
        sessionCache = getExpiredSessionState(sessionCache, configuration);
        expireObservable.notify();
    }
    function renewSessionInCache(sessionState) {
        sessionCache = sessionState;
        renewObservable.notify();
    }
    function updateSessionState(partialSessionState) {
        processSessionStoreOperations({
            process: (sessionState) => ({ ...sessionState, ...partialSessionState }),
            after: synchronizeSession,
        }, sessionStoreStrategy);
    }
    return {
        expandOrRenewSession: throttledExpandOrRenewSession,
        expandSession,
        getSession: () => sessionCache,
        renewObservable,
        expireObservable,
        sessionStateUpdateObservable,
        restartSession: startSession,
        expire: (hasConsent) => {
            cancelExpandOrRenewSession();
            if (hasConsent === false && sessionCache) {
                delete sessionCache.anonymousId;
            }
            sessionStoreStrategy.expireSession(sessionCache);
            synchronizeSession(getExpiredSessionState(sessionCache, configuration));
        },
        stop: () => {
            clearInterval(watchSessionTimeoutId);
        },
        updateSessionState,
    };
}

const TrackingConsent = {
    GRANTED: 'granted',
    NOT_GRANTED: 'not-granted',
};
function createTrackingConsentState(currentConsent) {
    const observable = new Observable();
    return {
        tryToInit(trackingConsent) {
            if (!currentConsent) {
                currentConsent = trackingConsent;
            }
        },
        update(trackingConsent) {
            currentConsent = trackingConsent;
            observable.notify();
        },
        isGranted() {
            return currentConsent === TrackingConsent.GRANTED;
        },
        observable,
    };
}

/**
 * Similar to `typeof`, but distinguish plain objects from `null` and arrays
 */
function getType(value) {
    if (value === null) {
        return 'null';
    }
    if (Array.isArray(value)) {
        return 'array';
    }
    return typeof value;
}
/**
 * Checks whether a value can have properties. Use this when you have an unknown value and you want
 * to access its properties as unknown. This is a friendly solution for dealing with unknown objects
 * in TypeScript.
 *
 * This function is intended to be used on values that will be used as "plain objects", i.e. not
 * Array, Date, RegExp or other class instances. But it's safe to use on any value.
 *
 * @example
 * ```
 * // Before:
 * if (typeof value === 'object' && value !== null && 'property' in value && typeof value.property === 'string') {
 *   // use value.property
 * }
 * // After:
 * if (isIndexableObject(value) && typeof value.property === 'string') {
 *   // use value.property
 * }
 * ```
 */
function isIndexableObject(value) {
    return getType(value) === 'object';
}

function isMatchOption(item) {
    const itemType = getType(item);
    return itemType === 'string' || itemType === 'function' || item instanceof RegExp;
}
/**
 * Returns true if value can be matched by at least one of the provided MatchOptions.
 * When comparing strings, setting useStartsWith to true will compare the value with the start of
 * the option, instead of requiring an exact match.
 */
function matchList(list, value, useStartsWith = false) {
    return list.some((item) => {
        try {
            if (typeof item === 'function') {
                return item(value);
            }
            else if (item instanceof RegExp) {
                return item.test(value);
            }
            else if (typeof item === 'string') {
                return useStartsWith ? value.startsWith(item) : item === value;
            }
        }
        catch (e) {
            display.error(e);
        }
        return false;
    });
}

const EXTENSION_PREFIXES = ['chrome-extension://', 'moz-extension://'];
function containsExtensionUrl(str) {
    return EXTENSION_PREFIXES.some((prefix) => str.includes(prefix));
}
/**
 * Utility function to detect if the SDK is being initialized in an unsupported browser extension environment.
 *
 * @param windowLocation - The current window location to check
 * @param stack - The error stack to check for extension URLs
 * @returns true if running in an unsupported browser extension environment
 */
function isUnsupportedExtensionEnvironment(windowLocation, stack = '') {
    // If the page itself is an extension page.
    if (containsExtensionUrl(windowLocation)) {
        return false;
    }
    // Since we generate the error on the init, we check the 2nd frame line.
    const frameLines = stack.split('\n').filter((line) => {
        const trimmedLine = line.trim();
        return trimmedLine.length && /^at\s+|@/.test(trimmedLine);
    });
    const target = frameLines[1] || '';
    return containsExtensionUrl(target);
}

const ERROR_DOES_NOT_HAVE_ALLOWED_TRACKING_ORIGIN = 'Running the Browser SDK in a Web extension content script is forbidden unless the `allowedTrackingOrigins` option is provided.';
const ERROR_NOT_ALLOWED_TRACKING_ORIGIN = 'SDK initialized on a non-allowed domain.';
function isAllowedTrackingOrigins(configuration, errorStack, windowOrigin = typeof location !== 'undefined' ? location.origin : '') {
    const allowedTrackingOrigins = configuration.allowedTrackingOrigins;
    if (!allowedTrackingOrigins) {
        if (isUnsupportedExtensionEnvironment(windowOrigin, errorStack)) {
            display.error(ERROR_DOES_NOT_HAVE_ALLOWED_TRACKING_ORIGIN);
            return false;
        }
        return true;
    }
    const isAllowed = matchList(allowedTrackingOrigins, windowOrigin);
    if (!isAllowed) {
        display.error(ERROR_NOT_ALLOWED_TRACKING_ORIGIN);
    }
    return isAllowed;
}

const INTAKE_SITE_STAGING = 'datad0g.com';
const INTAKE_SITE_FED_STAGING = 'dd0g-gov.com';
const INTAKE_SITE_US1 = 'datadoghq.com';
const INTAKE_SITE_EU1 = 'datadoghq.eu';
const INTAKE_SITE_US1_FED = 'ddog-gov.com';
const PCI_INTAKE_HOST_US1 = 'pci.browser-intake-datadoghq.com';
const INTAKE_URL_PARAMETERS = ['ddsource', 'dd-api-key', 'dd-request-id'];

function createEndpointBuilder(initConfiguration, trackType, extraParameters) {
    const buildUrlWithParameters = createEndpointUrlWithParametersBuilder(initConfiguration, trackType);
    return {
        build(api, payload) {
            const parameters = buildEndpointParameters(initConfiguration, trackType, api, payload, extraParameters);
            return buildUrlWithParameters(parameters);
        },
        trackType,
    };
}
/**
 * Create a function used to build a full endpoint url from provided parameters. The goal of this
 * function is to pre-compute some parts of the URL to avoid re-computing everything on every
 * request, as only parameters are changing.
 */
function createEndpointUrlWithParametersBuilder(initConfiguration, trackType) {
    const path = `/api/v2/${trackType}`;
    const proxy = initConfiguration.proxy;
    if (typeof proxy === 'string') {
        const normalizedProxyUrl = normalizeUrl(proxy);
        return (parameters) => `${normalizedProxyUrl}?ddforward=${encodeURIComponent(`${path}?${parameters}`)}`;
    }
    if (typeof proxy === 'function') {
        return (parameters) => proxy({ path, parameters });
    }
    const host = buildEndpointHost(trackType, initConfiguration);
    return (parameters) => `https://${host}${path}?${parameters}`;
}
function buildEndpointHost(trackType, initConfiguration) {
    const { site = INTAKE_SITE_US1, internalAnalyticsSubdomain } = initConfiguration;
    if (trackType === 'logs' && initConfiguration.usePciIntake && site === INTAKE_SITE_US1) {
        return PCI_INTAKE_HOST_US1;
    }
    if (internalAnalyticsSubdomain && site === INTAKE_SITE_US1) {
        return `${internalAnalyticsSubdomain}.${INTAKE_SITE_US1}`;
    }
    if (site === INTAKE_SITE_FED_STAGING) {
        return `http-intake.logs.${site}`;
    }
    const domainParts = site.split('.');
    const extension = domainParts.pop();
    return `browser-intake-${domainParts.join('-')}.${extension}`;
}
/**
 * Build parameters to be used for an intake request. Parameters should be re-built for each
 * request, as they change randomly.
 */
function buildEndpointParameters({ clientToken, internalAnalyticsSubdomain, source = 'browser' }, trackType, api, { retry, encoding }, extraParameters = []) {
    const parameters = [
        `ddsource=${source}`,
        `dd-api-key=${clientToken}`,
        `dd-evp-origin-version=${encodeURIComponent("6.27.1")}`,
        'dd-evp-origin=browser',
        `dd-request-id=${generateUUID()}`,
    ].concat(extraParameters);
    if (encoding) {
        parameters.push(`dd-evp-encoding=${encoding}`);
    }
    if (trackType === 'rum') {
        parameters.push(`batch_time=${timeStampNow()}`, `_dd.api=${api}`);
        if (retry) {
            parameters.push(`_dd.retry_count=${retry.count}`, `_dd.retry_after=${retry.lastFailureStatus}`);
        }
    }
    if (internalAnalyticsSubdomain) {
        parameters.reverse();
    }
    return parameters.join('&');
}

function computeTransportConfiguration(initConfiguration) {
    const site = initConfiguration.site || INTAKE_SITE_US1;
    const source = validateSource(initConfiguration.source);
    const endpointBuilders = computeEndpointBuilders({ ...initConfiguration, site, source });
    const replicaConfiguration = computeReplicaConfiguration({ ...initConfiguration, site, source });
    return {
        replica: replicaConfiguration,
        site,
        source,
        ...endpointBuilders,
    };
}
function validateSource(source) {
    if (source === 'flutter' || source === 'unity') {
        return source;
    }
    return 'browser';
}
function computeEndpointBuilders(initConfiguration) {
    return {
        logsEndpointBuilder: createEndpointBuilder(initConfiguration, 'logs'),
        rumEndpointBuilder: createEndpointBuilder(initConfiguration, 'rum'),
        profilingEndpointBuilder: createEndpointBuilder(initConfiguration, 'profile'),
        sessionReplayEndpointBuilder: createEndpointBuilder(initConfiguration, 'replay'),
        exposuresEndpointBuilder: createEndpointBuilder(initConfiguration, 'exposures'),
        flagEvaluationEndpointBuilder: createEndpointBuilder(initConfiguration, 'flagevaluation'),
    };
}
function computeReplicaConfiguration(initConfiguration) {
    if (!initConfiguration.replica) {
        return;
    }
    const replicaConfiguration = {
        ...initConfiguration,
        site: INTAKE_SITE_US1,
        clientToken: initConfiguration.replica.clientToken,
    };
    return {
        logsEndpointBuilder: createEndpointBuilder(replicaConfiguration, 'logs'),
        rumEndpointBuilder: createEndpointBuilder(replicaConfiguration, 'rum', [
            `application.id=${initConfiguration.replica.applicationId}`,
        ]),
    };
}
function isIntakeUrl(url) {
    // check if tags is present in the query string
    return INTAKE_URL_PARAMETERS.every((param) => url.includes(param));
}

/**
 * Default privacy level for the browser SDK.
 *
 * [Replay Privacy Options](https://docs.datadoghq.com/real_user_monitoring/session_replay/browser/privacy_options) for further information.
 */
const DefaultPrivacyLevel = {
    ALLOW: 'allow',
    MASK: 'mask',
    MASK_USER_INPUT: 'mask-user-input',
    MASK_UNLESS_ALLOWLISTED: 'mask-unless-allowlisted',
};
/**
 * Trace context injection option.
 *
 * See [Connect RUM and Traces](https://docs.datadoghq.com/real_user_monitoring/platform/connect_rum_and_traces/?tab=browserrum) for further information.
 */
const TraceContextInjection = {
    ALL: 'all',
    SAMPLED: 'sampled',
};
function isString(tag, tagName) {
    if (tag !== undefined && tag !== null && typeof tag !== 'string') {
        display.error(`${tagName} must be defined as a string`);
        return false;
    }
    return true;
}
function isDatadogSite(site) {
    if (site && typeof site === 'string' && !/(datadog|ddog|datad0g|dd0g)/.test(site)) {
        display.error(`Site should be a valid Datadog site. ${MORE_DETAILS} ${DOCS_ORIGIN}/getting_started/site/.`);
        return false;
    }
    return true;
}
function isSampleRate(sampleRate, name) {
    if (sampleRate !== undefined && !isPercentage(sampleRate)) {
        display.error(`${name} Sample Rate should be a number between 0 and 100`);
        return false;
    }
    return true;
}
function validateAndBuildConfiguration(initConfiguration, errorStack) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    if (!initConfiguration || !initConfiguration.clientToken) {
        display.error('Client Token is not configured, we will not send any data.');
        return;
    }
    if (initConfiguration.allowedTrackingOrigins !== undefined &&
        !Array.isArray(initConfiguration.allowedTrackingOrigins)) {
        display.error('Allowed Tracking Origins must be an array');
        return;
    }
    if (!isDatadogSite(initConfiguration.site) ||
        !isSampleRate(initConfiguration.sessionSampleRate, 'Session') ||
        !isSampleRate(initConfiguration.telemetrySampleRate, 'Telemetry') ||
        !isSampleRate(initConfiguration.telemetryConfigurationSampleRate, 'Telemetry Configuration') ||
        !isSampleRate(initConfiguration.telemetryUsageSampleRate, 'Telemetry Usage') ||
        !isString(initConfiguration.version, 'Version') ||
        !isString(initConfiguration.env, 'Env') ||
        !isString(initConfiguration.service, 'Service') ||
        !isAllowedTrackingOrigins(initConfiguration, errorStack !== null && errorStack !== void 0 ? errorStack : '')) {
        return;
    }
    if (initConfiguration.trackingConsent !== undefined &&
        !objectHasValue(TrackingConsent, initConfiguration.trackingConsent)) {
        display.error('Tracking Consent should be either "granted" or "not-granted"');
        return;
    }
    return {
        beforeSend: initConfiguration.beforeSend && catchUserErrors(initConfiguration.beforeSend, 'beforeSend threw an error:'),
        sessionStoreStrategyType: isWorkerEnvironment ? undefined : selectSessionStoreStrategyType(initConfiguration),
        sessionSampleRate: (_a = initConfiguration.sessionSampleRate) !== null && _a !== void 0 ? _a : 100,
        telemetrySampleRate: (_b = initConfiguration.telemetrySampleRate) !== null && _b !== void 0 ? _b : 20,
        telemetryConfigurationSampleRate: (_c = initConfiguration.telemetryConfigurationSampleRate) !== null && _c !== void 0 ? _c : 5,
        telemetryUsageSampleRate: (_d = initConfiguration.telemetryUsageSampleRate) !== null && _d !== void 0 ? _d : 5,
        service: (_e = initConfiguration.service) !== null && _e !== void 0 ? _e : undefined,
        env: (_f = initConfiguration.env) !== null && _f !== void 0 ? _f : undefined,
        version: (_g = initConfiguration.version) !== null && _g !== void 0 ? _g : undefined,
        datacenter: (_h = initConfiguration.datacenter) !== null && _h !== void 0 ? _h : undefined,
        silentMultipleInit: !!initConfiguration.silentMultipleInit,
        allowUntrustedEvents: !!initConfiguration.allowUntrustedEvents,
        trackingConsent: (_j = initConfiguration.trackingConsent) !== null && _j !== void 0 ? _j : TrackingConsent.GRANTED,
        trackAnonymousUser: (_k = initConfiguration.trackAnonymousUser) !== null && _k !== void 0 ? _k : true,
        storeContextsAcrossPages: !!initConfiguration.storeContextsAcrossPages,
        betaEncodeCookieOptions: !!initConfiguration.betaEncodeCookieOptions,
        /**
         * The source of the SDK, used for support plugins purposes.
         */
        variant: initConfiguration.variant,
        sdkVersion: initConfiguration.sdkVersion,
        ...computeTransportConfiguration(initConfiguration),
    };
}
function serializeConfiguration(initConfiguration) {
    return {
        session_sample_rate: initConfiguration.sessionSampleRate,
        telemetry_sample_rate: initConfiguration.telemetrySampleRate,
        telemetry_configuration_sample_rate: initConfiguration.telemetryConfigurationSampleRate,
        telemetry_usage_sample_rate: initConfiguration.telemetryUsageSampleRate,
        use_before_send: !!initConfiguration.beforeSend,
        use_partitioned_cross_site_session_cookie: initConfiguration.usePartitionedCrossSiteSessionCookie,
        use_secure_session_cookie: initConfiguration.useSecureSessionCookie,
        use_proxy: !!initConfiguration.proxy,
        silent_multiple_init: initConfiguration.silentMultipleInit,
        track_session_across_subdomains: initConfiguration.trackSessionAcrossSubdomains,
        track_anonymous_user: initConfiguration.trackAnonymousUser,
        session_persistence: Array.isArray(initConfiguration.sessionPersistence)
            ? initConfiguration.sessionPersistence[0]
            : initConfiguration.sessionPersistence,
        allow_fallback_to_local_storage: !!initConfiguration.allowFallbackToLocalStorage,
        store_contexts_across_pages: !!initConfiguration.storeContextsAcrossPages,
        allow_untrusted_events: !!initConfiguration.allowUntrustedEvents,
        tracking_consent: initConfiguration.trackingConsent,
        use_allowed_tracking_origins: Array.isArray(initConfiguration.allowedTrackingOrigins),
        beta_encode_cookie_options: initConfiguration.betaEncodeCookieOptions,
        source: initConfiguration.source,
        sdk_version: initConfiguration.sdkVersion,
        variant: initConfiguration.variant,
    };
}

/**
 * LIMITATION:
 * For NPM setup, this feature flag singleton is shared between RUM and Logs product.
 * This means that an experimental flag set on the RUM product will be set on the Logs product.
 * So keep in mind that in certain configurations, your experimental feature flag may affect other products.
 *
 * FORMAT:
 * All feature flags should be snake_cased
 */
// We want to use a real enum (i.e. not a const enum) here, to be able to check whether an arbitrary
// string is an expected feature flag
// eslint-disable-next-line no-restricted-syntax
var ExperimentalFeature;
(function (ExperimentalFeature) {
    ExperimentalFeature["TRACK_INTAKE_REQUESTS"] = "track_intake_requests";
    ExperimentalFeature["USE_TREE_WALKER_FOR_ACTION_NAME"] = "use_tree_walker_for_action_name";
    ExperimentalFeature["FEATURE_OPERATION_VITAL"] = "feature_operation_vital";
    ExperimentalFeature["SHORT_SESSION_INVESTIGATION"] = "short_session_investigation";
    ExperimentalFeature["AVOID_FETCH_KEEPALIVE"] = "avoid_fetch_keepalive";
    ExperimentalFeature["START_STOP_ACTION"] = "start_stop_action";
    ExperimentalFeature["USE_CHANGE_RECORDS"] = "use_change_records";
    ExperimentalFeature["SOURCE_CODE_CONTEXT"] = "source_code_context";
    ExperimentalFeature["LCP_SUBPARTS"] = "lcp_subparts";
})(ExperimentalFeature || (ExperimentalFeature = {}));
const enabledExperimentalFeatures = new Set();
function initFeatureFlags(enableExperimentalFeatures) {
    if (Array.isArray(enableExperimentalFeatures)) {
        addExperimentalFeatures(enableExperimentalFeatures.filter((flag) => objectHasValue(ExperimentalFeature, flag)));
    }
}
function addExperimentalFeatures(enabledFeatures) {
    enabledFeatures.forEach((flag) => {
        enabledExperimentalFeatures.add(flag);
    });
}
function isExperimentalFeatureEnabled(featureName) {
    return enabledExperimentalFeatures.has(featureName);
}
function getExperimentalFeatures() {
    return enabledExperimentalFeatures;
}

/**
 * Cross-browser stack trace computation.
 *
 * Reference implementation: https://github.com/csnover/TraceKit/blob/04530298073c3823de72deb0b97e7b38ca7bcb59/tracekit.js
 */
const UNKNOWN_FUNCTION = '?';
function computeStackTrace(ex) {
    var _a, _b;
    const stack = [];
    let stackProperty = tryToGetString(ex, 'stack');
    const exString = String(ex);
    if (stackProperty && stackProperty.startsWith(exString)) {
        stackProperty = stackProperty.slice(exString.length);
    }
    if (stackProperty) {
        stackProperty.split('\n').forEach((line) => {
            const stackFrame = parseChromeLine(line) || parseChromeAnonymousLine(line) || parseWinLine(line) || parseGeckoLine(line);
            if (stackFrame) {
                if (!stackFrame.func && stackFrame.line) {
                    stackFrame.func = UNKNOWN_FUNCTION;
                }
                stack.push(stackFrame);
            }
        });
    }
    if (stack.length > 0 && isWronglyReportingCustomErrors() && ex instanceof Error) {
        // if we are wrongly reporting custom errors
        const constructors = [];
        // go through each inherited constructor
        let currentPrototype = ex;
        while ((currentPrototype = Object.getPrototypeOf(currentPrototype)) &&
            isNonNativeClassPrototype(currentPrototype)) {
            const constructorName = ((_a = currentPrototype.constructor) === null || _a === void 0 ? void 0 : _a.name) || UNKNOWN_FUNCTION;
            constructors.push(constructorName);
        }
        // traverse the stacktrace in reverse order because the stacktrace starts with the last inherited constructor
        // we check constructor names to ensure we remove the correct frame (and there isn't a weird unsupported environment behavior)
        for (let i = constructors.length - 1; i >= 0 && ((_b = stack[0]) === null || _b === void 0 ? void 0 : _b.func) === constructors[i]; i--) {
            // if the first stack frame is the custom error constructor
            // null stack frames may represent frames that failed to be parsed because the error class did not have a constructor
            stack.shift(); // remove it
        }
    }
    return {
        message: tryToGetString(ex, 'message'),
        name: tryToGetString(ex, 'name'),
        stack,
    };
}
const fileUrl = '((?:file|https?|blob|chrome-extension|electron|native|eval|webpack|snippet|<anonymous>|\\w+\\.|\\/).*?)';
const filePosition = '(?::(\\d+))';
const CHROME_LINE_RE = new RegExp(`^\\s*at (.*?) ?\\(${fileUrl}${filePosition}?${filePosition}?\\)?\\s*$`, 'i');
const CHROME_EVAL_RE = new RegExp(`\\((\\S*)${filePosition}${filePosition}\\)`);
function parseChromeLine(line) {
    const parts = CHROME_LINE_RE.exec(line);
    if (!parts) {
        return;
    }
    const isNative = parts[2] && parts[2].indexOf('native') === 0; // start of line
    const isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line
    const submatch = CHROME_EVAL_RE.exec(parts[2]);
    if (isEval && submatch) {
        // throw out eval line/column and use top-most line/column number
        parts[2] = submatch[1]; // url
        parts[3] = submatch[2]; // line
        parts[4] = submatch[3]; // column
    }
    return {
        args: isNative ? [parts[2]] : [],
        column: parts[4] ? +parts[4] : undefined,
        func: parts[1] || UNKNOWN_FUNCTION,
        line: parts[3] ? +parts[3] : undefined,
        url: !isNative ? parts[2] : undefined,
    };
}
const htmlAnonymousPart = '(?:(.*)?(?: @))';
const CHROME_ANONYMOUS_FUNCTION_RE = new RegExp(`^\\s*at\\s*${htmlAnonymousPart}?\\s*${fileUrl}${filePosition}?${filePosition}??\\s*$`, 'i');
function parseChromeAnonymousLine(line) {
    const parts = CHROME_ANONYMOUS_FUNCTION_RE.exec(line);
    if (!parts) {
        return;
    }
    return {
        args: [],
        column: parts[4] ? +parts[4] : undefined,
        func: parts[1] || UNKNOWN_FUNCTION,
        line: parts[3] ? +parts[3] : undefined,
        url: parts[2],
    };
}
const WINJS_LINE_RE = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
function parseWinLine(line) {
    const parts = WINJS_LINE_RE.exec(line);
    if (!parts) {
        return;
    }
    return {
        args: [],
        column: parts[4] ? +parts[4] : undefined,
        func: parts[1] || UNKNOWN_FUNCTION,
        line: +parts[3],
        url: parts[2],
    };
}
const GECKO_LINE_RE = /^\s*(.*?)(?:\((.*?)\))?(?:(?:(?:^|@)((?:file|https?|blob|chrome|webpack|resource|capacitor|\[native).*?|[^@]*bundle|\[wasm code\])(?::(\d+))?(?::(\d+))?)|@)\s*$/i;
const GECKO_EVAL_RE = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
function parseGeckoLine(line) {
    const parts = GECKO_LINE_RE.exec(line);
    if (!parts) {
        return;
    }
    const isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
    const submatch = GECKO_EVAL_RE.exec(parts[3]);
    if (isEval && submatch) {
        // throw out eval line/column and use top-most line number
        parts[3] = submatch[1];
        parts[4] = submatch[2];
        parts[5] = undefined; // no column when eval
    }
    return {
        args: parts[2] ? parts[2].split(',') : [],
        column: parts[5] ? +parts[5] : undefined,
        func: parts[1] || UNKNOWN_FUNCTION,
        line: parts[4] ? +parts[4] : undefined,
        url: parts[3],
    };
}
function tryToGetString(candidate, property) {
    return isIndexableObject(candidate) && typeof candidate[property] === 'string' ? candidate[property] : undefined;
}
function computeStackTraceFromOnErrorMessage(messageObj, url, line, column) {
    if (url === undefined) {
        return;
    }
    const { name, message } = tryToParseMessage(messageObj);
    return {
        name,
        message,
        stack: [{ url, column, line }],
    };
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Error_types
const ERROR_TYPES_RE = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?([\s\S]*)$/;
function tryToParseMessage(messageObj) {
    let name;
    let message;
    if ({}.toString.call(messageObj) === '[object String]') {
        [, name, message] = ERROR_TYPES_RE.exec(messageObj);
    }
    return { name, message };
}
// Custom error stacktrace fix
// Some browsers (safari/firefox) add the error constructor as a frame in the stacktrace
// In order to normalize the stacktrace, we need to remove it
function isNonNativeClassPrototype(prototype) {
    return String(prototype.constructor).startsWith('class ');
}
let isWronglyReportingCustomErrorsCache;
function isWronglyReportingCustomErrors() {
    if (isWronglyReportingCustomErrorsCache !== undefined) {
        return isWronglyReportingCustomErrorsCache;
    }
    /* eslint-disable no-restricted-syntax */
    class DatadogTestCustomError extends Error {
        constructor() {
            super();
            this.name = 'Error'; // set name to Error so that no browser would default to the constructor name
        }
    }
    const [customError, nativeError] = [DatadogTestCustomError, Error].map((errConstructor) => new errConstructor()); // so that both errors should exactly have the same stacktrace
    isWronglyReportingCustomErrorsCache =
        // If customError is not a class, it means that this was built with ES5 as target, converting the class to a normal object.
        // Thus, error constructors will be reported on all browsers, which is the expected behavior.
        isNonNativeClassPrototype(Object.getPrototypeOf(customError)) &&
            // If the browser is correctly reporting the stacktrace, the normal error stacktrace should be the same as the custom error stacktrace
            nativeError.stack !== customError.stack;
    return isWronglyReportingCustomErrorsCache;
}

/**
 * Creates a stacktrace without SDK internal frames.
 * Constraints:
 * - Has to be called at the utmost position of the call stack.
 * - No monitored function should encapsulate it, that is why we need to use callMonitored inside it.
 */
function createHandlingStack(type) {
    /**
     * Skip the two internal frames:
     * - SDK API (console.error, ...)
     * - this function
     * in order to keep only the user calls
     */
    const internalFramesToSkip = 2;
    const error = new Error(type);
    error.name = 'HandlingStack';
    let formattedStack;
    callMonitored(() => {
        const stackTrace = computeStackTrace(error);
        stackTrace.stack = stackTrace.stack.slice(internalFramesToSkip);
        formattedStack = toStackTraceString(stackTrace);
    });
    return formattedStack;
}
function toStackTraceString(stack) {
    let result = formatErrorMessage(stack);
    stack.stack.forEach((frame) => {
        const func = frame.func === '?' ? '<anonymous>' : frame.func;
        const args = frame.args && frame.args.length > 0 ? `(${frame.args.join(', ')})` : '';
        const line = frame.line ? `:${frame.line}` : '';
        const column = frame.line && frame.column ? `:${frame.column}` : '';
        result += `\n  at ${func}${args} @ ${frame.url}${line}${column}`;
    });
    return result;
}
function formatErrorMessage(stack) {
    return `${stack.name || 'Error'}: ${stack.message}`;
}

/**
 * Instruments a method on a object, calling the given callback before the original method is
 * invoked. The callback receives an object with information about the method call.
 *
 * This function makes sure that we are "good citizens" regarding third party instrumentations: when
 * removing the instrumentation, the original method is usually restored, but if a third party
 * instrumentation was set after ours, we keep it in place and just replace our instrumentation with
 * a noop.
 *
 * Note: it is generally better to instrument methods that are "owned" by the object instead of ones
 * that are inherited from the prototype chain. Example:
 * * do:    `instrumentMethod(Array.prototype, 'push', ...)`
 * * don't: `instrumentMethod([], 'push', ...)`
 *
 * This method is also used to set event handler properties (ex: window.onerror = ...), as it has
 * the same requirements as instrumenting a method:
 * * if the event handler is already set by a third party, we need to call it and not just blindly
 * override it.
 * * if the event handler is set by a third party after us, we need to keep it in place when
 * removing ours.
 *
 * @example
 *
 *  instrumentMethod(window, 'fetch', ({ target, parameters, onPostCall }) => {
 *    console.log('Before calling fetch on', target, 'with parameters', parameters)
 *
 *    onPostCall((result) => {
 *      console.log('After fetch calling on', target, 'with parameters', parameters, 'and result', result)
 *    })
 *  })
 */
function instrumentMethod(targetPrototype, method, onPreCall, { computeHandlingStack } = {}) {
    let original = targetPrototype[method];
    if (typeof original !== 'function') {
        if (method in targetPrototype && typeof method === 'string' && method.startsWith('on')) {
            original = noop;
        }
        else {
            return { stop: noop };
        }
    }
    let stopped = false;
    const instrumentation = function () {
        if (stopped) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
            return original.apply(this, arguments);
        }
        const parameters = Array.from(arguments);
        let postCallCallback;
        callMonitored(onPreCall, null, [
            {
                target: this,
                parameters,
                onPostCall: (callback) => {
                    postCallCallback = callback;
                },
                handlingStack: computeHandlingStack ? createHandlingStack('instrumented method') : undefined,
            },
        ]);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const result = original.apply(this, parameters);
        if (postCallCallback) {
            callMonitored(postCallCallback, null, [result]);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return result;
    };
    targetPrototype[method] = instrumentation;
    return {
        stop: () => {
            stopped = true;
            // If the instrumentation has been removed by a third party, keep the last one
            if (targetPrototype[method] === instrumentation) {
                targetPrototype[method] = original;
            }
        },
    };
}
function instrumentSetter(targetPrototype, property, after) {
    const originalDescriptor = Object.getOwnPropertyDescriptor(targetPrototype, property);
    if (!originalDescriptor || !originalDescriptor.set || !originalDescriptor.configurable) {
        return { stop: noop };
    }
    const stoppedInstrumentation = noop;
    let instrumentation = (target, value) => {
        // put hooked setter into event loop to avoid of set latency
        setTimeout$1(() => {
            if (instrumentation !== stoppedInstrumentation) {
                after(target, value);
            }
        }, 0);
    };
    const instrumentationWrapper = function (value) {
        originalDescriptor.set.call(this, value);
        instrumentation(this, value);
    };
    Object.defineProperty(targetPrototype, property, {
        set: instrumentationWrapper,
    });
    return {
        stop: () => {
            var _a;
            if (((_a = Object.getOwnPropertyDescriptor(targetPrototype, property)) === null || _a === void 0 ? void 0 : _a.set) === instrumentationWrapper) {
                Object.defineProperty(targetPrototype, property, originalDescriptor);
            }
            instrumentation = stoppedInstrumentation;
        },
    };
}

const ONE_KIBI_BYTE = 1024;
const ONE_MEBI_BYTE = 1024 * ONE_KIBI_BYTE;
// eslint-disable-next-line no-control-regex
const HAS_MULTI_BYTES_CHARACTERS = /[^\u0000-\u007F]/;
function computeBytesCount(candidate) {
    // Accurate bytes count computations can degrade performances when there is a lot of events to process
    if (!HAS_MULTI_BYTES_CHARACTERS.test(candidate)) {
        return candidate.length;
    }
    if (window.TextEncoder !== undefined) {
        return new TextEncoder().encode(candidate).length;
    }
    return new Blob([candidate]).size;
}
function concatBuffers(buffers) {
    // Optimization: if there is a single buffer, no need to copy it
    if (buffers.length === 1) {
        return buffers[0];
    }
    const length = buffers.reduce((total, buffer) => total + buffer.length, 0);
    const result = new Uint8Array(length);
    let offset = 0;
    for (const buffer of buffers) {
        result.set(buffer, offset);
        offset += buffer.length;
    }
    return result;
}

/**
 * Custom implementation of JSON.stringify that ignores some toJSON methods. We need to do that
 * because some sites badly override toJSON on certain objects. Removing all toJSON methods from
 * nested values would be too costly, so we just detach them from the root value, and native classes
 * used to build JSON values (Array and Object).
 *
 * Note: this still assumes that JSON.stringify is correct.
 */
function jsonStringify(value, replacer, space) {
    if (typeof value !== 'object' || value === null) {
        return JSON.stringify(value);
    }
    // Note: The order matter here. We need to detach toJSON methods on parent classes before their
    // subclasses.
    const restoreObjectPrototypeToJson = detachToJsonMethod(Object.prototype);
    const restoreArrayPrototypeToJson = detachToJsonMethod(Array.prototype);
    const restoreValuePrototypeToJson = detachToJsonMethod(Object.getPrototypeOf(value));
    const restoreValueToJson = detachToJsonMethod(value);
    try {
        return JSON.stringify(value, replacer, space);
    }
    catch (_a) {
        return '<error: unable to serialize object>';
    }
    finally {
        restoreObjectPrototypeToJson();
        restoreArrayPrototypeToJson();
        restoreValuePrototypeToJson();
        restoreValueToJson();
    }
}
function detachToJsonMethod(value) {
    const object = value;
    const objectToJson = object.toJSON;
    if (objectToJson) {
        delete object.toJSON;
        return () => {
            object.toJSON = objectToJson;
        };
    }
    return noop;
}

// The maximum size of a single event is 256KiB. By default, we ensure that user-provided data
// going through sanitize fits inside our events, while leaving room for other contexts, metadata, ...
const SANITIZE_DEFAULT_MAX_CHARACTER_COUNT = 220 * ONE_KIBI_BYTE;
// Symbol for the root element of the JSONPath used for visited objects
const JSON_PATH_ROOT_ELEMENT = '$';
// When serializing (using JSON.stringify) a key of an object, { key: 42 } gets wrapped in quotes as "key".
// With the separator (:), we need to add 3 characters to the count.
const KEY_DECORATION_LENGTH = 3;
function sanitize(source, maxCharacterCount = SANITIZE_DEFAULT_MAX_CHARACTER_COUNT) {
    // Unbind any toJSON function we may have on [] or {} prototypes
    const restoreObjectPrototypeToJson = detachToJsonMethod(Object.prototype);
    const restoreArrayPrototypeToJson = detachToJsonMethod(Array.prototype);
    // Initial call to sanitizeProcessor - will populate containerQueue if source is an Array or a plain Object
    const containerQueue = [];
    const visitedObjectsWithPath = new WeakMap();
    const sanitizedData = sanitizeProcessor(source, JSON_PATH_ROOT_ELEMENT, undefined, containerQueue, visitedObjectsWithPath);
    const serializedSanitizedData = JSON.stringify(sanitizedData);
    let accumulatedCharacterCount = serializedSanitizedData ? serializedSanitizedData.length : 0;
    if (accumulatedCharacterCount > maxCharacterCount) {
        warnOverCharacterLimit(maxCharacterCount, 'discarded', source);
        return undefined;
    }
    while (containerQueue.length > 0 && accumulatedCharacterCount < maxCharacterCount) {
        const containerToProcess = containerQueue.shift();
        let separatorLength = 0; // 0 for the first element, 1 for subsequent elements
        // Arrays and Objects have to be handled distinctly to ensure
        // we do not pick up non-numerical properties from Arrays
        if (Array.isArray(containerToProcess.source)) {
            for (let key = 0; key < containerToProcess.source.length; key++) {
                const targetData = sanitizeProcessor(containerToProcess.source[key], containerToProcess.path, key, containerQueue, visitedObjectsWithPath);
                if (targetData !== undefined) {
                    accumulatedCharacterCount += JSON.stringify(targetData).length;
                }
                else {
                    // When an element of an Array (targetData) is undefined, it is serialized as null:
                    // JSON.stringify([undefined]) => '[null]' - This accounts for 4 characters
                    accumulatedCharacterCount += 4;
                }
                accumulatedCharacterCount += separatorLength;
                separatorLength = 1;
                if (accumulatedCharacterCount > maxCharacterCount) {
                    warnOverCharacterLimit(maxCharacterCount, 'truncated', source);
                    break;
                }
                containerToProcess.target[key] = targetData;
            }
        }
        else {
            for (const key in containerToProcess.source) {
                if (Object.prototype.hasOwnProperty.call(containerToProcess.source, key)) {
                    const targetData = sanitizeProcessor(containerToProcess.source[key], containerToProcess.path, key, containerQueue, visitedObjectsWithPath);
                    // When a property of an object has an undefined value, it will be dropped during serialization:
                    // JSON.stringify({a:undefined}) => '{}'
                    if (targetData !== undefined) {
                        accumulatedCharacterCount +=
                            JSON.stringify(targetData).length + separatorLength + key.length + KEY_DECORATION_LENGTH;
                        separatorLength = 1;
                    }
                    if (accumulatedCharacterCount > maxCharacterCount) {
                        warnOverCharacterLimit(maxCharacterCount, 'truncated', source);
                        break;
                    }
                    containerToProcess.target[key] = targetData;
                }
            }
        }
    }
    // Rebind detached toJSON functions
    restoreObjectPrototypeToJson();
    restoreArrayPrototypeToJson();
    return sanitizedData;
}
/**
 * Internal function to factorize the process common to the
 * initial call to sanitize, and iterations for Arrays and Objects
 *
 */
function sanitizeProcessor(source, parentPath, key, queue, visitedObjectsWithPath) {
    // Start by handling toJSON, as we want to sanitize its output
    const sourceToSanitize = tryToApplyToJSON(source);
    if (!sourceToSanitize || typeof sourceToSanitize !== 'object') {
        return sanitizePrimitivesAndFunctions(sourceToSanitize);
    }
    const sanitizedSource = sanitizeObjects(sourceToSanitize);
    if (sanitizedSource !== '[Object]' && sanitizedSource !== '[Array]' && sanitizedSource !== '[Error]') {
        return sanitizedSource;
    }
    // Handle potential cyclic references
    // We need to use source as sourceToSanitize could be a reference to a new object
    // At this stage, we know the source is an object type
    const sourceAsObject = source;
    if (visitedObjectsWithPath.has(sourceAsObject)) {
        return `[Reference seen at ${visitedObjectsWithPath.get(sourceAsObject)}]`;
    }
    // Add processed source to queue
    const currentPath = key !== undefined ? `${parentPath}.${key}` : parentPath;
    const target = Array.isArray(sourceToSanitize) ? [] : {};
    visitedObjectsWithPath.set(sourceAsObject, currentPath);
    queue.push({ source: sourceToSanitize, target, path: currentPath });
    return target;
}
/**
 * Handles sanitization of simple, non-object types
 *
 */
function sanitizePrimitivesAndFunctions(value) {
    // BigInt cannot be serialized by JSON.stringify(), convert it to a string representation
    if (typeof value === 'bigint') {
        return `[BigInt] ${value.toString()}`;
    }
    // Functions cannot be serialized by JSON.stringify(). Moreover, if a faulty toJSON is present, it needs to be converted
    // so it won't prevent stringify from serializing later
    if (typeof value === 'function') {
        return `[Function] ${value.name || 'unknown'}`;
    }
    // JSON.stringify() does not serialize symbols.
    if (typeof value === 'symbol') {
        return `[Symbol] ${value.description || value.toString()}`;
    }
    return value;
}
/**
 * Handles sanitization of object types
 *
 * LIMITATIONS
 * - If a class defines a toStringTag Symbol, it will fall in the catch-all method and prevent enumeration of properties.
 * To avoid this, a toJSON method can be defined.
 */
function sanitizeObjects(value) {
    try {
        if (value instanceof Event) {
            return sanitizeEvent(value);
        }
        if (value instanceof RegExp) {
            return `[RegExp] ${value.toString()}`;
        }
        // Handle all remaining object types in a generic way
        const result = Object.prototype.toString.call(value);
        const match = result.match(/\[object (.*)\]/);
        if (match && match[1]) {
            return `[${match[1]}]`;
        }
    }
    catch (_a) {
        // If the previous serialization attempts failed, and we cannot convert using
        // Object.prototype.toString, declare the value unserializable
    }
    return '[Unserializable]';
}
function sanitizeEvent(event) {
    return {
        type: event.type,
        isTrusted: event.isTrusted,
        currentTarget: event.currentTarget ? sanitizeObjects(event.currentTarget) : null,
        target: event.target ? sanitizeObjects(event.target) : null,
    };
}
/**
 * Checks if a toJSON function exists and tries to execute it
 *
 */
function tryToApplyToJSON(value) {
    const object = value;
    if (object && typeof object.toJSON === 'function') {
        try {
            return object.toJSON();
        }
        catch (_a) {
            // If toJSON fails, we continue by trying to serialize the value manually
        }
    }
    return value;
}
/**
 * Helper function to display the warning when the accumulated character count is over the limit
 */
function warnOverCharacterLimit(maxCharacterCount, changeType, source) {
    display.warn(`The data provided has been ${changeType} as it is over the limit of ${maxCharacterCount} characters:`, source);
}

const NO_ERROR_STACK_PRESENT_MESSAGE = 'No stack, consider using an instance of Error';
function computeErrorBase({ originalError, stackTrace, source, useFallbackStack = true, nonErrorPrefix, }) {
    const isErrorInstance = isError(originalError);
    if (!stackTrace && isErrorInstance) {
        stackTrace = computeStackTrace(originalError);
    }
    return {
        source,
        type: stackTrace ? stackTrace.name : undefined,
        message: computeMessage(stackTrace, isErrorInstance, nonErrorPrefix, originalError),
        stack: stackTrace ? toStackTraceString(stackTrace) : useFallbackStack ? NO_ERROR_STACK_PRESENT_MESSAGE : undefined,
    };
}
function computeRawError({ stackTrace, originalError, handlingStack, componentStack, startClocks, nonErrorPrefix, useFallbackStack = true, source, handling, }) {
    const errorBase = computeErrorBase({ originalError, stackTrace, source, useFallbackStack, nonErrorPrefix });
    return {
        startClocks,
        handling,
        handlingStack,
        componentStack,
        originalError,
        ...errorBase,
        causes: isError(originalError) ? flattenErrorCauses(originalError, source) : undefined,
        fingerprint: tryToGetFingerprint(originalError),
        context: tryToGetErrorContext(originalError),
    };
}
function computeMessage(stackTrace, isErrorInstance, nonErrorPrefix, originalError) {
    // Favor stackTrace message only if tracekit has really been able to extract something meaningful (message + name)
    // TODO rework tracekit integration to avoid scattering error building logic
    return (stackTrace === null || stackTrace === void 0 ? void 0 : stackTrace.message) && (stackTrace === null || stackTrace === void 0 ? void 0 : stackTrace.name)
        ? stackTrace.message
        : !isErrorInstance
            ? nonErrorPrefix
                ? `${nonErrorPrefix} ${jsonStringify(sanitize(originalError))}`
                : jsonStringify(sanitize(originalError))
            : 'Empty message';
}
function tryToGetFingerprint(originalError) {
    return isError(originalError) && 'dd_fingerprint' in originalError ? String(originalError.dd_fingerprint) : undefined;
}
function tryToGetErrorContext(originalError) {
    if (isIndexableObject(originalError)) {
        return originalError.dd_context;
    }
}
function isError(error) {
    return error instanceof Error || Object.prototype.toString.call(error) === '[object Error]';
}
function flattenErrorCauses(error, parentSource) {
    const causes = [];
    let currentCause = error.cause;
    while (currentCause !== undefined && currentCause !== null && causes.length < 10) {
        const causeBase = computeErrorBase({
            originalError: currentCause,
            source: parentSource,
            useFallbackStack: false,
        });
        causes.push(causeBase);
        currentCause = isError(currentCause) ? currentCause.cause : undefined;
    }
    return causes.length ? causes : undefined;
}

const ErrorSource = {
    AGENT: 'agent',
    CONSOLE: 'console',
    CUSTOM: 'custom',
    LOGGER: 'logger',
    NETWORK: 'network',
    SOURCE: 'source',
    REPORT: 'report',
};

function trackRuntimeError() {
    return new Observable((observer) => {
        const handleRuntimeError = (originalError, stackTrace) => {
            const rawError = computeRawError({
                stackTrace,
                originalError,
                startClocks: clocksNow(),
                nonErrorPrefix: "Uncaught" /* NonErrorPrefix.UNCAUGHT */,
                source: ErrorSource.SOURCE,
                handling: "unhandled" /* ErrorHandling.UNHANDLED */,
            });
            observer.notify(rawError);
        };
        const { stop: stopInstrumentingOnError } = instrumentOnError(handleRuntimeError);
        const { stop: stopInstrumentingOnUnhandledRejection } = instrumentUnhandledRejection(handleRuntimeError);
        return () => {
            stopInstrumentingOnError();
            stopInstrumentingOnUnhandledRejection();
        };
    });
}
function instrumentOnError(callback) {
    return instrumentMethod(getGlobalObject(), 'onerror', ({ parameters: [messageObj, url, line, column, errorObj] }) => {
        let stackTrace;
        if (!isError(errorObj)) {
            stackTrace = computeStackTraceFromOnErrorMessage(messageObj, url, line, column);
        }
        callback(errorObj !== null && errorObj !== void 0 ? errorObj : messageObj, stackTrace);
    });
}
function instrumentUnhandledRejection(callback) {
    return instrumentMethod(getGlobalObject(), 'onunhandledrejection', ({ parameters: [e] }) => {
        callback(e.reason || 'Empty reason');
    });
}

function makePublicApi(stub) {
    const publicApi = {
        version: "6.27.1",
        // This API method is intentionally not monitored, since the only thing executed is the
        // user-provided 'callback'.  All SDK usages executed in the callback should be monitored, and
        // we don't want to interfere with the user uncaught exceptions.
        onReady(callback) {
            callback();
        },
        ...stub,
    };
    // Add a "hidden" property to set debug mode. We define it that way to hide it
    // as much as possible but of course it's not a real protection.
    Object.defineProperty(publicApi, '_setDebug', {
        get() {
            return setDebugMode;
        },
        enumerable: false,
    });
    return publicApi;
}
function defineGlobal(global, name, api) {
    const existingGlobalVariable = global[name];
    if (existingGlobalVariable && !existingGlobalVariable.q && existingGlobalVariable.version) {
        display.warn('SDK is loaded more than once. This is unsupported and might have unexpected behavior.');
    }
    global[name] = api;
    if (existingGlobalVariable && existingGlobalVariable.q) {
        existingGlobalVariable.q.forEach((fn) => catchUserErrors(fn, 'onReady callback threw an error:')());
    }
}

function displayAlreadyInitializedError(sdkName, initConfiguration) {
    if (!initConfiguration.silentMultipleInit) {
        display.error(`${sdkName} is already initialized.`);
    }
}

/**
 * Add an event listener to an event target object (Window, Element, mock object...).  This provides
 * a few conveniences compared to using `element.addEventListener` directly:
 *
 * * supports IE11 by: using an option object only if needed and emulating the `once` option
 *
 * * wraps the listener with a `monitor` function
 *
 * * returns a `stop` function to remove the listener
 */
function addEventListener(configuration, eventTarget, eventName, listener, options) {
    return addEventListeners(configuration, eventTarget, [eventName], listener, options);
}
/**
 * Add event listeners to an event target object (Window, Element, mock object...).  This provides
 * a few conveniences compared to using `element.addEventListener` directly:
 *
 * * supports IE11 by: using an option object only if needed and emulating the `once` option
 *
 * * wraps the listener with a `monitor` function
 *
 * * returns a `stop` function to remove the listener
 *
 * * with `once: true`, the listener will be called at most once, even if different events are listened
 */
function addEventListeners(configuration, eventTarget, eventNames, listener, { once, capture, passive } = {}) {
    const listenerWithMonitor = monitor((event) => {
        if (!event.isTrusted && !event.__ddIsTrusted && !configuration.allowUntrustedEvents) {
            return;
        }
        if (once) {
            stop();
        }
        listener(event);
    });
    const options = passive ? { capture, passive } : capture;
    // Use the window.EventTarget.prototype when possible to avoid wrong overrides (e.g: https://github.com/salesforce/lwc/issues/1824)
    const listenerTarget = window.EventTarget && eventTarget instanceof EventTarget ? window.EventTarget.prototype : eventTarget;
    const add = getZoneJsOriginalValue(listenerTarget, 'addEventListener');
    eventNames.forEach((eventName) => add.call(eventTarget, eventName, listenerWithMonitor, options));
    function stop() {
        const remove = getZoneJsOriginalValue(listenerTarget, 'removeEventListener');
        eventNames.forEach((eventName) => remove.call(eventTarget, eventName, listenerWithMonitor, options));
    }
    return {
        stop,
    };
}

const RawReportType = {
    intervention: 'intervention',
    cspViolation: 'csp_violation',
};
function initReportObservable(configuration, apis) {
    const observables = [];
    if (apis.includes(RawReportType.cspViolation)) {
        observables.push(createCspViolationReportObservable(configuration));
    }
    const reportTypes = apis.filter((api) => api !== RawReportType.cspViolation);
    if (reportTypes.length) {
        observables.push(createReportObservable(reportTypes));
    }
    return mergeObservables(...observables);
}
function createReportObservable(reportTypes) {
    return new Observable((observable) => {
        if (!window.ReportingObserver) {
            return;
        }
        const handleReports = monitor((reports, _) => reports.forEach((report) => observable.notify(buildRawReportErrorFromReport(report))));
        const observer = new window.ReportingObserver(handleReports, {
            types: reportTypes,
            buffered: true,
        });
        observer.observe();
        return () => {
            observer.disconnect();
        };
    });
}
function createCspViolationReportObservable(configuration) {
    return new Observable((observable) => {
        const { stop } = addEventListener(configuration, document, "securitypolicyviolation" /* DOM_EVENT.SECURITY_POLICY_VIOLATION */, (event) => {
            observable.notify(buildRawReportErrorFromCspViolation(event));
        });
        return stop;
    });
}
function buildRawReportErrorFromReport(report) {
    const { type, body } = report;
    return buildRawReportError({
        type: body.id,
        message: `${type}: ${body.message}`,
        originalError: report,
        stack: buildStack(body.id, body.message, body.sourceFile, body.lineNumber, body.columnNumber),
    });
}
function buildRawReportErrorFromCspViolation(event) {
    const message = `'${event.blockedURI}' blocked by '${event.effectiveDirective}' directive`;
    return buildRawReportError({
        type: event.effectiveDirective,
        message: `${RawReportType.cspViolation}: ${message}`,
        originalError: event,
        csp: {
            disposition: event.disposition,
        },
        stack: buildStack(event.effectiveDirective, event.originalPolicy
            ? `${message} of the policy "${safeTruncate(event.originalPolicy, 100, '...')}"`
            : 'no policy', event.sourceFile, event.lineNumber, event.columnNumber),
    });
}
function buildRawReportError(partial) {
    return {
        startClocks: clocksNow(),
        source: ErrorSource.REPORT,
        handling: "unhandled" /* ErrorHandling.UNHANDLED */,
        ...partial,
    };
}
function buildStack(name, message, sourceFile, lineNumber, columnNumber) {
    return sourceFile
        ? toStackTraceString({
            name,
            message,
            stack: [
                {
                    func: '?',
                    url: sourceFile,
                    line: lineNumber !== null && lineNumber !== void 0 ? lineNumber : undefined,
                    column: columnNumber !== null && columnNumber !== void 0 ? columnNumber : undefined,
                },
            ],
        })
        : undefined;
}

const TAG_SIZE_LIMIT = 200;
function buildTags(configuration) {
    const { env, service, version, datacenter, sdkVersion, variant } = configuration;
    const tags = [buildTag('sdk_version', sdkVersion !== null && sdkVersion !== void 0 ? sdkVersion : "6.27.1")];
    if (env) {
        tags.push(buildTag('env', env));
    }
    if (service) {
        tags.push(buildTag('service', service));
    }
    if (version) {
        tags.push(buildTag('version', version));
    }
    if (datacenter) {
        tags.push(buildTag('datacenter', datacenter));
    }
    if (variant) {
        tags.push(buildTag('variant', variant));
    }
    return tags;
}
function buildTag(key, rawValue) {
    // See https://docs.datadoghq.com/getting_started/tagging/#defining-tags for tags syntax. Note
    // that the backend may not follow the exact same rules, so we only want to display an informal
    // warning.
    const tag = rawValue ? `${key}:${rawValue}` : key;
    if (tag.length > TAG_SIZE_LIMIT || hasForbiddenCharacters(tag)) {
        display.warn(`Tag ${tag} doesn't meet tag requirements and will be sanitized. ${MORE_DETAILS} ${DOCS_ORIGIN}/getting_started/tagging/#defining-tags`);
    }
    // Let the backend do most of the sanitization, but still make sure multiple tags can't be crafted
    // by forging a value containing commas.
    return sanitizeTag(tag);
}
function sanitizeTag(tag) {
    return tag.replace(/,/g, '_');
}
function hasForbiddenCharacters(rawValue) {
    // Unicode property escapes is not supported in all browsers, so we use a try/catch.
    // Todo: Remove the try/catch when dropping support for Chrome 63 and Firefox 67
    // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape#browser_compatibility
    if (!supportUnicodePropertyEscapes()) {
        return false;
    }
    // We use the Unicode property escapes to match any character that is a letter including other languages like Chinese, Japanese, etc.
    // p{Ll} matches a lowercase letter.
    // p{Lo} matches a letter that is neither uppercase nor lowercase (ex: Japanese characters).
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape#unicode_property_escapes_vs._character_classes
    return new RegExp('[^\\p{Ll}\\p{Lo}0-9_:./-]', 'u').test(rawValue);
}
function supportUnicodePropertyEscapes() {
    try {
        new RegExp('[\\p{Ll}]', 'u');
        return true;
    }
    catch (_a) {
        return false;
    }
}

function sendToExtension(type, payload) {
    const callback = globalObject.__ddBrowserSdkExtensionCallback;
    if (callback) {
        callback({ type, payload });
    }
}

/**
 * Iterate over source and affect its sub values into destination, recursively.
 * If the source and destination can't be merged, return source.
 */
function mergeInto(destination, source, circularReferenceChecker = createCircularReferenceChecker()) {
    // ignore the source if it is undefined
    if (source === undefined) {
        return destination;
    }
    if (typeof source !== 'object' || source === null) {
        // primitive values - just return source
        return source;
    }
    else if (source instanceof Date) {
        return new Date(source.getTime());
    }
    else if (source instanceof RegExp) {
        const flags = source.flags ||
            // old browsers compatibility
            [
                source.global ? 'g' : '',
                source.ignoreCase ? 'i' : '',
                source.multiline ? 'm' : '',
                source.sticky ? 'y' : '',
                source.unicode ? 'u' : '',
            ].join('');
        return new RegExp(source.source, flags);
    }
    if (circularReferenceChecker.hasAlreadyBeenSeen(source)) {
        // remove circular references
        return undefined;
    }
    else if (Array.isArray(source)) {
        const merged = Array.isArray(destination) ? destination : [];
        for (let i = 0; i < source.length; ++i) {
            merged[i] = mergeInto(merged[i], source[i], circularReferenceChecker);
        }
        return merged;
    }
    const merged = getType(destination) === 'object' ? destination : {};
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            merged[key] = mergeInto(merged[key], source[key], circularReferenceChecker);
        }
    }
    return merged;
}
/**
 * A simplistic implementation of a deep clone algorithm.
 * Caveats:
 * - It doesn't maintain prototype chains - don't use with instances of custom classes.
 * - It doesn't handle Map and Set
 */
function deepClone(value) {
    return mergeInto(undefined, value);
}
function combine(...sources) {
    let destination;
    for (const source of sources) {
        // Ignore any undefined or null sources.
        if (source === undefined || source === null) {
            continue;
        }
        destination = mergeInto(destination, source);
    }
    return destination;
}
function createCircularReferenceChecker() {
    if (typeof WeakSet !== 'undefined') {
        const set = new WeakSet();
        return {
            hasAlreadyBeenSeen(value) {
                const has = set.has(value);
                if (!has) {
                    set.add(value);
                }
                return has;
            },
        };
    }
    const array = [];
    return {
        hasAlreadyBeenSeen(value) {
            const has = array.indexOf(value) >= 0;
            if (!has) {
                array.push(value);
            }
            return has;
        },
    };
}

function getConnectivity() {
    var _a;
    const navigator = globalObject.navigator;
    return {
        status: navigator.onLine ? 'connected' : 'not_connected',
        interfaces: navigator.connection && navigator.connection.type ? [navigator.connection.type] : undefined,
        effective_type: (_a = navigator.connection) === null || _a === void 0 ? void 0 : _a.effectiveType,
    };
}

/**
 * Make a fetch request using the native implementation, bypassing Zone.js patching.
 * This prevents unnecessary Angular change detection cycles.
 *
 * @param input - The resource to fetch (URL or Request object)
 * @param init - Optional fetch options
 * @returns A Promise that resolves to the Response
 */
function fetch$1(input, init) {
    return getZoneJsOriginalValue(getGlobalObject(), 'fetch')(input, init);
}

function isServerError(status) {
    return status >= 500;
}
function tryToClone(response) {
    try {
        return response.clone();
    }
    catch (_a) {
        // clone can throw if the response has already been used by another instrumentation or is disturbed
        return;
    }
}

const MAX_ONGOING_BYTES_COUNT = 80 * ONE_KIBI_BYTE;
const MAX_ONGOING_REQUESTS = 32;
const MAX_QUEUE_BYTES_COUNT = 20 * ONE_MEBI_BYTE;
const MAX_BACKOFF_TIME = ONE_MINUTE;
const INITIAL_BACKOFF_TIME = ONE_SECOND;
function sendWithRetryStrategy(payload, state, sendStrategy, trackType, reportError, requestObservable) {
    if (state.transportStatus === 0 /* TransportStatus.UP */ &&
        state.queuedPayloads.size() === 0 &&
        state.bandwidthMonitor.canHandle(payload)) {
        send(payload, state, sendStrategy, requestObservable, {
            onSuccess: () => retryQueuedPayloads(0 /* RetryReason.AFTER_SUCCESS */, state, sendStrategy, trackType, reportError, requestObservable),
            onFailure: () => {
                if (!state.queuedPayloads.enqueue(payload)) {
                    requestObservable.notify({ type: 'queue-full', bandwidth: state.bandwidthMonitor.stats(), payload });
                }
                scheduleRetry(state, sendStrategy, trackType, reportError, requestObservable);
            },
        });
    }
    else {
        if (!state.queuedPayloads.enqueue(payload)) {
            requestObservable.notify({ type: 'queue-full', bandwidth: state.bandwidthMonitor.stats(), payload });
        }
    }
}
function scheduleRetry(state, sendStrategy, trackType, reportError, requestObservable) {
    if (state.transportStatus !== 2 /* TransportStatus.DOWN */) {
        return;
    }
    setTimeout$1(() => {
        const payload = state.queuedPayloads.first();
        send(payload, state, sendStrategy, requestObservable, {
            onSuccess: () => {
                state.queuedPayloads.dequeue();
                state.currentBackoffTime = INITIAL_BACKOFF_TIME;
                retryQueuedPayloads(1 /* RetryReason.AFTER_RESUME */, state, sendStrategy, trackType, reportError, requestObservable);
            },
            onFailure: () => {
                state.currentBackoffTime = Math.min(MAX_BACKOFF_TIME, state.currentBackoffTime * 2);
                scheduleRetry(state, sendStrategy, trackType, reportError, requestObservable);
            },
        });
    }, state.currentBackoffTime);
}
function send(payload, state, sendStrategy, requestObservable, { onSuccess, onFailure }) {
    state.bandwidthMonitor.add(payload);
    sendStrategy(payload, (response) => {
        state.bandwidthMonitor.remove(payload);
        if (!shouldRetryRequest(response)) {
            state.transportStatus = 0 /* TransportStatus.UP */;
            requestObservable.notify({ type: 'success', bandwidth: state.bandwidthMonitor.stats(), payload });
            onSuccess();
        }
        else {
            // do not consider transport down if another ongoing request could succeed
            state.transportStatus =
                state.bandwidthMonitor.ongoingRequestCount > 0 ? 1 /* TransportStatus.FAILURE_DETECTED */ : 2 /* TransportStatus.DOWN */;
            payload.retry = {
                count: payload.retry ? payload.retry.count + 1 : 1,
                lastFailureStatus: response.status,
            };
            requestObservable.notify({ type: 'failure', bandwidth: state.bandwidthMonitor.stats(), payload });
            onFailure();
        }
    });
}
function retryQueuedPayloads(reason, state, sendStrategy, trackType, reportError, requestObservable) {
    if (reason === 0 /* RetryReason.AFTER_SUCCESS */ && state.queuedPayloads.isFull() && !state.queueFullReported) {
        reportError({
            message: `Reached max ${trackType} events size queued for upload: ${MAX_QUEUE_BYTES_COUNT / ONE_MEBI_BYTE}MiB`,
            source: ErrorSource.AGENT,
            startClocks: clocksNow(),
        });
        state.queueFullReported = true;
    }
    const previousQueue = state.queuedPayloads;
    state.queuedPayloads = newPayloadQueue();
    while (previousQueue.size() > 0) {
        sendWithRetryStrategy(previousQueue.dequeue(), state, sendStrategy, trackType, reportError, requestObservable);
    }
}
function shouldRetryRequest(response) {
    return (response.type !== 'opaque' &&
        ((response.status === 0 && !navigator.onLine) ||
            response.status === 408 ||
            response.status === 429 ||
            isServerError(response.status)));
}
function newRetryState() {
    return {
        transportStatus: 0 /* TransportStatus.UP */,
        currentBackoffTime: INITIAL_BACKOFF_TIME,
        bandwidthMonitor: newBandwidthMonitor(),
        queuedPayloads: newPayloadQueue(),
        queueFullReported: false,
    };
}
function newPayloadQueue() {
    const queue = [];
    return {
        bytesCount: 0,
        enqueue(payload) {
            if (this.isFull()) {
                return false;
            }
            queue.push(payload);
            this.bytesCount += payload.bytesCount;
            return true;
        },
        first() {
            return queue[0];
        },
        dequeue() {
            const payload = queue.shift();
            if (payload) {
                this.bytesCount -= payload.bytesCount;
            }
            return payload;
        },
        size() {
            return queue.length;
        },
        isFull() {
            return this.bytesCount >= MAX_QUEUE_BYTES_COUNT;
        },
    };
}
function newBandwidthMonitor() {
    return {
        ongoingRequestCount: 0,
        ongoingByteCount: 0,
        canHandle(payload) {
            return (this.ongoingRequestCount === 0 ||
                (this.ongoingByteCount + payload.bytesCount <= MAX_ONGOING_BYTES_COUNT &&
                    this.ongoingRequestCount < MAX_ONGOING_REQUESTS));
        },
        add(payload) {
            this.ongoingRequestCount += 1;
            this.ongoingByteCount += payload.bytesCount;
        },
        remove(payload) {
            this.ongoingRequestCount -= 1;
            this.ongoingByteCount -= payload.bytesCount;
        },
        stats() {
            return {
                ongoingByteCount: this.ongoingByteCount,
                ongoingRequestCount: this.ongoingRequestCount,
            };
        },
    };
}

/**
 * beacon payload max queue size implementation is 64kb
 * ensure that we leave room for logs, rum and potential other users
 */
const RECOMMENDED_REQUEST_BYTES_LIMIT = 16 * ONE_KIBI_BYTE;
function createHttpRequest(endpointBuilders, reportError, bytesLimit = RECOMMENDED_REQUEST_BYTES_LIMIT) {
    const observable = new Observable();
    const retryState = newRetryState();
    return {
        observable,
        send: (payload) => {
            for (const endpointBuilder of endpointBuilders) {
                sendWithRetryStrategy(payload, retryState, (payload, onResponse) => {
                    if (isExperimentalFeatureEnabled(ExperimentalFeature.AVOID_FETCH_KEEPALIVE)) {
                        fetchStrategy(endpointBuilder, payload, onResponse);
                    }
                    else {
                        fetchKeepAliveStrategy(endpointBuilder, bytesLimit, payload, onResponse);
                    }
                }, endpointBuilder.trackType, reportError, observable);
            }
        },
        /**
         * Since fetch keepalive behaves like regular fetch on Firefox,
         * keep using sendBeaconStrategy on exit
         */
        sendOnExit: (payload) => {
            for (const endpointBuilder of endpointBuilders) {
                sendBeaconStrategy(endpointBuilder, bytesLimit, payload);
            }
        },
    };
}
function sendBeaconStrategy(endpointBuilder, bytesLimit, payload) {
    const canUseBeacon = !!navigator.sendBeacon && payload.bytesCount < bytesLimit;
    if (canUseBeacon) {
        try {
            const beaconUrl = endpointBuilder.build('beacon', payload);
            const isQueued = navigator.sendBeacon(beaconUrl, payload.data);
            if (isQueued) {
                return;
            }
        }
        catch (e) {
            reportBeaconError(e);
        }
    }
    fetchStrategy(endpointBuilder, payload);
}
let hasReportedBeaconError = false;
function reportBeaconError(e) {
    if (!hasReportedBeaconError) {
        hasReportedBeaconError = true;
        monitorError(e);
    }
}
function fetchKeepAliveStrategy(endpointBuilder, bytesLimit, payload, onResponse) {
    const canUseKeepAlive = isKeepAliveSupported() && payload.bytesCount < bytesLimit;
    if (canUseKeepAlive) {
        const fetchUrl = endpointBuilder.build('fetch-keepalive', payload);
        fetch$1(fetchUrl, { method: 'POST', body: payload.data, keepalive: true, mode: 'cors' })
            .then(monitor((response) => onResponse === null || onResponse === void 0 ? void 0 : onResponse({ status: response.status, type: response.type })))
            .catch(monitor(() => fetchStrategy(endpointBuilder, payload, onResponse)));
    }
    else {
        fetchStrategy(endpointBuilder, payload, onResponse);
    }
}
function fetchStrategy(endpointBuilder, payload, onResponse) {
    const fetchUrl = endpointBuilder.build('fetch', payload);
    fetch$1(fetchUrl, { method: 'POST', body: payload.data, mode: 'cors' })
        .then(monitor((response) => onResponse === null || onResponse === void 0 ? void 0 : onResponse({ status: response.status, type: response.type })))
        .catch(monitor(() => onResponse === null || onResponse === void 0 ? void 0 : onResponse({ status: 0 })));
}
function isKeepAliveSupported() {
    // Request can throw, cf https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#errors
    try {
        return window.Request && 'keepalive' in new Request('http://a');
    }
    catch (_a) {
        return false;
    }
}

function getEventBridge() {
    const eventBridgeGlobal = getEventBridgeGlobal();
    if (!eventBridgeGlobal) {
        return;
    }
    return {
        getCapabilities() {
            var _a;
            return JSON.parse(((_a = eventBridgeGlobal.getCapabilities) === null || _a === void 0 ? void 0 : _a.call(eventBridgeGlobal)) || '[]');
        },
        getPrivacyLevel() {
            var _a;
            return (_a = eventBridgeGlobal.getPrivacyLevel) === null || _a === void 0 ? void 0 : _a.call(eventBridgeGlobal);
        },
        getAllowedWebViewHosts() {
            return JSON.parse(eventBridgeGlobal.getAllowedWebViewHosts());
        },
        send(eventType, event, viewId) {
            const view = viewId ? { id: viewId } : undefined;
            eventBridgeGlobal.send(JSON.stringify({ eventType, event, view }));
        },
    };
}
function bridgeSupports(capability) {
    const bridge = getEventBridge();
    return !!bridge && bridge.getCapabilities().includes(capability);
}
function canUseEventBridge(currentHost) {
    var _a;
    if (currentHost === void 0) { currentHost = (_a = getGlobalObject().location) === null || _a === void 0 ? void 0 : _a.hostname; }
    const bridge = getEventBridge();
    return (!!bridge &&
        bridge
            .getAllowedWebViewHosts()
            .some((allowedHost) => currentHost === allowedHost || currentHost.endsWith(`.${allowedHost}`)));
}
function getEventBridgeGlobal() {
    return getGlobalObject().DatadogEventBridge;
}

const PageExitReason = {
    HIDDEN: 'visibility_hidden',
    UNLOADING: 'before_unload',
    PAGEHIDE: 'page_hide',
    FROZEN: 'page_frozen',
};
function createPageMayExitObservable(configuration) {
    return new Observable((observable) => {
        if (isWorkerEnvironment) {
            // Page exit is not observable in worker environments (no window/document events)
            return;
        }
        const { stop: stopListeners } = addEventListeners(configuration, window, ["visibilitychange" /* DOM_EVENT.VISIBILITY_CHANGE */, "freeze" /* DOM_EVENT.FREEZE */], (event) => {
            if (event.type === "visibilitychange" /* DOM_EVENT.VISIBILITY_CHANGE */ && document.visibilityState === 'hidden') {
                /**
                 * Only event that guarantee to fire on mobile devices when the page transitions to background state
                 * (e.g. when user switches to a different application, goes to homescreen, etc), or is being unloaded.
                 */
                observable.notify({ reason: PageExitReason.HIDDEN });
            }
            else if (event.type === "freeze" /* DOM_EVENT.FREEZE */) {
                /**
                 * After transitioning in background a tab can be freezed to preserve resources. (cf: https://developer.chrome.com/blog/page-lifecycle-api)
                 * Allow to collect events happening between hidden and frozen state.
                 */
                observable.notify({ reason: PageExitReason.FROZEN });
            }
        }, { capture: true });
        const stopBeforeUnloadListener = addEventListener(configuration, window, "beforeunload" /* DOM_EVENT.BEFORE_UNLOAD */, () => {
            observable.notify({ reason: PageExitReason.UNLOADING });
        }).stop;
        return () => {
            stopListeners();
            stopBeforeUnloadListener();
        };
    });
}
function isPageExitReason(reason) {
    return objectValues(PageExitReason).includes(reason);
}

const MESSAGE_BYTES_LIMIT = 256 * ONE_KIBI_BYTE;
function createBatch({ encoder, request, flushController, }) {
    let upsertBuffer = {};
    const flushSubscription = flushController.flushObservable.subscribe((event) => flush(event));
    function push(serializedMessage, estimatedMessageBytesCount, key) {
        flushController.notifyBeforeAddMessage(estimatedMessageBytesCount);
        if (key !== undefined) {
            upsertBuffer[key] = serializedMessage;
            flushController.notifyAfterAddMessage();
        }
        else {
            encoder.write(encoder.isEmpty ? serializedMessage : `\n${serializedMessage}`, (realMessageBytesCount) => {
                flushController.notifyAfterAddMessage(realMessageBytesCount - estimatedMessageBytesCount);
            });
        }
    }
    function hasMessageFor(key) {
        return key !== undefined && upsertBuffer[key] !== undefined;
    }
    function remove(key) {
        const removedMessage = upsertBuffer[key];
        delete upsertBuffer[key];
        const messageBytesCount = encoder.estimateEncodedBytesCount(removedMessage);
        flushController.notifyAfterRemoveMessage(messageBytesCount);
    }
    function addOrUpdate(message, key) {
        const serializedMessage = jsonStringify(message);
        const estimatedMessageBytesCount = encoder.estimateEncodedBytesCount(serializedMessage);
        if (estimatedMessageBytesCount >= MESSAGE_BYTES_LIMIT) {
            display.warn(`Discarded a message whose size was bigger than the maximum allowed size ${MESSAGE_BYTES_LIMIT / ONE_KIBI_BYTE}KiB. ${MORE_DETAILS} ${DOCS_TROUBLESHOOTING}/#technical-limitations`);
            return;
        }
        if (hasMessageFor(key)) {
            remove(key);
        }
        push(serializedMessage, estimatedMessageBytesCount, key);
    }
    function flush(event) {
        const upsertMessages = objectValues(upsertBuffer).join('\n');
        upsertBuffer = {};
        const pageMightExit = isPageExitReason(event.reason);
        const send = pageMightExit ? request.sendOnExit : request.send;
        if (pageMightExit &&
            // Note: checking that the encoder is async is not strictly needed, but it's an optimization:
            // if the encoder is async we need to send two requests in some cases (one for encoded data
            // and the other for non-encoded data). But if it's not async, we don't have to worry about
            // it and always send a single request.
            encoder.isAsync) {
            const encoderResult = encoder.finishSync();
            // Send encoded messages
            if (encoderResult.outputBytesCount) {
                send(formatPayloadFromEncoder(encoderResult));
            }
            // Send messages that are not yet encoded at this point
            const pendingMessages = [encoderResult.pendingData, upsertMessages].filter(Boolean).join('\n');
            if (pendingMessages) {
                send({
                    data: pendingMessages,
                    bytesCount: computeBytesCount(pendingMessages),
                });
            }
        }
        else {
            if (upsertMessages) {
                encoder.write(encoder.isEmpty ? upsertMessages : `\n${upsertMessages}`);
            }
            encoder.finish((encoderResult) => {
                send(formatPayloadFromEncoder(encoderResult));
            });
        }
    }
    return {
        flushController,
        add: addOrUpdate,
        upsert: addOrUpdate,
        stop: flushSubscription.unsubscribe,
    };
}
function formatPayloadFromEncoder(encoderResult) {
    let data;
    if (typeof encoderResult.output === 'string') {
        data = encoderResult.output;
    }
    else {
        data = new Blob([encoderResult.output], {
            // This will set the 'Content-Type: text/plain' header. Reasoning:
            // * The intake rejects the request if there is no content type.
            // * The browser will issue CORS preflight requests if we set it to 'application/json', which
            // could induce higher intake load (and maybe has other impacts).
            // * Also it's not quite JSON, since we are concatenating multiple JSON objects separated by
            // new lines.
            type: 'text/plain',
        });
    }
    return {
        data,
        bytesCount: encoderResult.outputBytesCount,
        encoding: encoderResult.encoding,
    };
}

/**
 * flush automatically, aim to be lower than ALB connection timeout
 * to maximize connection reuse.
 */
const FLUSH_DURATION_LIMIT = (30 * ONE_SECOND);
/**
 * When using the SDK in a Worker Environment, we limit the batch size to 1 to ensure it can be sent
 * in a single event.
 */
const MESSAGES_LIMIT = isWorkerEnvironment ? 1 : 50;
/**
 * Returns a "flush controller", responsible of notifying when flushing a pool of pending data needs
 * to happen. The implementation is designed to support both synchronous and asynchronous usages,
 * but relies on invariants described in each method documentation to keep a coherent state.
 */
function createFlushController({ pageMayExitObservable, sessionExpireObservable }) {
    const pageMayExitSubscription = pageMayExitObservable.subscribe((event) => flush(event.reason));
    const sessionExpireSubscription = sessionExpireObservable.subscribe(() => flush('session_expire'));
    const flushObservable = new Observable(() => () => {
        pageMayExitSubscription.unsubscribe();
        sessionExpireSubscription.unsubscribe();
    });
    let currentBytesCount = 0;
    let currentMessagesCount = 0;
    function flush(flushReason) {
        if (currentMessagesCount === 0) {
            return;
        }
        const messagesCount = currentMessagesCount;
        const bytesCount = currentBytesCount;
        currentMessagesCount = 0;
        currentBytesCount = 0;
        cancelDurationLimitTimeout();
        flushObservable.notify({
            reason: flushReason,
            messagesCount,
            bytesCount,
        });
    }
    let durationLimitTimeoutId;
    function scheduleDurationLimitTimeout() {
        if (durationLimitTimeoutId === undefined) {
            durationLimitTimeoutId = setTimeout$1(() => {
                flush('duration_limit');
            }, FLUSH_DURATION_LIMIT);
        }
    }
    function cancelDurationLimitTimeout() {
        clearTimeout$1(durationLimitTimeoutId);
        durationLimitTimeoutId = undefined;
    }
    return {
        flushObservable,
        get messagesCount() {
            return currentMessagesCount;
        },
        /**
         * Notifies that a message will be added to a pool of pending messages waiting to be flushed.
         *
         * This function needs to be called synchronously, right before adding the message, so no flush
         * event can happen after `notifyBeforeAddMessage` and before adding the message.
         *
         * @param estimatedMessageBytesCount - an estimation of the message bytes count once it is
         * actually added.
         */
        notifyBeforeAddMessage(estimatedMessageBytesCount) {
            if (currentBytesCount + estimatedMessageBytesCount >= RECOMMENDED_REQUEST_BYTES_LIMIT) {
                flush('bytes_limit');
            }
            // Consider the message to be added now rather than in `notifyAfterAddMessage`, because if no
            // message was added yet and `notifyAfterAddMessage` is called asynchronously, we still want
            // to notify when a flush is needed (for example on page exit).
            currentMessagesCount += 1;
            currentBytesCount += estimatedMessageBytesCount;
            scheduleDurationLimitTimeout();
        },
        /**
         * Notifies that a message *was* added to a pool of pending messages waiting to be flushed.
         *
         * This function can be called asynchronously after the message was added, but in this case it
         * should not be called if a flush event occurred in between.
         *
         * @param messageBytesCountDiff - the difference between the estimated message bytes count and
         * its actual bytes count once added to the pool.
         */
        notifyAfterAddMessage(messageBytesCountDiff = 0) {
            currentBytesCount += messageBytesCountDiff;
            if (currentMessagesCount >= MESSAGES_LIMIT) {
                flush('messages_limit');
            }
            else if (currentBytesCount >= RECOMMENDED_REQUEST_BYTES_LIMIT) {
                flush('bytes_limit');
            }
        },
        /**
         * Notifies that a message was removed from a pool of pending messages waiting to be flushed.
         *
         * This function needs to be called synchronously, right after removing the message, so no flush
         * event can happen after removing the message and before `notifyAfterRemoveMessage`.
         *
         * @param messageBytesCount - the message bytes count that was added to the pool. Should
         * correspond to the sum of bytes counts passed to `notifyBeforeAddMessage` and
         * `notifyAfterAddMessage`.
         */
        notifyAfterRemoveMessage(messageBytesCount) {
            currentBytesCount -= messageBytesCount;
            currentMessagesCount -= 1;
            if (currentMessagesCount === 0) {
                cancelDurationLimitTimeout();
            }
        },
    };
}

function createIdentityEncoder() {
    let output = '';
    let outputBytesCount = 0;
    return {
        isAsync: false,
        get isEmpty() {
            return !output;
        },
        write(data, callback) {
            const additionalEncodedBytesCount = computeBytesCount(data);
            outputBytesCount += additionalEncodedBytesCount;
            output += data;
            if (callback) {
                callback(additionalEncodedBytesCount);
            }
        },
        finish(callback) {
            callback(this.finishSync());
        },
        finishSync() {
            const result = {
                output,
                outputBytesCount,
                rawBytesCount: outputBytesCount,
                pendingData: '',
            };
            output = '';
            outputBytesCount = 0;
            return result;
        },
        estimateEncodedBytesCount(data) {
            return data.length;
        },
    };
}

// Discards the event from being sent
const DISCARDED = 'DISCARDED';
// Skips from the assembly of the event
const SKIPPED = 'SKIPPED';
function abstractHooks() {
    const callbacks = {};
    return {
        register(hookName, callback) {
            if (!callbacks[hookName]) {
                callbacks[hookName] = [];
            }
            callbacks[hookName].push(callback);
            return {
                unregister: () => {
                    callbacks[hookName] = callbacks[hookName].filter((cb) => cb !== callback);
                },
            };
        },
        triggerHook(hookName, param) {
            const hookCallbacks = callbacks[hookName] || [];
            const results = [];
            for (const callback of hookCallbacks) {
                const result = callback(param);
                if (result === DISCARDED) {
                    return DISCARDED;
                }
                if (result === SKIPPED) {
                    continue;
                }
                results.push(result);
            }
            return combine(...results);
        },
    };
}

const TelemetryType = {
    LOG: 'log',
    CONFIGURATION: 'configuration',
    USAGE: 'usage',
};

const ALLOWED_FRAME_URLS = [
    'https://www.datadoghq-browser-agent.com',
    'https://www.datad0g-browser-agent.com',
    'https://d3uc069fcn7uxw.cloudfront.net',
    'https://d20xtzwzcl0ceb.cloudfront.net',
    'http://localhost',
    '<anonymous>',
];
const METRIC_SAMPLE_RATE = 1;
const TELEMETRY_EXCLUDED_SITES = [INTAKE_SITE_US1_FED];
const MAX_TELEMETRY_EVENTS_PER_PAGE = 15;
let telemetryObservable;
function getTelemetryObservable() {
    if (!telemetryObservable) {
        telemetryObservable = new BufferedObservable(100);
    }
    return telemetryObservable;
}
function startTelemetry(telemetryService, configuration, hooks) {
    const observable = new Observable();
    const { enabled, metricsEnabled } = startTelemetryCollection(telemetryService, configuration, hooks, observable);
    const { stop } = startTelemetryTransport(configuration, observable);
    return {
        stop,
        enabled,
        metricsEnabled,
    };
}
function startTelemetryCollection(telemetryService, configuration, hooks, observable, metricSampleRate = METRIC_SAMPLE_RATE, maxTelemetryEventsPerPage = MAX_TELEMETRY_EVENTS_PER_PAGE) {
    const alreadySentEventsByKind = {};
    const telemetryEnabled = !TELEMETRY_EXCLUDED_SITES.includes(configuration.site) && performDraw(configuration.telemetrySampleRate);
    const telemetryEnabledPerType = {
        [TelemetryType.LOG]: telemetryEnabled,
        [TelemetryType.CONFIGURATION]: telemetryEnabled && performDraw(configuration.telemetryConfigurationSampleRate),
        [TelemetryType.USAGE]: telemetryEnabled && performDraw(configuration.telemetryUsageSampleRate),
        // not an actual "type" but using a single draw for all metrics
        metric: telemetryEnabled && performDraw(metricSampleRate),
    };
    const runtimeEnvInfo = getRuntimeEnvInfo();
    const telemetryObservable = getTelemetryObservable();
    telemetryObservable.subscribe(({ rawEvent, metricName }) => {
        if ((metricName && !telemetryEnabledPerType['metric']) || !telemetryEnabledPerType[rawEvent.type]) {
            return;
        }
        const kind = metricName || rawEvent.status || rawEvent.type;
        let alreadySentEvents = alreadySentEventsByKind[kind];
        if (!alreadySentEvents) {
            alreadySentEvents = alreadySentEventsByKind[kind] = new Set();
        }
        if (alreadySentEvents.size >= maxTelemetryEventsPerPage) {
            return;
        }
        const stringifiedEvent = jsonStringify(rawEvent);
        if (alreadySentEvents.has(stringifiedEvent)) {
            return;
        }
        const defaultTelemetryEventAttributes = hooks.triggerHook(1 /* HookNames.AssembleTelemetry */, {
            startTime: clocksNow().relative,
        });
        if (defaultTelemetryEventAttributes === DISCARDED) {
            return;
        }
        const event = toTelemetryEvent(defaultTelemetryEventAttributes, telemetryService, rawEvent, runtimeEnvInfo);
        observable.notify(event);
        sendToExtension('telemetry', event);
        alreadySentEvents.add(stringifiedEvent);
    });
    telemetryObservable.unbuffer();
    startMonitorErrorCollection(addTelemetryError);
    return {
        enabled: telemetryEnabled,
        metricsEnabled: telemetryEnabledPerType['metric'],
    };
    function toTelemetryEvent(defaultTelemetryEventAttributes, telemetryService, rawEvent, runtimeEnvInfo) {
        const clockNow = clocksNow();
        const event = {
            type: 'telemetry',
            date: clockNow.timeStamp,
            service: telemetryService,
            version: "6.27.1",
            source: 'browser',
            _dd: {
                format_version: 2,
            },
            telemetry: combine(rawEvent, {
                runtime_env: runtimeEnvInfo,
                connectivity: getConnectivity(),
                sdk_setup: "npm",
            }),
            ddtags: buildTags(configuration).join(','),
            experimental_features: Array.from(getExperimentalFeatures()),
        };
        return combine(event, defaultTelemetryEventAttributes);
    }
}
function startTelemetryTransport(configuration, telemetryObservable) {
    const cleanupTasks = [];
    if (canUseEventBridge()) {
        const bridge = getEventBridge();
        const telemetrySubscription = telemetryObservable.subscribe((event) => bridge.send('internal_telemetry', event));
        cleanupTasks.push(telemetrySubscription.unsubscribe);
    }
    else {
        const endpoints = [configuration.rumEndpointBuilder];
        if (configuration.replica && isTelemetryReplicationAllowed(configuration)) {
            endpoints.push(configuration.replica.rumEndpointBuilder);
        }
        const telemetryBatch = createBatch({
            encoder: createIdentityEncoder(),
            request: createHttpRequest(endpoints, 
            // Ignore transport errors for telemetry
            noop),
            flushController: createFlushController({
                pageMayExitObservable: createPageMayExitObservable(configuration),
                // We don't use an actual session expire observable here, to make telemetry collection
                // independent of the session. This allows to start and send telemetry events earlier.
                sessionExpireObservable: new Observable(),
            }),
        });
        cleanupTasks.push(telemetryBatch.stop);
        const telemetrySubscription = telemetryObservable.subscribe(telemetryBatch.add);
        cleanupTasks.push(telemetrySubscription.unsubscribe);
    }
    return {
        stop: () => cleanupTasks.forEach((task) => task()),
    };
}
function getRuntimeEnvInfo() {
    var _a;
    return {
        is_local_file: ((_a = globalObject.location) === null || _a === void 0 ? void 0 : _a.protocol) === 'file:',
        is_worker: isWorkerEnvironment,
    };
}
/**
 * Avoid mixing telemetry events from different data centers
 * but keep replicating staging events for reliability
 */
function isTelemetryReplicationAllowed(configuration) {
    return configuration.site === INTAKE_SITE_STAGING;
}
function addTelemetryDebug(message, context) {
    displayIfDebugEnabled(ConsoleApiName.debug, message, context);
    getTelemetryObservable().notify({
        rawEvent: {
            type: TelemetryType.LOG,
            message,
            status: "debug" /* StatusType.debug */,
            ...context,
        },
    });
}
function addTelemetryError(e, context) {
    getTelemetryObservable().notify({
        rawEvent: {
            type: TelemetryType.LOG,
            status: "error" /* StatusType.error */,
            ...formatError(e),
            ...context,
        },
    });
}
function addTelemetryConfiguration(configuration) {
    getTelemetryObservable().notify({
        rawEvent: {
            type: TelemetryType.CONFIGURATION,
            configuration,
        },
    });
}
function addTelemetryMetrics(metricName, context) {
    getTelemetryObservable().notify({
        rawEvent: {
            type: TelemetryType.LOG,
            message: metricName,
            status: "debug" /* StatusType.debug */,
            ...context,
        },
        metricName,
    });
}
function addTelemetryUsage(usage) {
    getTelemetryObservable().notify({
        rawEvent: {
            type: TelemetryType.USAGE,
            usage,
        },
    });
}
function formatError(e) {
    if (isError(e)) {
        const stackTrace = computeStackTrace(e);
        return {
            error: {
                kind: stackTrace.name,
                stack: toStackTraceString(scrubCustomerFrames(stackTrace)),
            },
            message: stackTrace.message,
        };
    }
    return {
        error: {
            stack: NO_ERROR_STACK_PRESENT_MESSAGE,
        },
        message: `${"Uncaught" /* NonErrorPrefix.UNCAUGHT */} ${jsonStringify(e)}`,
    };
}
function scrubCustomerFrames(stackTrace) {
    stackTrace.stack = stackTrace.stack.filter((frame) => !frame.url || ALLOWED_FRAME_URLS.some((allowedFrameUrl) => frame.url.startsWith(allowedFrameUrl)));
    return stackTrace;
}

function removeItem(array, item) {
    const index = array.indexOf(item);
    if (index >= 0) {
        array.splice(index, 1);
    }
}
function isNonEmptyArray(value) {
    return Array.isArray(value) && value.length > 0;
}

const END_OF_TIMES = Infinity;
const CLEAR_OLD_VALUES_INTERVAL = ONE_MINUTE;
let cleanupHistoriesInterval;
const cleanupTasks = new Set();
function cleanupHistories() {
    cleanupTasks.forEach((task) => task());
}
function createValueHistory({ expireDelay, maxEntries, }) {
    let entries = [];
    if (!cleanupHistoriesInterval) {
        cleanupHistoriesInterval = setInterval(() => cleanupHistories(), CLEAR_OLD_VALUES_INTERVAL);
    }
    const clearExpiredValues = () => {
        const oldTimeThreshold = relativeNow() - expireDelay;
        while (entries.length > 0 && entries[entries.length - 1].endTime < oldTimeThreshold) {
            entries.pop();
        }
    };
    cleanupTasks.add(clearExpiredValues);
    /**
     * Add a value to the history associated with a start time. Returns a reference to this newly
     * added entry that can be removed or closed.
     */
    function add(value, startTime) {
        const entry = {
            value,
            startTime,
            endTime: END_OF_TIMES,
            remove: () => {
                removeItem(entries, entry);
            },
            close: (endTime) => {
                entry.endTime = endTime;
            },
        };
        if (maxEntries && entries.length >= maxEntries) {
            entries.pop();
        }
        entries.unshift(entry);
        return entry;
    }
    /**
     * Return the latest value that was active during `startTime`, or the currently active value
     * if no `startTime` is provided. This method assumes that entries are not overlapping.
     *
     * If `option.returnInactive` is true, returns the value at `startTime` (active or not).
     */
    function find(startTime = END_OF_TIMES, options = { returnInactive: false }) {
        for (const entry of entries) {
            if (entry.startTime <= startTime) {
                if (options.returnInactive || startTime <= entry.endTime) {
                    return entry.value;
                }
                break;
            }
        }
    }
    /**
     * Helper function to close the currently active value, if any. This method assumes that entries
     * are not overlapping.
     */
    function closeActive(endTime) {
        const latestEntry = entries[0];
        if (latestEntry && latestEntry.endTime === END_OF_TIMES) {
            latestEntry.close(endTime);
        }
    }
    /**
     * Return all values with an active period overlapping with the duration,
     * or all values that were active during `startTime` if no duration is provided,
     * or all currently active values if no `startTime` is provided.
     */
    function findAll(startTime = END_OF_TIMES, duration = 0) {
        const endTime = addDuration(startTime, duration);
        return entries
            .filter((entry) => entry.startTime <= endTime && startTime <= entry.endTime)
            .map((entry) => entry.value);
    }
    /**
     * Remove all entries from this collection.
     */
    function reset() {
        entries = [];
    }
    /**
     * Stop internal garbage collection of past entries.
     */
    function stop() {
        cleanupTasks.delete(clearExpiredValues);
        if (cleanupTasks.size === 0 && cleanupHistoriesInterval) {
            clearInterval(cleanupHistoriesInterval);
            cleanupHistoriesInterval = undefined;
        }
    }
    return { add, find, closeActive, findAll, reset, stop };
}

const SYNTHETICS_TEST_ID_COOKIE_NAME = 'datadog-synthetics-public-id';
const SYNTHETICS_RESULT_ID_COOKIE_NAME = 'datadog-synthetics-result-id';
const SYNTHETICS_INJECTS_RUM_COOKIE_NAME = 'datadog-synthetics-injects-rum';
function willSyntheticsInjectRum() {
    if (isWorkerEnvironment) {
        // We don't expect to run synthetics tests in a worker environment
        return false;
    }
    return Boolean(globalObject._DATADOG_SYNTHETICS_INJECTS_RUM || getInitCookie(SYNTHETICS_INJECTS_RUM_COOKIE_NAME));
}
function getSyntheticsTestId() {
    const value = window._DATADOG_SYNTHETICS_PUBLIC_ID || getInitCookie(SYNTHETICS_TEST_ID_COOKIE_NAME);
    return typeof value === 'string' ? value : undefined;
}
function getSyntheticsResultId() {
    const value = window._DATADOG_SYNTHETICS_RESULT_ID || getInitCookie(SYNTHETICS_RESULT_ID_COOKIE_NAME);
    return typeof value === 'string' ? value : undefined;
}
function isSyntheticsTest() {
    return Boolean(getSyntheticsTestId() && getSyntheticsResultId());
}

const VISIBILITY_CHECK_DELAY = ONE_MINUTE;
const SESSION_CONTEXT_TIMEOUT_DELAY = SESSION_TIME_OUT_DELAY;
function startSessionManager(configuration, productKey, computeTrackingType, trackingConsentState) {
    const renewObservable = new Observable();
    const expireObservable = new Observable();
    // TODO - Improve configuration type and remove assertion
    const sessionStore = startSessionStore(configuration.sessionStoreStrategyType, configuration, productKey, computeTrackingType);
    const sessionContextHistory = createValueHistory({
        expireDelay: SESSION_CONTEXT_TIMEOUT_DELAY,
    });
    sessionStore.renewObservable.subscribe(() => {
        sessionContextHistory.add(buildSessionContext(), relativeNow());
        renewObservable.notify();
    });
    sessionStore.expireObservable.subscribe(() => {
        expireObservable.notify();
        sessionContextHistory.closeActive(relativeNow());
    });
    // We expand/renew session unconditionally as tracking consent is always granted when the session
    // manager is started.
    sessionStore.expandOrRenewSession();
    sessionContextHistory.add(buildSessionContext(), clocksOrigin().relative);
    if (isExperimentalFeatureEnabled(ExperimentalFeature.SHORT_SESSION_INVESTIGATION)) {
        const session = sessionStore.getSession();
        if (session) {
            detectSessionIdChange(configuration, session);
        }
    }
    trackingConsentState.observable.subscribe(() => {
        if (trackingConsentState.isGranted()) {
            sessionStore.expandOrRenewSession();
        }
        else {
            sessionStore.expire(false);
        }
    });
    trackActivity(configuration, () => {
        if (trackingConsentState.isGranted()) {
            sessionStore.expandOrRenewSession();
        }
    });
    trackVisibility(configuration, () => sessionStore.expandSession());
    trackResume(configuration, () => sessionStore.restartSession());
    function buildSessionContext() {
        const session = sessionStore.getSession();
        if (!session) {
            reportUnexpectedSessionState(configuration).catch(() => void 0); // Ignore errors
            return {
                id: 'invalid',
                trackingType: SESSION_NOT_TRACKED,
                isReplayForced: false,
                anonymousId: undefined,
            };
        }
        return {
            id: session.id,
            trackingType: session[productKey],
            isReplayForced: !!session.forcedReplay,
            anonymousId: session.anonymousId,
        };
    }
    return {
        findSession: (startTime, options) => sessionContextHistory.find(startTime, options),
        renewObservable,
        expireObservable,
        sessionStateUpdateObservable: sessionStore.sessionStateUpdateObservable,
        expire: sessionStore.expire,
        updateSessionState: sessionStore.updateSessionState,
    };
}
function trackActivity(configuration, expandOrRenewSession) {
    const { stop } = addEventListeners(configuration, window, ["click" /* DOM_EVENT.CLICK */, "touchstart" /* DOM_EVENT.TOUCH_START */, "keydown" /* DOM_EVENT.KEY_DOWN */, "scroll" /* DOM_EVENT.SCROLL */], expandOrRenewSession, { capture: true, passive: true });
}
function trackVisibility(configuration, expandSession) {
    const expandSessionWhenVisible = () => {
        if (document.visibilityState === 'visible') {
            expandSession();
        }
    };
    const { stop } = addEventListener(configuration, document, "visibilitychange" /* DOM_EVENT.VISIBILITY_CHANGE */, expandSessionWhenVisible);
    setInterval(expandSessionWhenVisible, VISIBILITY_CHECK_DELAY);
}
function trackResume(configuration, cb) {
    const { stop } = addEventListener(configuration, window, "resume" /* DOM_EVENT.RESUME */, cb, { capture: true });
}
async function reportUnexpectedSessionState(configuration) {
    const sessionStoreStrategyType = configuration.sessionStoreStrategyType;
    if (!sessionStoreStrategyType) {
        return;
    }
    let rawSession;
    let cookieContext;
    if (sessionStoreStrategyType.type === SessionPersistence.COOKIE) {
        rawSession = retrieveSessionCookie(sessionStoreStrategyType.cookieOptions, configuration);
        cookieContext = {
            cookie: await getSessionCookies(),
            currentDomain: `${window.location.protocol}//${window.location.hostname}`,
        };
    }
    else {
        rawSession = retrieveSessionFromLocalStorage();
    }
    // monitor-until: forever, could be handy to troubleshoot issues until session manager rework
    addTelemetryDebug('Unexpected session state', {
        sessionStoreStrategyType: sessionStoreStrategyType.type,
        session: rawSession,
        isSyntheticsTest: isSyntheticsTest(),
        createdTimestamp: rawSession === null || rawSession === void 0 ? void 0 : rawSession.created,
        expireTimestamp: rawSession === null || rawSession === void 0 ? void 0 : rawSession.expire,
        ...cookieContext,
    });
}
function detectSessionIdChange(configuration, initialSessionState) {
    if (!window.cookieStore || !initialSessionState.created) {
        return;
    }
    const sessionCreatedTime = Number(initialSessionState.created);
    const sdkInitTime = dateNow();
    const { stop } = addEventListener(configuration, cookieStore, "change" /* DOM_EVENT.CHANGE */, listener);
    function listener(event) {
        const changed = findLast(event.changed, (change) => change.name === SESSION_STORE_KEY);
        if (!changed) {
            return;
        }
        const sessionAge = dateNow() - sessionCreatedTime;
        if (sessionAge > 14 * ONE_MINUTE) {
            // The session might have expired just because it's too old or lack activity
            stop();
        }
        else {
            const newSessionState = toSessionState(changed.value);
            if (newSessionState.id && newSessionState.id !== initialSessionState.id) {
                stop();
                const time = dateNow() - sdkInitTime;
                getSessionCookies()
                    .then((cookie) => {
                    // monitor-until: 2026-04-01, after RUM-10845 investigation done
                    addTelemetryDebug('Session cookie changed', {
                        time,
                        session_age: sessionAge,
                        old: initialSessionState,
                        new: newSessionState,
                        cookie,
                    });
                })
                    .catch(monitorError);
            }
        }
    }
}
async function getSessionCookies() {
    let sessionCookies;
    if ('cookieStore' in window) {
        sessionCookies = await window.cookieStore.getAll(SESSION_STORE_KEY);
    }
    else {
        sessionCookies = document.cookie.split(/\s*;\s*/).filter((cookie) => cookie.startsWith(SESSION_STORE_KEY));
    }
    return {
        count: sessionCookies.length,
        domain: getCurrentSite() || 'undefined',
        ...sessionCookies,
    };
}

// eslint-disable-next-line no-restricted-syntax
class AbstractLifeCycle {
    constructor() {
        this.callbacks = {};
    }
    notify(eventType, data) {
        const eventCallbacks = this.callbacks[eventType];
        if (eventCallbacks) {
            eventCallbacks.forEach((callback) => callback(data));
        }
    }
    subscribe(eventType, callback) {
        if (!this.callbacks[eventType]) {
            this.callbacks[eventType] = [];
        }
        this.callbacks[eventType].push(callback);
        return {
            unsubscribe: () => {
                this.callbacks[eventType] = this.callbacks[eventType].filter((other) => callback !== other);
            },
        };
    }
}

// Limit the maximum number of actions, errors and logs per minutes
const EVENT_RATE_LIMIT = 3000;
function createEventRateLimiter(eventType, onLimitReached, limit = EVENT_RATE_LIMIT) {
    let eventCount = 0;
    let allowNextEvent = false;
    return {
        isLimitReached() {
            if (eventCount === 0) {
                setTimeout$1(() => {
                    eventCount = 0;
                }, ONE_MINUTE);
            }
            eventCount += 1;
            if (eventCount <= limit || allowNextEvent) {
                allowNextEvent = false;
                return false;
            }
            if (eventCount === limit + 1) {
                allowNextEvent = true;
                try {
                    onLimitReached({
                        message: `Reached max number of ${eventType}s by minute: ${limit}`,
                        source: ErrorSource.AGENT,
                        startClocks: clocksNow(),
                    });
                }
                finally {
                    allowNextEvent = false;
                }
            }
            return true;
        },
    };
}

function runOnReadyState(configuration, expectedReadyState, callback) {
    if (document.readyState === expectedReadyState || document.readyState === 'complete') {
        callback();
        return { stop: noop };
    }
    const eventName = expectedReadyState === 'complete' ? "load" /* DOM_EVENT.LOAD */ : "DOMContentLoaded" /* DOM_EVENT.DOM_CONTENT_LOADED */;
    return addEventListener(configuration, window, eventName, callback, { once: true });
}
function asyncRunOnReadyState(configuration, expectedReadyState) {
    return new Promise((resolve) => {
        runOnReadyState(configuration, expectedReadyState, resolve);
    });
}

let xhrObservable;
const xhrContexts = new WeakMap();
function initXhrObservable(configuration) {
    if (!xhrObservable) {
        xhrObservable = createXhrObservable(configuration);
    }
    return xhrObservable;
}
function createXhrObservable(configuration) {
    return new Observable((observable) => {
        const { stop: stopInstrumentingStart } = instrumentMethod(XMLHttpRequest.prototype, 'open', openXhr);
        const { stop: stopInstrumentingSend } = instrumentMethod(XMLHttpRequest.prototype, 'send', (call) => {
            sendXhr(call, configuration, observable);
        }, { computeHandlingStack: true });
        const { stop: stopInstrumentingAbort } = instrumentMethod(XMLHttpRequest.prototype, 'abort', abortXhr);
        return () => {
            stopInstrumentingStart();
            stopInstrumentingSend();
            stopInstrumentingAbort();
        };
    });
}
function openXhr({ target: xhr, parameters: [method, url] }) {
    xhrContexts.set(xhr, {
        state: 'open',
        method: String(method).toUpperCase(),
        url: normalizeUrl(String(url)),
    });
}
function sendXhr({ target: xhr, parameters: [body], handlingStack }, configuration, observable) {
    const context = xhrContexts.get(xhr);
    if (!context) {
        return;
    }
    const startContext = context;
    startContext.state = 'start';
    startContext.startClocks = clocksNow();
    startContext.isAborted = false;
    startContext.xhr = xhr;
    startContext.handlingStack = handlingStack;
    startContext.requestBody = body;
    let hasBeenReported = false;
    const { stop: stopInstrumentingOnReadyStateChange } = instrumentMethod(xhr, 'onreadystatechange', () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            // Try to report the XHR as soon as possible, because the XHR may be mutated by the
            // application during a future event. For example, Angular is calling .abort() on
            // completed requests during an onreadystatechange event, so the status becomes '0'
            // before the request is collected.
            onEnd();
        }
    });
    const onEnd = () => {
        unsubscribeLoadEndListener();
        stopInstrumentingOnReadyStateChange();
        if (hasBeenReported) {
            return;
        }
        hasBeenReported = true;
        const completeContext = context;
        completeContext.state = 'complete';
        completeContext.duration = elapsed(startContext.startClocks.timeStamp, timeStampNow());
        completeContext.status = xhr.status;
        if (typeof xhr.response === 'string') {
            completeContext.responseBody = xhr.response;
        }
        observable.notify(shallowClone(completeContext));
    };
    const { stop: unsubscribeLoadEndListener } = addEventListener(configuration, xhr, 'loadend', onEnd);
    observable.notify(startContext);
}
function abortXhr({ target: xhr }) {
    const context = xhrContexts.get(xhr);
    if (context) {
        context.isAborted = true;
    }
}

/**
 * Read bytes from a ReadableStream until the end of the stream.
 * Returns the bytes if collectStreamBody is true, otherwise returns undefined.
 */
async function readBytesFromStream(stream, options) {
    const reader = stream.getReader();
    const chunks = [];
    while (true) {
        const result = await reader.read();
        if (result.done) {
            break;
        }
        if (options.collectStreamBody) {
            chunks.push(result.value);
        }
    }
    reader.cancel().catch(
    // we don't care if cancel fails, but we still need to catch the error to avoid reporting it
    // as an unhandled rejection
    noop);
    return options.collectStreamBody ? concatBuffers(chunks) : undefined;
}

let fetchObservable;
const responseBodyActionGetters = [];
function initFetchObservable({ responseBodyAction } = {}) {
    if (responseBodyAction) {
        responseBodyActionGetters.push(responseBodyAction);
    }
    if (!fetchObservable) {
        fetchObservable = createFetchObservable();
    }
    return fetchObservable;
}
function createFetchObservable() {
    return new Observable((observable) => {
        // eslint-disable-next-line local-rules/disallow-zone-js-patched-values
        if (!globalObject.fetch) {
            return;
        }
        const { stop } = instrumentMethod(globalObject, 'fetch', (call) => beforeSend(call, observable), {
            computeHandlingStack: true,
        });
        return stop;
    });
}
function beforeSend({ parameters, onPostCall, handlingStack }, observable) {
    const [input, init] = parameters;
    let methodFromParams = init && init.method;
    if (methodFromParams === undefined && input instanceof Request) {
        methodFromParams = input.method;
    }
    const method = methodFromParams !== undefined ? String(methodFromParams).toUpperCase() : 'GET';
    const url = input instanceof Request ? input.url : normalizeUrl(String(input));
    const startClocks = clocksNow();
    const context = {
        state: 'start',
        init,
        input,
        method,
        startClocks,
        url,
        handlingStack,
    };
    observable.notify(context);
    // Those properties can be changed by observable subscribers
    parameters[0] = context.input;
    parameters[1] = context.init;
    onPostCall((responsePromise) => {
        afterSend(observable, responsePromise, context).catch(monitorError);
    });
}
async function afterSend(observable, responsePromise, startContext) {
    var _a, _b;
    const context = startContext;
    context.state = 'resolve';
    let response;
    try {
        response = await responsePromise;
    }
    catch (error) {
        context.status = 0;
        context.isAborted =
            ((_b = (_a = context.init) === null || _a === void 0 ? void 0 : _a.signal) === null || _b === void 0 ? void 0 : _b.aborted) || (error instanceof DOMException && error.code === DOMException.ABORT_ERR);
        context.error = error;
        observable.notify(context);
        return;
    }
    context.response = response;
    context.status = response.status;
    context.responseType = response.type;
    context.isAborted = false;
    const responseBodyCondition = responseBodyActionGetters.reduce((action, getter) => Math.max(action, getter(context)), 0 /* ResponseBodyAction.IGNORE */);
    if (responseBodyCondition !== 0 /* ResponseBodyAction.IGNORE */) {
        const clonedResponse = tryToClone(response);
        if (clonedResponse && clonedResponse.body) {
            try {
                const bytes = await readBytesFromStream(clonedResponse.body, {
                    collectStreamBody: responseBodyCondition === 2 /* ResponseBodyAction.COLLECT */,
                });
                context.responseBody = bytes && new TextDecoder().decode(bytes);
            }
            catch (_c) {
                // Ignore errors when reading the response body (e.g., stream aborted, network errors)
                // This is not critical and should not be reported as an SDK error
            }
        }
    }
    observable.notify(context);
}

/**
 * 'requestIdleCallback' with a shim.
 */
function requestIdleCallback(callback, opts) {
    // Note: check both 'requestIdleCallback' and 'cancelIdleCallback' existence because some polyfills only implement 'requestIdleCallback'.
    if (window.requestIdleCallback && window.cancelIdleCallback) {
        const id = window.requestIdleCallback(monitor(callback), opts);
        return () => window.cancelIdleCallback(id);
    }
    return requestIdleCallbackShim(callback);
}
const MAX_TASK_TIME = 50;
/*
 * Shim from https://developer.chrome.com/blog/using-requestidlecallback#checking_for_requestidlecallback
 * Note: there is no simple way to support the "timeout" option, so we ignore it.
 */
function requestIdleCallbackShim(callback) {
    const start = dateNow();
    const timeoutId = setTimeout$1(() => {
        callback({
            didTimeout: false,
            timeRemaining: () => Math.max(0, MAX_TASK_TIME - (dateNow() - start)),
        });
    }, 0);
    return () => clearTimeout$1(timeoutId);
}

/**
 * Maximum delay before starting to execute tasks in the queue. We don't want to wait too long
 * before running tasks, as it might hurt reliability (ex: if the user navigates away, we might lose
 * the opportunity to send some data). We also don't want to run tasks too often, as it might hurt
 * performance.
 */
const IDLE_CALLBACK_TIMEOUT = ONE_SECOND;
/**
 * Maximum amount of time allocated to running tasks when a timeout (`IDLE_CALLBACK_TIMEOUT`) is
 * reached. We should not run tasks for too long as it will hurt performance, but we should still
 * run some tasks to avoid postponing them forever.
 *
 * Rational: Running tasks for 30ms every second (IDLE_CALLBACK_TIMEOUT) should be acceptable.
 */
const MAX_EXECUTION_TIME_ON_TIMEOUT = 30;
function createTaskQueue() {
    const pendingTasks = [];
    function run(deadline) {
        let executionTimeRemaining;
        if (deadline.didTimeout) {
            const start = performance.now();
            executionTimeRemaining = () => MAX_EXECUTION_TIME_ON_TIMEOUT - (performance.now() - start);
        }
        else {
            executionTimeRemaining = deadline.timeRemaining.bind(deadline);
        }
        while (executionTimeRemaining() > 0 && pendingTasks.length) {
            pendingTasks.shift()();
        }
        if (pendingTasks.length) {
            scheduleNextRun();
        }
    }
    function scheduleNextRun() {
        requestIdleCallback(run, { timeout: IDLE_CALLBACK_TIMEOUT });
    }
    return {
        push(task) {
            if (pendingTasks.push(task) === 1) {
                scheduleNextRun();
            }
        },
        stop() {
            pendingTasks.length = 0;
        },
    };
}

let consoleObservablesByApi = {};
function initConsoleObservable(apis) {
    const consoleObservables = apis.map((api) => {
        if (!consoleObservablesByApi[api]) {
            consoleObservablesByApi[api] = createConsoleObservable(api); // we are sure that the observable created for this api will yield the expected ConsoleLog type
        }
        return consoleObservablesByApi[api];
    });
    return mergeObservables(...consoleObservables);
}
function createConsoleObservable(api) {
    return new Observable((observable) => {
        const originalConsoleApi = globalConsole[api];
        globalConsole[api] = (...params) => {
            originalConsoleApi.apply(console, params);
            const handlingStack = createHandlingStack('console error');
            callMonitored(() => {
                observable.notify(buildConsoleLog(params, api, handlingStack));
            });
        };
        return () => {
            globalConsole[api] = originalConsoleApi;
        };
    });
}
function buildConsoleLog(params, api, handlingStack) {
    const message = params.map((param) => formatConsoleParameters(param)).join(' ');
    if (api === ConsoleApiName.error) {
        const firstErrorParam = params.find(isError);
        const rawError = computeRawError({
            originalError: firstErrorParam,
            handlingStack,
            startClocks: clocksNow(),
            source: ErrorSource.CONSOLE,
            handling: "handled" /* ErrorHandling.HANDLED */,
            nonErrorPrefix: "Provided" /* NonErrorPrefix.PROVIDED */,
            // if no good stack is computed from the error, let's not use the fallback stack message
            // advising the user to use an instance of Error, as console.error is commonly used without an
            // Error instance.
            useFallbackStack: false,
        });
        // Use the full log message as the error message instead of just the error instance message.
        rawError.message = message;
        return {
            api,
            message,
            handlingStack,
            error: rawError,
        };
    }
    return {
        api,
        message,
        error: undefined,
        handlingStack,
    };
}
function formatConsoleParameters(param) {
    if (typeof param === 'string') {
        return sanitize(param);
    }
    if (isError(param)) {
        return formatErrorMessage(computeStackTrace(param));
    }
    return jsonStringify(sanitize(param), undefined, 2);
}

const BUFFER_LIMIT$1 = 500;
/**
 * createBoundedBuffer creates a BoundedBuffer.
 *
 * @deprecated Use `BufferedObservable` instead.
 */
function createBoundedBuffer() {
    const buffer = [];
    const add = (callback) => {
        const length = buffer.push(callback);
        if (length > BUFFER_LIMIT$1) {
            buffer.splice(0, 1);
        }
    };
    const remove = (callback) => {
        removeItem(buffer, callback);
    };
    const drain = (arg) => {
        buffer.forEach((callback) => callback(arg));
        buffer.length = 0;
    };
    return {
        add,
        remove,
        drain,
    };
}

/**
 * Simple check to ensure an object is a valid context
 */
function checkContext(maybeContext) {
    const isValid = getType(maybeContext) === 'object';
    if (!isValid) {
        display.error('Unsupported context:', maybeContext);
    }
    return isValid;
}

function ensureProperties(context, propertiesConfig, name) {
    const newContext = { ...context };
    for (const [key, { required, type }] of Object.entries(propertiesConfig)) {
        /**
         * Ensure specified properties are strings as defined here:
         * https://docs.datadoghq.com/logs/log_configuration/attributes_naming_convention/#user-related-attributes
         */
        if (type === 'string' && !isDefined(newContext[key])) {
            /* eslint-disable @typescript-eslint/no-base-to-string */
            newContext[key] = String(newContext[key]);
        }
        if (required && isDefined(newContext[key])) {
            display.warn(`The property ${key} of ${name} is required; context will not be sent to the intake.`);
        }
    }
    return newContext;
}
function isDefined(value) {
    return value === undefined || value === null || value === '';
}
function createContextManager(name = '', { propertiesConfig = {}, } = {}) {
    let context = {};
    const changeObservable = new Observable();
    const contextManager = {
        getContext: () => deepClone(context),
        setContext: (newContext) => {
            if (checkContext(newContext)) {
                context = sanitize(ensureProperties(newContext, propertiesConfig, name));
            }
            else {
                contextManager.clearContext();
            }
            changeObservable.notify();
        },
        setContextProperty: (key, property) => {
            context = sanitize(ensureProperties({ ...context, [key]: property }, propertiesConfig, name));
            changeObservable.notify();
        },
        removeContextProperty: (key) => {
            delete context[key];
            ensureProperties(context, propertiesConfig, name);
            changeObservable.notify();
        },
        clearContext: () => {
            context = {};
            changeObservable.notify();
        },
        changeObservable,
    };
    return contextManager;
}

function defineContextMethod(getStrategy, contextName, methodName, usage) {
    return monitor((...args) => {
        if (usage) {
            addTelemetryUsage({ feature: usage });
        }
        return getStrategy()[contextName][methodName](...args);
    });
}

const CONTEXT_STORE_KEY_PREFIX = '_dd_c';
const storageListeners = [];
function storeContextManager(configuration, contextManager, productKey, customerDataType) {
    const storageKey = buildStorageKey(productKey, customerDataType);
    storageListeners.push(addEventListener(configuration, window, "storage" /* DOM_EVENT.STORAGE */, ({ key }) => {
        if (storageKey === key) {
            synchronizeWithStorage();
        }
    }));
    contextManager.changeObservable.subscribe(dumpToStorage);
    const contextFromStorage = combine(getFromStorage(), contextManager.getContext());
    if (!isEmptyObject(contextFromStorage)) {
        contextManager.setContext(contextFromStorage);
    }
    function synchronizeWithStorage() {
        contextManager.setContext(getFromStorage());
    }
    function dumpToStorage() {
        localStorage.setItem(storageKey, JSON.stringify(contextManager.getContext()));
    }
    function getFromStorage() {
        const rawContext = localStorage.getItem(storageKey);
        return rawContext ? JSON.parse(rawContext) : {};
    }
}
function buildStorageKey(productKey, customerDataType) {
    return `${CONTEXT_STORE_KEY_PREFIX}_${productKey}_${customerDataType}`;
}

function startAccountContext(hooks, configuration, productKey) {
    const accountContextManager = buildAccountContextManager();
    if (configuration.storeContextsAcrossPages) {
        storeContextManager(configuration, accountContextManager, productKey, 4 /* CustomerDataType.Account */);
    }
    hooks.register(0 /* HookNames.Assemble */, () => {
        const account = accountContextManager.getContext();
        if (isEmptyObject(account) || !account.id) {
            return SKIPPED;
        }
        return {
            account,
        };
    });
    return accountContextManager;
}
function buildAccountContextManager() {
    return createContextManager('account', {
        propertiesConfig: {
            id: { type: 'string', required: true },
            name: { type: 'string' },
        },
    });
}

function startGlobalContext(hooks, configuration, productKey, useContextNamespace) {
    const globalContextManager = buildGlobalContextManager();
    if (configuration.storeContextsAcrossPages) {
        storeContextManager(configuration, globalContextManager, productKey, 2 /* CustomerDataType.GlobalContext */);
    }
    hooks.register(0 /* HookNames.Assemble */, () => {
        const context = globalContextManager.getContext();
        return { context } ;
    });
    return globalContextManager;
}
function buildGlobalContextManager() {
    return createContextManager('global context');
}

function startUserContext(hooks, configuration, sessionManager, productKey) {
    const userContextManager = buildUserContextManager();
    if (configuration.storeContextsAcrossPages) {
        storeContextManager(configuration, userContextManager, productKey, 1 /* CustomerDataType.User */);
    }
    hooks.register(0 /* HookNames.Assemble */, ({ eventType, startTime }) => {
        const user = userContextManager.getContext();
        const session = sessionManager.findTrackedSession(startTime);
        if (session && session.anonymousId && !user.anonymous_id && !!configuration.trackAnonymousUser) {
            user.anonymous_id = session.anonymousId;
        }
        if (isEmptyObject(user)) {
            return SKIPPED;
        }
        return {
            type: eventType,
            usr: user,
        };
    });
    hooks.register(1 /* HookNames.AssembleTelemetry */, ({ startTime }) => {
        var _a;
        return ({
            anonymous_id: (_a = sessionManager.findTrackedSession(startTime)) === null || _a === void 0 ? void 0 : _a.anonymousId,
        });
    });
    return userContextManager;
}
function buildUserContextManager() {
    return createContextManager('user', {
        propertiesConfig: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
        },
    });
}

// Use a const instead of const enum to avoid inlining the enum values in the bundle and save bytes
const CustomerContextKey = {
    userContext: 'userContext',
    globalContext: 'globalContext',
    accountContext: 'accountContext',
};
// Use a const instead of const enum to avoid inlining the enum values in the bundle and save bytes
const ContextManagerMethod = {
    getContext: 'getContext',
    setContext: 'setContext',
    setContextProperty: 'setContextProperty',
    removeContextProperty: 'removeContextProperty',
    clearContext: 'clearContext',
};

const ResourceType = {
    DOCUMENT: 'document',
    XHR: 'xhr',
    BEACON: 'beacon',
    FETCH: 'fetch',
    CSS: 'css',
    JS: 'js',
    IMAGE: 'image',
    FONT: 'font',
    MEDIA: 'media',
    OTHER: 'other',
};
const RequestType = {
    FETCH: ResourceType.FETCH,
    XHR: ResourceType.XHR,
};

const BUFFER_LIMIT = 500;
function startBufferingData(trackRuntimeErrorImpl = trackRuntimeError) {
    const observable = new BufferedObservable(BUFFER_LIMIT);
    const runtimeErrorSubscription = trackRuntimeErrorImpl().subscribe((error) => {
        observable.notify({
            type: 0 /* BufferedDataType.RUNTIME_ERROR */,
            error,
        });
    });
    return {
        observable,
        stop: () => {
            runtimeErrorSubscription.unsubscribe();
        },
    };
}

function getTimeZone() {
    try {
        const intl = new Intl.DateTimeFormat();
        return intl.resolvedOptions().timeZone;
    }
    catch (_a) {
        return undefined;
    }
}

const RumEventType = {
    ACTION: 'action',
    ERROR: 'error',
    LONG_TASK: 'long_task',
    VIEW: 'view',
    RESOURCE: 'resource',
    VITAL: 'vital',
};
const RumLongTaskEntryType = {
    LONG_TASK: 'long-task',
    LONG_ANIMATION_FRAME: 'long-animation-frame',
};
const ViewLoadingType = {
    INITIAL_LOAD: 'initial_load',
    ROUTE_CHANGE: 'route_change',
    BF_CACHE: 'bf_cache',
};
const ActionType = {
    CLICK: 'click',
    CUSTOM: 'custom'};
const FrustrationType = {
    RAGE_CLICK: 'rage_click',
    ERROR_CLICK: 'error_click',
    DEAD_CLICK: 'dead_click',
};
const VitalType = {
    DURATION: 'duration',
    OPERATION_STEP: 'operation_step',
};

function createCustomVitalsState() {
    const vitalsByName = new Map();
    const vitalsByReference = new WeakMap();
    return { vitalsByName, vitalsByReference };
}
function startVitalCollection(lifeCycle, pageStateHistory, customVitalsState) {
    function isValid(vital) {
        return !pageStateHistory.wasInPageStateDuringPeriod("frozen" /* PageState.FROZEN */, vital.startClocks.relative, vital.duration);
    }
    function addDurationVital(vital) {
        if (isValid(vital)) {
            lifeCycle.notify(12 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, processVital(vital));
        }
    }
    function addOperationStepVital(name, stepType, options, failureReason) {
        if (!isExperimentalFeatureEnabled(ExperimentalFeature.FEATURE_OPERATION_VITAL)) {
            return;
        }
        const { operationKey, context, description } = options || {};
        const vital = {
            name,
            type: VitalType.OPERATION_STEP,
            operationKey,
            failureReason,
            stepType,
            startClocks: clocksNow(),
            context: sanitize(context),
            description,
        };
        lifeCycle.notify(12 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, processVital(vital));
    }
    return {
        addOperationStepVital,
        addDurationVital,
        startDurationVital: (name, options = {}) => startDurationVital(customVitalsState, name, options),
        stopDurationVital: (nameOrRef, options = {}) => {
            stopDurationVital(addDurationVital, customVitalsState, nameOrRef, options);
        },
    };
}
function startDurationVital({ vitalsByName, vitalsByReference }, name, options = {}) {
    const vital = {
        name,
        startClocks: clocksNow(),
        ...options,
    };
    // To avoid leaking implementation details of the vital, we return a reference to it.
    const reference = { __dd_vital_reference: true };
    vitalsByName.set(name, vital);
    // To avoid memory leaks caused by the creation of numerous references (e.g., from improper useEffect implementations), we use a WeakMap.
    vitalsByReference.set(reference, vital);
    return reference;
}
function stopDurationVital(stopCallback, { vitalsByName, vitalsByReference }, nameOrRef, options = {}) {
    const vitalStart = typeof nameOrRef === 'string' ? vitalsByName.get(nameOrRef) : vitalsByReference.get(nameOrRef);
    if (!vitalStart) {
        return;
    }
    stopCallback(buildDurationVital(vitalStart, vitalStart.startClocks, options, clocksNow()));
    if (typeof nameOrRef === 'string') {
        vitalsByName.delete(nameOrRef);
    }
    else {
        vitalsByReference.delete(nameOrRef);
    }
}
function buildDurationVital(vitalStart, startClocks, stopOptions, stopClocks) {
    var _a;
    return {
        name: vitalStart.name,
        type: VitalType.DURATION,
        startClocks,
        duration: elapsed(startClocks.timeStamp, stopClocks.timeStamp),
        context: combine(vitalStart.context, stopOptions.context),
        description: (_a = stopOptions.description) !== null && _a !== void 0 ? _a : vitalStart.description,
        handlingStack: vitalStart.handlingStack,
    };
}
function processVital(vital) {
    const { startClocks, type, name, description, context, handlingStack } = vital;
    const vitalData = {
        id: generateUUID(),
        type,
        name,
        description,
        ...(type === VitalType.DURATION
            ? { duration: toServerDuration(vital.duration) }
            : {
                step_type: vital.stepType,
                operation_key: vital.operationKey,
                failure_reason: vital.failureReason,
            }),
    };
    return {
        rawRumEvent: {
            date: startClocks.timeStamp,
            vital: vitalData,
            type: RumEventType.VITAL,
            context,
        },
        startTime: startClocks.relative,
        duration: type === VitalType.DURATION ? vital.duration : undefined,
        domainContext: handlingStack ? { handlingStack } : {},
    };
}

function callPluginsMethod(plugins, methodName, parameter) {
    if (!plugins) {
        return;
    }
    for (const plugin of plugins) {
        const method = plugin[methodName];
        if (method) {
            method(parameter);
        }
    }
}

const createHooks = (abstractHooks);

const DEFAULT_PROPAGATOR_TYPES = ['tracecontext', 'datadog'];
function validateAndBuildRumConfiguration(initConfiguration, errorStack) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (initConfiguration.trackFeatureFlagsForEvents !== undefined &&
        !Array.isArray(initConfiguration.trackFeatureFlagsForEvents)) {
        display.warn('trackFeatureFlagsForEvents should be an array');
    }
    if (!initConfiguration.applicationId) {
        display.error('Application ID is not configured, no RUM data will be collected.');
        return;
    }
    if (!isSampleRate(initConfiguration.sessionReplaySampleRate, 'Session Replay') ||
        !isSampleRate(initConfiguration.traceSampleRate, 'Trace')) {
        return;
    }
    if (initConfiguration.excludedActivityUrls !== undefined && !Array.isArray(initConfiguration.excludedActivityUrls)) {
        display.error('Excluded Activity Urls should be an array');
        return;
    }
    const allowedTracingUrls = validateAndBuildTracingOptions(initConfiguration);
    if (!allowedTracingUrls) {
        return;
    }
    const baseConfiguration = validateAndBuildConfiguration(initConfiguration, errorStack);
    const allowedGraphQlUrls = validateAndBuildGraphQlOptions(initConfiguration);
    if (!baseConfiguration) {
        return;
    }
    const sessionReplaySampleRate = (_a = initConfiguration.sessionReplaySampleRate) !== null && _a !== void 0 ? _a : 0;
    return {
        applicationId: initConfiguration.applicationId,
        actionNameAttribute: initConfiguration.actionNameAttribute,
        betaTrackActionsInShadowDom: !!initConfiguration.betaTrackActionsInShadowDom,
        sessionReplaySampleRate,
        startSessionReplayRecordingManually: initConfiguration.startSessionReplayRecordingManually !== undefined
            ? !!initConfiguration.startSessionReplayRecordingManually
            : sessionReplaySampleRate === 0,
        traceSampleRate: (_b = initConfiguration.traceSampleRate) !== null && _b !== void 0 ? _b : 100,
        rulePsr: isNumber(initConfiguration.traceSampleRate) ? initConfiguration.traceSampleRate / 100 : undefined,
        allowedTracingUrls,
        excludedActivityUrls: (_c = initConfiguration.excludedActivityUrls) !== null && _c !== void 0 ? _c : [],
        workerUrl: initConfiguration.workerUrl,
        compressIntakeRequests: !!initConfiguration.compressIntakeRequests,
        trackUserInteractions: !!((_d = initConfiguration.trackUserInteractions) !== null && _d !== void 0 ? _d : true),
        trackViewsManually: !!initConfiguration.trackViewsManually,
        trackResources: !!((_e = initConfiguration.trackResources) !== null && _e !== void 0 ? _e : true),
        trackLongTasks: !!((_f = initConfiguration.trackLongTasks) !== null && _f !== void 0 ? _f : true),
        trackBfcacheViews: !!initConfiguration.trackBfcacheViews,
        trackEarlyRequests: !!initConfiguration.trackEarlyRequests,
        subdomain: initConfiguration.subdomain,
        defaultPrivacyLevel: objectHasValue(DefaultPrivacyLevel, initConfiguration.defaultPrivacyLevel)
            ? initConfiguration.defaultPrivacyLevel
            : DefaultPrivacyLevel.MASK,
        enablePrivacyForActionName: !!initConfiguration.enablePrivacyForActionName,
        traceContextInjection: objectHasValue(TraceContextInjection, initConfiguration.traceContextInjection)
            ? initConfiguration.traceContextInjection
            : TraceContextInjection.SAMPLED,
        plugins: initConfiguration.plugins || [],
        trackFeatureFlagsForEvents: initConfiguration.trackFeatureFlagsForEvents || [],
        profilingSampleRate: (_g = initConfiguration.profilingSampleRate) !== null && _g !== void 0 ? _g : 0,
        propagateTraceBaggage: !!initConfiguration.propagateTraceBaggage,
        allowedGraphQlUrls,
        ...baseConfiguration,
    };
}
/**
 * Validates allowedTracingUrls and converts match options to tracing options
 */
function validateAndBuildTracingOptions(initConfiguration) {
    if (initConfiguration.allowedTracingUrls === undefined) {
        return [];
    }
    if (!Array.isArray(initConfiguration.allowedTracingUrls)) {
        display.error('Allowed Tracing URLs should be an array');
        return;
    }
    if (initConfiguration.allowedTracingUrls.length !== 0 && initConfiguration.service === undefined) {
        display.error('Service needs to be configured when tracing is enabled');
        return;
    }
    // Convert from (MatchOption | TracingOption) to TracingOption, remove unknown properties
    const tracingOptions = [];
    initConfiguration.allowedTracingUrls.forEach((option) => {
        const normalizedOption = normalizeTracingOption(option);
        if (normalizedOption) {
            tracingOptions.push(normalizedOption);
        }
        else {
            display.warn('Allowed Tracing Urls parameters should be a string, RegExp, function, or an object. Ignoring parameter', option);
        }
    });
    return tracingOptions;
}
/**
 * Combines the selected tracing propagators from the different options in allowedTracingUrls
 */
function getSelectedTracingPropagators(configuration) {
    const usedTracingPropagators = new Set();
    if (isNonEmptyArray(configuration.allowedTracingUrls)) {
        configuration.allowedTracingUrls.forEach((option) => {
            var _a;
            (_a = normalizeTracingOption(option)) === null || _a === void 0 ? void 0 : _a.propagatorTypes.forEach((propagatorType) => usedTracingPropagators.add(propagatorType));
        });
    }
    return Array.from(usedTracingPropagators);
}
function normalizeTracingOption(option) {
    if (isMatchOption(option)) {
        return { match: option, propagatorTypes: DEFAULT_PROPAGATOR_TYPES };
    }
    if (isIndexableObject(option) &&
        isMatchOption(option.match) &&
        (option.propagatorTypes === null || option.propagatorTypes === undefined || Array.isArray(option.propagatorTypes))) {
        return {
            match: option.match,
            propagatorTypes: option.propagatorTypes || DEFAULT_PROPAGATOR_TYPES,
        };
    }
}
/**
 * Build GraphQL options from configuration
 */
function validateAndBuildGraphQlOptions(initConfiguration) {
    if (!initConfiguration.allowedGraphQlUrls) {
        return [];
    }
    if (!Array.isArray(initConfiguration.allowedGraphQlUrls)) {
        display.warn('allowedGraphQlUrls should be an array');
        return [];
    }
    const graphQlOptions = [];
    initConfiguration.allowedGraphQlUrls.forEach((option) => {
        if (isMatchOption(option)) {
            graphQlOptions.push({ match: option, trackPayload: false, trackResponseErrors: false });
        }
        else if (isIndexableObject(option) && isMatchOption(option.match)) {
            graphQlOptions.push({
                match: option.match,
                trackPayload: !!option.trackPayload,
                trackResponseErrors: !!option.trackResponseErrors,
            });
        }
    });
    return graphQlOptions;
}
function hasGraphQlPayloadTracking(allowedGraphQlUrls) {
    return (isNonEmptyArray(allowedGraphQlUrls) &&
        allowedGraphQlUrls.some((option) => isIndexableObject(option) && option.trackPayload));
}
function hasGraphQlResponseErrorsTracking(allowedGraphQlUrls) {
    return (isNonEmptyArray(allowedGraphQlUrls) &&
        allowedGraphQlUrls.some((option) => isIndexableObject(option) && option.trackResponseErrors));
}
function serializeRumConfiguration(configuration) {
    var _a;
    const baseSerializedConfiguration = serializeConfiguration(configuration);
    return {
        session_replay_sample_rate: configuration.sessionReplaySampleRate,
        start_session_replay_recording_manually: configuration.startSessionReplayRecordingManually,
        trace_sample_rate: configuration.traceSampleRate,
        trace_context_injection: configuration.traceContextInjection,
        propagate_trace_baggage: configuration.propagateTraceBaggage,
        action_name_attribute: configuration.actionNameAttribute,
        use_allowed_tracing_urls: isNonEmptyArray(configuration.allowedTracingUrls),
        use_allowed_graph_ql_urls: isNonEmptyArray(configuration.allowedGraphQlUrls),
        use_track_graph_ql_payload: hasGraphQlPayloadTracking(configuration.allowedGraphQlUrls),
        use_track_graph_ql_response_errors: hasGraphQlResponseErrorsTracking(configuration.allowedGraphQlUrls),
        selected_tracing_propagators: getSelectedTracingPropagators(configuration),
        default_privacy_level: configuration.defaultPrivacyLevel,
        enable_privacy_for_action_name: configuration.enablePrivacyForActionName,
        use_excluded_activity_urls: isNonEmptyArray(configuration.excludedActivityUrls),
        use_worker_url: !!configuration.workerUrl,
        compress_intake_requests: configuration.compressIntakeRequests,
        track_views_manually: configuration.trackViewsManually,
        track_user_interactions: configuration.trackUserInteractions,
        track_resources: configuration.trackResources,
        track_long_task: configuration.trackLongTasks,
        track_bfcache_views: configuration.trackBfcacheViews,
        track_early_requests: configuration.trackEarlyRequests,
        plugins: (_a = configuration.plugins) === null || _a === void 0 ? void 0 : _a.map((plugin) => {
            var _a;
            return ({
                name: plugin.name,
                ...(_a = plugin.getConfigurationTelemetry) === null || _a === void 0 ? void 0 : _a.call(plugin),
            });
        }),
        track_feature_flags_for_events: configuration.trackFeatureFlagsForEvents,
        remote_configuration_id: configuration.remoteConfigurationId,
        profiling_sample_rate: configuration.profilingSampleRate,
        use_remote_configuration_proxy: !!configuration.remoteConfigurationProxy,
        ...baseSerializedConfiguration,
    };
}

/**
 * Terminology inspired from https://www.rfc-editor.org/rfc/rfc9535.html
 *
 * jsonpath-query      = segment*
 * segment             = .name-shorthand / bracketed-selection
 * bracketed-selection = ['name-selector'] / ["name-selector"] / [index-selector]
 *
 * Useful references:
 * - https://goessner.net/articles/JsonPath/
 * - https://jsonpath.com/
 * - https://github.com/jsonpath-standard
 */
/**
 * Extract selectors from a simple JSON path expression, return [] for an invalid path
 *
 * Supports:
 * - Dot notation: `foo.bar.baz`
 * - Bracket notation: `['foo']["bar"]`
 * - Array indices: `items[0]`, `data['users'][1]`
 *
 * Examples:
 * parseJsonPath("['foo'].bar[12]")
 * => ['foo', 'bar', '12']
 *
 * parseJsonPath("['foo")
 * => []
 */
function parseJsonPath(path) {
    const selectors = [];
    let previousToken = 0 /* Token.START */;
    let currentToken;
    const parsingContext = { quote: undefined, escapeSequence: undefined };
    let currentSelector = '';
    for (const char of path) {
        // find which kind of token is this char
        currentToken = ALLOWED_NEXT_TOKENS[previousToken].find((token) => TOKEN_PREDICATE[token](char, parsingContext));
        if (!currentToken) {
            return [];
        }
        if (parsingContext.escapeSequence !== undefined && currentToken !== 12 /* Token.ESCAPE_SEQUENCE_CHAR */) {
            if (!isValidEscapeSequence(parsingContext.escapeSequence)) {
                return [];
            }
            currentSelector += resolveEscapeSequence(parsingContext.escapeSequence);
            parsingContext.escapeSequence = undefined;
        }
        if (ALLOWED_SELECTOR_TOKENS.includes(currentToken)) {
            // buffer the char if it belongs to the selector
            // ex: foo['bar']
            //      ^    ^
            currentSelector += char;
        }
        else if (ALLOWED_SELECTOR_DELIMITER_TOKENS.includes(currentToken) && currentSelector !== '') {
            // close the current path part if we have reach a path part delimiter
            // ex: foo.bar['qux']
            //        ^   ^     ^
            selectors.push(currentSelector);
            currentSelector = '';
        }
        else if (currentToken === 12 /* Token.ESCAPE_SEQUENCE_CHAR */) {
            parsingContext.escapeSequence = parsingContext.escapeSequence ? `${parsingContext.escapeSequence}${char}` : char;
        }
        else if (currentToken === 8 /* Token.QUOTE_START */) {
            parsingContext.quote = char;
        }
        else if (currentToken === 9 /* Token.QUOTE_END */) {
            parsingContext.quote = undefined;
        }
        previousToken = currentToken;
    }
    if (!ALLOWED_NEXT_TOKENS[previousToken].includes(1 /* Token.END */)) {
        return [];
    }
    if (currentSelector !== '') {
        selectors.push(currentSelector);
    }
    return selectors;
}
const NAME_SHORTHAND_FIRST_CHAR_REGEX = /[a-zA-Z_$]/;
const NAME_SHORTHAND_CHAR_REGEX = /[a-zA-Z0-9_$]/;
const DIGIT_REGEX = /[0-9]/;
const UNICODE_CHAR_REGEX = /[a-fA-F0-9]/;
const QUOTE_CHARS = '\'"';
const TOKEN_PREDICATE = {
    // no char should match to START or END
    [0 /* Token.START */]: () => false,
    [1 /* Token.END */]: () => false,
    [2 /* Token.NAME_SHORTHAND_FIRST_CHAR */]: (char) => NAME_SHORTHAND_FIRST_CHAR_REGEX.test(char),
    [3 /* Token.NAME_SHORTHAND_CHAR */]: (char) => NAME_SHORTHAND_CHAR_REGEX.test(char),
    [4 /* Token.DOT */]: (char) => char === '.',
    [5 /* Token.BRACKET_START */]: (char) => char === '[',
    [6 /* Token.BRACKET_END */]: (char) => char === ']',
    [7 /* Token.DIGIT */]: (char) => DIGIT_REGEX.test(char),
    [8 /* Token.QUOTE_START */]: (char) => QUOTE_CHARS.includes(char),
    [9 /* Token.QUOTE_END */]: (char, parsingContext) => char === parsingContext.quote,
    [10 /* Token.NAME_SELECTOR_CHAR */]: () => true, // any char can be used in name selector
    [11 /* Token.ESCAPE */]: (char) => char === '\\',
    [12 /* Token.ESCAPE_SEQUENCE_CHAR */]: (char, parsingContext) => {
        if (parsingContext.escapeSequence === undefined) {
            // see https://www.rfc-editor.org/rfc/rfc9535.html#name-semantics-3
            return `${parsingContext.quote}/\\bfnrtu`.includes(char);
        }
        else if (parsingContext.escapeSequence.startsWith('u') && parsingContext.escapeSequence.length < 5) {
            return UNICODE_CHAR_REGEX.test(char);
        }
        return false;
    },
};
const ALLOWED_NEXT_TOKENS = {
    [0 /* Token.START */]: [2 /* Token.NAME_SHORTHAND_FIRST_CHAR */, 5 /* Token.BRACKET_START */],
    [1 /* Token.END */]: [],
    [2 /* Token.NAME_SHORTHAND_FIRST_CHAR */]: [3 /* Token.NAME_SHORTHAND_CHAR */, 4 /* Token.DOT */, 5 /* Token.BRACKET_START */, 1 /* Token.END */],
    [3 /* Token.NAME_SHORTHAND_CHAR */]: [3 /* Token.NAME_SHORTHAND_CHAR */, 4 /* Token.DOT */, 5 /* Token.BRACKET_START */, 1 /* Token.END */],
    [4 /* Token.DOT */]: [2 /* Token.NAME_SHORTHAND_FIRST_CHAR */],
    [5 /* Token.BRACKET_START */]: [8 /* Token.QUOTE_START */, 7 /* Token.DIGIT */],
    [6 /* Token.BRACKET_END */]: [4 /* Token.DOT */, 5 /* Token.BRACKET_START */, 1 /* Token.END */],
    [7 /* Token.DIGIT */]: [7 /* Token.DIGIT */, 6 /* Token.BRACKET_END */],
    [8 /* Token.QUOTE_START */]: [11 /* Token.ESCAPE */, 9 /* Token.QUOTE_END */, 10 /* Token.NAME_SELECTOR_CHAR */],
    [9 /* Token.QUOTE_END */]: [6 /* Token.BRACKET_END */],
    [10 /* Token.NAME_SELECTOR_CHAR */]: [11 /* Token.ESCAPE */, 9 /* Token.QUOTE_END */, 10 /* Token.NAME_SELECTOR_CHAR */],
    [11 /* Token.ESCAPE */]: [12 /* Token.ESCAPE_SEQUENCE_CHAR */],
    [12 /* Token.ESCAPE_SEQUENCE_CHAR */]: [12 /* Token.ESCAPE_SEQUENCE_CHAR */, 11 /* Token.ESCAPE */, 9 /* Token.QUOTE_END */, 10 /* Token.NAME_SELECTOR_CHAR */],
};
// foo['bar\n'][12]
// ^^    ^ ^^   ^
const ALLOWED_SELECTOR_TOKENS = [
    2 /* Token.NAME_SHORTHAND_FIRST_CHAR */,
    3 /* Token.NAME_SHORTHAND_CHAR */,
    7 /* Token.DIGIT */,
    10 /* Token.NAME_SELECTOR_CHAR */,
];
// foo.bar['qux']
//    ^   ^     ^
const ALLOWED_SELECTOR_DELIMITER_TOKENS = [4 /* Token.DOT */, 5 /* Token.BRACKET_START */, 6 /* Token.BRACKET_END */];
function isValidEscapeSequence(escapeSequence) {
    return '"\'/\\bfnrt'.includes(escapeSequence) || (escapeSequence.startsWith('u') && escapeSequence.length === 5);
}
const ESCAPED_CHARS = {
    '"': '"',
    "'": "'",
    '/': '/',
    '\\': '\\',
    b: '\b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t',
};
function resolveEscapeSequence(escapeSequence) {
    if (escapeSequence.startsWith('u')) {
        // build Unicode char from code
        return String.fromCharCode(parseInt(escapeSequence.slice(1), 16));
    }
    return ESCAPED_CHARS[escapeSequence];
}

const REMOTE_CONFIGURATION_VERSION = 'v1';
const SUPPORTED_FIELDS = [
    'applicationId',
    'service',
    'env',
    'version',
    'sessionSampleRate',
    'sessionReplaySampleRate',
    'defaultPrivacyLevel',
    'enablePrivacyForActionName',
    'traceSampleRate',
    'trackSessionAcrossSubdomains',
    'allowedTracingUrls',
    'allowedTrackingOrigins',
];
async function fetchAndApplyRemoteConfiguration(initConfiguration, supportedContextManagers) {
    let rumInitConfiguration;
    const metrics = initMetrics();
    const fetchResult = await fetchRemoteConfiguration(initConfiguration);
    if (!fetchResult.ok) {
        metrics.increment('fetch', 'failure');
        display.error(fetchResult.error);
    }
    else {
        metrics.increment('fetch', 'success');
        rumInitConfiguration = applyRemoteConfiguration(initConfiguration, fetchResult.value, supportedContextManagers, metrics);
    }
    // monitor-until: forever
    addTelemetryMetrics("remote configuration metrics" /* TelemetryMetrics.REMOTE_CONFIGURATION_METRIC_NAME */, { metrics: metrics.get() });
    return rumInitConfiguration;
}
function applyRemoteConfiguration(initConfiguration, rumRemoteConfiguration, supportedContextManagers, metrics) {
    // intents:
    // - explicitly set each supported field to limit risk in case an attacker can create configurations
    // - check the existence in the remote config to avoid clearing a provided init field
    const appliedConfiguration = { ...initConfiguration };
    SUPPORTED_FIELDS.forEach((option) => {
        if (option in rumRemoteConfiguration) {
            appliedConfiguration[option] = resolveConfigurationProperty(rumRemoteConfiguration[option]);
        }
    });
    Object.keys(supportedContextManagers).forEach((context) => {
        if (rumRemoteConfiguration[context] !== undefined) {
            resolveContextProperty(supportedContextManagers[context], rumRemoteConfiguration[context]);
        }
    });
    return appliedConfiguration;
    // share context to access metrics
    function resolveConfigurationProperty(property) {
        if (Array.isArray(property)) {
            return property.map(resolveConfigurationProperty);
        }
        if (isIndexableObject(property)) {
            if (isSerializedOption(property)) {
                const type = property.rcSerializedType;
                switch (type) {
                    case 'string':
                        return property.value;
                    case 'regex':
                        return resolveRegex(property.value);
                    case 'dynamic':
                        return resolveDynamicOption(property);
                    default:
                        display.error(`Unsupported remote configuration: "rcSerializedType": "${type}"`);
                        return;
                }
            }
            return mapValues(property, resolveConfigurationProperty);
        }
        return property;
    }
    function resolveContextProperty(contextManager, contextItems) {
        contextItems.forEach(({ key, value }) => {
            contextManager.setContextProperty(key, resolveConfigurationProperty(value));
        });
    }
    function resolveDynamicOption(property) {
        const strategy = property.strategy;
        let resolvedValue;
        switch (strategy) {
            case 'cookie':
                resolvedValue = resolveCookieValue(property);
                break;
            case 'dom':
                resolvedValue = resolveDomValue(property);
                break;
            case 'js':
                resolvedValue = resolveJsValue(property);
                break;
            default:
                display.error(`Unsupported remote configuration: "strategy": "${strategy}"`);
                return;
        }
        const extractor = property.extractor;
        if (extractor !== undefined && typeof resolvedValue === 'string') {
            return extractValue(extractor, resolvedValue);
        }
        return resolvedValue;
    }
    function resolveCookieValue({ name }) {
        const value = getCookie(name);
        metrics.increment('cookie', value !== undefined ? 'success' : 'missing');
        return value;
    }
    function resolveDomValue({ selector, attribute }) {
        let element;
        try {
            element = document.querySelector(selector);
        }
        catch (_a) {
            display.error(`Invalid selector in the remote configuration: '${selector}'`);
            metrics.increment('dom', 'failure');
            return;
        }
        if (!element) {
            metrics.increment('dom', 'missing');
            return;
        }
        if (isForbidden(element, attribute)) {
            display.error(`Forbidden element selected by the remote configuration: '${selector}'`);
            metrics.increment('dom', 'failure');
            return;
        }
        const domValue = attribute !== undefined ? element.getAttribute(attribute) : element.textContent;
        if (domValue === null) {
            metrics.increment('dom', 'missing');
            return;
        }
        metrics.increment('dom', 'success');
        return domValue;
    }
    function isForbidden(element, attribute) {
        return element.getAttribute('type') === 'password' && attribute === 'value';
    }
    function resolveJsValue({ path }) {
        let current = window;
        const pathParts = parseJsonPath(path);
        if (pathParts.length === 0) {
            display.error(`Invalid JSON path in the remote configuration: '${path}'`);
            metrics.increment('js', 'failure');
            return;
        }
        for (const pathPart of pathParts) {
            if (!(pathPart in current)) {
                metrics.increment('js', 'missing');
                return;
            }
            try {
                current = current[pathPart];
            }
            catch (e) {
                display.error(`Error accessing: '${path}'`, e);
                metrics.increment('js', 'failure');
                return;
            }
        }
        metrics.increment('js', 'success');
        return current;
    }
}
function initMetrics() {
    const metrics = { fetch: {} };
    return {
        get: () => metrics,
        increment: (metricName, type) => {
            if (!metrics[metricName]) {
                metrics[metricName] = {};
            }
            if (!metrics[metricName][type]) {
                metrics[metricName][type] = 0;
            }
            metrics[metricName][type] = metrics[metricName][type] + 1;
        },
    };
}
function isSerializedOption(value) {
    return 'rcSerializedType' in value;
}
function resolveRegex(pattern) {
    try {
        return new RegExp(pattern);
    }
    catch (_a) {
        display.error(`Invalid regex in the remote configuration: '${pattern}'`);
    }
}
function extractValue(extractor, candidate) {
    const resolvedExtractor = resolveRegex(extractor.value);
    if (resolvedExtractor === undefined) {
        return;
    }
    const regexResult = resolvedExtractor.exec(candidate);
    if (regexResult === null) {
        return;
    }
    const [match, capture] = regexResult;
    return capture ? capture : match;
}
async function fetchRemoteConfiguration(configuration) {
    let response;
    try {
        response = await fetch$1(buildEndpoint(configuration));
    }
    catch (_a) {
        response = undefined;
    }
    if (!response || !response.ok) {
        return {
            ok: false,
            error: new Error('Error fetching the remote configuration.'),
        };
    }
    const remoteConfiguration = await response.json();
    if (remoteConfiguration.rum) {
        return {
            ok: true,
            value: remoteConfiguration.rum,
        };
    }
    return {
        ok: false,
        error: new Error('No remote configuration for RUM.'),
    };
}
function buildEndpoint(configuration) {
    if (configuration.remoteConfigurationProxy) {
        return configuration.remoteConfigurationProxy;
    }
    return `https://sdk-configuration.${buildEndpointHost('rum', configuration)}/${REMOTE_CONFIGURATION_VERSION}/${encodeURIComponent(configuration.remoteConfigurationId)}.json`;
}

function createPreStartStrategy$1({ ignoreInitIfSyntheticsWillInjectRum = true, startDeflateWorker }, trackingConsentState, customVitalsState, doStartRum, startTelemetryImpl = startTelemetry) {
    const bufferApiCalls = createBoundedBuffer();
    // TODO next major: remove the globalContextManager, userContextManager and accountContextManager from preStartStrategy and use an empty context instead
    const globalContext = buildGlobalContextManager();
    bufferContextCalls(globalContext, CustomerContextKey.globalContext, bufferApiCalls);
    const userContext = buildUserContextManager();
    bufferContextCalls(userContext, CustomerContextKey.userContext, bufferApiCalls);
    const accountContext = buildAccountContextManager();
    bufferContextCalls(accountContext, CustomerContextKey.accountContext, bufferApiCalls);
    let firstStartViewCall;
    let deflateWorker;
    let cachedInitConfiguration;
    let cachedConfiguration;
    let telemetry;
    const hooks = createHooks();
    const trackingConsentStateSubscription = trackingConsentState.observable.subscribe(tryStartRum);
    const emptyContext = {};
    function tryStartRum() {
        if (!cachedInitConfiguration || !cachedConfiguration || !trackingConsentState.isGranted()) {
            return;
        }
        // Start telemetry only once, when we have consent and configuration
        if (!telemetry) {
            telemetry = startTelemetryImpl("browser-rum-sdk" /* TelemetryService.RUM */, cachedConfiguration, hooks);
        }
        trackingConsentStateSubscription.unsubscribe();
        let initialViewOptions;
        if (cachedConfiguration.trackViewsManually) {
            if (!firstStartViewCall) {
                return;
            }
            // An initial view is always created when starting RUM.
            // When tracking views automatically, any startView call before RUM start creates an extra
            // view.
            // When tracking views manually, we use the ViewOptions from the first startView call as the
            // initial view options, and we remove the actual startView call so we don't create an extra
            // view.
            bufferApiCalls.remove(firstStartViewCall.callback);
            initialViewOptions = firstStartViewCall.options;
        }
        const startRumResult = doStartRum(cachedConfiguration, deflateWorker, initialViewOptions, telemetry, hooks);
        bufferApiCalls.drain(startRumResult);
    }
    function doInit(initConfiguration, errorStack) {
        const eventBridgeAvailable = canUseEventBridge();
        if (eventBridgeAvailable) {
            initConfiguration = overrideInitConfigurationForBridge(initConfiguration);
        }
        // Update the exposed initConfiguration to reflect the bridge and remote configuration overrides
        cachedInitConfiguration = initConfiguration;
        addTelemetryConfiguration(serializeRumConfiguration(initConfiguration));
        if (cachedConfiguration) {
            displayAlreadyInitializedError('DD_RUM', initConfiguration);
            return;
        }
        const configuration = validateAndBuildRumConfiguration(initConfiguration, errorStack);
        if (!configuration) {
            return;
        }
        if (!eventBridgeAvailable && !configuration.sessionStoreStrategyType) {
            display.warn('No storage available for session. We will not send any data.');
            return;
        }
        if (configuration.compressIntakeRequests && !eventBridgeAvailable && startDeflateWorker) {
            deflateWorker = startDeflateWorker(configuration, 'Datadog RUM', 
            // Worker initialization can fail asynchronously, especially in Firefox where even CSP
            // issues are reported asynchronously. For now, the SDK will continue its execution even if
            // data won't be sent to Datadog. We could improve this behavior in the future.
            noop);
            if (!deflateWorker) {
                // `startDeflateWorker` should have logged an error message explaining the issue
                return;
            }
        }
        cachedConfiguration = configuration;
        // Instrument fetch to track network requests
        // This is needed in case the consent is not granted and some customer
        // library (Apollo Client) is storing uninstrumented fetch to be used later
        // The subscription is needed so that the instrumentation process is completed
        initFetchObservable().subscribe(noop);
        trackingConsentState.tryToInit(configuration.trackingConsent);
        tryStartRum();
    }
    const addDurationVital = (vital) => {
        bufferApiCalls.add((startRumResult) => startRumResult.addDurationVital(vital));
    };
    const addOperationStepVital = (name, stepType, options, failureReason) => {
        bufferApiCalls.add((startRumResult) => startRumResult.addOperationStepVital(sanitize(name), stepType, sanitize(options), sanitize(failureReason)));
    };
    const strategy = {
        init(initConfiguration, publicApi, errorStack) {
            if (!initConfiguration) {
                display.error('Missing configuration');
                return;
            }
            // Set the experimental feature flags as early as possible, so we can use them in most places
            initFeatureFlags(initConfiguration.enableExperimentalFeatures);
            // Expose the initial configuration regardless of initialization success.
            cachedInitConfiguration = initConfiguration;
            // If we are in a Synthetics test configured to automatically inject a RUM instance, we want
            // to completely discard the customer application RUM instance by ignoring their init() call.
            // But, we should not ignore the init() call from the Synthetics-injected RUM instance, so the
            // internal `ignoreInitIfSyntheticsWillInjectRum` option is here to bypass this condition.
            if (ignoreInitIfSyntheticsWillInjectRum && willSyntheticsInjectRum()) {
                return;
            }
            callPluginsMethod(initConfiguration.plugins, 'onInit', { initConfiguration, publicApi });
            if (initConfiguration.remoteConfigurationId) {
                fetchAndApplyRemoteConfiguration(initConfiguration, { user: userContext, context: globalContext })
                    .then((initConfiguration) => {
                    if (initConfiguration) {
                        doInit(initConfiguration, errorStack);
                    }
                })
                    .catch(monitorError);
            }
            else {
                doInit(initConfiguration, errorStack);
            }
        },
        get initConfiguration() {
            return cachedInitConfiguration;
        },
        getInternalContext: noop,
        stopSession: noop,
        addTiming(name, time = timeStampNow()) {
            bufferApiCalls.add((startRumResult) => startRumResult.addTiming(name, time));
        },
        startView(options, startClocks = clocksNow()) {
            const callback = (startRumResult) => {
                startRumResult.startView(options, startClocks);
            };
            bufferApiCalls.add(callback);
            if (!firstStartViewCall) {
                firstStartViewCall = { options, callback };
                tryStartRum();
            }
        },
        setViewName(name) {
            bufferApiCalls.add((startRumResult) => startRumResult.setViewName(name));
        },
        // View context APIs
        setViewContext(context) {
            bufferApiCalls.add((startRumResult) => startRumResult.setViewContext(context));
        },
        setViewContextProperty(key, value) {
            bufferApiCalls.add((startRumResult) => startRumResult.setViewContextProperty(key, value));
        },
        getViewContext: () => emptyContext,
        globalContext,
        userContext,
        accountContext,
        addAction(action) {
            bufferApiCalls.add((startRumResult) => startRumResult.addAction(action));
        },
        startAction(name, options) {
            const startClocks = clocksNow();
            bufferApiCalls.add((startRumResult) => startRumResult.startAction(name, options, startClocks));
        },
        stopAction(name, options) {
            const stopClocks = clocksNow();
            bufferApiCalls.add((startRumResult) => startRumResult.stopAction(name, options, stopClocks));
        },
        addError(providedError) {
            bufferApiCalls.add((startRumResult) => startRumResult.addError(providedError));
        },
        addFeatureFlagEvaluation(key, value) {
            bufferApiCalls.add((startRumResult) => startRumResult.addFeatureFlagEvaluation(key, value));
        },
        startDurationVital(name, options) {
            return startDurationVital(customVitalsState, name, options);
        },
        stopDurationVital(name, options) {
            stopDurationVital(addDurationVital, customVitalsState, name, options);
        },
        addDurationVital,
        addOperationStepVital,
    };
    return strategy;
}
function overrideInitConfigurationForBridge(initConfiguration) {
    var _a, _b;
    return {
        ...initConfiguration,
        applicationId: '00000000-aaaa-0000-aaaa-000000000000',
        clientToken: 'empty',
        sessionSampleRate: 100,
        defaultPrivacyLevel: (_a = initConfiguration.defaultPrivacyLevel) !== null && _a !== void 0 ? _a : (_b = getEventBridge()) === null || _b === void 0 ? void 0 : _b.getPrivacyLevel(),
    };
}
function bufferContextCalls(preStartContextManager, name, bufferApiCalls) {
    preStartContextManager.changeObservable.subscribe(() => {
        const context = preStartContextManager.getContext();
        bufferApiCalls.add((startRumResult) => startRumResult[name].setContext(context));
    });
}

function makeRumPublicApi(startRumImpl, recorderApi, profilerApi, options = {}, startTelemetryImpl) {
    const trackingConsentState = createTrackingConsentState();
    const customVitalsState = createCustomVitalsState();
    const bufferedDataObservable = startBufferingData().observable;
    let strategy = createPreStartStrategy$1(options, trackingConsentState, customVitalsState, (configuration, deflateWorker, initialViewOptions, telemetry, hooks) => {
        const createEncoder = deflateWorker && options.createDeflateEncoder
            ? (streamId) => options.createDeflateEncoder(configuration, deflateWorker, streamId)
            : createIdentityEncoder;
        const startRumResult = startRumImpl(configuration, recorderApi, profilerApi, initialViewOptions, createEncoder, trackingConsentState, customVitalsState, bufferedDataObservable, telemetry, hooks, options.sdkName);
        recorderApi.onRumStart(startRumResult.lifeCycle, configuration, startRumResult.session, startRumResult.viewHistory, deflateWorker, startRumResult.telemetry);
        profilerApi.onRumStart(startRumResult.lifeCycle, startRumResult.hooks, configuration, startRumResult.session, startRumResult.viewHistory, startRumResult.longTaskContexts, createEncoder);
        strategy = createPostStartStrategy$1(strategy, startRumResult);
        callPluginsMethod(configuration.plugins, 'onRumStart', {
            strategy, // TODO: remove this in the next major release
            addEvent: startRumResult.addEvent,
        });
        return startRumResult;
    }, startTelemetryImpl);
    const getStrategy = () => strategy;
    const startView = (options) => {
        const handlingStack = createHandlingStack('view');
        callMonitored(() => {
            const sanitizedOptions = typeof options === 'object' ? options : { name: options };
            strategy.startView({ ...sanitizedOptions, handlingStack });
            addTelemetryUsage({ feature: 'start-view' });
        });
    };
    const rumPublicApi = makePublicApi({
        init: (initConfiguration) => {
            const errorStack = new Error().stack;
            callMonitored(() => strategy.init(initConfiguration, rumPublicApi, errorStack));
        },
        setTrackingConsent: monitor((trackingConsent) => {
            trackingConsentState.update(trackingConsent);
            addTelemetryUsage({ feature: 'set-tracking-consent', tracking_consent: trackingConsent });
        }),
        setViewName: monitor((name) => {
            strategy.setViewName(name);
            addTelemetryUsage({ feature: 'set-view-name' });
        }),
        setViewContext: monitor((context) => {
            strategy.setViewContext(context);
            addTelemetryUsage({ feature: 'set-view-context' });
        }),
        setViewContextProperty: monitor((key, value) => {
            strategy.setViewContextProperty(key, value);
            addTelemetryUsage({ feature: 'set-view-context-property' });
        }),
        getViewContext: monitor(() => {
            addTelemetryUsage({ feature: 'set-view-context-property' });
            return strategy.getViewContext();
        }),
        getInternalContext: monitor((startTime) => strategy.getInternalContext(startTime)),
        getInitConfiguration: monitor(() => deepClone(strategy.initConfiguration)),
        addAction: (name, context) => {
            const handlingStack = createHandlingStack('action');
            callMonitored(() => {
                strategy.addAction({
                    name: sanitize(name),
                    context: sanitize(context),
                    startClocks: clocksNow(),
                    type: ActionType.CUSTOM,
                    handlingStack,
                });
                addTelemetryUsage({ feature: 'add-action' });
            });
        },
        startAction: monitor((name, options) => {
            // Check feature flag only after init; pre-init calls should be buffered
            if (strategy.initConfiguration && !isExperimentalFeatureEnabled(ExperimentalFeature.START_STOP_ACTION)) {
                return;
            }
            // addTelemetryUsage({ feature: 'start-action' })
            strategy.startAction(sanitize(name), {
                type: sanitize(options && options.type),
                context: sanitize(options && options.context),
                actionKey: options && options.actionKey,
            });
        }),
        stopAction: monitor((name, options) => {
            if (strategy.initConfiguration && !isExperimentalFeatureEnabled(ExperimentalFeature.START_STOP_ACTION)) {
                return;
            }
            // addTelemetryUsage({ feature: 'stop-action' })
            strategy.stopAction(sanitize(name), {
                type: sanitize(options && options.type),
                context: sanitize(options && options.context),
                actionKey: options && options.actionKey,
            });
        }),
        addError: (error, context) => {
            const handlingStack = createHandlingStack('error');
            callMonitored(() => {
                strategy.addError({
                    error, // Do not sanitize error here, it is needed unserialized by computeRawError()
                    handlingStack,
                    context: sanitize(context),
                    startClocks: clocksNow(),
                });
                addTelemetryUsage({ feature: 'add-error' });
            });
        },
        addTiming: monitor((name, time) => {
            // TODO: next major decide to drop relative time support or update its behaviour
            strategy.addTiming(sanitize(name), time);
        }),
        setGlobalContext: defineContextMethod(getStrategy, CustomerContextKey.globalContext, ContextManagerMethod.setContext, 'set-global-context'),
        getGlobalContext: defineContextMethod(getStrategy, CustomerContextKey.globalContext, ContextManagerMethod.getContext, 'get-global-context'),
        setGlobalContextProperty: defineContextMethod(getStrategy, CustomerContextKey.globalContext, ContextManagerMethod.setContextProperty, 'set-global-context-property'),
        removeGlobalContextProperty: defineContextMethod(getStrategy, CustomerContextKey.globalContext, ContextManagerMethod.removeContextProperty, 'remove-global-context-property'),
        clearGlobalContext: defineContextMethod(getStrategy, CustomerContextKey.globalContext, ContextManagerMethod.clearContext, 'clear-global-context'),
        setUser: defineContextMethod(getStrategy, CustomerContextKey.userContext, ContextManagerMethod.setContext, 'set-user'),
        getUser: defineContextMethod(getStrategy, CustomerContextKey.userContext, ContextManagerMethod.getContext, 'get-user'),
        setUserProperty: defineContextMethod(getStrategy, CustomerContextKey.userContext, ContextManagerMethod.setContextProperty, 'set-user-property'),
        removeUserProperty: defineContextMethod(getStrategy, CustomerContextKey.userContext, ContextManagerMethod.removeContextProperty, 'remove-user-property'),
        clearUser: defineContextMethod(getStrategy, CustomerContextKey.userContext, ContextManagerMethod.clearContext, 'clear-user'),
        setAccount: defineContextMethod(getStrategy, CustomerContextKey.accountContext, ContextManagerMethod.setContext, 'set-account'),
        getAccount: defineContextMethod(getStrategy, CustomerContextKey.accountContext, ContextManagerMethod.getContext, 'get-account'),
        setAccountProperty: defineContextMethod(getStrategy, CustomerContextKey.accountContext, ContextManagerMethod.setContextProperty, 'set-account-property'),
        removeAccountProperty: defineContextMethod(getStrategy, CustomerContextKey.accountContext, ContextManagerMethod.removeContextProperty, 'remove-account-property'),
        clearAccount: defineContextMethod(getStrategy, CustomerContextKey.accountContext, ContextManagerMethod.clearContext, 'clear-account'),
        startView,
        stopSession: monitor(() => {
            strategy.stopSession();
            addTelemetryUsage({ feature: 'stop-session' });
        }),
        addFeatureFlagEvaluation: monitor((key, value) => {
            strategy.addFeatureFlagEvaluation(sanitize(key), sanitize(value));
            addTelemetryUsage({ feature: 'add-feature-flag-evaluation' });
        }),
        getSessionReplayLink: monitor(() => recorderApi.getSessionReplayLink()),
        startSessionReplayRecording: monitor((options) => {
            recorderApi.start(options);
            addTelemetryUsage({ feature: 'start-session-replay-recording', force: options && options.force });
        }),
        stopSessionReplayRecording: monitor(() => recorderApi.stop()),
        addDurationVital: (name, options) => {
            const handlingStack = createHandlingStack('vital');
            callMonitored(() => {
                addTelemetryUsage({ feature: 'add-duration-vital' });
                strategy.addDurationVital({
                    name: sanitize(name),
                    type: VitalType.DURATION,
                    startClocks: timeStampToClocks(options.startTime),
                    duration: options.duration,
                    context: sanitize(options && options.context),
                    description: sanitize(options && options.description),
                    handlingStack,
                });
            });
        },
        startDurationVital: (name, options) => {
            const handlingStack = createHandlingStack('vital');
            return callMonitored(() => {
                addTelemetryUsage({ feature: 'start-duration-vital' });
                return strategy.startDurationVital(sanitize(name), {
                    context: sanitize(options && options.context),
                    description: sanitize(options && options.description),
                    handlingStack,
                });
            });
        },
        stopDurationVital: monitor((nameOrRef, options) => {
            addTelemetryUsage({ feature: 'stop-duration-vital' });
            strategy.stopDurationVital(typeof nameOrRef === 'string' ? sanitize(nameOrRef) : nameOrRef, {
                context: sanitize(options && options.context),
                description: sanitize(options && options.description),
            });
        }),
        startFeatureOperation: monitor((name, options) => {
            addTelemetryUsage({ feature: 'add-operation-step-vital', action_type: 'start' });
            strategy.addOperationStepVital(name, 'start', options);
        }),
        succeedFeatureOperation: monitor((name, options) => {
            addTelemetryUsage({ feature: 'add-operation-step-vital', action_type: 'succeed' });
            strategy.addOperationStepVital(name, 'end', options);
        }),
        failFeatureOperation: monitor((name, failureReason, options) => {
            addTelemetryUsage({ feature: 'add-operation-step-vital', action_type: 'fail' });
            strategy.addOperationStepVital(name, 'end', options, failureReason);
        }),
    });
    return rumPublicApi;
}
function createPostStartStrategy$1(preStartStrategy, startRumResult) {
    return {
        init: (initConfiguration) => {
            displayAlreadyInitializedError('DD_RUM', initConfiguration);
        },
        initConfiguration: preStartStrategy.initConfiguration,
        ...startRumResult,
    };
}

function createDOMMutationObservable() {
    const MutationObserver = getMutationObserverConstructor();
    return new Observable((observable) => {
        if (!MutationObserver) {
            return;
        }
        const observer = new MutationObserver(monitor((records) => observable.notify(records)));
        observer.observe(document, {
            attributes: true,
            characterData: true,
            childList: true,
            subtree: true,
        });
        return () => observer.disconnect();
    });
}
function getMutationObserverConstructor() {
    let constructor;
    const browserWindow = window;
    // Angular uses Zone.js to provide a context persisting across async tasks.  Zone.js replaces the
    // global MutationObserver constructor with a patched version to support the context propagation.
    // There is an ongoing issue[1][2] with this setup when using a MutationObserver within a Angular
    // component: on some occasions, the callback is being called in an infinite loop, causing the
    // page to freeze (even if the callback is completely empty).
    //
    // To work around this issue, we try to get the original MutationObserver constructor stored by
    // Zone.js.
    //
    // [1] https://github.com/angular/angular/issues/26948
    // [2] https://github.com/angular/angular/issues/31712
    if (browserWindow.Zone) {
        // Zone.js 0.8.6+ is storing original class constructors into the browser 'window' object[3].
        //
        // [3] https://github.com/angular/angular/blob/6375fa79875c0fe7b815efc45940a6e6f5c9c9eb/packages/zone.js/lib/common/utils.ts#L288
        constructor = getZoneJsOriginalValue(browserWindow, 'MutationObserver');
        if (browserWindow.MutationObserver && constructor === browserWindow.MutationObserver) {
            // Anterior Zone.js versions (used in Angular 2) does not expose the original MutationObserver
            // in the 'window' object. Luckily, the patched MutationObserver class is storing an original
            // instance in its properties[4]. Let's get the original MutationObserver constructor from
            // there.
            //
            // [4] https://github.com/angular/zone.js/blob/v0.8.5/lib/common/utils.ts#L412
            const patchedInstance = new browserWindow.MutationObserver(noop);
            const originalInstance = getZoneJsOriginalValue(patchedInstance, 'originalInstance');
            constructor = originalInstance && originalInstance.constructor;
        }
    }
    if (!constructor) {
        constructor = browserWindow.MutationObserver;
    }
    return constructor;
}

function createWindowOpenObservable() {
    const observable = new Observable();
    const { stop } = instrumentMethod(window, 'open', () => observable.notify());
    return { observable, stop };
}

/**
 * Internal context keep returning v1 format
 * to not break compatibility with logs data format
 */
function startInternalContext(applicationId, sessionManager, viewHistory, actionContexts, urlContexts) {
    return {
        get: (startTime) => {
            const viewContext = viewHistory.findView(startTime);
            const urlContext = urlContexts.findUrl(startTime);
            const session = sessionManager.findTrackedSession(startTime);
            if (session && viewContext && urlContext) {
                const actionId = actionContexts.findActionId(startTime);
                return {
                    application_id: applicationId,
                    session_id: session.id,
                    user_action: actionId ? { id: actionId } : undefined,
                    view: { id: viewContext.id, name: viewContext.name, referrer: urlContext.referrer, url: urlContext.url },
                };
            }
        },
    };
}

const LifeCycle = (AbstractLifeCycle);

const VIEW_CONTEXT_TIME_OUT_DELAY = SESSION_TIME_OUT_DELAY;
function startViewHistory(lifeCycle) {
    const viewValueHistory = createValueHistory({ expireDelay: VIEW_CONTEXT_TIME_OUT_DELAY });
    lifeCycle.subscribe(1 /* LifeCycleEventType.BEFORE_VIEW_CREATED */, (view) => {
        viewValueHistory.add(buildViewHistoryEntry(view), view.startClocks.relative);
    });
    lifeCycle.subscribe(6 /* LifeCycleEventType.AFTER_VIEW_ENDED */, ({ endClocks }) => {
        viewValueHistory.closeActive(endClocks.relative);
    });
    lifeCycle.subscribe(3 /* LifeCycleEventType.BEFORE_VIEW_UPDATED */, (viewUpdate) => {
        const currentView = viewValueHistory.find(viewUpdate.startClocks.relative);
        if (!currentView) {
            return;
        }
        if (viewUpdate.name) {
            currentView.name = viewUpdate.name;
        }
        if (viewUpdate.context) {
            currentView.context = viewUpdate.context;
        }
        currentView.sessionIsActive = viewUpdate.sessionIsActive;
    });
    lifeCycle.subscribe(10 /* LifeCycleEventType.SESSION_RENEWED */, () => {
        viewValueHistory.reset();
    });
    function buildViewHistoryEntry(view) {
        return {
            service: view.service,
            version: view.version,
            context: view.context,
            id: view.id,
            name: view.name,
            startClocks: view.startClocks,
        };
    }
    return {
        findView: (startTime) => viewValueHistory.find(startTime),
        stop: () => {
            viewValueHistory.stop();
        },
    };
}

const FAKE_INITIAL_DOCUMENT = 'initial_document';
const RESOURCE_TYPES = [
    [ResourceType.DOCUMENT, (initiatorType) => FAKE_INITIAL_DOCUMENT === initiatorType],
    [ResourceType.XHR, (initiatorType) => 'xmlhttprequest' === initiatorType],
    [ResourceType.FETCH, (initiatorType) => 'fetch' === initiatorType],
    [ResourceType.BEACON, (initiatorType) => 'beacon' === initiatorType],
    [ResourceType.CSS, (_, path) => /\.css$/i.test(path)],
    [ResourceType.JS, (_, path) => /\.js$/i.test(path)],
    [
        ResourceType.IMAGE,
        (initiatorType, path) => ['image', 'img', 'icon'].includes(initiatorType) || /\.(gif|jpg|jpeg|tiff|png|svg|ico)$/i.exec(path) !== null,
    ],
    [ResourceType.FONT, (_, path) => /\.(woff|eot|woff2|ttf)$/i.exec(path) !== null],
    [
        ResourceType.MEDIA,
        (initiatorType, path) => ['audio', 'video'].includes(initiatorType) || /\.(mp3|mp4)$/i.exec(path) !== null,
    ],
];
function computeResourceEntryType(entry) {
    const url = entry.name;
    if (!isValidUrl(url)) {
        return ResourceType.OTHER;
    }
    const path = getPathName(url);
    for (const [type, isType] of RESOURCE_TYPES) {
        if (isType(entry.initiatorType, path)) {
            return type;
        }
    }
    return ResourceType.OTHER;
}
function areInOrder(...numbers) {
    for (let i = 1; i < numbers.length; i += 1) {
        if (numbers[i - 1] > numbers[i]) {
            return false;
        }
    }
    return true;
}
function isResourceEntryRequestType(entry) {
    return entry.initiatorType === 'xmlhttprequest' || entry.initiatorType === 'fetch';
}
function computeResourceEntryDuration(entry) {
    const { duration, startTime, responseEnd } = entry;
    // Safari duration is always 0 on timings blocked by cross origin policies.
    if (duration === 0 && startTime < responseEnd) {
        return elapsed(startTime, responseEnd);
    }
    return duration;
}
function computeResourceEntryDetails(entry) {
    if (!hasValidResourceEntryTimings(entry)) {
        return undefined;
    }
    const { startTime, fetchStart, workerStart, redirectStart, redirectEnd, domainLookupStart, domainLookupEnd, connectStart, secureConnectionStart, connectEnd, requestStart, responseStart, responseEnd, } = entry;
    const details = {
        download: formatTiming(startTime, responseStart, responseEnd),
        first_byte: formatTiming(startTime, requestStart, responseStart),
    };
    // Make sure a worker processing time is recorded
    if (0 < workerStart && workerStart < fetchStart) {
        details.worker = formatTiming(startTime, workerStart, fetchStart);
    }
    // Make sure a connection occurred
    if (fetchStart < connectEnd) {
        details.connect = formatTiming(startTime, connectStart, connectEnd);
        // Make sure a secure connection occurred
        if (connectStart <= secureConnectionStart && secureConnectionStart <= connectEnd) {
            details.ssl = formatTiming(startTime, secureConnectionStart, connectEnd);
        }
    }
    // Make sure a domain lookup occurred
    if (fetchStart < domainLookupEnd) {
        details.dns = formatTiming(startTime, domainLookupStart, domainLookupEnd);
    }
    // Make sure a redirection occurred
    if (startTime < redirectEnd) {
        details.redirect = formatTiming(startTime, redirectStart, redirectEnd);
    }
    return details;
}
/**
 * Entries with negative duration are unexpected and should be dismissed. The intake will ignore RUM
 * Resource events with negative durations anyway.
 * Since Chromium 128, more entries have unexpected negative durations, see
 * https://issues.chromium.org/issues/363031537
 */
function hasValidResourceEntryDuration(entry) {
    return entry.duration >= 0;
}
function hasValidResourceEntryTimings(entry) {
    // Ensure timings are in the right order. On top of filtering out potential invalid
    // RumPerformanceResourceTiming, it will ignore entries from requests where timings cannot be
    // collected, for example cross origin requests without a "Timing-Allow-Origin" header allowing
    // it.
    const areCommonTimingsInOrder = areInOrder(entry.startTime, entry.fetchStart, entry.domainLookupStart, entry.domainLookupEnd, entry.connectStart, entry.connectEnd, entry.requestStart, entry.responseStart, entry.responseEnd);
    const areRedirectionTimingsInOrder = hasRedirection(entry)
        ? areInOrder(entry.startTime, entry.redirectStart, entry.redirectEnd, entry.fetchStart)
        : true;
    return areCommonTimingsInOrder && areRedirectionTimingsInOrder;
}
function hasRedirection(entry) {
    return entry.redirectEnd > entry.startTime;
}
function formatTiming(origin, start, end) {
    if (origin <= start && start <= end) {
        return {
            duration: toServerDuration(elapsed(start, end)),
            start: toServerDuration(elapsed(origin, start)),
        };
    }
}
/**
 * The 'nextHopProtocol' is an empty string for cross-origin resources without CORS headers,
 * meaning the protocol is unknown, and we shouldn't report it.
 * https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming/nextHopProtocol#cross-origin_resources
 */
function computeResourceEntryProtocol(entry) {
    return entry.nextHopProtocol === '' ? undefined : entry.nextHopProtocol;
}
/**
 * Handles the 'deliveryType' property to distinguish between supported values ('cache', 'navigational-prefetch'),
 * undefined (unsupported in some browsers), and other cases ('other' for unknown or unrecognized values).
 * see: https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming/deliveryType
 */
function computeResourceEntryDeliveryType(entry) {
    return entry.deliveryType === '' ? 'other' : entry.deliveryType;
}
function computeResourceEntrySize(entry) {
    // Make sure a request actually occurred
    if (entry.startTime < entry.responseStart) {
        const { encodedBodySize, decodedBodySize, transferSize } = entry;
        return {
            size: decodedBodySize,
            encoded_body_size: encodedBodySize,
            decoded_body_size: decodedBodySize,
            transfer_size: transferSize,
        };
    }
    return {
        size: undefined,
        encoded_body_size: undefined,
        decoded_body_size: undefined,
        transfer_size: undefined,
    };
}
function isAllowedRequestUrl(url) {
    return url && (!isIntakeUrl(url) || isExperimentalFeatureEnabled(ExperimentalFeature.TRACK_INTAKE_REQUESTS));
}
const DATA_URL_REGEX = /data:(.+)?(;base64)?,/g;
const MAX_RESOURCE_VALUE_CHAR_LENGTH = 24000;
function sanitizeIfLongDataUrl(url, lengthLimit = MAX_RESOURCE_VALUE_CHAR_LENGTH) {
    if (url.length <= lengthLimit || !url.startsWith('data:')) {
        return url;
    }
    // truncate url first to a random length to prevent match error when the url is too long
    const dataUrlMatchArray = url.substring(0, 100).match(DATA_URL_REGEX);
    if (!dataUrlMatchArray) {
        return url;
    }
    return `${dataUrlMatchArray[0]}[...]`;
}

const sampleDecisionCache = new Map();
function isSampled(sessionId, sampleRate) {
    // Shortcuts for common cases. This is not strictly necessary, but it makes the code faster for
    // customers willing to ingest all traces.
    if (sampleRate === 100) {
        return true;
    }
    if (sampleRate === 0) {
        return false;
    }
    const cachedDecision = sampleDecisionCache.get(sampleRate);
    if (cachedDecision && sessionId === cachedDecision.sessionId) {
        return cachedDecision.decision;
    }
    let decision;
    // @ts-expect-error BigInt might not be defined in every browser we support
    if (window.BigInt) {
        decision = sampleUsingKnuthFactor(BigInt(`0x${sessionId.split('-')[4]}`), sampleRate);
    }
    else {
        // For simplicity, we don't use consistent sampling for browser without BigInt support
        // TODO: remove this when all browser we support have BigInt support
        decision = performDraw(sampleRate);
    }
    sampleDecisionCache.set(sampleRate, { sessionId, decision });
    return decision;
}
/**
 * Perform sampling using the Knuth factor method. This method offer consistent sampling result
 * based on the provided identifier.
 *
 * @param identifier - The identifier to use for sampling.
 * @param sampleRate - The sample rate in percentage between 0 and 100.
 */
function sampleUsingKnuthFactor(identifier, sampleRate) {
    // The formula is:
    //
    //   (identifier * knuthFactor) % 2^64 < sampleRate * 2^64
    //
    // Because JavaScript numbers are 64-bit floats, we can't represent 64-bit integers, and the
    // modulo would be incorrect. Thus, we are using BigInts here.
    //
    // Implementation in other languages:
    // * Go     https://github.com/DataDog/dd-trace-go/blob/ec6fbb1f2d517b7b8e69961052adf7136f3af773/ddtrace/tracer/sampler.go#L86-L91
    // * Python https://github.com/DataDog/dd-trace-py/blob/0cee2f066fb6e79aa15947c1514c0f406dea47c5/ddtrace/sampling_rule.py#L197
    // * Ruby   https://github.com/DataDog/dd-trace-rb/blob/1a6e255cdcb7e7e22235ea5955f90f6dfa91045d/lib/datadog/tracing/sampling/rate_sampler.rb#L42
    // * C++    https://github.com/DataDog/dd-trace-cpp/blob/159629edc438ae45f2bb318eb7bd51abd05e94b5/src/datadog/trace_sampler.cpp#L58
    // * Java   https://github.com/DataDog/dd-trace-java/blob/896dd6b380533216e0bdee59614606c8272d313e/dd-trace-core/src/main/java/datadog/trace/common/sampling/DeterministicSampler.java#L48
    //
    // Note: All implementations have slight variations. Some of them use '<=' instead of '<', and
    // use `sampleRate * 2^64 - 1` instead of `sampleRate * 2^64`. The following implementation
    // should adhere to the spec and is a bit simpler than using a 2^64-1 limit as there are less
    // BigInt arithmetic to write. In practice this does not matter, as we are using floating point
    // numbers in the end, and Number(2n**64n-1n) === Number(2n**64n).
    const knuthFactor = BigInt('1111111111111111111');
    const twoPow64 = BigInt('0x10000000000000000'); // 2n ** 64n
    const hash = (identifier * knuthFactor) % twoPow64;
    return Number(hash) <= (sampleRate / 100) * Number(twoPow64);
}

function createTraceIdentifier() {
    return createIdentifier(64);
}
function createSpanIdentifier() {
    return createIdentifier(63);
}
function createIdentifier(bits) {
    const buffer = crypto.getRandomValues(new Uint32Array(2));
    if (bits === 63) {
        // eslint-disable-next-line no-bitwise
        buffer[buffer.length - 1] >>>= 1; // force 63-bit
    }
    // The `.toString` function is intentionally similar to Number and BigInt `.toString` method.
    //
    // JavaScript numbers can represent integers up to 48 bits, this is why we need two of them to
    // represent a 64 bits identifier. But BigInts don't have this limitation and can represent larger
    // integer values.
    //
    // In the future, when we drop browsers without BigInts support, we could use BigInts directly
    // represent identifiers by simply returning a BigInt from this function (as all we need is a
    // value with a `.toString` method).
    //
    // Examples:
    //   const buffer = getCrypto().getRandomValues(new Uint32Array(2))
    //   return BigInt(buffer[0]) + BigInt(buffer[1]) << 32n
    //
    //   // Alternative with BigUint64Array (different Browser support than plain bigints!):
    //   return crypto.getRandomValues(new BigUint64Array(1))[0]
    //
    // For now, let's keep using two plain numbers as having two different implementations (one for
    // browsers with BigInt support and one for older browsers) don't bring much value.
    return {
        toString(radix = 10) {
            let high = buffer[1];
            let low = buffer[0];
            let str = '';
            do {
                const mod = (high % radix) * 4294967296 + low;
                high = Math.floor(high / radix);
                low = Math.floor(mod / radix);
                str = (mod % radix).toString(radix) + str;
            } while (high || low);
            return str;
        },
    };
}
function toPaddedHexadecimalString(id) {
    return id.toString(16).padStart(16, '0');
}

/**
 * Clear tracing information to avoid incomplete traces. Ideally, we should do it when the
 * request did not reach the server, but the browser does not expose this. So, we clear tracing
 * information if the request ended with status 0 without being aborted by the application.
 *
 * Reasoning:
 *
 * * Applications are usually aborting requests after a bit of time, for example when the user is
 * typing (autocompletion) or navigating away (in a SPA). With a performant device and good
 * network conditions, the request is likely to reach the server before being canceled.
 *
 * * Requests aborted otherwise (ex: lack of internet, CORS issue, blocked by a privacy extension)
 * are likely to finish quickly and without reaching the server.
 *
 * Of course, it might not be the case every time, but it should limit having incomplete traces a
 * bit.
 * */
function clearTracingIfNeeded(context) {
    if (context.status === 0 && !context.isAborted) {
        context.traceId = undefined;
        context.spanId = undefined;
        context.traceSampled = undefined;
    }
}
function startTracer(configuration, sessionManager, userContext, accountContext) {
    return {
        clearTracingIfNeeded,
        traceFetch: (context) => injectHeadersIfTracingAllowed(configuration, context, sessionManager, userContext, accountContext, (tracingHeaders) => {
            var _a;
            if (context.input instanceof Request && !((_a = context.init) === null || _a === void 0 ? void 0 : _a.headers)) {
                context.input = new Request(context.input);
                Object.keys(tracingHeaders).forEach((key) => {
                    context.input.headers.append(key, tracingHeaders[key]);
                });
            }
            else {
                context.init = shallowClone(context.init);
                const headers = [];
                if (context.init.headers instanceof Headers) {
                    context.init.headers.forEach((value, key) => {
                        headers.push([key, value]);
                    });
                }
                else if (Array.isArray(context.init.headers)) {
                    context.init.headers.forEach((header) => {
                        headers.push(header);
                    });
                }
                else if (context.init.headers) {
                    Object.keys(context.init.headers).forEach((key) => {
                        headers.push([key, context.init.headers[key]]);
                    });
                }
                context.init.headers = headers.concat(objectEntries(tracingHeaders));
            }
        }),
        traceXhr: (context, xhr) => injectHeadersIfTracingAllowed(configuration, context, sessionManager, userContext, accountContext, (tracingHeaders) => {
            Object.keys(tracingHeaders).forEach((name) => {
                xhr.setRequestHeader(name, tracingHeaders[name]);
            });
        }),
    };
}
function injectHeadersIfTracingAllowed(configuration, context, sessionManager, userContext, accountContext, inject) {
    const session = sessionManager.findTrackedSession();
    if (!session) {
        return;
    }
    const tracingOption = configuration.allowedTracingUrls.find((tracingOption) => matchList([tracingOption.match], context.url, true));
    if (!tracingOption) {
        return;
    }
    const traceSampled = isSampled(session.id, configuration.traceSampleRate);
    const shouldInjectHeaders = traceSampled || configuration.traceContextInjection === TraceContextInjection.ALL;
    if (!shouldInjectHeaders) {
        return;
    }
    context.traceSampled = traceSampled;
    context.traceId = createTraceIdentifier();
    context.spanId = createSpanIdentifier();
    inject(makeTracingHeaders(context.traceId, context.spanId, context.traceSampled, session.id, tracingOption.propagatorTypes, userContext, accountContext, configuration));
}
/**
 * When trace is not sampled, set priority to '0' instead of not adding the tracing headers
 * to prepare the implementation for sampling delegation.
 */
function makeTracingHeaders(traceId, spanId, traceSampled, sessionId, propagatorTypes, userContext, accountContext, configuration) {
    const tracingHeaders = {};
    propagatorTypes.forEach((propagatorType) => {
        switch (propagatorType) {
            case 'datadog': {
                Object.assign(tracingHeaders, {
                    'x-datadog-origin': 'rum',
                    'x-datadog-parent-id': spanId.toString(),
                    'x-datadog-sampling-priority': traceSampled ? '1' : '0',
                    'x-datadog-trace-id': traceId.toString(),
                });
                break;
            }
            // https://www.w3.org/TR/trace-context/
            case 'tracecontext': {
                Object.assign(tracingHeaders, {
                    traceparent: `00-0000000000000000${toPaddedHexadecimalString(traceId)}-${toPaddedHexadecimalString(spanId)}-0${traceSampled ? '1' : '0'}`,
                    tracestate: `dd=s:${traceSampled ? '1' : '0'};o:rum`,
                });
                break;
            }
            // https://github.com/openzipkin/b3-propagation
            case 'b3': {
                Object.assign(tracingHeaders, {
                    b3: `${toPaddedHexadecimalString(traceId)}-${toPaddedHexadecimalString(spanId)}-${traceSampled ? '1' : '0'}`,
                });
                break;
            }
            case 'b3multi': {
                Object.assign(tracingHeaders, {
                    'X-B3-TraceId': toPaddedHexadecimalString(traceId),
                    'X-B3-SpanId': toPaddedHexadecimalString(spanId),
                    'X-B3-Sampled': traceSampled ? '1' : '0',
                });
                break;
            }
        }
    });
    if (configuration.propagateTraceBaggage) {
        const baggageItems = {
            'session.id': sessionId,
        };
        const userId = userContext.getContext().id;
        if (typeof userId === 'string') {
            baggageItems['user.id'] = userId;
        }
        const accountId = accountContext.getContext().id;
        if (typeof accountId === 'string') {
            baggageItems['account.id'] = accountId;
        }
        const baggageHeader = Object.entries(baggageItems)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join(',');
        if (baggageHeader) {
            tracingHeaders['baggage'] = baggageHeader;
        }
    }
    return tracingHeaders;
}

/**
 * arbitrary value, byte precision not needed
 */
const GRAPHQL_PAYLOAD_LIMIT = 32 * ONE_KIBI_BYTE;
function extractGraphQlMetadata(request, graphQlConfig) {
    const metadata = extractGraphQlRequestMetadata(request.requestBody, graphQlConfig.trackPayload);
    if (!metadata) {
        return;
    }
    if (graphQlConfig.trackResponseErrors && request.responseBody) {
        const responseErrors = parseGraphQlResponse(request.responseBody);
        if (responseErrors) {
            metadata.error_count = responseErrors.length;
            metadata.errors = responseErrors;
        }
    }
    return metadata;
}
function parseGraphQlResponse(responseText) {
    let response;
    try {
        response = JSON.parse(responseText);
    }
    catch (_a) {
        // Invalid JSON response
        return;
    }
    if (!response || typeof response !== 'object') {
        return;
    }
    const responseObj = response;
    if (!isNonEmptyArray(responseObj.errors)) {
        return;
    }
    const errors = responseObj.errors.map((error) => {
        var _a;
        const graphqlError = {
            message: error.message,
            path: error.path,
            locations: error.locations,
            code: (_a = error.extensions) === null || _a === void 0 ? void 0 : _a.code,
        };
        return graphqlError;
    });
    return errors;
}
function findGraphQlConfiguration(url, configuration) {
    return configuration.allowedGraphQlUrls.find((graphQlOption) => matchList([graphQlOption.match], url));
}
function extractGraphQlRequestMetadata(requestBody, trackPayload = false) {
    if (!requestBody || typeof requestBody !== 'string') {
        return;
    }
    let graphqlBody;
    try {
        graphqlBody = JSON.parse(requestBody);
    }
    catch (_a) {
        // Not valid JSON
        return;
    }
    if (!graphqlBody) {
        return;
    }
    let operationType;
    let payload;
    if (graphqlBody.query) {
        const trimmedQuery = graphqlBody.query.trim();
        operationType = getOperationType(trimmedQuery);
        if (trackPayload) {
            payload = safeTruncate(trimmedQuery, GRAPHQL_PAYLOAD_LIMIT, '...');
        }
    }
    const operationName = graphqlBody.operationName;
    let variables;
    if (graphqlBody.variables) {
        variables = JSON.stringify(graphqlBody.variables);
    }
    return {
        operationType,
        operationName,
        variables,
        payload,
    };
}
function getOperationType(query) {
    var _a;
    return (_a = query.match(/^\s*(query|mutation|subscription)\b/i)) === null || _a === void 0 ? void 0 : _a[1];
}

let nextRequestIndex = 1;
function startRequestCollection(lifeCycle, configuration, sessionManager, userContext, accountContext) {
    const tracer = startTracer(configuration, sessionManager, userContext, accountContext);
    trackXhr(lifeCycle, configuration, tracer);
    trackFetch(lifeCycle, configuration, tracer);
}
function trackXhr(lifeCycle, configuration, tracer) {
    const subscription = initXhrObservable(configuration).subscribe((rawContext) => {
        const context = rawContext;
        if (!isAllowedRequestUrl(context.url)) {
            return;
        }
        switch (context.state) {
            case 'start':
                tracer.traceXhr(context, context.xhr);
                context.requestIndex = getNextRequestIndex();
                lifeCycle.notify(7 /* LifeCycleEventType.REQUEST_STARTED */, {
                    requestIndex: context.requestIndex,
                    url: context.url,
                });
                break;
            case 'complete':
                tracer.clearTracingIfNeeded(context);
                lifeCycle.notify(8 /* LifeCycleEventType.REQUEST_COMPLETED */, {
                    duration: context.duration,
                    method: context.method,
                    requestIndex: context.requestIndex,
                    spanId: context.spanId,
                    startClocks: context.startClocks,
                    status: context.status,
                    traceId: context.traceId,
                    traceSampled: context.traceSampled,
                    type: RequestType.XHR,
                    url: context.url,
                    xhr: context.xhr,
                    isAborted: context.isAborted,
                    handlingStack: context.handlingStack,
                    requestBody: context.requestBody,
                    responseBody: context.responseBody,
                });
                break;
        }
    });
    return { stop: () => subscription.unsubscribe() };
}
function trackFetch(lifeCycle, configuration, tracer) {
    const subscription = initFetchObservable({
        responseBodyAction: (context) => {
            var _a;
            if ((_a = findGraphQlConfiguration(context.url, configuration)) === null || _a === void 0 ? void 0 : _a.trackResponseErrors) {
                return 2 /* ResponseBodyAction.COLLECT */;
            }
            return 1 /* ResponseBodyAction.WAIT */;
        },
    }).subscribe((rawContext) => {
        var _a;
        const context = rawContext;
        if (!isAllowedRequestUrl(context.url)) {
            return;
        }
        switch (context.state) {
            case 'start':
                tracer.traceFetch(context);
                context.requestIndex = getNextRequestIndex();
                lifeCycle.notify(7 /* LifeCycleEventType.REQUEST_STARTED */, {
                    requestIndex: context.requestIndex,
                    url: context.url,
                });
                break;
            case 'resolve':
                tracer.clearTracingIfNeeded(context);
                lifeCycle.notify(8 /* LifeCycleEventType.REQUEST_COMPLETED */, {
                    duration: elapsed(context.startClocks.timeStamp, timeStampNow()),
                    method: context.method,
                    requestIndex: context.requestIndex,
                    responseType: context.responseType,
                    spanId: context.spanId,
                    startClocks: context.startClocks,
                    status: context.status,
                    traceId: context.traceId,
                    traceSampled: context.traceSampled,
                    type: RequestType.FETCH,
                    url: context.url,
                    response: context.response,
                    init: context.init,
                    input: context.input,
                    isAborted: context.isAborted,
                    handlingStack: context.handlingStack,
                    requestBody: (_a = context.init) === null || _a === void 0 ? void 0 : _a.body,
                    responseBody: context.responseBody,
                });
                break;
        }
    });
    return { stop: () => subscription.unsubscribe() };
}
function getNextRequestIndex() {
    const result = nextRequestIndex;
    nextRequestIndex += 1;
    return result;
}

function discardNegativeDuration(duration) {
    return isNumber(duration) && duration < 0 ? undefined : duration;
}

function isTextNode(node) {
    return node.nodeType === Node.TEXT_NODE;
}
function isCommentNode(node) {
    return node.nodeType === Node.COMMENT_NODE;
}
function isElementNode(node) {
    return node.nodeType === Node.ELEMENT_NODE;
}
function isNodeShadowHost(node) {
    return isElementNode(node) && Boolean(node.shadowRoot);
}
function isNodeShadowRoot(node) {
    const shadowRoot = node;
    return !!shadowRoot.host && shadowRoot.nodeType === Node.DOCUMENT_FRAGMENT_NODE && isElementNode(shadowRoot.host);
}
function hasChildNodes(node) {
    return node.childNodes.length > 0 || isNodeShadowHost(node);
}
function forEachChildNodes(node, callback) {
    let child = node.firstChild;
    while (child) {
        callback(child);
        child = child.nextSibling;
    }
    if (isNodeShadowHost(node)) {
        callback(node.shadowRoot);
    }
}
/**
 * Return `host` in case if the current node is a shadow root otherwise will return the `parentNode`
 */
function getParentNode(node) {
    return isNodeShadowRoot(node) ? node.host : node.parentNode;
}
/**
 * Return the parent element, crossing shadow DOM boundaries.
 * If the element is a direct child of a shadow root, returns the shadow host.
 */
function getParentElement(element) {
    if (element.parentElement) {
        return element.parentElement;
    }
    const parentNode = element.parentNode;
    if (parentNode && isNodeShadowRoot(parentNode)) {
        return parentNode.host;
    }
    return null;
}

/**
 * first-input timing entry polyfill based on
 * https://github.com/GoogleChrome/web-vitals/blob/master/src/lib/polyfills/firstInputPolyfill.ts
 */
function retrieveFirstInputTiming(configuration, callback) {
    const startTimeStamp = dateNow();
    let timingSent = false;
    const { stop: removeEventListeners } = addEventListeners(configuration, window, ["click" /* DOM_EVENT.CLICK */, "mousedown" /* DOM_EVENT.MOUSE_DOWN */, "keydown" /* DOM_EVENT.KEY_DOWN */, "touchstart" /* DOM_EVENT.TOUCH_START */, "pointerdown" /* DOM_EVENT.POINTER_DOWN */], (evt) => {
        // Only count cancelable events, which should trigger behavior important to the user.
        if (!evt.cancelable) {
            return;
        }
        // This timing will be used to compute the "first Input delay", which is the delta between
        // when the system received the event (e.g. evt.timeStamp) and when it could run the callback
        // (e.g. performance.now()).
        const timing = {
            entryType: 'first-input',
            processingStart: relativeNow(),
            processingEnd: relativeNow(),
            startTime: evt.timeStamp,
            duration: 0, // arbitrary value to avoid nullable duration and simplify INP logic
            name: '',
            cancelable: false,
            target: null,
            toJSON: () => ({}),
        };
        if (evt.type === "pointerdown" /* DOM_EVENT.POINTER_DOWN */) {
            sendTimingIfPointerIsNotCancelled(configuration, timing);
        }
        else {
            sendTiming(timing);
        }
    }, { passive: true, capture: true });
    return { stop: removeEventListeners };
    /**
     * Pointer events are a special case, because they can trigger main or compositor thread behavior.
     * We differentiate these cases based on whether or not we see a pointercancel event, which are
     * fired when we scroll. If we're scrolling we don't need to report input delay since FID excludes
     * scrolling and pinch/zooming.
     */
    function sendTimingIfPointerIsNotCancelled(configuration, timing) {
        addEventListeners(configuration, window, ["pointerup" /* DOM_EVENT.POINTER_UP */, "pointercancel" /* DOM_EVENT.POINTER_CANCEL */], (event) => {
            if (event.type === "pointerup" /* DOM_EVENT.POINTER_UP */) {
                sendTiming(timing);
            }
        }, { once: true });
    }
    function sendTiming(timing) {
        if (!timingSent) {
            timingSent = true;
            removeEventListeners();
            // In some cases the recorded delay is clearly wrong, e.g. it's negative or it's larger than
            // the time between now and when the page was loaded.
            // - https://github.com/GoogleChromeLabs/first-input-delay/issues/4
            // - https://github.com/GoogleChromeLabs/first-input-delay/issues/6
            // - https://github.com/GoogleChromeLabs/first-input-delay/issues/7
            const delay = timing.processingStart - timing.startTime;
            if (delay >= 0 && delay < dateNow() - startTimeStamp) {
                callback(timing);
            }
        }
    }
}

// We want to use a real enum (i.e. not a const enum) here, to be able to check whether an arbitrary
// string is an expected performance entry
// eslint-disable-next-line no-restricted-syntax
var RumPerformanceEntryType;
(function (RumPerformanceEntryType) {
    RumPerformanceEntryType["EVENT"] = "event";
    RumPerformanceEntryType["FIRST_INPUT"] = "first-input";
    RumPerformanceEntryType["LARGEST_CONTENTFUL_PAINT"] = "largest-contentful-paint";
    RumPerformanceEntryType["LAYOUT_SHIFT"] = "layout-shift";
    RumPerformanceEntryType["LONG_TASK"] = "longtask";
    RumPerformanceEntryType["LONG_ANIMATION_FRAME"] = "long-animation-frame";
    RumPerformanceEntryType["NAVIGATION"] = "navigation";
    RumPerformanceEntryType["PAINT"] = "paint";
    RumPerformanceEntryType["RESOURCE"] = "resource";
    RumPerformanceEntryType["VISIBILITY_STATE"] = "visibility-state";
})(RumPerformanceEntryType || (RumPerformanceEntryType = {}));
function createPerformanceObservable(configuration, options) {
    return new Observable((observable) => {
        if (!window.PerformanceObserver) {
            return;
        }
        const handlePerformanceEntries = (entries) => {
            const rumPerformanceEntries = filterRumPerformanceEntries(entries);
            if (rumPerformanceEntries.length > 0) {
                observable.notify(rumPerformanceEntries);
            }
        };
        let timeoutId;
        let isObserverInitializing = true;
        const observer = new PerformanceObserver(monitor((entries) => {
            // In Safari the performance observer callback is synchronous.
            // Because the buffered performance entry list can be quite large we delay the computation to prevent the SDK from blocking the main thread on init
            if (isObserverInitializing) {
                timeoutId = setTimeout$1(() => handlePerformanceEntries(entries.getEntries()));
            }
            else {
                handlePerformanceEntries(entries.getEntries());
            }
        }));
        try {
            observer.observe(options);
        }
        catch (_a) {
            // Some old browser versions (<= chrome 74 ) don't support the PerformanceObserver type and buffered options
            // In these cases, fallback to getEntriesByType and PerformanceObserver with entryTypes
            // TODO: remove this fallback in the next major version
            const fallbackSupportedEntryTypes = [
                RumPerformanceEntryType.RESOURCE,
                RumPerformanceEntryType.NAVIGATION,
                RumPerformanceEntryType.LONG_TASK,
                RumPerformanceEntryType.PAINT,
            ];
            if (fallbackSupportedEntryTypes.includes(options.type)) {
                if (options.buffered) {
                    timeoutId = setTimeout$1(() => handlePerformanceEntries(performance.getEntriesByType(options.type)));
                }
                try {
                    observer.observe({ entryTypes: [options.type] });
                }
                catch (_b) {
                    // Old versions of Safari are throwing "entryTypes contained only unsupported types"
                    // errors when observing only unsupported entry types.
                    //
                    // We could use `supportPerformanceTimingEvent` to make sure we don't invoke
                    // `observer.observe` with an unsupported entry type, but Safari 11 and 12 don't support
                    // `Performance.supportedEntryTypes`, so doing so would lose support for these versions
                    // even if they do support the entry type.
                    return;
                }
            }
        }
        isObserverInitializing = false;
        manageResourceTimingBufferFull(configuration);
        let stopFirstInputTiming;
        if (!supportPerformanceTimingEvent(RumPerformanceEntryType.FIRST_INPUT) &&
            options.type === RumPerformanceEntryType.FIRST_INPUT) {
            ({ stop: stopFirstInputTiming } = retrieveFirstInputTiming(configuration, (timing) => {
                handlePerformanceEntries([timing]);
            }));
        }
        return () => {
            observer.disconnect();
            if (stopFirstInputTiming) {
                stopFirstInputTiming();
            }
            clearTimeout$1(timeoutId);
        };
    });
}
let resourceTimingBufferFullListener;
function manageResourceTimingBufferFull(configuration) {
    if (!resourceTimingBufferFullListener && supportPerformanceObject() && 'addEventListener' in performance) {
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1559377
        resourceTimingBufferFullListener = addEventListener(configuration, performance, 'resourcetimingbufferfull', () => {
            performance.clearResourceTimings();
        });
    }
    return () => {
        resourceTimingBufferFullListener === null || resourceTimingBufferFullListener === void 0 ? void 0 : resourceTimingBufferFullListener.stop();
    };
}
function supportPerformanceObject() {
    return window.performance !== undefined && 'getEntries' in performance;
}
function supportPerformanceTimingEvent(entryType) {
    return (window.PerformanceObserver &&
        PerformanceObserver.supportedEntryTypes !== undefined &&
        PerformanceObserver.supportedEntryTypes.includes(entryType));
}
function filterRumPerformanceEntries(entries) {
    return entries.filter((entry) => !isForbiddenResource(entry));
}
function isForbiddenResource(entry) {
    return (entry.entryType === RumPerformanceEntryType.RESOURCE &&
        (!isAllowedRequestUrl(entry.name) || !hasValidResourceEntryDuration(entry)));
}

// Delay to wait for a page activity to validate the tracking process
const PAGE_ACTIVITY_VALIDATION_DELAY = 100;
// Delay to wait after a page activity to end the tracking process
const PAGE_ACTIVITY_END_DELAY = 100;
const EXCLUDED_MUTATIONS_ATTRIBUTE = 'data-dd-excluded-activity-mutations';
/**
 * Wait for the page activity end
 *
 * Detection lifecycle:
 * ```
 *                        Wait page activity end
 *              .-------------------'--------------------.
 *              v                                        v
 *     [Wait for a page activity ]          [Wait for a maximum duration]
 *     [timeout: VALIDATION_DELAY]          [  timeout: maxDuration     ]
 *          /                  \                           |
 *         v                    v                          |
 *  [No page activity]   [Page activity]                   |
 *         |                   |,----------------------.   |
 *         v                   v                       |   |
 *     (Discard)     [Wait for a page activity]        |   |
 *                   [   timeout: END_DELAY   ]        |   |
 *                       /                \            |   |
 *                      v                  v           |   |
 *             [No page activity]    [Page activity]   |   |
 *                      |                 |            |   |
 *                      |                 '------------'   |
 *                      '-----------. ,--------------------'
 *                                   v
 *                                 (End)
 * ```
 *
 * Note: by assuming that maxDuration is greater than VALIDATION_DELAY, we are sure that if the
 * process is still alive after maxDuration, it has been validated.
 */
function waitPageActivityEnd(lifeCycle, domMutationObservable, windowOpenObservable, configuration, pageActivityEndCallback, maxDuration) {
    const pageActivityObservable = createPageActivityObservable(lifeCycle, domMutationObservable, windowOpenObservable, configuration);
    return doWaitPageActivityEnd(pageActivityObservable, pageActivityEndCallback, maxDuration);
}
function doWaitPageActivityEnd(pageActivityObservable, pageActivityEndCallback, maxDuration) {
    let pageActivityEndTimeoutId;
    let hasCompleted = false;
    const validationTimeoutId = setTimeout$1(monitor(() => complete({ hadActivity: false })), PAGE_ACTIVITY_VALIDATION_DELAY);
    const maxDurationTimeoutId = maxDuration !== undefined
        ? setTimeout$1(monitor(() => complete({ hadActivity: true, end: timeStampNow() })), maxDuration)
        : undefined;
    const pageActivitySubscription = pageActivityObservable.subscribe(({ isBusy }) => {
        clearTimeout$1(validationTimeoutId);
        clearTimeout$1(pageActivityEndTimeoutId);
        const lastChangeTime = timeStampNow();
        if (!isBusy) {
            pageActivityEndTimeoutId = setTimeout$1(monitor(() => complete({ hadActivity: true, end: lastChangeTime })), PAGE_ACTIVITY_END_DELAY);
        }
    });
    const stop = () => {
        hasCompleted = true;
        clearTimeout$1(validationTimeoutId);
        clearTimeout$1(pageActivityEndTimeoutId);
        clearTimeout$1(maxDurationTimeoutId);
        pageActivitySubscription.unsubscribe();
    };
    function complete(event) {
        if (hasCompleted) {
            return;
        }
        stop();
        pageActivityEndCallback(event);
    }
    return { stop };
}
function createPageActivityObservable(lifeCycle, domMutationObservable, windowOpenObservable, configuration) {
    return new Observable((observable) => {
        const subscriptions = [];
        let firstRequestIndex;
        let pendingRequestsCount = 0;
        subscriptions.push(domMutationObservable.subscribe((mutations) => {
            if (!mutations.every(isExcludedMutation)) {
                notifyPageActivity();
            }
        }), windowOpenObservable.subscribe(notifyPageActivity), createPerformanceObservable(configuration, { type: RumPerformanceEntryType.RESOURCE }).subscribe((entries) => {
            if (entries.some((entry) => !isExcludedUrl(configuration, entry.name))) {
                notifyPageActivity();
            }
        }), lifeCycle.subscribe(7 /* LifeCycleEventType.REQUEST_STARTED */, (startEvent) => {
            if (isExcludedUrl(configuration, startEvent.url)) {
                return;
            }
            if (firstRequestIndex === undefined) {
                firstRequestIndex = startEvent.requestIndex;
            }
            pendingRequestsCount += 1;
            notifyPageActivity();
        }), lifeCycle.subscribe(8 /* LifeCycleEventType.REQUEST_COMPLETED */, (request) => {
            if (isExcludedUrl(configuration, request.url) ||
                firstRequestIndex === undefined ||
                // If the request started before the tracking start, ignore it
                request.requestIndex < firstRequestIndex) {
                return;
            }
            pendingRequestsCount -= 1;
            notifyPageActivity();
        }));
        return () => {
            subscriptions.forEach((s) => s.unsubscribe());
        };
        function notifyPageActivity() {
            observable.notify({ isBusy: pendingRequestsCount > 0 });
        }
    });
}
function isExcludedUrl(configuration, requestUrl) {
    return matchList(configuration.excludedActivityUrls, requestUrl);
}
function isExcludedMutation(mutation) {
    const targetElement = mutation.type === 'characterData' ? mutation.target.parentElement : mutation.target;
    return Boolean(targetElement &&
        isElementNode(targetElement) &&
        targetElement.matches(`[${EXCLUDED_MUTATIONS_ATTRIBUTE}], [${EXCLUDED_MUTATIONS_ATTRIBUTE}] *`));
}

/**
 * Get the action name from the attribute 'data-dd-action-name' on the element or any of its parent.
 * It can also be retrieved from a user defined attribute.
 */
const DEFAULT_PROGRAMMATIC_ACTION_NAME_ATTRIBUTE = 'data-dd-action-name';
const ACTION_NAME_PLACEHOLDER = 'Masked Element';

/**
 * Stable attributes are attributes that are commonly used to identify parts of a UI (ex:
 * component). Those attribute values should not be generated randomly (hardcoded most of the time)
 * and stay the same across deploys. They are not necessarily unique across the document.
 */
const STABLE_ATTRIBUTES = [
    DEFAULT_PROGRAMMATIC_ACTION_NAME_ATTRIBUTE,
    // Common test attributes (list provided by google recorder)
    'data-testid',
    'data-test',
    'data-qa',
    'data-cy',
    'data-test-id',
    'data-qa-id',
    'data-testing',
    // FullStory decorator attributes:
    'data-component',
    'data-element',
    'data-source-file',
];
// Selectors to use if they target a single element on the whole document. Those selectors are
// considered as "stable" and uniquely identify an element regardless of the page state. If we find
// one, we should consider the selector "complete" and stop iterating over ancestors.
const GLOBALLY_UNIQUE_SELECTOR_GETTERS = [getStableAttributeSelector, getIDSelector];
// Selectors to use if they target a single element among an element descendants. Those selectors
// are more brittle than "globally unique" selectors and should be combined with ancestor selectors
// to improve specificity.
const UNIQUE_AMONG_CHILDREN_SELECTOR_GETTERS = [
    getStableAttributeSelector,
    getClassSelector,
    getTagNameSelector,
];
function getSelectorFromElement(targetElement, actionNameAttribute) {
    if (!targetElement.isConnected) {
        // We cannot compute a selector for a detached element, as we don't have access to all of its
        // parents, and we cannot determine if it's unique in the document.
        return;
    }
    let targetElementSelector;
    let currentElement = targetElement;
    while (currentElement && currentElement.nodeName !== 'HTML') {
        const globallyUniqueSelector = findSelector(currentElement, GLOBALLY_UNIQUE_SELECTOR_GETTERS, isSelectorUniqueGlobally, actionNameAttribute, targetElementSelector);
        if (globallyUniqueSelector) {
            return globallyUniqueSelector;
        }
        const uniqueSelectorAmongChildren = findSelector(currentElement, UNIQUE_AMONG_CHILDREN_SELECTOR_GETTERS, isSelectorUniqueAmongSiblings, actionNameAttribute, targetElementSelector);
        targetElementSelector =
            uniqueSelectorAmongChildren || combineSelector(getPositionSelector(currentElement), targetElementSelector);
        currentElement = currentElement.parentElement;
    }
    return targetElementSelector;
}
function isGeneratedValue(value) {
    // To compute the "URL path group", the backend replaces every URL path parts as a question mark
    // if it thinks the part is an identifier. The condition it uses is to checks whether a digit is
    // present.
    //
    // Here, we use the same strategy: if the value contains a digit, we consider it generated. This
    // strategy might be a bit naive and fail in some cases, but there are many fallbacks to generate
    // CSS selectors so it should be fine most of the time.
    return /[0-9]/.test(value);
}
function getIDSelector(element) {
    if (element.id && !isGeneratedValue(element.id)) {
        return `#${CSS.escape(element.id)}`;
    }
}
function getClassSelector(element) {
    if (element.tagName === 'BODY') {
        return;
    }
    const classList = element.classList;
    for (let i = 0; i < classList.length; i += 1) {
        const className = classList[i];
        if (isGeneratedValue(className)) {
            continue;
        }
        return `${CSS.escape(element.tagName)}.${CSS.escape(className)}`;
    }
}
function getTagNameSelector(element) {
    return CSS.escape(element.tagName);
}
function getStableAttributeSelector(element, actionNameAttribute) {
    if (actionNameAttribute) {
        const selector = getAttributeSelector(actionNameAttribute);
        if (selector) {
            return selector;
        }
    }
    for (const attributeName of STABLE_ATTRIBUTES) {
        const selector = getAttributeSelector(attributeName);
        if (selector) {
            return selector;
        }
    }
    function getAttributeSelector(attributeName) {
        if (element.hasAttribute(attributeName)) {
            return `${CSS.escape(element.tagName)}[${attributeName}="${CSS.escape(element.getAttribute(attributeName))}"]`;
        }
    }
}
function getPositionSelector(element) {
    let sibling = element.parentElement.firstElementChild;
    let elementIndex = 1;
    while (sibling && sibling !== element) {
        if (sibling.tagName === element.tagName) {
            elementIndex += 1;
        }
        sibling = sibling.nextElementSibling;
    }
    return `${CSS.escape(element.tagName)}:nth-of-type(${elementIndex})`;
}
function findSelector(element, selectorGetters, predicate, actionNameAttribute, childSelector) {
    for (const selectorGetter of selectorGetters) {
        const elementSelector = selectorGetter(element, actionNameAttribute);
        if (!elementSelector) {
            continue;
        }
        if (predicate(element, elementSelector, childSelector)) {
            return combineSelector(elementSelector, childSelector);
        }
    }
}
/**
 * Check whether the selector is unique among the whole document.
 */
function isSelectorUniqueGlobally(element, elementSelector, childSelector) {
    return element.ownerDocument.querySelectorAll(combineSelector(elementSelector, childSelector)).length === 1;
}
/**
 * Check whether the selector is unique among the element siblings. In other words, it returns true
 * if "ELEMENT_PARENT > CHILD_SELECTOR" returns a single element.
 *
 * @param currentElement - the element being considered while iterating over the target
 * element ancestors.
 * @param currentElementSelector - a selector that matches the current element. That
 * selector is not a composed selector (i.e. it might be a single tag name, class name...).
 * @param childSelector - child selector is a selector that targets a descendant
 * of the current element. When undefined, the current element is the target element.
 *
 * # Scope selector usage
 *
 * When composed together, the final selector will be joined with `>` operators to make sure we
 * target direct descendants at each level. In this function, we'll use `querySelector` to check if
 * a selector matches descendants of the current element. But by default, the query selector match
 * elements at any level. Example:
 *
 * ```html
 * <main>
 *   <div>
 *     <span></span>
 *   </div>
 *   <marquee>
 *     <div>
 *       <span></span>
 *     </div>
 *   </marquee>
 * </main>
 * ```
 *
 * `sibling.querySelector('DIV > SPAN')` will match both span elements, so we would consider the
 * selector to be not unique, even if it is unique when we'll compose it with the parent with a `>`
 * operator (`MAIN > DIV > SPAN`).
 *
 * To avoid this, we can use the `:scope` selector to make sure the selector starts from the current
 * sibling (i.e. `sibling.querySelector('DIV:scope > SPAN')` will only match the first span).
 *
 * [1]: https://developer.mozilla.org/fr/docs/Web/CSS/:scope
 *
 * # Performance considerations
 *
 * We compute selectors in performance-critical operations (ex: during a click), so we need to make
 * sure the function is as fast as possible. We observed that naively using `querySelectorAll` to
 * check if the selector matches more than 1 element is quite expensive, so we want to avoid it.
 *
 * Because we are iterating the DOM upward and we use that function at every level, we know the
 * child selector is already unique among the current element children, so we don't need to check
 * for the current element subtree.
 *
 * Instead, we can focus on the current element siblings. If we find a single element matching the
 * selector within a sibling, we know that it's not unique. This allows us to use `querySelector`
 * (or `matches`, when the current element is the target element) instead of `querySelectorAll`.
 */
function isSelectorUniqueAmongSiblings(currentElement, currentElementSelector, childSelector) {
    let isSiblingMatching;
    if (childSelector === undefined) {
        // If the child selector is undefined (meaning `currentElement` is the target element, not one
        // of its ancestor), we need to use `matches` to check if the sibling is matching the selector,
        // as `querySelector` only returns a descendant of the element.
        isSiblingMatching = (sibling) => sibling.matches(currentElementSelector);
    }
    else {
        const scopedSelector = combineSelector(`${currentElementSelector}:scope`, childSelector);
        isSiblingMatching = (sibling) => sibling.querySelector(scopedSelector) !== null;
    }
    // Check siblings by iterating directly through previousElementSibling and nextElementSibling.
    // This works even when parentElement is null (e.g., when parent is a DocumentFragment).
    // Check previous siblings
    let sibling = currentElement.previousElementSibling;
    while (sibling) {
        if (isSiblingMatching(sibling)) {
            return false;
        }
        sibling = sibling.previousElementSibling;
    }
    // Check next siblings
    sibling = currentElement.nextElementSibling;
    while (sibling) {
        if (isSiblingMatching(sibling)) {
            return false;
        }
        sibling = sibling.nextElementSibling;
    }
    return true;
}
function combineSelector(parent, child) {
    return child ? `${parent}>${child}` : parent;
}

const NodePrivacyLevel = {
    IGNORE: 'ignore',
    HIDDEN: 'hidden',
    ALLOW: DefaultPrivacyLevel.ALLOW,
    MASK: DefaultPrivacyLevel.MASK,
    MASK_USER_INPUT: DefaultPrivacyLevel.MASK_USER_INPUT,
    MASK_UNLESS_ALLOWLISTED: DefaultPrivacyLevel.MASK_UNLESS_ALLOWLISTED,
};
const PRIVACY_ATTR_NAME = 'data-dd-privacy';
const PRIVACY_ATTR_VALUE_HIDDEN = 'hidden';
// Privacy Classes - not all customers can set plain HTML attributes, so support classes too
const PRIVACY_CLASS_PREFIX = 'dd-privacy-';
// Private Replacement Templates
const CENSORED_STRING_MARK = '***';
const CENSORED_IMG_MARK = 'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';
const FORM_PRIVATE_TAG_NAMES = {
    INPUT: true,
    OUTPUT: true,
    TEXTAREA: true,
    SELECT: true,
    OPTION: true,
    DATALIST: true,
    OPTGROUP: true,
};
const TEXT_MASKING_CHAR = 'x';
function getPrivacySelector(privacyLevel) {
    return `[${PRIVACY_ATTR_NAME}="${privacyLevel}"], .${PRIVACY_CLASS_PREFIX}${privacyLevel}`;
}

/**
 * Get node privacy level by iterating over its ancestors. When the direct parent privacy level is
 * know, it is best to use something like:
 *
 * derivePrivacyLevelGivenParent(getNodeSelfPrivacyLevel(node), parentNodePrivacyLevel)
 */
function getNodePrivacyLevel(node, defaultPrivacyLevel, cache) {
    if (cache && cache.has(node)) {
        return cache.get(node);
    }
    const parentNode = getParentNode(node);
    const parentNodePrivacyLevel = parentNode
        ? getNodePrivacyLevel(parentNode, defaultPrivacyLevel, cache)
        : defaultPrivacyLevel;
    const selfNodePrivacyLevel = getNodeSelfPrivacyLevel(node);
    const nodePrivacyLevel = reducePrivacyLevel(selfNodePrivacyLevel, parentNodePrivacyLevel);
    if (cache) {
        cache.set(node, nodePrivacyLevel);
    }
    return nodePrivacyLevel;
}
/**
 * Reduces the next privacy level based on self + parent privacy levels
 */
function reducePrivacyLevel(childPrivacyLevel, parentNodePrivacyLevel) {
    switch (parentNodePrivacyLevel) {
        // These values cannot be overridden
        case NodePrivacyLevel.HIDDEN:
        case NodePrivacyLevel.IGNORE:
            return parentNodePrivacyLevel;
    }
    switch (childPrivacyLevel) {
        case NodePrivacyLevel.ALLOW:
        case NodePrivacyLevel.MASK:
        case NodePrivacyLevel.MASK_USER_INPUT:
        case NodePrivacyLevel.MASK_UNLESS_ALLOWLISTED:
        case NodePrivacyLevel.HIDDEN:
        case NodePrivacyLevel.IGNORE:
            return childPrivacyLevel;
        default:
            return parentNodePrivacyLevel;
    }
}
/**
 * Determines the node's own privacy level without checking for ancestors.
 */
function getNodeSelfPrivacyLevel(node) {
    // Only Element types can have a privacy level set
    if (!isElementNode(node)) {
        return;
    }
    // Overrules for replay purpose
    if (node.tagName === 'BASE') {
        return NodePrivacyLevel.ALLOW;
    }
    // Overrules to enforce end-user protection
    if (node.tagName === 'INPUT') {
        const inputElement = node;
        if (inputElement.type === 'password' || inputElement.type === 'email' || inputElement.type === 'tel') {
            return NodePrivacyLevel.MASK;
        }
        if (inputElement.type === 'hidden') {
            return NodePrivacyLevel.MASK;
        }
        const autocomplete = inputElement.getAttribute('autocomplete');
        // Handle input[autocomplete=cc-number/cc-csc/cc-exp/cc-exp-month/cc-exp-year/new-password/current-password]
        if (autocomplete && (autocomplete.startsWith('cc-') || autocomplete.endsWith('-password'))) {
            return NodePrivacyLevel.MASK;
        }
    }
    // Check HTML privacy attributes and classes
    if (node.matches(getPrivacySelector(NodePrivacyLevel.HIDDEN))) {
        return NodePrivacyLevel.HIDDEN;
    }
    if (node.matches(getPrivacySelector(NodePrivacyLevel.MASK))) {
        return NodePrivacyLevel.MASK;
    }
    if (node.matches(getPrivacySelector(NodePrivacyLevel.MASK_UNLESS_ALLOWLISTED))) {
        return NodePrivacyLevel.MASK_UNLESS_ALLOWLISTED;
    }
    if (node.matches(getPrivacySelector(NodePrivacyLevel.MASK_USER_INPUT))) {
        return NodePrivacyLevel.MASK_USER_INPUT;
    }
    if (node.matches(getPrivacySelector(NodePrivacyLevel.ALLOW))) {
        return NodePrivacyLevel.ALLOW;
    }
    if (shouldIgnoreElement(node)) {
        return NodePrivacyLevel.IGNORE;
    }
}
/**
 * Helper aiming to unify `mask` and `mask-user-input` privacy levels:
 *
 * In the `mask` case, it is trivial: we should mask the element.
 *
 * In the `mask-user-input` case, we should mask the element only if it is a "form" element or the
 * direct parent is a form element for text nodes).
 *
 * Other `shouldMaskNode` cases are edge cases that should not matter too much (ex: should we mask a
 * node if it is ignored or hidden? it doesn't matter since it won't be serialized).
 */
function shouldMaskNode(node, privacyLevel) {
    switch (privacyLevel) {
        case NodePrivacyLevel.MASK:
        case NodePrivacyLevel.HIDDEN:
        case NodePrivacyLevel.IGNORE:
            return true;
        case NodePrivacyLevel.MASK_UNLESS_ALLOWLISTED:
            if (isTextNode(node)) {
                // Always return true if our parent is a form element, like MASK_USER_INPUT.
                // Otherwise, decide whether to mask based on the allowlist.
                return isFormElement(node.parentNode) ? true : !isAllowlisted(node.textContent || '');
            }
            // Always return true if we're a form element, like MASK_USER_INPUT.
            // Otherwise, return false; MASK_UNLESS_ALLOWLISTED only directly masks text nodes.
            return isFormElement(node);
        case NodePrivacyLevel.MASK_USER_INPUT:
            return isTextNode(node) ? isFormElement(node.parentNode) : isFormElement(node);
        default:
            return false;
    }
}
function shouldMaskAttribute(tagName, attributeName, attributeValue, nodePrivacyLevel, configuration) {
    if (nodePrivacyLevel !== NodePrivacyLevel.MASK && nodePrivacyLevel !== NodePrivacyLevel.MASK_UNLESS_ALLOWLISTED) {
        return false;
    }
    if (attributeName === PRIVACY_ATTR_NAME ||
        STABLE_ATTRIBUTES.includes(attributeName) ||
        attributeName === configuration.actionNameAttribute) {
        return false;
    }
    switch (attributeName) {
        case 'title':
        case 'alt':
        case 'placeholder':
        case 'aria-label':
        case 'name':
            return true;
    }
    if (tagName === 'A' && attributeName === 'href') {
        return true;
    }
    if (tagName === 'IFRAME' && attributeName === 'srcdoc') {
        return true;
    }
    if (attributeValue && attributeName.startsWith('data-')) {
        return true;
    }
    if ((tagName === 'IMG' || tagName === 'SOURCE') && (attributeName === 'src' || attributeName === 'srcset')) {
        return true;
    }
    return false;
}
function isFormElement(node) {
    if (!node || node.nodeType !== node.ELEMENT_NODE) {
        return false;
    }
    const element = node;
    if (element.tagName === 'INPUT') {
        switch (element.type) {
            case 'button':
            case 'color':
            case 'reset':
            case 'submit':
                return false;
        }
    }
    return !!FORM_PRIVATE_TAG_NAMES[element.tagName];
}
/**
 * Text censoring non-destructively maintains whitespace characters in order to preserve text shape
 * during replay.
 */
const censorText = (text) => text.replace(/\S/g, TEXT_MASKING_CHAR);
function getTextContent(textNode, parentNodePrivacyLevel) {
    var _a;
    // The parent node may not be a html element which has a tagName attribute.
    // So just let it be undefined which is ok in this use case.
    const parentTagName = (_a = textNode.parentElement) === null || _a === void 0 ? void 0 : _a.tagName;
    let textContent = textNode.textContent || '';
    const shouldIgnoreWhiteSpace = parentTagName === 'HEAD';
    if (shouldIgnoreWhiteSpace && !textContent.trim()) {
        return;
    }
    const nodePrivacyLevel = parentNodePrivacyLevel;
    const isScript = parentTagName === 'SCRIPT';
    if (isScript) {
        // For perf reasons, we don't record script (heuristic)
        textContent = CENSORED_STRING_MARK;
    }
    else if (nodePrivacyLevel === NodePrivacyLevel.HIDDEN) {
        // Should never occur, but just in case, we set to CENSORED_MARK.
        textContent = CENSORED_STRING_MARK;
    }
    else if (shouldMaskNode(textNode, nodePrivacyLevel)) {
        if (
        // Scrambling the child list breaks text nodes for DATALIST/SELECT/OPTGROUP
        parentTagName === 'DATALIST' ||
            parentTagName === 'SELECT' ||
            parentTagName === 'OPTGROUP') {
            if (!textContent.trim()) {
                return;
            }
        }
        else if (parentTagName === 'OPTION') {
            // <Option> has low entropy in charset + text length, so use `CENSORED_STRING_MARK` when masked
            textContent = CENSORED_STRING_MARK;
        }
        else if (nodePrivacyLevel === NodePrivacyLevel.MASK_UNLESS_ALLOWLISTED) {
            textContent = maskDisallowedTextContent(textContent);
        }
        else {
            textContent = censorText(textContent);
        }
    }
    return textContent;
}
/**
 * TODO: Preserve CSS element order, and record the presence of the tag, just don't render
 * We don't need this logic on the recorder side.
 * For security related meta's, customer can mask themmanually given they
 * are easy to identify in the HEAD tag.
 */
function shouldIgnoreElement(element) {
    if (element.nodeName === 'SCRIPT') {
        return true;
    }
    if (element.nodeName === 'LINK') {
        const relAttribute = getLowerCaseAttribute('rel');
        return (
        // Link as script - Ignore only when rel=preload, modulepreload or prefetch
        (/preload|prefetch/i.test(relAttribute) && getLowerCaseAttribute('as') === 'script') ||
            // Favicons
            relAttribute === 'shortcut icon' ||
            relAttribute === 'icon');
    }
    if (element.nodeName === 'META') {
        const nameAttribute = getLowerCaseAttribute('name');
        const relAttribute = getLowerCaseAttribute('rel');
        const propertyAttribute = getLowerCaseAttribute('property');
        return (
        // Favicons
        /^msapplication-tile(image|color)$/.test(nameAttribute) ||
            nameAttribute === 'application-name' ||
            relAttribute === 'icon' ||
            relAttribute === 'apple-touch-icon' ||
            relAttribute === 'shortcut icon' ||
            // Description
            nameAttribute === 'keywords' ||
            nameAttribute === 'description' ||
            // Social
            /^(og|twitter|fb):/.test(propertyAttribute) ||
            /^(og|twitter):/.test(nameAttribute) ||
            nameAttribute === 'pinterest' ||
            // Robots
            nameAttribute === 'robots' ||
            nameAttribute === 'googlebot' ||
            nameAttribute === 'bingbot' ||
            // Http headers. Ex: X-UA-Compatible, Content-Type, Content-Language, cache-control,
            // X-Translated-By
            element.hasAttribute('http-equiv') ||
            // Authorship
            nameAttribute === 'author' ||
            nameAttribute === 'generator' ||
            nameAttribute === 'framework' ||
            nameAttribute === 'publisher' ||
            nameAttribute === 'progid' ||
            /^article:/.test(propertyAttribute) ||
            /^product:/.test(propertyAttribute) ||
            // Verification
            nameAttribute === 'google-site-verification' ||
            nameAttribute === 'yandex-verification' ||
            nameAttribute === 'csrf-token' ||
            nameAttribute === 'p:domain_verify' ||
            nameAttribute === 'verify-v1' ||
            nameAttribute === 'verification' ||
            nameAttribute === 'shopify-checkout-api-token');
    }
    function getLowerCaseAttribute(name) {
        return (element.getAttribute(name) || '').toLowerCase();
    }
    return false;
}
function isAllowlisted(text) {
    var _a;
    if (!text || !text.trim()) {
        return true;
    }
    // We are using toLocaleLowerCase when adding to the allowlist to avoid case sensitivity
    // so we need to do the same here
    return ((_a = window.$DD_ALLOW) === null || _a === void 0 ? void 0 : _a.has(text.toLocaleLowerCase())) || false;
}
function maskDisallowedTextContent(text, fixedMask) {
    if (isAllowlisted(text)) {
        return text;
    }
    return fixedMask || censorText(text);
}

const MAX_DURATION_BETWEEN_CLICKS = ONE_SECOND;
const MAX_DISTANCE_BETWEEN_CLICKS = 100;
function createClickChain(firstClick, onFinalize) {
    const bufferedClicks = [];
    let status = 0 /* ClickChainStatus.WaitingForMoreClicks */;
    let maxDurationBetweenClicksTimeoutId;
    appendClick(firstClick);
    function appendClick(click) {
        click.stopObservable.subscribe(tryFinalize);
        bufferedClicks.push(click);
        clearTimeout$1(maxDurationBetweenClicksTimeoutId);
        maxDurationBetweenClicksTimeoutId = setTimeout$1(dontAcceptMoreClick, MAX_DURATION_BETWEEN_CLICKS);
    }
    function tryFinalize() {
        if (status === 1 /* ClickChainStatus.WaitingForClicksToStop */ && bufferedClicks.every((click) => click.isStopped())) {
            status = 2 /* ClickChainStatus.Finalized */;
            onFinalize(bufferedClicks);
        }
    }
    function dontAcceptMoreClick() {
        clearTimeout$1(maxDurationBetweenClicksTimeoutId);
        if (status === 0 /* ClickChainStatus.WaitingForMoreClicks */) {
            status = 1 /* ClickChainStatus.WaitingForClicksToStop */;
            tryFinalize();
        }
    }
    return {
        tryAppend: (click) => {
            if (status !== 0 /* ClickChainStatus.WaitingForMoreClicks */) {
                return false;
            }
            if (bufferedClicks.length > 0 &&
                !areEventsSimilar(bufferedClicks[bufferedClicks.length - 1].event, click.event)) {
                dontAcceptMoreClick();
                return false;
            }
            appendClick(click);
            return true;
        },
        stop: () => {
            dontAcceptMoreClick();
        },
    };
}
/**
 * Checks whether two events are similar by comparing their target, position and timestamp
 */
function areEventsSimilar(first, second) {
    return (first.target === second.target &&
        mouseEventDistance(first, second) <= MAX_DISTANCE_BETWEEN_CLICKS &&
        first.timeStamp - second.timeStamp <= MAX_DURATION_BETWEEN_CLICKS);
}
function mouseEventDistance(origin, other) {
    return Math.sqrt(Math.pow(origin.clientX - other.clientX, 2) + Math.pow(origin.clientY - other.clientY, 2));
}

function getActionNameFromElement(element, rumConfiguration, nodePrivacyLevel = NodePrivacyLevel.ALLOW) {
    const nodePrivacyLevelCache = new Map();
    const { actionNameAttribute: userProgrammaticAttribute } = rumConfiguration;
    // Proceed to get the action name in two steps:
    // * first, get the name programmatically, explicitly defined by the user.
    // * then, if privacy is set to mask, return a placeholder for the undefined.
    // * if privacy is not set to mask, use strategies that are known to return good results.
    //   Those strategies will be used on the element and a few parents, but it's likely that they won't succeed at all.
    // * if no name is found this way, use strategies returning less accurate names as a fallback.
    //   Those are much likely to succeed.
    const defaultActionName = getActionNameFromElementProgrammatically(element, DEFAULT_PROGRAMMATIC_ACTION_NAME_ATTRIBUTE) ||
        (userProgrammaticAttribute && getActionNameFromElementProgrammatically(element, userProgrammaticAttribute));
    if (defaultActionName) {
        return { name: defaultActionName, nameSource: "custom_attribute" /* ActionNameSource.CUSTOM_ATTRIBUTE */ };
    }
    else if (nodePrivacyLevel === NodePrivacyLevel.MASK) {
        return { name: ACTION_NAME_PLACEHOLDER, nameSource: "mask_placeholder" /* ActionNameSource.MASK_PLACEHOLDER */ };
    }
    return (getActionNameFromElementForStrategies(element, priorityStrategies, rumConfiguration, nodePrivacyLevelCache) ||
        getActionNameFromElementForStrategies(element, fallbackStrategies, rumConfiguration, nodePrivacyLevelCache) || {
        name: '',
        nameSource: "blank" /* ActionNameSource.BLANK */,
    });
}
function getActionNameFromElementProgrammatically(targetElement, programmaticAttribute) {
    // We don't use getActionNameFromElementForStrategies here, because we want to consider all parents,
    // without limit. It is up to the user to declare a relevant naming strategy.
    const elementWithAttribute = closestShadowAware(targetElement, `[${programmaticAttribute}]`);
    if (!elementWithAttribute) {
        return;
    }
    const name = elementWithAttribute.getAttribute(programmaticAttribute);
    return truncate(normalizeWhitespace(name.trim()));
}
function closestShadowAware(element, selector) {
    let current = element;
    while (current) {
        if (current.matches(selector)) {
            return current;
        }
        current = getParentElement(current);
    }
    return null;
}
const priorityStrategies = [
    // associated LABEL text
    (element, rumConfiguration, nodePrivacyLevelCache) => {
        if ('labels' in element && element.labels && element.labels.length > 0) {
            return getActionNameFromTextualContent(element.labels[0], rumConfiguration, nodePrivacyLevelCache);
        }
    },
    // INPUT button (and associated) value
    (element) => {
        if (element.nodeName === 'INPUT') {
            const input = element;
            const type = input.getAttribute('type');
            if (type === 'button' || type === 'submit' || type === 'reset') {
                return { name: input.value, nameSource: "text_content" /* ActionNameSource.TEXT_CONTENT */ };
            }
        }
    },
    // BUTTON, LABEL or button-like element text
    (element, rumConfiguration, nodePrivacyLevelCache) => {
        if (element.nodeName === 'BUTTON' || element.nodeName === 'LABEL' || element.getAttribute('role') === 'button') {
            return getActionNameFromTextualContent(element, rumConfiguration, nodePrivacyLevelCache);
        }
    },
    (element, rumConfiguration, nodePrivacyLevelCache) => getActionNameFromStandardAttribute(element, 'aria-label', rumConfiguration, nodePrivacyLevelCache),
    // associated element text designated by the aria-labelledby attribute
    (element, rumConfiguration, nodePrivacyLevelCache) => {
        const labelledByAttribute = element.getAttribute('aria-labelledby');
        if (labelledByAttribute) {
            return {
                name: labelledByAttribute
                    .split(/\s+/)
                    .map((id) => getElementById(element, id))
                    .filter((label) => Boolean(label))
                    .map((element) => getTextualContent(element, rumConfiguration, nodePrivacyLevelCache))
                    .join(' '),
                nameSource: "text_content" /* ActionNameSource.TEXT_CONTENT */,
            };
        }
    },
    (element, rumConfiguration, nodePrivacyLevelCache) => getActionNameFromStandardAttribute(element, 'alt', rumConfiguration, nodePrivacyLevelCache),
    (element, rumConfiguration, nodePrivacyLevelCache) => getActionNameFromStandardAttribute(element, 'name', rumConfiguration, nodePrivacyLevelCache),
    (element, rumConfiguration, nodePrivacyLevelCache) => getActionNameFromStandardAttribute(element, 'title', rumConfiguration, nodePrivacyLevelCache),
    (element, rumConfiguration, nodePrivacyLevelCache) => getActionNameFromStandardAttribute(element, 'placeholder', rumConfiguration, nodePrivacyLevelCache),
    // SELECT first OPTION text
    (element, rumConfiguration, nodePrivacyLevelCache) => {
        if ('options' in element && element.options.length > 0) {
            return getActionNameFromTextualContent(element.options[0], rumConfiguration, nodePrivacyLevelCache);
        }
    },
];
const fallbackStrategies = [
    (element, rumConfiguration, nodePrivacyLevelCache) => getActionNameFromTextualContent(element, rumConfiguration, nodePrivacyLevelCache),
];
/**
 * Iterates over the target element and its parent, using the strategies list to get an action name.
 * Each strategies are applied on each element, stopping as soon as a non-empty value is returned.
 */
const MAX_PARENTS_TO_CONSIDER = 10;
function getActionNameFromElementForStrategies(targetElement, strategies, rumConfiguration, nodePrivacyLevelCache) {
    let element = targetElement;
    let recursionCounter = 0;
    while (recursionCounter <= MAX_PARENTS_TO_CONSIDER &&
        element &&
        element.nodeName !== 'BODY' &&
        element.nodeName !== 'HTML' &&
        element.nodeName !== 'HEAD') {
        for (const strategy of strategies) {
            const actionName = strategy(element, rumConfiguration, nodePrivacyLevelCache);
            if (actionName) {
                const { name, nameSource } = actionName;
                const trimmedName = name && name.trim();
                if (trimmedName) {
                    return { name: truncate(normalizeWhitespace(trimmedName)), nameSource };
                }
            }
        }
        // Consider a FORM as a contextual limit to get the action name.  This is experimental and may
        // be reconsidered in the future.
        if (element.nodeName === 'FORM') {
            break;
        }
        element = getParentElement(element);
        recursionCounter += 1;
    }
}
function normalizeWhitespace(s) {
    return s.replace(/\s+/g, ' ');
}
function truncate(s) {
    return s.length > 100 ? `${safeTruncate(s, 100)} [...]` : s;
}
function getElementById(refElement, id) {
    const rootNode = refElement.getRootNode();
    if (rootNode instanceof ShadowRoot) {
        const shadowElement = rootNode.getElementById(id);
        if (shadowElement) {
            return shadowElement;
        }
    }
    // Use the element ownerDocument here, because tests are executed in an iframe, so
    // document.getElementById won't work.
    return refElement.ownerDocument ? refElement.ownerDocument.getElementById(id) : null;
}
function getActionNameFromStandardAttribute(element, attribute, rumConfiguration, nodePrivacyLevelCache) {
    const { enablePrivacyForActionName, defaultPrivacyLevel } = rumConfiguration;
    let attributeValue = element.getAttribute(attribute);
    if (attributeValue && enablePrivacyForActionName) {
        const nodePrivacyLevel = getNodePrivacyLevel(element, defaultPrivacyLevel, nodePrivacyLevelCache);
        if (shouldMaskAttribute(element.tagName, attribute, attributeValue, nodePrivacyLevel, rumConfiguration)) {
            attributeValue = maskDisallowedTextContent(attributeValue, ACTION_NAME_PLACEHOLDER);
        }
    }
    else if (!attributeValue) {
        attributeValue = '';
    }
    return {
        name: attributeValue,
        nameSource: "standard_attribute" /* ActionNameSource.STANDARD_ATTRIBUTE */,
    };
}
function getActionNameFromTextualContent(element, rumConfiguration, nodePrivacyLevelCache) {
    return {
        name: getTextualContent(element, rumConfiguration, nodePrivacyLevelCache) || '',
        nameSource: "text_content" /* ActionNameSource.TEXT_CONTENT */,
    };
}
function getTextualContent(element, rumConfiguration, nodePrivacyLevelCache) {
    if (element.isContentEditable) {
        return;
    }
    const { enablePrivacyForActionName, actionNameAttribute: userProgrammaticAttribute, defaultPrivacyLevel, } = rumConfiguration;
    if (isExperimentalFeatureEnabled(ExperimentalFeature.USE_TREE_WALKER_FOR_ACTION_NAME)) {
        return getTextualContentWithTreeWalker(element, userProgrammaticAttribute, enablePrivacyForActionName, defaultPrivacyLevel, nodePrivacyLevelCache);
    }
    if ('innerText' in element) {
        let text = element.innerText;
        const removeTextFromElements = (query) => {
            const list = element.querySelectorAll(query);
            for (let index = 0; index < list.length; index += 1) {
                const element = list[index];
                if ('innerText' in element) {
                    const textToReplace = element.innerText;
                    if (textToReplace && textToReplace.trim().length > 0) {
                        text = text.replace(textToReplace, '');
                    }
                }
            }
        };
        // remove the text of elements with programmatic attribute value
        removeTextFromElements(`[${DEFAULT_PROGRAMMATIC_ACTION_NAME_ATTRIBUTE}]`);
        if (userProgrammaticAttribute) {
            removeTextFromElements(`[${userProgrammaticAttribute}]`);
        }
        if (enablePrivacyForActionName) {
            // remove the text of elements with privacy override
            removeTextFromElements(`${getPrivacySelector(NodePrivacyLevel.HIDDEN)}, ${getPrivacySelector(NodePrivacyLevel.MASK)}`);
        }
        return text;
    }
    return element.textContent;
}
function getTextualContentWithTreeWalker(element, userProgrammaticAttribute, privacyEnabledActionName, defaultPrivacyLevel, nodePrivacyLevelCache) {
    const walker = document.createTreeWalker(element, 
    // eslint-disable-next-line no-bitwise
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, rejectInvisibleOrMaskedElementsFilter);
    let text = '';
    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (isElementNode(node)) {
            if (
            // Following InnerText rendering spec https://html.spec.whatwg.org/multipage/dom.html#rendered-text-collection-steps
            node.nodeName === 'BR' ||
                node.nodeName === 'P' ||
                ['block', 'flex', 'grid', 'list-item', 'table', 'table-caption'].includes(getComputedStyle(node).display)) {
                text += ' ';
            }
            continue; // skip element nodes
        }
        text += node.textContent || '';
    }
    return text.replace(/\s+/g, ' ').trim();
    function rejectInvisibleOrMaskedElementsFilter(node) {
        const nodeSelfPrivacyLevel = getNodePrivacyLevel(node, defaultPrivacyLevel, nodePrivacyLevelCache);
        if (privacyEnabledActionName && nodeSelfPrivacyLevel && shouldMaskNode(node, nodeSelfPrivacyLevel)) {
            return NodeFilter.FILTER_REJECT;
        }
        if (isElementNode(node)) {
            if (node.hasAttribute(DEFAULT_PROGRAMMATIC_ACTION_NAME_ATTRIBUTE) ||
                (userProgrammaticAttribute && node.hasAttribute(userProgrammaticAttribute))) {
                return NodeFilter.FILTER_REJECT;
            }
            const style = getComputedStyle(node);
            if (style.visibility !== 'visible' ||
                style.display === 'none' ||
                (style.contentVisibility && style.contentVisibility !== 'visible')
            // contentVisibility is not supported in all browsers, so we need to check it
            ) {
                return NodeFilter.FILTER_REJECT;
            }
        }
        return NodeFilter.FILTER_ACCEPT;
    }
}

function listenActionEvents(configuration, { onPointerDown, onPointerUp }) {
    let selectionEmptyAtPointerDown;
    let userActivity = {
        selection: false,
        input: false,
        scroll: false,
    };
    let clickContext;
    const listeners = [
        addEventListener(configuration, window, "pointerdown" /* DOM_EVENT.POINTER_DOWN */, (event) => {
            if (isValidPointerEvent(event)) {
                selectionEmptyAtPointerDown = isSelectionEmpty();
                userActivity = {
                    selection: false,
                    input: false,
                    scroll: false,
                };
                clickContext = onPointerDown(event);
            }
        }, { capture: true }),
        addEventListener(configuration, window, "selectionchange" /* DOM_EVENT.SELECTION_CHANGE */, () => {
            if (!selectionEmptyAtPointerDown || !isSelectionEmpty()) {
                userActivity.selection = true;
            }
        }, { capture: true }),
        addEventListener(configuration, window, "scroll" /* DOM_EVENT.SCROLL */, () => {
            userActivity.scroll = true;
        }, { capture: true, passive: true }),
        addEventListener(configuration, window, "pointerup" /* DOM_EVENT.POINTER_UP */, (event) => {
            if (isValidPointerEvent(event) && clickContext) {
                // Use a scoped variable to make sure the value is not changed by other clicks
                const localUserActivity = userActivity;
                onPointerUp(clickContext, event, () => localUserActivity);
                clickContext = undefined;
            }
        }, { capture: true }),
        addEventListener(configuration, window, "input" /* DOM_EVENT.INPUT */, () => {
            userActivity.input = true;
        }, { capture: true }),
    ];
    return {
        stop: () => {
            listeners.forEach((listener) => listener.stop());
        },
    };
}
function isSelectionEmpty() {
    const selection = window.getSelection();
    return !selection || selection.isCollapsed;
}
function isValidPointerEvent(event) {
    return (event.target instanceof Element &&
        // Only consider 'primary' pointer events for now. Multi-touch support could be implemented in
        // the future.
        event.isPrimary !== false);
}

const MIN_CLICKS_PER_SECOND_TO_CONSIDER_RAGE = 3;
function computeFrustration(clicks, rageClick) {
    if (isRage(clicks)) {
        rageClick.addFrustration(FrustrationType.RAGE_CLICK);
        if (clicks.some(isDead)) {
            rageClick.addFrustration(FrustrationType.DEAD_CLICK);
        }
        if (rageClick.hasError) {
            rageClick.addFrustration(FrustrationType.ERROR_CLICK);
        }
        return { isRage: true };
    }
    const hasSelectionChanged = clicks.some((click) => click.getUserActivity().selection);
    clicks.forEach((click) => {
        if (click.hasError) {
            click.addFrustration(FrustrationType.ERROR_CLICK);
        }
        if (isDead(click) &&
            // Avoid considering clicks part of a double-click or triple-click selections as dead clicks
            !hasSelectionChanged) {
            click.addFrustration(FrustrationType.DEAD_CLICK);
        }
    });
    return { isRage: false };
}
function isRage(clicks) {
    if (clicks.some((click) => click.getUserActivity().selection || click.getUserActivity().scroll)) {
        return false;
    }
    for (let i = 0; i < clicks.length - (MIN_CLICKS_PER_SECOND_TO_CONSIDER_RAGE - 1); i += 1) {
        if (clicks[i + MIN_CLICKS_PER_SECOND_TO_CONSIDER_RAGE - 1].event.timeStamp - clicks[i].event.timeStamp <=
            ONE_SECOND) {
            return true;
        }
    }
    return false;
}
const DEAD_CLICK_EXCLUDE_SELECTOR = 
// inputs that don't trigger a meaningful event like "input" when clicked, including textual
// inputs (using a negative selector is shorter here)
'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="range"]),' +
    'textarea,' +
    'select,' +
    // contenteditable and their descendants don't always trigger meaningful changes when manipulated
    '[contenteditable],' +
    '[contenteditable] *,' +
    // canvas, as there is no good way to detect activity occurring on them
    'canvas,' +
    // links that are interactive (have an href attribute) or any of their descendants, as they can
    // open a new tab or navigate to a hash without triggering a meaningful event
    'a[href],' +
    'a[href] *';
function isDead(click) {
    if (click.hasPageActivity || click.getUserActivity().input || click.getUserActivity().scroll) {
        return false;
    }
    let target = click.event.target;
    if (target.tagName === 'LABEL' && target.hasAttribute('for')) {
        target = document.getElementById(target.getAttribute('for'));
    }
    return !target || !target.matches(DEAD_CLICK_EXCLUDE_SELECTOR);
}

// Maximum duration for click actions
const CLICK_ACTION_MAX_DURATION = 10 * ONE_SECOND;
const interactionSelectorCache = new Map();
function getInteractionSelector(relativeTimestamp) {
    const selector = interactionSelectorCache.get(relativeTimestamp);
    interactionSelectorCache.delete(relativeTimestamp);
    return selector;
}
function updateInteractionSelector(relativeTimestamp, selector) {
    interactionSelectorCache.set(relativeTimestamp, selector);
    interactionSelectorCache.forEach((_, relativeTimestamp) => {
        if (elapsed(relativeTimestamp, relativeNow()) > CLICK_ACTION_MAX_DURATION) {
            interactionSelectorCache.delete(relativeTimestamp);
        }
    });
}

function trackClickActions(lifeCycle, domMutationObservable, windowOpenObservable, configuration, actionTracker) {
    const stopObservable = new Observable();
    let currentClickChain;
    lifeCycle.subscribe(5 /* LifeCycleEventType.VIEW_ENDED */, stopClickChain);
    lifeCycle.subscribe(11 /* LifeCycleEventType.PAGE_MAY_EXIT */, stopClickChain);
    const { stop: stopActionEventsListener } = listenActionEvents(configuration, {
        onPointerDown: (pointerDownEvent) => processPointerDown(configuration, lifeCycle, domMutationObservable, pointerDownEvent, windowOpenObservable),
        onPointerUp: ({ clickActionBase, hadActivityOnPointerDown }, startEvent, getUserActivity) => {
            startClickAction(configuration, lifeCycle, domMutationObservable, windowOpenObservable, actionTracker, stopObservable, appendClickToClickChain, clickActionBase, startEvent, getUserActivity, hadActivityOnPointerDown);
        },
    });
    return {
        stop: () => {
            stopClickChain();
            stopObservable.notify();
            stopActionEventsListener();
        },
    };
    function appendClickToClickChain(click) {
        if (!currentClickChain || !currentClickChain.tryAppend(click)) {
            const rageClick = click.clone();
            currentClickChain = createClickChain(click, (clicks) => {
                finalizeClicks(clicks, rageClick);
                // Clear the reference to allow garbage collection. Without this, the finalize callback
                // retains a closure reference to the old click chain, preventing it from being cleaned up
                // and causing a memory leak as click chains accumulate over time.
                currentClickChain = undefined;
            });
        }
    }
    function stopClickChain() {
        if (currentClickChain) {
            currentClickChain.stop();
        }
    }
}
function processPointerDown(configuration, lifeCycle, domMutationObservable, pointerDownEvent, windowOpenObservable) {
    const targetForPrivacy = configuration.betaTrackActionsInShadowDom
        ? getEventTarget(pointerDownEvent)
        : pointerDownEvent.target;
    let nodePrivacyLevel;
    if (configuration.enablePrivacyForActionName) {
        nodePrivacyLevel = getNodePrivacyLevel(targetForPrivacy, configuration.defaultPrivacyLevel);
    }
    else {
        nodePrivacyLevel = NodePrivacyLevel.ALLOW;
    }
    if (nodePrivacyLevel === NodePrivacyLevel.HIDDEN) {
        return undefined;
    }
    const clickActionBase = computeClickActionBase(pointerDownEvent, nodePrivacyLevel, configuration);
    let hadActivityOnPointerDown = false;
    waitPageActivityEnd(lifeCycle, domMutationObservable, windowOpenObservable, configuration, (pageActivityEndEvent) => {
        hadActivityOnPointerDown = pageActivityEndEvent.hadActivity;
    }, 
    // We don't care about the activity duration, we just want to know whether an activity did happen
    // within the "validation delay" or not. Limit the duration so the callback is called sooner.
    PAGE_ACTIVITY_VALIDATION_DELAY);
    return { clickActionBase, hadActivityOnPointerDown: () => hadActivityOnPointerDown };
}
function startClickAction(configuration, lifeCycle, domMutationObservable, windowOpenObservable, actionTracker, stopObservable, appendClickToClickChain, clickActionBase, startEvent, getUserActivity, hadActivityOnPointerDown) {
    var _a;
    const click = newClick(lifeCycle, actionTracker, getUserActivity, clickActionBase, startEvent);
    appendClickToClickChain(click);
    const selector = (_a = clickActionBase === null || clickActionBase === void 0 ? void 0 : clickActionBase.target) === null || _a === void 0 ? void 0 : _a.selector;
    if (selector) {
        updateInteractionSelector(startEvent.timeStamp, selector);
    }
    const { stop: stopWaitPageActivityEnd } = waitPageActivityEnd(lifeCycle, domMutationObservable, windowOpenObservable, configuration, (pageActivityEndEvent) => {
        if (pageActivityEndEvent.hadActivity && pageActivityEndEvent.end < click.startClocks.timeStamp) {
            // If the clock is looking weird, just discard the click
            click.discard();
        }
        else {
            if (pageActivityEndEvent.hadActivity) {
                click.stop(pageActivityEndEvent.end);
            }
            else if (hadActivityOnPointerDown()) {
                click.stop(
                // using the click start as activity end, so the click will have some activity but its
                // duration will be 0 (as the activity started before the click start)
                click.startClocks.timeStamp);
            }
            else {
                click.stop();
            }
        }
    }, CLICK_ACTION_MAX_DURATION);
    const viewEndedSubscription = lifeCycle.subscribe(5 /* LifeCycleEventType.VIEW_ENDED */, ({ endClocks }) => {
        click.stop(endClocks.timeStamp);
    });
    const pageMayExitSubscription = lifeCycle.subscribe(11 /* LifeCycleEventType.PAGE_MAY_EXIT */, () => {
        click.stop(timeStampNow());
    });
    const stopSubscription = stopObservable.subscribe(() => {
        click.stop();
    });
    click.stopObservable.subscribe(() => {
        pageMayExitSubscription.unsubscribe();
        viewEndedSubscription.unsubscribe();
        stopWaitPageActivityEnd();
        stopSubscription.unsubscribe();
    });
}
function computeClickActionBase(event, nodePrivacyLevel, configuration) {
    const selectorTarget = event.target;
    const rect = selectorTarget.getBoundingClientRect();
    const selector = getSelectorFromElement(selectorTarget, configuration.actionNameAttribute);
    if (selector) {
        updateInteractionSelector(event.timeStamp, selector);
    }
    const nameTarget = configuration.betaTrackActionsInShadowDom ? getEventTarget(event) : event.target;
    const { name, nameSource } = getActionNameFromElement(nameTarget, configuration, nodePrivacyLevel);
    return {
        type: ActionType.CLICK,
        target: {
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            selector,
        },
        position: {
            // Use clientX and Y because for SVG element offsetX and Y are relatives to the <svg> element
            x: Math.round(event.clientX - rect.left),
            y: Math.round(event.clientY - rect.top),
        },
        name,
        nameSource,
    };
}
function getEventTarget(event) {
    if (event.composed && isNodeShadowHost(event.target) && typeof event.composedPath === 'function') {
        const composedPath = event.composedPath();
        if (composedPath.length > 0 && composedPath[0] instanceof Element) {
            return composedPath[0];
        }
    }
    return event.target;
}
function newClick(lifeCycle, actionTracker, getUserActivity, clickActionBase, startEvent) {
    const trackedAction = actionTracker.createTrackedAction(relativeToClocks(startEvent.timeStamp));
    let status = 0 /* ClickStatus.ONGOING */;
    let activityEndTime;
    const frustrationTypes = [];
    const stopObservable = new Observable();
    function stop(newActivityEndTime) {
        if (status !== 0 /* ClickStatus.ONGOING */) {
            return;
        }
        activityEndTime = newActivityEndTime;
        status = 1 /* ClickStatus.STOPPED */;
        if (activityEndTime) {
            trackedAction.stop(timeStampToClocks(activityEndTime));
        }
        else {
            trackedAction.discard();
        }
        stopObservable.notify();
    }
    return {
        event: startEvent,
        stop,
        stopObservable,
        get hasError() {
            return trackedAction.counts.errorCount > 0;
        },
        get hasPageActivity() {
            return activityEndTime !== undefined;
        },
        getUserActivity,
        addFrustration: (frustrationType) => {
            frustrationTypes.push(frustrationType);
        },
        get startClocks() {
            return trackedAction.startClocks;
        },
        isStopped: () => status === 1 /* ClickStatus.STOPPED */ || status === 2 /* ClickStatus.FINALIZED */,
        clone: () => newClick(lifeCycle, actionTracker, getUserActivity, clickActionBase, startEvent),
        validate: (domEvents) => {
            stop();
            if (status !== 1 /* ClickStatus.STOPPED */) {
                return;
            }
            const clickAction = {
                startClocks: trackedAction.startClocks,
                duration: trackedAction.duration,
                id: trackedAction.id,
                frustrationTypes,
                counts: trackedAction.counts,
                events: domEvents !== null && domEvents !== void 0 ? domEvents : [startEvent],
                event: startEvent,
                ...clickActionBase,
            };
            lifeCycle.notify(0 /* LifeCycleEventType.AUTO_ACTION_COMPLETED */, clickAction);
            status = 2 /* ClickStatus.FINALIZED */;
        },
        discard: () => {
            stop();
            status = 2 /* ClickStatus.FINALIZED */;
        },
    };
}
function finalizeClicks(clicks, rageClick) {
    const { isRage } = computeFrustration(clicks, rageClick);
    if (isRage) {
        clicks.forEach((click) => click.discard());
        rageClick.stop(timeStampNow());
        rageClick.validate(clicks.map((click) => click.event));
    }
    else {
        rageClick.discard();
        clicks.forEach((click) => click.validate());
    }
}

function trackEventCounts({ lifeCycle, isChildEvent, onChange: callback = noop, }) {
    const eventCounts = {
        errorCount: 0,
        longTaskCount: 0,
        resourceCount: 0,
        actionCount: 0,
        frustrationCount: 0,
    };
    const subscription = lifeCycle.subscribe(13 /* LifeCycleEventType.RUM_EVENT_COLLECTED */, (event) => {
        var _a;
        if (event.type === 'view' || event.type === 'vital' || !isChildEvent(event)) {
            return;
        }
        switch (event.type) {
            case RumEventType.ERROR:
                eventCounts.errorCount += 1;
                callback();
                break;
            case RumEventType.ACTION:
                eventCounts.actionCount += 1;
                if (event.action.frustration) {
                    eventCounts.frustrationCount += event.action.frustration.type.length;
                }
                callback();
                break;
            case RumEventType.LONG_TASK:
                eventCounts.longTaskCount += 1;
                callback();
                break;
            case RumEventType.RESOURCE:
                if (!((_a = event._dd) === null || _a === void 0 ? void 0 : _a.discarded)) {
                    eventCounts.resourceCount += 1;
                    callback();
                }
                break;
        }
    });
    return {
        stop: () => {
            subscription.unsubscribe();
        },
        eventCounts,
    };
}

const ACTION_CONTEXT_TIME_OUT_DELAY = 5 * ONE_MINUTE; // arbitrary
function startActionTracker(lifeCycle) {
    const history = createValueHistory({ expireDelay: ACTION_CONTEXT_TIME_OUT_DELAY });
    const activeEventCountSubscriptions = new Set();
    const sessionRenewalSubscription = lifeCycle.subscribe(10 /* LifeCycleEventType.SESSION_RENEWED */, () => {
        history.reset();
        activeEventCountSubscriptions.forEach((subscription) => subscription.stop());
        activeEventCountSubscriptions.clear();
    });
    function createTrackedAction(startClocks) {
        const id = generateUUID();
        const historyEntry = history.add(id, startClocks.relative);
        let duration;
        const eventCountsSubscription = trackEventCounts({
            lifeCycle,
            isChildEvent: (event) => event.action !== undefined &&
                (Array.isArray(event.action.id) ? event.action.id.includes(id) : event.action.id === id),
        });
        activeEventCountSubscriptions.add(eventCountsSubscription);
        function cleanup() {
            eventCountsSubscription.stop();
            activeEventCountSubscriptions.delete(eventCountsSubscription);
        }
        return {
            id,
            startClocks,
            get duration() {
                return duration;
            },
            get counts() {
                return eventCountsSubscription.eventCounts;
            },
            stop(endClocks) {
                historyEntry.close(endClocks.relative);
                duration = elapsed(startClocks.timeStamp, endClocks.timeStamp);
                cleanup();
            },
            discard() {
                historyEntry.remove();
                cleanup();
            },
        };
    }
    function findActionId(startTime) {
        const ids = history.findAll(startTime);
        return ids.length ? ids : undefined;
    }
    function stop() {
        sessionRenewalSubscription.unsubscribe();
        activeEventCountSubscriptions.forEach((subscription) => subscription.stop());
        activeEventCountSubscriptions.clear();
        history.reset();
        history.stop();
    }
    return { createTrackedAction, findActionId, stop };
}

function trackManualActions(lifeCycle, actionTracker, onManualActionCompleted) {
    const activeManualActions = new Map();
    lifeCycle.subscribe(10 /* LifeCycleEventType.SESSION_RENEWED */, () => activeManualActions.clear());
    function startManualAction(name, options = {}, startClocks = clocksNow()) {
        var _a;
        const lookupKey = (_a = options.actionKey) !== null && _a !== void 0 ? _a : name;
        const existingAction = activeManualActions.get(lookupKey);
        if (existingAction) {
            existingAction.trackedAction.discard();
            activeManualActions.delete(lookupKey);
        }
        const trackedAction = actionTracker.createTrackedAction(startClocks);
        activeManualActions.set(lookupKey, {
            name,
            type: options.type,
            context: options.context,
            trackedAction,
        });
    }
    function stopManualAction(name, options = {}, stopClocks = clocksNow()) {
        var _a, _b;
        const lookupKey = (_a = options.actionKey) !== null && _a !== void 0 ? _a : name;
        const activeAction = activeManualActions.get(lookupKey);
        if (!activeAction) {
            return;
        }
        activeAction.trackedAction.stop(stopClocks);
        const frustrationTypes = [];
        if (activeAction.trackedAction.counts.errorCount > 0) {
            frustrationTypes.push(FrustrationType.ERROR_CLICK);
        }
        const manualAction = {
            id: activeAction.trackedAction.id,
            name: activeAction.name,
            type: ((_b = options.type) !== null && _b !== void 0 ? _b : activeAction.type) || ActionType.CUSTOM,
            startClocks: activeAction.trackedAction.startClocks,
            duration: activeAction.trackedAction.duration,
            context: combine(activeAction.context, options.context),
            counts: activeAction.trackedAction.counts,
            frustrationTypes,
        };
        onManualActionCompleted(manualAction);
        activeManualActions.delete(lookupKey);
    }
    function addInstantAction(action) {
        onManualActionCompleted({ id: generateUUID(), frustrationTypes: [], ...action });
    }
    function stop() {
        activeManualActions.forEach((activeAction) => activeAction.trackedAction.discard());
        activeManualActions.clear();
    }
    return {
        addAction: addInstantAction,
        startAction: startManualAction,
        stopAction: stopManualAction,
        stop,
    };
}

const LONG_TASK_START_TIME_CORRECTION = 1;
function startActionCollection(lifeCycle, hooks, domMutationObservable, windowOpenObservable, configuration) {
    // Shared action tracker for both click and manual actions
    const actionTracker = startActionTracker(lifeCycle);
    const { unsubscribe: unsubscribeAutoAction } = lifeCycle.subscribe(0 /* LifeCycleEventType.AUTO_ACTION_COMPLETED */, (action) => {
        lifeCycle.notify(12 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, processAction(action));
    });
    let stopClickActions = noop;
    if (configuration.trackUserInteractions) {
        ({ stop: stopClickActions } = trackClickActions(lifeCycle, domMutationObservable, windowOpenObservable, configuration, actionTracker));
    }
    const manualActions = trackManualActions(lifeCycle, actionTracker, (action) => {
        lifeCycle.notify(12 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, processAction(action));
    });
    const actionContexts = {
        findActionId: actionTracker.findActionId,
    };
    hooks.register(0 /* HookNames.Assemble */, ({ startTime, eventType }) => {
        if (eventType !== RumEventType.ERROR &&
            eventType !== RumEventType.RESOURCE &&
            eventType !== RumEventType.LONG_TASK) {
            return SKIPPED;
        }
        // Long tasks triggered by interaction handlers (pointerup, click, etc.)
        // can have a start time slightly before the interaction timestamp (long_task.start_time < action.start_time).
        // This likely happens because the interaction timestamp is recorded during the event dispatch,
        // not at the beginning of the rendering frame. I observed a difference of < 1 ms in my tests.
        // Fixes flakiness in test: "associates long tasks to interaction actions"
        const correctedStartTime = eventType === RumEventType.LONG_TASK ? addDuration(startTime, LONG_TASK_START_TIME_CORRECTION) : startTime;
        const actionId = actionContexts.findActionId(correctedStartTime);
        if (!actionId) {
            return SKIPPED;
        }
        return {
            type: eventType,
            action: { id: actionId },
        };
    });
    hooks.register(1 /* HookNames.AssembleTelemetry */, ({ startTime }) => ({
        action: { id: actionContexts.findActionId(startTime) },
    }));
    return {
        addAction: manualActions.addAction,
        startAction: manualActions.startAction,
        stopAction: manualActions.stopAction,
        actionContexts,
        stop: () => {
            unsubscribeAutoAction();
            stopClickActions();
            manualActions.stop();
            actionTracker.stop();
        },
    };
}
function processAction(action) {
    const isAuto = isAutoAction(action);
    const loadingTime = discardNegativeDuration(toServerDuration(action.duration));
    return {
        rawRumEvent: {
            type: RumEventType.ACTION,
            date: action.startClocks.timeStamp,
            action: {
                id: action.id,
                target: { name: action.name },
                type: action.type,
                ...(loadingTime !== undefined && { loading_time: loadingTime }),
                ...(action.counts && {
                    error: { count: action.counts.errorCount },
                    long_task: { count: action.counts.longTaskCount },
                    resource: { count: action.counts.resourceCount },
                }),
                frustration: { type: action.frustrationTypes },
            },
            ...(isAuto
                ? {
                    _dd: {
                        action: {
                            target: action.target,
                            position: action.position,
                            name_source: action.nameSource,
                        },
                    },
                }
                : { context: action.context }),
        },
        duration: action.duration,
        startTime: action.startClocks.relative,
        domainContext: isAuto ? { events: action.events } : { handlingStack: action.handlingStack },
    };
}
function isAutoAction(action) {
    return 'events' in action;
}

function trackConsoleError(errorObservable) {
    const subscription = initConsoleObservable([ConsoleApiName.error]).subscribe((consoleLog) => errorObservable.notify(consoleLog.error));
    return {
        stop: () => {
            subscription.unsubscribe();
        },
    };
}

function trackReportError(configuration, errorObservable) {
    const subscription = initReportObservable(configuration, [
        RawReportType.cspViolation,
        RawReportType.intervention,
    ]).subscribe((rawError) => errorObservable.notify(rawError));
    return {
        stop: () => {
            subscription.unsubscribe();
        },
    };
}

function startErrorCollection(lifeCycle, configuration, bufferedDataObservable) {
    const errorObservable = new Observable();
    bufferedDataObservable.subscribe((bufferedData) => {
        if (bufferedData.type === 0 /* BufferedDataType.RUNTIME_ERROR */) {
            errorObservable.notify(bufferedData.error);
        }
    });
    trackConsoleError(errorObservable);
    trackReportError(configuration, errorObservable);
    errorObservable.subscribe((error) => lifeCycle.notify(14 /* LifeCycleEventType.RAW_ERROR_COLLECTED */, { error }));
    return doStartErrorCollection(lifeCycle);
}
function doStartErrorCollection(lifeCycle) {
    lifeCycle.subscribe(14 /* LifeCycleEventType.RAW_ERROR_COLLECTED */, ({ error }) => {
        lifeCycle.notify(12 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, processError(error));
    });
    return {
        addError: ({ error, handlingStack, componentStack, startClocks, context }) => {
            const rawError = computeRawError({
                originalError: error,
                handlingStack,
                componentStack,
                startClocks,
                nonErrorPrefix: "Provided" /* NonErrorPrefix.PROVIDED */,
                source: ErrorSource.CUSTOM,
                handling: "handled" /* ErrorHandling.HANDLED */,
            });
            rawError.context = combine(rawError.context, context);
            lifeCycle.notify(14 /* LifeCycleEventType.RAW_ERROR_COLLECTED */, { error: rawError });
        },
    };
}
function processError(error) {
    const rawRumEvent = {
        date: error.startClocks.timeStamp,
        error: {
            id: generateUUID(),
            message: error.message,
            source: error.source,
            stack: error.stack,
            handling_stack: error.handlingStack,
            component_stack: error.componentStack,
            type: error.type,
            handling: error.handling,
            causes: error.causes,
            source_type: 'browser',
            fingerprint: error.fingerprint,
            csp: error.csp,
        },
        type: RumEventType.ERROR,
        context: error.context,
    };
    const domainContext = {
        error: error.originalError,
        handlingStack: error.handlingStack,
    };
    return {
        rawRumEvent,
        startTime: error.startClocks.relative,
        domainContext,
    };
}

const alreadyMatchedEntries = new WeakSet();
/**
 * Look for corresponding timing in resource timing buffer
 *
 * Observations:
 * - Timing (start, end) are nested inside the request (start, end)
 * - Some timing can be not exactly nested, being off by < 1 ms
 *
 * Strategy:
 * - from valid nested entries (with 1 ms error margin)
 * - filter out timing that were already matched to a request
 * - then, if a single timing match, return the timing
 * - otherwise we can't decide, return undefined
 */
function matchRequestResourceEntry(request) {
    if (!performance || !('getEntriesByName' in performance)) {
        return;
    }
    const sameNameEntries = performance.getEntriesByName(request.url, 'resource');
    if (!sameNameEntries.length || !('toJSON' in sameNameEntries[0])) {
        return;
    }
    const candidates = sameNameEntries
        .filter((entry) => !alreadyMatchedEntries.has(entry))
        .filter((entry) => hasValidResourceEntryDuration(entry) && hasValidResourceEntryTimings(entry))
        .filter((entry) => isBetween(entry, request.startClocks.relative, endTime({ startTime: request.startClocks.relative, duration: request.duration })));
    if (candidates.length === 1) {
        alreadyMatchedEntries.add(candidates[0]);
        return candidates[0].toJSON();
    }
    return;
}
function endTime(timing) {
    return addDuration(timing.startTime, timing.duration);
}
function isBetween(timing, start, end) {
    const errorMargin = 1;
    return timing.startTime >= start - errorMargin && endTime(timing) <= addDuration(end, errorMargin);
}

const INITIAL_DOCUMENT_OUTDATED_TRACE_ID_THRESHOLD = 2 * ONE_MINUTE;
function getDocumentTraceId(document) {
    const data = getDocumentTraceDataFromMeta(document) || getDocumentTraceDataFromComment(document);
    if (!data || data.traceTime <= dateNow() - INITIAL_DOCUMENT_OUTDATED_TRACE_ID_THRESHOLD) {
        return undefined;
    }
    return data.traceId;
}
function getDocumentTraceDataFromMeta(document) {
    const traceIdMeta = document.querySelector('meta[name=dd-trace-id]');
    const traceTimeMeta = document.querySelector('meta[name=dd-trace-time]');
    return createDocumentTraceData(traceIdMeta && traceIdMeta.content, traceTimeMeta && traceTimeMeta.content);
}
function getDocumentTraceDataFromComment(document) {
    const comment = findTraceComment(document);
    if (!comment) {
        return undefined;
    }
    return createDocumentTraceData(findCommaSeparatedValue(comment, 'trace-id'), findCommaSeparatedValue(comment, 'trace-time'));
}
function createDocumentTraceData(traceId, rawTraceTime) {
    const traceTime = rawTraceTime && Number(rawTraceTime);
    if (!traceId || !traceTime) {
        return undefined;
    }
    return {
        traceId,
        traceTime,
    };
}
function findTraceComment(document) {
    // 1. Try to find the comment as a direct child of the document
    // Note: TSLint advises to use a 'for of', but TS doesn't allow to use 'for of' if the iterated
    // value is not an array or string (here, a NodeList).
    for (let i = 0; i < document.childNodes.length; i += 1) {
        const comment = getTraceCommentFromNode(document.childNodes[i]);
        if (comment) {
            return comment;
        }
    }
    // 2. If the comment is placed after the </html> tag, but have some space or new lines before or
    // after, the DOM parser will lift it (and the surrounding text) at the end of the <body> tag.
    // Try to look for the comment at the end of the <body> by by iterating over its child nodes in
    // reverse order, stopping if we come across a non-text node.
    if (document.body) {
        for (let i = document.body.childNodes.length - 1; i >= 0; i -= 1) {
            const node = document.body.childNodes[i];
            const comment = getTraceCommentFromNode(node);
            if (comment) {
                return comment;
            }
            if (!isTextNode(node)) {
                break;
            }
        }
    }
}
function getTraceCommentFromNode(node) {
    if (node && isCommentNode(node)) {
        const match = /^\s*DATADOG;(.*?)\s*$/.exec(node.data);
        if (match) {
            return match[1];
        }
    }
}

function getNavigationEntry() {
    if (supportPerformanceTimingEvent(RumPerformanceEntryType.NAVIGATION)) {
        const navigationEntry = performance.getEntriesByType(RumPerformanceEntryType.NAVIGATION)[0];
        if (navigationEntry) {
            return navigationEntry;
        }
    }
    const timings = computeTimingsFromDeprecatedPerformanceTiming();
    const entry = {
        entryType: RumPerformanceEntryType.NAVIGATION,
        initiatorType: 'navigation',
        name: window.location.href,
        startTime: 0,
        duration: timings.loadEventEnd,
        decodedBodySize: 0,
        encodedBodySize: 0,
        transferSize: 0,
        workerStart: 0,
        toJSON: () => ({ ...entry, toJSON: undefined }),
        ...timings,
    };
    return entry;
}
function computeTimingsFromDeprecatedPerformanceTiming() {
    const result = {};
    const timing = performance.timing;
    for (const key in timing) {
        if (isNumber(timing[key])) {
            const numberKey = key;
            const timingElement = timing[numberKey];
            result[numberKey] = timingElement === 0 ? 0 : getRelativeTime(timingElement);
        }
    }
    return result;
}
function sanitizeFirstByte(entry) {
    // In some cases the value reported is negative or is larger
    // than the current page time. Ignore these cases:
    // https://github.com/GoogleChrome/web-vitals/issues/137
    // https://github.com/GoogleChrome/web-vitals/issues/162
    return entry.responseStart >= 0 && entry.responseStart <= relativeNow() ? entry.responseStart : undefined;
}
function getResourceEntries() {
    if (supportPerformanceTimingEvent(RumPerformanceEntryType.RESOURCE)) {
        return performance.getEntriesByType(RumPerformanceEntryType.RESOURCE);
    }
    return undefined;
}
/**
 * Find the most relevant resource entry for an LCP element.
 *
 * Resource entries persist for the entire page lifetime and can include multiple requests
 * for the same URL (preloads, cache-busting reloads, SPA route changes, etc.).
 * This function returns the most recent matching entry that started before the LCP time,
 * which is most likely the one that triggered the LCP paint.
 */
function findLcpResourceEntry(resourceUrl, lcpStartTime) {
    const entries = getResourceEntries();
    if (!entries) {
        return undefined;
    }
    return findLast(entries, (entry) => entry.name === resourceUrl && entry.startTime <= lcpStartTime);
}

function retrieveInitialDocumentResourceTiming(configuration, callback, getNavigationEntryImpl = getNavigationEntry) {
    runOnReadyState(configuration, 'interactive', () => {
        const navigationEntry = getNavigationEntryImpl();
        const entry = Object.assign(navigationEntry.toJSON(), {
            entryType: RumPerformanceEntryType.RESOURCE,
            initiatorType: FAKE_INITIAL_DOCUMENT,
            // The ResourceTiming duration entry should be `responseEnd - startTime`. With
            // NavigationTiming entries, `startTime` is always 0, so set it to `responseEnd`.
            duration: navigationEntry.responseEnd,
            traceId: getDocumentTraceId(document),
            toJSON: () => ({ ...entry, toJSON: undefined }),
        });
        callback(entry);
    });
}

// Maximum number of requests to keep in the registry. Requests should be removed quite quickly in
// general, this is just a safety limit to avoid memory leaks in case of a bug.
const MAX_REQUESTS = 1000;
function createRequestRegistry(lifeCycle) {
    const requests = new Set();
    const subscription = lifeCycle.subscribe(8 /* LifeCycleEventType.REQUEST_COMPLETED */, (request) => {
        requests.add(request);
        if (requests.size > MAX_REQUESTS) {
            // monitor-until: 2026-06-01, after early request collection is the default in v7
            addTelemetryDebug('Too many requests');
            requests.delete(requests.values().next().value);
        }
    });
    return {
        getMatchingRequest(entry) {
            // Returns the closest request object that happened before the entry
            let minTimeDifference = Infinity;
            let closestRequest;
            for (const request of requests) {
                const timeDifference = entry.startTime - request.startClocks.relative;
                if (0 <= timeDifference && timeDifference < minTimeDifference && request.url === entry.name) {
                    minTimeDifference = Math.abs(timeDifference);
                    closestRequest = request;
                }
            }
            if (closestRequest) {
                requests.delete(closestRequest);
            }
            return closestRequest;
        },
        stop() {
            subscription.unsubscribe();
        },
    };
}

function startResourceCollection(lifeCycle, configuration, pageStateHistory, taskQueue = createTaskQueue(), retrieveInitialDocumentResourceTimingImpl = retrieveInitialDocumentResourceTiming) {
    let requestRegistry;
    const isEarlyRequestCollectionEnabled = configuration.trackEarlyRequests;
    if (isEarlyRequestCollectionEnabled) {
        requestRegistry = createRequestRegistry(lifeCycle);
    }
    else {
        lifeCycle.subscribe(8 /* LifeCycleEventType.REQUEST_COMPLETED */, (request) => {
            handleResource(() => processRequest(request, configuration, pageStateHistory));
        });
    }
    const performanceResourceSubscription = createPerformanceObservable(configuration, {
        type: RumPerformanceEntryType.RESOURCE,
        buffered: true,
    }).subscribe((entries) => {
        for (const entry of entries) {
            if (isEarlyRequestCollectionEnabled || !isResourceEntryRequestType(entry)) {
                handleResource(() => processResourceEntry(entry, configuration, pageStateHistory, requestRegistry));
            }
        }
    });
    retrieveInitialDocumentResourceTimingImpl(configuration, (timing) => {
        handleResource(() => processResourceEntry(timing, configuration, pageStateHistory, requestRegistry));
    });
    function handleResource(computeRawEvent) {
        taskQueue.push(() => {
            const rawEvent = computeRawEvent();
            if (rawEvent) {
                lifeCycle.notify(12 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, rawEvent);
            }
        });
    }
    return {
        stop: () => {
            taskQueue.stop();
            performanceResourceSubscription.unsubscribe();
        },
    };
}
function processRequest(request, configuration, pageStateHistory) {
    const matchingTiming = matchRequestResourceEntry(request);
    return assembleResource(matchingTiming, request, pageStateHistory, configuration);
}
function processResourceEntry(entry, configuration, pageStateHistory, requestRegistry) {
    const matchingRequest = isResourceEntryRequestType(entry) && requestRegistry ? requestRegistry.getMatchingRequest(entry) : undefined;
    return assembleResource(entry, matchingRequest, pageStateHistory, configuration);
}
// TODO: In the future, the `entry` parameter should be required, making things simpler.
function assembleResource(entry, request, pageStateHistory, configuration) {
    if (!entry && !request) {
        return;
    }
    const tracingInfo = request
        ? computeRequestTracingInfo(request, configuration)
        : computeResourceEntryTracingInfo(entry, configuration);
    if (!configuration.trackResources && !tracingInfo) {
        return;
    }
    const startClocks = entry ? relativeToClocks(entry.startTime) : request.startClocks;
    const duration = entry
        ? computeResourceEntryDuration(entry)
        : computeRequestDuration(pageStateHistory, startClocks, request.duration);
    const graphql = request && computeGraphQlMetaData(request, configuration);
    const resourceEvent = combine({
        date: startClocks.timeStamp,
        resource: {
            id: generateUUID(),
            duration: toServerDuration(duration),
            // TODO: in the future when `entry` is required, we can probably only rely on `computeResourceEntryType`
            type: request
                ? request.type === RequestType.XHR
                    ? ResourceType.XHR
                    : ResourceType.FETCH
                : computeResourceEntryType(entry),
            method: request ? request.method : undefined,
            status_code: request ? request.status : discardZeroStatus(entry.responseStatus),
            url: request ? sanitizeIfLongDataUrl(request.url) : entry.name,
            protocol: entry && computeResourceEntryProtocol(entry),
            delivery_type: entry && computeResourceEntryDeliveryType(entry),
            graphql,
        },
        type: RumEventType.RESOURCE,
        _dd: {
            discarded: !configuration.trackResources,
        },
    }, tracingInfo, entry && computeResourceEntryMetrics(entry));
    return {
        startTime: startClocks.relative,
        duration,
        rawRumEvent: resourceEvent,
        domainContext: getResourceDomainContext(entry, request),
    };
}
function computeGraphQlMetaData(request, configuration) {
    const graphQlConfig = findGraphQlConfiguration(request.url, configuration);
    if (!graphQlConfig) {
        return;
    }
    return extractGraphQlMetadata(request, graphQlConfig);
}
function getResourceDomainContext(entry, request) {
    if (request) {
        const baseDomainContext = {
            performanceEntry: entry,
            isAborted: request.isAborted,
            handlingStack: request.handlingStack,
        };
        if (request.type === RequestType.XHR) {
            return {
                xhr: request.xhr,
                ...baseDomainContext,
            };
        }
        return {
            requestInput: request.input,
            requestInit: request.init,
            response: request.response,
            error: request.error,
            ...baseDomainContext,
        };
    }
    return {
        // Currently, at least one of `entry` or `request` must be defined when calling this function.
        // So `entry` is guaranteed to be defined here. In the future, when `entry` is required, we can
        // remove the `!` assertion.
        performanceEntry: entry,
    };
}
function computeResourceEntryMetrics(entry) {
    const { renderBlockingStatus } = entry;
    return {
        resource: {
            render_blocking_status: renderBlockingStatus,
            ...computeResourceEntrySize(entry),
            ...computeResourceEntryDetails(entry),
        },
    };
}
function computeRequestTracingInfo(request, configuration) {
    const hasBeenTraced = request.traceSampled && request.traceId && request.spanId;
    if (!hasBeenTraced) {
        return undefined;
    }
    return {
        _dd: {
            span_id: request.spanId.toString(),
            trace_id: request.traceId.toString(),
            rule_psr: configuration.rulePsr,
        },
    };
}
function computeResourceEntryTracingInfo(entry, configuration) {
    const hasBeenTraced = entry.traceId;
    if (!hasBeenTraced) {
        return undefined;
    }
    return {
        _dd: {
            trace_id: entry.traceId,
            span_id: createSpanIdentifier().toString(),
            rule_psr: configuration.rulePsr,
        },
    };
}
function computeRequestDuration(pageStateHistory, startClocks, duration) {
    return !pageStateHistory.wasInPageStateDuringPeriod("frozen" /* PageState.FROZEN */, startClocks.relative, duration)
        ? duration
        : undefined;
}
/**
 * The status is 0 for cross-origin resources without CORS headers, so the status is meaningless, and we shouldn't report it
 * https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming/responseStatus#cross-origin_response_status_codes
 */
function discardZeroStatus(statusCode) {
    return statusCode === 0 ? undefined : statusCode;
}

function trackViewEventCounts(lifeCycle, viewId, onChange) {
    const { stop, eventCounts } = trackEventCounts({
        lifeCycle,
        isChildEvent: (event) => event.view.id === viewId,
        onChange,
    });
    return {
        stop,
        eventCounts,
    };
}

// Discard FCP timings above a certain delay to avoid incorrect data
// It happens in some cases like sleep mode or some browser implementations
const FCP_MAXIMUM_DELAY = 10 * ONE_MINUTE;
function trackFirstContentfulPaint(configuration, firstHidden, callback) {
    const performanceSubscription = createPerformanceObservable(configuration, {
        type: RumPerformanceEntryType.PAINT,
        buffered: true,
    }).subscribe((entries) => {
        const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint' &&
            entry.startTime < firstHidden.timeStamp &&
            entry.startTime < FCP_MAXIMUM_DELAY);
        if (fcpEntry) {
            callback(fcpEntry.startTime);
        }
    });
    return {
        stop: performanceSubscription.unsubscribe,
    };
}
/**
 * Measure the First Contentful Paint after a BFCache restoration.
 * The DOM is restored synchronously, so we approximate the FCP with the first frame
 * rendered just after the pageshow event, using two nested requestAnimationFrame calls.
 */
function trackRestoredFirstContentfulPaint(viewStartRelative, callback) {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            callback(elapsed(viewStartRelative, relativeNow()));
        });
    });
}

/**
 * Track the first input occurring during the initial View to return:
 * - First Input Delay
 * - First Input Time
 * Callback is called at most one time.
 * Documentation: https://web.dev/fid/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/master/src/getFID.ts
 */
function trackFirstInput(configuration, firstHidden, callback) {
    const performanceFirstInputSubscription = createPerformanceObservable(configuration, {
        type: RumPerformanceEntryType.FIRST_INPUT,
        buffered: true,
    }).subscribe((entries) => {
        const firstInputEntry = entries.find((entry) => entry.startTime < firstHidden.timeStamp);
        if (firstInputEntry) {
            const firstInputDelay = elapsed(firstInputEntry.startTime, firstInputEntry.processingStart);
            let firstInputTargetSelector;
            if (firstInputEntry.target && isElementNode(firstInputEntry.target)) {
                firstInputTargetSelector = getSelectorFromElement(firstInputEntry.target, configuration.actionNameAttribute);
            }
            callback({
                // Ensure firstInputDelay to be positive, see
                // https://bugs.chromium.org/p/chromium/issues/detail?id=1185815
                delay: firstInputDelay >= 0 ? firstInputDelay : 0,
                time: firstInputEntry.startTime,
                targetSelector: firstInputTargetSelector,
            });
        }
    });
    return {
        stop: () => {
            performanceFirstInputSubscription.unsubscribe();
        },
    };
}

function trackNavigationTimings(configuration, callback, getNavigationEntryImpl = getNavigationEntry) {
    return waitAfterLoadEvent(configuration, () => {
        const entry = getNavigationEntryImpl();
        if (!isIncompleteNavigation(entry)) {
            callback(processNavigationEntry(entry));
        }
    });
}
function processNavigationEntry(entry) {
    return {
        domComplete: entry.domComplete,
        domContentLoaded: entry.domContentLoadedEventEnd,
        domInteractive: entry.domInteractive,
        loadEvent: entry.loadEventEnd,
        firstByte: sanitizeFirstByte(entry),
    };
}
function isIncompleteNavigation(entry) {
    return entry.loadEventEnd <= 0;
}
function waitAfterLoadEvent(configuration, callback) {
    let timeoutId;
    const { stop: stopOnReadyState } = runOnReadyState(configuration, 'complete', () => {
        // Invoke the callback a bit after the actual load event, so the "loadEventEnd" timing is accurate
        timeoutId = setTimeout$1(() => callback());
    });
    return {
        stop: () => {
            stopOnReadyState();
            clearTimeout$1(timeoutId);
        },
    };
}

// Discard LCP timings above a certain delay to avoid incorrect data
// It happens in some cases like sleep mode or some browser implementations
const LCP_MAXIMUM_DELAY = 10 * ONE_MINUTE;
/**
 * Track the largest contentful paint (LCP) occurring during the initial View.  This can yield
 * multiple values, only the most recent one should be used.
 * Documentation: https://web.dev/lcp/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/master/src/onLCP.ts
 */
function trackLargestContentfulPaint(configuration, firstHidden, eventTarget, callback) {
    // Ignore entries that come after the first user interaction. According to the documentation, the
    // browser should not send largest-contentful-paint entries after a user interact with the page,
    // but the web-vitals reference implementation uses this as a safeguard.
    let firstInteractionTimestamp = Infinity;
    const { stop: stopEventListener } = addEventListeners(configuration, eventTarget, ["pointerdown" /* DOM_EVENT.POINTER_DOWN */, "keydown" /* DOM_EVENT.KEY_DOWN */], (event) => {
        firstInteractionTimestamp = event.timeStamp;
    }, { capture: true, once: true });
    let biggestLcpSize = 0;
    const performanceLcpSubscription = createPerformanceObservable(configuration, {
        type: RumPerformanceEntryType.LARGEST_CONTENTFUL_PAINT,
        buffered: true,
    }).subscribe((entries) => {
        const lcpEntry = findLast(entries, (entry) => entry.entryType === RumPerformanceEntryType.LARGEST_CONTENTFUL_PAINT &&
            entry.startTime < firstInteractionTimestamp &&
            entry.startTime < firstHidden.timeStamp &&
            entry.startTime < LCP_MAXIMUM_DELAY &&
            // Ensure to get the LCP entry with the biggest size, see
            // https://bugs.chromium.org/p/chromium/issues/detail?id=1516655
            entry.size > biggestLcpSize);
        if (lcpEntry) {
            let lcpTargetSelector;
            if (lcpEntry.element) {
                lcpTargetSelector = getSelectorFromElement(lcpEntry.element, configuration.actionNameAttribute);
            }
            const resourceUrl = computeLcpEntryUrl(lcpEntry);
            const lcpValue = lcpEntry.startTime;
            const subParts = isExperimentalFeatureEnabled(ExperimentalFeature.LCP_SUBPARTS)
                ? computeLcpSubParts(resourceUrl, lcpValue)
                : undefined;
            callback({
                value: lcpValue,
                targetSelector: lcpTargetSelector,
                resourceUrl,
                subParts,
            });
            biggestLcpSize = lcpEntry.size;
        }
    });
    return {
        stop: () => {
            stopEventListener();
            performanceLcpSubscription.unsubscribe();
        },
    };
}
// The property url report an empty string if the value is not available, we shouldn't report it in this case.
function computeLcpEntryUrl(entry) {
    return entry.url === '' ? undefined : entry.url;
}
/**
 * Compute the LCP sub-parts breakdown (loadDelay, loadTime, renderDelay).
 * Returns undefined if navigation timing data or TTFB is unavailable.
 */
function computeLcpSubParts(resourceUrl, lcpValue) {
    const firstByte = sanitizeFirstByte(getNavigationEntry());
    if (firstByte === undefined) {
        return undefined;
    }
    const lcpResourceEntry = resourceUrl ? findLcpResourceEntry(resourceUrl, lcpValue) : undefined;
    const lcpRequestStart = lcpResourceEntry
        ? Math.max(firstByte, lcpResourceEntry.requestStart || lcpResourceEntry.startTime)
        : firstByte;
    // Cap at LCP time to handle resources that continue downloading after LCP (e.g., videos)
    const lcpResponseEnd = Math.min(lcpValue, Math.max(lcpRequestStart, (lcpResourceEntry === null || lcpResourceEntry === void 0 ? void 0 : lcpResourceEntry.responseEnd) || 0));
    return {
        loadDelay: (lcpRequestStart - firstByte),
        loadTime: (lcpResponseEnd - lcpRequestStart),
        renderDelay: (lcpValue - lcpResponseEnd),
    };
}

function trackFirstHidden(configuration, viewStart, eventTarget = window) {
    if (document.visibilityState === 'hidden') {
        return { timeStamp: 0, stop: noop };
    }
    if (supportPerformanceTimingEvent(RumPerformanceEntryType.VISIBILITY_STATE)) {
        const firstHiddenEntry = performance
            .getEntriesByType(RumPerformanceEntryType.VISIBILITY_STATE)
            .filter((entry) => entry.name === 'hidden')
            .find((entry) => entry.startTime >= viewStart.relative);
        if (firstHiddenEntry) {
            return { timeStamp: firstHiddenEntry.startTime, stop: noop };
        }
    }
    let timeStamp = Infinity;
    const { stop } = addEventListeners(configuration, eventTarget, ["pagehide" /* DOM_EVENT.PAGE_HIDE */, "visibilitychange" /* DOM_EVENT.VISIBILITY_CHANGE */], (event) => {
        if (event.type === "pagehide" /* DOM_EVENT.PAGE_HIDE */ || document.visibilityState === 'hidden') {
            timeStamp = event.timeStamp;
            stop();
        }
    }, { capture: true });
    return {
        get timeStamp() {
            return timeStamp;
        },
        stop,
    };
}

function trackInitialViewMetrics(configuration, viewStart, setLoadEvent, scheduleViewUpdate) {
    const initialViewMetrics = {};
    const { stop: stopNavigationTracking } = trackNavigationTimings(configuration, (navigationTimings) => {
        setLoadEvent(navigationTimings.loadEvent);
        initialViewMetrics.navigationTimings = navigationTimings;
        scheduleViewUpdate();
    });
    const firstHidden = trackFirstHidden(configuration, viewStart);
    const { stop: stopFCPTracking } = trackFirstContentfulPaint(configuration, firstHidden, (firstContentfulPaint) => {
        initialViewMetrics.firstContentfulPaint = firstContentfulPaint;
        scheduleViewUpdate();
    });
    const { stop: stopLCPTracking } = trackLargestContentfulPaint(configuration, firstHidden, window, (largestContentfulPaint) => {
        initialViewMetrics.largestContentfulPaint = largestContentfulPaint;
        scheduleViewUpdate();
    });
    const { stop: stopFIDTracking } = trackFirstInput(configuration, firstHidden, (firstInput) => {
        initialViewMetrics.firstInput = firstInput;
        scheduleViewUpdate();
    });
    function stop() {
        stopNavigationTracking();
        stopFCPTracking();
        stopLCPTracking();
        stopFIDTracking();
        firstHidden.stop();
    }
    return {
        stop,
        initialViewMetrics,
    };
}

/**
 * Calculates the area of a rectangle given its width and height
 */
const calculateArea = (width, height) => width * height;
/**
 * Calculates the intersection area between two rectangles
 */
const calculateIntersectionArea = (rect1, rect2) => {
    const left = Math.max(rect1.left, rect2.left);
    const top = Math.max(rect1.top, rect2.top);
    const right = Math.min(rect1.right, rect2.right);
    const bottom = Math.min(rect1.bottom, rect2.bottom);
    if (left >= right || top >= bottom) {
        return 0;
    }
    return calculateArea(right - left, bottom - top);
};
/**
 * Calculates the total impacted area of a layout shift source
 * This is the sum of the previous and current areas minus their intersection
 */
const getClsAttributionImpactedArea = (source) => {
    const previousArea = calculateArea(source.previousRect.width, source.previousRect.height);
    const currentArea = calculateArea(source.currentRect.width, source.currentRect.height);
    const intersectionArea = calculateIntersectionArea(source.previousRect, source.currentRect);
    return previousArea + currentArea - intersectionArea;
};

/**
 * Track the cumulative layout shifts (CLS).
 * Layout shifts are grouped into session windows.
 * The minimum gap between session windows is 1 second.
 * The maximum duration of a session window is 5 second.
 * The session window layout shift value is the sum of layout shifts inside it.
 * The CLS value is the max of session windows values.
 *
 * This yields a new value whenever the CLS value is updated (a higher session window value is computed).
 *
 * See isLayoutShiftSupported to check for browser support.
 *
 * Documentation:
 * https://web.dev/cls/
 * https://web.dev/evolving-cls/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/master/src/getCLS.ts
 */
function trackCumulativeLayoutShift(configuration, viewStart, callback) {
    if (!isLayoutShiftSupported()) {
        return {
            stop: noop,
        };
    }
    let maxClsValue = 0;
    let biggestShift;
    // if no layout shift happen the value should be reported as 0
    callback({
        value: 0,
    });
    const slidingWindow = slidingSessionWindow();
    const performanceSubscription = createPerformanceObservable(configuration, {
        type: RumPerformanceEntryType.LAYOUT_SHIFT,
        buffered: true,
    }).subscribe((entries) => {
        var _a;
        for (const entry of entries) {
            if (entry.hadRecentInput || entry.startTime < viewStart) {
                continue;
            }
            const { cumulatedValue, isMaxValue } = slidingWindow.update(entry);
            if (isMaxValue) {
                const attribution = getTopImpactedElement(entry.sources);
                biggestShift = {
                    target: (attribution === null || attribution === void 0 ? void 0 : attribution.node) ? new WeakRef(attribution.node) : undefined,
                    time: elapsed(viewStart, entry.startTime),
                    previousRect: attribution === null || attribution === void 0 ? void 0 : attribution.previousRect,
                    currentRect: attribution === null || attribution === void 0 ? void 0 : attribution.currentRect,
                    devicePixelRatio: window.devicePixelRatio,
                };
            }
            if (cumulatedValue > maxClsValue) {
                maxClsValue = cumulatedValue;
                const target = (_a = biggestShift === null || biggestShift === void 0 ? void 0 : biggestShift.target) === null || _a === void 0 ? void 0 : _a.deref();
                callback({
                    value: round(maxClsValue, 4),
                    targetSelector: target && getSelectorFromElement(target, configuration.actionNameAttribute),
                    time: biggestShift === null || biggestShift === void 0 ? void 0 : biggestShift.time,
                    previousRect: (biggestShift === null || biggestShift === void 0 ? void 0 : biggestShift.previousRect) ? asRumRect(biggestShift.previousRect) : undefined,
                    currentRect: (biggestShift === null || biggestShift === void 0 ? void 0 : biggestShift.currentRect) ? asRumRect(biggestShift.currentRect) : undefined,
                    devicePixelRatio: biggestShift === null || biggestShift === void 0 ? void 0 : biggestShift.devicePixelRatio,
                });
            }
        }
    });
    return {
        stop: () => {
            performanceSubscription.unsubscribe();
        },
    };
}
function getTopImpactedElement(sources) {
    let topImpactedSource;
    for (const source of sources) {
        if (source.node && isElementNode(source.node)) {
            const currentImpactedArea = getClsAttributionImpactedArea(source);
            if (!topImpactedSource || getClsAttributionImpactedArea(topImpactedSource) < currentImpactedArea) {
                topImpactedSource = source;
            }
        }
    }
    return topImpactedSource;
}
function asRumRect({ x, y, width, height }) {
    return { x, y, width, height };
}
const MAX_WINDOW_DURATION = 5 * ONE_SECOND;
const MAX_UPDATE_GAP = ONE_SECOND;
function slidingSessionWindow() {
    let cumulatedValue = 0;
    let startTime;
    let endTime;
    let maxValue = 0;
    return {
        update: (entry) => {
            const shouldCreateNewWindow = startTime === undefined ||
                entry.startTime - endTime >= MAX_UPDATE_GAP ||
                entry.startTime - startTime >= MAX_WINDOW_DURATION;
            let isMaxValue;
            if (shouldCreateNewWindow) {
                startTime = endTime = entry.startTime;
                maxValue = cumulatedValue = entry.value;
                isMaxValue = true;
            }
            else {
                cumulatedValue += entry.value;
                endTime = entry.startTime;
                isMaxValue = entry.value > maxValue;
                if (isMaxValue) {
                    maxValue = entry.value;
                }
            }
            return {
                cumulatedValue,
                isMaxValue,
            };
        },
    };
}
/**
 * Check whether `layout-shift` is supported by the browser.
 */
function isLayoutShiftSupported() {
    return supportPerformanceTimingEvent(RumPerformanceEntryType.LAYOUT_SHIFT) && 'WeakRef' in window;
}

/**
 * performance.interactionCount polyfill
 *
 * The interactionCount is an integer which counts the total number of distinct user interactions,
 * for which there was a unique interactionId.
 *
 * The interactionCount polyfill is an estimate based on a convention specific to Chrome. Cf: https://github.com/GoogleChrome/web-vitals/pull/213
 * This is currently not an issue as the polyfill is only used for INP which is currently only supported on Chrome.
 * Hopefully when/if other browsers will support INP, they will also implement performance.interactionCount at the same time, so we won't need that polyfill.
 *
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/main/src/lib/polyfills/interactionCountPolyfill.ts
 */
let observer;
let interactionCountEstimate = 0;
let minKnownInteractionId = Infinity;
let maxKnownInteractionId = 0;
function initInteractionCountPolyfill() {
    if ('interactionCount' in performance || observer) {
        return;
    }
    observer = new window.PerformanceObserver(monitor((entries) => {
        entries.getEntries().forEach((e) => {
            const entry = e;
            if (entry.interactionId) {
                minKnownInteractionId = Math.min(minKnownInteractionId, entry.interactionId);
                maxKnownInteractionId = Math.max(maxKnownInteractionId, entry.interactionId);
                interactionCountEstimate = (maxKnownInteractionId - minKnownInteractionId) / 7 + 1;
            }
        });
    }));
    observer.observe({ type: 'event', buffered: true, durationThreshold: 0 });
}
/**
 * Returns the `interactionCount` value using the native API (if available)
 * or the polyfill estimate in this module.
 */
const getInteractionCount = () => observer ? interactionCountEstimate : window.performance.interactionCount || 0;

// Arbitrary value to prevent unnecessary memory usage on views with lots of interactions.
const MAX_INTERACTION_ENTRIES = 10;
// Arbitrary value to cap INP outliers
const MAX_INP_VALUE = (1 * ONE_MINUTE);
/**
 * Track the interaction to next paint (INP).
 * To avoid outliers, return the p98 worst interaction of the view.
 * Documentation: https://web.dev/inp/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/main/src/onINP.ts
 */
function trackInteractionToNextPaint(configuration, viewStart, viewLoadingType) {
    if (!isInteractionToNextPaintSupported()) {
        return {
            getInteractionToNextPaint: () => undefined,
            setViewEnd: noop,
            stop: noop,
        };
    }
    const { getViewInteractionCount, stopViewInteractionCount } = trackViewInteractionCount(viewLoadingType);
    let viewEnd = Infinity;
    const longestInteractions = trackLongestInteractions(getViewInteractionCount);
    let interactionToNextPaint = -1;
    let interactionToNextPaintTargetSelector;
    let interactionToNextPaintStartTime;
    function handleEntries(entries) {
        for (const entry of entries) {
            if (entry.interactionId &&
                // Check the entry start time is inside the view bounds because some view interactions can be reported after the view end (if long duration).
                entry.startTime >= viewStart &&
                entry.startTime <= viewEnd) {
                longestInteractions.process(entry);
            }
        }
        const newInteraction = longestInteractions.estimateP98Interaction();
        if (newInteraction && newInteraction.duration !== interactionToNextPaint) {
            interactionToNextPaint = newInteraction.duration;
            interactionToNextPaintStartTime = elapsed(viewStart, newInteraction.startTime);
            interactionToNextPaintTargetSelector = getInteractionSelector(newInteraction.startTime);
            if (!interactionToNextPaintTargetSelector && newInteraction.target && isElementNode(newInteraction.target)) {
                interactionToNextPaintTargetSelector = getSelectorFromElement(newInteraction.target, configuration.actionNameAttribute);
            }
        }
    }
    const firstInputSubscription = createPerformanceObservable(configuration, {
        type: RumPerformanceEntryType.FIRST_INPUT,
        buffered: true,
    }).subscribe(handleEntries);
    const eventSubscription = createPerformanceObservable(configuration, {
        type: RumPerformanceEntryType.EVENT,
        // durationThreshold only impact PerformanceEventTiming entries used for INP computation which requires a threshold at 40 (default is 104ms)
        // cf: https://github.com/GoogleChrome/web-vitals/blob/3806160ffbc93c3c4abf210a167b81228172b31c/src/onINP.ts#L202-L210
        durationThreshold: 40,
        buffered: true,
    }).subscribe(handleEntries);
    return {
        getInteractionToNextPaint: () => {
            // If no INP duration where captured because of the performanceObserver 40ms threshold
            // but the view interaction count > 0 then report 0
            if (interactionToNextPaint >= 0) {
                return {
                    value: Math.min(interactionToNextPaint, MAX_INP_VALUE),
                    targetSelector: interactionToNextPaintTargetSelector,
                    time: interactionToNextPaintStartTime,
                };
            }
            else if (getViewInteractionCount()) {
                return {
                    value: 0,
                };
            }
        },
        setViewEnd: (viewEndTime) => {
            viewEnd = viewEndTime;
            stopViewInteractionCount();
        },
        stop: () => {
            eventSubscription.unsubscribe();
            firstInputSubscription.unsubscribe();
        },
    };
}
function trackLongestInteractions(getViewInteractionCount) {
    const longestInteractions = [];
    function sortAndTrimLongestInteractions() {
        longestInteractions.sort((a, b) => b.duration - a.duration).splice(MAX_INTERACTION_ENTRIES);
    }
    return {
        /**
         * Process the performance entry:
         * - if its duration is long enough, add the performance entry to the list of worst interactions
         * - if an entry with the same interaction id exists and its duration is lower than the new one, then replace it in the list of worst interactions
         */
        process(entry) {
            const interactionIndex = longestInteractions.findIndex((interaction) => entry.interactionId === interaction.interactionId);
            const minLongestInteraction = longestInteractions[longestInteractions.length - 1];
            if (interactionIndex !== -1) {
                if (entry.duration > longestInteractions[interactionIndex].duration) {
                    longestInteractions[interactionIndex] = entry;
                    sortAndTrimLongestInteractions();
                }
            }
            else if (longestInteractions.length < MAX_INTERACTION_ENTRIES ||
                entry.duration > minLongestInteraction.duration) {
                longestInteractions.push(entry);
                sortAndTrimLongestInteractions();
            }
        },
        /**
         * Compute the p98 longest interaction.
         * For better performance the computation is based on 10 longest interactions and the interaction count of the current view.
         */
        estimateP98Interaction() {
            const interactionIndex = Math.min(longestInteractions.length - 1, Math.floor(getViewInteractionCount() / 50));
            return longestInteractions[interactionIndex];
        },
    };
}
function trackViewInteractionCount(viewLoadingType) {
    initInteractionCountPolyfill();
    const previousInteractionCount = viewLoadingType === ViewLoadingType.INITIAL_LOAD ? 0 : getInteractionCount();
    let state = { stopped: false };
    function computeViewInteractionCount() {
        return getInteractionCount() - previousInteractionCount;
    }
    return {
        getViewInteractionCount: () => {
            if (state.stopped) {
                return state.interactionCount;
            }
            return computeViewInteractionCount();
        },
        stopViewInteractionCount: () => {
            state = { stopped: true, interactionCount: computeViewInteractionCount() };
        },
    };
}
function isInteractionToNextPaintSupported() {
    return (supportPerformanceTimingEvent(RumPerformanceEntryType.EVENT) &&
        window.PerformanceEventTiming &&
        'interactionId' in PerformanceEventTiming.prototype);
}

/**
 * For non-initial views (such as route changes or BFCache restores), the regular load event does not fire
 * In these cases, trackLoadingTime can only emit a loadingTime  if waitPageActivityEnd detects some post-restore activity.
 * If nothing happens after the view starts,no candidate is recorded and loadingTime stays undefined.
 */
function trackLoadingTime(lifeCycle, domMutationObservable, windowOpenObservable, configuration, loadType, viewStart, callback) {
    let isWaitingForLoadEvent = loadType === ViewLoadingType.INITIAL_LOAD;
    let isWaitingForActivityLoadingTime = true;
    const loadingTimeCandidates = [];
    const firstHidden = trackFirstHidden(configuration, viewStart);
    function invokeCallbackIfAllCandidatesAreReceived() {
        if (!isWaitingForActivityLoadingTime && !isWaitingForLoadEvent && loadingTimeCandidates.length > 0) {
            const loadingTime = Math.max(...loadingTimeCandidates);
            // firstHidden is a relative time from time origin, so we use the relative start time of the view to compare with the loading time
            if (loadingTime < firstHidden.timeStamp - viewStart.relative) {
                callback(loadingTime);
            }
        }
    }
    const { stop } = waitPageActivityEnd(lifeCycle, domMutationObservable, windowOpenObservable, configuration, (event) => {
        if (isWaitingForActivityLoadingTime) {
            isWaitingForActivityLoadingTime = false;
            if (event.hadActivity) {
                loadingTimeCandidates.push(elapsed(viewStart.timeStamp, event.end));
            }
            invokeCallbackIfAllCandidatesAreReceived();
        }
    });
    return {
        stop: () => {
            stop();
            firstHidden.stop();
        },
        setLoadEvent: (loadEvent) => {
            if (isWaitingForLoadEvent) {
                isWaitingForLoadEvent = false;
                loadingTimeCandidates.push(loadEvent);
                invokeCallbackIfAllCandidatesAreReceived();
            }
        },
    };
}

function getScrollX() {
    let scrollX;
    const visual = window.visualViewport;
    if (visual) {
        scrollX = visual.pageLeft - visual.offsetLeft;
    }
    else if (window.scrollX !== undefined) {
        scrollX = window.scrollX;
    }
    else {
        scrollX = window.pageXOffset || 0;
    }
    return Math.round(scrollX);
}
function getScrollY() {
    let scrollY;
    const visual = window.visualViewport;
    if (visual) {
        scrollY = visual.pageTop - visual.offsetTop;
    }
    else if (window.scrollY !== undefined) {
        scrollY = window.scrollY;
    }
    else {
        scrollY = window.pageYOffset || 0;
    }
    return Math.round(scrollY);
}

let viewportObservable;
function initViewportObservable(configuration) {
    if (!viewportObservable) {
        viewportObservable = createViewportObservable(configuration);
    }
    return viewportObservable;
}
function createViewportObservable(configuration) {
    return new Observable((observable) => {
        const { throttled: updateDimension } = throttle(() => {
            observable.notify(getViewportDimension());
        }, 200);
        return addEventListener(configuration, window, "resize" /* DOM_EVENT.RESIZE */, updateDimension, { capture: true, passive: true })
            .stop;
    });
}
// excludes the width and height of any rendered classic scrollbar that is fixed to the visual viewport
function getViewportDimension() {
    const visual = window.visualViewport;
    if (visual) {
        return {
            width: Number(visual.width * visual.scale),
            height: Number(visual.height * visual.scale),
        };
    }
    return {
        width: Number(window.innerWidth || 0),
        height: Number(window.innerHeight || 0),
    };
}

/** Arbitrary scroll throttle duration */
const THROTTLE_SCROLL_DURATION = ONE_SECOND;
function trackScrollMetrics(configuration, viewStart, callback, scrollValues = createScrollValuesObservable(configuration)) {
    let maxScrollDepth = 0;
    let maxScrollHeight = 0;
    let maxScrollHeightTime = 0;
    const subscription = scrollValues.subscribe(({ scrollDepth, scrollTop, scrollHeight }) => {
        let shouldUpdate = false;
        if (scrollDepth > maxScrollDepth) {
            maxScrollDepth = scrollDepth;
            shouldUpdate = true;
        }
        if (scrollHeight > maxScrollHeight) {
            maxScrollHeight = scrollHeight;
            const now = relativeNow();
            maxScrollHeightTime = elapsed(viewStart.relative, now);
            shouldUpdate = true;
        }
        if (shouldUpdate) {
            callback({
                maxDepth: Math.min(maxScrollDepth, maxScrollHeight),
                maxDepthScrollTop: scrollTop,
                maxScrollHeight,
                maxScrollHeightTime,
            });
        }
    });
    return {
        stop: () => subscription.unsubscribe(),
    };
}
function computeScrollValues() {
    const scrollTop = getScrollY();
    const { height } = getViewportDimension();
    const scrollHeight = Math.round((document.scrollingElement || document.documentElement).scrollHeight);
    const scrollDepth = Math.round(height + scrollTop);
    return {
        scrollHeight,
        scrollDepth,
        scrollTop,
    };
}
function createScrollValuesObservable(configuration, throttleDuration = THROTTLE_SCROLL_DURATION) {
    return new Observable((observable) => {
        function notify() {
            observable.notify(computeScrollValues());
        }
        if (window.ResizeObserver) {
            const throttledNotify = throttle(notify, throttleDuration, {
                leading: false,
                trailing: true,
            });
            const observerTarget = document.scrollingElement || document.documentElement;
            const resizeObserver = new ResizeObserver(monitor(throttledNotify.throttled));
            if (observerTarget) {
                resizeObserver.observe(observerTarget);
            }
            const eventListener = addEventListener(configuration, window, "scroll" /* DOM_EVENT.SCROLL */, throttledNotify.throttled, {
                passive: true,
            });
            return () => {
                throttledNotify.cancel();
                resizeObserver.disconnect();
                eventListener.stop();
            };
        }
    });
}

function trackCommonViewMetrics(lifeCycle, domMutationObservable, windowOpenObservable, configuration, scheduleViewUpdate, loadingType, viewStart) {
    const commonViewMetrics = {};
    const { stop: stopLoadingTimeTracking, setLoadEvent } = trackLoadingTime(lifeCycle, domMutationObservable, windowOpenObservable, configuration, loadingType, viewStart, (newLoadingTime) => {
        commonViewMetrics.loadingTime = newLoadingTime;
        scheduleViewUpdate();
    });
    const { stop: stopScrollMetricsTracking } = trackScrollMetrics(configuration, viewStart, (newScrollMetrics) => {
        commonViewMetrics.scroll = newScrollMetrics;
    });
    const { stop: stopCLSTracking } = trackCumulativeLayoutShift(configuration, viewStart.relative, (cumulativeLayoutShift) => {
        commonViewMetrics.cumulativeLayoutShift = cumulativeLayoutShift;
        scheduleViewUpdate();
    });
    const { stop: stopINPTracking, getInteractionToNextPaint, setViewEnd, } = trackInteractionToNextPaint(configuration, viewStart.relative, loadingType);
    return {
        stop: () => {
            stopLoadingTimeTracking();
            stopCLSTracking();
            stopScrollMetricsTracking();
        },
        stopINPTracking,
        setLoadEvent,
        setViewEnd,
        getCommonViewMetrics: () => {
            commonViewMetrics.interactionToNextPaint = getInteractionToNextPaint();
            return commonViewMetrics;
        },
    };
}

function onBFCacheRestore(configuration, callback) {
    const { stop } = addEventListener(configuration, window, "pageshow" /* DOM_EVENT.PAGE_SHOW */, (event) => {
        if (event.persisted) {
            callback(event);
        }
    }, { capture: true });
    return stop;
}

/**
 * BFCache keeps a full in-memory snapshot of the DOM. When the page is restored, nothing needs to be fetched, so the whole
 * viewport repaints in a single frame. Consequently, LCP almost always equals FCP.
 * (See: https://github.com/GoogleChrome/web-vitals/pull/87)
 */
function trackBfcacheMetrics(viewStart, metrics, scheduleViewUpdate) {
    trackRestoredFirstContentfulPaint(viewStart.relative, (paintTime) => {
        metrics.firstContentfulPaint = paintTime;
        metrics.largestContentfulPaint = { value: paintTime };
        scheduleViewUpdate();
    });
}

const THROTTLE_VIEW_UPDATE_PERIOD = 3000;
const SESSION_KEEP_ALIVE_INTERVAL = 5 * ONE_MINUTE;
// Some events or metrics can be captured after the end of the view. To avoid missing those;
// an arbitrary delay is added for stopping their tracking after the view ends.
//
// Ideally, we would not stop and keep tracking events or metrics until the end of the session.
// But this might have a small performance impact if there are many many views.
// So let's have a fairly short delay improving the situation in most cases and avoid impacting performances too much.
const KEEP_TRACKING_AFTER_VIEW_DELAY = 5 * ONE_MINUTE;
function trackViews(location, lifeCycle, domMutationObservable, windowOpenObservable, configuration, locationChangeObservable, areViewsTrackedAutomatically, initialViewOptions) {
    const activeViews = new Set();
    let currentView = startNewView(ViewLoadingType.INITIAL_LOAD, clocksOrigin(), initialViewOptions);
    let stopOnBFCacheRestore;
    startViewLifeCycle();
    let locationChangeSubscription;
    if (areViewsTrackedAutomatically) {
        locationChangeSubscription = renewViewOnLocationChange(locationChangeObservable);
        if (configuration.trackBfcacheViews) {
            stopOnBFCacheRestore = onBFCacheRestore(configuration, (pageshowEvent) => {
                currentView.end();
                const startClocks = relativeToClocks(pageshowEvent.timeStamp);
                currentView = startNewView(ViewLoadingType.BF_CACHE, startClocks, undefined);
            });
        }
    }
    function startNewView(loadingType, startClocks, viewOptions) {
        const newlyCreatedView = newView(lifeCycle, domMutationObservable, windowOpenObservable, configuration, location, loadingType, startClocks, viewOptions);
        activeViews.add(newlyCreatedView);
        newlyCreatedView.stopObservable.subscribe(() => {
            activeViews.delete(newlyCreatedView);
        });
        return newlyCreatedView;
    }
    function startViewLifeCycle() {
        lifeCycle.subscribe(10 /* LifeCycleEventType.SESSION_RENEWED */, () => {
            // Renew view on session renewal
            currentView = startNewView(ViewLoadingType.ROUTE_CHANGE, undefined, {
                name: currentView.name,
                service: currentView.service,
                version: currentView.version,
                context: currentView.contextManager.getContext(),
            });
        });
        lifeCycle.subscribe(9 /* LifeCycleEventType.SESSION_EXPIRED */, () => {
            currentView.end({ sessionIsActive: false });
        });
    }
    function renewViewOnLocationChange(locationChangeObservable) {
        return locationChangeObservable.subscribe(({ oldLocation, newLocation }) => {
            if (areDifferentLocation(oldLocation, newLocation)) {
                currentView.end();
                currentView = startNewView(ViewLoadingType.ROUTE_CHANGE);
            }
        });
    }
    return {
        addTiming: (name, time = timeStampNow()) => {
            currentView.addTiming(name, time);
        },
        startView: (options, startClocks) => {
            currentView.end({ endClocks: startClocks });
            currentView = startNewView(ViewLoadingType.ROUTE_CHANGE, startClocks, options);
        },
        setViewContext: (context) => {
            currentView.contextManager.setContext(context);
        },
        setViewContextProperty: (key, value) => {
            currentView.contextManager.setContextProperty(key, value);
        },
        setViewName: (name) => {
            currentView.setViewName(name);
        },
        getViewContext: () => currentView.contextManager.getContext(),
        stop: () => {
            if (locationChangeSubscription) {
                locationChangeSubscription.unsubscribe();
            }
            if (stopOnBFCacheRestore) {
                stopOnBFCacheRestore();
            }
            currentView.end();
            activeViews.forEach((view) => view.stop());
        },
    };
}
function newView(lifeCycle, domMutationObservable, windowOpenObservable, configuration, initialLocation, loadingType, startClocks = clocksNow(), viewOptions) {
    // Setup initial values
    const id = generateUUID();
    const stopObservable = new Observable();
    const customTimings = {};
    let documentVersion = 0;
    let endClocks;
    const location = shallowClone(initialLocation);
    const contextManager = createContextManager();
    let sessionIsActive = true;
    let name = viewOptions === null || viewOptions === void 0 ? void 0 : viewOptions.name;
    const service = (viewOptions === null || viewOptions === void 0 ? void 0 : viewOptions.service) || configuration.service;
    const version = (viewOptions === null || viewOptions === void 0 ? void 0 : viewOptions.version) || configuration.version;
    const context = viewOptions === null || viewOptions === void 0 ? void 0 : viewOptions.context;
    const handlingStack = viewOptions === null || viewOptions === void 0 ? void 0 : viewOptions.handlingStack;
    if (context) {
        contextManager.setContext(context);
    }
    const viewCreatedEvent = {
        id,
        name,
        startClocks,
        service,
        version,
        context,
    };
    lifeCycle.notify(1 /* LifeCycleEventType.BEFORE_VIEW_CREATED */, viewCreatedEvent);
    lifeCycle.notify(2 /* LifeCycleEventType.VIEW_CREATED */, viewCreatedEvent);
    // Update the view every time the measures are changing
    const { throttled, cancel: cancelScheduleViewUpdate } = throttle(triggerViewUpdate, THROTTLE_VIEW_UPDATE_PERIOD, {
        leading: false,
    });
    const { setLoadEvent, setViewEnd, stop: stopCommonViewMetricsTracking, stopINPTracking, getCommonViewMetrics, } = trackCommonViewMetrics(lifeCycle, domMutationObservable, windowOpenObservable, configuration, scheduleViewUpdate, loadingType, startClocks);
    const { stop: stopInitialViewMetricsTracking, initialViewMetrics } = loadingType === ViewLoadingType.INITIAL_LOAD
        ? trackInitialViewMetrics(configuration, startClocks, setLoadEvent, scheduleViewUpdate)
        : { stop: noop, initialViewMetrics: {} };
    // Start BFCache-specific metrics when restoring from BFCache
    if (loadingType === ViewLoadingType.BF_CACHE) {
        trackBfcacheMetrics(startClocks, initialViewMetrics, scheduleViewUpdate);
    }
    const { stop: stopEventCountsTracking, eventCounts } = trackViewEventCounts(lifeCycle, id, scheduleViewUpdate);
    // Session keep alive
    const keepAliveIntervalId = setInterval(triggerViewUpdate, SESSION_KEEP_ALIVE_INTERVAL);
    const pageMayExitSubscription = lifeCycle.subscribe(11 /* LifeCycleEventType.PAGE_MAY_EXIT */, (pageMayExitEvent) => {
        if (pageMayExitEvent.reason === PageExitReason.UNLOADING) {
            triggerViewUpdate();
        }
    });
    // Initial view update
    triggerViewUpdate();
    // View context update should always be throttled
    contextManager.changeObservable.subscribe(scheduleViewUpdate);
    function triggerBeforeViewUpdate() {
        lifeCycle.notify(3 /* LifeCycleEventType.BEFORE_VIEW_UPDATED */, {
            id,
            name,
            context: contextManager.getContext(),
            startClocks,
            sessionIsActive,
        });
    }
    function scheduleViewUpdate() {
        triggerBeforeViewUpdate();
        throttled();
    }
    function triggerViewUpdate() {
        cancelScheduleViewUpdate();
        triggerBeforeViewUpdate();
        documentVersion += 1;
        const currentEnd = endClocks === undefined ? timeStampNow() : endClocks.timeStamp;
        lifeCycle.notify(4 /* LifeCycleEventType.VIEW_UPDATED */, {
            customTimings,
            documentVersion,
            id,
            name,
            service,
            version,
            context: contextManager.getContext(),
            loadingType,
            location,
            handlingStack,
            startClocks,
            commonViewMetrics: getCommonViewMetrics(),
            initialViewMetrics,
            duration: elapsed(startClocks.timeStamp, currentEnd),
            isActive: endClocks === undefined,
            sessionIsActive,
            eventCounts,
        });
    }
    return {
        get name() {
            return name;
        },
        service,
        version,
        contextManager,
        stopObservable,
        end(options = {}) {
            var _a, _b;
            if (endClocks) {
                // view already ended
                return;
            }
            endClocks = (_a = options.endClocks) !== null && _a !== void 0 ? _a : clocksNow();
            sessionIsActive = (_b = options.sessionIsActive) !== null && _b !== void 0 ? _b : true;
            lifeCycle.notify(5 /* LifeCycleEventType.VIEW_ENDED */, { endClocks });
            lifeCycle.notify(6 /* LifeCycleEventType.AFTER_VIEW_ENDED */, { endClocks });
            clearInterval(keepAliveIntervalId);
            setViewEnd(endClocks.relative);
            stopCommonViewMetricsTracking();
            pageMayExitSubscription.unsubscribe();
            triggerViewUpdate();
            setTimeout$1(() => {
                this.stop();
            }, KEEP_TRACKING_AFTER_VIEW_DELAY);
        },
        stop() {
            stopInitialViewMetricsTracking();
            stopEventCountsTracking();
            stopINPTracking();
            stopObservable.notify();
        },
        addTiming(name, time) {
            if (endClocks) {
                return;
            }
            const relativeTime = looksLikeRelativeTime(time) ? time : elapsed(startClocks.timeStamp, time);
            customTimings[sanitizeTiming(name)] = relativeTime;
            scheduleViewUpdate();
        },
        setViewName(updatedName) {
            name = updatedName;
            triggerViewUpdate();
        },
    };
}
/**
 * Timing name is used as facet path that must contain only letters, digits, or the characters - _ . @ $
 */
function sanitizeTiming(name) {
    const sanitized = name.replace(/[^a-zA-Z0-9-_.@$]/g, '_');
    if (sanitized !== name) {
        display.warn(`Invalid timing name: ${name}, sanitized to: ${sanitized}`);
    }
    return sanitized;
}
function areDifferentLocation(currentLocation, otherLocation) {
    return (currentLocation.pathname !== otherLocation.pathname ||
        (!isHashAnAnchor(otherLocation.hash) &&
            getPathFromHash(otherLocation.hash) !== getPathFromHash(currentLocation.hash)));
}
function isHashAnAnchor(hash) {
    const correspondingId = hash.substring(1);
    // check if the correspondingId is empty because on Firefox an empty string passed to getElementById() prints a consol warning
    return correspondingId !== '' && !!document.getElementById(correspondingId);
}
function getPathFromHash(hash) {
    const index = hash.indexOf('?');
    return index < 0 ? hash : hash.slice(0, index);
}

function startViewCollection(lifeCycle, hooks, configuration, location, domMutationObservable, pageOpenObservable, locationChangeObservable, recorderApi, viewHistory, initialViewOptions) {
    lifeCycle.subscribe(4 /* LifeCycleEventType.VIEW_UPDATED */, (view) => lifeCycle.notify(12 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, processViewUpdate(view, configuration, recorderApi)));
    hooks.register(0 /* HookNames.Assemble */, ({ startTime, eventType }) => {
        const view = viewHistory.findView(startTime);
        if (!view) {
            return DISCARDED;
        }
        return {
            type: eventType,
            service: view.service,
            version: view.version,
            context: view.context,
            view: {
                id: view.id,
                name: view.name,
            },
        };
    });
    hooks.register(1 /* HookNames.AssembleTelemetry */, ({ startTime }) => {
        var _a;
        return ({
            view: {
                id: (_a = viewHistory.findView(startTime)) === null || _a === void 0 ? void 0 : _a.id,
            },
        });
    });
    return trackViews(location, lifeCycle, domMutationObservable, pageOpenObservable, configuration, locationChangeObservable, !configuration.trackViewsManually, initialViewOptions);
}
function processViewUpdate(view, configuration, recorderApi) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    const replayStats = recorderApi.getReplayStats(view.id);
    const clsDevicePixelRatio = (_b = (_a = view.commonViewMetrics) === null || _a === void 0 ? void 0 : _a.cumulativeLayoutShift) === null || _b === void 0 ? void 0 : _b.devicePixelRatio;
    const viewEvent = {
        _dd: {
            document_version: view.documentVersion,
            replay_stats: replayStats,
            cls: clsDevicePixelRatio
                ? {
                    device_pixel_ratio: clsDevicePixelRatio,
                }
                : undefined,
            configuration: {
                start_session_replay_recording_manually: configuration.startSessionReplayRecordingManually,
            },
        },
        date: view.startClocks.timeStamp,
        type: RumEventType.VIEW,
        view: {
            action: {
                count: view.eventCounts.actionCount,
            },
            frustration: {
                count: view.eventCounts.frustrationCount,
            },
            cumulative_layout_shift: (_c = view.commonViewMetrics.cumulativeLayoutShift) === null || _c === void 0 ? void 0 : _c.value,
            cumulative_layout_shift_time: toServerDuration((_d = view.commonViewMetrics.cumulativeLayoutShift) === null || _d === void 0 ? void 0 : _d.time),
            cumulative_layout_shift_target_selector: (_e = view.commonViewMetrics.cumulativeLayoutShift) === null || _e === void 0 ? void 0 : _e.targetSelector,
            first_byte: toServerDuration((_f = view.initialViewMetrics.navigationTimings) === null || _f === void 0 ? void 0 : _f.firstByte),
            dom_complete: toServerDuration((_g = view.initialViewMetrics.navigationTimings) === null || _g === void 0 ? void 0 : _g.domComplete),
            dom_content_loaded: toServerDuration((_h = view.initialViewMetrics.navigationTimings) === null || _h === void 0 ? void 0 : _h.domContentLoaded),
            dom_interactive: toServerDuration((_j = view.initialViewMetrics.navigationTimings) === null || _j === void 0 ? void 0 : _j.domInteractive),
            error: {
                count: view.eventCounts.errorCount,
            },
            first_contentful_paint: toServerDuration(view.initialViewMetrics.firstContentfulPaint),
            first_input_delay: toServerDuration((_k = view.initialViewMetrics.firstInput) === null || _k === void 0 ? void 0 : _k.delay),
            first_input_time: toServerDuration((_l = view.initialViewMetrics.firstInput) === null || _l === void 0 ? void 0 : _l.time),
            first_input_target_selector: (_m = view.initialViewMetrics.firstInput) === null || _m === void 0 ? void 0 : _m.targetSelector,
            interaction_to_next_paint: toServerDuration((_o = view.commonViewMetrics.interactionToNextPaint) === null || _o === void 0 ? void 0 : _o.value),
            interaction_to_next_paint_time: toServerDuration((_p = view.commonViewMetrics.interactionToNextPaint) === null || _p === void 0 ? void 0 : _p.time),
            interaction_to_next_paint_target_selector: (_q = view.commonViewMetrics.interactionToNextPaint) === null || _q === void 0 ? void 0 : _q.targetSelector,
            is_active: view.isActive,
            name: view.name,
            largest_contentful_paint: toServerDuration((_r = view.initialViewMetrics.largestContentfulPaint) === null || _r === void 0 ? void 0 : _r.value),
            largest_contentful_paint_target_selector: (_s = view.initialViewMetrics.largestContentfulPaint) === null || _s === void 0 ? void 0 : _s.targetSelector,
            load_event: toServerDuration((_t = view.initialViewMetrics.navigationTimings) === null || _t === void 0 ? void 0 : _t.loadEvent),
            loading_time: discardNegativeDuration(toServerDuration(view.commonViewMetrics.loadingTime)),
            loading_type: view.loadingType,
            long_task: {
                count: view.eventCounts.longTaskCount,
            },
            performance: computeViewPerformanceData(view.commonViewMetrics, view.initialViewMetrics),
            resource: {
                count: view.eventCounts.resourceCount,
            },
            time_spent: toServerDuration(view.duration),
        },
        display: view.commonViewMetrics.scroll
            ? {
                scroll: {
                    max_depth: view.commonViewMetrics.scroll.maxDepth,
                    max_depth_scroll_top: view.commonViewMetrics.scroll.maxDepthScrollTop,
                    max_scroll_height: view.commonViewMetrics.scroll.maxScrollHeight,
                    max_scroll_height_time: toServerDuration(view.commonViewMetrics.scroll.maxScrollHeightTime),
                },
            }
            : undefined,
        privacy: {
            replay_level: configuration.defaultPrivacyLevel,
        },
        device: {
            locale: navigator.language,
            locales: navigator.languages,
            time_zone: getTimeZone(),
        },
    };
    if (!isEmptyObject(view.customTimings)) {
        viewEvent.view.custom_timings = mapValues(view.customTimings, toServerDuration);
    }
    return {
        rawRumEvent: viewEvent,
        startTime: view.startClocks.relative,
        duration: view.duration,
        domainContext: {
            location: view.location,
            handlingStack: view.handlingStack,
        },
    };
}
function computeViewPerformanceData({ cumulativeLayoutShift, interactionToNextPaint }, { firstContentfulPaint, firstInput, largestContentfulPaint }) {
    return {
        cls: cumulativeLayoutShift && {
            score: cumulativeLayoutShift.value,
            timestamp: toServerDuration(cumulativeLayoutShift.time),
            target_selector: cumulativeLayoutShift.targetSelector,
            previous_rect: cumulativeLayoutShift.previousRect,
            current_rect: cumulativeLayoutShift.currentRect,
        },
        fcp: firstContentfulPaint && { timestamp: toServerDuration(firstContentfulPaint) },
        fid: firstInput && {
            duration: toServerDuration(firstInput.delay),
            timestamp: toServerDuration(firstInput.time),
            target_selector: firstInput.targetSelector,
        },
        inp: interactionToNextPaint && {
            duration: toServerDuration(interactionToNextPaint.value),
            timestamp: toServerDuration(interactionToNextPaint.time),
            target_selector: interactionToNextPaint.targetSelector,
        },
        lcp: largestContentfulPaint && {
            timestamp: toServerDuration(largestContentfulPaint.value),
            target_selector: largestContentfulPaint.targetSelector,
            resource_url: largestContentfulPaint.resourceUrl,
            sub_parts: largestContentfulPaint.subParts
                ? {
                    load_delay: toServerDuration(largestContentfulPaint.subParts.loadDelay),
                    load_time: toServerDuration(largestContentfulPaint.subParts.loadTime),
                    render_delay: toServerDuration(largestContentfulPaint.subParts.renderDelay),
                }
                : undefined,
        },
    };
}

const RUM_SESSION_KEY = 'rum';
function startRumSessionManager(configuration, lifeCycle, trackingConsentState) {
    const sessionManager = startSessionManager(configuration, RUM_SESSION_KEY, (rawTrackingType) => computeTrackingType(configuration, rawTrackingType), trackingConsentState);
    sessionManager.expireObservable.subscribe(() => {
        lifeCycle.notify(9 /* LifeCycleEventType.SESSION_EXPIRED */);
    });
    sessionManager.renewObservable.subscribe(() => {
        lifeCycle.notify(10 /* LifeCycleEventType.SESSION_RENEWED */);
    });
    sessionManager.sessionStateUpdateObservable.subscribe(({ previousState, newState }) => {
        if (!previousState.forcedReplay && newState.forcedReplay) {
            const sessionEntity = sessionManager.findSession();
            if (sessionEntity) {
                sessionEntity.isReplayForced = true;
            }
        }
    });
    return {
        findTrackedSession: (startTime) => {
            const session = sessionManager.findSession(startTime);
            if (!session || session.trackingType === "0" /* RumTrackingType.NOT_TRACKED */) {
                return;
            }
            return {
                id: session.id,
                sessionReplay: session.trackingType === "1" /* RumTrackingType.TRACKED_WITH_SESSION_REPLAY */
                    ? 1 /* SessionReplayState.SAMPLED */
                    : session.isReplayForced
                        ? 2 /* SessionReplayState.FORCED */
                        : 0 /* SessionReplayState.OFF */,
                anonymousId: session.anonymousId,
            };
        },
        expire: sessionManager.expire,
        expireObservable: sessionManager.expireObservable,
        setForcedReplay: () => sessionManager.updateSessionState({ forcedReplay: '1' }),
    };
}
/**
 * Start a tracked replay session stub
 */
function startRumSessionManagerStub() {
    const session = {
        id: '00000000-aaaa-0000-aaaa-000000000000',
        sessionReplay: bridgeSupports("records" /* BridgeCapability.RECORDS */) ? 1 /* SessionReplayState.SAMPLED */ : 0 /* SessionReplayState.OFF */,
    };
    return {
        findTrackedSession: () => session,
        expire: noop,
        expireObservable: new Observable(),
        setForcedReplay: noop,
    };
}
function computeTrackingType(configuration, rawTrackingType) {
    if (hasValidRumSession(rawTrackingType)) {
        return rawTrackingType;
    }
    if (!performDraw(configuration.sessionSampleRate)) {
        return "0" /* RumTrackingType.NOT_TRACKED */;
    }
    if (!performDraw(configuration.sessionReplaySampleRate)) {
        return "2" /* RumTrackingType.TRACKED_WITHOUT_SESSION_REPLAY */;
    }
    return "1" /* RumTrackingType.TRACKED_WITH_SESSION_REPLAY */;
}
function hasValidRumSession(trackingType) {
    return (trackingType === "0" /* RumTrackingType.NOT_TRACKED */ ||
        trackingType === "1" /* RumTrackingType.TRACKED_WITH_SESSION_REPLAY */ ||
        trackingType === "2" /* RumTrackingType.TRACKED_WITHOUT_SESSION_REPLAY */);
}

function startRumBatch(configuration, lifeCycle, reportError, pageMayExitObservable, sessionExpireObservable, createEncoder) {
    const endpoints = [configuration.rumEndpointBuilder];
    if (configuration.replica) {
        endpoints.push(configuration.replica.rumEndpointBuilder);
    }
    const batch = createBatch({
        encoder: createEncoder(2 /* DeflateEncoderStreamId.RUM */),
        request: createHttpRequest(endpoints, reportError),
        flushController: createFlushController({
            pageMayExitObservable,
            sessionExpireObservable,
        }),
    });
    lifeCycle.subscribe(13 /* LifeCycleEventType.RUM_EVENT_COLLECTED */, (serverRumEvent) => {
        if (serverRumEvent.type === RumEventType.VIEW) {
            batch.upsert(serverRumEvent, serverRumEvent.view.id);
        }
        else {
            batch.add(serverRumEvent);
        }
    });
    return batch;
}

function startRumEventBridge(lifeCycle) {
    const bridge = getEventBridge();
    lifeCycle.subscribe(13 /* LifeCycleEventType.RUM_EVENT_COLLECTED */, (serverRumEvent) => {
        bridge.send('rum', serverRumEvent);
    });
}

/**
 * We want to attach to an event:
 * - the url corresponding to its start
 * - the referrer corresponding to the previous view url (or document referrer for initial view)
 */
const URL_CONTEXT_TIME_OUT_DELAY = SESSION_TIME_OUT_DELAY;
function startUrlContexts(lifeCycle, hooks, locationChangeObservable, location) {
    const urlContextHistory = createValueHistory({ expireDelay: URL_CONTEXT_TIME_OUT_DELAY });
    let previousViewUrl;
    lifeCycle.subscribe(1 /* LifeCycleEventType.BEFORE_VIEW_CREATED */, ({ startClocks }) => {
        const viewUrl = location.href;
        urlContextHistory.add(buildUrlContext({
            url: viewUrl,
            referrer: !previousViewUrl ? document.referrer : previousViewUrl,
        }), startClocks.relative);
        previousViewUrl = viewUrl;
    });
    lifeCycle.subscribe(6 /* LifeCycleEventType.AFTER_VIEW_ENDED */, ({ endClocks }) => {
        urlContextHistory.closeActive(endClocks.relative);
    });
    const locationChangeSubscription = locationChangeObservable.subscribe(({ newLocation }) => {
        const current = urlContextHistory.find();
        if (current) {
            const changeTime = relativeNow();
            urlContextHistory.closeActive(changeTime);
            urlContextHistory.add(buildUrlContext({
                url: newLocation.href,
                referrer: current.referrer,
            }), changeTime);
        }
    });
    function buildUrlContext({ url, referrer }) {
        return {
            url,
            referrer,
        };
    }
    hooks.register(0 /* HookNames.Assemble */, ({ startTime, eventType }) => {
        const urlContext = urlContextHistory.find(startTime);
        if (!urlContext) {
            return DISCARDED;
        }
        return {
            type: eventType,
            view: {
                url: urlContext.url,
                referrer: urlContext.referrer,
            },
        };
    });
    return {
        findUrl: (startTime) => urlContextHistory.find(startTime),
        stop: () => {
            locationChangeSubscription.unsubscribe();
            urlContextHistory.stop();
        },
    };
}

function createLocationChangeObservable(configuration, location) {
    let currentLocation = shallowClone(location);
    return new Observable((observable) => {
        const { stop: stopHistoryTracking } = trackHistory(configuration, onLocationChange);
        const { stop: stopHashTracking } = trackHash(configuration, onLocationChange);
        function onLocationChange() {
            if (currentLocation.href === location.href) {
                return;
            }
            const newLocation = shallowClone(location);
            observable.notify({
                newLocation,
                oldLocation: currentLocation,
            });
            currentLocation = newLocation;
        }
        return () => {
            stopHistoryTracking();
            stopHashTracking();
        };
    });
}
function trackHistory(configuration, onHistoryChange) {
    const { stop: stopInstrumentingPushState } = instrumentMethod(getHistoryInstrumentationTarget('pushState'), 'pushState', ({ onPostCall }) => {
        onPostCall(onHistoryChange);
    });
    const { stop: stopInstrumentingReplaceState } = instrumentMethod(getHistoryInstrumentationTarget('replaceState'), 'replaceState', ({ onPostCall }) => {
        onPostCall(onHistoryChange);
    });
    const { stop: removeListener } = addEventListener(configuration, window, "popstate" /* DOM_EVENT.POP_STATE */, onHistoryChange);
    return {
        stop: () => {
            stopInstrumentingPushState();
            stopInstrumentingReplaceState();
            removeListener();
        },
    };
}
function trackHash(configuration, onHashChange) {
    return addEventListener(configuration, window, "hashchange" /* DOM_EVENT.HASH_CHANGE */, onHashChange);
}
function getHistoryInstrumentationTarget(methodName) {
    // Ideally we should always instument the method on the prototype, however some frameworks (e.g [Next.js](https://github.com/vercel/next.js/blob/d3f5532065f3e3bb84fb54bd2dfd1a16d0f03a21/packages/next/src/client/components/app-router.tsx#L429))
    // are wrapping the instance method. In that case we should also wrap the instance method.
    return Object.prototype.hasOwnProperty.call(history, methodName) ? history : History.prototype;
}

const FEATURE_FLAG_CONTEXT_TIME_OUT_DELAY = SESSION_TIME_OUT_DELAY;
/**
 * Start feature flag contexts
 *
 * Feature flag contexts follow the life of views.
 * A new context is added when a view is created and ended when the view is ended
 *
 * Note: we choose not to add a new context at each evaluation to save memory
 */
function startFeatureFlagContexts(lifeCycle, hooks, configuration) {
    const featureFlagContexts = createValueHistory({
        expireDelay: FEATURE_FLAG_CONTEXT_TIME_OUT_DELAY,
    });
    lifeCycle.subscribe(1 /* LifeCycleEventType.BEFORE_VIEW_CREATED */, ({ startClocks }) => {
        featureFlagContexts.add({}, startClocks.relative);
    });
    lifeCycle.subscribe(6 /* LifeCycleEventType.AFTER_VIEW_ENDED */, ({ endClocks }) => {
        featureFlagContexts.closeActive(endClocks.relative);
    });
    hooks.register(0 /* HookNames.Assemble */, ({ startTime, eventType }) => {
        const trackFeatureFlagsForEvents = configuration.trackFeatureFlagsForEvents.concat([
            RumEventType.VIEW,
            RumEventType.ERROR,
        ]);
        if (!trackFeatureFlagsForEvents.includes(eventType)) {
            return SKIPPED;
        }
        const featureFlagContext = featureFlagContexts.find(startTime);
        if (!featureFlagContext || isEmptyObject(featureFlagContext)) {
            return SKIPPED;
        }
        return {
            type: eventType,
            feature_flags: featureFlagContext,
        };
    });
    return {
        addFeatureFlagEvaluation: (key, value) => {
            const currentContext = featureFlagContexts.find();
            if (currentContext) {
                currentContext[key] = value;
            }
        },
    };
}

const MEASURES_PERIOD_DURATION = 10 * ONE_SECOND;
let currentPeriodMeasures;
let batchHasRumEvent;
function startCustomerDataTelemetry(telemetry, lifeCycle, batchFlushObservable) {
    if (!telemetry.metricsEnabled) {
        return;
    }
    initCurrentPeriodMeasures();
    batchHasRumEvent = false;
    // We measure the data of every view updates even if there could only be one per batch due to the upsert
    // It means that contexts bytes count sums can be higher than it really is
    lifeCycle.subscribe(13 /* LifeCycleEventType.RUM_EVENT_COLLECTED */, () => {
        batchHasRumEvent = true;
    });
    batchFlushObservable.subscribe(({ bytesCount, messagesCount }) => {
        // Don't measure batch that only contains telemetry events to avoid batch sending loop
        // It could happen because after each batch we are adding a customer data measures telemetry event to the next one
        if (!batchHasRumEvent) {
            return;
        }
        batchHasRumEvent = false;
        currentPeriodMeasures.batchCount += 1;
        updateMeasure(currentPeriodMeasures.batchBytesCount, bytesCount);
        updateMeasure(currentPeriodMeasures.batchMessagesCount, messagesCount);
    });
    setInterval(sendCurrentPeriodMeasures, MEASURES_PERIOD_DURATION);
}
function sendCurrentPeriodMeasures() {
    if (currentPeriodMeasures.batchCount === 0) {
        return;
    }
    // monitor-until: forever
    addTelemetryMetrics("Customer data measures" /* TelemetryMetrics.CUSTOMER_DATA_METRIC_NAME */, currentPeriodMeasures);
    initCurrentPeriodMeasures();
}
function createMeasure() {
    return { min: Infinity, max: 0, sum: 0 };
}
function updateMeasure(measure, value) {
    measure.sum += value;
    measure.min = Math.min(measure.min, value);
    measure.max = Math.max(measure.max, value);
}
function initCurrentPeriodMeasures() {
    currentPeriodMeasures = {
        batchCount: 0,
        batchBytesCount: createMeasure(),
        batchMessagesCount: createMeasure(),
    };
}

// Arbitrary value to cap number of element for memory consumption in the browser
const MAX_PAGE_STATE_ENTRIES = 4000;
// Arbitrary value to cap number of element for backend & to save bandwidth
const MAX_PAGE_STATE_ENTRIES_SELECTABLE = 500;
const PAGE_STATE_CONTEXT_TIME_OUT_DELAY = SESSION_TIME_OUT_DELAY;
function startPageStateHistory(hooks, configuration, maxPageStateEntriesSelectable = MAX_PAGE_STATE_ENTRIES_SELECTABLE) {
    const pageStateEntryHistory = createValueHistory({
        expireDelay: PAGE_STATE_CONTEXT_TIME_OUT_DELAY,
        maxEntries: MAX_PAGE_STATE_ENTRIES,
    });
    let currentPageState;
    if (supportPerformanceTimingEvent(RumPerformanceEntryType.VISIBILITY_STATE)) {
        const visibilityEntries = performance.getEntriesByType(RumPerformanceEntryType.VISIBILITY_STATE);
        visibilityEntries.forEach((entry) => {
            const state = entry.name === 'hidden' ? "hidden" /* PageState.HIDDEN */ : "active" /* PageState.ACTIVE */;
            addPageState(state, entry.startTime);
        });
    }
    addPageState(getPageState(), relativeNow());
    const { stop: stopEventListeners } = addEventListeners(configuration, window, [
        "pageshow" /* DOM_EVENT.PAGE_SHOW */,
        "focus" /* DOM_EVENT.FOCUS */,
        "blur" /* DOM_EVENT.BLUR */,
        "visibilitychange" /* DOM_EVENT.VISIBILITY_CHANGE */,
        "resume" /* DOM_EVENT.RESUME */,
        "freeze" /* DOM_EVENT.FREEZE */,
        "pagehide" /* DOM_EVENT.PAGE_HIDE */,
    ], (event) => {
        addPageState(computePageState(event), event.timeStamp);
    }, { capture: true });
    function addPageState(nextPageState, startTime = relativeNow()) {
        if (nextPageState === currentPageState) {
            return;
        }
        currentPageState = nextPageState;
        pageStateEntryHistory.closeActive(startTime);
        pageStateEntryHistory.add({ state: currentPageState, startTime }, startTime);
    }
    function wasInPageStateDuringPeriod(state, startTime, duration) {
        return pageStateEntryHistory.findAll(startTime, duration).some((pageState) => pageState.state === state);
    }
    hooks.register(0 /* HookNames.Assemble */, ({ startTime, duration = 0, eventType }) => {
        if (eventType === RumEventType.VIEW) {
            const pageStates = pageStateEntryHistory.findAll(startTime, duration);
            return {
                type: eventType,
                _dd: { page_states: processPageStates(pageStates, startTime, maxPageStateEntriesSelectable) },
            };
        }
        if (eventType === RumEventType.ACTION || eventType === RumEventType.ERROR) {
            return {
                type: eventType,
                view: { in_foreground: wasInPageStateDuringPeriod("active" /* PageState.ACTIVE */, startTime, 0) },
            };
        }
        return SKIPPED;
    });
    return {
        wasInPageStateDuringPeriod,
        addPageState,
        stop: () => {
            stopEventListeners();
            pageStateEntryHistory.stop();
        },
    };
}
function processPageStates(pageStateEntries, eventStartTime, maxPageStateEntriesSelectable) {
    if (pageStateEntries.length === 0) {
        return;
    }
    return pageStateEntries
        .slice(-maxPageStateEntriesSelectable)
        .reverse()
        .map(({ state, startTime }) => ({
        state,
        start: toServerDuration(elapsed(eventStartTime, startTime)),
    }));
}
function computePageState(event) {
    if (event.type === "freeze" /* DOM_EVENT.FREEZE */) {
        return "frozen" /* PageState.FROZEN */;
    }
    else if (event.type === "pagehide" /* DOM_EVENT.PAGE_HIDE */) {
        return event.persisted ? "frozen" /* PageState.FROZEN */ : "terminated" /* PageState.TERMINATED */;
    }
    return getPageState();
}
function getPageState() {
    if (document.visibilityState === 'hidden') {
        return "hidden" /* PageState.HIDDEN */;
    }
    if (document.hasFocus()) {
        return "active" /* PageState.ACTIVE */;
    }
    return "passive" /* PageState.PASSIVE */;
}

function startDisplayContext(hooks, configuration) {
    let viewport;
    // Use requestAnimationFrame to delay the calculation of viewport dimensions until after SDK initialization, preventing long tasks.
    const animationFrameId = requestAnimationFrame(monitor(() => {
        viewport = getViewportDimension();
    }));
    const unsubscribeViewport = initViewportObservable(configuration).subscribe((viewportDimension) => {
        viewport = viewportDimension;
    }).unsubscribe;
    hooks.register(0 /* HookNames.Assemble */, ({ eventType }) => ({
        type: eventType,
        display: viewport ? { viewport } : undefined,
    }));
    return {
        stop: () => {
            unsubscribeViewport();
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        },
    };
}

function createCookieObservable(configuration, cookieName) {
    const detectCookieChangeStrategy = window.cookieStore
        ? listenToCookieStoreChange(configuration)
        : watchCookieFallback;
    return new Observable((observable) => detectCookieChangeStrategy(cookieName, (event) => observable.notify(event)));
}
function listenToCookieStoreChange(configuration) {
    return (cookieName, callback) => {
        const listener = addEventListener(configuration, window.cookieStore, "change" /* DOM_EVENT.CHANGE */, (event) => {
            // Based on our experimentation, we're assuming that entries for the same cookie cannot be in both the 'changed' and 'deleted' arrays.
            // However, due to ambiguity in the specification, we asked for clarification: https://github.com/WICG/cookie-store/issues/226
            const changeEvent = event.changed.find((event) => event.name === cookieName) ||
                event.deleted.find((event) => event.name === cookieName);
            if (changeEvent) {
                callback(changeEvent.value);
            }
        });
        return listener.stop;
    };
}
const WATCH_COOKIE_INTERVAL_DELAY = ONE_SECOND;
function watchCookieFallback(cookieName, callback) {
    const previousCookieValue = findCommaSeparatedValue(document.cookie, cookieName);
    const watchCookieIntervalId = setInterval(() => {
        const cookieValue = findCommaSeparatedValue(document.cookie, cookieName);
        if (cookieValue !== previousCookieValue) {
            callback(cookieValue);
        }
    }, WATCH_COOKIE_INTERVAL_DELAY);
    return () => {
        clearInterval(watchCookieIntervalId);
    };
}

const CI_VISIBILITY_TEST_ID_COOKIE_NAME = 'datadog-ci-visibility-test-execution-id';
function startCiVisibilityContext(configuration, hooks, cookieObservable = createCookieObservable(configuration, CI_VISIBILITY_TEST_ID_COOKIE_NAME)) {
    var _a;
    let testExecutionId = getInitCookie(CI_VISIBILITY_TEST_ID_COOKIE_NAME) || ((_a = window.Cypress) === null || _a === void 0 ? void 0 : _a.env('traceId'));
    const cookieObservableSubscription = cookieObservable.subscribe((value) => {
        testExecutionId = value;
    });
    hooks.register(0 /* HookNames.Assemble */, ({ eventType }) => {
        if (typeof testExecutionId !== 'string') {
            return SKIPPED;
        }
        return {
            type: eventType,
            session: {
                type: "ci_test" /* SessionType.CI_TEST */,
            },
            ci_test: {
                test_execution_id: testExecutionId,
            },
        };
    });
    return {
        stop: () => {
            cookieObservableSubscription.unsubscribe();
        },
    };
}

const LONG_TASK_ID_HISTORY_TIME_OUT_DELAY = SESSION_TIME_OUT_DELAY;
function startLongTaskCollection(lifeCycle, configuration) {
    const history = createValueHistory({
        expireDelay: LONG_TASK_ID_HISTORY_TIME_OUT_DELAY,
    });
    const entryType = supportPerformanceTimingEvent(RumPerformanceEntryType.LONG_ANIMATION_FRAME)
        ? RumPerformanceEntryType.LONG_ANIMATION_FRAME
        : RumPerformanceEntryType.LONG_TASK;
    const subscription = createPerformanceObservable(configuration, {
        type: entryType,
        buffered: true,
    }).subscribe((entries) => {
        for (const entry of entries) {
            if (!configuration.trackLongTasks) {
                break;
            }
            const startClocks = relativeToClocks(entry.startTime);
            const taskId = generateUUID();
            const rawRumEvent = processEntry(entry, startClocks, taskId);
            lifeCycle.notify(12 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, {
                rawRumEvent,
                startTime: startClocks.relative,
                duration: entry.duration,
                domainContext: { performanceEntry: entry },
            });
            history.add({ id: taskId, startClocks, duration: entry.duration, entryType }, startClocks.relative);
            history.closeActive(addDuration(startClocks.relative, entry.duration));
        }
    });
    const longTaskContexts = {
        findLongTasks: (startTime, duration) => history.findAll(startTime, duration),
    };
    return {
        stop: () => {
            subscription.unsubscribe();
            history.stop();
        },
        longTaskContexts,
    };
}
function processEntry(entry, startClocks, taskId) {
    const baseEvent = {
        date: startClocks.timeStamp,
        type: RumEventType.LONG_TASK,
        _dd: { discarded: false },
    };
    if (entry.entryType === RumPerformanceEntryType.LONG_TASK) {
        return {
            ...baseEvent,
            long_task: {
                id: taskId,
                entry_type: RumLongTaskEntryType.LONG_TASK,
                duration: toServerDuration(entry.duration),
            },
        };
    }
    return {
        ...baseEvent,
        long_task: {
            id: taskId,
            entry_type: RumLongTaskEntryType.LONG_ANIMATION_FRAME,
            duration: toServerDuration(entry.duration),
            blocking_duration: toServerDuration(entry.blockingDuration),
            first_ui_event_timestamp: toServerDuration(entry.firstUIEventTimestamp),
            render_start: toServerDuration(entry.renderStart),
            style_and_layout_start: toServerDuration(entry.styleAndLayoutStart),
            start_time: toServerDuration(entry.startTime),
            scripts: entry.scripts.map((script) => ({
                duration: toServerDuration(script.duration),
                pause_duration: toServerDuration(script.pauseDuration),
                forced_style_and_layout_duration: toServerDuration(script.forcedStyleAndLayoutDuration),
                start_time: toServerDuration(script.startTime),
                execution_start: toServerDuration(script.executionStart),
                source_url: script.sourceURL,
                source_function_name: script.sourceFunctionName,
                source_char_position: script.sourceCharPosition,
                invoker: script.invoker,
                invoker_type: script.invokerType,
                window_attribution: script.windowAttribution,
            })),
        },
    };
}

function startSyntheticsContext(hooks) {
    hooks.register(0 /* HookNames.Assemble */, ({ eventType }) => {
        if (!isSyntheticsTest()) {
            return SKIPPED;
        }
        const testId = getSyntheticsTestId();
        const resultId = getSyntheticsResultId();
        return {
            type: eventType,
            session: {
                type: "synthetics" /* SessionType.SYNTHETICS */,
            },
            synthetics: {
                test_id: testId,
                result_id: resultId,
                injected: willSyntheticsInjectRum(),
            },
        };
    });
}

/**
 * Allows declaring and enforcing modifications to specific fields of an object.
 * Only supports modifying properties of an object (even if nested in an array).
 * Does not support array manipulation (adding/removing items).
 */
function limitModification(object, modifiableFieldPaths, modifier) {
    const clone = deepClone(object);
    const result = modifier(clone);
    objectEntries(modifiableFieldPaths).forEach(([fieldPath, fieldType]) => 
    // Traverse both object and clone simultaneously up to the path and apply the modification from the clone to the original object when the type is valid
    setValueAtPath(object, clone, fieldPath.split(/\.|(?=\[\])/), fieldType));
    return result;
}
function setValueAtPath(object, clone, pathSegments, fieldType) {
    const [field, ...restPathSegments] = pathSegments;
    if (field === '[]') {
        if (Array.isArray(object) && Array.isArray(clone)) {
            object.forEach((item, i) => setValueAtPath(item, clone[i], restPathSegments, fieldType));
        }
        return;
    }
    if (!isValidObject(object) || !isValidObject(clone)) {
        return;
    }
    if (restPathSegments.length > 0) {
        return setValueAtPath(object[field], clone[field], restPathSegments, fieldType);
    }
    setNestedValue(object, field, clone[field], fieldType);
}
function setNestedValue(object, field, value, fieldType) {
    const newType = getType(value);
    if (newType === fieldType) {
        object[field] = sanitize(value);
    }
    else if (fieldType === 'object' && (newType === 'undefined' || newType === 'null')) {
        object[field] = {};
    }
}
function isValidObject(object) {
    return getType(object) === 'object';
}

const VIEW_MODIFIABLE_FIELD_PATHS = {
    'view.name': 'string',
    'view.url': 'string',
    'view.referrer': 'string',
};
const USER_CUSTOMIZABLE_FIELD_PATHS = {
    context: 'object',
};
const ROOT_MODIFIABLE_FIELD_PATHS = {
    service: 'string',
    version: 'string',
};
let modifiableFieldPathsByEvent;
function startRumAssembly(configuration, lifeCycle, hooks, reportError, eventRateLimit) {
    modifiableFieldPathsByEvent = {
        [RumEventType.VIEW]: {
            'view.performance.lcp.resource_url': 'string',
            ...USER_CUSTOMIZABLE_FIELD_PATHS,
            ...VIEW_MODIFIABLE_FIELD_PATHS,
            ...ROOT_MODIFIABLE_FIELD_PATHS,
        },
        [RumEventType.ERROR]: {
            'error.message': 'string',
            'error.stack': 'string',
            'error.resource.url': 'string',
            'error.fingerprint': 'string',
            ...USER_CUSTOMIZABLE_FIELD_PATHS,
            ...VIEW_MODIFIABLE_FIELD_PATHS,
            ...ROOT_MODIFIABLE_FIELD_PATHS,
        },
        [RumEventType.RESOURCE]: {
            'resource.url': 'string',
            'resource.graphql.variables': 'string',
            ...USER_CUSTOMIZABLE_FIELD_PATHS,
            ...VIEW_MODIFIABLE_FIELD_PATHS,
            ...ROOT_MODIFIABLE_FIELD_PATHS,
        },
        [RumEventType.ACTION]: {
            'action.target.name': 'string',
            ...USER_CUSTOMIZABLE_FIELD_PATHS,
            ...VIEW_MODIFIABLE_FIELD_PATHS,
            ...ROOT_MODIFIABLE_FIELD_PATHS,
        },
        [RumEventType.LONG_TASK]: {
            'long_task.scripts[].source_url': 'string',
            'long_task.scripts[].invoker': 'string',
            ...USER_CUSTOMIZABLE_FIELD_PATHS,
            ...VIEW_MODIFIABLE_FIELD_PATHS,
            ...ROOT_MODIFIABLE_FIELD_PATHS,
        },
        [RumEventType.VITAL]: {
            ...USER_CUSTOMIZABLE_FIELD_PATHS,
            ...VIEW_MODIFIABLE_FIELD_PATHS,
            ...ROOT_MODIFIABLE_FIELD_PATHS,
        },
    };
    const eventRateLimiters = {
        [RumEventType.ERROR]: createEventRateLimiter(RumEventType.ERROR, reportError, eventRateLimit),
        [RumEventType.ACTION]: createEventRateLimiter(RumEventType.ACTION, reportError, eventRateLimit),
        [RumEventType.VITAL]: createEventRateLimiter(RumEventType.VITAL, reportError, eventRateLimit),
    };
    lifeCycle.subscribe(12 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, ({ startTime, duration, rawRumEvent, domainContext }) => {
        const defaultRumEventAttributes = hooks.triggerHook(0 /* HookNames.Assemble */, {
            eventType: rawRumEvent.type,
            rawRumEvent,
            domainContext,
            startTime,
            duration,
        });
        if (defaultRumEventAttributes === DISCARDED) {
            return;
        }
        const serverRumEvent = combine(defaultRumEventAttributes, rawRumEvent, {
            ddtags: buildTags(configuration).join(','),
        });
        if (shouldSend(serverRumEvent, configuration.beforeSend, domainContext, eventRateLimiters)) {
            if (isEmptyObject(serverRumEvent.context)) {
                delete serverRumEvent.context;
            }
            lifeCycle.notify(13 /* LifeCycleEventType.RUM_EVENT_COLLECTED */, serverRumEvent);
        }
    });
}
function shouldSend(event, beforeSend, domainContext, eventRateLimiters) {
    var _a;
    if (beforeSend) {
        const result = limitModification(event, modifiableFieldPathsByEvent[event.type], (event) => beforeSend(event, domainContext));
        if (result === false && event.type !== RumEventType.VIEW) {
            return false;
        }
        if (result === false) {
            display.warn("Can't dismiss view events using beforeSend!");
        }
    }
    const rateLimitReached = (_a = eventRateLimiters[event.type]) === null || _a === void 0 ? void 0 : _a.isLimitReached();
    return !rateLimitReached;
}

function startSessionContext(hooks, sessionManager, recorderApi, viewHistory) {
    hooks.register(0 /* HookNames.Assemble */, ({ eventType, startTime }) => {
        const session = sessionManager.findTrackedSession(startTime);
        const view = viewHistory.findView(startTime);
        if (!session || !view) {
            return DISCARDED;
        }
        let hasReplay;
        let sampledForReplay;
        let isActive;
        if (eventType === RumEventType.VIEW) {
            hasReplay = recorderApi.getReplayStats(view.id) ? true : undefined;
            sampledForReplay = session.sessionReplay === 1 /* SessionReplayState.SAMPLED */;
            isActive = view.sessionIsActive ? undefined : false;
        }
        else {
            hasReplay = recorderApi.isRecording() ? true : undefined;
        }
        return {
            type: eventType,
            session: {
                id: session.id,
                type: "user" /* SessionType.USER */,
                has_replay: hasReplay,
                sampled_for_replay: sampledForReplay,
                is_active: isActive,
            },
        };
    });
    hooks.register(1 /* HookNames.AssembleTelemetry */, ({ startTime }) => {
        const session = sessionManager.findTrackedSession(startTime);
        if (!session) {
            return SKIPPED;
        }
        return {
            session: {
                id: session.id,
            },
        };
    });
}

function startConnectivityContext(hooks) {
    hooks.register(0 /* HookNames.Assemble */, ({ eventType }) => ({
        type: eventType,
        connectivity: getConnectivity(),
    }));
}

function startDefaultContext(hooks, configuration, sdkName) {
    hooks.register(0 /* HookNames.Assemble */, ({ eventType }) => {
        const source = configuration.source;
        return {
            type: eventType,
            _dd: {
                format_version: 2,
                drift: currentDrift(),
                configuration: {
                    session_sample_rate: round(configuration.sessionSampleRate, 3),
                    session_replay_sample_rate: round(configuration.sessionReplaySampleRate, 3),
                    profiling_sample_rate: round(configuration.profilingSampleRate, 3),
                    trace_sample_rate: round(configuration.traceSampleRate, 3),
                    beta_encode_cookie_options: configuration.betaEncodeCookieOptions,
                },
                browser_sdk_version: canUseEventBridge() ? "6.27.1" : undefined,
                sdk_name: sdkName,
            },
            application: {
                id: configuration.applicationId,
            },
            date: timeStampNow(),
            source,
        };
    });
    hooks.register(1 /* HookNames.AssembleTelemetry */, () => ({
        application: { id: configuration.applicationId },
    }));
}

function startTrackingConsentContext(hooks, trackingConsentState) {
    hooks.register(1 /* HookNames.AssembleTelemetry */, () => {
        const wasConsented = trackingConsentState.isGranted();
        if (!wasConsented) {
            return DISCARDED;
        }
        return SKIPPED;
    });
}

const allowedEventTypes = [
    RumEventType.ACTION,
    RumEventType.ERROR,
    RumEventType.LONG_TASK,
    RumEventType.RESOURCE,
    RumEventType.VITAL,
];
function startEventCollection(lifeCycle) {
    return {
        addEvent: (startTime, event, domainContext, duration) => {
            if (!allowedEventTypes.includes(event.type)) {
                return;
            }
            lifeCycle.notify(12 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, {
                startTime,
                rawRumEvent: event,
                domainContext,
                duration,
            });
        },
    };
}

function startInitialViewMetricsTelemetry(lifeCycle, telemetry) {
    if (!telemetry.metricsEnabled) {
        return { stop: noop };
    }
    const { unsubscribe } = lifeCycle.subscribe(4 /* LifeCycleEventType.VIEW_UPDATED */, ({ initialViewMetrics }) => {
        if (!initialViewMetrics.largestContentfulPaint || !initialViewMetrics.navigationTimings) {
            return;
        }
        // The navigation timings become available shortly after the load event fires, so
        // we're snapshotting the LCP value available at that point. However, more LCP values
        // can be emitted until the page is scrolled or interacted with, so it's possible that
        // the final LCP value may differ. These metrics are intended to help diagnose
        // performance issues early in the page load process, and using LCP-at-page-load is a
        // good fit for that use case, but it's important to be aware that this is not
        // necessarily equivalent to the normal LCP metric.
        // monitor-until: 2026-07-01
        addTelemetryMetrics("Initial view metrics" /* TelemetryMetrics.INITIAL_VIEW_METRICS_TELEMETRY_NAME */, {
            metrics: createCoreInitialViewMetrics(initialViewMetrics.largestContentfulPaint, initialViewMetrics.navigationTimings),
        });
        unsubscribe();
    });
    return {
        stop: unsubscribe,
    };
}
function createCoreInitialViewMetrics(lcp, navigation) {
    return {
        lcp: {
            value: lcp.value,
        },
        navigation: {
            domComplete: navigation.domComplete,
            domContentLoaded: navigation.domContentLoaded,
            domInteractive: navigation.domInteractive,
            firstByte: navigation.firstByte,
            loadEvent: navigation.loadEvent,
        },
    };
}

function startSourceCodeContext(hooks) {
    if (!isExperimentalFeatureEnabled(ExperimentalFeature.SOURCE_CODE_CONTEXT)) {
        return;
    }
    const browserWindow = window;
    const contextByFile = new Map();
    function buildContextByFile() {
        if (!browserWindow.DD_SOURCE_CODE_CONTEXT) {
            return;
        }
        objectEntries(browserWindow.DD_SOURCE_CODE_CONTEXT).forEach(([stack, context]) => {
            const stackTrace = computeStackTrace({ stack });
            const firstFrame = stackTrace.stack[0];
            if (!firstFrame.url) {
                addTelemetryError('Source code context: missing frame url', { stack });
                return;
            }
            // don't overwrite existing context
            if (!contextByFile.has(firstFrame.url)) {
                contextByFile.set(firstFrame.url, context);
            }
        });
        browserWindow.DD_SOURCE_CODE_CONTEXT = {};
    }
    buildContextByFile();
    hooks.register(0 /* HookNames.Assemble */, ({ domainContext, rawRumEvent }) => {
        buildContextByFile();
        const url = getSourceUrl(domainContext, rawRumEvent);
        if (url) {
            const context = contextByFile.get(url);
            if (context) {
                return {
                    type: rawRumEvent.type,
                    service: context.service,
                    version: context.version,
                };
            }
        }
        return SKIPPED;
    });
}
function getSourceUrl(domainContext, rawRumEvent) {
    var _a, _b;
    if (rawRumEvent.type === 'long_task' && rawRumEvent.long_task.entry_type === 'long-animation-frame') {
        return (_a = rawRumEvent.long_task.scripts[0]) === null || _a === void 0 ? void 0 : _a.source_url;
    }
    let stack;
    if ('handlingStack' in domainContext) {
        stack = domainContext.handlingStack;
    }
    if (rawRumEvent.type === 'error' && rawRumEvent.error.stack) {
        stack = rawRumEvent.error.stack;
    }
    const stackTrace = computeStackTrace({ stack });
    return (_b = stackTrace.stack[0]) === null || _b === void 0 ? void 0 : _b.url;
}

function startRum(configuration, recorderApi, profilerApi, initialViewOptions, createEncoder, 
// `startRum` and its subcomponents assume tracking consent is granted initially and starts
// collecting logs unconditionally. As such, `startRum` should be called with a
// `trackingConsentState` set to "granted".
trackingConsentState, customVitalsState, bufferedDataObservable, telemetry, hooks, sdkName) {
    const cleanupTasks = [];
    const lifeCycle = new LifeCycle();
    lifeCycle.subscribe(13 /* LifeCycleEventType.RUM_EVENT_COLLECTED */, (event) => sendToExtension('rum', event));
    const reportError = (error) => {
        lifeCycle.notify(14 /* LifeCycleEventType.RAW_ERROR_COLLECTED */, { error });
        // monitor-until: forever, to keep an eye on the errors reported to customers
        addTelemetryDebug('Error reported to customer', { 'error.message': error.message });
    };
    const pageMayExitObservable = createPageMayExitObservable(configuration);
    const pageMayExitSubscription = pageMayExitObservable.subscribe((event) => {
        lifeCycle.notify(11 /* LifeCycleEventType.PAGE_MAY_EXIT */, event);
    });
    cleanupTasks.push(() => pageMayExitSubscription.unsubscribe());
    const session = !canUseEventBridge()
        ? startRumSessionManager(configuration, lifeCycle, trackingConsentState)
        : startRumSessionManagerStub();
    if (!canUseEventBridge()) {
        const batch = startRumBatch(configuration, lifeCycle, reportError, pageMayExitObservable, session.expireObservable, createEncoder);
        cleanupTasks.push(() => batch.stop());
        startCustomerDataTelemetry(telemetry, lifeCycle, batch.flushController.flushObservable);
    }
    else {
        startRumEventBridge(lifeCycle);
    }
    startTrackingConsentContext(hooks, trackingConsentState);
    const { stop: stopInitialViewMetricsTelemetry } = startInitialViewMetricsTelemetry(lifeCycle, telemetry);
    cleanupTasks.push(stopInitialViewMetricsTelemetry);
    const { stop: stopRumEventCollection, ...startRumEventCollectionResult } = startRumEventCollection(lifeCycle, hooks, configuration, session, recorderApi, initialViewOptions, customVitalsState, bufferedDataObservable, sdkName, reportError);
    cleanupTasks.push(stopRumEventCollection);
    bufferedDataObservable.unbuffer();
    // Add Clean-up tasks for Profiler API.
    cleanupTasks.push(() => profilerApi.stop());
    return {
        ...startRumEventCollectionResult,
        lifeCycle,
        session,
        stopSession: () => session.expire(),
        telemetry,
        stop: () => {
            cleanupTasks.forEach((task) => task());
        },
        hooks,
    };
}
function startRumEventCollection(lifeCycle, hooks, configuration, session, recorderApi, initialViewOptions, customVitalsState, bufferedDataObservable, sdkName, reportError) {
    const cleanupTasks = [];
    const domMutationObservable = createDOMMutationObservable();
    const locationChangeObservable = createLocationChangeObservable(configuration, location);
    const { observable: windowOpenObservable, stop: stopWindowOpen } = createWindowOpenObservable();
    cleanupTasks.push(stopWindowOpen);
    startDefaultContext(hooks, configuration, sdkName);
    const pageStateHistory = startPageStateHistory(hooks, configuration);
    cleanupTasks.push(() => pageStateHistory.stop());
    const viewHistory = startViewHistory(lifeCycle);
    cleanupTasks.push(() => viewHistory.stop());
    const urlContexts = startUrlContexts(lifeCycle, hooks, locationChangeObservable, location);
    cleanupTasks.push(() => urlContexts.stop());
    const featureFlagContexts = startFeatureFlagContexts(lifeCycle, hooks, configuration);
    startSessionContext(hooks, session, recorderApi, viewHistory);
    startConnectivityContext(hooks);
    const globalContext = startGlobalContext(hooks, configuration, 'rum');
    const userContext = startUserContext(hooks, configuration, session, 'rum');
    const accountContext = startAccountContext(hooks, configuration, 'rum');
    const actionCollection = startActionCollection(lifeCycle, hooks, domMutationObservable, windowOpenObservable, configuration);
    cleanupTasks.push(actionCollection.stop);
    const eventCollection = startEventCollection(lifeCycle);
    const displayContext = startDisplayContext(hooks, configuration);
    cleanupTasks.push(displayContext.stop);
    const ciVisibilityContext = startCiVisibilityContext(configuration, hooks);
    cleanupTasks.push(ciVisibilityContext.stop);
    startSyntheticsContext(hooks);
    startRumAssembly(configuration, lifeCycle, hooks, reportError);
    const { addTiming, startView, setViewName, setViewContext, setViewContextProperty, getViewContext, stop: stopViewCollection, } = startViewCollection(lifeCycle, hooks, configuration, location, domMutationObservable, windowOpenObservable, locationChangeObservable, recorderApi, viewHistory, initialViewOptions);
    startSourceCodeContext(hooks);
    cleanupTasks.push(stopViewCollection);
    const { stop: stopResourceCollection } = startResourceCollection(lifeCycle, configuration, pageStateHistory);
    cleanupTasks.push(stopResourceCollection);
    const { stop: stopLongTaskCollection, longTaskContexts } = startLongTaskCollection(lifeCycle, configuration);
    cleanupTasks.push(stopLongTaskCollection);
    const { addError } = startErrorCollection(lifeCycle, configuration, bufferedDataObservable);
    startRequestCollection(lifeCycle, configuration, session, userContext, accountContext);
    const vitalCollection = startVitalCollection(lifeCycle, pageStateHistory, customVitalsState);
    const internalContext = startInternalContext(configuration.applicationId, session, viewHistory, actionCollection.actionContexts, urlContexts);
    return {
        addAction: actionCollection.addAction,
        startAction: actionCollection.startAction,
        stopAction: actionCollection.stopAction,
        addEvent: eventCollection.addEvent,
        addError,
        addTiming,
        addFeatureFlagEvaluation: featureFlagContexts.addFeatureFlagEvaluation,
        startView,
        setViewContext,
        setViewContextProperty,
        getViewContext,
        setViewName,
        viewHistory,
        getInternalContext: internalContext.get,
        startDurationVital: vitalCollection.startDurationVital,
        stopDurationVital: vitalCollection.stopDurationVital,
        addDurationVital: vitalCollection.addDurationVital,
        addOperationStepVital: vitalCollection.addOperationStepVital,
        globalContext,
        userContext,
        accountContext,
        longTaskContexts,
        stop: () => cleanupTasks.forEach((task) => task()),
    };
}

function getSessionReplayUrl(configuration, { session, viewContext, errorType, }) {
    const sessionId = session ? session.id : 'no-session-id';
    const parameters = [];
    if (errorType !== undefined) {
        parameters.push(`error-type=${errorType}`);
    }
    if (viewContext) {
        parameters.push(`seed=${viewContext.id}`);
        parameters.push(`from=${viewContext.startClocks.timeStamp}`);
    }
    const origin = getDatadogSiteUrl(configuration);
    const path = `/rum/replay/sessions/${sessionId}`;
    return `${origin}${path}?${parameters.join('&')}`;
}
function getDatadogSiteUrl(rumConfiguration) {
    const site = rumConfiguration.site;
    const subdomain = rumConfiguration.subdomain || getSiteDefaultSubdomain(rumConfiguration);
    return `https://${subdomain ? `${subdomain}.` : ''}${site}`;
}
function getSiteDefaultSubdomain(configuration) {
    switch (configuration.site) {
        case INTAKE_SITE_US1:
        case INTAKE_SITE_EU1:
            return 'app';
        case INTAKE_SITE_STAGING:
            return 'dd';
        default:
            return undefined;
    }
}

const MAX_STATS_HISTORY = 1000;
let statsPerView;
function getSegmentsCount(viewId) {
    return getOrCreateReplayStats(viewId).segments_count;
}
function addSegment(viewId) {
    getOrCreateReplayStats(viewId).segments_count += 1;
}
function addRecord(viewId) {
    getOrCreateReplayStats(viewId).records_count += 1;
}
function addWroteData(viewId, additionalBytesCount) {
    getOrCreateReplayStats(viewId).segments_total_raw_size += additionalBytesCount;
}
function getReplayStats(viewId) {
    return statsPerView === null || statsPerView === void 0 ? void 0 : statsPerView.get(viewId);
}
function getOrCreateReplayStats(viewId) {
    if (!statsPerView) {
        statsPerView = new Map();
    }
    let replayStats;
    if (statsPerView.has(viewId)) {
        replayStats = statsPerView.get(viewId);
    }
    else {
        replayStats = {
            records_count: 0,
            segments_count: 0,
            segments_total_raw_size: 0,
        };
        statsPerView.set(viewId, replayStats);
        if (statsPerView.size > MAX_STATS_HISTORY) {
            deleteOldestStats();
        }
    }
    return replayStats;
}
function deleteOldestStats() {
    if (!statsPerView) {
        return;
    }
    const toDelete = statsPerView.keys().next().value;
    if (toDelete) {
        statsPerView.delete(toDelete);
    }
}

function createDeflateEncoder(configuration, worker, streamId) {
    let rawBytesCount = 0;
    let compressedData = [];
    let compressedDataTrailer;
    let isEmpty = true;
    let nextWriteActionId = 0;
    const pendingWriteActions = [];
    const { stop: removeMessageListener } = addEventListener(configuration, worker, 'message', ({ data: workerResponse }) => {
        if (workerResponse.type !== 'wrote' || workerResponse.streamId !== streamId) {
            return;
        }
        const nextPendingAction = pendingWriteActions[0];
        if (nextPendingAction) {
            if (nextPendingAction.id === workerResponse.id) {
                pendingWriteActions.shift();
                rawBytesCount += workerResponse.additionalBytesCount;
                compressedData.push(workerResponse.result);
                compressedDataTrailer = workerResponse.trailer;
                if (nextPendingAction.writeCallback) {
                    nextPendingAction.writeCallback(workerResponse.result.byteLength);
                }
                else if (nextPendingAction.finishCallback) {
                    nextPendingAction.finishCallback();
                }
            }
            else if (nextPendingAction.id < workerResponse.id) {
                // Worker responses received out of order
                removeMessageListener();
            }
        }
    });
    function consumeResult() {
        const output = compressedData.length === 0 ? new Uint8Array(0) : concatBuffers(compressedData.concat(compressedDataTrailer));
        const result = {
            rawBytesCount,
            output,
            outputBytesCount: output.byteLength,
            encoding: 'deflate',
        };
        rawBytesCount = 0;
        compressedData = [];
        return result;
    }
    function sendResetIfNeeded() {
        if (!isEmpty) {
            worker.postMessage({
                action: 'reset',
                streamId,
            });
            isEmpty = true;
        }
    }
    return {
        isAsync: true,
        get isEmpty() {
            return isEmpty;
        },
        write(data, callback) {
            worker.postMessage({
                action: 'write',
                id: nextWriteActionId,
                data,
                streamId,
            });
            pendingWriteActions.push({
                id: nextWriteActionId,
                writeCallback: callback,
                data,
            });
            isEmpty = false;
            nextWriteActionId += 1;
        },
        finish(callback) {
            sendResetIfNeeded();
            if (!pendingWriteActions.length) {
                callback(consumeResult());
            }
            else {
                // Make sure we do not call any write callback
                pendingWriteActions.forEach((pendingWriteAction) => {
                    delete pendingWriteAction.writeCallback;
                });
                // Wait for the last action to finish before calling the finish callback
                pendingWriteActions[pendingWriteActions.length - 1].finishCallback = () => callback(consumeResult());
            }
        },
        finishSync() {
            sendResetIfNeeded();
            const pendingData = pendingWriteActions.map((pendingWriteAction) => pendingWriteAction.data).join('');
            // Ignore all pending write actions responses from the worker
            pendingWriteActions.length = 0;
            return { ...consumeResult(), pendingData };
        },
        estimateEncodedBytesCount(data) {
            // This is a rough estimation of the data size once it'll be encoded by deflate. We observed
            // that if it's the first chunk of data pushed to the stream, the ratio is lower (3-4), but
            // after that the ratio is greater (10+). We chose 8 here, which (on average) seems to produce
            // requests of the expected size.
            return data.length / 8;
        },
        stop() {
            removeMessageListener();
        },
    };
}

function reportScriptLoadingError({ configuredUrl, error, source, scriptType, }) {
    display.error(`${source} failed to start: an error occurred while initializing the ${scriptType}:`, error);
    if (error instanceof Event || (error instanceof Error && isMessageCspRelated(error.message))) {
        let baseMessage;
        if (configuredUrl) {
            baseMessage = `Please make sure the ${scriptType} URL ${configuredUrl} is correct and CSP is correctly configured.`;
        }
        else {
            baseMessage = 'Please make sure CSP is correctly configured.';
        }
        display.error(`${baseMessage} See documentation at ${DOCS_ORIGIN}/integrations/content_security_policy_logs/#use-csp-with-real-user-monitoring-and-session-replay`);
    }
    else if (scriptType === 'worker') {
        addTelemetryError(error);
    }
}
function isMessageCspRelated(message) {
    return (message.includes('Content Security Policy') ||
        // Related to `require-trusted-types-for` CSP: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/require-trusted-types-for
        message.includes("requires 'TrustedScriptURL'"));
}

const INITIALIZATION_TIME_OUT_DELAY = 30 * ONE_SECOND;
function createDeflateWorker(configuration) {
    return new Worker(configuration.workerUrl || URL.createObjectURL(new Blob(["(()=>{function t(t){if(1===t.length)return t[0];const e=t.reduce((t,e)=>t+e.length,0),a=new Uint8Array(e);let n=0;for(const e of t)a.set(e,n),n+=e.length;return a}function e(t){for(var e=t.length;--e>=0;)t[e]=0}var a=new Uint8Array([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0]),n=new Uint8Array([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13]),r=new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7]),i=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),s=Array(576);e(s);var h=Array(60);e(h);var l=Array(512);e(l);var _=Array(256);e(_);var o=Array(29);e(o);var d,u,f,c=Array(30);function p(t,e,a,n,r){this.static_tree=t,this.extra_bits=e,this.extra_base=a,this.elems=n,this.max_length=r,this.has_stree=t&&t.length}function g(t,e){this.dyn_tree=t,this.max_code=0,this.stat_desc=e}e(c);var v=function(t){return t<256?l[t]:l[256+(t>>>7)]},w=function(t,e){t.pending_buf[t.pending++]=255&e,t.pending_buf[t.pending++]=e>>>8&255},m=function(t,e,a){t.bi_valid>16-a?(t.bi_buf|=e<<t.bi_valid&65535,w(t,t.bi_buf),t.bi_buf=e>>16-t.bi_valid,t.bi_valid+=a-16):(t.bi_buf|=e<<t.bi_valid&65535,t.bi_valid+=a)},b=function(t,e,a){m(t,a[2*e],a[2*e+1])},y=function(t,e){var a=0;do{a|=1&t,t>>>=1,a<<=1}while(--e>0);return a>>>1},z=function(t,e,a){var n,r,i=Array(16),s=0;for(n=1;n<=15;n++)i[n]=s=s+a[n-1]<<1;for(r=0;r<=e;r++){var h=t[2*r+1];0!==h&&(t[2*r]=y(i[h]++,h))}},k=function(t){var e;for(e=0;e<286;e++)t.dyn_ltree[2*e]=0;for(e=0;e<30;e++)t.dyn_dtree[2*e]=0;for(e=0;e<19;e++)t.bl_tree[2*e]=0;t.dyn_ltree[512]=1,t.opt_len=t.static_len=0,t.last_lit=t.matches=0},x=function(t){t.bi_valid>8?w(t,t.bi_buf):t.bi_valid>0&&(t.pending_buf[t.pending++]=t.bi_buf),t.bi_buf=0,t.bi_valid=0},A=function(t,e,a,n){var r=2*e,i=2*a;return t[r]<t[i]||t[r]===t[i]&&n[e]<=n[a]},U=function(t,e,a){for(var n=t.heap[a],r=a<<1;r<=t.heap_len&&(r<t.heap_len&&A(e,t.heap[r+1],t.heap[r],t.depth)&&r++,!A(e,n,t.heap[r],t.depth));)t.heap[a]=t.heap[r],a=r,r<<=1;t.heap[a]=n},B=function(t,e,r){var i,s,h,l,d=0;if(0!==t.last_lit)do{i=t.pending_buf[t.d_buf+2*d]<<8|t.pending_buf[t.d_buf+2*d+1],s=t.pending_buf[t.l_buf+d],d++,0===i?b(t,s,e):(h=_[s],b(t,h+256+1,e),0!==(l=a[h])&&(s-=o[h],m(t,s,l)),i--,h=v(i),b(t,h,r),0!==(l=n[h])&&(i-=c[h],m(t,i,l)))}while(d<t.last_lit);b(t,256,e)},I=function(t,e){var a,n,r,i=e.dyn_tree,s=e.stat_desc.static_tree,h=e.stat_desc.has_stree,l=e.stat_desc.elems,_=-1;for(t.heap_len=0,t.heap_max=573,a=0;a<l;a++)0!==i[2*a]?(t.heap[++t.heap_len]=_=a,t.depth[a]=0):i[2*a+1]=0;for(;t.heap_len<2;)i[2*(r=t.heap[++t.heap_len]=_<2?++_:0)]=1,t.depth[r]=0,t.opt_len--,h&&(t.static_len-=s[2*r+1]);for(e.max_code=_,a=t.heap_len>>1;a>=1;a--)U(t,i,a);r=l;do{a=t.heap[1],t.heap[1]=t.heap[t.heap_len--],U(t,i,1),n=t.heap[1],t.heap[--t.heap_max]=a,t.heap[--t.heap_max]=n,i[2*r]=i[2*a]+i[2*n],t.depth[r]=(t.depth[a]>=t.depth[n]?t.depth[a]:t.depth[n])+1,i[2*a+1]=i[2*n+1]=r,t.heap[1]=r++,U(t,i,1)}while(t.heap_len>=2);t.heap[--t.heap_max]=t.heap[1],function(t,e){var a,n,r,i,s,h,l=e.dyn_tree,_=e.max_code,o=e.stat_desc.static_tree,d=e.stat_desc.has_stree,u=e.stat_desc.extra_bits,f=e.stat_desc.extra_base,c=e.stat_desc.max_length,p=0;for(i=0;i<=15;i++)t.bl_count[i]=0;for(l[2*t.heap[t.heap_max]+1]=0,a=t.heap_max+1;a<573;a++)(i=l[2*l[2*(n=t.heap[a])+1]+1]+1)>c&&(i=c,p++),l[2*n+1]=i,n>_||(t.bl_count[i]++,s=0,n>=f&&(s=u[n-f]),h=l[2*n],t.opt_len+=h*(i+s),d&&(t.static_len+=h*(o[2*n+1]+s)));if(0!==p){do{for(i=c-1;0===t.bl_count[i];)i--;t.bl_count[i]--,t.bl_count[i+1]+=2,t.bl_count[c]--,p-=2}while(p>0);for(i=c;0!==i;i--)for(n=t.bl_count[i];0!==n;)(r=t.heap[--a])>_||(l[2*r+1]!==i&&(t.opt_len+=(i-l[2*r+1])*l[2*r],l[2*r+1]=i),n--)}}(t,e),z(i,_,t.bl_count)},E=function(t,e,a){var n,r,i=-1,s=e[1],h=0,l=7,_=4;for(0===s&&(l=138,_=3),e[2*(a+1)+1]=65535,n=0;n<=a;n++)r=s,s=e[2*(n+1)+1],++h<l&&r===s||(h<_?t.bl_tree[2*r]+=h:0!==r?(r!==i&&t.bl_tree[2*r]++,t.bl_tree[32]++):h<=10?t.bl_tree[34]++:t.bl_tree[36]++,h=0,i=r,0===s?(l=138,_=3):r===s?(l=6,_=3):(l=7,_=4))},C=function(t,e,a){var n,r,i=-1,s=e[1],h=0,l=7,_=4;for(0===s&&(l=138,_=3),n=0;n<=a;n++)if(r=s,s=e[2*(n+1)+1],!(++h<l&&r===s)){if(h<_)do{b(t,r,t.bl_tree)}while(0!==--h);else 0!==r?(r!==i&&(b(t,r,t.bl_tree),h--),b(t,16,t.bl_tree),m(t,h-3,2)):h<=10?(b(t,17,t.bl_tree),m(t,h-3,3)):(b(t,18,t.bl_tree),m(t,h-11,7));h=0,i=r,0===s?(l=138,_=3):r===s?(l=6,_=3):(l=7,_=4)}},D=!1,M=function(t,e,a,n){m(t,0+(n?1:0),3),function(t,e,a){x(t),w(t,a),w(t,~a),t.pending_buf.set(t.window.subarray(e,e+a),t.pending),t.pending+=a}(t,e,a)},j=M,L=function(t,e,a,n){for(var r=65535&t,i=t>>>16&65535,s=0;0!==a;){a-=s=a>2e3?2e3:a;do{i=i+(r=r+e[n++]|0)|0}while(--s);r%=65521,i%=65521}return r|i<<16},S=new Uint32Array(function(){for(var t,e=[],a=0;a<256;a++){t=a;for(var n=0;n<8;n++)t=1&t?3988292384^t>>>1:t>>>1;e[a]=t}return e}()),T=function(t,e,a,n){var r=S,i=n+a;t^=-1;for(var s=n;s<i;s++)t=t>>>8^r[255&(t^e[s])];return-1^t},O={2:\"need dictionary\",1:\"stream end\",0:\"\",\"-1\":\"file error\",\"-2\":\"stream error\",\"-3\":\"data error\",\"-4\":\"insufficient memory\",\"-5\":\"buffer error\",\"-6\":\"incompatible version\"},q=j,F=function(t,e,a){return t.pending_buf[t.d_buf+2*t.last_lit]=e>>>8&255,t.pending_buf[t.d_buf+2*t.last_lit+1]=255&e,t.pending_buf[t.l_buf+t.last_lit]=255&a,t.last_lit++,0===e?t.dyn_ltree[2*a]++:(t.matches++,e--,t.dyn_ltree[2*(_[a]+256+1)]++,t.dyn_dtree[2*v(e)]++),t.last_lit===t.lit_bufsize-1},G=-2,H=258,J=262,K=103,N=113,P=666,Q=function(t,e){return t.msg=O[e],e},R=function(t){return(t<<1)-(t>4?9:0)},V=function(t){for(var e=t.length;--e>=0;)t[e]=0},W=function(t,e,a){return(e<<t.hash_shift^a)&t.hash_mask},X=function(t){var e=t.state,a=e.pending;a>t.avail_out&&(a=t.avail_out),0!==a&&(t.output.set(e.pending_buf.subarray(e.pending_out,e.pending_out+a),t.next_out),t.next_out+=a,e.pending_out+=a,t.total_out+=a,t.avail_out-=a,e.pending-=a,0===e.pending&&(e.pending_out=0))},Y=function(t,e){(function(t,e,a,n){var r,l,_=0;t.level>0?(2===t.strm.data_type&&(t.strm.data_type=function(t){var e,a=4093624447;for(e=0;e<=31;e++,a>>>=1)if(1&a&&0!==t.dyn_ltree[2*e])return 0;if(0!==t.dyn_ltree[18]||0!==t.dyn_ltree[20]||0!==t.dyn_ltree[26])return 1;for(e=32;e<256;e++)if(0!==t.dyn_ltree[2*e])return 1;return 0}(t)),I(t,t.l_desc),I(t,t.d_desc),_=function(t){var e;for(E(t,t.dyn_ltree,t.l_desc.max_code),E(t,t.dyn_dtree,t.d_desc.max_code),I(t,t.bl_desc),e=18;e>=3&&0===t.bl_tree[2*i[e]+1];e--);return t.opt_len+=3*(e+1)+5+5+4,e}(t),r=t.opt_len+3+7>>>3,(l=t.static_len+3+7>>>3)<=r&&(r=l)):r=l=a+5,a+4<=r&&-1!==e?M(t,e,a,n):4===t.strategy||l===r?(m(t,2+(n?1:0),3),B(t,s,h)):(m(t,4+(n?1:0),3),function(t,e,a,n){var r;for(m(t,e-257,5),m(t,a-1,5),m(t,n-4,4),r=0;r<n;r++)m(t,t.bl_tree[2*i[r]+1],3);C(t,t.dyn_ltree,e-1),C(t,t.dyn_dtree,a-1)}(t,t.l_desc.max_code+1,t.d_desc.max_code+1,_+1),B(t,t.dyn_ltree,t.dyn_dtree)),k(t),n&&x(t)})(t,t.block_start>=0?t.block_start:-1,t.strstart-t.block_start,e),t.block_start=t.strstart,X(t.strm)},Z=function(t,e){t.pending_buf[t.pending++]=e},$=function(t,e){t.pending_buf[t.pending++]=e>>>8&255,t.pending_buf[t.pending++]=255&e},tt=function(t,e,a,n){var r=t.avail_in;return r>n&&(r=n),0===r?0:(t.avail_in-=r,e.set(t.input.subarray(t.next_in,t.next_in+r),a),1===t.state.wrap?t.adler=L(t.adler,e,r,a):2===t.state.wrap&&(t.adler=T(t.adler,e,r,a)),t.next_in+=r,t.total_in+=r,r)},et=function(t,e){var a,n,r=t.max_chain_length,i=t.strstart,s=t.prev_length,h=t.nice_match,l=t.strstart>t.w_size-J?t.strstart-(t.w_size-J):0,_=t.window,o=t.w_mask,d=t.prev,u=t.strstart+H,f=_[i+s-1],c=_[i+s];t.prev_length>=t.good_match&&(r>>=2),h>t.lookahead&&(h=t.lookahead);do{if(_[(a=e)+s]===c&&_[a+s-1]===f&&_[a]===_[i]&&_[++a]===_[i+1]){i+=2,a++;do{}while(_[++i]===_[++a]&&_[++i]===_[++a]&&_[++i]===_[++a]&&_[++i]===_[++a]&&_[++i]===_[++a]&&_[++i]===_[++a]&&_[++i]===_[++a]&&_[++i]===_[++a]&&i<u);if(n=H-(u-i),i=u-H,n>s){if(t.match_start=e,s=n,n>=h)break;f=_[i+s-1],c=_[i+s]}}}while((e=d[e&o])>l&&0!==--r);return s<=t.lookahead?s:t.lookahead},at=function(t){var e,a,n,r,i,s=t.w_size;do{if(r=t.window_size-t.lookahead-t.strstart,t.strstart>=s+(s-J)){t.window.set(t.window.subarray(s,s+s),0),t.match_start-=s,t.strstart-=s,t.block_start-=s,e=a=t.hash_size;do{n=t.head[--e],t.head[e]=n>=s?n-s:0}while(--a);e=a=s;do{n=t.prev[--e],t.prev[e]=n>=s?n-s:0}while(--a);r+=s}if(0===t.strm.avail_in)break;if(a=tt(t.strm,t.window,t.strstart+t.lookahead,r),t.lookahead+=a,t.lookahead+t.insert>=3)for(i=t.strstart-t.insert,t.ins_h=t.window[i],t.ins_h=W(t,t.ins_h,t.window[i+1]);t.insert&&(t.ins_h=W(t,t.ins_h,t.window[i+3-1]),t.prev[i&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=i,i++,t.insert--,!(t.lookahead+t.insert<3)););}while(t.lookahead<J&&0!==t.strm.avail_in)},nt=function(t,e){for(var a,n;;){if(t.lookahead<J){if(at(t),t.lookahead<J&&0===e)return 1;if(0===t.lookahead)break}if(a=0,t.lookahead>=3&&(t.ins_h=W(t,t.ins_h,t.window[t.strstart+3-1]),a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),0!==a&&t.strstart-a<=t.w_size-J&&(t.match_length=et(t,a)),t.match_length>=3)if(n=F(t,t.strstart-t.match_start,t.match_length-3),t.lookahead-=t.match_length,t.match_length<=t.max_lazy_match&&t.lookahead>=3){t.match_length--;do{t.strstart++,t.ins_h=W(t,t.ins_h,t.window[t.strstart+3-1]),a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart}while(0!==--t.match_length);t.strstart++}else t.strstart+=t.match_length,t.match_length=0,t.ins_h=t.window[t.strstart],t.ins_h=W(t,t.ins_h,t.window[t.strstart+1]);else n=F(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++;if(n&&(Y(t,!1),0===t.strm.avail_out))return 1}return t.insert=t.strstart<2?t.strstart:2,4===e?(Y(t,!0),0===t.strm.avail_out?3:4):t.last_lit&&(Y(t,!1),0===t.strm.avail_out)?1:2},rt=function(t,e){for(var a,n,r;;){if(t.lookahead<J){if(at(t),t.lookahead<J&&0===e)return 1;if(0===t.lookahead)break}if(a=0,t.lookahead>=3&&(t.ins_h=W(t,t.ins_h,t.window[t.strstart+3-1]),a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),t.prev_length=t.match_length,t.prev_match=t.match_start,t.match_length=2,0!==a&&t.prev_length<t.max_lazy_match&&t.strstart-a<=t.w_size-J&&(t.match_length=et(t,a),t.match_length<=5&&(1===t.strategy||3===t.match_length&&t.strstart-t.match_start>4096)&&(t.match_length=2)),t.prev_length>=3&&t.match_length<=t.prev_length){r=t.strstart+t.lookahead-3,n=F(t,t.strstart-1-t.prev_match,t.prev_length-3),t.lookahead-=t.prev_length-1,t.prev_length-=2;do{++t.strstart<=r&&(t.ins_h=W(t,t.ins_h,t.window[t.strstart+3-1]),a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart)}while(0!==--t.prev_length);if(t.match_available=0,t.match_length=2,t.strstart++,n&&(Y(t,!1),0===t.strm.avail_out))return 1}else if(t.match_available){if((n=F(t,0,t.window[t.strstart-1]))&&Y(t,!1),t.strstart++,t.lookahead--,0===t.strm.avail_out)return 1}else t.match_available=1,t.strstart++,t.lookahead--}return t.match_available&&(n=F(t,0,t.window[t.strstart-1]),t.match_available=0),t.insert=t.strstart<2?t.strstart:2,4===e?(Y(t,!0),0===t.strm.avail_out?3:4):t.last_lit&&(Y(t,!1),0===t.strm.avail_out)?1:2};function it(t,e,a,n,r){this.good_length=t,this.max_lazy=e,this.nice_length=a,this.max_chain=n,this.func=r}var st=[new it(0,0,0,0,function(t,e){var a=65535;for(a>t.pending_buf_size-5&&(a=t.pending_buf_size-5);;){if(t.lookahead<=1){if(at(t),0===t.lookahead&&0===e)return 1;if(0===t.lookahead)break}t.strstart+=t.lookahead,t.lookahead=0;var n=t.block_start+a;if((0===t.strstart||t.strstart>=n)&&(t.lookahead=t.strstart-n,t.strstart=n,Y(t,!1),0===t.strm.avail_out))return 1;if(t.strstart-t.block_start>=t.w_size-J&&(Y(t,!1),0===t.strm.avail_out))return 1}return t.insert=0,4===e?(Y(t,!0),0===t.strm.avail_out?3:4):(t.strstart>t.block_start&&(Y(t,!1),t.strm.avail_out),1)}),new it(4,4,8,4,nt),new it(4,5,16,8,nt),new it(4,6,32,32,nt),new it(4,4,16,16,rt),new it(8,16,32,32,rt),new it(8,16,128,128,rt),new it(8,32,128,256,rt),new it(32,128,258,1024,rt),new it(32,258,258,4096,rt)];function ht(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=8,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new Uint16Array(1146),this.dyn_dtree=new Uint16Array(122),this.bl_tree=new Uint16Array(78),V(this.dyn_ltree),V(this.dyn_dtree),V(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new Uint16Array(16),this.heap=new Uint16Array(573),V(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new Uint16Array(573),V(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}for(var lt=function(t){var e,i=function(t){if(!t||!t.state)return Q(t,G);t.total_in=t.total_out=0,t.data_type=2;var e=t.state;return e.pending=0,e.pending_out=0,e.wrap<0&&(e.wrap=-e.wrap),e.status=e.wrap?42:N,t.adler=2===e.wrap?0:1,e.last_flush=0,function(t){D||(function(){var t,e,i,g,v,w=Array(16);for(i=0,g=0;g<28;g++)for(o[g]=i,t=0;t<1<<a[g];t++)_[i++]=g;for(_[i-1]=g,v=0,g=0;g<16;g++)for(c[g]=v,t=0;t<1<<n[g];t++)l[v++]=g;for(v>>=7;g<30;g++)for(c[g]=v<<7,t=0;t<1<<n[g]-7;t++)l[256+v++]=g;for(e=0;e<=15;e++)w[e]=0;for(t=0;t<=143;)s[2*t+1]=8,t++,w[8]++;for(;t<=255;)s[2*t+1]=9,t++,w[9]++;for(;t<=279;)s[2*t+1]=7,t++,w[7]++;for(;t<=287;)s[2*t+1]=8,t++,w[8]++;for(z(s,287,w),t=0;t<30;t++)h[2*t+1]=5,h[2*t]=y(t,5);d=new p(s,a,257,286,15),u=new p(h,n,0,30,15),f=new p([],r,0,19,7)}(),D=!0),t.l_desc=new g(t.dyn_ltree,d),t.d_desc=new g(t.dyn_dtree,u),t.bl_desc=new g(t.bl_tree,f),t.bi_buf=0,t.bi_valid=0,k(t)}(e),0}(t);return 0===i&&((e=t.state).window_size=2*e.w_size,V(e.head),e.max_lazy_match=st[e.level].max_lazy,e.good_match=st[e.level].good_length,e.nice_match=st[e.level].nice_length,e.max_chain_length=st[e.level].max_chain,e.strstart=0,e.block_start=0,e.lookahead=0,e.insert=0,e.match_length=e.prev_length=2,e.match_available=0,e.ins_h=0),i},_t=function(t,e){var a,n;if(!t||!t.state||e>5||e<0)return t?Q(t,G):G;var r=t.state;if(!t.output||!t.input&&0!==t.avail_in||r.status===P&&4!==e)return Q(t,0===t.avail_out?-5:G);r.strm=t;var i=r.last_flush;if(r.last_flush=e,42===r.status)if(2===r.wrap)t.adler=0,Z(r,31),Z(r,139),Z(r,8),r.gzhead?(Z(r,(r.gzhead.text?1:0)+(r.gzhead.hcrc?2:0)+(r.gzhead.extra?4:0)+(r.gzhead.name?8:0)+(r.gzhead.comment?16:0)),Z(r,255&r.gzhead.time),Z(r,r.gzhead.time>>8&255),Z(r,r.gzhead.time>>16&255),Z(r,r.gzhead.time>>24&255),Z(r,9===r.level?2:r.strategy>=2||r.level<2?4:0),Z(r,255&r.gzhead.os),r.gzhead.extra&&r.gzhead.extra.length&&(Z(r,255&r.gzhead.extra.length),Z(r,r.gzhead.extra.length>>8&255)),r.gzhead.hcrc&&(t.adler=T(t.adler,r.pending_buf,r.pending,0)),r.gzindex=0,r.status=69):(Z(r,0),Z(r,0),Z(r,0),Z(r,0),Z(r,0),Z(r,9===r.level?2:r.strategy>=2||r.level<2?4:0),Z(r,3),r.status=N);else{var h=8+(r.w_bits-8<<4)<<8;h|=(r.strategy>=2||r.level<2?0:r.level<6?1:6===r.level?2:3)<<6,0!==r.strstart&&(h|=32),h+=31-h%31,r.status=N,$(r,h),0!==r.strstart&&($(r,t.adler>>>16),$(r,65535&t.adler)),t.adler=1}if(69===r.status)if(r.gzhead.extra){for(a=r.pending;r.gzindex<(65535&r.gzhead.extra.length)&&(r.pending!==r.pending_buf_size||(r.gzhead.hcrc&&r.pending>a&&(t.adler=T(t.adler,r.pending_buf,r.pending-a,a)),X(t),a=r.pending,r.pending!==r.pending_buf_size));)Z(r,255&r.gzhead.extra[r.gzindex]),r.gzindex++;r.gzhead.hcrc&&r.pending>a&&(t.adler=T(t.adler,r.pending_buf,r.pending-a,a)),r.gzindex===r.gzhead.extra.length&&(r.gzindex=0,r.status=73)}else r.status=73;if(73===r.status)if(r.gzhead.name){a=r.pending;do{if(r.pending===r.pending_buf_size&&(r.gzhead.hcrc&&r.pending>a&&(t.adler=T(t.adler,r.pending_buf,r.pending-a,a)),X(t),a=r.pending,r.pending===r.pending_buf_size)){n=1;break}n=r.gzindex<r.gzhead.name.length?255&r.gzhead.name.charCodeAt(r.gzindex++):0,Z(r,n)}while(0!==n);r.gzhead.hcrc&&r.pending>a&&(t.adler=T(t.adler,r.pending_buf,r.pending-a,a)),0===n&&(r.gzindex=0,r.status=91)}else r.status=91;if(91===r.status)if(r.gzhead.comment){a=r.pending;do{if(r.pending===r.pending_buf_size&&(r.gzhead.hcrc&&r.pending>a&&(t.adler=T(t.adler,r.pending_buf,r.pending-a,a)),X(t),a=r.pending,r.pending===r.pending_buf_size)){n=1;break}n=r.gzindex<r.gzhead.comment.length?255&r.gzhead.comment.charCodeAt(r.gzindex++):0,Z(r,n)}while(0!==n);r.gzhead.hcrc&&r.pending>a&&(t.adler=T(t.adler,r.pending_buf,r.pending-a,a)),0===n&&(r.status=K)}else r.status=K;if(r.status===K&&(r.gzhead.hcrc?(r.pending+2>r.pending_buf_size&&X(t),r.pending+2<=r.pending_buf_size&&(Z(r,255&t.adler),Z(r,t.adler>>8&255),t.adler=0,r.status=N)):r.status=N),0!==r.pending){if(X(t),0===t.avail_out)return r.last_flush=-1,0}else if(0===t.avail_in&&R(e)<=R(i)&&4!==e)return Q(t,-5);if(r.status===P&&0!==t.avail_in)return Q(t,-5);if(0!==t.avail_in||0!==r.lookahead||0!==e&&r.status!==P){var l=2===r.strategy?function(t,e){for(var a;;){if(0===t.lookahead&&(at(t),0===t.lookahead)){if(0===e)return 1;break}if(t.match_length=0,a=F(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++,a&&(Y(t,!1),0===t.strm.avail_out))return 1}return t.insert=0,4===e?(Y(t,!0),0===t.strm.avail_out?3:4):t.last_lit&&(Y(t,!1),0===t.strm.avail_out)?1:2}(r,e):3===r.strategy?function(t,e){for(var a,n,r,i,s=t.window;;){if(t.lookahead<=H){if(at(t),t.lookahead<=H&&0===e)return 1;if(0===t.lookahead)break}if(t.match_length=0,t.lookahead>=3&&t.strstart>0&&(n=s[r=t.strstart-1])===s[++r]&&n===s[++r]&&n===s[++r]){i=t.strstart+H;do{}while(n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&r<i);t.match_length=H-(i-r),t.match_length>t.lookahead&&(t.match_length=t.lookahead)}if(t.match_length>=3?(a=F(t,1,t.match_length-3),t.lookahead-=t.match_length,t.strstart+=t.match_length,t.match_length=0):(a=F(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++),a&&(Y(t,!1),0===t.strm.avail_out))return 1}return t.insert=0,4===e?(Y(t,!0),0===t.strm.avail_out?3:4):t.last_lit&&(Y(t,!1),0===t.strm.avail_out)?1:2}(r,e):st[r.level].func(r,e);if(3!==l&&4!==l||(r.status=P),1===l||3===l)return 0===t.avail_out&&(r.last_flush=-1),0;if(2===l&&(1===e?function(t){m(t,2,3),b(t,256,s),function(t){16===t.bi_valid?(w(t,t.bi_buf),t.bi_buf=0,t.bi_valid=0):t.bi_valid>=8&&(t.pending_buf[t.pending++]=255&t.bi_buf,t.bi_buf>>=8,t.bi_valid-=8)}(t)}(r):5!==e&&(q(r,0,0,!1),3===e&&(V(r.head),0===r.lookahead&&(r.strstart=0,r.block_start=0,r.insert=0))),X(t),0===t.avail_out))return r.last_flush=-1,0}return 4!==e?0:r.wrap<=0?1:(2===r.wrap?(Z(r,255&t.adler),Z(r,t.adler>>8&255),Z(r,t.adler>>16&255),Z(r,t.adler>>24&255),Z(r,255&t.total_in),Z(r,t.total_in>>8&255),Z(r,t.total_in>>16&255),Z(r,t.total_in>>24&255)):($(r,t.adler>>>16),$(r,65535&t.adler)),X(t),r.wrap>0&&(r.wrap=-r.wrap),0!==r.pending?0:1)},ot=function(t){if(!t||!t.state)return G;var e=t.state.status;return 42!==e&&69!==e&&73!==e&&91!==e&&e!==K&&e!==N&&e!==P?Q(t,G):(t.state=null,e===N?Q(t,-3):0)},dt=new Uint8Array(256),ut=0;ut<256;ut++)dt[ut]=ut>=252?6:ut>=248?5:ut>=240?4:ut>=224?3:ut>=192?2:1;dt[254]=dt[254]=1;var ft=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg=\"\",this.state=null,this.data_type=2,this.adler=0},ct=Object.prototype.toString;function pt(){this.options={level:-1,method:8,chunkSize:16384,windowBits:15,memLevel:8,strategy:0};var t=this.options;t.raw&&t.windowBits>0?t.windowBits=-t.windowBits:t.gzip&&t.windowBits>0&&t.windowBits<16&&(t.windowBits+=16),this.err=0,this.msg=\"\",this.ended=!1,this.chunks=[],this.strm=new ft,this.strm.avail_out=0;var e,a,n=function(t,e,a,n,r,i){if(!t)return G;var s=1;if(-1===e&&(e=6),n<0?(s=0,n=-n):n>15&&(s=2,n-=16),r<1||r>9||8!==a||n<8||n>15||e<0||e>9||i<0||i>4)return Q(t,G);8===n&&(n=9);var h=new ht;return t.state=h,h.strm=t,h.wrap=s,h.gzhead=null,h.w_bits=n,h.w_size=1<<h.w_bits,h.w_mask=h.w_size-1,h.hash_bits=r+7,h.hash_size=1<<h.hash_bits,h.hash_mask=h.hash_size-1,h.hash_shift=~~((h.hash_bits+3-1)/3),h.window=new Uint8Array(2*h.w_size),h.head=new Uint16Array(h.hash_size),h.prev=new Uint16Array(h.w_size),h.lit_bufsize=1<<r+6,h.pending_buf_size=4*h.lit_bufsize,h.pending_buf=new Uint8Array(h.pending_buf_size),h.d_buf=1*h.lit_bufsize,h.l_buf=3*h.lit_bufsize,h.level=e,h.strategy=i,h.method=a,lt(t)}(this.strm,t.level,t.method,t.windowBits,t.memLevel,t.strategy);if(0!==n)throw Error(O[n]);if(t.header&&(e=this.strm,a=t.header,e&&e.state&&(2!==e.state.wrap||(e.state.gzhead=a))),t.dictionary){var r;if(r=\"[object ArrayBuffer]\"===ct.call(t.dictionary)?new Uint8Array(t.dictionary):t.dictionary,0!==(n=function(t,e){var a=e.length;if(!t||!t.state)return G;var n=t.state,r=n.wrap;if(2===r||1===r&&42!==n.status||n.lookahead)return G;if(1===r&&(t.adler=L(t.adler,e,a,0)),n.wrap=0,a>=n.w_size){0===r&&(V(n.head),n.strstart=0,n.block_start=0,n.insert=0);var i=new Uint8Array(n.w_size);i.set(e.subarray(a-n.w_size,a),0),e=i,a=n.w_size}var s=t.avail_in,h=t.next_in,l=t.input;for(t.avail_in=a,t.next_in=0,t.input=e,at(n);n.lookahead>=3;){var _=n.strstart,o=n.lookahead-2;do{n.ins_h=W(n,n.ins_h,n.window[_+3-1]),n.prev[_&n.w_mask]=n.head[n.ins_h],n.head[n.ins_h]=_,_++}while(--o);n.strstart=_,n.lookahead=2,at(n)}return n.strstart+=n.lookahead,n.block_start=n.strstart,n.insert=n.lookahead,n.lookahead=0,n.match_length=n.prev_length=2,n.match_available=0,t.next_in=h,t.input=l,t.avail_in=s,n.wrap=r,0}(this.strm,r)))throw Error(O[n]);this._dict_set=!0}}function gt(t,e,a){try{t.postMessage({type:\"errored\",error:e,streamId:a})}catch(n){t.postMessage({type:\"errored\",error:e+\"\",streamId:a})}}function vt(t){const e=t.strm.adler;return new Uint8Array([3,0,e>>>24&255,e>>>16&255,e>>>8&255,255&e])}pt.prototype.push=function(t,e){var a,n,r=this.strm,i=this.options.chunkSize;if(this.ended)return!1;for(n=e===~~e?e:!0===e?4:0,\"[object ArrayBuffer]\"===ct.call(t)?r.input=new Uint8Array(t):r.input=t,r.next_in=0,r.avail_in=r.input.length;;)if(0===r.avail_out&&(r.output=new Uint8Array(i),r.next_out=0,r.avail_out=i),(2===n||3===n)&&r.avail_out<=6)this.onData(r.output.subarray(0,r.next_out)),r.avail_out=0;else{if(1===(a=_t(r,n)))return r.next_out>0&&this.onData(r.output.subarray(0,r.next_out)),a=ot(this.strm),this.onEnd(a),this.ended=!0,0===a;if(0!==r.avail_out){if(n>0&&r.next_out>0)this.onData(r.output.subarray(0,r.next_out)),r.avail_out=0;else if(0===r.avail_in)break}else this.onData(r.output)}return!0},pt.prototype.onData=function(t){this.chunks.push(t)},pt.prototype.onEnd=function(t){0===t&&(this.result=function(t){for(var e=0,a=0,n=t.length;a<n;a++)e+=t[a].length;for(var r=new Uint8Array(e),i=0,s=0,h=t.length;i<h;i++){var l=t[i];r.set(l,s),s+=l.length}return r}(this.chunks)),this.chunks=[],this.err=t,this.msg=this.strm.msg},function(e=self){try{const a=new Map;e.addEventListener(\"message\",n=>{try{const r=function(e,a){switch(a.action){case\"init\":return{type:\"initialized\",version:\"6.27.1\"};case\"write\":{let n=e.get(a.streamId);n||(n=new pt,e.set(a.streamId,n));const r=n.chunks.length,i=function(t){if(\"function\"==typeof TextEncoder&&TextEncoder.prototype.encode)return(new TextEncoder).encode(t);let e,a,n,r,i,s=t.length,h=0;for(r=0;r<s;r++)a=t.charCodeAt(r),55296==(64512&a)&&r+1<s&&(n=t.charCodeAt(r+1),56320==(64512&n)&&(a=65536+(a-55296<<10)+(n-56320),r++)),h+=a<128?1:a<2048?2:a<65536?3:4;for(e=new Uint8Array(h),i=0,r=0;i<h;r++)a=t.charCodeAt(r),55296==(64512&a)&&r+1<s&&(n=t.charCodeAt(r+1),56320==(64512&n)&&(a=65536+(a-55296<<10)+(n-56320),r++)),a<128?e[i++]=a:a<2048?(e[i++]=192|a>>>6,e[i++]=128|63&a):a<65536?(e[i++]=224|a>>>12,e[i++]=128|a>>>6&63,e[i++]=128|63&a):(e[i++]=240|a>>>18,e[i++]=128|a>>>12&63,e[i++]=128|a>>>6&63,e[i++]=128|63&a);return e}(a.data);return n.push(i,2),{type:\"wrote\",id:a.id,streamId:a.streamId,result:t(n.chunks.slice(r)),trailer:vt(n),additionalBytesCount:i.length}}case\"reset\":e.delete(a.streamId)}}(a,n.data);r&&e.postMessage(r)}catch(t){gt(e,t,n.data&&\"streamId\"in n.data?n.data.streamId:void 0)}})}catch(t){gt(e,t)}}()})();"])));
}
let state = { status: 0 /* DeflateWorkerStatus.Nil */ };
function startDeflateWorker(configuration, source, onInitializationFailure, createDeflateWorkerImpl = createDeflateWorker) {
    if (state.status === 0 /* DeflateWorkerStatus.Nil */) {
        // doStartDeflateWorker updates the state to "loading" or "error"
        doStartDeflateWorker(configuration, source, createDeflateWorkerImpl);
    }
    switch (state.status) {
        case 1 /* DeflateWorkerStatus.Loading */:
            state.initializationFailureCallbacks.push(onInitializationFailure);
            return state.worker;
        case 3 /* DeflateWorkerStatus.Initialized */:
            return state.worker;
    }
}
function getDeflateWorkerStatus() {
    return state.status;
}
/**
 * Starts the deflate worker and handle messages and errors
 *
 * The spec allow browsers to handle worker errors differently:
 * - Chromium throws an exception
 * - Firefox fires an error event
 *
 * more details: https://bugzilla.mozilla.org/show_bug.cgi?id=1736865#c2
 */
function doStartDeflateWorker(configuration, source, createDeflateWorkerImpl = createDeflateWorker) {
    try {
        const worker = createDeflateWorkerImpl(configuration);
        const { stop: removeErrorListener } = addEventListener(configuration, worker, 'error', (error) => {
            onError(configuration, source, error);
        });
        const { stop: removeMessageListener } = addEventListener(configuration, worker, 'message', ({ data }) => {
            if (data.type === 'errored') {
                onError(configuration, source, data.error, data.streamId);
            }
            else if (data.type === 'initialized') {
                onInitialized(data.version);
            }
        });
        worker.postMessage({ action: 'init' });
        setTimeout$1(() => onTimeout(source), INITIALIZATION_TIME_OUT_DELAY);
        const stop = () => {
            removeErrorListener();
            removeMessageListener();
        };
        state = { status: 1 /* DeflateWorkerStatus.Loading */, worker, stop, initializationFailureCallbacks: [] };
    }
    catch (error) {
        onError(configuration, source, error);
    }
}
function onTimeout(source) {
    if (state.status === 1 /* DeflateWorkerStatus.Loading */) {
        display.error(`${source} failed to start: a timeout occurred while initializing the Worker`);
        state.initializationFailureCallbacks.forEach((callback) => callback());
        state = { status: 2 /* DeflateWorkerStatus.Error */ };
    }
}
function onInitialized(version) {
    if (state.status === 1 /* DeflateWorkerStatus.Loading */) {
        state = { status: 3 /* DeflateWorkerStatus.Initialized */, worker: state.worker, stop: state.stop, version };
    }
}
function onError(configuration, source, error, streamId) {
    if (state.status === 1 /* DeflateWorkerStatus.Loading */ || state.status === 0 /* DeflateWorkerStatus.Nil */) {
        reportScriptLoadingError({
            configuredUrl: configuration.workerUrl,
            error,
            source,
            scriptType: 'worker',
        });
        if (state.status === 1 /* DeflateWorkerStatus.Loading */) {
            state.initializationFailureCallbacks.forEach((callback) => callback());
        }
        state = { status: 2 /* DeflateWorkerStatus.Error */ };
    }
    else {
        addTelemetryError(error, {
            worker_version: state.status === 3 /* DeflateWorkerStatus.Initialized */ && state.version,
            stream_id: streamId,
        });
    }
}

/**
 * Test for Browser features used while recording
 */
function isBrowserSupported() {
    return (
    // Array.from is a bit less supported by browsers than CSSSupportsRule, but has higher chances
    // to be polyfilled. Test for both to be more confident. We could add more things if we find out
    // this test is not sufficient.
    typeof Array.from === 'function' &&
        typeof CSSSupportsRule === 'function' &&
        typeof URL.createObjectURL === 'function' &&
        'forEach' in NodeList.prototype);
}

function getSessionReplayLink(configuration, sessionManager, viewHistory, isRecordingStarted) {
    const session = sessionManager.findTrackedSession();
    const errorType = getErrorType(session, isRecordingStarted);
    const viewContext = viewHistory.findView();
    return getSessionReplayUrl(configuration, {
        viewContext,
        errorType,
        session,
    });
}
function getErrorType(session, isRecordingStarted) {
    if (!isBrowserSupported()) {
        return 'browser-not-supported';
    }
    if (!session) {
        // possibilities:
        // - rum sampled out
        // - session expired (edge case)
        return 'rum-not-tracked';
    }
    if (session.sessionReplay === 0 /* SessionReplayState.OFF */) {
        // possibilities
        // - replay sampled out
        return 'incorrect-session-plan';
    }
    if (!isRecordingStarted) {
        return 'replay-not-started';
    }
}

function startRecorderInitTelemetry(telemetry, observable) {
    if (!telemetry.metricsEnabled) {
        return { stop: noop };
    }
    let startContext;
    let documentReadyDuration;
    let recorderSettledDuration;
    const { unsubscribe } = observable.subscribe((event) => {
        switch (event.type) {
            case 'start':
                startContext = { forced: event.forced, timestamp: timeStampNow() };
                documentReadyDuration = undefined;
                recorderSettledDuration = undefined;
                break;
            case 'document-ready':
                if (startContext) {
                    documentReadyDuration = elapsed(startContext.timestamp, timeStampNow());
                }
                break;
            case 'recorder-settled':
                if (startContext) {
                    recorderSettledDuration = elapsed(startContext.timestamp, timeStampNow());
                }
                break;
            case 'aborted':
            case 'deflate-encoder-load-failed':
            case 'recorder-load-failed':
            case 'succeeded':
                // Only send metrics for the first attempt at starting the recorder.
                unsubscribe();
                if (startContext) {
                    // monitor-until: 2026-07-01
                    addTelemetryMetrics("Recorder init metrics" /* TelemetryMetrics.RECORDER_INIT_METRICS_TELEMETRY_NAME */, {
                        metrics: createRecorderInitMetrics(startContext.forced, recorderSettledDuration, elapsed(startContext.timestamp, timeStampNow()), event.type, documentReadyDuration),
                    });
                }
                break;
        }
    });
    return { stop: unsubscribe };
}
function createRecorderInitMetrics(forced, loadRecorderModuleDuration, recorderInitDuration, result, waitForDocReadyDuration) {
    return {
        forced,
        loadRecorderModuleDuration,
        recorderInitDuration,
        result,
        waitForDocReadyDuration,
    };
}

function createPostStartStrategy(configuration, lifeCycle, sessionManager, viewHistory, loadRecorder, getOrCreateDeflateEncoder, telemetry) {
    let status = 0 /* RecorderStatus.Stopped */;
    let stopRecording;
    lifeCycle.subscribe(9 /* LifeCycleEventType.SESSION_EXPIRED */, () => {
        if (status === 2 /* RecorderStatus.Starting */ || status === 3 /* RecorderStatus.Started */) {
            stop();
            status = 1 /* RecorderStatus.IntentToStart */;
        }
    });
    lifeCycle.subscribe(10 /* LifeCycleEventType.SESSION_RENEWED */, () => {
        if (status === 1 /* RecorderStatus.IntentToStart */) {
            start();
        }
    });
    const observable = new Observable();
    startRecorderInitTelemetry(telemetry, observable);
    const doStart = async (forced) => {
        observable.notify({ type: 'start', forced });
        const [startRecordingImpl] = await Promise.all([
            notifyWhenSettled(observable, { type: 'recorder-settled' }, loadRecorder()),
            notifyWhenSettled(observable, { type: 'document-ready' }, asyncRunOnReadyState(configuration, 'interactive')),
        ]);
        if (status !== 2 /* RecorderStatus.Starting */) {
            observable.notify({ type: 'aborted' });
            return;
        }
        if (!startRecordingImpl) {
            status = 0 /* RecorderStatus.Stopped */;
            observable.notify({ type: 'recorder-load-failed' });
            return;
        }
        const deflateEncoder = getOrCreateDeflateEncoder();
        if (!deflateEncoder) {
            status = 0 /* RecorderStatus.Stopped */;
            observable.notify({ type: 'deflate-encoder-load-failed' });
            return;
        }
        ({ stop: stopRecording } = startRecordingImpl(lifeCycle, configuration, sessionManager, viewHistory, deflateEncoder, telemetry));
        status = 3 /* RecorderStatus.Started */;
        observable.notify({ type: 'succeeded' });
    };
    function start(options) {
        const session = sessionManager.findTrackedSession();
        if (canStartRecording(session, options)) {
            status = 1 /* RecorderStatus.IntentToStart */;
            return;
        }
        if (isRecordingInProgress(status)) {
            return;
        }
        status = 2 /* RecorderStatus.Starting */;
        const forced = shouldForceReplay(session, options) || false;
        // Intentionally not awaiting doStart() to keep it asynchronous
        doStart(forced).catch(monitorError);
        if (forced) {
            sessionManager.setForcedReplay();
        }
    }
    function stop() {
        if (status === 3 /* RecorderStatus.Started */) {
            stopRecording === null || stopRecording === void 0 ? void 0 : stopRecording();
        }
        status = 0 /* RecorderStatus.Stopped */;
    }
    return {
        start,
        stop,
        getSessionReplayLink() {
            return getSessionReplayLink(configuration, sessionManager, viewHistory, status !== 0 /* RecorderStatus.Stopped */);
        },
        isRecording: () => status === 3 /* RecorderStatus.Started */,
    };
}
function canStartRecording(session, options) {
    return !session || (session.sessionReplay === 0 /* SessionReplayState.OFF */ && (!options || !options.force));
}
function isRecordingInProgress(status) {
    return status === 2 /* RecorderStatus.Starting */ || status === 3 /* RecorderStatus.Started */;
}
function shouldForceReplay(session, options) {
    return options && options.force && session.sessionReplay === 0 /* SessionReplayState.OFF */;
}
async function notifyWhenSettled(observable, event, promise) {
    try {
        return await promise;
    }
    finally {
        observable.notify(event);
    }
}

function createPreStartStrategy() {
    let status = 0 /* PreStartRecorderStatus.None */;
    return {
        strategy: {
            start() {
                status = 1 /* PreStartRecorderStatus.HadManualStart */;
            },
            stop() {
                status = 2 /* PreStartRecorderStatus.HadManualStop */;
            },
            isRecording: () => false,
            getSessionReplayLink: noop,
        },
        shouldStartImmediately(configuration) {
            return (status === 1 /* PreStartRecorderStatus.HadManualStart */ ||
                (status === 0 /* PreStartRecorderStatus.None */ && !configuration.startSessionReplayRecordingManually));
        },
    };
}

function makeRecorderApi(loadRecorder, createDeflateWorkerImpl) {
    if ((canUseEventBridge() && !bridgeSupports("records" /* BridgeCapability.RECORDS */)) || !isBrowserSupported()) {
        return {
            start: noop,
            stop: noop,
            getReplayStats: () => undefined,
            onRumStart: noop,
            isRecording: () => false,
            getSessionReplayLink: () => undefined,
        };
    }
    // eslint-disable-next-line prefer-const
    let { strategy, shouldStartImmediately } = createPreStartStrategy();
    return {
        start: (options) => strategy.start(options),
        stop: () => strategy.stop(),
        getSessionReplayLink: () => strategy.getSessionReplayLink(),
        onRumStart,
        isRecording: () => 
        // The worker is started optimistically, meaning we could have started to record but its
        // initialization fails a bit later. This could happen when:
        // * the worker URL (blob or plain URL) is blocked by CSP in Firefox only (Chromium and Safari
        // throw an exception when instantiating the worker, and IE doesn't care about CSP)
        // * the browser fails to load the worker in case the workerUrl is used
        // * an unexpected error occurs in the Worker before initialization, ex:
        //   * a runtime exception collected by monitor()
        //   * a syntax error notified by the browser via an error event
        // * the worker is unresponsive for some reason and timeouts
        //
        // It is not expected to happen often. Nonetheless, the "replayable" status on RUM events is
        // an important part of the Datadog App:
        // * If we have a false positive (we set has_replay: true even if no replay data is present),
        // we might display broken links to the Session Replay player.
        // * If we have a false negative (we don't set has_replay: true even if replay data is
        // available), it is less noticeable because no link will be displayed.
        //
        // Thus, it is better to have false negative, so let's make sure the worker is correctly
        // initialized before advertizing that we are recording.
        //
        // In the future, when the compression worker will also be used for RUM data, this will be
        // less important since no RUM event will be sent when the worker fails to initialize.
        getDeflateWorkerStatus() === 3 /* DeflateWorkerStatus.Initialized */ && strategy.isRecording(),
        getReplayStats: (viewId) => getDeflateWorkerStatus() === 3 /* DeflateWorkerStatus.Initialized */ ? getReplayStats(viewId) : undefined,
    };
    function onRumStart(lifeCycle, configuration, sessionManager, viewHistory, worker, telemetry) {
        let cachedDeflateEncoder;
        function getOrCreateDeflateEncoder() {
            if (!cachedDeflateEncoder) {
                worker !== null && worker !== void 0 ? worker : (worker = startDeflateWorker(configuration, 'Datadog Session Replay', () => {
                    strategy.stop();
                }, createDeflateWorkerImpl));
                if (worker) {
                    cachedDeflateEncoder = createDeflateEncoder(configuration, worker, 1 /* DeflateEncoderStreamId.REPLAY */);
                }
            }
            return cachedDeflateEncoder;
        }
        strategy = createPostStartStrategy(configuration, lifeCycle, sessionManager, viewHistory, loadRecorder, getOrCreateDeflateEncoder, telemetry);
        if (shouldStartImmediately(configuration)) {
            strategy.start();
        }
    }
}

async function lazyLoadRecorder(importRecorderImpl = importRecorder) {
    try {
        return await importRecorderImpl();
    }
    catch (error) {
        reportScriptLoadingError({
            error,
            source: 'Recorder',
            scriptType: 'module',
        });
    }
}
async function importRecorder() {
    const module = await __vitePreload(() => import(/* webpackChunkName: "recorder" */ './startRecording-JOwxxyuV.js'),true              ?[]:void 0);
    return module.startRecording;
}

function isProfilingSupported() {
    const globalThis = getGlobalObject();
    // This API might be unavailable in some browsers
    const globalThisProfiler = globalThis.Profiler;
    return globalThisProfiler !== undefined;
}

function startProfilingContext(hooks) {
    let currentContext = {
        status: 'starting',
    };
    hooks.register(0 /* HookNames.Assemble */, ({ eventType }) => {
        if (eventType !== RumEventType.VIEW && eventType !== RumEventType.LONG_TASK) {
            return SKIPPED;
        }
        return {
            type: eventType,
            _dd: {
                profiling: currentContext,
            },
        };
    });
    return {
        get: () => currentContext,
        set: (newContext) => {
            currentContext = newContext;
        },
    };
}

async function lazyLoadProfiler(importProfilerImpl = importProfiler) {
    try {
        return await importProfilerImpl();
    }
    catch (error) {
        reportScriptLoadingError({
            error,
            source: 'Profiler',
            scriptType: 'module',
        });
    }
}
async function importProfiler() {
    const module = await __vitePreload(() => import(/* webpackChunkName: "profiler" */ './profiler-f5u3YQDq.js'),true              ?[]:void 0);
    return module.createRumProfiler;
}

function makeProfilerApi() {
    let profiler;
    function onRumStart(lifeCycle, hooks, configuration, sessionManager, viewHistory, longTaskContexts, createEncoder) {
        const session = sessionManager.findTrackedSession(); // Check if the session is tracked.
        if (!session) {
            // No session tracked, no profiling.
            // Note: No Profiling context is set at this stage.
            return;
        }
        // Sampling (sticky sampling based on session id)
        if (!isSampled(session.id, configuration.profilingSampleRate)) {
            // No sampling, no profiling.
            // Note: No Profiling context is set at this stage.
            return;
        }
        // Listen to events and add the profiling context to them.
        const profilingContextManager = startProfilingContext(hooks);
        // Browser support check
        if (!isProfilingSupported()) {
            profilingContextManager.set({
                status: 'error',
                error_reason: 'not-supported-by-browser',
            });
            return;
        }
        lazyLoadProfiler()
            .then((createRumProfiler) => {
            if (!createRumProfiler) {
                profilingContextManager.set({ status: 'error', error_reason: 'failed-to-lazy-load' });
                return;
            }
            profiler = createRumProfiler(configuration, lifeCycle, sessionManager, profilingContextManager, longTaskContexts, createEncoder, viewHistory, undefined);
            profiler.start();
        })
            .catch(monitorError);
    }
    return {
        onRumStart,
        stop: () => {
            profiler === null || profiler === void 0 ? void 0 : profiler.stop();
        },
    };
}

/**
 * Datadog Browser RUM SDK - Full version with Session Replay and Real User Profiling capabilities.
 * Use this package to monitor your web application's performance and user experience.
 *
 * @packageDocumentation
 * @see [RUM Browser Monitoring Setup](https://docs.datadoghq.com/real_user_monitoring/browser/)
 */
// Keep the following in sync with packages/rum-slim/src/entries/main.ts
const recorderApi = makeRecorderApi(lazyLoadRecorder);
const profilerApi = makeProfilerApi();
/**
 * The global RUM instance. Use this to call RUM methods.
 *
 * @category Main
 * @see {@link DatadogRum}
 * @see [RUM Browser Monitoring Setup](https://docs.datadoghq.com/real_user_monitoring/browser/)
 */
const datadogRum = makeRumPublicApi(startRum, recorderApi, profilerApi, {
    startDeflateWorker,
    createDeflateEncoder,
    sdkName: 'rum',
});
defineGlobal(getGlobalObject(), 'DD_RUM', datadogRum);

// dev uses dynamic import to separate chunks
    
    const {loadShare} = index_cjs;
    const {initPromise} = host__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(_ => loadShare("react-router-dom", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^6.30.3"
    }}}));
    const exportModule = await res.then(factory => factory());
    var host__loadShare__react_mf_2_router_mf_2_dom__loadShare__ = exportModule;

var sha256$1 = {exports: {}};

const __viteBrowserExternal = {};

const __viteBrowserExternal$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: __viteBrowserExternal
}, Symbol.toStringTag, { value: 'Module' }));

const require$$1 = /*@__PURE__*/getAugmentedNamespace(__viteBrowserExternal$1);

/**
 * [js-sha256]{@link https://github.com/emn178/js-sha256}
 *
 * @version 0.11.1
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2025
 * @license MIT
 */

(function (module) {
	/*jslint bitwise: true */
	(function () {

	  var ERROR = 'input is invalid type';
	  var WINDOW = typeof window === 'object';
	  var root = WINDOW ? window : {};
	  if (root.JS_SHA256_NO_WINDOW) {
	    WINDOW = false;
	  }
	  var WEB_WORKER = !WINDOW && typeof self === 'object';
	  var NODE_JS = !root.JS_SHA256_NO_NODE_JS && typeof process === 'object' && process.versions && process.versions.node && process.type != 'renderer';
	  if (NODE_JS) {
	    root = commonjsGlobal;
	  } else if (WEB_WORKER) {
	    root = self;
	  }
	  var COMMON_JS = !root.JS_SHA256_NO_COMMON_JS && 'object' === 'object' && module.exports;
	  var ARRAY_BUFFER = !root.JS_SHA256_NO_ARRAY_BUFFER && typeof ArrayBuffer !== 'undefined';
	  var HEX_CHARS = '0123456789abcdef'.split('');
	  var EXTRA = [-2147483648, 8388608, 32768, 128];
	  var SHIFT = [24, 16, 8, 0];
	  var K = [
	    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
	    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
	    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
	    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
	    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
	    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
	    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
	    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
	  ];
	  var OUTPUT_TYPES = ['hex', 'array', 'digest', 'arrayBuffer'];

	  var blocks = [];

	  if (root.JS_SHA256_NO_NODE_JS || !Array.isArray) {
	    Array.isArray = function (obj) {
	      return Object.prototype.toString.call(obj) === '[object Array]';
	    };
	  }

	  if (ARRAY_BUFFER && (root.JS_SHA256_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
	    ArrayBuffer.isView = function (obj) {
	      return typeof obj === 'object' && obj.buffer && obj.buffer.constructor === ArrayBuffer;
	    };
	  }

	  var createOutputMethod = function (outputType, is224) {
	    return function (message) {
	      return new Sha256(is224, true).update(message)[outputType]();
	    };
	  };

	  var createMethod = function (is224) {
	    var method = createOutputMethod('hex', is224);
	    if (NODE_JS) {
	      method = nodeWrap(method, is224);
	    }
	    method.create = function () {
	      return new Sha256(is224);
	    };
	    method.update = function (message) {
	      return method.create().update(message);
	    };
	    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
	      var type = OUTPUT_TYPES[i];
	      method[type] = createOutputMethod(type, is224);
	    }
	    return method;
	  };

	  var nodeWrap = function (method, is224) {
	    var crypto = require$$1;
	    var Buffer = require$$1.Buffer;
	    var algorithm = is224 ? 'sha224' : 'sha256';
	    var bufferFrom;
	    if (Buffer.from && !root.JS_SHA256_NO_BUFFER_FROM) {
	      bufferFrom = Buffer.from;
	    } else {
	      bufferFrom = function (message) {
	        return new Buffer(message);
	      };
	    }
	    var nodeMethod = function (message) {
	      if (typeof message === 'string') {
	        return crypto.createHash(algorithm).update(message, 'utf8').digest('hex');
	      } else {
	        if (message === null || message === undefined) {
	          throw new Error(ERROR);
	        } else if (message.constructor === ArrayBuffer) {
	          message = new Uint8Array(message);
	        }
	      }
	      if (Array.isArray(message) || ArrayBuffer.isView(message) ||
	        message.constructor === Buffer) {
	        return crypto.createHash(algorithm).update(bufferFrom(message)).digest('hex');
	      } else {
	        return method(message);
	      }
	    };
	    return nodeMethod;
	  };

	  var createHmacOutputMethod = function (outputType, is224) {
	    return function (key, message) {
	      return new HmacSha256(key, is224, true).update(message)[outputType]();
	    };
	  };

	  var createHmacMethod = function (is224) {
	    var method = createHmacOutputMethod('hex', is224);
	    method.create = function (key) {
	      return new HmacSha256(key, is224);
	    };
	    method.update = function (key, message) {
	      return method.create(key).update(message);
	    };
	    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
	      var type = OUTPUT_TYPES[i];
	      method[type] = createHmacOutputMethod(type, is224);
	    }
	    return method;
	  };

	  function Sha256(is224, sharedMemory) {
	    if (sharedMemory) {
	      blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] =
	        blocks[4] = blocks[5] = blocks[6] = blocks[7] =
	        blocks[8] = blocks[9] = blocks[10] = blocks[11] =
	        blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
	      this.blocks = blocks;
	    } else {
	      this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	    }

	    if (is224) {
	      this.h0 = 0xc1059ed8;
	      this.h1 = 0x367cd507;
	      this.h2 = 0x3070dd17;
	      this.h3 = 0xf70e5939;
	      this.h4 = 0xffc00b31;
	      this.h5 = 0x68581511;
	      this.h6 = 0x64f98fa7;
	      this.h7 = 0xbefa4fa4;
	    } else { // 256
	      this.h0 = 0x6a09e667;
	      this.h1 = 0xbb67ae85;
	      this.h2 = 0x3c6ef372;
	      this.h3 = 0xa54ff53a;
	      this.h4 = 0x510e527f;
	      this.h5 = 0x9b05688c;
	      this.h6 = 0x1f83d9ab;
	      this.h7 = 0x5be0cd19;
	    }

	    this.block = this.start = this.bytes = this.hBytes = 0;
	    this.finalized = this.hashed = false;
	    this.first = true;
	    this.is224 = is224;
	  }

	  Sha256.prototype.update = function (message) {
	    if (this.finalized) {
	      return;
	    }
	    var notString, type = typeof message;
	    if (type !== 'string') {
	      if (type === 'object') {
	        if (message === null) {
	          throw new Error(ERROR);
	        } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
	          message = new Uint8Array(message);
	        } else if (!Array.isArray(message)) {
	          if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
	            throw new Error(ERROR);
	          }
	        }
	      } else {
	        throw new Error(ERROR);
	      }
	      notString = true;
	    }
	    var code, index = 0, i, length = message.length, blocks = this.blocks;
	    while (index < length) {
	      if (this.hashed) {
	        this.hashed = false;
	        blocks[0] = this.block;
	        this.block = blocks[16] = blocks[1] = blocks[2] = blocks[3] =
	          blocks[4] = blocks[5] = blocks[6] = blocks[7] =
	          blocks[8] = blocks[9] = blocks[10] = blocks[11] =
	          blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
	      }

	      if (notString) {
	        for (i = this.start; index < length && i < 64; ++index) {
	          blocks[i >>> 2] |= message[index] << SHIFT[i++ & 3];
	        }
	      } else {
	        for (i = this.start; index < length && i < 64; ++index) {
	          code = message.charCodeAt(index);
	          if (code < 0x80) {
	            blocks[i >>> 2] |= code << SHIFT[i++ & 3];
	          } else if (code < 0x800) {
	            blocks[i >>> 2] |= (0xc0 | (code >>> 6)) << SHIFT[i++ & 3];
	            blocks[i >>> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
	          } else if (code < 0xd800 || code >= 0xe000) {
	            blocks[i >>> 2] |= (0xe0 | (code >>> 12)) << SHIFT[i++ & 3];
	            blocks[i >>> 2] |= (0x80 | ((code >>> 6) & 0x3f)) << SHIFT[i++ & 3];
	            blocks[i >>> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
	          } else {
	            code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
	            blocks[i >>> 2] |= (0xf0 | (code >>> 18)) << SHIFT[i++ & 3];
	            blocks[i >>> 2] |= (0x80 | ((code >>> 12) & 0x3f)) << SHIFT[i++ & 3];
	            blocks[i >>> 2] |= (0x80 | ((code >>> 6) & 0x3f)) << SHIFT[i++ & 3];
	            blocks[i >>> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
	          }
	        }
	      }

	      this.lastByteIndex = i;
	      this.bytes += i - this.start;
	      if (i >= 64) {
	        this.block = blocks[16];
	        this.start = i - 64;
	        this.hash();
	        this.hashed = true;
	      } else {
	        this.start = i;
	      }
	    }
	    if (this.bytes > 4294967295) {
	      this.hBytes += this.bytes / 4294967296 << 0;
	      this.bytes = this.bytes % 4294967296;
	    }
	    return this;
	  };

	  Sha256.prototype.finalize = function () {
	    if (this.finalized) {
	      return;
	    }
	    this.finalized = true;
	    var blocks = this.blocks, i = this.lastByteIndex;
	    blocks[16] = this.block;
	    blocks[i >>> 2] |= EXTRA[i & 3];
	    this.block = blocks[16];
	    if (i >= 56) {
	      if (!this.hashed) {
	        this.hash();
	      }
	      blocks[0] = this.block;
	      blocks[16] = blocks[1] = blocks[2] = blocks[3] =
	        blocks[4] = blocks[5] = blocks[6] = blocks[7] =
	        blocks[8] = blocks[9] = blocks[10] = blocks[11] =
	        blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
	    }
	    blocks[14] = this.hBytes << 3 | this.bytes >>> 29;
	    blocks[15] = this.bytes << 3;
	    this.hash();
	  };

	  Sha256.prototype.hash = function () {
	    var a = this.h0, b = this.h1, c = this.h2, d = this.h3, e = this.h4, f = this.h5, g = this.h6,
	      h = this.h7, blocks = this.blocks, j, s0, s1, maj, t1, t2, ch, ab, da, cd, bc;

	    for (j = 16; j < 64; ++j) {
	      // rightrotate
	      t1 = blocks[j - 15];
	      s0 = ((t1 >>> 7) | (t1 << 25)) ^ ((t1 >>> 18) | (t1 << 14)) ^ (t1 >>> 3);
	      t1 = blocks[j - 2];
	      s1 = ((t1 >>> 17) | (t1 << 15)) ^ ((t1 >>> 19) | (t1 << 13)) ^ (t1 >>> 10);
	      blocks[j] = blocks[j - 16] + s0 + blocks[j - 7] + s1 << 0;
	    }

	    bc = b & c;
	    for (j = 0; j < 64; j += 4) {
	      if (this.first) {
	        if (this.is224) {
	          ab = 300032;
	          t1 = blocks[0] - 1413257819;
	          h = t1 - 150054599 << 0;
	          d = t1 + 24177077 << 0;
	        } else {
	          ab = 704751109;
	          t1 = blocks[0] - 210244248;
	          h = t1 - 1521486534 << 0;
	          d = t1 + 143694565 << 0;
	        }
	        this.first = false;
	      } else {
	        s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
	        s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
	        ab = a & b;
	        maj = ab ^ (a & c) ^ bc;
	        ch = (e & f) ^ (~e & g);
	        t1 = h + s1 + ch + K[j] + blocks[j];
	        t2 = s0 + maj;
	        h = d + t1 << 0;
	        d = t1 + t2 << 0;
	      }
	      s0 = ((d >>> 2) | (d << 30)) ^ ((d >>> 13) | (d << 19)) ^ ((d >>> 22) | (d << 10));
	      s1 = ((h >>> 6) | (h << 26)) ^ ((h >>> 11) | (h << 21)) ^ ((h >>> 25) | (h << 7));
	      da = d & a;
	      maj = da ^ (d & b) ^ ab;
	      ch = (h & e) ^ (~h & f);
	      t1 = g + s1 + ch + K[j + 1] + blocks[j + 1];
	      t2 = s0 + maj;
	      g = c + t1 << 0;
	      c = t1 + t2 << 0;
	      s0 = ((c >>> 2) | (c << 30)) ^ ((c >>> 13) | (c << 19)) ^ ((c >>> 22) | (c << 10));
	      s1 = ((g >>> 6) | (g << 26)) ^ ((g >>> 11) | (g << 21)) ^ ((g >>> 25) | (g << 7));
	      cd = c & d;
	      maj = cd ^ (c & a) ^ da;
	      ch = (g & h) ^ (~g & e);
	      t1 = f + s1 + ch + K[j + 2] + blocks[j + 2];
	      t2 = s0 + maj;
	      f = b + t1 << 0;
	      b = t1 + t2 << 0;
	      s0 = ((b >>> 2) | (b << 30)) ^ ((b >>> 13) | (b << 19)) ^ ((b >>> 22) | (b << 10));
	      s1 = ((f >>> 6) | (f << 26)) ^ ((f >>> 11) | (f << 21)) ^ ((f >>> 25) | (f << 7));
	      bc = b & c;
	      maj = bc ^ (b & d) ^ cd;
	      ch = (f & g) ^ (~f & h);
	      t1 = e + s1 + ch + K[j + 3] + blocks[j + 3];
	      t2 = s0 + maj;
	      e = a + t1 << 0;
	      a = t1 + t2 << 0;
	      this.chromeBugWorkAround = true;
	    }

	    this.h0 = this.h0 + a << 0;
	    this.h1 = this.h1 + b << 0;
	    this.h2 = this.h2 + c << 0;
	    this.h3 = this.h3 + d << 0;
	    this.h4 = this.h4 + e << 0;
	    this.h5 = this.h5 + f << 0;
	    this.h6 = this.h6 + g << 0;
	    this.h7 = this.h7 + h << 0;
	  };

	  Sha256.prototype.hex = function () {
	    this.finalize();

	    var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5,
	      h6 = this.h6, h7 = this.h7;

	    var hex = HEX_CHARS[(h0 >>> 28) & 0x0F] + HEX_CHARS[(h0 >>> 24) & 0x0F] +
	      HEX_CHARS[(h0 >>> 20) & 0x0F] + HEX_CHARS[(h0 >>> 16) & 0x0F] +
	      HEX_CHARS[(h0 >>> 12) & 0x0F] + HEX_CHARS[(h0 >>> 8) & 0x0F] +
	      HEX_CHARS[(h0 >>> 4) & 0x0F] + HEX_CHARS[h0 & 0x0F] +
	      HEX_CHARS[(h1 >>> 28) & 0x0F] + HEX_CHARS[(h1 >>> 24) & 0x0F] +
	      HEX_CHARS[(h1 >>> 20) & 0x0F] + HEX_CHARS[(h1 >>> 16) & 0x0F] +
	      HEX_CHARS[(h1 >>> 12) & 0x0F] + HEX_CHARS[(h1 >>> 8) & 0x0F] +
	      HEX_CHARS[(h1 >>> 4) & 0x0F] + HEX_CHARS[h1 & 0x0F] +
	      HEX_CHARS[(h2 >>> 28) & 0x0F] + HEX_CHARS[(h2 >>> 24) & 0x0F] +
	      HEX_CHARS[(h2 >>> 20) & 0x0F] + HEX_CHARS[(h2 >>> 16) & 0x0F] +
	      HEX_CHARS[(h2 >>> 12) & 0x0F] + HEX_CHARS[(h2 >>> 8) & 0x0F] +
	      HEX_CHARS[(h2 >>> 4) & 0x0F] + HEX_CHARS[h2 & 0x0F] +
	      HEX_CHARS[(h3 >>> 28) & 0x0F] + HEX_CHARS[(h3 >>> 24) & 0x0F] +
	      HEX_CHARS[(h3 >>> 20) & 0x0F] + HEX_CHARS[(h3 >>> 16) & 0x0F] +
	      HEX_CHARS[(h3 >>> 12) & 0x0F] + HEX_CHARS[(h3 >>> 8) & 0x0F] +
	      HEX_CHARS[(h3 >>> 4) & 0x0F] + HEX_CHARS[h3 & 0x0F] +
	      HEX_CHARS[(h4 >>> 28) & 0x0F] + HEX_CHARS[(h4 >>> 24) & 0x0F] +
	      HEX_CHARS[(h4 >>> 20) & 0x0F] + HEX_CHARS[(h4 >>> 16) & 0x0F] +
	      HEX_CHARS[(h4 >>> 12) & 0x0F] + HEX_CHARS[(h4 >>> 8) & 0x0F] +
	      HEX_CHARS[(h4 >>> 4) & 0x0F] + HEX_CHARS[h4 & 0x0F] +
	      HEX_CHARS[(h5 >>> 28) & 0x0F] + HEX_CHARS[(h5 >>> 24) & 0x0F] +
	      HEX_CHARS[(h5 >>> 20) & 0x0F] + HEX_CHARS[(h5 >>> 16) & 0x0F] +
	      HEX_CHARS[(h5 >>> 12) & 0x0F] + HEX_CHARS[(h5 >>> 8) & 0x0F] +
	      HEX_CHARS[(h5 >>> 4) & 0x0F] + HEX_CHARS[h5 & 0x0F] +
	      HEX_CHARS[(h6 >>> 28) & 0x0F] + HEX_CHARS[(h6 >>> 24) & 0x0F] +
	      HEX_CHARS[(h6 >>> 20) & 0x0F] + HEX_CHARS[(h6 >>> 16) & 0x0F] +
	      HEX_CHARS[(h6 >>> 12) & 0x0F] + HEX_CHARS[(h6 >>> 8) & 0x0F] +
	      HEX_CHARS[(h6 >>> 4) & 0x0F] + HEX_CHARS[h6 & 0x0F];
	    if (!this.is224) {
	      hex += HEX_CHARS[(h7 >>> 28) & 0x0F] + HEX_CHARS[(h7 >>> 24) & 0x0F] +
	        HEX_CHARS[(h7 >>> 20) & 0x0F] + HEX_CHARS[(h7 >>> 16) & 0x0F] +
	        HEX_CHARS[(h7 >>> 12) & 0x0F] + HEX_CHARS[(h7 >>> 8) & 0x0F] +
	        HEX_CHARS[(h7 >>> 4) & 0x0F] + HEX_CHARS[h7 & 0x0F];
	    }
	    return hex;
	  };

	  Sha256.prototype.toString = Sha256.prototype.hex;

	  Sha256.prototype.digest = function () {
	    this.finalize();

	    var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5,
	      h6 = this.h6, h7 = this.h7;

	    var arr = [
	      (h0 >>> 24) & 0xFF, (h0 >>> 16) & 0xFF, (h0 >>> 8) & 0xFF, h0 & 0xFF,
	      (h1 >>> 24) & 0xFF, (h1 >>> 16) & 0xFF, (h1 >>> 8) & 0xFF, h1 & 0xFF,
	      (h2 >>> 24) & 0xFF, (h2 >>> 16) & 0xFF, (h2 >>> 8) & 0xFF, h2 & 0xFF,
	      (h3 >>> 24) & 0xFF, (h3 >>> 16) & 0xFF, (h3 >>> 8) & 0xFF, h3 & 0xFF,
	      (h4 >>> 24) & 0xFF, (h4 >>> 16) & 0xFF, (h4 >>> 8) & 0xFF, h4 & 0xFF,
	      (h5 >>> 24) & 0xFF, (h5 >>> 16) & 0xFF, (h5 >>> 8) & 0xFF, h5 & 0xFF,
	      (h6 >>> 24) & 0xFF, (h6 >>> 16) & 0xFF, (h6 >>> 8) & 0xFF, h6 & 0xFF
	    ];
	    if (!this.is224) {
	      arr.push((h7 >>> 24) & 0xFF, (h7 >>> 16) & 0xFF, (h7 >>> 8) & 0xFF, h7 & 0xFF);
	    }
	    return arr;
	  };

	  Sha256.prototype.array = Sha256.prototype.digest;

	  Sha256.prototype.arrayBuffer = function () {
	    this.finalize();

	    var buffer = new ArrayBuffer(this.is224 ? 28 : 32);
	    var dataView = new DataView(buffer);
	    dataView.setUint32(0, this.h0);
	    dataView.setUint32(4, this.h1);
	    dataView.setUint32(8, this.h2);
	    dataView.setUint32(12, this.h3);
	    dataView.setUint32(16, this.h4);
	    dataView.setUint32(20, this.h5);
	    dataView.setUint32(24, this.h6);
	    if (!this.is224) {
	      dataView.setUint32(28, this.h7);
	    }
	    return buffer;
	  };

	  function HmacSha256(key, is224, sharedMemory) {
	    var i, type = typeof key;
	    if (type === 'string') {
	      var bytes = [], length = key.length, index = 0, code;
	      for (i = 0; i < length; ++i) {
	        code = key.charCodeAt(i);
	        if (code < 0x80) {
	          bytes[index++] = code;
	        } else if (code < 0x800) {
	          bytes[index++] = (0xc0 | (code >>> 6));
	          bytes[index++] = (0x80 | (code & 0x3f));
	        } else if (code < 0xd800 || code >= 0xe000) {
	          bytes[index++] = (0xe0 | (code >>> 12));
	          bytes[index++] = (0x80 | ((code >>> 6) & 0x3f));
	          bytes[index++] = (0x80 | (code & 0x3f));
	        } else {
	          code = 0x10000 + (((code & 0x3ff) << 10) | (key.charCodeAt(++i) & 0x3ff));
	          bytes[index++] = (0xf0 | (code >>> 18));
	          bytes[index++] = (0x80 | ((code >>> 12) & 0x3f));
	          bytes[index++] = (0x80 | ((code >>> 6) & 0x3f));
	          bytes[index++] = (0x80 | (code & 0x3f));
	        }
	      }
	      key = bytes;
	    } else {
	      if (type === 'object') {
	        if (key === null) {
	          throw new Error(ERROR);
	        } else if (ARRAY_BUFFER && key.constructor === ArrayBuffer) {
	          key = new Uint8Array(key);
	        } else if (!Array.isArray(key)) {
	          if (!ARRAY_BUFFER || !ArrayBuffer.isView(key)) {
	            throw new Error(ERROR);
	          }
	        }
	      } else {
	        throw new Error(ERROR);
	      }
	    }

	    if (key.length > 64) {
	      key = (new Sha256(is224, true)).update(key).array();
	    }

	    var oKeyPad = [], iKeyPad = [];
	    for (i = 0; i < 64; ++i) {
	      var b = key[i] || 0;
	      oKeyPad[i] = 0x5c ^ b;
	      iKeyPad[i] = 0x36 ^ b;
	    }

	    Sha256.call(this, is224, sharedMemory);

	    this.update(iKeyPad);
	    this.oKeyPad = oKeyPad;
	    this.inner = true;
	    this.sharedMemory = sharedMemory;
	  }
	  HmacSha256.prototype = new Sha256();

	  HmacSha256.prototype.finalize = function () {
	    Sha256.prototype.finalize.call(this);
	    if (this.inner) {
	      this.inner = false;
	      var innerHash = this.array();
	      Sha256.call(this, this.is224, this.sharedMemory);
	      this.update(this.oKeyPad);
	      this.update(innerHash);
	      Sha256.prototype.finalize.call(this);
	    }
	  };

	  var exports$1 = createMethod();
	  exports$1.sha256 = exports$1;
	  exports$1.sha224 = createMethod(true);
	  exports$1.sha256.hmac = createHmacMethod();
	  exports$1.sha224.hmac = createHmacMethod(true);

	  if (COMMON_JS) {
	    module.exports = exports$1;
	  } else {
	    root.sha256 = exports$1.sha256;
	    root.sha224 = exports$1.sha224;
	  }
	})(); 
} (sha256$1));

var sha256Exports = sha256$1.exports;
const sha256 = /*@__PURE__*/getDefaultExportFromCjs(sha256Exports);

class InvalidTokenError extends Error {
}
InvalidTokenError.prototype.name = "InvalidTokenError";
function b64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).replace(/(.)/g, (m, p) => {
        let code = p.charCodeAt(0).toString(16).toUpperCase();
        if (code.length < 2) {
            code = "0" + code;
        }
        return "%" + code;
    }));
}
function base64UrlDecode(str) {
    let output = str.replace(/-/g, "+").replace(/_/g, "/");
    switch (output.length % 4) {
        case 0:
            break;
        case 2:
            output += "==";
            break;
        case 3:
            output += "=";
            break;
        default:
            throw new Error("base64 string is not of the correct length");
    }
    try {
        return b64DecodeUnicode(output);
    }
    catch (err) {
        return atob(output);
    }
}
function jwtDecode(token, options) {
    if (typeof token !== "string") {
        throw new InvalidTokenError("Invalid token specified: must be a string");
    }
    options || (options = {});
    const pos = options.header === true ? 0 : 1;
    const part = token.split(".")[pos];
    if (typeof part !== "string") {
        throw new InvalidTokenError(`Invalid token specified: missing part #${pos + 1}`);
    }
    let decoded;
    try {
        decoded = base64UrlDecode(part);
    }
    catch (e) {
        throw new InvalidTokenError(`Invalid token specified: invalid base64 for part #${pos + 1} (${e.message})`);
    }
    try {
        return JSON.parse(decoded);
    }
    catch (e) {
        throw new InvalidTokenError(`Invalid token specified: invalid json for part #${pos + 1} (${e.message})`);
    }
}

/*
 * Copyright 2016 Red Hat, Inc. and/or its affiliates
 * and other contributors as indicated by the @author tags.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

if (typeof Promise === 'undefined') {
    throw Error('Keycloak requires an environment that supports Promises. Make sure that you include the appropriate polyfill.');
}

function Keycloak (config) {
    if (!(this instanceof Keycloak)) {
        throw new Error("The 'Keycloak' constructor must be invoked with 'new'.")
    }

    var kc = this;
    var adapter;
    var refreshQueue = [];
    var callbackStorage;

    var loginIframe = {
        enable: true,
        callbackList: [],
        interval: 5
    };

    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
        if ((scripts[i].src.indexOf('keycloak.js') !== -1 || scripts[i].src.indexOf('keycloak.min.js') !== -1) && scripts[i].src.indexOf('version=') !== -1) {
            kc.iframeVersion = scripts[i].src.substring(scripts[i].src.indexOf('version=') + 8).split('&')[0];
        }
    }

    var useNonce = true;
    var logInfo = createLogger(console.info);
    var logWarn = createLogger(console.warn);

    kc.init = function (initOptions) {
        if (kc.didInitialize) {
            throw new Error("A 'Keycloak' instance can only be initialized once.");
        }

        kc.didInitialize = true;

        kc.authenticated = false;

        callbackStorage = createCallbackStorage();
        var adapters = ['default', 'cordova', 'cordova-native'];

        if (initOptions && adapters.indexOf(initOptions.adapter) > -1) {
            adapter = loadAdapter(initOptions.adapter);
        } else if (initOptions && typeof initOptions.adapter === "object") {
            adapter = initOptions.adapter;
        } else {
            if (window.Cordova || window.cordova) {
                adapter = loadAdapter('cordova');
            } else {
                adapter = loadAdapter();
            }
        }

        if (initOptions) {
            if (typeof initOptions.useNonce !== 'undefined') {
                useNonce = initOptions.useNonce;
            }

            if (typeof initOptions.checkLoginIframe !== 'undefined') {
                loginIframe.enable = initOptions.checkLoginIframe;
            }

            if (initOptions.checkLoginIframeInterval) {
                loginIframe.interval = initOptions.checkLoginIframeInterval;
            }

            if (initOptions.onLoad === 'login-required') {
                kc.loginRequired = true;
            }

            if (initOptions.responseMode) {
                if (initOptions.responseMode === 'query' || initOptions.responseMode === 'fragment') {
                    kc.responseMode = initOptions.responseMode;
                } else {
                    throw 'Invalid value for responseMode';
                }
            }

            if (initOptions.flow) {
                switch (initOptions.flow) {
                    case 'standard':
                        kc.responseType = 'code';
                        break;
                    case 'implicit':
                        kc.responseType = 'id_token token';
                        break;
                    case 'hybrid':
                        kc.responseType = 'code id_token token';
                        break;
                    default:
                        throw 'Invalid value for flow';
                }
                kc.flow = initOptions.flow;
            }

            if (initOptions.timeSkew != null) {
                kc.timeSkew = initOptions.timeSkew;
            }

            if(initOptions.redirectUri) {
                kc.redirectUri = initOptions.redirectUri;
            }

            if (initOptions.silentCheckSsoRedirectUri) {
                kc.silentCheckSsoRedirectUri = initOptions.silentCheckSsoRedirectUri;
            }

            if (typeof initOptions.silentCheckSsoFallback === 'boolean') {
                kc.silentCheckSsoFallback = initOptions.silentCheckSsoFallback;
            } else {
                kc.silentCheckSsoFallback = true;
            }

            if (typeof initOptions.pkceMethod !== "undefined") {
                if (initOptions.pkceMethod !== "S256" && initOptions.pkceMethod !== false) {
                    throw new TypeError(`Invalid value for pkceMethod', expected 'S256' or false but got ${initOptions.pkceMethod}.`);
                }

                kc.pkceMethod = initOptions.pkceMethod;
            } else {
                kc.pkceMethod = "S256";
            }

            if (typeof initOptions.enableLogging === 'boolean') {
                kc.enableLogging = initOptions.enableLogging;
            } else {
                kc.enableLogging = false;
            }

            if (initOptions.logoutMethod === 'POST') {
                kc.logoutMethod = 'POST';
            } else {
                kc.logoutMethod = 'GET';
            }

            if (typeof initOptions.scope === 'string') {
                kc.scope = initOptions.scope;
            }

            if (typeof initOptions.acrValues === 'string') {
                kc.acrValues = initOptions.acrValues;
            }

            if (typeof initOptions.messageReceiveTimeout === 'number' && initOptions.messageReceiveTimeout > 0) {
                kc.messageReceiveTimeout = initOptions.messageReceiveTimeout;
            } else {
                kc.messageReceiveTimeout = 10000;
            }
        }

        if (!kc.responseMode) {
            kc.responseMode = 'fragment';
        }
        if (!kc.responseType) {
            kc.responseType = 'code';
            kc.flow = 'standard';
        }

        var promise = createPromise();

        var initPromise = createPromise();
        initPromise.promise.then(function() {
            kc.onReady && kc.onReady(kc.authenticated);
            promise.setSuccess(kc.authenticated);
        }).catch(function(error) {
            promise.setError(error);
        });

        var configPromise = loadConfig();

        function onLoad() {
            var doLogin = function(prompt) {
                if (!prompt) {
                    options.prompt = 'none';
                }

                if (initOptions && initOptions.locale) {
                    options.locale = initOptions.locale;
                }
                kc.login(options).then(function () {
                    initPromise.setSuccess();
                }).catch(function (error) {
                    initPromise.setError(error);
                });
            };

            var checkSsoSilently = function() {
                var ifrm = document.createElement("iframe");
                var src = kc.createLoginUrl({prompt: 'none', redirectUri: kc.silentCheckSsoRedirectUri});
                ifrm.setAttribute("src", src);
                ifrm.setAttribute("sandbox", "allow-storage-access-by-user-activation allow-scripts allow-same-origin");
                ifrm.setAttribute("title", "keycloak-silent-check-sso");
                ifrm.style.display = "none";
                document.body.appendChild(ifrm);

                var messageCallback = function(event) {
                    if (event.origin !== window.location.origin || ifrm.contentWindow !== event.source) {
                        return;
                    }

                    var oauth = parseCallback(event.data);
                    processCallback(oauth, initPromise);

                    document.body.removeChild(ifrm);
                    window.removeEventListener("message", messageCallback);
                };

                window.addEventListener("message", messageCallback);
            };

            var options = {};
            switch (initOptions.onLoad) {
                case 'check-sso':
                    if (loginIframe.enable) {
                        setupCheckLoginIframe().then(function() {
                            checkLoginIframe().then(function (unchanged) {
                                if (!unchanged) {
                                    kc.silentCheckSsoRedirectUri ? checkSsoSilently() : doLogin(false);
                                } else {
                                    initPromise.setSuccess();
                                }
                            }).catch(function (error) {
                                initPromise.setError(error);
                            });
                        });
                    } else {
                        kc.silentCheckSsoRedirectUri ? checkSsoSilently() : doLogin(false);
                    }
                    break;
                case 'login-required':
                    doLogin(true);
                    break;
                default:
                    throw 'Invalid value for onLoad';
            }
        }

        function processInit() {
            var callback = parseCallback(window.location.href);

            if (callback) {
                window.history.replaceState(window.history.state, null, callback.newUrl);
            }

            if (callback && callback.valid) {
                return setupCheckLoginIframe().then(function() {
                    processCallback(callback, initPromise);
                }).catch(function (error) {
                    initPromise.setError(error);
                });
            } else if (initOptions) {
                if (initOptions.token && initOptions.refreshToken) {
                    setToken(initOptions.token, initOptions.refreshToken, initOptions.idToken);

                    if (loginIframe.enable) {
                        setupCheckLoginIframe().then(function() {
                            checkLoginIframe().then(function (unchanged) {
                                if (unchanged) {
                                    kc.onAuthSuccess && kc.onAuthSuccess();
                                    initPromise.setSuccess();
                                    scheduleCheckIframe();
                                } else {
                                    initPromise.setSuccess();
                                }
                            }).catch(function (error) {
                                initPromise.setError(error);
                            });
                        });
                    } else {
                        kc.updateToken(-1).then(function() {
                            kc.onAuthSuccess && kc.onAuthSuccess();
                            initPromise.setSuccess();
                        }).catch(function(error) {
                            kc.onAuthError && kc.onAuthError();
                            if (initOptions.onLoad) {
                                onLoad();
                            } else {
                                initPromise.setError(error);
                            }
                        });
                    }
                } else if (initOptions.onLoad) {
                    onLoad();
                } else {
                    initPromise.setSuccess();
                }
            } else {
                initPromise.setSuccess();
            }
        }

        function domReady() {
            var promise = createPromise();

            var checkReadyState = function () {
                if (document.readyState === 'interactive' || document.readyState === 'complete') {
                    document.removeEventListener('readystatechange', checkReadyState);
                    promise.setSuccess();
                }
            };
            document.addEventListener('readystatechange', checkReadyState);

            checkReadyState(); // just in case the event was already fired and we missed it (in case the init is done later than at the load time, i.e. it's done from code)

            return promise.promise;
        }

        configPromise.then(function () {
            domReady()
                .then(check3pCookiesSupported)
                .then(processInit)
                .catch(function (error) {
                    promise.setError(error);
                });
        });
        configPromise.catch(function (error) {
            promise.setError(error);
        });

        return promise.promise;
    };

    kc.login = function (options) {
        return adapter.login(options);
    };

    function generateRandomData(len) {
        // use web crypto APIs if possible
        var array = null;
        var crypto = window.crypto || window.msCrypto;
        if (crypto && crypto.getRandomValues && window.Uint8Array) {
            array = new Uint8Array(len);
            crypto.getRandomValues(array);
            return array;
        }

        // fallback to Math random
        array = new Array(len);
        for (var j = 0; j < array.length; j++) {
            array[j] = Math.floor(256 * Math.random());
        }
        return array;
    }

    function generateCodeVerifier(len) {
        return generateRandomString(len, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
    }

    function generateRandomString(len, alphabet){
        var randomData = generateRandomData(len);
        var chars = new Array(len);
        for (var i = 0; i < len; i++) {
            chars[i] = alphabet.charCodeAt(randomData[i] % alphabet.length);
        }
        return String.fromCharCode.apply(null, chars);
    }

    function generatePkceChallenge(pkceMethod, codeVerifier) {
        if (pkceMethod !== "S256") {
            throw new TypeError(`Invalid value for 'pkceMethod', expected 'S256' but got '${pkceMethod}'.`);
        }

        // hash codeVerifier, then encode as url-safe base64 without padding
        const hashBytes = new Uint8Array(sha256.arrayBuffer(codeVerifier));
        const encodedHash = bytesToBase64(hashBytes)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/\=/g, '');

        return encodedHash;
    }

    function buildClaimsParameter(requestedAcr){
        var claims = {
            id_token: {
                acr: requestedAcr
            }
        };
        return JSON.stringify(claims);
    }

    kc.createLoginUrl = function(options) {
        var state = createUUID();
        var nonce = createUUID();

        var redirectUri = adapter.redirectUri(options);

        var callbackState = {
            state: state,
            nonce: nonce,
            redirectUri: encodeURIComponent(redirectUri),
            loginOptions: options
        };

        if (options && options.prompt) {
            callbackState.prompt = options.prompt;
        }

        var baseUrl;
        if (options && options.action == 'register') {
            baseUrl = kc.endpoints.register();
        } else {
            baseUrl = kc.endpoints.authorize();
        }

        var scope = options && options.scope || kc.scope;
        if (!scope) {
            // if scope is not set, default to "openid"
            scope = "openid";
        } else if (scope.indexOf("openid") === -1) {
            // if openid scope is missing, prefix the given scopes with it
            scope = "openid " + scope;
        }

        var url = baseUrl
            + '?client_id=' + encodeURIComponent(kc.clientId)
            + '&redirect_uri=' + encodeURIComponent(redirectUri)
            + '&state=' + encodeURIComponent(state)
            + '&response_mode=' + encodeURIComponent(kc.responseMode)
            + '&response_type=' + encodeURIComponent(kc.responseType)
            + '&scope=' + encodeURIComponent(scope);
        if (useNonce) {
            url = url + '&nonce=' + encodeURIComponent(nonce);
        }

        if (options && options.prompt) {
            url += '&prompt=' + encodeURIComponent(options.prompt);
        }

        if (options && options.maxAge) {
            url += '&max_age=' + encodeURIComponent(options.maxAge);
        }

        if (options && options.loginHint) {
            url += '&login_hint=' + encodeURIComponent(options.loginHint);
        }

        if (options && options.idpHint) {
            url += '&kc_idp_hint=' + encodeURIComponent(options.idpHint);
        }

        if (options && options.action && options.action != 'register') {
            url += '&kc_action=' + encodeURIComponent(options.action);
        }

        if (options && options.locale) {
            url += '&ui_locales=' + encodeURIComponent(options.locale);
        }

        if (options && options.acr) {
            var claimsParameter = buildClaimsParameter(options.acr);
            url += '&claims=' + encodeURIComponent(claimsParameter);
        }

        if ((options && options.acrValues) || kc.acrValues) {
            url += '&acr_values=' + encodeURIComponent(options.acrValues || kc.acrValues);
        }

        if (kc.pkceMethod) {
            var codeVerifier = generateCodeVerifier(96);
            callbackState.pkceCodeVerifier = codeVerifier;
            var pkceChallenge = generatePkceChallenge(kc.pkceMethod, codeVerifier);
            url += '&code_challenge=' + pkceChallenge;
            url += '&code_challenge_method=' + kc.pkceMethod;
        }

        callbackStorage.add(callbackState);

        return url;
    };

    kc.logout = function(options) {
        return adapter.logout(options);
    };

    kc.createLogoutUrl = function(options) {

        const logoutMethod = options?.logoutMethod ?? kc.logoutMethod;
        if (logoutMethod === 'POST') {
            return kc.endpoints.logout();
        }

        var url = kc.endpoints.logout()
            + '?client_id=' + encodeURIComponent(kc.clientId)
            + '&post_logout_redirect_uri=' + encodeURIComponent(adapter.redirectUri(options, false));

        if (kc.idToken) {
            url += '&id_token_hint=' + encodeURIComponent(kc.idToken);
        }

        return url;
    };

    kc.register = function (options) {
        return adapter.register(options);
    };

    kc.createRegisterUrl = function(options) {
        if (!options) {
            options = {};
        }
        options.action = 'register';
        return kc.createLoginUrl(options);
    };

    kc.createAccountUrl = function(options) {
        var realm = getRealmUrl();
        var url = undefined;
        if (typeof realm !== 'undefined') {
            url = realm
            + '/account'
            + '?referrer=' + encodeURIComponent(kc.clientId)
            + '&referrer_uri=' + encodeURIComponent(adapter.redirectUri(options));
        }
        return url;
    };

    kc.accountManagement = function() {
        return adapter.accountManagement();
    };

    kc.hasRealmRole = function (role) {
        var access = kc.realmAccess;
        return !!access && access.roles.indexOf(role) >= 0;
    };

    kc.hasResourceRole = function(role, resource) {
        if (!kc.resourceAccess) {
            return false;
        }

        var access = kc.resourceAccess[resource || kc.clientId];
        return !!access && access.roles.indexOf(role) >= 0;
    };

    kc.loadUserProfile = function() {
        var url = getRealmUrl() + '/account';
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.setRequestHeader('Accept', 'application/json');
        req.setRequestHeader('Authorization', 'bearer ' + kc.token);

        var promise = createPromise();

        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    kc.profile = JSON.parse(req.responseText);
                    promise.setSuccess(kc.profile);
                } else {
                    promise.setError();
                }
            }
        };

        req.send();

        return promise.promise;
    };

    kc.loadUserInfo = function() {
        var url = kc.endpoints.userinfo();
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.setRequestHeader('Accept', 'application/json');
        req.setRequestHeader('Authorization', 'bearer ' + kc.token);

        var promise = createPromise();

        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    kc.userInfo = JSON.parse(req.responseText);
                    promise.setSuccess(kc.userInfo);
                } else {
                    promise.setError();
                }
            }
        };

        req.send();

        return promise.promise;
    };

    kc.isTokenExpired = function(minValidity) {
        if (!kc.tokenParsed || (!kc.refreshToken && kc.flow != 'implicit' )) {
            throw 'Not authenticated';
        }

        if (kc.timeSkew == null) {
            logInfo('[KEYCLOAK] Unable to determine if token is expired as timeskew is not set');
            return true;
        }

        var expiresIn = kc.tokenParsed['exp'] - Math.ceil(new Date().getTime() / 1000) + kc.timeSkew;
        if (minValidity) {
            if (isNaN(minValidity)) {
                throw 'Invalid minValidity';
            }
            expiresIn -= minValidity;
        }
        return expiresIn < 0;
    };

    kc.updateToken = function(minValidity) {
        var promise = createPromise();

        if (!kc.refreshToken) {
            promise.setError();
            return promise.promise;
        }

        minValidity = minValidity || 5;

        var exec = function() {
            var refreshToken = false;
            if (minValidity == -1) {
                refreshToken = true;
                logInfo('[KEYCLOAK] Refreshing token: forced refresh');
            } else if (!kc.tokenParsed || kc.isTokenExpired(minValidity)) {
                refreshToken = true;
                logInfo('[KEYCLOAK] Refreshing token: token expired');
            }

            if (!refreshToken) {
                promise.setSuccess(false);
            } else {
                var params = 'grant_type=refresh_token&' + 'refresh_token=' + kc.refreshToken;
                var url = kc.endpoints.token();

                refreshQueue.push(promise);

                if (refreshQueue.length == 1) {
                    var req = new XMLHttpRequest();
                    req.open('POST', url, true);
                    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                    req.withCredentials = true;

                    params += '&client_id=' + encodeURIComponent(kc.clientId);

                    var timeLocal = new Date().getTime();

                    req.onreadystatechange = function () {
                        if (req.readyState == 4) {
                            if (req.status == 200) {
                                logInfo('[KEYCLOAK] Token refreshed');

                                timeLocal = (timeLocal + new Date().getTime()) / 2;

                                var tokenResponse = JSON.parse(req.responseText);

                                setToken(tokenResponse['access_token'], tokenResponse['refresh_token'], tokenResponse['id_token'], timeLocal);

                                kc.onAuthRefreshSuccess && kc.onAuthRefreshSuccess();
                                for (var p = refreshQueue.pop(); p != null; p = refreshQueue.pop()) {
                                    p.setSuccess(true);
                                }
                            } else {
                                logWarn('[KEYCLOAK] Failed to refresh token');

                                if (req.status == 400) {
                                    kc.clearToken();
                                }

                                kc.onAuthRefreshError && kc.onAuthRefreshError();
                                for (var p = refreshQueue.pop(); p != null; p = refreshQueue.pop()) {
                                    p.setError(true);
                                }
                            }
                        }
                    };

                    req.send(params);
                }
            }
        };

        if (loginIframe.enable) {
            var iframePromise = checkLoginIframe();
            iframePromise.then(function() {
                exec();
            }).catch(function(error) {
                promise.setError(error);
            });
        } else {
            exec();
        }

        return promise.promise;
    };

    kc.clearToken = function() {
        if (kc.token) {
            setToken(null, null, null);
            kc.onAuthLogout && kc.onAuthLogout();
            if (kc.loginRequired) {
                kc.login();
            }
        }
    };

    function getRealmUrl() {
        if (typeof kc.authServerUrl !== 'undefined') {
            if (kc.authServerUrl.charAt(kc.authServerUrl.length - 1) == '/') {
                return kc.authServerUrl + 'realms/' + encodeURIComponent(kc.realm);
            } else {
                return kc.authServerUrl + '/realms/' + encodeURIComponent(kc.realm);
            }
        } else {
            return undefined;
        }
    }

    function getOrigin() {
        if (!window.location.origin) {
            return window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
        } else {
            return window.location.origin;
        }
    }

    function processCallback(oauth, promise) {
        var code = oauth.code;
        var error = oauth.error;
        var prompt = oauth.prompt;

        var timeLocal = new Date().getTime();

        if (oauth['kc_action_status']) {
            kc.onActionUpdate && kc.onActionUpdate(oauth['kc_action_status']);
        }

        if (error) {
            if (prompt != 'none') {
                if (oauth.error_description && oauth.error_description === "authentication_expired") {
                    kc.login(oauth.loginOptions);
                } else {
                    var errorData = { error: error, error_description: oauth.error_description };
                    kc.onAuthError && kc.onAuthError(errorData);
                    promise && promise.setError(errorData);
                }
            } else {
                promise && promise.setSuccess();
            }
            return;
        } else if ((kc.flow != 'standard') && (oauth.access_token || oauth.id_token)) {
            authSuccess(oauth.access_token, null, oauth.id_token, true);
        }

        if ((kc.flow != 'implicit') && code) {
            var params = 'code=' + code + '&grant_type=authorization_code';
            var url = kc.endpoints.token();

            var req = new XMLHttpRequest();
            req.open('POST', url, true);
            req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            params += '&client_id=' + encodeURIComponent(kc.clientId);
            params += '&redirect_uri=' + oauth.redirectUri;

            if (oauth.pkceCodeVerifier) {
                params += '&code_verifier=' + oauth.pkceCodeVerifier;
            }

            req.withCredentials = true;

            req.onreadystatechange = function() {
                if (req.readyState == 4) {
                    if (req.status == 200) {

                        var tokenResponse = JSON.parse(req.responseText);
                        authSuccess(tokenResponse['access_token'], tokenResponse['refresh_token'], tokenResponse['id_token'], kc.flow === 'standard');
                        scheduleCheckIframe();
                    } else {
                        kc.onAuthError && kc.onAuthError();
                        promise && promise.setError();
                    }
                }
            };

            req.send(params);
        }

        function authSuccess(accessToken, refreshToken, idToken, fulfillPromise) {
            timeLocal = (timeLocal + new Date().getTime()) / 2;

            setToken(accessToken, refreshToken, idToken, timeLocal);

            if (useNonce && (kc.idTokenParsed && kc.idTokenParsed.nonce != oauth.storedNonce)) {
                logInfo('[KEYCLOAK] Invalid nonce, clearing token');
                kc.clearToken();
                promise && promise.setError();
            } else {
                if (fulfillPromise) {
                    kc.onAuthSuccess && kc.onAuthSuccess();
                    promise && promise.setSuccess();
                }
            }
        }

    }

    function loadConfig(url) {
        var promise = createPromise();
        var configUrl;

        if (!config) {
            configUrl = 'keycloak.json';
        } else if (typeof config === 'string') {
            configUrl = config;
        }

        function setupOidcEndoints(oidcConfiguration) {
            if (! oidcConfiguration) {
                kc.endpoints = {
                    authorize: function() {
                        return getRealmUrl() + '/protocol/openid-connect/auth';
                    },
                    token: function() {
                        return getRealmUrl() + '/protocol/openid-connect/token';
                    },
                    logout: function() {
                        return getRealmUrl() + '/protocol/openid-connect/logout';
                    },
                    checkSessionIframe: function() {
                        var src = getRealmUrl() + '/protocol/openid-connect/login-status-iframe.html';
                        if (kc.iframeVersion) {
                            src = src + '?version=' + kc.iframeVersion;
                        }
                        return src;
                    },
                    thirdPartyCookiesIframe: function() {
                        var src = getRealmUrl() + '/protocol/openid-connect/3p-cookies/step1.html';
                        if (kc.iframeVersion) {
                            src = src + '?version=' + kc.iframeVersion;
                        }
                        return src;
                    },
                    register: function() {
                        return getRealmUrl() + '/protocol/openid-connect/registrations';
                    },
                    userinfo: function() {
                        return getRealmUrl() + '/protocol/openid-connect/userinfo';
                    }
                };
            } else {
                kc.endpoints = {
                    authorize: function() {
                        return oidcConfiguration.authorization_endpoint;
                    },
                    token: function() {
                        return oidcConfiguration.token_endpoint;
                    },
                    logout: function() {
                        if (!oidcConfiguration.end_session_endpoint) {
                            throw "Not supported by the OIDC server";
                        }
                        return oidcConfiguration.end_session_endpoint;
                    },
                    checkSessionIframe: function() {
                        if (!oidcConfiguration.check_session_iframe) {
                            throw "Not supported by the OIDC server";
                        }
                        return oidcConfiguration.check_session_iframe;
                    },
                    register: function() {
                        throw 'Redirection to "Register user" page not supported in standard OIDC mode';
                    },
                    userinfo: function() {
                        if (!oidcConfiguration.userinfo_endpoint) {
                            throw "Not supported by the OIDC server";
                        }
                        return oidcConfiguration.userinfo_endpoint;
                    }
                };
            }
        }

        if (configUrl) {
            var req = new XMLHttpRequest();
            req.open('GET', configUrl, true);
            req.setRequestHeader('Accept', 'application/json');

            req.onreadystatechange = function () {
                if (req.readyState == 4) {
                    if (req.status == 200 || fileLoaded(req)) {
                        var config = JSON.parse(req.responseText);

                        kc.authServerUrl = config['auth-server-url'];
                        kc.realm = config['realm'];
                        kc.clientId = config['resource'];
                        setupOidcEndoints(null);
                        promise.setSuccess();
                    } else {
                        promise.setError();
                    }
                }
            };

            req.send();
        } else {
            if (!config.clientId) {
                throw 'clientId missing';
            }

            kc.clientId = config.clientId;

            var oidcProvider = config['oidcProvider'];
            if (!oidcProvider) {
                if (!config['url']) {
                    var scripts = document.getElementsByTagName('script');
                    for (var i = 0; i < scripts.length; i++) {
                        if (scripts[i].src.match(/.*keycloak\.js/)) {
                            config.url = scripts[i].src.substr(0, scripts[i].src.indexOf('/js/keycloak.js'));
                            break;
                        }
                    }
                }
                if (!config.realm) {
                    throw 'realm missing';
                }

                kc.authServerUrl = config.url;
                kc.realm = config.realm;
                setupOidcEndoints(null);
                promise.setSuccess();
            } else {
                if (typeof oidcProvider === 'string') {
                    var oidcProviderConfigUrl;
                    if (oidcProvider.charAt(oidcProvider.length - 1) == '/') {
                        oidcProviderConfigUrl = oidcProvider + '.well-known/openid-configuration';
                    } else {
                        oidcProviderConfigUrl = oidcProvider + '/.well-known/openid-configuration';
                    }
                    var req = new XMLHttpRequest();
                    req.open('GET', oidcProviderConfigUrl, true);
                    req.setRequestHeader('Accept', 'application/json');

                    req.onreadystatechange = function () {
                        if (req.readyState == 4) {
                            if (req.status == 200 || fileLoaded(req)) {
                                var oidcProviderConfig = JSON.parse(req.responseText);
                                setupOidcEndoints(oidcProviderConfig);
                                promise.setSuccess();
                            } else {
                                promise.setError();
                            }
                        }
                    };

                    req.send();
                } else {
                    setupOidcEndoints(oidcProvider);
                    promise.setSuccess();
                }
            }
        }

        return promise.promise;
    }

    function fileLoaded(xhr) {
        return xhr.status == 0 && xhr.responseText && xhr.responseURL.startsWith('file:');
    }

    function setToken(token, refreshToken, idToken, timeLocal) {
        if (kc.tokenTimeoutHandle) {
            clearTimeout(kc.tokenTimeoutHandle);
            kc.tokenTimeoutHandle = null;
        }

        if (refreshToken) {
            kc.refreshToken = refreshToken;
            kc.refreshTokenParsed = jwtDecode(refreshToken);
        } else {
            delete kc.refreshToken;
            delete kc.refreshTokenParsed;
        }

        if (idToken) {
            kc.idToken = idToken;
            kc.idTokenParsed = jwtDecode(idToken);
        } else {
            delete kc.idToken;
            delete kc.idTokenParsed;
        }

        if (token) {
            kc.token = token;
            kc.tokenParsed = jwtDecode(token);
            kc.sessionId = kc.tokenParsed.sid;
            kc.authenticated = true;
            kc.subject = kc.tokenParsed.sub;
            kc.realmAccess = kc.tokenParsed.realm_access;
            kc.resourceAccess = kc.tokenParsed.resource_access;

            if (timeLocal) {
                kc.timeSkew = Math.floor(timeLocal / 1000) - kc.tokenParsed.iat;
            }

            if (kc.timeSkew != null) {
                logInfo('[KEYCLOAK] Estimated time difference between browser and server is ' + kc.timeSkew + ' seconds');

                if (kc.onTokenExpired) {
                    var expiresIn = (kc.tokenParsed['exp'] - (new Date().getTime() / 1000) + kc.timeSkew) * 1000;
                    logInfo('[KEYCLOAK] Token expires in ' + Math.round(expiresIn / 1000) + ' s');
                    if (expiresIn <= 0) {
                        kc.onTokenExpired();
                    } else {
                        kc.tokenTimeoutHandle = setTimeout(kc.onTokenExpired, expiresIn);
                    }
                }
            }
        } else {
            delete kc.token;
            delete kc.tokenParsed;
            delete kc.subject;
            delete kc.realmAccess;
            delete kc.resourceAccess;

            kc.authenticated = false;
        }
    }

    function createUUID() {
        var hexDigits = '0123456789abcdef';
        var s = generateRandomString(36, hexDigits).split("");
        s[14] = '4';
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
        s[8] = s[13] = s[18] = s[23] = '-';
        var uuid = s.join('');
        return uuid;
    }

    function parseCallback(url) {
        var oauth = parseCallbackUrl(url);
        if (!oauth) {
            return;
        }

        var oauthState = callbackStorage.get(oauth.state);

        if (oauthState) {
            oauth.valid = true;
            oauth.redirectUri = oauthState.redirectUri;
            oauth.storedNonce = oauthState.nonce;
            oauth.prompt = oauthState.prompt;
            oauth.pkceCodeVerifier = oauthState.pkceCodeVerifier;
            oauth.loginOptions = oauthState.loginOptions;
        }

        return oauth;
    }

    function parseCallbackUrl(url) {
        var supportedParams;
        switch (kc.flow) {
            case 'standard':
                supportedParams = ['code', 'state', 'session_state', 'kc_action_status', 'iss'];
                break;
            case 'implicit':
                supportedParams = ['access_token', 'token_type', 'id_token', 'state', 'session_state', 'expires_in', 'kc_action_status', 'iss'];
                break;
            case 'hybrid':
                supportedParams = ['access_token', 'token_type', 'id_token', 'code', 'state', 'session_state', 'expires_in', 'kc_action_status', 'iss'];
                break;
        }

        supportedParams.push('error');
        supportedParams.push('error_description');
        supportedParams.push('error_uri');

        var queryIndex = url.indexOf('?');
        var fragmentIndex = url.indexOf('#');

        var newUrl;
        var parsed;

        if (kc.responseMode === 'query' && queryIndex !== -1) {
            newUrl = url.substring(0, queryIndex);
            parsed = parseCallbackParams(url.substring(queryIndex + 1, fragmentIndex !== -1 ? fragmentIndex : url.length), supportedParams);
            if (parsed.paramsString !== '') {
                newUrl += '?' + parsed.paramsString;
            }
            if (fragmentIndex !== -1) {
                newUrl += url.substring(fragmentIndex);
            }
        } else if (kc.responseMode === 'fragment' && fragmentIndex !== -1) {
            newUrl = url.substring(0, fragmentIndex);
            parsed = parseCallbackParams(url.substring(fragmentIndex + 1), supportedParams);
            if (parsed.paramsString !== '') {
                newUrl += '#' + parsed.paramsString;
            }
        }

        if (parsed && parsed.oauthParams) {
            if (kc.flow === 'standard' || kc.flow === 'hybrid') {
                if ((parsed.oauthParams.code || parsed.oauthParams.error) && parsed.oauthParams.state) {
                    parsed.oauthParams.newUrl = newUrl;
                    return parsed.oauthParams;
                }
            } else if (kc.flow === 'implicit') {
                if ((parsed.oauthParams.access_token || parsed.oauthParams.error) && parsed.oauthParams.state) {
                    parsed.oauthParams.newUrl = newUrl;
                    return parsed.oauthParams;
                }
            }
        }
    }

    function parseCallbackParams(paramsString, supportedParams) {
        var p = paramsString.split('&');
        var result = {
            paramsString: '',
            oauthParams: {}
        };
        for (var i = 0; i < p.length; i++) {
            var split = p[i].indexOf("=");
            var key = p[i].slice(0, split);
            if (supportedParams.indexOf(key) !== -1) {
                result.oauthParams[key] = p[i].slice(split + 1);
            } else {
                if (result.paramsString !== '') {
                    result.paramsString += '&';
                }
                result.paramsString += p[i];
            }
        }
        return result;
    }

    function createPromise() {
        // Need to create a native Promise which also preserves the
        // interface of the custom promise type previously used by the API
        var p = {
            setSuccess: function(result) {
                p.resolve(result);
            },

            setError: function(result) {
                p.reject(result);
            }
        };
        p.promise = new Promise(function(resolve, reject) {
            p.resolve = resolve;
            p.reject = reject;
        });

        return p;
    }

    // Function to extend existing native Promise with timeout
    function applyTimeoutToPromise(promise, timeout, errorMessage) {
        var timeoutHandle = null;
        var timeoutPromise = new Promise(function (resolve, reject) {
            timeoutHandle = setTimeout(function () {
                reject({ "error": errorMessage  });
            }, timeout);
        });

        return Promise.race([promise, timeoutPromise]).finally(function () {
            clearTimeout(timeoutHandle);
        });
    }

    function setupCheckLoginIframe() {
        var promise = createPromise();

        if (!loginIframe.enable) {
            promise.setSuccess();
            return promise.promise;
        }

        if (loginIframe.iframe) {
            promise.setSuccess();
            return promise.promise;
        }

        var iframe = document.createElement('iframe');
        loginIframe.iframe = iframe;

        iframe.onload = function() {
            var authUrl = kc.endpoints.authorize();
            if (authUrl.charAt(0) === '/') {
                loginIframe.iframeOrigin = getOrigin();
            } else {
                loginIframe.iframeOrigin = authUrl.substring(0, authUrl.indexOf('/', 8));
            }
            promise.setSuccess();
        };

        var src = kc.endpoints.checkSessionIframe();
        iframe.setAttribute('src', src );
        iframe.setAttribute('sandbox', 'allow-storage-access-by-user-activation allow-scripts allow-same-origin');
        iframe.setAttribute('title', 'keycloak-session-iframe' );
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        var messageCallback = function(event) {
            if ((event.origin !== loginIframe.iframeOrigin) || (loginIframe.iframe.contentWindow !== event.source)) {
                return;
            }

            if (!(event.data == 'unchanged' || event.data == 'changed' || event.data == 'error')) {
                return;
            }


            if (event.data != 'unchanged') {
                kc.clearToken();
            }

            var callbacks = loginIframe.callbackList.splice(0, loginIframe.callbackList.length);

            for (var i = callbacks.length - 1; i >= 0; --i) {
                var promise = callbacks[i];
                if (event.data == 'error') {
                    promise.setError();
                } else {
                    promise.setSuccess(event.data == 'unchanged');
                }
            }
        };

        window.addEventListener('message', messageCallback, false);

        return promise.promise;
    }

    function scheduleCheckIframe() {
        if (loginIframe.enable) {
            if (kc.token) {
                setTimeout(function() {
                    checkLoginIframe().then(function(unchanged) {
                        if (unchanged) {
                            scheduleCheckIframe();
                        }
                    });
                }, loginIframe.interval * 1000);
            }
        }
    }

    function checkLoginIframe() {
        var promise = createPromise();

        if (loginIframe.iframe && loginIframe.iframeOrigin ) {
            var msg = kc.clientId + ' ' + (kc.sessionId ? kc.sessionId : '');
            loginIframe.callbackList.push(promise);
            var origin = loginIframe.iframeOrigin;
            if (loginIframe.callbackList.length == 1) {
                loginIframe.iframe.contentWindow.postMessage(msg, origin);
            }
        } else {
            promise.setSuccess();
        }

        return promise.promise;
    }

    function check3pCookiesSupported() {
        var promise = createPromise();

        if (loginIframe.enable || kc.silentCheckSsoRedirectUri) {
            var iframe = document.createElement('iframe');
            iframe.setAttribute('src', kc.endpoints.thirdPartyCookiesIframe());
            iframe.setAttribute('sandbox', 'allow-storage-access-by-user-activation allow-scripts allow-same-origin');
            iframe.setAttribute('title', 'keycloak-3p-check-iframe' );
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            var messageCallback = function(event) {
                if (iframe.contentWindow !== event.source) {
                    return;
                }

                if (event.data !== "supported" && event.data !== "unsupported") {
                    return;
                } else if (event.data === "unsupported") {
                    logWarn(
                        "[KEYCLOAK] Your browser is blocking access to 3rd-party cookies, this means:\n\n" +
                        " - It is not possible to retrieve tokens without redirecting to the Keycloak server (a.k.a. no support for silent authentication).\n" +
                        " - It is not possible to automatically detect changes to the session status (such as the user logging out in another tab).\n\n" +
                        "For more information see: https://www.keycloak.org/docs/latest/securing_apps/#_modern_browsers"
                    );

                    loginIframe.enable = false;
                    if (kc.silentCheckSsoFallback) {
                        kc.silentCheckSsoRedirectUri = false;
                    }
                }

                document.body.removeChild(iframe);
                window.removeEventListener("message", messageCallback);
                promise.setSuccess();
            };

            window.addEventListener('message', messageCallback, false);
        } else {
            promise.setSuccess();
        }

        return applyTimeoutToPromise(promise.promise, kc.messageReceiveTimeout, "Timeout when waiting for 3rd party check iframe message.");
    }

    function loadAdapter(type) {
        if (!type || type == 'default') {
            return {
                login: function(options) {
                    window.location.assign(kc.createLoginUrl(options));
                    return createPromise().promise;
                },

                logout: async function(options) {

                    const logoutMethod = options?.logoutMethod ?? kc.logoutMethod;
                    if (logoutMethod === "GET") {
                        window.location.replace(kc.createLogoutUrl(options));
                        return;
                    }

                    const logoutUrl = kc.createLogoutUrl(options);
                    const response = await fetch(logoutUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        body: new URLSearchParams({
                            id_token_hint: kc.idToken,
                            client_id: kc.clientId,
                            post_logout_redirect_uri: adapter.redirectUri(options, false)
                        })
                    });

                    if (response.redirected) {
                        window.location.href = response.url;
                        return;
                    }

                    if (response.ok) {
                        window.location.reload();
                        return;
                    }

                    throw new Error("Logout failed, request returned an error code.");
                },

                register: function(options) {
                    window.location.assign(kc.createRegisterUrl(options));
                    return createPromise().promise;
                },

                accountManagement : function() {
                    var accountUrl = kc.createAccountUrl();
                    if (typeof accountUrl !== 'undefined') {
                        window.location.href = accountUrl;
                    } else {
                        throw "Not supported by the OIDC server";
                    }
                    return createPromise().promise;
                },

                redirectUri: function(options, encodeHash) {

                    if (options && options.redirectUri) {
                        return options.redirectUri;
                    } else if (kc.redirectUri) {
                        return kc.redirectUri;
                    } else {
                        return location.href;
                    }
                }
            };
        }

        if (type == 'cordova') {
            loginIframe.enable = false;
            var cordovaOpenWindowWrapper = function(loginUrl, target, options) {
                if (window.cordova && window.cordova.InAppBrowser) {
                    // Use inappbrowser for IOS and Android if available
                    return window.cordova.InAppBrowser.open(loginUrl, target, options);
                } else {
                    return window.open(loginUrl, target, options);
                }
            };

            var shallowCloneCordovaOptions = function (userOptions) {
                if (userOptions && userOptions.cordovaOptions) {
                    return Object.keys(userOptions.cordovaOptions).reduce(function (options, optionName) {
                        options[optionName] = userOptions.cordovaOptions[optionName];
                        return options;
                    }, {});
                } else {
                    return {};
                }
            };

            var formatCordovaOptions = function (cordovaOptions) {
                return Object.keys(cordovaOptions).reduce(function (options, optionName) {
                    options.push(optionName+"="+cordovaOptions[optionName]);
                    return options;
                }, []).join(",");
            };

            var createCordovaOptions = function (userOptions) {
                var cordovaOptions = shallowCloneCordovaOptions(userOptions);
                cordovaOptions.location = 'no';
                if (userOptions && userOptions.prompt == 'none') {
                    cordovaOptions.hidden = 'yes';
                }
                return formatCordovaOptions(cordovaOptions);
            };

            var getCordovaRedirectUri = function() {
                return kc.redirectUri || 'http://localhost';
            };
            
            return {
                login: function(options) {
                    var promise = createPromise();

                    var cordovaOptions = createCordovaOptions(options);
                    var loginUrl = kc.createLoginUrl(options);
                    var ref = cordovaOpenWindowWrapper(loginUrl, '_blank', cordovaOptions);
                    var completed = false;

                    var closed = false;
                    var closeBrowser = function() {
                        closed = true;
                        ref.close();
                    };

                    ref.addEventListener('loadstart', function(event) {
                        if (event.url.indexOf(getCordovaRedirectUri()) == 0) {
                            var callback = parseCallback(event.url);
                            processCallback(callback, promise);
                            closeBrowser();
                            completed = true;
                        }
                    });

                    ref.addEventListener('loaderror', function(event) {
                        if (!completed) {
                            if (event.url.indexOf(getCordovaRedirectUri()) == 0) {
                                var callback = parseCallback(event.url);
                                processCallback(callback, promise);
                                closeBrowser();
                                completed = true;
                            } else {
                                promise.setError();
                                closeBrowser();
                            }
                        }
                    });

                    ref.addEventListener('exit', function(event) {
                        if (!closed) {
                            promise.setError({
                                reason: "closed_by_user"
                            });
                        }
                    });

                    return promise.promise;
                },

                logout: function(options) {
                    var promise = createPromise();

                    var logoutUrl = kc.createLogoutUrl(options);
                    var ref = cordovaOpenWindowWrapper(logoutUrl, '_blank', 'location=no,hidden=yes,clearcache=yes');

                    var error;

                    ref.addEventListener('loadstart', function(event) {
                        if (event.url.indexOf(getCordovaRedirectUri()) == 0) {
                            ref.close();
                        }
                    });

                    ref.addEventListener('loaderror', function(event) {
                        if (event.url.indexOf(getCordovaRedirectUri()) == 0) {
                            ref.close();
                        } else {
                            error = true;
                            ref.close();
                        }
                    });

                    ref.addEventListener('exit', function(event) {
                        if (error) {
                            promise.setError();
                        } else {
                            kc.clearToken();
                            promise.setSuccess();
                        }
                    });

                    return promise.promise;
                },

                register : function(options) {
                    var promise = createPromise();
                    var registerUrl = kc.createRegisterUrl();
                    var cordovaOptions = createCordovaOptions(options);
                    var ref = cordovaOpenWindowWrapper(registerUrl, '_blank', cordovaOptions);
                    ref.addEventListener('loadstart', function(event) {
                        if (event.url.indexOf(getCordovaRedirectUri()) == 0) {
                            ref.close();
                            var oauth = parseCallback(event.url);
                            processCallback(oauth, promise);
                        }
                    });
                    return promise.promise;
                },

                accountManagement : function() {
                    var accountUrl = kc.createAccountUrl();
                    if (typeof accountUrl !== 'undefined') {
                        var ref = cordovaOpenWindowWrapper(accountUrl, '_blank', 'location=no');
                        ref.addEventListener('loadstart', function(event) {
                            if (event.url.indexOf(getCordovaRedirectUri()) == 0) {
                                ref.close();
                            }
                        });
                    } else {
                        throw "Not supported by the OIDC server";
                    }
                },

                redirectUri: function(options) {
                    return getCordovaRedirectUri();
                }
            }
        }

        if (type == 'cordova-native') {
            loginIframe.enable = false;

            return {
                login: function(options) {
                    var promise = createPromise();
                    var loginUrl = kc.createLoginUrl(options);

                    universalLinks.subscribe('keycloak', function(event) {
                        universalLinks.unsubscribe('keycloak');
                        window.cordova.plugins.browsertab.close();
                        var oauth = parseCallback(event.url);
                        processCallback(oauth, promise);
                    });

                    window.cordova.plugins.browsertab.openUrl(loginUrl);
                    return promise.promise;
                },

                logout: function(options) {
                    var promise = createPromise();
                    var logoutUrl = kc.createLogoutUrl(options);

                    universalLinks.subscribe('keycloak', function(event) {
                        universalLinks.unsubscribe('keycloak');
                        window.cordova.plugins.browsertab.close();
                        kc.clearToken();
                        promise.setSuccess();
                    });

                    window.cordova.plugins.browsertab.openUrl(logoutUrl);
                    return promise.promise;
                },

                register : function(options) {
                    var promise = createPromise();
                    var registerUrl = kc.createRegisterUrl(options);
                    universalLinks.subscribe('keycloak' , function(event) {
                        universalLinks.unsubscribe('keycloak');
                        window.cordova.plugins.browsertab.close();
                        var oauth = parseCallback(event.url);
                        processCallback(oauth, promise);
                    });
                    window.cordova.plugins.browsertab.openUrl(registerUrl);
                    return promise.promise;

                },

                accountManagement : function() {
                    var accountUrl = kc.createAccountUrl();
                    if (typeof accountUrl !== 'undefined') {
                        window.cordova.plugins.browsertab.openUrl(accountUrl);
                    } else {
                        throw "Not supported by the OIDC server";
                    }
                },

                redirectUri: function(options) {
                    if (options && options.redirectUri) {
                        return options.redirectUri;
                    } else if (kc.redirectUri) {
                        return kc.redirectUri;
                    } else {
                        return "http://localhost";
                    }
                }
            }
        }

        throw 'invalid adapter type: ' + type;
    }

    var LocalStorage = function() {
        if (!(this instanceof LocalStorage)) {
            return new LocalStorage();
        }

        localStorage.setItem('kc-test', 'test');
        localStorage.removeItem('kc-test');

        var cs = this;

        function clearExpired() {
            var time = new Date().getTime();
            for (var i = 0; i < localStorage.length; i++)  {
                var key = localStorage.key(i);
                if (key && key.indexOf('kc-callback-') == 0) {
                    var value = localStorage.getItem(key);
                    if (value) {
                        try {
                            var expires = JSON.parse(value).expires;
                            if (!expires || expires < time) {
                                localStorage.removeItem(key);
                            }
                        } catch (err) {
                            localStorage.removeItem(key);
                        }
                    }
                }
            }
        }

        cs.get = function(state) {
            if (!state) {
                return;
            }

            var key = 'kc-callback-' + state;
            var value = localStorage.getItem(key);
            if (value) {
                localStorage.removeItem(key);
                value = JSON.parse(value);
            }

            clearExpired();
            return value;
        };

        cs.add = function(state) {
            clearExpired();

            var key = 'kc-callback-' + state.state;
            state.expires = new Date().getTime() + (60 * 60 * 1000);
            localStorage.setItem(key, JSON.stringify(state));
        };
    };

    var CookieStorage = function() {
        if (!(this instanceof CookieStorage)) {
            return new CookieStorage();
        }

        var cs = this;

        cs.get = function(state) {
            if (!state) {
                return;
            }

            var value = getCookie('kc-callback-' + state);
            setCookie('kc-callback-' + state, '', cookieExpiration(-100));
            if (value) {
                return JSON.parse(value);
            }
        };

        cs.add = function(state) {
            setCookie('kc-callback-' + state.state, JSON.stringify(state), cookieExpiration(60));
        };

        cs.removeItem = function(key) {
            setCookie(key, '', cookieExpiration(-100));
        };

        var cookieExpiration = function (minutes) {
            var exp = new Date();
            exp.setTime(exp.getTime() + (minutes*60*1000));
            return exp;
        };

        var getCookie = function (key) {
            var name = key + '=';
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return '';
        };

        var setCookie = function (key, value, expirationDate) {
            var cookie = key + '=' + value + '; '
                + 'expires=' + expirationDate.toUTCString() + '; ';
            document.cookie = cookie;
        };
    };

    function createCallbackStorage() {
        try {
            return new LocalStorage();
        } catch (err) {
        }

        return new CookieStorage();
    }

    function createLogger(fn) {
        return function() {
            if (kc.enableLogging) {
                fn.apply(console, Array.prototype.slice.call(arguments));
            }
        };
    }
}

// See: https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem
function bytesToBase64(bytes) {
    const binString = String.fromCodePoint(...bytes);
    return btoa(binString);
}

// src/index.ts

// src/notImplemented.ts
var notImplemented = () => {
  throw new Error("Not implemented");
};

// src/activeShop.ts
var EvaShopContext = host__loadShare__react__loadShare__.createContext({
  get shopId() {
    return notImplemented();
  },
  get currency() {
    return notImplemented();
  },
  get unitSystem() {
    return notImplemented();
  },
  get rentUnit() {
    return notImplemented();
  },
  get onboardingLevel() {
    return notImplemented();
  },
  get country() {
    return notImplemented();
  },
  get defaultLanguage() {
    return notImplemented();
  },
  get energyAdvisoryEnabled() {
    return notImplemented();
  },
  get automatedExposeEnabled() {
    return notImplemented();
  },
  get isCompanyOwned() {
    return notImplemented();
  }
});
function useCurrentShop() {
  return host__loadShare__react__loadShare__.useContext(EvaShopContext);
}
function useActiveShopId() {
  return host__loadShare__react_mf_2_router_mf_2_dom__loadShare__.useParams().shopId;
}
var ActivityDrawerContext = host__loadShare__react__loadShare__.createContext({
  openAppointmentDrawer: notImplemented,
  openTaskDrawer: notImplemented,
  openShareExposeDrawer: notImplemented
});
function useActivityDrawer() {
  return host__loadShare__react__loadShare__.useContext(ActivityDrawerContext);
}

// src/constants.ts
var FRAME_Z_INDEX = 1e3;
var DRAWER_Z_INDEX = 1010;
var CALLER_SCREEN_Z_INDEX = 1020;
var MODAL_Z_INDEX = 1030;
var NOTIFICATION_Z_INDEX = 1040;
var TOOLTIP_Z_INDEX = 1050;
var EmailSendingContext = host__loadShare__react__loadShare__.createContext({
  openEmailDraft: notImplemented,
  openSendEmail: notImplemented,
  openSendBulkEmail: notImplemented,
  sharePrivateOfficeListingLink: notImplemented
});
function useEmailSending() {
  return host__loadShare__react__loadShare__.useContext(EmailSendingContext);
}
var DEFAULT_LANG = "en";
var languageMatchRegex = /^\/([a-zA-Z]{2}(?:-[A-Z]{2})?)(?:\/.*)?$/;
function getLocale() {
  const urlLanguageMatch = languageMatchRegex.exec(location.pathname);
  return urlLanguageMatch?.[1] ?? DEFAULT_LANG;
}
function useLocale() {
  return host__loadShare__react__loadShare__.useMemo(() => getLocale(), []);
}
var MIN_TOKEN_VALIDITY = 60;
var KeycloakContext = React.createContext({});
var keycloak;
function setupKeycloak(options) {
  if (keycloak) {
    console.error("Keycloak is already initialized");
    return keycloak;
  }
  keycloak = new Keycloak(options);
  return keycloak;
}
async function getKeycloakToken() {
  await keycloak.updateToken(MIN_TOKEN_VALIDITY);
  return keycloak.token;
}
function useJwtToken() {
  const jwtToken = host__loadShare__react__loadShare__.useContext(KeycloakContext);
  return { jwtToken };
}
function signOut() {
  return keycloak.logout();
}
var SnackBarContext = host__loadShare__react__loadShare__.createContext({
  openSnackBar: notImplemented,
  closeSnackBar: notImplemented,
  openErrorDialog: notImplemented
});
var useSnackBars = () => host__loadShare__react__loadShare__.useContext(SnackBarContext);
var TwilioContext = host__loadShare__react__loadShare__.createContext({
  canCallInAnyShop: false,
  outgoingCall: notImplemented,
  destroyTwilioSession: notImplemented,
  updateTwilioSessionStatus: notImplemented,
  twilioSession: void 0,
  hasActiveShopCallingEnabled: false,
  openEmptyCallPopover: notImplemented
});
function useCalling() {
  return host__loadShare__react__loadShare__.useContext(TwilioContext).outgoingCall;
}
var UIContext = host__loadShare__react__loadShare__.createContext({
  isAnyDrawerOpen: false,
  setDrawerOpen: notImplemented,
  getIsDrawerOpen: notImplemented,
  breadcrumb: { current: "", breadcrumbs: [] },
  setBreadcrumb: notImplemented,
  clearBreadcrumb: notImplemented,
  isLayoutDeactivated: false,
  deactivateLayout: notImplemented,
  get desktopTopBarHeight() {
    return notImplemented();
  },
  get mobileTopBarHeight() {
    return notImplemented();
  },
  openPopovers: [],
  setOpenPopovers: notImplemented
});
var cnt = 0;
function useDrawer(name) {
  const id = host__loadShare__react__loadShare__.useMemo(() => `${name}-${cnt++}`, [name]);
  const { getIsDrawerOpen, setDrawerOpen } = host__loadShare__react__loadShare__.useContext(UIContext);
  const setOpenRef = host__loadShare__react__loadShare__.useRef(setDrawerOpen);
  setOpenRef.current = setDrawerOpen;
  const isOpen = getIsDrawerOpen(id);
  const setOpen = host__loadShare__react__loadShare__.useCallback((open) => setOpenRef.current(id, open), [id]);
  host__loadShare__react__loadShare__.useEffect(() => {
    return () => setOpen(false);
  }, [setOpen]);
  return [isOpen, setOpen];
}
function useBreadcrumb() {
  const { breadcrumb, setBreadcrumb, clearBreadcrumb } = host__loadShare__react__loadShare__.useContext(UIContext);
  return { breadcrumb, setBreadcrumb, clearBreadcrumb };
}
function useDeactivateLayout() {
  const { deactivateLayout, isLayoutDeactivated } = host__loadShare__react__loadShare__.useContext(UIContext);
  return { deactivateLayout, isLayoutDeactivated };
}
function useTopBarHeight() {
  const { desktopTopBarHeight, mobileTopBarHeight } = host__loadShare__react__loadShare__.useContext(UIContext);
  return { desktopTopBarHeight, mobileTopBarHeight };
}
var WhatsAppContext = host__loadShare__react__loadShare__.createContext({
  openShareWhatsAppExposePrivately: notImplemented
});
function useWhatsApp() {
  return host__loadShare__react__loadShare__.useContext(WhatsAppContext);
}

const index = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    ActivityDrawerContext,
    CALLER_SCREEN_Z_INDEX,
    DEFAULT_LANG,
    DRAWER_Z_INDEX,
    DefaultPrivacyLevel,
    EmailSendingContext,
    EvaShopContext,
    FRAME_Z_INDEX,
    KeycloakContext,
    MODAL_Z_INDEX,
    NOTIFICATION_Z_INDEX,
    SnackBarContext,
    TOOLTIP_Z_INDEX,
    TwilioContext,
    UIContext,
    WhatsAppContext,
    datadogRum,
    getKeycloakToken,
    getLocale,
    languageMatchRegex,
    setupKeycloak,
    signOut,
    useActiveShopId,
    useActivityDrawer,
    useBreadcrumb,
    useCalling,
    useCurrentShop,
    useDeactivateLayout,
    useDrawer,
    useEmailSending,
    useJwtToken,
    useLocale,
    useSnackBars,
    useTopBarHeight,
    useWhatsApp
}, Symbol.toStringTag, { value: 'Module' }));

export { jsonStringify as $, noop as A, instrumentMethod as B, CENSORED_STRING_MARK as C, ActionType as D, ExperimentalFeature as E, instrumentSetter as F, requestIdleCallback as G, getMutationObserverConstructor as H, monitor as I, getParentNode as J, sendToExtension as K, addRecord as L, getSegmentsCount as M, NodePrivacyLevel as N, addSegment as O, PRIVACY_ATTR_VALUE_HIDDEN as P, addWroteData as Q, RumEventType as R, isPageExitReason as S, clearTimeout$1 as T, setTimeout$1 as U, ONE_SECOND as V, addTelemetryMetrics as W, getEventBridge as X, createHttpRequest as Y, canUseEventBridge as Z, addTelemetryDebug as _, shouldMaskAttribute as a, objectEntries as a0, buildTags as a1, currentDrift as a2, getGlobalObject as a3, display as a4, clocksNow as a5, clocksOrigin as a6, monitorError as a7, index as a8, buildUrl as b, CENSORED_IMG_MARK as c, sanitizeIfLongDataUrl as d, getNodeSelfPrivacyLevel as e, PRIVACY_ATTR_NAME as f, getTextContent as g, hasChildNodes as h, isSafari as i, isNodeShadowRoot as j, forEachChildNodes as k, isElementNode as l, getScrollX as m, getScrollY as n, elapsed as o, getViewportDimension as p, isExperimentalFeatureEnabled as q, reducePrivacyLevel as r, shouldMaskNode as s, timeStampNow as t, isNodeShadowHost as u, throttle as v, addEventListeners as w, getNodePrivacyLevel as x, addEventListener as y, initViewportObservable as z };
