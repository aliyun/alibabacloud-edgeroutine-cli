/**
 * Add the necessary event listener
 * @param {Event} fetch event, {Function} async function
 */
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event));
})

/**
 * Make a response to client
 * @param {Request} request
 */
async function handleRequest(event) {
    const { request } = event;
    let { readable, writable } = new TransformStream();
    console.log(request.url);
    const polyfill = await fetch('https://i.alicdn.com/s/polyfill.min.js?features=RegeneratorRuntime');
    const assets = await fetch(request.url);
    (async (polyfill) => {
        console.log(polyfill)
        await pollyfill.body.pipeTo(writable, {preventClose: true});
        await assets.body.pipeTo(writable);
    })(polyfill);
    return new Response(readable, { status: 200 });
}

async function handleRequest(event) {
    const { request } = event;
    let { readable, writable } = new TransformStream();
    console.log(request.url);
    const polyfill = await fetch('https://i.alicdn.com/s/polyfill.min.js?features=RegeneratorRuntime');
    const assets = await fetch(request.url);
    await polyfill.body.pipeTo(writable, {preventClose: true});
    await assets.body.pipeTo(writable);
    return new Response(readable, { status: 200 });
}