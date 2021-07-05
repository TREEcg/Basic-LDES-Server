
export async function usePageOfSource(req, res) {
    const source = res.locals.source;
    const id = req.params.id;
    const page = await source.getPage(id);

    const s = await page.getSerializedPage('text/turtle');
    s.pipe(res);
    //res.write(await page.getSerializedPage('text/turtle'));
}