import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Smile, Palette, Image, Megaphone, Package, Share2, CircleDot, Tag, ImagePlus, Heart } from "lucide-react";
import { SavedPortfolioSidebar } from "@/components/consultation/SavedPortfolioSidebar";
import { ImageUploadDialog } from "@/components/consultation/ImageUploadDialog";

import { useToast } from "@/hooks/use-toast";
import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import portfolio4 from "@/assets/portfolio-4.jpg";
import portfolio5 from "@/assets/portfolio-5.jpg";
import portfolio6 from "@/assets/portfolio-6.jpg";
import portfolio7 from "@/assets/portfolio-7.jpg";
import portfolio8 from "@/assets/portfolio-8.jpg";
import portfolio9 from "@/assets/portfolio-9.jpg";
import portfolio10 from "@/assets/portfolio-10.jpg";
import portfolio11 from "@/assets/portfolio-11.jpg";
import portfolio12 from "@/assets/portfolio-12.jpg";

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

const portfolioItems = [
  { id: 1, image: portfolio1, title: "제품 프로모션", category: "광고배너" },
  { id: 2, image: portfolio2, title: "소셜 미디어", category: "SNS" },
  { id: 3, image: portfolio3, title: "게임 이벤트", category: "배너" },
  { id: 4, image: portfolio4, title: "에코 제품", category: "패키지" },
  { id: 5, image: portfolio5, title: "럭셔리 브랜드", category: "패키지" },
  { id: 6, image: portfolio6, title: "버거 레스토랑", category: "광고배너" },
  { id: 7, image: portfolio7, title: "앱 UI/UX", category: "UI/UX" },
  { id: 8, image: portfolio8, title: "비즈니스 브랜딩", category: "로고" },
  { id: 9, image: portfolio9, title: "페스티벌", category: "편집" },
  { id: 10, image: portfolio10, title: "그랜드 오픈", category: "광고배너" },
  { id: 11, image: portfolio11, title: "웰니스 제품", category: "패키지" },
  { id: 12, image: portfolio12, title: "스페셜 이벤트", category: "SNS" },
  { id: 13, image: portfolio1, title: "신제품 출시", category: "광고배너" },
  { id: 14, image: portfolio2, title: "인스타그램 피드", category: "SNS" },
  { id: 15, image: portfolio3, title: "웹배너 디자인", category: "배너" },
  { id: 16, image: portfolio4, title: "친환경 패키징", category: "패키지" },
  { id: 17, image: portfolio5, title: "명품 브랜딩", category: "로고" },
  { id: 18, image: portfolio6, title: "푸드 마케팅", category: "편집" },
  { id: 19, image: portfolio7, title: "모바일 앱 디자인", category: "UI/UX" },
  { id: 20, image: portfolio8, title: "기업 로고", category: "로고" },
  { id: 21, image: portfolio9, title: "이벤트 포스터", category: "편집" },
  { id: 22, image: portfolio10, title: "오픈 기념", category: "배너" },
  { id: 23, image: portfolio11, title: "건강식품 패키지", category: "패키지" },
  { id: 24, image: portfolio12, title: "SNS 캠페인", category: "SNS" },
  { id: 25, image: portfolio1, title: "프로모션 배너", category: "광고배너" },
  { id: 26, image: portfolio2, title: "페이스북 광고", category: "SNS" },
  { id: 27, image: portfolio3, title: "게임 UI", category: "UI/UX" },
  { id: 28, image: portfolio4, title: "지속가능 패키지", category: "패키지" },
  { id: 29, image: portfolio5, title: "하이엔드 브랜드", category: "로고" },
  { id: 30, image: portfolio6, title: "레스토랑 메뉴", category: "편집" },
  { id: 31, image: portfolio7, title: "웹사이트 UI", category: "UI/UX" },
  { id: 32, image: portfolio8, title: "회사 CI", category: "로고" },
  { id: 33, image: portfolio9, title: "축제 홍보물", category: "편집" },
  { id: 34, image: portfolio10, title: "신규 오픈", category: "배너" },
  { id: 35, image: portfolio11, title: "화장품 패키지", category: "패키지" },
  { id: 36, image: portfolio12, title: "특별 이벤트", category: "SNS" },
  { id: 37, image: portfolio1, title: "상품 광고", category: "광고배너" },
  { id: 38, image: portfolio2, title: "소셜 콘텐츠", category: "SNS" },
  { id: 39, image: portfolio3, title: "배너 광고", category: "배너" },
  { id: 40, image: portfolio4, title: "친환경 제품", category: "패키지" },
  { id: 41, image: portfolio5, title: "프리미엄 로고", category: "로고" },
  { id: 42, image: portfolio6, title: "카페 브랜딩", category: "편집" },
  { id: 43, image: portfolio7, title: "대시보드 UI", category: "UI/UX" },
  { id: 44, image: portfolio8, title: "스타트업 로고", category: "로고" },
  { id: 45, image: portfolio9, title: "콘서트 포스터", category: "편집" },
  { id: 46, image: portfolio10, title: "매장 오픈", category: "배너" },
  { id: 47, image: portfolio11, title: "뷰티 패키지", category: "패키지" },
  { id: 48, image: portfolio12, title: "마케팅 캠페인", category: "SNS" },
  { id: 49, image: portfolio1, title: "할인 행사", category: "광고배너" },
  { id: 50, image: portfolio2, title: "인플루언서 콘텐츠", category: "SNS" },
  { id: 51, image: portfolio3, title: "홍보 배너", category: "배너" },
  { id: 52, image: portfolio4, title: "에코 브랜딩", category: "패키지" },
  { id: 53, image: portfolio5, title: "럭셔리 로고", category: "로고" },
  { id: 54, image: portfolio6, title: "식당 메뉴판", category: "편집" },
  { id: 55, image: portfolio7, title: "UX 리서치", category: "UI/UX" },
  { id: 56, image: portfolio8, title: "브랜드 아이덴티티", category: "로고" },
  { id: 57, image: portfolio9, title: "뮤직 페스티벌", category: "편집" },
  { id: 58, image: portfolio10, title: "그랜드 오프닝", category: "배너" },
  { id: 59, image: portfolio11, title: "스킨케어 패키지", category: "패키지" },
  { id: 60, image: portfolio12, title: "브랜드 캠페인", category: "SNS" },
  { id: 61, image: portfolio1, title: "시즌 프로모션", category: "광고배너" },
  { id: 62, image: portfolio2, title: "SNS 마케팅", category: "SNS" },
  { id: 63, image: portfolio3, title: "웹 배너", category: "배너" },
  { id: 64, image: portfolio4, title: "친환경 디자인", category: "패키지" },
  { id: 65, image: portfolio5, title: "고급 브랜드", category: "로고" },
  { id: 66, image: portfolio6, title: "음식점 브랜딩", category: "편집" },
  { id: 67, image: portfolio7, title: "사용자 경험", category: "UI/UX" },
  { id: 68, image: portfolio8, title: "기업 브랜딩", category: "로고" },
  { id: 69, image: portfolio9, title: "문화 행사", category: "편집" },
  { id: 70, image: portfolio10, title: "런칭 이벤트", category: "배너" },
];

