import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import PocketBase from 'pocketbase';

const POCKETBASE_URL = 'https://api.cafenho.site';
const CATEGORIES = ["NAM", "NỮ", "COUPLE", "BÉ TRAI", "BÉ GÁI", "MẸ BẦU", "PROMPT KHÁC"];
const PAGE_SIZES = [10, 20, 50];

const pb = new PocketBase(POCKETBASE_URL);

interface PromptRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  prompt: string;
  url: string;
  publishUrl: string;
}

// Fix: Explicitly type PromptCard as a React.FC (FunctionComponent).
// This helps TypeScript correctly handle special React props like 'key' and avoids type errors when using the component in a list.
const PromptCard: React.FC<{ record: PromptRecord }> = ({ record }) => {
  const [copied, setCopied] = useState(false);
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
      <img src={record.publishUrl} alt={`Prompt image for ${record.id}`} loading="lazy" />
      <div className="card-overlay">
        <button onClick={handleCopy} className={copied ? 'copied' : ''}>
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

const PaginationControls = ({
  page,
  totalPages,
  totalItems,
  perPage,
  setPage,
  setPerPage,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  setPage: (page: number) => void;
  setPerPage: (size: number) => void;
}) => {
  if (totalPages <= 1) return null;
  
  const itemsOnPage =
    page < totalPages ? perPage : totalItems - perPage * (totalPages - 1);
  return (
    <div className="pagination-controls">
      <div className="pagination-info">
        Trang {page} / {totalPages} | {itemsOnPage} Prompt trên trang
      </div>
      <div className="pagination-actions">
        {PAGE_SIZES.map((size) => (
          <button
            key={size}
            onClick={() => setPerPage(size)}
            className={perPage === size ? 'active' : ''}
          >
            {size}
          </button>
        ))}
        <button onClick={() => setPage(page - 1)} disabled={page <= 1}>
          &lt;
        </button>
        <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
          &gt;
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const [prompts, setPrompts] = useState<PromptRecord[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    setError(null);
    let requestAborted = false;
    try {
      const filter = activeCategory ? `category = "${activeCategory}"` : '';
      const result = await pb
        .collection('prompt')
        .getList<PromptRecord>(page, perPage, {
          filter: filter,
          sort: '-created',
        });
      setPrompts(result.items);
      setPage(result.page);
      setPerPage(result.perPage);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
    } catch (err: any) {
      if (err && err.isAbort) {
        requestAborted = true;
        console.log('Request was auto-cancelled.');
      } else {
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        console.error(err);
      }
    } finally {
      if (!requestAborted) {
        setLoading(false);
      }
    }
  }, [page, perPage, activeCategory]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  useEffect(() => {
    const promise = pb.collection('prompt').subscribe('*', () => {
      fetchPrompts();
    });

    return () => {
      promise.then((unsubscribe) => unsubscribe());
    };
  }, [fetchPrompts]);

  const handleSetCategory = (category: string) => {
    setPage(1);
    setActiveCategory(category);
  };

  const handleSetPerPage = (size: number) => {
    setPage(1);
    setPerPage(size);
  }

  return (
    <div className="container">
      <header>
        <h1>Thư Viện Prompt</h1>
        <p>Khám phá và sao chép các prompt thịnh hành để tạo ra những bức ảnh ấn tượng.</p>
        <div className="instructions">
          <h3>HƯỚNG DẪN</h3>
          <p>
            Sao chép prompt sau đó vào Gemini <a href="https://ai.studio/apps/drive/1RC8KRvWHTpLpzRA5ol0pQJXEmgqZNBJW" target="_blank" rel="noopener noreferrer">tại đây</a>, chọn tạo hình ảnh tự do, upload ảnh mặt cá nhân và dán prompt để tạo ảnh.
          </p>
        </div>
      </header>
      <main>
        <div className="filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleSetCategory(cat)}
              className={activeCategory === cat ? 'active' : ''}
            >
              {cat}
            </button>
          ))}
        </div>
        <PaginationControls
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          perPage={perPage}
          setPage={setPage}
          setPerPage={handleSetPerPage}
        />
        {loading && (
          <div className="prompt-gallery">
            {Array.from({ length: perPage }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        )}
        {error && <div className="error">{error}</div>}
        {!loading && !error && (
          <>
            <div className="prompt-gallery">
              {prompts.map((p) => (
                <PromptCard key={p.id} record={p} />
              ))}
            </div>
            {prompts.length === 0 && (
              <div className="empty-state">
                <p>Không tìm thấy prompt nào cho danh mục này.</p>
              </div>
            )}
          </>
        )}
        <PaginationControls
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          perPage={perPage}
          setPage={setPage}
          setPerPage={handleSetPerPage}
        />
      </main>
      <footer>
        <span>Phát triển bởi Hoài Nghĩa | © {new Date().getFullYear()}</span>
        <button className="footer-button">Feedback</button>
      </footer>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
