import type { ISource } from '../util/Util';

export abstract class Source implements ISource {
    getStreamIfExists() {
        return undefined;
    }
}