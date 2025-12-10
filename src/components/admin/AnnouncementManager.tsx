import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { MoreVertical } from "lucide-react";

interface Announcement {
  id: string;
  category: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  is_pinned: boolean;
}

const CATEGORIES = [
  { value: "공지", label: "공지" },
  { value: "이벤트", label: "이벤트" },
  { value: "업데이트", label: "업데이트" },
  { value: "안내", label: "안내" },
];

export const AnnouncementManager = () => {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    content: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error loading announcements:", error);
      toast({
        title: "오류 발생",
        description: "공지사항을 불러올 수 없습니다.",
        variant: "destructive",
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("announcements")
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("announcements")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const imageUrl = await uploadImage();

      if (editingAnnouncement) {
        // Update existing
        const updateData: any = {
          category: formData.category,
          title: formData.title,
          content: formData.content,
        };
        if (imageUrl) {
          updateData.image_url = imageUrl;
        }

        const { error } = await supabase
          .from("announcements")
          .update(updateData)
          .eq("id", editingAnnouncement.id);

        if (error) throw error;

        toast({
          title: "성공",
          description: "공지사항이 수정되었습니다.",
        });
      } else {
        // Create new
        const { error } = await supabase.from("announcements").insert({
          category: formData.category,
          title: formData.title,
          content: formData.content,
          image_url: imageUrl,
          created_by: user.id,
        });

        if (error) throw error;

        toast({
          title: "성공",
          description: "공지사항이 등록되었습니다.",
        });
      }

      setFormData({ category: "", title: "", content: "" });
      setImageFile(null);
      setEditingAnnouncement(null);
      setActiveTab("list");
      loadAnnouncements();
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast({
        title: "오류 발생",
        description: "공지사항 저장에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePin = async (announcement: Announcement) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .update({ is_pinned: !announcement.is_pinned })
        .eq("id", announcement.id);

      if (error) throw error;

      toast({
        title: "성공",
        description: announcement.is_pinned ? "상단 고정이 해제되었습니다." : "상단에 고정되었습니다.",
      });

      loadAnnouncements();
    } catch (error) {
      console.error("Error toggling pin:", error);
      toast({
        title: "오류 발생",
        description: "상단 고정 변경에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      category: announcement.category,
      title: announcement.title,
      content: announcement.content,
    });
    setActiveTab("create");
  };

  const handleDelete = async (id: string, imageUrl: string | null) => {
    try {
      if (imageUrl) {
        const path = imageUrl.split("/").pop();
        if (path) {
          await supabase.storage.from("announcements").remove([path]);
        }
      }

      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "성공",
        description: "공지사항이 삭제되었습니다.",
      });

      loadAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "오류 발생",
        description: "공지사항 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}`;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        if (value === "list") {
          setEditingAnnouncement(null);
          setFormData({ category: "", title: "", content: "" });
          setImageFile(null);
        }
      }}>
        <div className="bg-muted/50 rounded-xl border border-border/50 p-1.5">
          <TabsList className="w-full grid grid-cols-2 bg-transparent h-auto p-0">
            <TabsTrigger 
              value="list" 
              className="rounded-lg py-3 text-sm font-medium bg-transparent data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground"
            >
              공지사항
            </TabsTrigger>
            <TabsTrigger 
              value="create" 
              className="rounded-lg py-3 text-sm font-medium bg-transparent data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground"
            >
              공지작성
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="mt-6">
          <div className="divide-y divide-border/50">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="py-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {announcement.is_pinned && (
                        <span className="text-xs font-medium text-primary border border-primary rounded px-1.5 py-0.5">
                          중요
                        </span>
                      )}
                      <h3 className="font-medium text-foreground">
                        [{announcement.category}] {announcement.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {announcement.content}
                    </p>
                    {announcement.image_url && (
                      <img
                        src={announcement.image_url}
                        alt={announcement.title}
                        className="mt-3 rounded-lg max-w-xs max-h-48 object-cover"
                      />
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(announcement.created_at)}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card">
                      <DropdownMenuItem onClick={() => handleEdit(announcement)}>
                        수정하기
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTogglePin(announcement)}>
                        {announcement.is_pinned ? "상단고정해제" : "상단고정"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(announcement.id, announcement.image_url)}
                        className="text-destructive"
                      >
                        삭제하기
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                등록된 공지사항이 없습니다.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="공지사항 제목"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="공지사항 내용"
                rows={8}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">이미지 첨부 (선택)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "저장 중..." : editingAnnouncement ? "수정" : "등록"}
              </Button>
              {editingAnnouncement && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setEditingAnnouncement(null);
                    setFormData({ category: "", title: "", content: "" });
                    setImageFile(null);
                  }}
                >
                  취소
                </Button>
              )}
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};