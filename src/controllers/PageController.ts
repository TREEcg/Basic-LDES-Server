
export async function usePageOfSource(req, res) {
    const sourceMap = res.locals.sourceMap;
    const path = "/" + req.params[0];

    if(sourceMap.has(path)) {
        const source = sourceMap.get(path);

        const id = req.params.id;
        const page = await source.getPage(id);

        const s = await page.getSerializedPage('text/turtle');
        s.pipe(res);
    }
    else {
        //console.error(`The endpoint ${path} does not exist`)
        res.status(404).send(`The endpoint ${path} does not exist`)
    }
    
}