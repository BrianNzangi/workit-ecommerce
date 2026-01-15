import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fc from 'fast-check';
import { BlogService } from '@/lib/services/blog.service';

// Feature: workit-admin-backend, Property 36: Blog post creation persistence
// Validates: Requirements 8.1
// For any valid blog data (title, slug, content, featured image), creating a blog post should store all fields

// Feature: workit-admin-backend, Property 37: Blog category association
// Validates: Requirements 8.2
// For any blog post and categories, assigning categories should create associations that appear when querying the blog post

// Feature: workit-admin-backend, Property 38: Blog publication status and date
// Validates: Requirements 8.3
// For any blog post, publishing should set published to true and set publishedAt to the current timestamp

// Feature: workit-admin-backend, Property 39: Blog customer query filtering
// Validates: Requirements 8.5
// For any set of blog posts with mixed published status, customer queries should return only posts where published is true, sorted by publishedAt in descending order

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

// Helper to generate valid blog titles
const blogTitleArbitrary = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);

// Helper to generate valid blog content
const blogContentArbitrary = fc.string({ minLength: 1, maxLength: 10000 }).filter(s => s.trim().length > 0);

// Helper to generate valid blog data
const createBlogInputArbitrary = fc.record({
  title: blogTitleArbitrary,
  content: blogContentArbitrary,
  excerpt: fc.option(fc.string({ maxLength: 500 }), { nil: null }),
  categories: fc.array(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), { maxLength: 5 }),
});

