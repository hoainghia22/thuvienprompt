import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import PocketBase from 'pocketbase';
import './index.css';

const POCKETBASE_URL = 'https://api.cafenho.site';
const CATEGORIES = ["NAM", "NỮ", "COUPLE", "BÉ TRAI", "BÉ GÁI", "MẸ BẦU", "PROMPT KHÁC"];
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

// --- COMPONENTS ---
const PromptCard: React.FC<{ record: PromptRecord }> = React.memo(({ record }) => {
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
});

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
  const abortControllerRef = useRef<AbortController | null>(null);
  // FIX: Add a state to trigger refetching for real-time updates.
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Data fetching logic, triggered by page or category changes
  useEffect(() => {
    // Abort previous request to prevent race conditions
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchPrompts = async () => {
      // The loading state is now set in the event handler for a more responsive UI
      try {
        const filter = activeCategory ? `category ~ "%${activeCategory}%"` : '';
        const result = await pb
          .collection('prompt')
          .getList<PromptRecord>(page, PROMPTS_PER_PAGE, {
            filter: filter,
            sort: '-created',
            signal: controller.signal,
          });
        
        // Only update state if the request was not aborted
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
        // Only stop loading if this request is the latest one
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchPrompts();

    return () => {
      controller.abort();
    };
    // FIX: Add refetchTrigger to dependency array to allow manual refetching.
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

  // Real-time subscription - runs only once
  useEffect(() => {
    const promise = pb.collection('prompt').subscribe('*', () => {
      if (page === 1) {
         // If already on page 1, trigger a refetch for the current category
        // FIX: The spread operator cannot be used on a string. Use a dedicated state to trigger the effect.
        setRefetchTrigger(t => t + 1); // Force re-trigger of useEffect
      } else {
        // Otherwise, reset to page 1 to show the newest data
        setPage(1);
      }
      setHasMore(true);
    });

    return () => {
      promise.then((unsubscribe) => unsubscribe());
    };
  }, [page]); // Depend on page to correctly handle re-triggering

  const handleSetCategory = useCallback((category: string) => {
    if (category === activeCategory) return;
    
    // Set UI state synchronously for immediate feedback
    setActiveCategory(category);
    setPage(1);
    setPrompts([]); 
    setHasMore(true); 
    setIsLoading(true); 
    setError(null);
    window.scrollTo(0, 0);
  }, [activeCategory]);

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
              href="https://github.com/hoainghia22"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Hoài Nghĩa
            </a>{' '}
            | © {new Date().getFullYear()}
          </span>
          <a
            href="mailto:feedback.cafenho@gmail.com?subject=Feedback for Thư Viện Prompt"
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
