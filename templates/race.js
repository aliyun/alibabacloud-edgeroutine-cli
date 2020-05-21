addEventListener("fetch", function(event) {
    event.respondWith(_handleRace(event));
});
/**
 * Respond with new Prpmise.race/string
 * @param  {JSON} Object {"fetchList":["","",""]}
 */
async function _handleRace(event, json) {
    let fetchList = json.fetchList;
    if (fetchList) {
        return Promise.race(fetchList.map((x) => fetch(x)));
    } else {
        return "forget to include fetchList field in your JSON";
    }
}