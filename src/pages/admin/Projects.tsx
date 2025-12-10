import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ArrowUpDown, ChevronsUpDown, Check, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const ITEMS_PER_PAGE = 10;

const AdminProjects = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [newEndDate, setNewEndDate] = useState("");
  const [designers, setDesigners] = useState<Record<string, string>>({});
  const [allDesigners, setAllDesigners] = useState<any[]>([]);
  const [assigningProject, setAssigningProject] = useState<any>(null);
  const [selectedDesignerId, setSelectedDesignerId] = useState("");
  const [endDateReason, setEndDateReason] = useState("");
  const [designerSearchOpen, setDesignerSearchOpen] = useState(false);

  // Search and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  useEffect(() => {
    checkAccess();
    loadProjects();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const [isAdmin, isManager] = await Promise.all([
      supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' }),
      supabase.rpc('has_role', { _user_id: user.id, _role: 'manager' }),
    ]);

    if (!(isAdmin.data || isManager.data)) {
      navigate("/dashboard");
      return;
    }
  };

  const loadProjects = async () => {
    try {
      const { data: projData, error: projError } = await supabase
        .from("projects")
        .select("*");

      if (projError) throw projError;

      const projectsList = projData || [];
      const userIds = Array.from(new Set(projectsList.map((p: any) => p.user_id).filter(Boolean)));

      let profilesById: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, email, name, company")
          .in("id", userIds);

        if (profilesError) throw profilesError;
        profilesById = Object.fromEntries((profilesData || []).map((p: any) => [p.id, p]));
      }

      const { data: designersData } = await supabase
        .from("designers")
        .select("id, name");
      
      const designersMap = Object.fromEntries((designersData || []).map((d: any) => [d.id, d.name]));
      setDesigners(designersMap);
      setAllDesigners(designersData || []);

      const now = new Date();
      const updatedProjects = projectsList.map((p: any) => {
        const endDate = new Date(p.end_date);
        const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        let status = p.status;
        if (p.status === 'active' && daysUntilExpiry <= 7 && daysUntilExpiry >= 0) {
          status = 'expiring_soon';
        }
        
        return { ...p, status, profile: profilesById[p.user_id] || null };
      });

      for (const proj of updatedProjects) {
        if (proj.status !== projectsList.find((p: any) => p.id === proj.id)?.status) {
          await supabase
            .from("projects")
            .update({ status: proj.status })
            .eq("id", proj.id);
        }
      }

      const sorted = updatedProjects.sort((a: any, b: any) => {
        if (a.status === 'expiring_soon' && b.status !== 'expiring_soon') return -1;
        if (a.status !== 'expiring_soon' && b.status === 'expiring_soon') return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setProjects(sorted);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast({
        title: "오류 발생",
        description: (error as any)?.message || "프로젝트 목록을 불러올 수 없습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort projects
  const getFilteredProjects = () => {
    let filtered = projects;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = projects.filter(project =>
        project.profile?.name?.toLowerCase().includes(query) ||
        project.profile?.email?.toLowerCase().includes(query) ||
        project.profile?.company?.toLowerCase().includes(query)
      );
    }
    if (sortOrder) {
      const statusPriority: Record<string, number> = { 
        'expiring_soon': 1, 
        'active': 2, 
        'on_hold': 3, 
        'completed': 4 
      };
      filtered = [...filtered].sort((a, b) => {
        const aPriority = statusPriority[a.status] || 5;
        const bPriority = statusPriority[b.status] || 5;
        return sortOrder === 'asc' ? aPriority - bPriority : bPriority - aPriority;
      });
    }
    return filtered;
  };

  const filteredProjects = getFilteredProjects();
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE));
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleSortOrder = () => {
    if (sortOrder === null) setSortOrder('asc');
    else if (sortOrder === 'asc') setSortOrder('desc');
    else setSortOrder(null);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 8) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 5) {
        for (let i = 1; i <= 8; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 4) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 7; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "expiring_soon":
        return "bg-red-50 text-red-600 border border-red-200";
      case "active":
        return "bg-blue-50 text-blue-600 border border-blue-200";
      case "completed":
        return "bg-muted text-muted-foreground border border-border";
      case "on_hold":
        return "bg-amber-50 text-amber-600 border border-amber-200";
      default:
        return "bg-muted text-muted-foreground border border-border";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "진행";
      case "on_hold": return "홀딩";
      case "expiring_soon": return "만료예정";
      case "completed": return "종료";
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleUpdateEndDate = async () => {
    if (!editingProject || !newEndDate || !endDateReason) {
      toast({
        title: "입력 오류",
        description: "종료일과 수정 사유를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const currentHistory = editingProject.end_date_history || [];
      const newHistory = [
        ...currentHistory,
        {
          previous_end_date: editingProject.end_date,
          new_end_date: newEndDate,
          reason: endDateReason,
          changed_at: new Date().toISOString(),
        },
      ];

      const { error } = await supabase
        .from("projects")
        .update({ 
          end_date: newEndDate,
          end_date_history: newHistory,
        })
        .eq("id", editingProject.id);

      if (error) throw error;

      toast({
        title: "성공",
        description: "종료일이 수정되었습니다.",
      });

      setEditingProject(null);
      setNewEndDate("");
      setEndDateReason("");
      loadProjects();
    } catch (error) {
      console.error("Error updating end date:", error);
      toast({
        title: "오류 발생",
        description: "종료일 수정에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleAssignDesigner = async () => {
    if (!assigningProject) {
      toast({
        title: "입력 오류",
        description: "프로젝트를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("projects")
        .update({ assigned_designer_id: selectedDesignerId === "none" ? null : (selectedDesignerId || null) })
        .eq("id", assigningProject.id);

      if (error) throw error;

      toast({
        title: "배정 완료",
        description: selectedDesignerId === "none" || !selectedDesignerId ? "디자이너 배정이 해제되었습니다." : "디자이너가 배정되었습니다.",
      });

      setAssigningProject(null);
      setSelectedDesignerId("");
      setDesignerSearchOpen(false);
      loadProjects();
    } catch (error) {
      console.error("Error assigning designer:", error);
      toast({
        title: "오류 발생",
        description: "디자이너 배정에 실패했습니다.",
        variant: "destructive",
      });
    }
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
          placeholder="이름, 이메일 또는 회사명으로 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card border-0 h-12"
        />
      </div>

      {/* Project List Card */}
      <div className="bg-card rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">
          프로젝트 <span className="text-primary">({filteredProjects.length})</span>
        </h2>

        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">회사명 / 이름</TableHead>
              <TableHead className="text-muted-foreground font-medium">시작일</TableHead>
              <TableHead className="text-muted-foreground font-medium">종료일</TableHead>
              <TableHead className="text-muted-foreground font-medium">
                <button 
                  onClick={toggleSortOrder}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  상태
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">홀딩횟수</TableHead>
              <TableHead className="text-muted-foreground font-medium">계약횟수</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProjects.map((project) => (
              <TableRow key={project.id} className="border-b border-border/30 hover:bg-muted/30">
                <TableCell className="py-4">
                  <div>
                    <div className="font-medium">{project.profile?.company || project.profile?.name || "-"}</div>
                    {project.profile?.company && (
                      <div className="text-sm text-muted-foreground">{project.profile?.name}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4 text-sm">
                  {formatDate(project.start_date)}
                </TableCell>
                <TableCell className="py-4 text-sm">
                  {formatDate(project.end_date)}
                </TableCell>
                <TableCell className="py-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusStyle(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-sm">
                  {project.pause_count || 0}/2
                </TableCell>
                <TableCell className="py-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-sm underline underline-offset-2 hover:text-primary">
                        {project.contract_count === 1 ? "신규" : `${project.contract_count}회차`}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-card">
                      <div className="space-y-2">
                        <h4 className="font-medium">계약 히스토리</h4>
                        {project.contract_history && project.contract_history.length > 0 ? (
                          project.contract_history.map((history: any, idx: number) => (
                            <div key={idx} className="border-b pb-2 last:border-0">
                              <p className="text-sm font-medium">
                                {idx === 0 ? "신규" : `${idx + 1}회차`} - {designers[history.designer_id] || "미배정"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(history.start_date)} ~ {formatDate(history.end_date)}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="border-b pb-2">
                            <p className="text-sm font-medium">
                              신규 - {project.assigned_designer_id ? designers[project.assigned_designer_id] : "미배정"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(project.start_date)} ~ {formatDate(project.end_date)}
                            </p>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell className="py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => {
                            setAssigningProject(project);
                            setSelectedDesignerId(project.assigned_designer_id || "");
                          }}
                        >
                          배정
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card">
                        <DialogHeader>
                          <DialogTitle>디자이너 배정</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="designer">디자이너 선택</Label>
                            <Popover open={designerSearchOpen} onOpenChange={setDesignerSearchOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={designerSearchOpen}
                                  className="w-full justify-between"
                                >
                                  {selectedDesignerId
                                    ? allDesigners.find((d) => d.id === selectedDesignerId)?.name
                                    : "디자이너를 선택하세요"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0 bg-card">
                                <Command>
                                  <CommandInput placeholder="디자이너 검색..." />
                                  <CommandList>
                                    <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                                    <CommandGroup>
                                      <CommandItem
                                        value="선택안함"
                                        onSelect={() => {
                                          setSelectedDesignerId("");
                                          setDesignerSearchOpen(false);
                                        }}
                                      >
                                        <Check className={cn("mr-2 h-4 w-4", selectedDesignerId === "" ? "opacity-100" : "opacity-0")} />
                                        선택안함
                                      </CommandItem>
                                      {allDesigners.map((designer) => (
                                        <CommandItem
                                          key={designer.id}
                                          value={designer.name}
                                          onSelect={() => {
                                            setSelectedDesignerId(designer.id);
                                            setDesignerSearchOpen(false);
                                          }}
                                        >
                                          <Check className={cn("mr-2 h-4 w-4", selectedDesignerId === designer.id ? "opacity-100" : "opacity-0")} />
                                          {designer.name}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setAssigningProject(null);
                                setSelectedDesignerId("");
                              }}
                            >
                              취소
                            </Button>
                            <Button onClick={handleAssignDesigner}>
                              배정
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog 
                      open={editingProject?.id === project.id} 
                      onOpenChange={(open) => {
                        if (!open) {
                          setEditingProject(null);
                          setNewEndDate("");
                          setEndDateReason("");
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => {
                            setEditingProject(project);
                            setNewEndDate(project.end_date);
                          }}
                        >
                          종료일 수정
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card">
                        <DialogHeader>
                          <DialogTitle>종료일 수정</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="endDate">현재 종료일</Label>
                            <Input
                              value={editingProject ? formatDate(editingProject.end_date) : ""}
                              disabled
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newEndDate">새 종료일</Label>
                            <Input
                              id="newEndDate"
                              type="date"
                              value={newEndDate}
                              onChange={(e) => setNewEndDate(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reason">수정 사유</Label>
                            <Textarea
                              id="reason"
                              placeholder="종료일을 수정하는 사유를 입력하세요"
                              value={endDateReason}
                              onChange={(e) => setEndDateReason(e.target.value)}
                              rows={3}
                            />
                          </div>
                          {editingProject && editingProject.end_date_history && editingProject.end_date_history.length > 0 && (
                            <div className="space-y-2 border-t pt-4">
                              <Label className="flex items-center gap-2">
                                <History className="h-4 w-4" />
                                수정 히스토리
                              </Label>
                              <div className="max-h-40 overflow-y-auto space-y-2">
                                {editingProject.end_date_history.map((history: any, idx: number) => (
                                  <div key={idx} className="text-sm border-b pb-2 last:border-0">
                                    <p className="font-medium">
                                      {formatDate(history.previous_end_date)} → {formatDate(history.new_end_date)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{history.reason}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(history.changed_at).toLocaleString("ko-KR")}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingProject(null);
                                setNewEndDate("");
                                setEndDateReason("");
                              }}
                            >
                              취소
                            </Button>
                            <Button onClick={handleUpdateEndDate}>
                              수정
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedProjects.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {searchQuery ? "검색 결과가 없습니다." : "등록된 프로젝트가 없습니다."}
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
            {getPageNumbers().map((page, idx) => (
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
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-1 text-sm px-4 py-2 rounded-md border transition-colors ${
              currentPage === totalPages
                ? 'border-border/50 text-muted-foreground bg-muted/30 cursor-not-allowed'
                : 'border-border bg-background text-foreground hover:bg-muted/50'
            }`}
          >
            다음 →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProjects;
