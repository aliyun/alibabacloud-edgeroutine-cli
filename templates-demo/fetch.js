addEventListener("fetch", function(event) {
    event.respondWith(_handleFetch(event));
});
/**
 * @param  {JSON} Object {"url":"xxx"}
 */
async function _handleFetch(json) {
    let fetchURL = json.url;
    if (fetchURL) {
        return await fetch(fetchURL);
    }
    return fetch("http://default.ialicdn.com");
}