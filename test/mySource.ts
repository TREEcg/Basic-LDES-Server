import {Source} from "../src";
import {Page} from "../src/lib/Page";
import type * as RDF from 'rdf-js';
import { literal, namedNode, quad } from '@rdfjs/data-model';

export class mySource extends Source {
    private config: object;

    constructor (config: string) {
        super();
        this.parseConfig(config);
    }

    parseConfig(config: string) {
        this.config = {
            "entrypoint": "https://apidg.gent.be/opendata/adlib2eventstream/v1/dmg/objecten",
            "queryparam": "generatedAtTime"
        }
    }

    getPage(id: any): Page {
        // TODO: fetch API

        const test = quad(namedNode('http://example.org/A'), namedNode('http://example.org/B'), namedNode('http://example.org/C'));
        const testArray : RDF.Quad[] = [];
        testArray.push(test);

        const p = new Page(testArray, []);
        return p;
    }

}