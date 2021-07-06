import { Source } from "../src";
import { Page } from "../src/lib/Page";
import { Readable, Writable } from 'stream';
import { resourceLimits } from "worker_threads";
const N3 = require('n3');
const { namedNode, literal } = N3.DataFactory;


export class mySource extends Source {
  private config: object;

  constructor(config: string) {
    super();
    this.parseConfig(config);
  }

  parseConfig(config: string) {
    this.config = {
      "entrypoint": "https://production.crowdscan.be/dataapi/gent/gent_langemunt/data/5",
      "queryparam": "generatedAtTime"
    }
  }

  getPage(id: any): Page {
    // TODO: fetch API
    let r = this.getStreamIfExists();

    //dit moet er bij staan
    //de readable stream functie read wordt gebruikt, 
    //maar toch moet dit erbij staan omdat die anders neit
    r.read = function () { };



    r.on('readable', function () {
      let data: Buffer = r.read();
      let ans = data.toString();
      console.log(ans);
    });
    const p = new Page([], []);
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






      function makeObservation(data: string) {
        let rdf;

        let inhoud = JSON.parse(data);
        let header = inhoud["header"];
        let payload = inhoud["payload"]["regions"];

        let tijd = header['time'];
        let timedelta = header['timedelta'];
        let environment = header['environment'];

        let time = new Date(tijd);
        let writer = new N3.Writer();
        function makeSingleObservation(writer, headCount, suffix, time, timedelta, environment) {
          writer.addQuad(
            namedNode('observation'),
            namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
            namedNode('http://www.w3.org/ns/sosa/Observation')
          );

          writer.addQuad(
            namedNode('observation'),
            namedNode('http://www.w3.org/ns/sosa/hasFeatureOfInterest'),
            namedNode('https://production.crowdscan.be/dataapi/gent/environments/' + environment)
          );

          writer.addQuad(
            namedNode('observation'),
            namedNode('http://www.w3.org/ns/sosa/observedProperty'),
            namedNode('hoeveelheid_mensen')
          );

          writer.addQuad(
            namedNode('observation'),
            namedNode('http://www.w3.org/ns/sosa/resultTime'),
            literal(time)  //hoe ^^xsd:dateTime? -> niet automatisch?
          );

          writer.addQuad(
            namedNode('observation'),
            namedNode('http://www.w3.org/ns/sosa/hasSimpleResult'),
            literal(headCount)  //hoe ^^xsd:double -> automatisch
          );

          writer.addQuad(
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
                  object: literal(new Date(time - timedelta * 60000))
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
          );

          writer.addQuad(
            namedNode('observation'),
            namedNode('http://www.w3.org/ns/sosa/madeBySensor'),
            namedNode(environment + suffix + '_sensor')
          );
        }

        if (payload.length < 1) {
          console.error("crowdscan api werkt niet goed");
        } else {
          if (payload.length == 1) {
            makeSingleObservation(writer, payload[0], 0, time, timedelta, environment);
          } else {
            for (let i = 1; i < payload.length; i++) {
              makeSingleObservation(writer, payload[i], i, time, timedelta, environment);
            }
          }
        }

        try {
          writer.end((error, result) => {
            if (error) {
              console.log("er is een error: ", error);
            } else {
              rdf = result;
            }

          });
        } catch (e) {
          console.log("er is een grote error: ", e.message);
        }
        return rdf;
      }

      val = makeObservation(JSON.stringify(val));

      val = Buffer.from(val);
      r.read = function () {
        return val;
      }
      r.unshift(val);
      //push(null) moet anders komt er
      r.push(val);
    }
    setInterval(getData, 60000);
    return r;
  }


}