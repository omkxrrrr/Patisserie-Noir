import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { contentService } from '../services/adminServices';
import { SkeletonBlock } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { formatDate } from '../utils/format';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    contentService.blogPosts()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-10">
        <p className="eyebrow mb-2">The Journal</p>
        <h1 className="font-display text-display-md text-cocoa-700 dark:text-blush">Cake Journal</h1>
        <p className="mt-2 max-w-lg text-sm text-cocoa-400">Ideas, trends, and decorating tips from our kitchen.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-soft bg-white shadow-card dark:bg-cocoa-800">
              <SkeletonBlock className="h-44 w-full rounded-none" />
              <div className="space-y-2 p-4">
                <SkeletonBlock className="h-4 w-3/4" />
                <SkeletonBlock className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState icon={BookOpen} title="No articles yet" description="Check back soon for cake ideas, trends, and decorating tips." />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-soft bg-white shadow-card transition-transform hover:-translate-y-1 dark:bg-cocoa-800"
            >
              <div className="h-44 w-full overflow-hidden bg-cocoa-50 dark:bg-cocoa-700">
                <img
                  src={post.coverImage || '/cake-placeholder.svg'}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <p className="text-xs text-cocoa-400">{formatDate(post.publishedAt)}</p>
                <h2 className="mt-1 font-display text-lg text-cocoa-700 dark:text-blush">{post.title}</h2>
                {post.excerpt && <p className="mt-1.5 line-clamp-2 text-sm text-cocoa-400">{post.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
