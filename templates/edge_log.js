addEventListener("fetch", function (event) {
    event.respondWith(_handleEdgeLog(event));
});

async function _doEdgeLog(data, writer) {
    let resp = await fetch("http://default.ialicdn.com/log",
        {
            method: "POST",
            body: data,
            headers: [["content-type", "application/json"]]
        });
    console.log("logged");
    {
        let stream = new BufferStream("++++++++++++++++++++++++++++++\n");
        await stream.pipeTo(writer, {preventClose: true});
    }
    await resp.body.pipeTo(writer);
}

/**
 * Example Input
 * @param {Event} request url
 * @param  {JSON} Object
 */
async function _handleEdgeLog(event, json) {
    let start = Date.now();
    let resp = await fetch("http://default.ialicdn.com", {
        method: event.request.method,
        headers: event.request.headers,
        body: json.body
    });
    // Get a promise that is fired when we send out everything
    let {readable, writable} = new TransformStream();
    // (1) first let the fetch request's response goes back and then we post
    //     the log back as well internally
    let endPromise = resp.body.pipeTo(writable, {preventClose: true});
    // (2) wait for endPromise to be fired to make sure that the body has been
    //     piped back to the client, and then we do the log
    event.waitUntil(endPromise.then(
        (v) => {
            let end = Date.now();
            let diff = (end - start);
            try {
                // You have to await your async promise since wait until is not
                // usable currently maybe. User can use wait until only before
                // returning the main request for now
                event.waitUntil(_doEdgeLog(`{ "cost(millisecond)" : ${diff} }`, writable));
            } catch (e) {
                console.error(`${e}`);
            }
        },
        (v) => {
            writable.abort();
            console.error("failed");
        }));
    console.error("XXXX");
    // return the response back
    return new Response(readable, {
        status: resp.status,
        headers: resp.headers
    });
}