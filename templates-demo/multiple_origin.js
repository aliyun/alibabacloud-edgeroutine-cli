addEventListener("fetch", function(event) {
    event.respondWith(_handleMultipleOriginConcate(event));
});
/**
 * @param {Event} Object
 * @param {JSON} Object
 */
async function _handleMultipleOriginConcate(event, json) {
    const respInit = {
        headers: event.request.headers,
        body : json.body
    };
    // (1) We try to concate www.baidu.com and www.tmall.com together
    let {readable, writable} = new TransformStream();
    async function controller() {
        let r1 = await fetch("http://www.baidu.com");
        let r2 = await fetch("https://www.tmall.com");
        await r1.body.pipeTo(writable, {preventClose: true});
        await r2.body.pipeTo(writable);
    }
    controller();
    return new Response(readable, respInit);
}