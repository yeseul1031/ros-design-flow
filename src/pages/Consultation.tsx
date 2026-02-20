import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logoSvg from "@/assets/logo.svg";
import { ChevronDown, Image, Heart, Settings } from "lucide-react";
import { SavedPortfolioSidebar } from "@/components/consultation/SavedPortfolioSidebar";
import { ImageUploadDialog } from "@/components/consultation/ImageUploadDialog";
import { PortfolioManager } from "@/components/portfolio/PortfolioManager";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/integrations/supabase/client";
import searchIcon from "@/assets/search-icon.svg";
import fileUploadIcon from "@/assets/file-upload-icon.svg";

import { useToast } from "@/hooks/use-toast";

const categoryNames = [
  "전체", "브랜드", "홈페이지", "편집물", "기업 디자인", "배너", "디지털페이지", "패키지"
];

const industryOptions = [
  "업종 전체", "뷰티", "패션", "의료헬스케어", "F&B",
  "여행&레저", "IT&B2B", "문화컨텐츠"
];

const sortOptions = [
  "정확도순", "최신순", "인기순"
];

const industryToTag: Record<string, string> = {
  "업종 전체": "전체보기",
  "뷰티": "뷰티", "패션": "패션", "의료헬스케어": "의료헬스케어",
  "F&B": "F&B", "여행&레저": "여행&레저", "IT&B2B": "IT&B2B", "문화컨텐츠": "문화컨텐츠",
};

// Helper function to toggle items in array
const toggleArrayItem = <T,>(arr: T[], item: T): T[] => {
  if (arr.includes(item)) {
    return arr.filter(i => i !== item);
  }
  return [...arr, item];
};

interface PortfolioItem {
  id: string;
  image: string;
  title: string;
  category: string;
  keywords: string[];
  search_tags: string[];
}

interface SavedItem {
  id: string;
  image: string;
  title: string;
  type: 'liked' | 'uploaded';
}

