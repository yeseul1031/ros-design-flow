import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WORK_FIELDS = ["호스팅", "광고", "패키지", "BI·CI·로고", "퍼블리싱", "UX·UI", "편집", "웹"];
const TOOLS = ["포토샵", "일러스트", "인디자인", "아임웹", "피그마", "PPT", "DW", "XD"];

const AdminDesigners = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [designers, setDesigners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">디자이너 관리</h1>
          <p className="text-gray-600 mt-2">디자이너 정보를 관리하세요</p>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
            <TableHeader>
              <TableRow>
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
                    {designer.status ? (
                      <Badge variant={getStatusColor(designer.status)}>
                        {designer.status}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {designer.hire_date
                      ? new Date(designer.hire_date).toLocaleDateString("ko-KR")
                      : "-"}
                  </TableCell>
                  <TableCell>{designer.total_vacation_days ? `${designer.total_vacation_days}일` : "-"}</TableCell>
                  <TableCell className="font-medium">{designer.remaining_vacation_days !== null && designer.remaining_vacation_days !== undefined ? `${designer.remaining_vacation_days}일` : "-"}</TableCell>
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
          </CardContent>
        </Card>

        {/* Designer Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                    <p className="text-base text-accent font-semibold">
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
                      onClick={() => toggleWorkField(field)}
                      className="text-xs"
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
                      onClick={() => toggleTool(tool)}
                      className="text-xs"
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
                      <SelectContent>
                        <SelectItem value="바쁨">바쁨</SelectItem>
                        <SelectItem value="보통">보통</SelectItem>
                        <SelectItem value="여유">여유</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1">
                      <Badge variant={getStatusColor(selectedDesigner.status || "보통")}>
                        {selectedDesigner.status || "보통"}
                      </Badge>
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
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setEditedDesigner(selectedDesigner);
                  }}>
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
    </AdminLayout>
  );
};

export default AdminDesigners;
