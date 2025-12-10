import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Edit2, Search, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WORK_FIELDS = ["호스팅", "광고", "패키지", "BI·CI·로고", "퍼블리싱", "UX·UI", "편집", "웹"];
const TOOLS = ["포토샵", "일러스트", "인디자인", "아임웹", "피그마", "PPT", "DW", "XD"];
const ITEMS_PER_PAGE = 10;

const AdminDesigners = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [designers, setDesigners] = useState<any[]>([]);
  const [filteredDesigners, setFilteredDesigners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  
  const [selectedDesigner, setSelectedDesigner] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedWorkFields, setSelectedWorkFields] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDesigner, setEditedDesigner] = useState<any>(null);

  useEffect(() => {
    checkAccess();
    loadDesigners();
  }, []);

  useEffect(() => {
    filterDesigners();
  }, [searchQuery, designers, sortOrder]);

  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "manager"]);

    if (!roles || roles.length === 0) {
      navigate("/dashboard");
    }
  };

  const loadDesigners = async () => {
    try {
      const { data, error } = await supabase
        .from("designers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDesigners(data || []);
      setFilteredDesigners(data || []);
    } catch (error) {
      console.error("Error loading designers:", error);
      toast({
        title: "오류 발생",
        description: "디자이너 목록을 불러올 수 없습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterDesigners = () => {
    let filtered = designers;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = designers.filter(designer => {
        const nameMatch = designer.name?.toLowerCase().includes(query);
        const workFieldMatch = designer.work_fields?.some((field: string) => 
          field.toLowerCase().includes(query)
        );
        const toolMatch = designer.tools?.some((tool: string) => 
          tool.toLowerCase().includes(query)
        );
        return nameMatch || workFieldMatch || toolMatch;
      });
    }
    
    // Sort by status if sortOrder is set
    if (sortOrder) {
      const statusPriority: Record<string, number> = { '여유': 1, '보통': 2, '바쁨': 3 };
      filtered = [...filtered].sort((a, b) => {
        const aPriority = statusPriority[a.status || '보통'] || 2;
        const bPriority = statusPriority[b.status || '보통'] || 2;
        return sortOrder === 'asc' ? aPriority - bPriority : bPriority - aPriority;
      });
    }
    
    setFilteredDesigners(filtered);
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    if (sortOrder === null) setSortOrder('asc');
    else if (sortOrder === 'asc') setSortOrder('desc');
    else setSortOrder(null);
  };

  const handleViewDetails = (designer: any) => {
    setSelectedDesigner(designer);
    setEditedDesigner(designer);
    setSelectedWorkFields(designer.work_fields || []);
    setSelectedTools(designer.tools || []);
    setIsEditing(false);
    setIsDetailOpen(true);
  };

  const toggleWorkField = (field: string) => {
    setSelectedWorkFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const toggleTool = (tool: string) => {
    setSelectedTools(prev => 
      prev.includes(tool) 
        ? prev.filter(t => t !== tool)
        : [...prev, tool]
    );
  };

  const handleSaveDesigner = async () => {
    if (!selectedDesigner || !editedDesigner) return;
    
    try {
      const { error } = await supabase
        .from("designers")
        .update({
          work_fields: selectedWorkFields,
          tools: selectedTools,
          birth_date: editedDesigner.birth_date,
          hire_date: editedDesigner.hire_date,
          total_vacation_days: editedDesigner.total_vacation_days,
          remaining_vacation_days: editedDesigner.remaining_vacation_days,
          is_part_time: editedDesigner.is_part_time,
          part_time_hours: editedDesigner.part_time_hours,
          status: editedDesigner.status,
          notes: editedDesigner.notes,
        })
        .eq("id", selectedDesigner.id);

      if (error) throw error;

      toast({
        title: "저장 완료",
        description: "디자이너 정보가 업데이트되었습니다.",
      });

      loadDesigners();
      setIsEditing(false);
      setIsDetailOpen(false);
    } catch (error) {
      console.error("Error updating designer:", error);
      toast({
        title: "오류 발생",
        description: "디자이너 정보를 업데이트할 수 없습니다.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "바쁨":
        return "bg-red-50 text-red-600 border border-red-200";
      case "여유":
        return "bg-blue-50 text-blue-600 border border-blue-200";
      case "보통":
        return "bg-amber-50 text-amber-600 border border-amber-200";
      default:
        return "bg-amber-50 text-amber-600 border border-amber-200";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}`;
  };

  // Pagination
  const totalPages = Math.ceil(filteredDesigners.length / ITEMS_PER_PAGE);
  const paginatedDesigners = filteredDesigners.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="이름, 업무분야 또는 활용툴로 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card border-0 h-12"
        />
      </div>

      {/* Designer List Card */}
      <div className="bg-card rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">
          디자이너 <span className="text-primary">({filteredDesigners.length})</span>
        </h2>

        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">이름</TableHead>
              <TableHead className="text-muted-foreground font-medium">업무분야</TableHead>
              <TableHead className="text-muted-foreground font-medium">활용툴</TableHead>
              <TableHead className="text-muted-foreground font-medium">
                <button 
                  onClick={toggleSortOrder}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  유형
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">입사일</TableHead>
              <TableHead className="text-muted-foreground font-medium">총 연차</TableHead>
              <TableHead className="text-muted-foreground font-medium">잔여 연차</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">상세보기</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDesigners.map((designer) => (
              <TableRow key={designer.id} className="border-b border-border/30 hover:bg-muted/30">
                <TableCell className="font-medium py-4">
                  {designer.name}
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex gap-2 text-sm">
                    {designer.work_fields?.slice(0, 3).map((field: string, idx: number) => (
                      <span key={idx}>{field}</span>
                    ))}
                    {designer.work_fields?.length > 3 && (
                      <span className="text-muted-foreground">+{designer.work_fields.length - 3}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex gap-2 text-sm">
                    {designer.tools?.slice(0, 3).map((tool: string, idx: number) => (
                      <span key={idx}>{tool}</span>
                    ))}
                    {designer.tools?.length > 3 && (
                      <span className="text-muted-foreground">+{designer.tools.length - 3}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusBadge(designer.status || "보통")}`}>
                    {designer.status || "보통"}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-sm">
                  {formatDate(designer.hire_date)}
                </TableCell>
                <TableCell className="py-4 text-sm">
                  {designer.total_vacation_days ?? "-"}
                </TableCell>
                <TableCell className="py-4 text-sm">
                  {designer.remaining_vacation_days ?? "-"}
                </TableCell>
                <TableCell className="py-4 text-right">
                  <button
                    onClick={() => handleViewDetails(designer)}
                    className="text-sm text-foreground underline hover:text-primary"
                  >
                    상세보기
                  </button>
                </TableCell>
              </TableRow>
            ))}
            {paginatedDesigners.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  {searchQuery ? "검색 결과가 없습니다." : "등록된 디자이너가 없습니다."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/30">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`flex items-center gap-1 text-sm px-4 py-2 rounded-md border transition-colors ${
              currentPage === 1
                ? 'border-border/50 text-muted-foreground bg-muted/30 cursor-not-allowed'
                : 'border-border bg-background text-foreground hover:bg-muted/50'
            }`}
          >
            ← 이전
          </button>
          
          <div className="flex items-center gap-1">
            {totalPages > 0 ? (
              getPageNumbers().map((page, idx) => (
                typeof page === 'number' ? (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-sm rounded-md transition-colors ${
                      currentPage === page 
                        ? 'bg-muted text-foreground font-medium' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={idx} className="text-muted-foreground px-1">...</span>
                )
              ))
            ) : (
              <button className="w-8 h-8 text-sm rounded-md bg-muted text-foreground font-medium">1</button>
            )}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages || 1, prev + 1))}
            disabled={currentPage >= totalPages || totalPages <= 1}
            className={`flex items-center gap-1 text-sm px-4 py-2 rounded-md border transition-colors ${
              currentPage >= totalPages || totalPages <= 1
                ? 'border-border/50 text-muted-foreground bg-muted/30 cursor-not-allowed'
                : 'border-border bg-background text-foreground hover:bg-muted/50'
            }`}
          >
            다음 →
          </button>
        </div>
      </div>

      {/* Designer Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>디자이너 상세정보</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                {isEditing ? "취소" : "수정"}
              </Button>
            </div>
          </DialogHeader>
          {selectedDesigner && editedDesigner && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">이름</label>
                  <p className="text-base">{selectedDesigner.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">생년월일</label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedDesigner.birth_date || ""}
                      onChange={(e) => setEditedDesigner({...editedDesigner, birth_date: e.target.value})}
                    />
                  ) : (
                    <p className="text-base">
                      {selectedDesigner.birth_date
                        ? new Date(selectedDesigner.birth_date).toLocaleDateString("ko-KR")
                        : "-"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">연락처</label>
                  <p className="text-base">{selectedDesigner.contact || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">입사일</label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedDesigner.hire_date || ""}
                      onChange={(e) => setEditedDesigner({...editedDesigner, hire_date: e.target.value})}
                    />
                  ) : (
                    <p className="text-base">
                      {selectedDesigner.hire_date
                        ? new Date(selectedDesigner.hire_date).toLocaleDateString("ko-KR")
                        : "-"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">총 연차</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedDesigner.total_vacation_days || ""}
                      onChange={(e) => setEditedDesigner({...editedDesigner, total_vacation_days: e.target.value ? parseInt(e.target.value) : null})}
                      placeholder="일수 입력"
                    />
                  ) : (
                    <p className="text-base">{selectedDesigner.total_vacation_days ? `${selectedDesigner.total_vacation_days}일` : "-"}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">잔여 연차</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedDesigner.remaining_vacation_days !== null && editedDesigner.remaining_vacation_days !== undefined ? editedDesigner.remaining_vacation_days : ""}
                      onChange={(e) => setEditedDesigner({...editedDesigner, remaining_vacation_days: e.target.value ? parseInt(e.target.value) : null})}
                      placeholder="일수 입력"
                    />
                  ) : (
                    <p className="text-base text-primary font-semibold">
                      {selectedDesigner.remaining_vacation_days !== null && selectedDesigner.remaining_vacation_days !== undefined ? `${selectedDesigner.remaining_vacation_days}일` : "-"}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">업무분야</label>
                <div className="flex gap-2 flex-wrap">
                  {WORK_FIELDS.map((field) => (
                    <Button
                      key={field}
                      variant={selectedWorkFields.includes(field) ? "default" : "outline"}
                      size="sm"
                      onClick={() => isEditing && toggleWorkField(field)}
                      className="text-xs"
                      disabled={!isEditing}
                    >
                      {field}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">활용도구</label>
                <div className="flex gap-2 flex-wrap">
                  {TOOLS.map((tool) => (
                    <Button
                      key={tool}
                      variant={selectedTools.includes(tool) ? "default" : "outline"}
                      size="sm"
                      onClick={() => isEditing && toggleTool(tool)}
                      className="text-xs"
                      disabled={!isEditing}
                    >
                      {tool}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">파트타임 여부</label>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Switch
                        checked={editedDesigner.is_part_time || false}
                        onCheckedChange={(checked) => setEditedDesigner({...editedDesigner, is_part_time: checked})}
                      />
                      <span>{editedDesigner.is_part_time ? "파트타임" : "풀타임"}</span>
                    </div>
                  ) : (
                    <p className="text-base">
                      {selectedDesigner.is_part_time
                        ? `파트타임 (${selectedDesigner.part_time_hours || "미정"}시간)`
                        : "풀타임"}
                    </p>
                  )}
                </div>
                {isEditing && editedDesigner.is_part_time && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">파트타임 시간</label>
                    <Input
                      type="number"
                      value={editedDesigner.part_time_hours || ""}
                      onChange={(e) => setEditedDesigner({...editedDesigner, part_time_hours: parseInt(e.target.value)})}
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">상태</label>
                  {isEditing ? (
                    <Select
                      value={editedDesigner.status || "보통"}
                      onValueChange={(value) => setEditedDesigner({...editedDesigner, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card">
                        <SelectItem value="바쁨">바쁨</SelectItem>
                        <SelectItem value="보통">보통</SelectItem>
                        <SelectItem value="여유">여유</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusBadge(selectedDesigner.status || "보통")}`}>
                        {selectedDesigner.status || "보통"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">기타 메모</label>
                {isEditing ? (
                  <Textarea
                    value={editedDesigner.notes || ""}
                    onChange={(e) => setEditedDesigner({...editedDesigner, notes: e.target.value})}
                    rows={4}
                  />
                ) : (
                  <p className="text-base whitespace-pre-wrap">
                    {selectedDesigner.notes || "-"}
                  </p>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedDesigner(selectedDesigner);
                      setSelectedWorkFields(selectedDesigner.work_fields || []);
                      setSelectedTools(selectedDesigner.tools || []);
                    }}
                  >
                    취소
                  </Button>
                  <Button onClick={handleSaveDesigner}>
                    저장
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDesigners;