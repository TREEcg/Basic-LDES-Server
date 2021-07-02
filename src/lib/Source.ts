import type { ISource } from '../util/Util';
import {Page} from "./Page";

export abstract class Source implements ISource {
    getStreamIfExists() {
        return false;
    }
    getPage(id: any): Page {
        throw new Error('Method not implemented.');
    }
    importPages(pages: Page[]): void {
        throw new Error('Method not implemented.');
    }
}