addEventListener("fetch", function(event) {
    event.respondWith(_handleRedirect3XX(event));
});

async function _handleRedirect3XX(event, json) {
    return fetch("http://www.taobao.com", {redirect: "follow"});
}