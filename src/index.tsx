import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import PocketBase from 'pocketbase';
import './index.css';

const POCKETBASE_URL = 'https://api.cafenho.site';
const CATEGORIES = ["NAM", "NỮ", "COUPLE", "BÉ TRAI", "BÉ GÁI", "MẸ BẦU", "PROMPT KHÁC"];
const PROMPTS_PER_PAGE = 10;

const pb = new PocketBase(POCKETBASE_URL);

interface PromptRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  prompt: string;
  url: string;
  publishUrl: string;
}

const PromptCard: React.FC<{ record: PromptRecord }> = ({ record }) => {
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(record.prompt);
    setCopied(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="prompt-card">
      <img
        src={record.publishUrl}
        alt={`Prompt image for ${record.id}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setImageLoaded(true)}
        className={imageLoaded ? 'loaded' : ''}
      />
      <div className="card-overlay">
        <button onClick={handleCopy} className={copied ? 'copied' : ''} aria-live="polite">
          {copied ? 'ĐÃ SAO CHÉP!' : 'SAO CHÉP PROMPT'}
        </button>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-image" />
    <div className="skeleton-button" />
  </div>
);

const App = () => {
  const [prompts, setPrompts] = useState<PromptRecord[]>([]);
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = useCallback(async (pageToFetch: number, category: string) => {
    setIsLoading(true);
    setError(null);
    let requestAborted = false;
    try {
      const filter = category ? `category = "${category}"` : '';
      const result = await pb
        .collection('prompt')
        .getList<PromptRecord>(pageToFetch, PROMPTS_PER_PAGE, {
          filter: filter,
          sort: '-created',
        });
      setPrompts(prev => (pageToFetch === 1 ? result.items : [...prev, ...result.items]));
      setHasMore(result.page < result.totalPages);
    } catch (err: any) {
      if (err && err.isAbort) {
        requestAborted = true;
      } else {
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        console.error(err);
      }
    } finally {
      if (!requestAborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchPrompts(page, activeCategory);
  }, [page, activeCategory, fetchPrompts]);

  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || !hasMore) return;
      
      const isAtBottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 300;
      
      if (isAtBottom) {
        setPage(prevPage => prevPage + 1);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, hasMore]);

  useEffect(() => {
    const promise = pb.collection('prompt').subscribe('*', () => {
      setPrompts([]);
      setHasMore(true);
      if (page === 1) {
        fetchPrompts(1, activeCategory);
      } else {
        setPage(1);
      }
    });

    return () => {
      promise.then((unsubscribe) => unsubscribe());
    };
  }, [activeCategory, page, fetchPrompts]);

  const handleSetCategory = (category: string) => {
    if (category === activeCategory) return;
    setPrompts([]);
    setHasMore(true);
    setPage(1);
    setActiveCategory(category);
  };

  return (
    <div className="container">
      <header>
        <h1>Thư Viện Prompt</h1>
        <p>Khám phá và sao chép các prompt thịnh hành để tạo ra những bức ảnh ấn tượng.</p>
        <div className="instructions">
          <h3>HƯỚNG DẪN</h3>
          <p>
            Sao chép prompt, mở Gemini <a href="https://gemini.google.com/app" target="_blank" rel="noopener noreferrer">tại đây</a>, sau đó tải ảnh của bạn lên và dán prompt để tạo ảnh.
          </p>
        </div>
      </header>
      <main>
        <div className="filters" role="tablist" aria-label="Lọc theo danh mục">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              onClick={() => handleSetCategory(cat)}
              className={activeCategory === cat ? 'active' : ''}
            >
              {cat}
            </button>
          ))}
        </div>
        
        {error && <div className="error" role="alert">{error}</div>}
        
        <div className="prompt-gallery" role="tabpanel">
          {prompts.map((p) => (
            <PromptCard key={p.id} record={p} />
          ))}
          {isLoading &&
            (prompts.length === 0 ? Array.from({ length: PROMPTS_PER_PAGE }) : Array.from({ length: 3 })).map((_, index) => (
              <SkeletonCard key={`skeleton-${index}`} />
            ))}
        </div>

        {!isLoading && prompts.length === 0 && !error && (
          <div className="empty-state">
            <p>Không tìm thấy prompt nào cho danh mục này.</p>
          </div>
        )}

        {!isLoading && !hasMore && prompts.length > 0 && (
          <div className="end-of-results">
            <p>Bạn đã xem hết tất cả các prompt.</p>
          </div>
        )}
      </main>
      <footer className="site-footer">
        <div className="footer-content">
          <span>
            Phát triển bởi{' '}
            <a
              href="#author-link"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Hoài Nghĩa
            </a>{' '}
            | © {new Date().getFullYear()}
          </span>
          <a
            href="#feedback-link"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-button"
          >
            Feedback
          </a>
        </div>
      </footer>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}