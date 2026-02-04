import Link from 'next/link';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';

interface Blog {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    published: boolean;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

interface BlogListItemProps {
    blog: Blog;
    onDelete: (id: string, title: string) => void;
}

export function BlogListItem({ blog, onDelete }: BlogListItemProps) {
    const getStatusColor = (published: boolean) => {
        return published
            ? 'bg-primary-50 text-primary-700'
            : 'bg-secondary-50 text-secondary-600';
    };

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4">
                <div>
                    <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                    {blog.excerpt && (
                        <div className="text-sm text-gray-500 line-clamp-1">
                            {blog.excerpt}
                        </div>
                    )}
                </div>
            </td>
            <td className="px-6 py-4">
                <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        blog.published
                    )}`}
                >
                    {blog.published ? (
                        <>
                            <Eye className="w-3 h-3" />
                            Published
                        </>
                    ) : (
                        <>
                            <EyeOff className="w-3 h-3" />
                            Draft
                        </>
                    )}
                </span>
            </td>
            <td className="px-6 py-4 text-sm text-gray-900">
                {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : '-'}
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(blog.updatedAt).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                    <Link
                        href={`/admin/blog/${blog.id}/edit`}
                        className="text-secondary-500 hover:text-primary-800 transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => onDelete(blog.id, blog.title)}
                        className="text-secondary-500 hover:text-red-600 transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}
