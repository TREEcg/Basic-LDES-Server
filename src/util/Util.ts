import { Readable } from 'stream';
import {Page} from "../lib/Page";
import type * as RDF from 'rdf-js';

export interface ISource {
    getStreamIfExists(): Readable | boolean;
    getPage(id: any): Promise<Page>|Page;
    importPages(pages: Page[]): void;
}

export interface IPage {
    getTriples(): RDF.Quad[];
    getMetadata(): RDF.Quad[];
}