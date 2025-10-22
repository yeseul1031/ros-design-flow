import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Smile, Palette, Image, Megaphone, Package, Share2, CircleDot, Tag } from "lucide-react";

const categories = [
  { name: "보험", icon: Smile },
  { name: "UI/UX", icon: Palette },
  { name: "편집", icon: Image },
  { name: "광고제작", icon: Megaphone },
  { name: "패키지", icon: Package },
  { name: "SNS", icon: Share2 },
  { name: "로고", icon: CircleDot },
  { name: "배너", icon: Tag },
];

const filterTags = [
  "전체보기", "제품홍보", "UIUX디자인", "스토리보드제작", "배너광고",
  "썸네일", "SNS제작", "기업설명", "명함디자인", "카드뉴스",
  "고객감사", "바이럴제작", "기업설명", "공모전 디자인", "강의",
  "홈페이지 제작", "국경일기념", "이메일", "프로모션"
];

const portfolioItems = [
  { id: 1, color: "from-blue-400 to-blue-600", title: "JSOOP" },
  { id: 2, color: "from-purple-400 to-purple-600", title: "LEVEL UP" },
  { id: 3, color: "from-gray-800 to-black", title: "FINAL" },
  { id: 4, color: "from-green-600 to-green-800", title: "EVENT" },
  { id: 5, color: "from-pink-400 to-pink-600", title: "OPEN" },
  { id: 6, color: "from-yellow-400 to-yellow-600", title: "BURGER" },
  { id: 7, color: "from-green-700 to-green-900", title: "PRODUCT" },
  { id: 8, color: "from-gray-900 to-black", title: "BRAND" },
  { id: 9, color: "from-pink-300 to-pink-500", title: "FESTIVAL" },
  { id: 10, color: "from-purple-600 to-purple-800", title: "GRAND OPEN" },
  { id: 11, color: "from-green-400 to-green-600", title: "SPECIAL" },
  { id: 12, color: "from-pink-600 to-fuchsia-600", title: "EVENT" },
];

const Consultation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("UI/UX");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#3b4a8c] via-[#2d3a70] to-[#1e2a5a] py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="text-white space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
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
                placeholder="키워드를 입력 >"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 text-lg"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                검색
              </Button>
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
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">카테고리 선택</h3>
            <div className="flex flex-wrap gap-2">
              {filterTags.map((tag, index) => (
                <Badge
                  key={index}
                  variant={index === 0 ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-1.5"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-bold">최신순</h2>
              <span className="text-sm text-muted-foreground">만도도&gt; 반도도&gt;</span>
            </div>
            <button className="text-sm text-primary hover:underline">
              더보기 3,562건&gt;
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {portfolioItems.map((item) => (
              <div
                key={item.id}
                className={`relative aspect-[3/4] rounded-lg bg-gradient-to-br ${item.color} cursor-pointer hover:scale-105 transition-transform shadow-lg overflow-hidden group`}
              >
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl p-4">
                  <span className="text-center">{item.title}</span>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Button size="lg" className="px-12">
              더보기
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Consultation;
