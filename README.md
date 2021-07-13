# Basic LDES server

A Basic LDES is a 1 dimensional pagination of an event stream’s full history and latest objects. The Basic LDES server can be used to map your back-end system to a Basic LDES HTTP server by implementing the Source class.

A Linked Data Event Stream (LDES) is a collection of immutable objects. The HTTP interface adheres to the [LDES specification](https://w3id.org/ldes/specification) by SEMIC. An LDES can be fragmented in different ways using the [TREE specification](https://w3id.org/tree/specification). Check the [TREE Linked Data Fragments website](https://tree.linkeddatafragments.org) for more background and implementations.

## Installation
### npm
```
npm i @treecg/basic-ldes-server
```

### yarn
```
yarn add @treecg/basic-ldes-server
```

## Usage

### Running from config file
```
let app = require('@treecg/basic-ldes-server')
const AppRunner = app.AppRunner;

new AppRunner().run("./config/config.json");
```

### Config file
``` json
{
    "app": {
        "port": 3000
    },
    "db": {
        "host": "<location to sqlite db>"
    },
    "entrypoint": "https://www.example.com/"
    "sources" : [ 
        {
            "route": "/endpoint-route", //relative endpoint route
            "sourceFile": "<relative path to compiled Source implementation in dist folder>",
            "usesImportPages": <boolean>,
            "importInterval": <importPages interval> //time between calls to importPages
        },
        ...
    ]
}
```

## Boilerplate implementation
[Boilerplate](https://github.com/TREEcg/Basic-LDES-Server/tree/main/Boilerplate)

## Examples
[Examples](https://github.com/TREEcg/Basic-LDES-Server/tree/main/Examples)

## Development
```
git clone https://github.com/TREEcg/Basic-LDES-Server.git 
yarn install
yarn run dev
```

## Authors
- [Brecht Van de Vyvere](https://github.com/brechtvdv)
- [Kasper Zutterman](https://github.com/KasperZutterman)
- [Lucas Derveaux](https://github.com/lucasderveaux)
- [Pieter Colpaert](https://github.com/pietercolpaert)
