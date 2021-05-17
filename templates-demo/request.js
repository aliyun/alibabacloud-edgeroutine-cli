addEventListener("fetch", function(event) {
    event.respondWith(_handleRequest(event));
});
/**
 * @param {JSON} Object {"headers":{},"body":""}
 */
async function _handleRequest(json) {
    let headers = json.headers;
    let body = json.body;
    const fetchInit = {
        body : body,
        headers: headers
    };
    return fetch("http://default.ialicdn.com", fetchInit);
}