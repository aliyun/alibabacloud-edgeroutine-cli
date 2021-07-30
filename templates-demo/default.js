addEventListener("fetch", function(event) {
    event.respondWith(_handleHelloWorld(event));
});

async function _handleHelloWorld(event) {
    return new Response("Hello World!");
}