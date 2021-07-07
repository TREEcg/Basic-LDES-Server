import { Source } from "..";

const express = require('express')
const app = express()

let source: Source;

import { usePageOfSource } from '../controllers/PageController';

export class ExpressHttpServerFactory {
    private readonly variableParams: any;
    private readonly sourceMap: Map<String, Source>;

    constructor(sourceMap: Map<String, Source>, variableParams: any = { port: 3000 }) {
        this.sourceMap = sourceMap;
        this.variableParams = variableParams;
        app.set('sourceMap', sourceMap);

        app.use(this.loadSourceMap);
        app.get('/*/:id', usePageOfSource);
    }

    public start(): any {
        console.log("Starting on port: " + this.variableParams.port)
        return app.listen(this.variableParams.port);
    }

    public loadSourceMap(req, res, next) {
        res.locals.sourceMap = app.get('sourceMap');
        next();
    }
}
