import type { ISource } from '../util/Util';
import {Page} from "./Page";

import type * as RDF from 'rdf-js';
import { literal, namedNode, quad } from '@rdfjs/data-model';

// Database
const db = require('../config/database')
const DatabaseModel = require('../models/DatabaseModel')

export abstract class Source implements ISource {
    protected keyv: any;
    
    constructor () {
        
    }

    getStreamIfExists() {
        return false;
    }

    async getPage(id: any): Promise<Page> {
        //throw new Error('Method not implemented.');
        //return this.keyv.get(id);
        let response = await DatabaseModel.findByPk(1, {
            rejectOnEmpty: true,
          });
        //if (response instanceof DatabaseModel)
        //  console.log(response.page)
        let parsed = JSON.parse(response.page);

        let triples: RDF.Quad[];
        //let page_: Page = Object.assign(new Page(triples,triples), parsed);
        let page_ = this.deserializePage(parsed);
        //console.log(page_)

        // page_.getTriples().forEach(element => {
        //     console.log(element)
        // });

        //console.log(await page_.getSerializedPage())

        return page_
    }

    async importPages(pages: Page[]): Promise<void> {
        let amount = await DatabaseModel.count();
        pages.forEach(async page => {
            //this.keyv.set(key, page)
            let pageJSON = JSON.stringify(page)
                        
            //let amount = Math.floor(Math.random()*10)
            let id = (amount + 1).toString();
            amount++;
            //await DatabaseModel.create({ id: "Jane", page: pageJSON });
            await DatabaseModel.create({ id: id, page: pageJSON });
        });
        //throw new Error('Method not implemented.');
    }

    
    private deserializePage(json: object): Page  {
        let triples: RDF.Quad[] = [];
        let metadata: RDF.Quad[];

        json['triples'].forEach(quad_ => {
            //triples.push(Object.assign(quad, quad_))
            triples.push(quad(namedNode(quad_['subject']['value']), namedNode(quad_['predicate']['value']), namedNode(quad_['object']['value'])))
        }); 
        return new Page(triples, null);
    }
    
}

/*
var findUserDevice = function(userDeviceId){
    // return the promise itself
    return db.DeviceUser.find({
        where: {
           id: userDeviceId
        }
     }).then(function(device) {
        if (!device) {
            return 'not find';
        }
        return device.dataValues;
     });
};
*/