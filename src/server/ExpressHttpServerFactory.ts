import { Source } from "..";

const express = require('express')
const app = express()
const cors = require('cors');
app.use(cors());
//let source: Source;

import { usePageOfSource, tryRedirecting } from '../controllers/PageController';

export class ExpressHttpServerFactory {
    private readonly variableParams: any;
    private readonly sourceMap: Map<String, Source>;

    constructor(sourceMap: Map<String, Source>, variableParams: any = { port: 3000 }) {
        this.sourceMap = sourceMap;
        this.variableParams = variableParams;

        app.set('sourceMap', sourceMap);

        app.use(this.loadSourceMap);
        app.get('/*/:id', usePageOfSource);
        app.get('*', tryRedirecting);
    }

    public start(): any {
        console.log("Starting on port: " + this.variableParams.port)

        this.sourceMap.forEach(source => {
            //console.log(source.usesImportPages())
            if (source.usesImportPages()) {
                const interval = setInterval(() => {
                    source.importPages(null);
                }, source.getImportInterval());
            }
        })

        /*
        const interval = setInterval(() => {
            this.source.importPages(null);
        }, 5000);
        */
        //clearInterval(interval);

        //console.log("sourceMap:", this.sourceMap)
        //console.log("map:", this.variableParams)
        return app.listen(this.variableParams.port);

    }

    public loadSourceMap(req, res, next) {
        res.locals.sourceMap = app.get('sourceMap');
        next();
    }
}