describe('Blog Management Properties', () => {
  let blogService: BlogService;

  beforeAll(async () => {
    // Ensure database connection is established
    await prisma.$connect();
    blogService = new BlogService(prisma);
  });

  afterAll(async () => {
    // Clean up and disconnect
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up blog categories and blogs after each test
    await prisma.blogCategory.deleteMany({});
    await prisma.blog.deleteMany({});
  });

  describe('Property 36: Blog post creation persistence', () => {
    it('should persist all blog fields when creating a blog post', async () => {
      await fc.assert(
        fc.asyncProperty(
          createBlogInputArbitrary,
          async (blogData) => {
            // Add unique identifier to avoid slug collisions
            const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const uniqueBlogData = {
              ...blogData,
              title: `${blogData.title}-${uniqueId}`,
            };

            // Create a blog post
            const createdBlog = await blogService.createBlog(uniqueBlogData);

            // Query the blog post by ID
            const retrievedBlog = await blogService.getBlog(createdBlog.id);

            // Key assertion: all fields should be persisted correctly
            expect(retrievedBlog).not.toBeNull();
            
            // Title and content are trimmed by the service (correct behavior)
            expect(retrievedBlog?.title).toBe(uniqueBlogData.title.trim());
            expect(retrievedBlog?.content).toBe(uniqueBlogData.content.trim());
            
            // Excerpt: empty strings are stored as null (correct behavior)
            const expectedExcerpt = uniqueBlogData.excerpt && uniqueBlogData.excerpt.trim().length > 0 
              ? uniqueBlogData.excerpt.trim()
              : null;
            expect(retrievedBlog?.excerpt).toBe(expectedExcerpt);
            
            expect(retrievedBlog?.published).toBe(false); // Should be unpublished by default
            expect(retrievedBlog?.publishedAt).toBeNull(); // Should have no publish date initially

            // Verify slug was generated
            expect(retrievedBlog?.slug).toBeDefined();
            expect(retrievedBlog?.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);

            // Verify categories were created
            if (blogData.categories && blogData.categories.length > 0) {
              expect((retrievedBlog as any)?.categories).toHaveLength(blogData.categories.length);
              const categoryNames = ((retrievedBlog as any)?.categories as any[])?.map((c: any) => c.name) || [];
              for (const categoryName of blogData.categories) {
                expect(categoryNames).toContain(categoryName.trim());
              }
            }

            // Clean up
            await prisma.blog.delete({
              where: { id: createdBlog.id },
            });
          }
        ),
        { numRuns: 100 }
      );
    }, 60000); // 60 second timeout for 100 iterations
  });

  describe('Property 37: Blog category association', () => {
    it('should create category associations that appear when querying the blog post', async () => {
      await fc.assert(
        fc.asyncProperty(
          blogTitleArbitrary,
          blogContentArbitrary,
          fc.array(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), { minLength: 1, maxLength: 5 }),
          async (title, content, categories) => {
            // Add unique identifier to avoid slug collisions
            const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const uniqueTitle = `${title}-${uniqueId}`;

            // Create a blog post with categories
            const createdBlog = await blogService.createBlog({
              title: uniqueTitle,
              content,
              categories,
            });

            // Query the blog post
            const retrievedBlog = await blogService.getBlog(createdBlog.id);

            // Key assertion: categories should be associated with the blog post
            expect(retrievedBlog).not.toBeNull();
            expect((retrievedBlog as any)?.categories).toBeDefined();
            expect((retrievedBlog as any)?.categories).toHaveLength(categories.length);

            // Verify each category is present
            const categoryNames = ((retrievedBlog as any)?.categories as any[])?.map((c: any) => c.name) || [];
            for (const categoryName of categories) {
              expect(categoryNames).toContain(categoryName.trim());
            }

            // Verify each category has the correct blogId
            for (const category of ((retrievedBlog as any)?.categories || []) as any[]) {
              expect(category.blogId).toBe(createdBlog.id);
            }

            // Clean up
            await prisma.blog.delete({
              where: { id: createdBlog.id },
            });
          }
        ),
        { numRuns: 100 }
      );
    }, 60000); // 60 second timeout for 100 iterations
  });

  describe('Property 38: Blog publication status and date', () => {
    it('should set published to true and publishedAt to current timestamp when publishing', async () => {
      await fc.assert(
        fc.asyncProperty(
          createBlogInputArbitrary,
          async (blogData) => {
            // Add unique identifier to avoid slug collisions
            const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const uniqueBlogData = {
              ...blogData,
              title: `${blogData.title}-${uniqueId}`,
            };

            // Create a blog post (unpublished by default)
            const createdBlog = await blogService.createBlog(uniqueBlogData);

            // Verify it's unpublished initially
            expect(createdBlog.published).toBe(false);
            expect(createdBlog.publishedAt).toBeNull();

            // Record the time before publishing
            const beforePublish = new Date();

            // Publish the blog post
            const publishedBlog = await blogService.publishBlog(createdBlog.id);

            // Record the time after publishing
            const afterPublish = new Date();

            // Key assertion: published should be true and publishedAt should be set
            expect(publishedBlog.published).toBe(true);
            expect(publishedBlog.publishedAt).not.toBeNull();

            // Verify publishedAt is within the expected time range
            const publishedAt = publishedBlog.publishedAt!;
            expect(publishedAt.getTime()).toBeGreaterThanOrEqual(beforePublish.getTime());
            expect(publishedAt.getTime()).toBeLessThanOrEqual(afterPublish.getTime());

            // Query the blog post to verify persistence
            const retrievedBlog = await blogService.getBlog(createdBlog.id);
            expect(retrievedBlog?.published).toBe(true);
            expect(retrievedBlog?.publishedAt).not.toBeNull();

            // Clean up
            await prisma.blog.delete({
              where: { id: createdBlog.id },
            });
          }
        ),
        { numRuns: 100 }
      );
    }, 60000); // 60 second timeout for 100 iterations
  });

  describe('Property 39: Blog customer query filtering', () => {
    it('should return only published posts sorted by publishedAt descending', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              title: blogTitleArbitrary,
              content: blogContentArbitrary,
              shouldPublish: fc.boolean(),
            }),
            { minLength: 3, maxLength: 10 }
          ),
          async (blogsData) => {
            // Add unique identifiers to avoid slug collisions
            const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

            // Create blog posts with mixed published status
            const createdBlogs: Array<{ id: string; shouldPublish: boolean }> = [];
            for (let i = 0; i < blogsData.length; i++) {
              const blogData = blogsData[i];
              const uniqueBlogData = {
                title: `${blogData.title}-${uniqueId}-${i}`,
                content: blogData.content,
              };

              // Create blog post
              const blog = await blogService.createBlog(uniqueBlogData);

              // Publish if needed (with a small delay to ensure different timestamps)
              if (blogData.shouldPublish) {
                // Add a small delay to ensure different publishedAt timestamps
                await new Promise(resolve => setTimeout(resolve, 10));
                await blogService.publishBlog(blog.id);
              }

              createdBlogs.push({ id: blog.id, shouldPublish: blogData.shouldPublish });
            }

            // Query blogs with published filter set to true (customer query)
            const publishedBlogs = await blogService.getBlogs({ published: true });

            // Key assertion: only published blogs should be returned
            expect(publishedBlogs).toBeDefined();

            // All returned blogs should have published = true
            for (const blog of publishedBlogs) {
              expect(blog.published).toBe(true);
              expect(blog.publishedAt).not.toBeNull();
            }

            // Count expected published blogs
            const expectedPublishedCount = createdBlogs.filter(b => b.shouldPublish).length;

            // Filter to only include blogs from this test run
            const testPublishedBlogs = publishedBlogs.filter(b =>
              createdBlogs.some(created => created.id === b.id)
            );

            expect(testPublishedBlogs).toHaveLength(expectedPublishedCount);

            // Verify blogs are sorted by publishedAt in descending order (newest first)
            if (testPublishedBlogs.length > 1) {
              for (let i = 0; i < testPublishedBlogs.length - 1; i++) {
                const currentPublishedAt = testPublishedBlogs[i].publishedAt!.getTime();
                const nextPublishedAt = testPublishedBlogs[i + 1].publishedAt!.getTime();
                expect(currentPublishedAt).toBeGreaterThanOrEqual(nextPublishedAt);
              }
            }

            // Query blogs with published filter set to false
            const unpublishedBlogs = await blogService.getBlogs({ published: false });

            // All returned blogs should have published = false
            for (const blog of unpublishedBlogs) {
              expect(blog.published).toBe(false);
            }

            // Count expected unpublished blogs
            const expectedUnpublishedCount = createdBlogs.filter(b => !b.shouldPublish).length;

            // Filter to only include blogs from this test run
            const testUnpublishedBlogs = unpublishedBlogs.filter(b =>
              createdBlogs.some(created => created.id === b.id)
            );

            expect(testUnpublishedBlogs).toHaveLength(expectedUnpublishedCount);

            // Clean up
            for (const blog of createdBlogs) {
              await prisma.blog.delete({
                where: { id: blog.id },
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 60000); // 60 second timeout for 100 iterations
  });
});
