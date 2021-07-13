import {Source, Page} from '@treecg/basic-ldes-server';
import type * as RDF from 'rdf-js';
import { literal, namedNode, quad } from '@rdfjs/data-model';

require('dotenv').config()
const fetch = require('node-fetch');
//import * as f from "@dexagod/rdf-retrieval"
//const rdfParser = require("rdf-parse").default;

export class mySource extends Source {

    constructor (config: object) {
        super(config);
    }

    async getPage(id: any): Promise<Page> {
        // TODO: fetch API

        // https://apidg.gent.be/opendata/adlib2eventstream/v1/dmg/objecten?generatedAtTime=2021-06-28T14:26:43.196Z
        let reqUrl = "https://telraam-api.net/v1/reports/traffic_snapshot"

        var myHeaders = new Headers();
        myHeaders.append("X-Api-Key", process.env.TELRAAM_API_KEY);
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            //"time": "2021-06-25T10:00:00Z",
            "time": id,
            "contents": "minimal",
            "area": "full"
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        let res = await this.fetchAPI(reqUrl, requestOptions);
        let triples: RDF.Quad[] = [];

        res["report"].forEach(observation => {
            triples = triples.concat(this.mapObservation(observation));
        });

        const p = new Page(triples, this.getMetedata());
        return p;
    }

    
    async fetchAPI(reqUrl: String, requestOptions) {
        return await fetch(reqUrl, requestOptions)
            .then(res => res.json())
    }

    mapObservation(observation: object): RDF.Quad[] {
        let triples: RDF.Quad[] = [];

        //triples.push(quad(namedNode(observation["geom"]), namedNode(observation["uptime"]), namedNode(observation["pedestrian"])))
        
        //sensor(camera)
        triples.push(quad(namedNode(observation["segment_id"]), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('sosa:Sensor')))
        triples.push(quad(namedNode(observation["segment_id"]), namedNode('sosa:observes'), namedNode('uptime')))
        triples.push(quad(namedNode(observation["segment_id"]), namedNode('sosa:observes'), namedNode('heavy')))
        triples.push(quad(namedNode(observation["segment_id"]), namedNode('sosa:observes'), namedNode('car')))
        triples.push(quad(namedNode(observation["segment_id"]), namedNode('sosa:observes'), namedNode('bike')))
        triples.push(quad(namedNode(observation["segment_id"]), namedNode('sosa:observes'), namedNode('pedestrian')))

        
        // feature of interest
        triples.push(quad(namedNode(observation["geom"]), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('sosa:FeatureOfInterest')))

        // uptime
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-uptime"), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('sosa:Observation')))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-uptime"), namedNode('sosa:hasSimpleResult'), namedNode(observation["uptime"])))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-uptime"), namedNode('sosa:resultTime'), namedNode(observation["date"])))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-uptime"), namedNode('sosa:observedProperty'), namedNode("uptime")))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-uptime"), namedNode('sosa:hasFeatureOfInterest'), namedNode(observation["geom"])))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-uptime"), namedNode('sosa:madeBySensor'), namedNode(observation["segment_id"])))
        
        // heavy
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-heavy"), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('sosa:Observation')))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-heavy"), namedNode('sosa:hasSimpleResult'), namedNode(observation["heavy"])))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-heavy"), namedNode('sosa:resultTime'), namedNode(observation["date"])))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-heavy"), namedNode('sosa:observedProperty'), namedNode("heavy")))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-heavy"), namedNode('sosa:hasFeatureOfInterest'), namedNode(observation["geom"])))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-heavy"), namedNode('sosa:madeBySensor'), namedNode(observation["segment_id"])))

        // car
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-car"), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('sosa:Observation')))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-car"), namedNode('sosa:hasSimpleResult'), namedNode(observation["car"])))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-car"), namedNode('sosa:resultTime'), namedNode(observation["date"])))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-car"), namedNode('sosa:observedProperty'), namedNode("car")))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-car"), namedNode('sosa:hasFeatureOfInterest'), namedNode(observation["geom"])))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-car"), namedNode('sosa:madeBySensor'), namedNode(observation["segment_id"])))

        // bike
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-bike"), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('sosa:Observation')))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-bike"), namedNode('sosa:hasSimpleResult'), namedNode(observation["bike"])))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-bike"), namedNode('sosa:resultTime'), namedNode(observation["date"])))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-bike"), namedNode('sosa:observedProperty'), namedNode("bike")))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-bike"), namedNode('sosa:hasFeatureOfInterest'), namedNode(observation["geom"])))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-bike"), namedNode('sosa:madeBySensor'), namedNode(observation["segment_id"])))

        // pedestrian
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-pedestrian"), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('sosa:Observation')))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-pedestrian"), namedNode('sosa:hasSimpleResult'), namedNode(observation["pedestrian"])))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-pedestrian"), namedNode('sosa:resultTime'), namedNode(observation["date"])))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-pedestrian"), namedNode('sosa:observedProperty'), namedNode("pedestrian")))
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-pedestrian"), namedNode('sosa:hasFeatureOfInterest'), namedNode(observation["geom"])))        
        triples.push(quad(namedNode(observation["segment_id"] + "-" + observation["date"] + "-pedestrian"), namedNode('sosa:madeBySensor'), namedNode(observation["segment_id"])))

        
        return triples;

        /*
        {
            "segment_id": 24948,
            "date": "2021-06-25T10:00:00.000Z",
            "period": "hourly",
            "uptime": 0.7441666667,
            "heavy": 6.718924972,
            "car": 80.6270996641,
            "bike": 30.9070548712,
            "pedestrian": 6.718924972,
            "geom": "MULTILINESTRING((4.47577215954854 51.3021139617358,4.47595551773865 51.3021950921476,4.47695639672957 51.3026379150719,4.47697279209603 51.3026451710098,4.47710697740073 51.3027045352444,4.47715948350988 51.3027277644868))",
            "timezone": "Europe/Brussels"
        }
        */
    }

    getMetedata(): RDF.Quad[] {
        let metadata: RDF.Quad[] = [];

        // observable properties
        metadata.push(quad(namedNode("uptime"), namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), namedNode("http://www.w3.org/ns/sosa/ObservableProperty")))
        metadata.push(quad(namedNode("uptime"), namedNode("http://www.w3.org/2000/01/rdf-schema#label"), namedNode("uptime")))
        metadata.push(quad(namedNode("heavy"), namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), namedNode("http://www.w3.org/ns/sosa/ObservableProperty")))
        metadata.push(quad(namedNode("heavy"), namedNode("http://www.w3.org/2000/01/rdf-schema#label"), namedNode("heavy")))
        metadata.push(quad(namedNode("car"), namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), namedNode("http://www.w3.org/ns/sosa/ObservableProperty")))
        metadata.push(quad(namedNode("car"), namedNode("http://www.w3.org/2000/01/rdf-schema#label"), namedNode("car")))
        metadata.push(quad(namedNode("bike"), namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), namedNode("http://www.w3.org/ns/sosa/ObservableProperty")))
        metadata.push(quad(namedNode("bike"), namedNode("http://www.w3.org/2000/01/rdf-schema#label"), namedNode("bike")))
        metadata.push(quad(namedNode("pedestrian"), namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), namedNode("http://www.w3.org/ns/sosa/ObservableProperty")))
        metadata.push(quad(namedNode("pedestrian"), namedNode("http://www.w3.org/2000/01/rdf-schema#label"), namedNode("pedestrian")))

        return metadata;
    }
    
/*
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
    */
}