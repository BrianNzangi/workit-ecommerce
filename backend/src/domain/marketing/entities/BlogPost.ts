import { Entity } from '../../shared/Entity.js';

export class BlogPost extends Entity<string> {
  private readonly _title: string;
  private readonly _slug: string;
  private readonly _content: string;
  private readonly _excerpt: string | null;
  private readonly _author: string | null;
  private readonly _published: boolean;
  private readonly _publishedAt: Date | null;
  private readonly _assetId: string | null;
  private _updatedAt: Date;
  private readonly _createdAt: Date;

  private constructor(
    id: string,
    title: string,
    slug: string,
    content: string,
    excerpt: string | null,
    author: string | null,
    published: boolean,
    publishedAt: Date | null,
    assetId: string | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id);
    this._title = title;
    this._slug = slug;
    this._content = content;
    this._excerpt = excerpt;
    this._author = author;
    this._published = published;
    this._publishedAt = publishedAt;
    this._assetId = assetId;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  static create(params: {
    id: string;
    title: string;
    slug: string;
    content?: string;
    excerpt?: string | null;
    author?: string | null;
    published?: boolean;
    assetId?: string | null;
  }): BlogPost {
    const now = new Date();
    const published = params.published ?? false;
    return new BlogPost(
      params.id,
      params.title,
      params.slug,
      params.content ?? '',
      params.excerpt ?? null,
      params.author ?? null,
      published,
      published ? now : null,
      params.assetId ?? null,
      now,
      now,
    );
  }

  static reconstitute(params: {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    author: string | null;
    published: boolean;
    publishedAt: Date | null;
    assetId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): BlogPost {
    return new BlogPost(
      params.id,
      params.title,
      params.slug,
      params.content,
      params.excerpt,
      params.author,
      params.published,
      params.publishedAt,
      params.assetId,
      params.createdAt,
      params.updatedAt,
    );
  }

  publish(): void {
    if (!this._published) {
      (this as any)._published = true;
      (this as any)._publishedAt = new Date();
    }
  }

  unpublish(): void {
    (this as any)._published = false;
    (this as any)._publishedAt = null;
  }

  get title(): string { return this._title; }
  get slug(): string { return this._slug; }
  get content(): string { return this._content; }
  get excerpt(): string | null { return this._excerpt; }
  get author(): string | null { return this._author; }
  get published(): boolean { return this._published; }
  get publishedAt(): Date | null { return this._publishedAt; }
  get assetId(): string | null { return this._assetId; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
}