const Consultation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useAdminCheck();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["전체"]);
  const [selectedTags, setSelectedTags] = useState<string[]>(["전체보기"]);
  const [selectedIndustry, setSelectedIndustry] = useState("업종 전체");
  const [sortOrder, setSortOrder] = useState("정확도순");
  const [industryDropdownOpen, setIndustryDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [portfolioManagerOpen, setPortfolioManagerOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(40);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch portfolio images from database
  const fetchPortfolioImages = async () => {
    const { data, error } = await supabase
      .from('portfolio_images')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (data && !error) {
      const items: PortfolioItem[] = data.map(img => ({
        id: img.id,
        image: img.image_url,
        title: img.category,
        category: img.category,
        keywords: img.keywords || [],
        search_tags: (img as any).search_tags || []
      }));
      setPortfolioItems(items);
    }
  };

  useEffect(() => {
    fetchPortfolioImages();
  }, []);

  // Refresh portfolio when manager closes
  useEffect(() => {
    if (!portfolioManagerOpen) {
      fetchPortfolioImages();
    }
  }, [portfolioManagerOpen]);

  const toggleCategory = (category: string) => {
    if (category === "전체") {
      setSelectedCategories(["전체"]);
    } else {
      setSelectedCategories(prev => {
        const newCats = prev.filter(c => c !== "전체");
        if (newCats.includes(category)) {
          const filtered = newCats.filter(c => c !== category);
          return filtered.length === 0 ? ["전체"] : filtered;
        }
        return [...newCats, category];
      });
    }
    setVisibleCount(40);
  };

  const toggleTag = (tag: string) => {
    if (tag === "전체보기") {
      setSelectedTags(["전체보기"]);
    } else {
      setSelectedTags(prev => {
        const newTags = prev.filter(t => t !== "전체보기");
        if (newTags.includes(tag)) {
          const filtered = newTags.filter(t => t !== tag);
          return filtered.length === 0 ? ["전체보기"] : filtered;
        }
        return [...newTags, tag];
      });
    }
  };

  const handleLike = (itemId: string, item: PortfolioItem) => {
    setLikedItems(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(itemId)) {
        newLiked.delete(itemId);
        setSavedItems(saved => saved.filter(s => s.id !== `liked-${itemId}`));
      } else {
        newLiked.add(itemId);
        setSavedItems(saved => [...saved, {
          id: `liked-${itemId}`,
          image: item.image,
          title: item.title,
          type: 'liked'
        }]);
      }
      return newLiked;
    });
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newItem: SavedItem = {
        id: `uploaded-${Date.now()}`,
        image: e.target?.result as string,
        title: file.name,
        type: 'uploaded'
      };
      setSavedItems(prev => [...prev, newItem]);
      toast({
        title: "이미지가 추가되었습니다",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (url: string) => {
    const newItem: SavedItem = {
      id: `uploaded-${Date.now()}`,
      image: url,
      title: "참고 사이트",
      type: 'uploaded'
    };
    setSavedItems(prev => [...prev, newItem]);
    toast({
      title: "사이트가 추가되었습니다",
    });
  };

  const handleRemoveSaved = (id: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
    if (id.startsWith('liked-')) {
      const itemId = id.replace('liked-', '');
      setLikedItems(prev => {
        const newLiked = new Set(prev);
        newLiked.delete(itemId);
        return newLiked;
      });
    }
  };

  const handleSearchDesigners = () => {
    navigate('/loading', { state: { savedItems } });
  };

  return (
    <div className="min-h-screen flex flex-col text-white" style={{ background: '#111111' }}>
      {/* HEADER - Glassmorphism Navigation (same as Home) */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-6">
        <nav 
          className="w-full max-w-[1872px] h-16 flex items-center justify-between rounded-lg"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid transparent',
            borderImage: 'linear-gradient(135.77deg, rgba(255, 255, 255, 0.1) 13.6%, rgba(255, 255, 255, 0) 103.36%), linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))',
            borderImageSlice: '1',
            boxShadow: 'inset 0px 0px 12px 0px rgba(255, 255, 255, 0.1)',
            padding: '20px 24px',
          }}
        >
          <Link to="/" className="flex-shrink-0">
            <img src={logoSvg} alt="ROS Logo" className="w-[63px] h-[21px]" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/plan" className="text-white hover:opacity-80 transition-opacity" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>PLAN</Link>
            <Link to="/ai-matching" className="text-white hover:opacity-80 transition-opacity" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>AI MATCHING</Link>
            <div className="flex items-center">
              {isLoggedIn ? (
                <>
                  <button 
                    onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}
                    className="text-white hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer" 
                    style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}
                  >
                    로그아웃
                  </button>
                  <span className="text-white mx-2" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>/</span>
                  <Link to="/dashboard" className="text-white hover:opacity-80 transition-opacity" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>마이페이지</Link>
                </>
              ) : (
                <>
                  <Link to="/auth" className="text-white hover:opacity-80 transition-opacity" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>로그인</Link>
                  <span className="text-white mx-2" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>/</span>
                  <Link to="/auth?tab=signup" className="text-white hover:opacity-80 transition-opacity" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>회원가입</Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>
      <ImageUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleImageUpload}
        onUrlSubmit={handleUrlSubmit}
      />
      {/* Hero Section */}
      <section 
        className="flex items-center justify-center"
        style={{ paddingTop: '176px', paddingBottom: '48px', paddingLeft: '24px', paddingRight: '24px' }}
      >
        <div
          className="flex flex-col items-center"
          style={{ width: '1260px', maxWidth: '100%', gap: '24px' }}
        >
          <span
            style={{
              fontWeight: 400,
              fontSize: '20px',
              lineHeight: '28px',
              color: '#EB4B29',
              textAlign: 'center',
            }}
          >
            ai matching
          </span>
          <h1
            style={{
              fontWeight: 600,
              fontSize: '56px',
              lineHeight: '72px',
              letterSpacing: '-0.025em',
              color: '#FFFFFF',
              textAlign: 'center',
            }}
          >
            당신의 취향, 더 선명하게
          </h1>
          <p
            style={{
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '24px',
              letterSpacing: '-0.025em',
              color: '#FFFFFFCC',
              textAlign: 'center',
            }}
          >
            선택한 포트폴리오 기준으로, AI가 가장 어울리는 ROS 디자이너를 매칭합니다.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="flex justify-center" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
        <div style={{ width: '1260px', maxWidth: '100%', height: 'auto', gap: '24px', display: 'flex', flexDirection: 'column' }}>
          {/* Admin Portfolio Button */}
          {isAdmin && (
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPortfolioManagerOpen(true)}
                className="flex items-center gap-2 border-[#414141] text-white hover:bg-white/10"
              >
                <Settings className="h-4 w-4" />
                포트폴리오 관리
              </Button>
            </div>
          )}

          {/* Input Box */}
          <div
            className="flex items-center"
            style={{
              width: '100%',
              height: '56px',
              borderRadius: '6px',
              border: '1px solid #414141',
              padding: '0 16px',
              gap: '10px',
              background: 'transparent',
            }}
          >
            <img src={searchIcon} alt="search" style={{ width: '24px', height: '24px', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="검색 키워드를 입력해 주세요 (ex. 웹, 뷰티, 커머스)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                lineHeight: '24px',
                letterSpacing: '-0.025em',
                color: '#FFFFFF',
              }}
              className="placeholder:text-[#FFFFFF99]"
            />
            <button
              onClick={() => setUploadDialogOpen(true)}
              style={{ flexShrink: 0, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <img src={fileUploadIcon} alt="upload" style={{ width: '24px', height: '16px' }} />
            </button>
          </div>

          {/* Category Pills + Dropdown Filters */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {categoryNames.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className="transition-all"
                  style={{
                    minWidth: '71px',
                    height: '44px',
                    borderRadius: '9999px',
                    padding: '14px 16px',
                    fontSize: '14px',
                    lineHeight: '16px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    border: 'none',
                    background: selectedCategories.includes(cat) ? '#EB4B29' : '#1E1E1E',
                    color: selectedCategories.includes(cat) ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-3 relative">
              {/* 업종 전체 Dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setIndustryDropdownOpen(prev => !prev); setSortDropdownOpen(false); }}
                  style={{
                    minWidth: '71px',
                    height: '44px',
                    borderRadius: '9999px',
                    padding: '14px 16px',
                    fontSize: '14px',
                    lineHeight: '16px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    border: 'none',
                    background: '#1E1E1E',
                    color: 'rgba(255,255,255,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {selectedIndustry}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: industryDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {industryDropdownOpen && (
                  <div 
                    className="absolute top-full mt-2 left-0 z-50 py-2 rounded-lg"
                    style={{ background: '#1A1A1A', border: '1px solid #414141', minWidth: '160px' }}
                  >
                    {industryOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSelectedIndustry(option);
                          setSelectedTags([industryToTag[option]]);
                          setIndustryDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition-colors"
                        style={{
                          color: selectedIndustry === option ? '#EB4B29' : 'rgba(255,255,255,0.8)',
                          fontWeight: selectedIndustry === option ? 600 : 400,
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 정확도순 Dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setSortDropdownOpen(prev => !prev); setIndustryDropdownOpen(false); }}
                  style={{
                    minWidth: '71px',
                    height: '44px',
                    borderRadius: '9999px',
                    padding: '14px 16px',
                    fontSize: '14px',
                    lineHeight: '16px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    border: 'none',
                    background: '#1E1E1E',
                    color: 'rgba(255,255,255,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {sortOrder}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: sortDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {sortDropdownOpen && (
                  <div 
                    className="absolute top-full mt-2 right-0 z-50 py-2 rounded-lg"
                    style={{ background: '#1A1A1A', border: '1px solid #414141', minWidth: '140px' }}
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSortOrder(option);
                          setSortDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition-colors"
                        style={{
                          color: sortOrder === option ? '#EB4B29' : 'rgba(255,255,255,0.8)',
                          fontWeight: sortOrder === option ? 600 : 400,
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-12 px-4 flex-1 flex">
        <div className="mx-auto flex-1 flex gap-6" style={{ maxWidth: '1260px', width: '100%' }}>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm" style={{ color: '#FFFFFF80' }}>
                총 {portfolioItems
                  .filter(item => selectedCategories.includes("전체") || selectedCategories.includes(item.category))
                  .filter(item => selectedTags.includes("전체보기") || item.keywords?.some(k => selectedTags.includes(k)))
                  .filter(item => !searchQuery.trim() || 
                    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.keywords?.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    item.search_tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
                  ).length}건
              </span>
            </div>

            {portfolioItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Image className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg">등록된 포트폴리오가 없습니다</p>
                {isAdmin && (
                  <p className="text-sm mt-2">포트폴리오 관리에서 이미지를 등록해주세요</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {portfolioItems
                  .filter(item => selectedCategories.includes("전체") || selectedCategories.includes(item.category))
                  .filter(item => selectedTags.includes("전체보기") || item.keywords?.some(k => selectedTags.includes(k)))
                  .filter(item => !searchQuery.trim() || 
                    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.keywords?.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    item.search_tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .slice(0, visibleCount)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="relative aspect-[3/4] rounded-lg cursor-pointer hover:scale-105 transition-transform shadow-lg overflow-hidden group"
                    >
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <span className="text-white font-semibold">{item.title}</span>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                      <button
                        onClick={() => handleLike(item.id, item)}
                        className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm p-2 rounded-full hover:bg-black/60 transition-colors"
                      >
                        <Heart 
                          className={`h-5 w-5 ${likedItems.has(item.id) ? 'fill-red-500 text-red-500' : 'text-white'}`}
                        />
                      </button>
                    </div>
                  ))}
              </div>
            )}

            <div className="flex justify-center mt-12">
              {visibleCount < portfolioItems
                .filter(item => selectedCategories.includes("전체") || selectedCategories.includes(item.category))
                .filter(item => selectedTags.includes("전체보기") || item.keywords?.some(k => selectedTags.includes(k)))
                .filter(item => !searchQuery.trim() || 
                  item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.keywords?.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  item.search_tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
                ).length && (
                <Button size="lg" className="px-12" onClick={() => setVisibleCount((c) => c + 40)}>
                  더보기
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <SavedPortfolioSidebar 
              savedItems={savedItems}
              onRemove={handleRemoveSaved}
              onSearch={handleSearchDesigners}
            />
          </div>
        </div>
      </section>

      {/* Portfolio Manager Dialog */}
      <PortfolioManager 
        open={portfolioManagerOpen} 
        onOpenChange={setPortfolioManagerOpen} 
      />
      {/* FOOTER (same as Home) */}
      <footer style={{ background: '#1A1A1A', borderTop: '1px solid #333333' }}>
        <div className="max-w-[1260px] mx-auto px-6 py-12">
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-white" style={{ fontWeight: 600, fontSize: '56px', lineHeight: '72px', letterSpacing: '0' }}>
              Everything you<br />need in one subscription.
            </h2>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#999999' }}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
              <span>•</span>
              <a href="https://pf.kakao.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Kakao Talk</a>
              <span>•</span>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
          <div className="text-sm mb-2" style={{ color: '#666666' }}>
            <p>(주)알오에스 | 대표 최인나 |</p>
          </div>
          <div className="text-sm mb-6" style={{ color: '#666666' }}>
            <p>사업자등록번호 877-87-03752 | 경기 남양주시 별내3로 322 (별내동) 404 | 010-2166-5594 | manager@rosdesigns.com</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm" style={{ color: '#666666' }}>©ROS. All rights reserved.</p>
            <div className="flex items-center gap-8 text-sm" style={{ color: '#999999' }}>
              <a href="/terms" className="hover:text-white transition-colors">이용약관</a>
              <a href="/privacy" className="hover:text-white transition-colors">개인정보 처리방침</a>
              <a href="/refund" className="hover:text-white transition-colors">취소/환불 정책</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Consultation;
