import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { contentService } from '../services/adminServices';
import PageLoader from '../components/ui/PageLoader';
import EmptyState from '../components/ui/EmptyState';
import { formatDate } from '../utils/format';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setNotFound(false);
    contentService.blogPostBySlug(slug)
      .then((data) => { if (!cancelled) setPost(data); })
      .catch(() => { if (!cancelled) setNotFound(true); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  if (isLoading) return <PageLoader />;

  if (notFound || !post) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="This article isn't available"
          description="It may have been unpublished or the link is incorrect."
          action={<Link to="/blog" className="text-sm font-semibold text-mulberry-500">Back to Cake Journal</Link>}
        />
      </div>
    );
  }

  return (
    <article className="container-page max-w-2xl py-10 sm:py-14">
      <Link to="/blog" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-cocoa-500 hover:text-mulberry-500">
        <ChevronLeft size={16} /> Cake Journal
      </Link>

      <p className="eyebrow mb-2">{formatDate(post.publishedAt)}</p>
      <h1 className="font-display text-display-md text-cocoa-700 dark:text-blush">{post.title}</h1>

      {post.coverImage && (
        <img src={post.coverImage} alt={post.title} className="mt-6 w-full rounded-soft object-cover" style={{ maxHeight: 420 }} />
      )}

      <div className="mt-8 whitespace-pre-wrap text-[15px] leading-relaxed text-cocoa-600 dark:text-blush-deep">
        {post.content}
      </div>
    </article>
  );
}
