addEventListener("fetch", function(event) {
    event.respondWith(_handlePrefetch(event));
});
async function _fetchAndIgnore(url) {
    try {
        // Specify cdnProxy flag to make sure the request goes through the CDN
        let resp = await fetch(url);//, {cdnProxy: true});
        // Make sure to ignore the content otherwise the cache may not be valid
        await resp.ignore();
    } catch (e) {
        console.error("invalid URL: %s", url);
    }
}
async function _doPrefetchURLAsync(prefetchURL, event) {
    for (const url of prefetchURL) {
        event.waitUntil(_fetchAndIgnore(url));
    }
}
/**
 * Respond with new Response
 * @param {Event}
 * @param {JSON} Object {"xxx":"xxx"}
 */

async function _handlePrefetch(event, json) {
    {
        const prefetchURL = json.prefetch;
        if (prefetchURL) {
            // Do not await it and let it run in background
            _doPrefetchURLAsync(prefetchURL, event);
            return new Response("Done Prefetch");
        }
    }
    return new Response("Miss Prefetch");
}