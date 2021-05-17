addEventListener("fetch", function(event) {
    event.respondWith(_handleResponse(event));
});
/**
 * @param  {JSON} Object {"headers":{}}
 */
async function _handleResponse(event, json) {
    let resp = await fetch("http://default.ialicdn.com");
    let headers = json.headers;
    for (var k in headers) {
        resp.headers.set(k, headers[k]);
    }
    return resp;
}