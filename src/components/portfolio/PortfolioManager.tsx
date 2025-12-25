import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, X, Upload } from "lucide-react";

interface PortfolioImage {
  id: string;
  image_url: string;
  category: string;
  keywords: string[];
  display_order: number;
  is_active: boolean;
}

interface PreviewFile {
  file: File;
  preview: string;
}

interface PortfolioManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  "UI/UX",
  "편집",
  "광고배너",
  "패키지",
  "SNS",
  "로고",
  "배너"
];

// Storage path mapping (한글 -> 영문)
const CATEGORY_PATH_MAP: Record<string, string> = {
  "UI/UX": "uiux",
  "편집": "editing",
  "광고배너": "ad-banner",
  "패키지": "package",
  "SNS": "sns",
  "로고": "logo",
  "배너": "banner"
};

const KEYWORDS = [
  "제품홍보", "UIUX디자인", "스토리보드제작", "배너광고",
  "썸네일", "SNS제작", "기업설명", "명함디자인", "카드뉴스",
  "고객감사", "바이럴제작", "공모전 디자인", "강의",
  "홈페이지 제작", "국경일기념", "이메일", "프로모션"
];

export const PortfolioManager = ({ open, onOpenChange }: PortfolioManagerProps) => {
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [customKeywordInput, setCustomKeywordInput] = useState("");
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const handleAddCustomKeyword = () => {
    const trimmed = customKeywordInput.trim();
    if (trimmed && !selectedKeywords.includes(trimmed) && !KEYWORDS.includes(trimmed)) {
      setSelectedKeywords(prev => [...prev, trimmed]);
      setCustomKeywordInput("");
    }
  };

  const handleCustomKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomKeyword();
    }
  };

  useEffect(() => {
    if (open) {
      // 다이얼로그 열 때 미리보기 상태 초기화
      setPreviewFiles([]);
      setSelectedCategories([]);
      setSelectedKeywords([]);
      setCustomKeywordInput('');
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

  // Handle file selection for preview
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPreviews: PreviewFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: `${file.name}: 파일 크기는 5MB를 초과할 수 없습니다`,
          variant: "destructive",
        });
        continue;
      }

      const preview = URL.createObjectURL(file);
      newPreviews.push({ file, preview });
    }

    setPreviewFiles(prev => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  // Remove preview file
  const removePreviewFile = (index: number) => {
    setPreviewFiles(prev => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Clear all previews
  const clearAllPreviews = () => {
    previewFiles.forEach(pf => URL.revokeObjectURL(pf.preview));
    setPreviewFiles([]);
  };

  // Upload all preview files
  const handleUploadAll = async () => {
    if (selectedCategories.length === 0) {
      toast({
        title: "카테고리를 먼저 선택해주세요",
        variant: "destructive",
      });
      return;
    }

    if (previewFiles.length === 0) {
      toast({
        title: "업로드할 이미지를 선택해주세요",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const newImages: PortfolioImage[] = [];

    try {
      for (let i = 0; i < previewFiles.length; i++) {
        const { file } = previewFiles[i];

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const primaryCategory = selectedCategories[0];
        const storagePath = CATEGORY_PATH_MAP[primaryCategory] || 'general';
        const filePath = `${storagePath}/${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('portfolio')
          .upload(filePath, file);

        if (uploadError) {
          console.error(`Error uploading ${file.name}:`, uploadError);
          toast({
            title: `${file.name} 업로드 실패`,
            description: uploadError.message,
            variant: "destructive",
          });
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('portfolio')
          .getPublicUrl(filePath);

        // Get max display order
        const maxOrder = [...images, ...newImages].length > 0 
          ? Math.max(...[...images, ...newImages].map(img => img.display_order)) 
          : 0;

        // Insert into database
        const { data: newImage, error: dbError } = await supabase
          .from('portfolio_images')
          .insert({
            image_url: publicUrl,
            category: primaryCategory,
            keywords: selectedKeywords,
            display_order: maxOrder + 1,
          })
          .select()
          .single();

        if (dbError) {
          console.error(`Error saving ${file.name} to database:`, dbError);
          toast({
            title: `${file.name} DB 저장 실패`,
            description: dbError.message,
            variant: "destructive",
          });
          continue;
        }

        newImages.push(newImage);
      }

      if (newImages.length > 0) {
        // Refresh images from database to get accurate list
        const { data: refreshedImages } = await supabase
          .from('portfolio_images')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        
        if (refreshedImages) {
          setImages(refreshedImages);
        }
        
        // Clear all preview states
        previewFiles.forEach(pf => URL.revokeObjectURL(pf.preview));
        setPreviewFiles([]);
        setSelectedCategories([]);
        setSelectedKeywords([]);
        setCustomKeywordInput('');
        
        toast({
          title: `${newImages.length}개의 이미지가 등록되었습니다`,
        });
      }
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast({
        title: "이미지 업로드에 실패했습니다",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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
              {/* Category Selection - Multi-select Buttons */}
              <div className="space-y-2">
                <Label>카테고리 선택 * (중복 선택 가능)</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all border ${
                        selectedCategories.includes(cat)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-muted border-border"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keyword Selection - Multi-select Buttons */}
              <div className="space-y-2">
                <Label>키워드 선택 (중복 선택 가능)</Label>
                <div className="flex flex-wrap gap-2">
                  {KEYWORDS.map(keyword => (
                    <button
                      key={keyword}
                      type="button"
                      onClick={() => toggleKeyword(keyword)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all border ${
                        selectedKeywords.includes(keyword)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-muted border-border"
                      }`}
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Keyword Input */}
              <div className="space-y-2">
                <Label>커스텀 키워드 추가</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="키워드 입력 후 Enter"
                    value={customKeywordInput}
                    onChange={(e) => setCustomKeywordInput(e.target.value)}
                    onKeyPress={handleCustomKeyPress}
                    className="max-w-xs"
                  />
                  <Button type="button" variant="outline" onClick={handleAddCustomKeyword}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Selected Keywords Display */}
              {selectedKeywords.length > 0 && (
                <div className="space-y-2">
                  <Label>선택된 키워드</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedKeywords.map(keyword => (
                      <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                        {keyword}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => toggleKeyword(keyword)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  이미지 선택
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <span className="text-sm text-muted-foreground">
                  최대 5MB, JPG/PNG/GIF, 여러 파일 선택 가능
                </span>
              </div>

              {/* Preview Section */}
              {previewFiles.length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <Label>미리보기 ({previewFiles.length}개)</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {previewFiles.map((pf, index) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden border aspect-square">
                        <img
                          src={pf.preview}
                          alt={pf.file.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePreviewFile(index)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    onClick={handleUploadAll}
                    disabled={uploading || selectedCategories.length === 0}
                    className="w-full"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        업로드 중...
                      </>
                    ) : (
                      `등록하기 (${previewFiles.length}개)`
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : images.length === 0 && previewFiles.length === 0 ? (
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
                  <div className="grid grid-cols-5 gap-3">
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
