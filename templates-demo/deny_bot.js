addEventListener("fetch", function(event) {
    event.respondWith(_handleDenyBot(event));
});
/**
 * Respond with fetch()
 * @param {Event} Object
 */
async function _handleDenyBot(event, json) {
    {
        const ua = event.request.headers.get("user-agent");
        if (ua && ua.match(new RegExp("xxxspider", "i"))) {
            return new Response("Forbidden", {status: 403});
        }
    }
    return fetch("http://default.ialicdn.com");
}