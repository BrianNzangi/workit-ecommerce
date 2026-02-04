import { collections } from '@workit/api';

export type Collection = collections.Collection;
export type CreateCollectionInput = collections.CreateCollectionInput;

export interface CollectionListOptions {
    take?: number;
    skip?: number;
    parentId?: string;
    includeChildren?: boolean | string;
}
