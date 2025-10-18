import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import PocketBase from 'pocketbase';
import './index.css';

const POCKETBASE_URL = 'https://api.cafenho.site';
const CATEGORIES = [
  { name: "NAM", emoji: "👨" },
  { name: "NỮ", emoji: "👩" },
  { name: "COUPLE", emoji: "👫" },
  { name: "BÉ TRAI", emoji: "👦" },
  { name: "BÉ GÁI", emoji: "👧" },
  { name: "MẸ BẦU", emoji: "🤰" },
  { name: "PROMPT KHÁC", emoji: "✨" },
];
const PROMPTS_PER_PAGE = 10;

const pb = new PocketBase(POCKETBASE_URL);

// --- UTILITY FUNCTIONS ---
const throttle = (func: (...args: any[]) => void, delay: number) => {
  let inProgress = false;
  return (...args: any[]) => {
    if (inProgress) {
      return;
    }
    inProgress = true;
    func(...args);
    setTimeout(() => {
      inProgress = false;
    }, delay);
  };
};

// --- INTERFACES ---
interface PromptRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  prompt: string;
  url: string;
  publishUrl: string;
}

// --- SVG ICONS ---
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const ArrowUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"></line>
    <polyline points="5 12 12 5 19 12"></polyline>
  </svg>
);


// --- COMPONENTS ---
const PromptCard: React.FC<{ record: PromptRecord }> = React.memo(({ record }) => {
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);

  const thumbnailUrl = useMemo(() => `${record.publishUrl}?thumb=30x45`, [record.publishUrl]);
  const mainImageUrl = useMemo(() => `${record.publishUrl}?thumb=400x600`, [record.publishUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(record.prompt);
    setCopied(true);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  return (
    <div className="prompt-card">
      <div className="image-container">
        <img
          src={thumbnailUrl}
          className="placeholder-img"
          alt=""
          aria-hidden="true"
        />
        <img
          src={mainImageUrl}
          alt={`Prompt image for ${record.id}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          className={`main-img ${imageLoaded ? 'loaded' : ''}`}
        />
      </div>
      <div className="card-overlay">
        <div className="button-group">
          <button onClick={handleCopy} className={`copy-button ${copied ? 'copied' : ''}`} aria-live="polite">
              <span className="icon">
                {copied ? <CheckIcon /> : <CopyIcon />}
              </span>
              <span className="text">
                {copied ? 'ĐÃ SAO CHÉP!' : 'SAO CHÉP PROMPT'}
              </span>
          </button>
        </div>
      </div>
    </div>
  );
});

const SkeletonCard = () => <div className="skeleton-card" />;

const App = () => {
  const [prompts, setPrompts] = useState<PromptRecord[]>([]);
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].name);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Data fetching logic
  useEffect(() => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchPrompts = async () => {
      try {
        const filter = activeCategory ? `category ~ "%${activeCategory}%"` : '';
        const result = await pb
          .collection('prompt')
          .getList<PromptRecord>(page, PROMPTS_PER_PAGE, {
            filter: filter,
            sort: '-created',
            signal: controller.signal,
          });
        
        if (!controller.signal.aborted) {
          setPrompts(prev => (page === 1 ? result.items : [...prev, ...result.items]));
          setHasMore(result.page < result.totalPages);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && !err.isAbort) {
          let errorMessage = 'Không thể tải dữ liệu. Vui lòng thử lại sau.';
          if (err.status === 0) {
            errorMessage = 'Lỗi mạng. Vui lòng kiểm tra kết nối internet của bạn.';
          } else if (err.data?.message) {
            errorMessage = `Đã xảy ra lỗi: ${err.data.message}`;
          }
          setError(errorMessage);
          setHasMore(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchPrompts();

    return () => {
      controller.abort();
    };
  }, [page, activeCategory, refetchTrigger]);

  // Infinite scroll logic
  const handleScroll = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300;
    
    if (isAtBottom) {
      setPage(prevPage => prevPage + 1);
    }
  }, [isLoading, hasMore]);

  const throttledScrollHandler = useMemo(() => throttle(handleScroll, 200), [handleScroll]);

  useEffect(() => {
    window.addEventListener('scroll', throttledScrollHandler);
    return () => window.removeEventListener('scroll', throttledScrollHandler);
  }, [throttledScrollHandler]);

  // Scroll handler for showing/hiding the "scroll to top" button
  useEffect(() => {
    const checkVisibility = () => {
      setShowScrollButton(window.scrollY > 400);
    };
    const throttledCheckVisibility = throttle(checkVisibility, 200);
    window.addEventListener('scroll', throttledCheckVisibility);
    return () => {
      window.removeEventListener('scroll', throttledCheckVisibility);
    };
  }, []);

  // Real-time subscription
  useEffect(() => {
    const promise = pb.collection('prompt').subscribe('*', () => {
      if (page === 1) {
        setRefetchTrigger(t => t + 1);
      } else {
        setPage(1);
      }
      setHasMore(true);
    });

    return () => {
      promise.then((unsubscribe) => unsubscribe());
    };
  }, [page]);

  const handleSetCategory = useCallback((categoryName: string) => {
    if (categoryName === activeCategory) return;
    
    setActiveCategory(categoryName);
    setPage(1);
    setPrompts([]); 
    setHasMore(true); 
    setIsLoading(true); 
    setError(null);
    window.scrollTo(0, 0);
  }, [activeCategory]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="container">
      <header>
        <h1>Thư Viện Prompt</h1>
        <p>Khám phá và sao chép các prompt thịnh hành để tạo ra những bức ảnh ấn tượng.</p>
        <div className="instructions">
          <h3>HƯỚNG DẪN</h3>
          <p>
            Sao chép prompt, mở Gemini <a href="https://ai.studio/apps/drive/1RC8KRvWHTpLpzRA5ol0pQJXEmgqZNBJW" target="_blank" rel="noopener noreferrer">tại đây</a>, sau đó tải ảnh của bạn lên và dán prompt để tạo ảnh.
          </p>
        </div>
      </header>
      <main>
        <div className="filters" role="tablist" aria-label="Lọc theo danh mục">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              role="tab"
              aria-selected={activeCategory === cat.name}
              onClick={() => handleSetCategory(cat.name)}
              className={activeCategory === cat.name ? 'active' : ''}
            >
              <span>{cat.emoji}</span>
              {cat.name}
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

        {!isLoading && hasMore && prompts.length > 0 && (
          <div className="load-more-container">
            <button 
              onClick={() => setPage(p => p + 1)} 
              className="load-more-button"
              disabled={isLoading}
            >
              {isLoading ? 'ĐANG TẢI...' : 'TẢI THÊM'}
            </button>
          </div>
        )}

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
              href="https://www.facebook.com/hoai.nghia.truong.2025/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Hoài Nghĩa
            </a>{' '}
            | © {new Date().getFullYear()}
          </span>
          <a
            href="https://t.me/hoainghia86"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-button"
          >
            Feedback
          </a>
        </div>
      </footer>
      <button 
        onClick={scrollToTop} 
        className={`scroll-to-top-button ${showScrollButton ? 'visible' : ''}`}
        aria-label="Cuộn lên đầu trang"
        tabIndex={showScrollButton ? 0 : -1}
      >
        <ArrowUpIcon />
      </button>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}