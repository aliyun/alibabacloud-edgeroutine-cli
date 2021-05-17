addEventListener("fetch", function(event) {
    event.respondWith(_handleABTest(event));
});

function _shouldDoABTest(request) {
    // (1) if request's user agent match a certain string
    {
        const ua = request.headers.get("user-agent");
        if (ua && ua.match(/canary-client/)) {
            return true;
        }
    }
    // (2) whether we have special header
    {
        return request.headers.has("x-ab-test");
    }
}

async function _handleABTest(event, json) {
    const fetchInit = {
        method : event.request.method,
        headers: event.request.headers,
        body : "empty"
    };
    if (_shouldDoABTest(event.request)) {
        return fetch("http://default.ialicdn.com/dev", fetchInit);
    } else {
        return fetch("http://default.ialicdn.com", fetchInit);
    }
}