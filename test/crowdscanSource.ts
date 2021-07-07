import { Source } from "../src";
import { Page } from "../src/lib/Page";
import { Readable, Writable } from 'stream';
import type * as RDF from 'rdf-js';
const N3 = require('n3');
import { literal, namedNode, quad } from '@rdfjs/data-model';

//Source van de api van de langemunt
export class mySource extends Source {
  private config: object;

  constructor(config: string) {
    super();
    this.parseConfig(config);
  }

  parseConfig(config: string) {
    //voorlopig hardgecodeerd
    this.config = {
      "entrypoint": "https://production.crowdscan.be/dataapi/gent/gent_langemunt/data/5",
      "sensors": 3,
      "environment": "gent_langemunt"
    }
  }

  getPage(id: any): Page {
    //this.makeObservation kon ik niet oproepen vanuit r.on('readable');
    let makeObservation = this.makeObservation;
    // VOORBEELD HOE DE STREAM WERKT:
    let r = this.getStreamIfExists();

    //dit moet er bij staan
    //de readable stream functie read wordt gebruikt, 
    //maar toch moet dit erbij staan omdat die anders neit
    r.read = function () { };

    r.on('readable', function () {
      let data: Buffer = r.read();
      let ans = data.toString();
      makeObservation(ans);
    });

    let triples: RDF.Quad[] = [];
    this.getFeatures(triples);

    const p = new Page([], triples);
    return p;
  }

  getStreamIfExists() {
    let r = new Readable();
    async function getData() {
      let val = await fetch('https://production.crowdscan.be/dataapi/gent/gent_langemunt/data/5'
        , {
          method: 'GET',
          headers: {
            'content-type': 'application/json'
          }
        }
      ).then(response => response.json())
        .catch(err => console.error('error: ', err));

      val = Buffer.from(JSON.stringify(val));
      r.read = function () {
        return val;
      }
      r.unshift(val);
      r.push(val);
    }
    setInterval(getData, 60000);
    return r;
  }

  private getFeatures(triples: RDF.Quad[]): void {
    //geen idee hoe ik hier prefixen moet toevoegen so let's just not
    //voor elke source is er andere metadata

    let environment = this.config['environment'];
    let aantal: number = this.config['sensors'];
    //feature of Interest
    triples.push(
      quad(
        namedNode('https://production.crowdscan.be/dataapi/gent/environments/' + environment),
        namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        namedNode('sosa:FeatureOfInterest')
      )
    );

    //observable property
    triples.push(
      quad(
        namedNode('hoeveelheid_mensen'),
        namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        namedNode('http://www.w3.org/ns/sosa/ObservableProperty')
      )
    );
    triples.push(
      quad(
        namedNode('hoeveelheid_mensen'),
        namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
        literal("hoeveelheid mensen")
      )
    );
    //platform
    triples.push(
      quad(
        namedNode(environment + '_platform'),
        namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        namedNode('http://www.w3.org/ns/sosa/Platform')
      )
    );
    for (let i = 1; i <= aantal; i++) {
      triples.push(
        quad(
          namedNode('https://production.crowdscan.be/dataapi/gent/environments/' + environment),
          namedNode('http://www.w3.org/ns/sosa/hasSample'),
          namedNode(environment + i + '_sample')
        )
      );
    }

    //samples aanmaken
    for (let i = 1; i <= aantal; i++) {
      triples.push(
        quad(
          namedNode(environment + i + '_sample'),
          namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          namedNode('http://www.w3.org/ns/sosa/Sample')
        )
      );

      triples.push(
        quad(
          namedNode(environment + i + '_sample'),
          namedNode('http://www.w3.org/ns/sosa/isSampleOf'),
          namedNode('https://production.crowdscan.be/dataapi/gent/environments/' + environment)
        )
      );

      triples.push(
        quad(
          namedNode(environment + i + '_sample'),
          namedNode('http://www.w3.org/2000/01/rdf-schema#comment'),
          literal(environment + ' is opgedeeld in ' + aantal + ' delen en dit is het sample van deel ' + i)
        )
      );
    }
    for (let i = 1; i <= aantal; i++) {

      triples.push(
        quad(
          namedNode(environment + '_platfom'),
          namedNode('http://www.w3.org/ns/sosa/hosts'),
          namedNode(environment + i + '_sensor')
        )
      );
    }
    //sensoren aanmaken
    for (let i = 1; i <= aantal; i++) {
      triples.push(
        quad(
          namedNode(environment + i + '_sensor'),//hier ga ik gewoon een cijfer achter zetten
          namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          namedNode('http://www.w3.org/ns/sosa/sensor')
        )
      );

      triples.push(
        quad(
          namedNode(environment + i + '_sensor'),
          namedNode('http://www.w3.org/ns/sosa/isHostedBy'),
          namedNode(environment + '_platform')
        )
      );

      //LDES
      triples.push(
        quad(
          namedNode('https://production.crowdscan.be/dataapi/gent/environments/eventStream'),
          namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          namedNode('https://w3id.org/ldes#EventStream')
        )
      );

    }
  }

