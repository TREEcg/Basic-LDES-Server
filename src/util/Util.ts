import { Readable } from 'stream';

export interface ISource {
    getStreamIfExists(): Readable;
}