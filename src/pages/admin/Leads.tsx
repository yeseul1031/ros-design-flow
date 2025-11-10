import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

const AdminLeads = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [leads, setLeads] = useState<any[]>([]);
  const [matchingRequests, setMatchingRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [designers, setDesigners] = useState<any[]>([]);
  const [assigningLead, setAssigningLead] = useState<any>(null);
  const [selectedDesignerId, setSelectedDesignerId] = useState("");
  const [projectStartDate, setProjectStartDate] = useState("");
  const [projectEndDate, setProjectEndDate] = useState("");
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [selectedMatchingIds, setSelectedMatchingIds] = useState<string[]>([]);
  const [assigningMatching, setAssigningMatching] = useState<any>(null);

  useEffect(() => {
    checkAccess();
    loadLeads();
    loadMatchingRequests();
    loadDesigners();
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
    }
  };

  const loadLeads = async () => {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error("Error loading leads:", error);
      toast({
        title: "오류 발생",
        description: "상담 목록을 불러올 수 없습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMatchingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("matching_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMatchingRequests(data || []);
    } catch (error) {
      console.error("Error loading matching requests:", error);
      toast({
        title: "오류 발생",
        description: "매칭 요청 목록을 불러올 수 없습니다.",
        variant: "destructive",
      });
    }
  };

  const loadDesigners = async () => {
    try {
      const { data, error } = await supabase
        .from("designers")
        .select("id, name")
        .eq("is_available", true);

      if (error) throw error;
      setDesigners(data || []);
    } catch (error) {
      console.error("Error loading designers:", error);
    }
  };

  const handleAssignDesigner = async () => {
    if (!assigningLead || !selectedDesignerId || !projectStartDate || !projectEndDate) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create project
      const { error: projectError } = await supabase
        .from("projects")
        .insert({
          user_id: assigningLead.user_id,
          assigned_designer_id: selectedDesignerId,
          start_date: projectStartDate,
          end_date: projectEndDate,
          status: "active",
        });

      if (projectError) throw projectError;

      // Update lead status
      await supabase
        .from("leads")
        .update({ status: "project_active" })
        .eq("id", assigningLead.id);

      toast({
        title: "성공",
        description: "디자이너가 배정되고 프로젝트가 생성되었습니다.",
      });

      setAssigningLead(null);
      setSelectedDesignerId("");
      setProjectStartDate("");
      setProjectEndDate("");
      loadLeads();
    } catch (error) {
      console.error("Error assigning designer:", error);
      toast({
        title: "오류 발생",
        description: "디자이너 배정에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: status as any })
        .eq("id", leadId);

      if (error) throw error;

      toast({
        title: "상태 변경 완료",
        description: "상담 상태가 업데이트되었습니다.",
      });

      loadLeads();
    } catch (error) {
      console.error("Error updating lead:", error);
      toast({
        title: "오류 발생",
        description: "상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const updateMatchingRequestStatus = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("matching_requests")
        .update({ status })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "상태 변경 완료",
        description: "매칭 요청 상태가 업데이트되었습니다.",
      });

      loadMatchingRequests();
    } catch (error) {
      console.error("Error updating matching request:", error);
      toast({
        title: "오류 발생",
        description: "상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map((lead) => lead.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedLeadIds.length === 0) {
      toast({
        title: "선택 오류",
        description: "삭제할 항목을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("leads")
        .delete()
        .in("id", selectedLeadIds);

      if (error) throw error;

      toast({
        title: "삭제 완료",
        description: `${selectedLeadIds.length}개의 상담이 삭제되었습니다.`,
      });

      setSelectedLeadIds([]);
      loadLeads();
    } catch (error) {
      console.error("Error deleting leads:", error);
      toast({
        title: "오류 발생",
        description: "상담 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleSelectMatching = (matchingId: string) => {
    setSelectedMatchingIds((prev) =>
      prev.includes(matchingId)
        ? prev.filter((id) => id !== matchingId)
        : [...prev, matchingId]
    );
  };

  const handleSelectAllMatching = () => {
    if (selectedMatchingIds.length === matchingRequests.length) {
      setSelectedMatchingIds([]);
    } else {
      setSelectedMatchingIds(matchingRequests.map((req) => req.id));
    }
  };

  const handleDeleteSelectedMatching = async () => {
    if (selectedMatchingIds.length === 0) {
      toast({
        title: "선택 오류",
        description: "삭제할 항목을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("matching_requests")
        .delete()
        .in("id", selectedMatchingIds);

      if (error) throw error;

      toast({
        title: "삭제 완료",
        description: `${selectedMatchingIds.length}개의 매칭 요청이 삭제되었습니다.`,
      });

      setSelectedMatchingIds([]);
      loadMatchingRequests();
    } catch (error) {
      console.error("Error deleting matching requests:", error);
      toast({
        title: "오류 발생",
        description: "매칭 요청 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleAssignDesignerToMatching = async () => {
    if (!assigningMatching || !selectedDesignerId || !projectStartDate || !projectEndDate) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create project
      const { error: projectError } = await supabase
        .from("projects")
        .insert({
          user_id: assigningMatching.user_id,
          assigned_designer_id: selectedDesignerId,
          start_date: projectStartDate,
          end_date: projectEndDate,
          status: "active",
        });

      if (projectError) throw projectError;

      // Update matching request status
      await supabase
        .from("matching_requests")
        .update({ status: "completed" })
        .eq("id", assigningMatching.id);

      toast({
        title: "성공",
        description: "디자이너가 배정되고 프로젝트가 생성되었습니다.",
      });

      setAssigningMatching(null);
      setSelectedDesignerId("");
      setProjectStartDate("");
      setProjectEndDate("");
      loadMatchingRequests();
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
          <h1 className="text-4xl font-bold">상담 관리</h1>
        </div>

        <div className="space-y-8">
          <div className="bg-card rounded-lg border border-border">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">구독 문의</h2>
              {selectedLeadIds.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                >
                  선택 삭제 ({selectedLeadIds.length})
                </Button>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.length === leads.length && leads.length > 0}
                      onChange={handleSelectAll}
                      className="cursor-pointer"
                    />
                  </TableHead>
                  <TableHead>브랜드 / 담당자</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>신청일</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.includes(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                        className="cursor-pointer"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{lead.company || '-'}</span>
                        <span className="text-xs text-muted-foreground">{lead.name || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.phone}</TableCell>
                    <TableCell>
                      <Badge variant={lead.user_id ? "default" : "secondary"}>
                        {lead.user_id ? "회원" : "비회원"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={lead.status}
                        onValueChange={(value) => updateLeadStatus(lead.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">신규</SelectItem>
                          <SelectItem value="contacted">상담완료</SelectItem>
                          <SelectItem value="quoted">견적 제공</SelectItem>
                          <SelectItem value="payment_pending">결제 대기</SelectItem>
                          <SelectItem value="payment_completed">결제 완료</SelectItem>
                          <SelectItem value="project_active">프로젝트 진행</SelectItem>
                          <SelectItem value="closed">종료</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(lead.created_at).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={lead.status === "project_active" || (lead.status !== 'contacted' && lead.status !== 'payment_completed')}
                            onClick={() => {
                              setAssigningLead(lead);
                              setSelectedDesignerId("");
                              setProjectStartDate("");
                              setProjectEndDate("");
                            }}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            디자이너 배정
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>디자이너 배정 및 프로젝트 생성</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label htmlFor="designer">디자이너 선택</Label>
                              <Select
                                value={selectedDesignerId}
                                onValueChange={setSelectedDesignerId}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="디자이너를 선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                  {designers.map((designer) => (
                                    <SelectItem key={designer.id} value={designer.id}>
                                      {designer.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="startDate">시작일</Label>
                              <Input
                                id="startDate"
                                type="date"
                                value={projectStartDate}
                                onChange={(e) => setProjectStartDate(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="endDate">종료일</Label>
                              <Input
                                id="endDate"
                                type="date"
                                value={projectEndDate}
                                onChange={(e) => setProjectEndDate(e.target.value)}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setAssigningLead(null);
                                  setSelectedDesignerId("");
                                  setProjectStartDate("");
                                  setProjectEndDate("");
                                }}
                              >
                                취소
                              </Button>
                              <Button onClick={handleAssignDesigner}>
                                배정 및 프로젝트 생성
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="bg-card rounded-lg border border-border">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">디자이너 매칭 요청</h2>
              {selectedMatchingIds.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelectedMatching}
                >
                  선택 삭제 ({selectedMatchingIds.length})
                </Button>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedMatchingIds.length === matchingRequests.length && matchingRequests.length > 0}
                      onChange={handleSelectAllMatching}
                      className="cursor-pointer"
                    />
                  </TableHead>
                  <TableHead>브랜드 / 담당자</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>신청일</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matchingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedMatchingIds.includes(request.id)}
                        onChange={() => handleSelectMatching(request.id)}
                        className="cursor-pointer"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{request.brand_name || "-"}</span>
                        <span className="text-xs text-muted-foreground">{request.contact_name || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{request.contact_email || "-"}</TableCell>
                    <TableCell>{request.contact_phone || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={request.user_id ? "default" : "secondary"}>
                        {request.user_id ? "회원" : "비회원"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={request.status}
                        onValueChange={(value) => updateMatchingRequestStatus(request.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">대기</SelectItem>
                          <SelectItem value="contacted">연락 완료</SelectItem>
                          <SelectItem value="completed">완료</SelectItem>
                          <SelectItem value="cancelled">취소</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={request.status !== 'contacted'}
                            onClick={() => {
                              setAssigningMatching(request);
                              setSelectedDesignerId("");
                              setProjectStartDate("");
                              setProjectEndDate("");
                            }}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            디자이너 배정
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>디자이너 배정 및 프로젝트 생성</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label htmlFor="designer-matching">디자이너 선택</Label>
                              <Select
                                value={selectedDesignerId}
                                onValueChange={setSelectedDesignerId}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="디자이너를 선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                  {designers.map((designer) => (
                                    <SelectItem key={designer.id} value={designer.id}>
                                      {designer.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="startDate-matching">시작일</Label>
                              <Input
                                id="startDate-matching"
                                type="date"
                                value={projectStartDate}
                                onChange={(e) => setProjectStartDate(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="endDate-matching">종료일</Label>
                              <Input
                                id="endDate-matching"
                                type="date"
                                value={projectEndDate}
                                onChange={(e) => setProjectEndDate(e.target.value)}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setAssigningMatching(null);
                                  setSelectedDesignerId("");
                                  setProjectStartDate("");
                                  setProjectEndDate("");
                                }}
                              >
                                취소
                              </Button>
                              <Button onClick={handleAssignDesignerToMatching}>
                                배정 및 프로젝트 생성
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLeads;