  makeObservation(data: string): RDF.Quad[] {
    let rdf: RDF.Quad[];
    rdf = [];

    let inhoud = JSON.parse(data);
    let header = inhoud["header"];
    let payload = inhoud["payload"]["regions"];

    let tijd = header['time'];
    let timedelta = header['timedelta'];
    let environment = header['environment'];

    let time = new Date(tijd);
    let tijdInNumbers: number = Number(time);
    let tijd1: Date = new Date(tijdInNumbers - timedelta * 60000);

    let writer = new N3.Writer();
    function makeSingleObservation(writer, headCount, suffix, time, environment) {
      rdf.push(
        quad(
          namedNode('https://production.crowdscan.be/dataapi/gent/environments/evenstream'),
          namedNode('https://w3id.org/tree#member'),
          namedNode('observation')//+observation.id)
        )
      );
      rdf.push(
        quad(
          namedNode('observation'),
          namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          namedNode('http://www.w3.org/ns/sosa/Observation')
        )
      );

      rdf.push(
        quad(
          namedNode('observation'),
          namedNode('http://www.w3.org/ns/sosa/hasFeatureOfInterest'),
          namedNode('https://production.crowdscan.be/dataapi/gent/environments/' + environment)
        )
      );

      rdf.push(
        quad(
          namedNode('observation'),
          namedNode('http://www.w3.org/ns/sosa/observedProperty'),
          namedNode('hoeveelheid_mensen')
        )
      );

      rdf.push(
        quad(
          namedNode('observation'),
          namedNode('http://www.w3.org/ns/sosa/resultTime'),
          literal(time)  //hoe ^^xsd:dateTime? -> niet automatisch?
        )
      );

      rdf.push(
        quad(
          namedNode('observation'),
          namedNode('http://www.w3.org/ns/sosa/hasSimpleResult'),
          literal(headCount)  //hoe ^^xsd:double -> automatisch
        )
      );

      rdf.push(
        quad(
          namedNode('observation'),
          namedNode('http://www.w3.org/ns/sosa/phenomenonTime'),
          writer.blank([
            {
              predicate: namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
              object: namedNode('http://www.w3.org/2006/time#Interval')
            }, {
              predicate: namedNode('http://www.w3.org/2006/time#hasBeginning'),
              object: writer.blank([{
                predicate: namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                object: namedNode('http://www.w3.org/2006/time#Instant')
              }, {
                predicate: namedNode('http://www.w3.org/2006/time#inXSDDateTimeStamp'),
                object: literal(tijd1.toString())
              }])
            },
            {
              predicate: namedNode('http://www.w3.org/2006/time#hasEnd'),
              object: writer.blank([{
                predicate: namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                object: namedNode('http://www.w3.org/2006/time#Instant')
              }, {
                predicate: namedNode('http://www.w3.org/2006/time#inXSDDateTimeStamp'),
                object: literal(time)
              }])
            }
          ])
        )
      );

      rdf.push(
        quad(
          namedNode('observation'),
          namedNode('http://www.w3.org/ns/sosa/madeBySensor'),
          namedNode(environment + suffix + '_sensor')
        )
      );
    }

    if (payload.length < 1) {
      console.error("crowdscan api werkt niet goed");
    } else {
      if (payload.length == 1) {
        makeSingleObservation(writer, payload[0], 0, time, environment);
      } else {
        for (let i = 1; i < payload.length; i++) {
          makeSingleObservation(writer, payload[i], i, time, environment);
        }
      }
    }
    console.log(rdf);
    return rdf;

  }
}