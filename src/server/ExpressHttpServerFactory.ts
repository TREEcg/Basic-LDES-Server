import {Source} from "..";

const express = require('express')
const app = express()

let source: Source;

import { usePageOfSource } from '../controllers/PageController';

export class ExpressHttpServerFactory {
    private readonly variableParams: any;
    private readonly source: any;

    constructor (source: Source, variableParams: any = { port: 3000 }) {
        this.source = source;
        this.variableParams = variableParams;
        app.set('source', source);

        app.use(this.decideWhichSource);
        app.get('/:id', usePageOfSource);

    }
    public start(): any {
        console.log("Starting on port: "+ this.variableParams.port)
        return app.listen(this.variableParams.port);
    }

    public decideWhichSource(req, res, next) {
        res.locals.source = app.get('source');
        next();
    }
}
