import type { ISource } from '../util/Util';
import {Page} from "./Page";
import { Readable } from 'stream';

export abstract class Source implements ISource {
    getStreamIfExists() :Readable|boolean {
        return false;
    }
    getPage(id: any): Promise<Page> {
        throw new Error('Method not implemented.');
    }
    importPages(pages: Page[]): void {
        throw new Error('Method not implemented.');
    }
}