interface SavedItem {
  id: string;
  image: string;
  title: string;
  type: 'liked' | 'uploaded';
}

const Consultation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedTags, setSelectedTags] = useState<string[]>(["전체보기"]);
  const [sortOrder, setSortOrder] = useState("latest");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());

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

  const handleLike = (itemId: number, item: typeof portfolioItems[0]) => {
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
      const itemId = parseInt(id.replace('liked-', ''));
      setLikedItems(prev => {
        const newLiked = new Set(prev);
        newLiked.delete(itemId);
        return newLiked;
      });
    }
  };

  const handleSearchDesigners = () => {
    navigate('/ai-matching', { state: { savedItems } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <ImageUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleImageUpload}
        onUrlSubmit={handleUrlSubmit}
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#3b4a8c] via-[#2d3a70] to-[#1e2a5a] py-20 px-4 mt-16">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="text-white space-y-4">
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight" style={{ fontFamily: 'Pretendard, -apple-system, sans-serif' }}>
                불필요한 과정 없이 쉽게<br />
                크리에이터 맞춤 매칭 솔루션
              </h1>
              <Button 
                variant="secondary" 
                className="mt-6 bg-white text-primary hover:bg-white/90"
              >
                서비스 안내
              </Button>
            </div>
            <div className="hidden md:block">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full"></div>
                <div className="absolute top-10 right-10 w-32 h-32 bg-blue-500 rounded-full"></div>
                <div className="absolute bottom-10 left-10 w-24 h-24 bg-indigo-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="키워드 입력"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 text-lg"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setUploadDialogOpen(true)}
                  className="h-10 w-10"
                >
                  <ImagePlus className="h-5 w-5" />
                </Button>
                <Button>
                  검색
                </Button>
              </div>
            </div>

            {/* Category Icons */}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4 mb-6">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                    selectedCategory === category.name
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <category.icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tags */}
      <section className="py-6 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="border-b pb-4">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">디자이너매칭</h3>
            <div className="flex flex-wrap gap-2">
              {filterTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-1.5"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-12 px-4 flex-1 flex">
        <div className="container mx-auto max-w-6xl flex-1 flex gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">최신순</SelectItem>
                    <SelectItem value="relevant">관련도순</SelectItem>
                    <SelectItem value="popular">인기순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <button className="text-sm text-primary hover:underline">
                더보기 3,562건&gt;
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {portfolioItems
                .filter(item => selectedCategory === "전체" || item.category === selectedCategory)
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
          </div>
          
          <SavedPortfolioSidebar 
            savedItems={savedItems}
            onRemove={handleRemoveSaved}
            onSearchDesigners={handleSearchDesigners}
          />
        </div>
      </section>
    </div>
  );
};

export default Consultation;
