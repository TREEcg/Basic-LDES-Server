import { IPage } from '../util/Util';
import type * as RDF from 'rdf-js';
import * as RdfString from "rdf-string";
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
        let all:RDF.Quad[] = this.getMetadata();
        all = all.concat(this.getTriples());
        const tripleStream : RDF.Stream<RDF.Quad> = await f.quadArrayToQuadStream(all);

        return rdfSerializer.serialize(tripleStream, {contentType: contentType});
    }

    public serialize(): object {
        let serialized: object = {}
        let triples = []
        let metadata = []

        this.triples.forEach(triple => {triples.push(RdfString.quadToStringQuad(triple))})
        serialized['triples'] = triples;
        this.metadata.forEach(metadata_quad => {metadata.push(RdfString.quadToStringQuad(metadata_quad))})
        serialized['metadata'] = metadata;
        return serialized;
    }
}