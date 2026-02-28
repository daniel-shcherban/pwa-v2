import { Y as createHttpRequest, $ as jsonStringify, a0 as objectEntries, _ as addTelemetryDebug, a1 as buildTags, a2 as currentDrift, y as addEventListener, a3 as getGlobalObject, a4 as display, U as setTimeout, a5 as clocksNow, T as clearTimeout, o as elapsed, a6 as clocksOrigin, a7 as monitorError } from './index-B2sskZhK.js';
import './preload-helper-C7Zd8gLW.js';
import './host__loadShare__react__loadShare__-Cshx09tR.js';
import './_commonjsHelpers-BAGoDD49.js';
import './host__mf_v__runtimeInit__mf_v__-CjaOuR8C.js';

function createFormDataTransport(configuration, lifeCycle, createEncoder, streamId) {
    const reportError = (error) => {
        lifeCycle.notify(14 /* LifeCycleEventType.RAW_ERROR_COLLECTED */, { error });
        // monitor-until: forever, to keep an eye on the errors reported to customers
        addTelemetryDebug('Error reported to customer', { 'error.message': error.message });
    };
    const httpRequest = createHttpRequest([configuration.profilingEndpointBuilder], reportError);
    const encoder = createEncoder(streamId);
    return {
        async send({ event, ...attachments }) {
            const formData = new FormData();
            const serializedEvent = jsonStringify(event);
            if (!serializedEvent) {
                throw new Error('Failed to serialize event');
            }
            formData.append('event', new Blob([serializedEvent], { type: 'application/json' }), 'event.json');
            let bytesCount = serializedEvent.length;
            for (const [key, value] of objectEntries(attachments)) {
                const serializedValue = jsonStringify(value);
                if (!serializedValue) {
                    throw new Error('Failed to serialize attachment');
                }
                const result = await encode(encoder, serializedValue);
                bytesCount += result.outputBytesCount;
                formData.append(key, new Blob([result.output]), key);
            }
            httpRequest.send({
                data: formData,
                bytesCount,
            });
        },
    };
}
function encode(encoder, data) {
    return new Promise((resolve) => {
        encoder.write(data);
        encoder.finish((encoderResult) => {
            resolve(encoderResult);
        });
    });
}

/**
 * Counts number of samples when the thread was not idle (stackId is defined)
 *
 * @param samples - Array of collected samples
 * @returns Number of samples
 */
function getNumberOfSamples(samples) {
    let numberOfSamples = 0;
    for (const sample of samples) {
        if (sample.stackId !== undefined) {
            numberOfSamples++;
        }
    }
    return numberOfSamples;
}

// This is the regex used to extract the path from the url (from SimpleUrlGroupingProcessor.java)
// It's a bit different from the one in the java code because we removed the lookbehind unsupported by Safari.
const PATH_MIXED_ALPHANUMERICS = /\/(?![vV]\d{1,2}\/)([^/\d?]*\d+[^/?]*)/g;
function getDefaultViewName(viewPathUrl) {
    if (!viewPathUrl) {
        return '/';
    }
    // Replace all the mixed alphanumerics with a ?
    return viewPathUrl.replace(PATH_MIXED_ALPHANUMERICS, '/?');
}

const getCustomOrDefaultViewName = (customViewName, viewPathUrl) => customViewName || getDefaultViewName(viewPathUrl);

/**
 * Builds attributes for the Profile Event.
 *
 * @param profilerTrace - Profiler trace
 * @param applicationId - application id.
 * @param sessionId - session id.
 * @returns Additional attributes.
 */
function buildProfileEventAttributes(profilerTrace, applicationId, sessionId) {
    // Extract view ids and names from the profiler trace and add them as attributes of the profile event.
    // This will be used to filter the profiles by @view.id and/or @view.name.
    const { ids, names } = extractViewIdsAndNames(profilerTrace.views);
    const longTaskIds = profilerTrace.longTasks.map((longTask) => longTask.id).filter((id) => id !== undefined);
    const attributes = { application: { id: applicationId } };
    if (sessionId) {
        attributes.session = { id: sessionId };
    }
    if (ids.length) {
        attributes.view = { id: ids, name: names };
    }
    if (longTaskIds.length) {
        attributes.long_task = { id: longTaskIds };
    }
    return attributes;
}
function extractViewIdsAndNames(views) {
    const result = { ids: [], names: [] };
    for (const view of views) {
        result.ids.push(view.viewId);
        if (view.viewName) {
            result.names.push(view.viewName);
        }
    }
    // Remove duplicates
    result.names = Array.from(new Set(result.names));
    return result;
}

