import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smile, Palette, Image, Megaphone, Package, Share2, CircleDot, Tag, Heart, Settings } from "lucide-react";
import { SavedPortfolioSidebar } from "@/components/consultation/SavedPortfolioSidebar";
import { ImageUploadDialog } from "@/components/consultation/ImageUploadDialog";
import { PortfolioManager } from "@/components/portfolio/PortfolioManager";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/integrations/supabase/client";
import searchIcon from "@/assets/search-icon.svg";
import fileUploadIcon from "@/assets/file-upload-icon.svg";

import { useToast } from "@/hooks/use-toast";

const categories = [
  { name: "전체", icon: Smile },
  { name: "UI/UX", icon: Palette },
  { name: "편집", icon: Image },
  { name: "광고배너", icon: Megaphone },
  { name: "패키지", icon: Package },
  { name: "SNS", icon: Share2 },
  { name: "로고", icon: CircleDot },
  { name: "배너", icon: Tag },
];

const filterTags = [
  "전체보기", "제품홍보", "UIUX디자인", "스토리보드제작", "배너광고",
  "썸네일", "SNS제작", "기업설명", "명함디자인", "카드뉴스",
  "고객감사", "바이럴제작", "공모전 디자인", "강의",
  "홈페이지 제작", "국경일기념", "이메일", "프로모션"
];

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
  const [sortOrder, setSortOrder] = useState("latest");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [portfolioManagerOpen, setPortfolioManagerOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(40);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

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
        keywords: img.keywords || []
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
      <Header />
      <ImageUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleImageUpload}
        onUrlSubmit={handleUrlSubmit}
      />
      {/* Hero Section */}
      <section 
        className="flex items-center justify-center"
        style={{ paddingTop: '120px', paddingBottom: '48px', paddingLeft: '24px', paddingRight: '24px' }}
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

          {/* Category Buttons */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => toggleCategory(category.name)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                  selectedCategories.includes(category.name)
                    ? "bg-white/10 border border-[#EB4B29]"
                    : "bg-white/5 hover:bg-white/10 border border-transparent"
                }`}
              >
                <category.icon className="h-6 w-6 text-white/80" />
                <span className="text-xs font-medium text-white/80">{category.name}</span>
              </button>
            ))}
          </div>

          {/* Keyword Tags */}
          <div className="pt-4" style={{ borderTop: '1px solid #414141' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#FFFFFF80' }}>디자이너매칭 키워드</h3>
            <div className="flex flex-wrap gap-2">
              {filterTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all border ${
                    selectedTags.includes(tag)
                      ? "bg-[#EB4B29] text-white border-[#EB4B29]"
                      : "bg-transparent text-white/70 hover:bg-white/10 border-[#414141]"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-12 px-4 flex-1 flex">
        <div className="mx-auto flex-1 flex gap-6" style={{ maxWidth: '1260px', width: '100%' }}>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-32 border-[#414141] bg-transparent text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">최신순</SelectItem>
                    <SelectItem value="relevant">관련도순</SelectItem>
                    <SelectItem value="popular">인기순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <span className="text-sm" style={{ color: '#FFFFFF80' }}>
                총 {portfolioItems.filter(item => selectedCategories.includes("전체") || selectedCategories.includes(item.category)).length}건
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
              {visibleCount < portfolioItems.filter(item => selectedCategories.includes("전체") || selectedCategories.includes(item.category)).length && (
                <Button size="lg" className="px-12" onClick={() => setVisibleCount((c) => c + 40)}>
                  더보기
                </Button>
              )}
            </div>
          </div>
          
          <div className="w-80 flex flex-col gap-3">
            <SavedPortfolioSidebar 
              savedItems={savedItems}
              onRemove={handleRemoveSaved}
            />
            {savedItems.length > 0 && (
              <Button 
                onClick={handleSearchDesigners}
                className="w-full h-12 text-base font-semibold"
              >
                크리에이터 검색
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Portfolio Manager Dialog */}
      <PortfolioManager 
        open={portfolioManagerOpen} 
        onOpenChange={setPortfolioManagerOpen} 
      />
      <Footer />
    </div>
  );
};

export default Consultation;
