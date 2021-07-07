import { ExpressHttpServerFactory } from '../server/ExpressHttpServerFactory';
import { absoluteFilePath, ensureTrailingSlash, joinFilePath } from '../util/PathUtil';

import type { ReadStream, WriteStream } from 'tty';
import yargs from 'yargs';
import { Source } from "..";
import * as fs from 'fs';

export class AppRunner {
    /**
     * Generic function for getting the app object to start the server from JavaScript for a given config.
     * @param loaderProperties - Components.js loader properties.
     * @param configFile - Path to the server config file.
     * @param variableParams - Variables to pass into the config file.
     */
    public async getApp(configFile: string, variableParams: any
    ): Promise<any> {
        const config = await fs.promises.readFile(configFile, 'utf8')
        const sourceMap: Map<String, Source> = this.initializeSources(config);
        return this.createApp(sourceMap, variableParams);
    }

    protected initializeSources(config: string): Map<String, Source> {
        // should be done based on the config
        let configuration = JSON.parse(config);
        let sourceMap : Map<String, Source> = new Map()
        configuration['sources'].forEach(element => {
            let route: String = element['route'];
            let locationOfSource = this.resolveFilePath(element['sourceFile']);
            let MySource = require(locationOfSource).mySource;
            let mySource: Source = new MySource(config);
            sourceMap.set(route, mySource);
        });
        
        return sourceMap;
    }

    /**
     * Generic run function for starting the server on the CLI from a given config
     * Made run to be non-async to lower the chance of unhandled promise rejection errors in the future.
     * @param args - Command line arguments.
     * @param stderr - Standard error stream.
     */
    public runCli({
        argv = process.argv,
        stderr = process.stderr,
    }: {
        argv?: string[];
        stdin?: ReadStream;
        stdout?: WriteStream;
        stderr?: WriteStream;
    } = {}): void {
        // Parse the command-line arguments
        // eslint-disable-next-line no-sync
        const params = yargs(argv.slice(2))
            .strict()
            .usage('node ./bin/server.js [args]')
            .check((args): boolean => {
                if (args._.length > 0) {
                    throw new Error(`Unsupported positional arguments: "${args._.join('", "')}"`);
                }
                for (const key of Object.keys(args)) {
                    // We have no options that allow for arrays
                    const val = args[key];
                    if (key !== '_' && Array.isArray(val)) {
                        throw new Error(`Multiple values were provided for: "${key}": "${val.join('", "')}"`);
                    }
                }
                return true;
            })
            .options({
                baseUrl: { type: 'string', alias: 'b', requiresArg: true },
                config: { type: 'string', alias: 'c', requiresArg: true },
                loggingLevel: { type: 'string', alias: 'l', default: 'info', requiresArg: true },
                port: { type: 'number', alias: 'p', default: 3000, requiresArg: true }
            })
            .parseSync();

        const configFile = this.resolveFilePath(params.config, '../config/config.json');

        // Create and execute the server initializer
        this.getApp(configFile, params)
            .then(
                async (app): Promise<void> => app.start(),
                (error: Error): void => {
                    // Instantiation of components has failed, so there is no logger to use
                    stderr.write(`Error: could not instantiate server from ${configFile}\n`);
                    stderr.write(`${error.stack}\n`);
                    process.exit(1);
                },
            ).catch((error): void => {
                console.error(`Could not start server: ${error}`, { error });
                process.exit(1);
            });
    }

    /**
     * Resolves a path relative to the current working directory,
     * falling back to a path relative to this module.
     */
    protected resolveFilePath(cwdPath?: string | null, modulePath = ''): string {
        return typeof cwdPath === 'string' ?
            absoluteFilePath(cwdPath) :
            joinFilePath(__dirname, '../../', modulePath);
    }

    /**
     * Creates the server initializer
     */
    protected async createApp(
        sourceMap: Map<String, Source>,
        variableParams: any
    ): Promise<any> {
        return new ExpressHttpServerFactory(sourceMap, variableParams);
    }
}
