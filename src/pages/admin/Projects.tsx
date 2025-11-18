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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, History, UserPlus, ChevronsUpDown, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

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

  useEffect(() => {
    checkAccess();
    loadProjects();
  }, []);

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
          .select("id, email, name")
          .in("id", userIds);

        if (profilesError) throw profilesError;
        profilesById = Object.fromEntries((profilesData || []).map((p: any) => [p.id, p]));
      }

      // Load designers for contract history
      const { data: designersData } = await supabase
        .from("designers")
        .select("id, name");
      
      const designersMap = Object.fromEntries((designersData || []).map((d: any) => [d.id, d.name]));
      setDesigners(designersMap);
      setAllDesigners(designersData || []);

      // Update status based on end_date (7 days before expiry)
      const now = new Date();
      const updatedProjects = projectsList.map((p: any) => {
        const endDate = new Date(p.end_date);
        const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        let status = p.status;
        // Auto-update to expiring_soon if within 7 days and currently active
        if (p.status === 'active' && daysUntilExpiry <= 7 && daysUntilExpiry >= 0) {
          status = 'expiring_soon';
        }
        
        return { ...p, status, profile: profilesById[p.user_id] || null };
      });

      // Update database for projects that need status change
      for (const proj of updatedProjects) {
        if (proj.status !== projectsList.find((p: any) => p.id === proj.id)?.status) {
          await supabase
            .from("projects")
            .update({ status: proj.status })
            .eq("id", proj.id);
        }
      }

      // Sort: expiring_soon first, then by created_at desc
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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      active: { label: "진행중", variant: "default" },
      on_hold: { label: "홀딩중", variant: "secondary" },
      expiring_soon: { label: "만료예정", variant: "destructive" },
      completed: { label: "종료", variant: "outline" },
    };

    const config = statusConfig[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
      // Add new history entry
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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">프로젝트 관리</h1>
        </div>

        <div className="bg-card rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>브랜드명</TableHead>
                <TableHead>디자이너</TableHead>
                <TableHead>시작일</TableHead>
                <TableHead>종료일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>홀딩 횟수</TableHead>
                <TableHead>계약횟수</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    {project.profile?.name || project.profile?.email || "-"}
                  </TableCell>
                  <TableCell>
                    {project.assigned_designer_id ? designers[project.assigned_designer_id] || "-" : "선택안함"}
                  </TableCell>
                  <TableCell>
                    {new Date(project.start_date).toLocaleDateString("ko-KR")}
                  </TableCell>
                  <TableCell>
                    {new Date(project.end_date).toLocaleDateString("ko-KR")}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(project.status)}
                  </TableCell>
                  <TableCell>{project.pause_count} / 2</TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <History className="h-4 w-4" />
                          {project.contract_count === 1 && "신규"}
                          {project.contract_count >= 2 && `${project.contract_count}회차`}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-medium">계약 히스토리</h4>
                          {project.contract_history && project.contract_history.length > 0 ? (
                            project.contract_history.map((history: any, idx: number) => (
                              <div key={idx} className="border-b pb-2 last:border-0">
                                <p className="text-sm font-medium">
                                  {idx === 0 ? "신규" : `${idx + 1}회차`} - {designers[history.designer_id] || "홍길동"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(history.start_date).toLocaleDateString("ko-KR")} ~ {new Date(history.end_date).toLocaleDateString("ko-KR")}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="border-b pb-2">
                              <p className="text-sm font-medium">
                                신규 - {project.assigned_designer_id ? designers[project.assigned_designer_id] : "홍길동"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(project.start_date).toLocaleDateString("ko-KR")} ~ {new Date(project.end_date).toLocaleDateString("ko-KR")}
                              </p>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setAssigningProject(project);
                              setSelectedDesignerId(project.assigned_designer_id || "");
                            }}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            디자이너 배정
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
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
                                <PopoverContent className="w-full p-0">
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
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingProject(project);
                              setNewEndDate(project.end_date);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            종료일 수정
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>종료일 수정</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label htmlFor="endDate">현재 종료일</Label>
                              <Input
                                value={editingProject ? new Date(editingProject.end_date).toLocaleDateString("ko-KR") : ""}
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
                                        {new Date(history.previous_end_date).toLocaleDateString("ko-KR")} → {new Date(history.new_end_date).toLocaleDateString("ko-KR")}
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
              {projects.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground"
                  >
                    등록된 프로젝트가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminProjects;
