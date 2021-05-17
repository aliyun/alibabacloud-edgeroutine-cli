addEventListener("fetch", function (event) {
    event.respondWith(_handleESI(event));
});
async function subRequests(target) {
    const init = {method: 'GET'};
    let response = await fetch(target, init);
    let text = await response.text();
    return text;
}
async function handleTemplate(encoder, templateKey) {
    const linkRegex = new RegExp("esi:include.*src=@(.*)@.*", 'gm');
    let result = linkRegex.exec(templateKey);
    let esi = "unknown";
    if (!result) {
        return encoder.encode(`<${templateKey}>`);
    }
    if (result[1]) {
        esi = await subRequests(result[1]);
    }
    return encoder.encode(`${esi}`);
}
async function translate(chunks) {
    const decoder = new TextDecoder();
    let templateKey = chunks.reduce(
        (accumulator, chunk) =>
            accumulator + decoder.decode(chunk, {stream: true}), "");
    templateKey += decoder.decode();
    return handleTemplate(new TextEncoder(), templateKey);
}
async function streamTransformBody(readable, writable) {
    const startTag = "<".charCodeAt(0);
    const endTag = ">".charCodeAt(0);
    let reader = readable.getReader();
    let writer = writable.getWriter();
    let templateChunks = null;
    while (true) {
        let {done, value} = await reader.read();
        if (done) break;
        while (value.byteLength > 0) {
            if (templateChunks) {
                let end = value.indexOf(endTag);
                if (end === -1) {
                    templateChunks.push(value);
                    break;
                } else {
                    templateChunks.push(value.subarray(0, end));
                    await writer.write(await translate(templateChunks));
                    templateChunks = null;
                    value = value.subarray(end + 1);
                }
            }
            let start = value.indexOf(startTag);
            if (start === -1) {
                await writer.write(value);
                break;
            } else {
                await writer.write(value.subarray(0, start));
                value = value.subarray(start + 1);
                templateChunks = [];
            }
        }
    }
    await writer.close();
}

/**
 * Example
 * @param {JSON} Object {"xxx":"xxx","esi":"<esi:include src=@http://xxx.com@> This is after the ESI for xxx.com"}
 */
async function _handleESI(json) {
    let {readable, writable} = new TransformStream();
    let newResponse = new Response(readable);
    if (!json.esi) {
        return "forget to include template field in your JSON";
    }
    streamTransformBody(new BufferStream(json.esi), writable);
    return newResponse;
}

