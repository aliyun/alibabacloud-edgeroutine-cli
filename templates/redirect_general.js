addEventListener("fetch", function (event) {
    event.respondWith(_handleRedirectGeneral(event));
});

/**
 * @param  {Event} Object
 * @param  {JSON} Object
 */
async function _handleRedirectGeneral(event, json) {
    const fetchInit = {
        method: event.request.method,
        body: json.body,
        headers: event.request.headers
    };
    {
        const ua = event.request.headers.get("user-agent");
        if (ua && ua.match(/firefox/i)) {
            return fetch("http://default.ialicdn.com/firefox", fetchInit);
        }
        if (ua && ua.match(/safari/i)) {
            return fetch("http://default.ialicdn.com/safari", fetchInit);
        }
    }
    {
        if (event.info.detect_device && event.info.detect_device.match(/iphone/)) {
            return fetch("http://default.ialicdn.com/iphone", fetchInit);
        }
    }
    return new Response("unknown request", {status: 403});
}