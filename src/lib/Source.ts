import type { ISource } from '../util/Util';
import { Page } from "./Page";
import { Readable } from 'stream';

import type * as RDF from 'rdf-js';
import { literal, namedNode, quad } from '@rdfjs/data-model';
import { DatabaseFactory } from '../models/DatabaseFactory';

// Database
//const db = require('../config/database')
//const DatabaseModel = require('../models/DatabaseModel')

export abstract class Source implements ISource {

    private databaseModel;
    private useImportPages: boolean = false;
    protected config: object;

    constructor(config: object) {
        this.parseConfig(config)

        // let db = new DatabaseFactory();
        // this.databaseModel = db.createTable("testTable/abc")
    }

    private parseConfig(config: object) {
        /*
        this.config = {
            "entrypoint": "https://apidg.gent.be/opendata/adlib2eventstream/v1/dmg/objecten",
            "queryparam": "generatedAtTime"
        }
        */
       console.log(config)
       this.config = config
    }

    getStreamIfExists(): Readable|boolean {
        return false;
    }

    async getPage(id: any): Promise<Page> {
        let response = await this.databaseModel.findByPk(id, {
            //rejectOnEmpty: true,
        });
        if (response == null) {
            return new Page([], []);
        }
        let parsed = JSON.parse(response.page);
        let page_ = this.deserializePage(parsed);

        return page_
    }

    async importPages(pages: Page[]): Promise<void> {
        let amount = await this.databaseModel.count();
        pages.forEach(async page => {
            let pageJSON = JSON.stringify(page)

            let id = (amount + 1).toString();
            amount++;

            await this.databaseModel.create({ id: id, page: pageJSON });
        });
    }


    private deserializePage(json: object): Page {
        let triples: RDF.Quad[] = [];
        let metadata: RDF.Quad[] = [];

        json['triples'].forEach(quad_ => {
            triples.push(quad(namedNode(quad_['subject']['value']), namedNode(quad_['predicate']['value']), namedNode(quad_['object']['value'])))
        });
        json['metadata'].forEach(quad_ => {
            metadata.push(quad(namedNode(quad_['subject']['value']), namedNode(quad_['predicate']['value']), namedNode(quad_['object']['value'])))
        });

        return new Page(triples, metadata);
    }

    public usesImportPages(): boolean {
        return (this.config['usesImportPages'] != null && this.config['usesImportPages'])
    }

    public setDatabaseModel(databaseModel): void {
        this.databaseModel = databaseModel;
    }

}