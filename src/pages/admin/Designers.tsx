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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminDesigners = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [designers, setDesigners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDesigners, setSelectedDesigners] = useState<string[]>([]);
  const [selectedDesigner, setSelectedDesigner] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    checkAccess();
    loadDesigners();
  }, []);

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDesigners(designers.map((d) => d.id));
    } else {
      setSelectedDesigners([]);
    }
  };

  const handleSelectDesigner = (designerId: string, checked: boolean) => {
    if (checked) {
      setSelectedDesigners([...selectedDesigners, designerId]);
    } else {
      setSelectedDesigners(selectedDesigners.filter((id) => id !== designerId));
    }
  };

  const handleGrantDesignerRole = async () => {
    if (selectedDesigners.length === 0) {
      toast({
        title: "선택된 디자이너 없음",
        description: "권한을 부여할 디자이너를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const designerId of selectedDesigners) {
        const designer = designers.find((d) => d.id === designerId);
        if (!designer?.user_id) continue;

        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: designer.user_id, role: "designer" })
          .select()
          .single();

        if (error && !error.message.includes("duplicate")) {
          throw error;
        }
      }

      toast({
        title: "권한 부여 완료",
        description: `${selectedDesigners.length}명의 디자이너에게 권한을 부여했습니다.`,
      });
      setSelectedDesigners([]);
    } catch (error) {
      console.error("Error granting roles:", error);
      toast({
        title: "오류 발생",
        description: "권한 부여 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (designer: any) => {
    setSelectedDesigner(designer);
    setIsDetailOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "바쁨":
        return "destructive";
      case "여유":
        return "default";
      case "보통":
        return "secondary";
      default:
        return "secondary";
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-4xl font-bold">디자이너 리스트</h1>
          </div>
          <Button 
            onClick={handleGrantDesignerRole}
            disabled={selectedDesigners.length === 0}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            선택한 디자이너에게 권한 부여
          </Button>
        </div>

        <div className="bg-card rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedDesigners.length === designers.length && designers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>이름</TableHead>
                <TableHead>업무분야</TableHead>
                <TableHead>활용도구</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>입사일</TableHead>
                <TableHead>총 연차</TableHead>
                <TableHead>잔여 연차</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {designers.map((designer) => (
                <TableRow key={designer.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedDesigners.includes(designer.id)}
                      onCheckedChange={(checked) =>
                        handleSelectDesigner(designer.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell 
                    className="font-medium cursor-pointer text-primary hover:underline"
                    onClick={() => handleViewDetails(designer)}
                  >
                    {designer.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {designer.work_fields?.map((field: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {designer.tools?.slice(0, 3).map((tool: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                      {designer.tools?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{designer.tools.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(designer.status || "보통")}>
                      {designer.status || "보통"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {designer.hire_date
                      ? new Date(designer.hire_date).toLocaleDateString("ko-KR")
                      : "-"}
                  </TableCell>
                  <TableCell>{designer.total_vacation_days || 15}일</TableCell>
                  <TableCell className="font-medium">{designer.remaining_vacation_days || 15}일</TableCell>
                </TableRow>
              ))}
              {designers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    등록된 디자이너가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Designer Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>디자이너 상세정보</DialogTitle>
          </DialogHeader>
          {selectedDesigner && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">이름</label>
                  <p className="text-base">{selectedDesigner.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">생년월일</label>
                  <p className="text-base">
                    {selectedDesigner.birth_date
                      ? new Date(selectedDesigner.birth_date).toLocaleDateString("ko-KR")
                      : "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">연락처</label>
                  <p className="text-base">{selectedDesigner.contact || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">입사일</label>
                  <p className="text-base">
                    {selectedDesigner.hire_date
                      ? new Date(selectedDesigner.hire_date).toLocaleDateString("ko-KR")
                      : "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">총 연차</label>
                  <p className="text-base">{selectedDesigner.total_vacation_days || 15}일</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">잔여 연차</label>
                  <p className="text-base text-accent font-semibold">
                    {selectedDesigner.remaining_vacation_days || 15}일
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">업무분야</label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {selectedDesigner.work_fields?.map((field: string, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">활용도구</label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {selectedDesigner.tools?.map((tool: string, idx: number) => (
                    <Badge key={idx} variant="outline">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">파트타임 여부</label>
                  <p className="text-base">
                    {selectedDesigner.is_part_time
                      ? `파트타임 (${selectedDesigner.part_time_hours || "미정"}시간)`
                      : "풀타임"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">상태</label>
                  <div className="mt-1">
                    <Badge variant={getStatusColor(selectedDesigner.status || "보통")}>
                      {selectedDesigner.status || "보통"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">기타 메모</label>
                <p className="text-base whitespace-pre-wrap">
                  {selectedDesigner.notes || "-"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDesigners;
