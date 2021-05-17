addEventListener("fetch", function(event) {
    event.respondWith(_handleGeo(event));
});
/**
 * Need to configure Edge jsSession in config.js
 * @param {Event} Object  This is Edge jsSession in config.js
 */

async function _handleGeo(event) {
    const info = event.info;
    let remote_addr = info.remote_addr;
    let ip_isp_en = info.ip_isp;
    let ip_city_en = info.ip_city;
    let ip_region_en = info.ip_region;
    let ip_country_en = info.ip_country;
    let scheme = info.scheme;
    let detector_device = info.detector_device;
    let content = `Geo: ${remote_addr}, \
                      ${ip_isp_en},   \
                      ${ip_country_en},   \
                      ${ip_city_en},  \
                      ${ip_region_en},\
                      ${scheme},      \
                      ${detector_device}`;
    return new Response(content);
}