import { Sequelize, DataTypes } from 'sequelize';

export class DatabaseFactory {
    private db: Sequelize;

    constructor() {
        this.db = new Sequelize({
            dialect: 'sqlite',
            storage: 'C:/GitHub/Basic-LDES-Server/test/database.sqlite'
            //storage: ':memory:'
            //storage: 'path/to/database.sqlite'
        });
    }

    createTable(tableName: string) {
        let databaseModel = this.db.define(tableName, {
            // Model attributes are defined here
            id: {
                type: DataTypes.TEXT,
                allowNull: false,
                primaryKey: true
            },
            page: {
                type: DataTypes.TEXT,
                allowNull: false
            }
        }, {
            // Other model options go here
            timestamps: false,
        });

        databaseModel.sync({ force: true });

        return databaseModel;
    }
}