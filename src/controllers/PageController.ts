
export async function usePageOfSource(req, res) {
    //const source = res.locals.source;
    const sources = res.locals.sources;
    //console.log(req.path)
    //console.log(req.params[0])
    const path = "/" + req.params[0];

    if(sources.has(path)) {
        const source = sources.get(path);

        const id = req.params.id;
        const page = await source.getPage(id);


        const s = await page.getSerializedPage('text/turtle');
        s.pipe(res);
        //res.write(await page.getSerializedPage('text/turtle'));
    }
    else {
        //console.error(`The endpoint ${path} does not exist`)
        res.status(500).send(`The endpoint ${path} does not exist`)
    }
    
}