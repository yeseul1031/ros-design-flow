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
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const AdminProjects = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [newEndDate, setNewEndDate] = useState("");
  const [designers, setDesigners] = useState<Record<string, string>>({});

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
        .select("*")
        .order("created_at", { ascending: false });

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

      const enriched = projectsList.map((p: any) => ({ ...p, profile: profilesById[p.user_id] || null }));
      setProjects(enriched);
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
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      paused: "secondary",
      completed: "outline",
      cancelled: "destructive",
    };

    const labels: Record<string, string> = {
      active: "진행 중",
      paused: "일시 중지",
      completed: "완료",
      cancelled: "취소됨",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const handleUpdateEndDate = async () => {
    if (!editingProject || !newEndDate) return;

    try {
      const { error } = await supabase
        .from("projects")
        .update({ end_date: newEndDate })
        .eq("id", editingProject.id);

      if (error) throw error;

      toast({
        title: "성공",
        description: "종료일이 수정되었습니다.",
      });

      setEditingProject(null);
      setNewEndDate("");
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
                    {project.assigned_designer_id ? designers[project.assigned_designer_id] : "홍길동"}
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
                    <Dialog>
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
                            <Label htmlFor="endDate">새 종료일</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={newEndDate}
                              onChange={(e) => setNewEndDate(e.target.value)}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingProject(null);
                                setNewEndDate("");
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
