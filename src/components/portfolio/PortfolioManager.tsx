import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, X, GripVertical, Upload } from "lucide-react";

interface PortfolioImage {
  id: string;
  image_url: string;
  category: string;
  keywords: string[];
  display_order: number;
  is_active: boolean;
}

interface PortfolioManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  "제품홍보",
  "스토리보드제작",
  "강의",
  "브랜딩",
  "웹디자인",
  "SNS콘텐츠",
  "영상편집",
  "인쇄물",
  "기타"
];

export const PortfolioManager = ({ open, onOpenChange }: PortfolioManagerProps) => {
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchImages();
    }
  }, [open]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching portfolio images:', error);
      toast({
        title: "이미지를 불러오는데 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedCategory) {
      toast({
        title: "카테고리를 먼저 선택해주세요",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "파일 크기는 5MB를 초과할 수 없습니다",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${selectedCategory}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);

      // Get max display order
      const maxOrder = images.length > 0 
        ? Math.max(...images.map(img => img.display_order)) 
        : 0;

      // Insert into database
      const { data: newImage, error: dbError } = await supabase
        .from('portfolio_images')
        .insert({
          image_url: publicUrl,
          category: selectedCategory,
          keywords: keywords,
          display_order: maxOrder + 1,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setImages([...images, newImage]);
      setKeywords([]);
      setKeywordInput("");
      
      toast({
        title: "이미지가 업로드되었습니다",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "이미지 업로드에 실패했습니다",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (image: PortfolioImage) => {
    try {
      // Extract file path from URL
      const url = new URL(image.image_url);
      const pathParts = url.pathname.split('/portfolio/');
      const filePath = pathParts[pathParts.length - 1];

      // Delete from storage
      await supabase.storage
        .from('portfolio')
        .remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('id', image.id);

      if (error) throw error;

      setImages(images.filter(img => img.id !== image.id));
      
      toast({
        title: "이미지가 삭제되었습니다",
      });
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast({
        title: "이미지 삭제에 실패했습니다",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const groupedImages = images.reduce((acc, img) => {
    if (!acc[img.category]) {
      acc[img.category] = [];
    }
    acc[img.category].push(img);
    return acc;
  }, {} as Record<string, PortfolioImage[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>포트폴리오 관리</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>카테고리 선택 *</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>키워드 추가</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="키워드 입력 후 Enter"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <Button type="button" variant="outline" onClick={handleAddKeyword}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keywords.map(keyword => (
                    <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                      {keyword}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveKeyword(keyword)}
                      />
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4">
                <Label
                  htmlFor="image-upload"
                  className={`flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent transition-colors ${
                    uploading || !selectedCategory ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  이미지 업로드
                </Label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading || !selectedCategory}
                />
                <span className="text-sm text-muted-foreground">
                  최대 5MB, JPG/PNG/GIF
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Images List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              등록된 포트폴리오 이미지가 없습니다
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedImages).map(([category, categoryImages]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>{category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      ({categoryImages.length}개)
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categoryImages.map(image => (
                      <div 
                        key={image.id} 
                        className="relative group rounded-lg overflow-hidden border"
                      >
                        <img
                          src={image.image_url}
                          alt=""
                          className="w-full aspect-square object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteImage(image)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {image.keywords && image.keywords.length > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                            <div className="flex flex-wrap gap-1">
                              {image.keywords.slice(0, 3).map((keyword, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                              {image.keywords.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{image.keywords.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
