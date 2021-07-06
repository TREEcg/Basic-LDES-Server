import { IPage } from '../util/Util';
import type * as RDF from 'rdf-js';
import rdfSerializer from "rdf-serialize";
import * as f from "@dexagod/rdf-retrieval"

import {triple} from "@rdfjs/data-model";

import streamifyArray from 'streamify-array';

export class Page implements IPage {
    private triples: RDF.Quad[];
    private metadata: RDF.Quad[];

    constructor(triples: RDF.Quad[], metadata: RDF.Quad[]) {
        this.triples = triples;
        this.metadata = metadata;
    }
    getMetadata(): RDF.Quad[] {
        return this.metadata;
    }

    getTriples(): RDF.Quad[] {
        return this.triples;
    }

    async getSerializedPage(contentType: string = "text/turtle"):  Promise<NodeJS.ReadableStream> {
        const tripleStream : RDF.Stream<RDF.Quad> = await f.quadArrayToQuadStream(this.getTriples());
        //tripleStream.on('data', (e) => console.log(e))
        //const metadataStream = streamifyArray(this.getMetadata());
        //const stream = tripleStream.concat(metadataStream);

        return rdfSerializer.serialize(tripleStream, {contentType: contentType});
    }
}