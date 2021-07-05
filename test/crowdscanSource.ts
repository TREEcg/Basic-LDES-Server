import { Source } from "../src";
import { Page } from "../src/lib/Page";
import type * as RDF from 'rdf-js';
import { literal, namedNode, quad } from '@rdfjs/data-model';
import { Readable, Writable } from 'stream';


export class mySource extends Source {
  private config: object;

  constructor(config: string) {
    super();
    this.parseConfig(config);
  }

  parseConfig(config: string) {
    this.config = {
      "entrypoint": "https://production.crowdscan.be/dataapi/gent/veldstraat/data/5",
      "queryparam": "generatedAtTime"
    }
  }

  getPage(id: any): Page {
    // TODO: fetch API
    let r = this.getStreamIfExists();
    r.read = function () {
      return 'test';
    };

    r.on('readable', function () {
      let data:Buffer;
      data= r.read();
      console.log(data.toString());
    });

    const test = quad(namedNode('http://example.org/A'), namedNode('http://example.org/B'), namedNode('http://example.org/C'));
    const testArray: RDF.Quad[] = [];
    testArray.push(test);

    const p = new Page(testArray, []);
    return p;
  }

  getStreamIfExists() {
    let r = new Readable();
    async function getData() {
      let val = await fetch('https://production.crowdscan.be/dataapi/gent/veldstraat/data/5'
        , {
          method: 'GET',
          headers: {
            'content-type': 'application/json'
          }
        }
      ).then(response => response.json())
        .catch(err => console.error('error: ', err));
      let buf = Buffer.from(JSON.stringify(val));
      r.read = function(){
        return buf;
      }
      r.unshift(buf);
      //push(null) moet anders komt er
      r.push(buf);
    }
    setInterval(getData, 6000);
    return r;
  }


}