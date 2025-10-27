import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File) => void;
  onUrlSubmit: (url: string) => void;
}

export const ImageUploadDialog = ({ open, onOpenChange, onUpload, onUrlSubmit }: ImageUploadDialogProps) => {
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "파일 크기 초과",
          description: "10MB 이하의 이미지만 업로드 가능합니다.",
          variant: "destructive",
        });
        return;
      }
      onUpload(file);
      onOpenChange(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!url.trim()) {
      toast({
        title: "URL을 입력해주세요",
        variant: "destructive",
      });
      return;
    }
    onUrlSubmit(url);
    setUrl("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>레퍼런스 추가</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="image" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="image">이미지 업로드</TabsTrigger>
            <TabsTrigger value="url">사이트 주소</TabsTrigger>
          </TabsList>
          
          <TabsContent value="image" className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 hover:border-primary transition-colors cursor-pointer relative">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                클릭하여 이미지를 업로드하세요
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="url" className="space-y-4">
            <div className="flex items-center gap-2">
              <Link className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
            </div>
            <Button onClick={handleUrlSubmit} className="w-full">
              추가
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
