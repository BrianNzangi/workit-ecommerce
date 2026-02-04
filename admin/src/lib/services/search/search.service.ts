import { BaseService } from '../base/base.service';

export class SearchService extends BaseService {
    async search(query: string): Promise<any> {
        return { results: [] };
    }
}
