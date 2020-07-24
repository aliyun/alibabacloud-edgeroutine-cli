addEventListener("fetch", function(event) {
    event.respondWith(_handleWAF(event));
});
/**
 * Need to configure Edge jsSession in config.js
 * @param {Event} Object  This is Edge jsSession in config.js.
 * @param {JSON}  Object {"city":""}
 */
async function _handleWAF(event, json) {
    let city = json.city;
    if (event.info.ip_city_en === city) {
        return new Response("Forbidden", {status: 403});
    }
    // back to origin
    return (JSON.stringify(event.info));
}