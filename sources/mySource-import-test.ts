import { Source } from "../src";
import { Page } from "../src/lib/Page";
import type * as RDF from 'rdf-js';
import { literal, namedNode, blankNode, quad } from '@rdfjs/data-model';

const fetch = require('node-fetch');
import * as f from "@dexagod/rdf-retrieval"
import { number } from "yargs";
const rdfParser = require("rdf-parse").default;

export class mySource extends Source {

    private lastIndex: number = 0;
    constructor(config: object) {
        super(config);
    }

    /*
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

        
        // const test = quad(namedNode('http://example.org/A'), namedNode('http://example.org/B'), namedNode('http://example.org/C'));
        // const testArray : RDF.Quad[] = [];
        // testArray.push(test);

        // const p = new Page(testArray, []);
        

        const p = new Page(triples, []);
        return p;
    }
    */


    async fetchAPI(reqUrl: String) {
        return await fetch(reqUrl)
            .then(res => res.text())
    }

    /*

    // Example without index
    async importPages(pages: Page[]): Promise<void> {
        let reqUrl = this.config["entrypoint"] + "?" + this.config["queryparam"] + "=" + "2021-06-28T14:26:43.196Z";
        let res = await this.fetchAPI(reqUrl);

        const textStream = require('streamify-string')(res);

        let r = await rdfParser.parse(textStream, { contentType: 'application/ld+json', baseIRI: this.config["entrypoint"] })
            .on('error', (error: any) => console.error(error))

        let triples: RDF.Quad[] = await f.quadStreamToQuadArray(r)

        const p = new Page(triples, []);

        let array: Page[] = [p, p];

        super.importPages(array);
    }
    */

    // Example with indexex
    async importPages(pages: Map<string, Page>): Promise<void> {
        let triples: RDF.Quad[] = []
        triples.push(quad(namedNode("observation"), namedNode('sosa:observes'), literal((5).toString(),namedNode('pedestrian'))))
        triples.push(quad(namedNode("observation"), namedNode('sosa:observes'), literal('pedestrian')))
        triples.push(quad(namedNode("observation"), namedNode('sosa:observes'), blankNode('pedestrian')))

        const p = new Page(triples, []);

        let map: Map<string, Page> = new Map();
        map.set(this.lastIndex.toString(), p);
        this.lastIndex++;

        super.importPages(map);
    }

}