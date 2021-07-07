const Sequelize = require('sequelize');

// Option 2: Passing parameters separately (sqlite)
module.exports = new Sequelize({
    dialect: 'sqlite',
    storage: 'C:/GitHub/Basic-LDES-Server/test/database.sqlite'
    //storage: ':memory:'
    //storage: 'path/to/database.sqlite'
});