function assembleProfilingPayload(profilerTrace, configuration, sessionId) {
    const event = buildProfileEvent(profilerTrace, configuration, sessionId);
    return {
        event,
        'wall-time.json': profilerTrace,
    };
}
function buildProfileEvent(profilerTrace, configuration, sessionId) {
    const tags = buildTags(configuration); // TODO: get that from the tagContext hook
    const profileAttributes = buildProfileEventAttributes(profilerTrace, configuration.applicationId, sessionId);
    const profileEventTags = buildProfileEventTags(tags);
    const profileEvent = {
        ...profileAttributes,
        attachments: ['wall-time.json'],
        start: new Date(profilerTrace.startClocks.timeStamp).toISOString(),
        end: new Date(profilerTrace.endClocks.timeStamp).toISOString(),
        family: 'chrome',
        runtime: 'chrome',
        format: 'json',
        version: 4, // Ingestion event version (not the version application tag)
        tags_profiler: profileEventTags.join(','),
        _dd: {
            clock_drift: currentDrift(),
        },
    };
    return profileEvent;
}
/**
 * Builds tags for the Profile Event.
 *
 * @param tags - RUM tags
 * @returns Combined tags for the Profile Event.
 */
function buildProfileEventTags(tags) {
    // Tags already contains the common tags for all events. (service, env, version, etc.)
    // Here we are adding some specific-to-profiling tags.
    const profileEventTags = tags.concat(['language:javascript', 'runtime:chrome', 'family:chrome', 'host:browser']);
    return profileEventTags;
}

