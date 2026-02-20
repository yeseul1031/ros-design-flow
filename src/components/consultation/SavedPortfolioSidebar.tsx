import { X } from "lucide-react";

interface SavedItem {
  id: string;
  image: string;
  title: string;
  type: 'liked' | 'uploaded';
}

interface SavedPortfolioSidebarProps {
  savedItems: SavedItem[];
  onRemove: (id: string) => void;
  onSearch: () => void;
}

export const SavedPortfolioSidebar = ({ savedItems, onRemove, onSearch }: SavedPortfolioSidebarProps) => {
  const hasItems = savedItems.length > 0;

  return (
    <div
      style={{
        width: '360px',
        borderRadius: '6px',
        background: '#1E1E1E',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Portfolio preview area */}
      <div
        style={{
          width: '360px',
          minHeight: '320px',
          borderRadius: '6px',
          padding: '36px',
          background: '#1E1E1E',
          display: 'flex',
          flexDirection: 'column',
          alignItems: hasItems ? 'stretch' : 'center',
          justifyContent: hasItems ? 'flex-start' : 'center',
        }}
      >
        {hasItems ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {savedItems.map((item) => (
              <div
                key={item.id}
                style={{
                  width: '158px',
                  height: '158px',
                  borderRadius: '4px',
                  padding: '6px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {item.image.startsWith('http') ? (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '4px',
                      background: 'linear-gradient(135deg, rgba(235,75,41,0.2), rgba(235,75,41,0.05))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px',
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', fontWeight: 500, color: '#EB4B29', marginBottom: '4px' }}>참고사이트</div>
                      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', wordBreak: 'break-all', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{item.image}</div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '4px',
                    }}
                  />
                )}
                <button
                  onClick={() => onRemove(item.id)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '16px',
                    padding: '8px',
                    background: 'rgba(17,17,17,0.6)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X style={{ width: '16px', height: '16px', color: '#FFFFFF' }} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              width: '169px',
              textAlign: 'center',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '24px',
              letterSpacing: '-0.025em',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            적합한 매칭을 위해<br />
            포트폴리오를 선택해 주세요<br />
            (최대 8개)
          </div>
        )}
      </div>

      {/* Match button */}
      <button
        onClick={onSearch}
        style={{
          width: '360px',
          height: '56px',
          borderRadius: '6px',
          padding: '16px',
          marginTop: '8px',
          background: hasItems ? '#EB4B29' : '#3D3D3D',
          border: 'none',
          cursor: hasItems ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: '16px',
            lineHeight: '24px',
            letterSpacing: '-0.025em',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          매칭 시작 ({savedItems.length}/8)
        </span>
      </button>
    </div>
  );
};
