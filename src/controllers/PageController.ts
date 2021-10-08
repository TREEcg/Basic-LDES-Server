
export async function usePageOfSource(req, res) {
    const sourceMap = res.locals.sourceMap;
    const path = "/" + req.params[0];

    if (sourceMap.has(path)) {
        const source = sourceMap.get(path);

        const id = req.params.id;
        const page = await source.getPage(id);
        if (page == null) {
            res.status(404).send(`The page with this ID does not exist`);
        } else {
            const contentType = 'text/turtle'
            const s = await page.getSerializedPage(contentType);
            res.setHeader("Content-Type", contentType);
            if (page.isImmutable) res.setHeader("Cache-Control", "public, max-age=31536000, immutable")
            s.pipe(res);
        }
    }
    else {
        tryRedirecting(req, res);
    }
}

// When no id has been given for an endpoint /enpoint(/:id)
// Try to redirect to the last entry
export function tryRedirecting(req, res) {
    const sourceMap = res.locals.sourceMap;
    let path = req.params[0];
    if (req.params.id) path = '/' + req.params[0] + req.params.id;
    if (sourceMap.has(path)) {
        const source = sourceMap.get(path);
        let finalEntry = 1; // default
        if (source.getFinalEntry)  finalEntry = source.getFinalEntry();

        res.redirect(path + '/' + finalEntry)
    } else {
        res.status(404).send(`The endpoint ${path} does not exist`);
    }

}