const DEFAULT_RUM_PROFILER_CONFIGURATION = {
    sampleIntervalMs: 10, // Sample stack trace every 10ms
    collectIntervalMs: 60000, // Collect data every minute
    minProfileDurationMs: 5000, // Require at least 5 seconds of profile data to reduce noise and cost
    minNumberOfSamples: 50, // Require at least 50 samples (~500 ms) to report a profile to reduce noise and cost
};
function createRumProfiler(configuration, lifeCycle, session, profilingContextManager, longTaskContexts, createEncoder, viewHistory, profilerConfiguration = DEFAULT_RUM_PROFILER_CONFIGURATION) {
    const transport = createFormDataTransport(configuration, lifeCycle, createEncoder, 6 /* DeflateEncoderStreamId.PROFILING */);
    let lastViewEntry;
    // Global clean-up tasks for listeners that are not specific to a profiler instance (eg. visibility change, before unload)
    const globalCleanupTasks = [];
    let instance = { state: 'stopped', stateReason: 'initializing' };
    // Stops the profiler when session expires
    lifeCycle.subscribe(9 /* LifeCycleEventType.SESSION_EXPIRED */, () => {
        stopProfiling('session-expired');
    });
    // Start the profiler again when session is renewed
    lifeCycle.subscribe(10 /* LifeCycleEventType.SESSION_RENEWED */, () => {
        if (instance.state === 'stopped' && instance.stateReason === 'session-expired') {
            start();
        }
    });
    // Public API to start the profiler.
    function start() {
        if (instance.state === 'running') {
            return;
        }
        const viewEntry = viewHistory.findView();
        // Add initial view
        // Note: `viewEntry.name` is only filled when users use manual view creation via `startView` method.
        lastViewEntry = viewEntry
            ? {
                startClocks: viewEntry.startClocks,
                viewId: viewEntry.id,
                viewName: getCustomOrDefaultViewName(viewEntry.name, document.location.pathname),
            }
            : undefined;
        // Add global clean-up tasks for listeners that are not specific to a profiler instance (eg. visibility change, before unload)
        globalCleanupTasks.push(addEventListener(configuration, window, "visibilitychange" /* DOM_EVENT.VISIBILITY_CHANGE */, handleVisibilityChange).stop, addEventListener(configuration, window, "beforeunload" /* DOM_EVENT.BEFORE_UNLOAD */, handleBeforeUnload).stop);
        // Start profiler instance
        startNextProfilerInstance();
    }
    // Public API to manually stop the profiler.
    function stop() {
        stopProfiling('stopped-by-user');
    }
    function stopProfiling(reason) {
        // Stop current profiler instance (data collection happens async in background)
        stopProfilerInstance(reason);
        // Cleanup global listeners
        globalCleanupTasks.forEach((task) => task());
        // Update Profiling status once the Profiler has been stopped.
        profilingContextManager.set({ status: 'stopped', error_reason: undefined });
    }
    /**
     * Whenever a new Profiler instance is started, we need to add event listeners to surroundings (RUM Events, Long Tasks, etc) to enrich the Profiler data.
     * If the instance is already running, we can keep the same event listeners.
     */
    function addEventListeners(existingInstance) {
        if (existingInstance.state === 'running') {
            // Instance is already running, so we can keep same event listeners.
            return {
                cleanupTasks: existingInstance.cleanupTasks,
            };
        }
        // Store clean-up tasks for this instance (tasks to be executed when the Profiler is stopped or paused.)
        const cleanupTasks = [];
        // Whenever the View is updated, we add a views entry to the profiler instance.
        const viewUpdatedSubscription = lifeCycle.subscribe(2 /* LifeCycleEventType.VIEW_CREATED */, (view) => {
            const viewEntry = {
                viewId: view.id,
                // Note: `viewName` is only filled when users use manual view creation via `startView` method.
                viewName: getCustomOrDefaultViewName(view.name, document.location.pathname),
                startClocks: view.startClocks,
            };
            collectViewEntry(viewEntry);
            // Update last view entry
            lastViewEntry = viewEntry;
        });
        cleanupTasks.push(viewUpdatedSubscription.unsubscribe);
        return {
            cleanupTasks,
        };
    }
    function startNextProfilerInstance() {
        // These APIs might be unavailable in some browsers
        const globalThisProfiler = getGlobalObject().Profiler;
        if (!globalThisProfiler) {
            profilingContextManager.set({ status: 'error', error_reason: 'not-supported-by-browser' });
            throw new Error('RUM Profiler is not supported in this browser.');
        }
        // Collect data from previous running instance (fire-and-forget)
        if (instance.state === 'running') {
            collectProfilerInstance(instance);
        }
        const { cleanupTasks } = addEventListeners(instance);
        let profiler;
        try {
            // We have to create new Profiler each time we start a new instance
            profiler = new globalThisProfiler({
                sampleInterval: profilerConfiguration.sampleIntervalMs,
                // Keep buffer size at 1.5 times of minimum required to collect data for a profiling instance
                maxBufferSize: Math.round((profilerConfiguration.collectIntervalMs * 1.5) / profilerConfiguration.sampleIntervalMs),
            });
        }
        catch (e) {
            if (e instanceof Error && e.message.includes('disabled by Document Policy')) {
                // Missing Response Header (`js-profiling`) that is required to enable the profiler.
                // We should suggest the user to enable the Response Header in their server configuration.
                display.warn('[DD_RUM] Profiler startup failed. Ensure your server includes the `Document-Policy: js-profiling` response header when serving HTML pages.', e);
                profilingContextManager.set({ status: 'error', error_reason: 'missing-document-policy-header' });
            }
            else {
                profilingContextManager.set({ status: 'error', error_reason: 'unexpected-exception' });
            }
            return;
        }
        profilingContextManager.set({ status: 'running', error_reason: undefined });
        // Kick-off the new instance
        instance = {
            state: 'running',
            startClocks: clocksNow(),
            profiler,
            timeoutId: setTimeout(startNextProfilerInstance, profilerConfiguration.collectIntervalMs),
            views: [],
            cleanupTasks,
            longTasks: [],
        };
        // Add last view entry
        collectViewEntry(lastViewEntry);
        // Add event handler case we overflow the buffer
        profiler.addEventListener('samplebufferfull', handleSampleBufferFull);
    }
    function collectProfilerInstance(runningInstance) {
        // Cleanup instance
        clearTimeout(runningInstance.timeoutId);
        runningInstance.profiler.removeEventListener('samplebufferfull', handleSampleBufferFull);
        // Store instance data snapshot in local variables to use in async callback
        const { startClocks, views } = runningInstance;
        // Stop current profiler to get trace
        runningInstance.profiler
            .stop()
            .then((trace) => {
            const endClocks = clocksNow();
            const duration = elapsed(startClocks.timeStamp, endClocks.timeStamp);
            const longTasks = longTaskContexts.findLongTasks(startClocks.relative, duration);
            const isBelowDurationThreshold = duration < profilerConfiguration.minProfileDurationMs;
            const isBelowSampleThreshold = getNumberOfSamples(trace.samples) < profilerConfiguration.minNumberOfSamples;
            if (longTasks.length === 0 && (isBelowDurationThreshold || isBelowSampleThreshold)) {
                // Skip very short profiles to reduce noise and cost, but keep them if they contain long tasks.
                return;
            }
            handleProfilerTrace(
            // Enrich trace with time and instance data
            Object.assign(trace, {
                startClocks,
                endClocks,
                clocksOrigin: clocksOrigin(),
                longTasks,
                views,
                sampleInterval: profilerConfiguration.sampleIntervalMs,
            }));
        })
            .catch(monitorError);
    }
    function stopProfilerInstance(stateReason) {
        if (instance.state === 'paused') {
            // If paused, profiler data was already collected during pause, just update state
            instance = { state: 'stopped', stateReason };
            return;
        }
        if (instance.state !== 'running') {
            return;
        }
        // Capture the running instance before changing state
        const runningInstance = instance;
        // Update state synchronously so SESSION_RENEWED check works immediately
        instance = { state: 'stopped', stateReason };
        // Cleanup instance-specific tasks (e.g., view listener)
        runningInstance.cleanupTasks.forEach((cleanupTask) => cleanupTask());
        // Collect and send profile data in background - doesn't block state transitions
        collectProfilerInstance(runningInstance);
    }
    function pauseProfilerInstance() {
        if (instance.state !== 'running') {
            return;
        }
        // Capture the running instance before changing state
        const runningInstance = instance;
        // Update state synchronously
        instance = { state: 'paused' };
        // Cleanup instance-specific tasks
        runningInstance.cleanupTasks.forEach((cleanupTask) => cleanupTask());
        // Collect and send profile data in background
        collectProfilerInstance(runningInstance);
    }
    function collectViewEntry(viewEntry) {
        if (instance.state !== 'running' || !viewEntry) {
            return;
        }
        // Add entry to views
        instance.views.push(viewEntry);
    }
    function handleProfilerTrace(trace) {
        var _a;
        // Find current session to assign it to the Profile.
        const sessionId = (_a = session.findTrackedSession()) === null || _a === void 0 ? void 0 : _a.id;
        const payload = assembleProfilingPayload(trace, configuration, sessionId);
        void transport.send(payload);
    }
    function handleSampleBufferFull() {
        startNextProfilerInstance();
    }
    function handleVisibilityChange() {
        if (document.visibilityState === 'hidden' && instance.state === 'running') {
            // Pause when tab is hidden. We use paused state to distinguish between
            // paused by visibility change and stopped by user.
            // If profiler is paused by the visibility change, we should resume when
            // tab becomes visible again. That's not the case when user stops the profiler.
            pauseProfilerInstance();
        }
        else if (document.visibilityState === 'visible' && instance.state === 'paused') {
            // Resume when tab becomes visible again
            startNextProfilerInstance();
        }
    }
    function handleBeforeUnload() {
        // `unload` can in some cases be triggered while the page is still active (link to a different protocol like mailto:).
        // We can immediately flush (by starting a new profiler instance) to make sure we receive the data, and at the same time keep the profiler active.
        // In case of the regular unload, the profiler will be shut down anyway.
        startNextProfilerInstance();
    }
    function isStopped() {
        return instance.state === 'stopped';
    }
    function isRunning() {
        return instance.state === 'running';
    }
    function isPaused() {
        return instance.state === 'paused';
    }
    return { start, stop, isStopped, isRunning, isPaused };
}

export { DEFAULT_RUM_PROFILER_CONFIGURATION, createRumProfiler };
