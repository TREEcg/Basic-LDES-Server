import {Source} from "../src";
import {Page} from "../src/lib/Page";
import type * as RDF from 'rdf-js';
import { literal, namedNode, quad } from '@rdfjs/data-model';

const fetch = require('node-fetch');
import * as f from "@dexagod/rdf-retrieval"
const rdfParser = require("rdf-parse").default;

export class mySource extends Source {

    constructor (config: object) {
        super(config);
    }

    async getPage(id: any): Promise<Page> {
        // TODO: fetch API

        // https://apidg.gent.be/opendata/adlib2eventstream/v1/dmg/objecten?generatedAtTime=2021-06-28T14:26:43.196Z
        let reqUrl = this.config["entrypoint"] + "?" + this.config["queryparam"] + "=" + id;
        let res = await this.fetchAPI(reqUrl);

        const textStream = require('streamify-string')(res);

        let r = await rdfParser.parse(textStream, { contentType: 'application/ld+json', baseIRI: this.config["entrypoint"] })
            //.on('data', (quad) => console.log(quad))
            .on('error', (error) => console.error(error))
            //.on('end', () => console.log('All done!'));


        let triples: RDF.Quad[] = await f.quadStreamToQuadArray(r)

        const p = new Page(triples, []);
        return p;
    }

    
    async fetchAPI(reqUrl: String) {
        return await fetch(reqUrl)
            .then(res => res.text())
    }
    

}