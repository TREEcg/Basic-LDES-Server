import { Source, Page } from '@treecg/basic-ldes-server';
import type * as RDF from 'rdf-js';
import { literal, namedNode, quad } from '@rdfjs/data-model';
import { Readable } from 'stream';

export class mySource extends Source {

    protected config: object;

    constructor(config: object) {
        super(config);
    }

    async getPage(id: any): Promise<Page> {
        // TODO: fetch API

        let triples: RDF.Quad[] = [];
        let metadata: RDF.Quad[] = [];

        triples.push(quad(namedNode("Hello"), namedNode("world!"), namedNode(`page-id: ${id}`))); // Example triple

        const p = new Page(triples, metadata);
        return p;
    }

    /*
    // Example without indexes
    async importPages(pages: Page[]): Promise<void> {
        // TODO: fetch API
        
        let triples: RDF.Quad[] = [];
        let metadata: RDF.Quad[] = [];

        const p = new Page(triples, metadata);

        let array: Page[] = [];
        array.push(p);

        super.importPages(array);
    }
    */

    // Example with indexes
    async importPages(pages: Map<string, Page>): Promise<void> {
        // TODO: fetch API

        let triples: RDF.Quad[] = [];
        let metadata: RDF.Quad[] = [];

        const p = new Page(triples, metadata);

        let map: Map<string, Page> = new Map();

        let index = 0
        map.set(index.toString(), p);
        index++;

        super.importPages(map);
    }


    getStreamIfExists(): Readable {
        let r = new Readable();

        // TODO: fetch API

        return r;
    }

}