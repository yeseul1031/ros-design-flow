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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, UserPlus, Check, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
  const [designerSearchOpen, setDesignerSearchOpen] = useState(false);
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
      // Check if user_id exists, if not we need to handle it
      if (!assigningMatching.user_id) {
        toast({
          title: "오류 발생",
          description: "비회원 매칭 요청입니다. 먼저 회원 전환이 필요합니다.",
          variant: "destructive",
        });
        return;
      }

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
        .update({ status: "project_active" })
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
                  <TableHead className="w-[200px]">브랜드 / 담당자</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead className="w-[100px]">유형</TableHead>
                  <TableHead className="w-[150px]">상태</TableHead>
                  <TableHead>신청일</TableHead>
                  <TableHead>상세보기</TableHead>
                  <TableHead className="w-[90px]">디자이너</TableHead>
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
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">신규</SelectItem>
                          <SelectItem value="contacted">상담완료</SelectItem>
                          <SelectItem value="quoted">견적 제공</SelectItem>
                          <SelectItem value="payment_pending">결제 대기</SelectItem>
                          <SelectItem value="payment_completed">결제 완료</SelectItem>
                          <SelectItem value="project_active">진행중</SelectItem>
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
                          <Button variant="outline" size="sm">
                            상세보기
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>상담 상세 정보</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-muted-foreground">브랜드/회사명</Label>
                                <p className="font-medium">{lead.company || '-'}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">담당자</Label>
                                <p className="font-medium">{lead.name}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">이메일</Label>
                                <p className="font-medium">{lead.email}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">연락처</Label>
                                <p className="font-medium">{lead.phone}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">서비스 유형</Label>
                                <p className="font-medium">
                                  {lead.service_type === 'brand' && '브랜드 디자인'}
                                  {lead.service_type === 'package' && '패키지 디자인'}
                                  {lead.service_type === 'editorial' && '편집 디자인'}
                                  {lead.service_type === 'web' && '웹 디자인'}
                                  {lead.service_type === 'video' && '영상 디자인'}
                                  {lead.service_type === 'subscription' && '구독 서비스'}
                                </p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">회원 유형</Label>
                                <Badge variant={lead.user_id ? "default" : "secondary"}>
                                  {lead.user_id ? "회원" : "비회원"}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">문의 내용</Label>
                              <p className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">
                                {lead.message || '문의 내용이 없습니다.'}
                              </p>
                            </div>
                            {lead.attachments && lead.attachments.length > 0 && (
                              <div>
                                <Label className="text-muted-foreground">첨부파일</Label>
                                <div className="mt-1 space-y-1">
                                  {lead.attachments.map((file: string, index: number) => (
                                    <div key={index} className="text-sm text-muted-foreground">
                                      {file}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant={lead.status === "project_active" || (lead.status !== 'contacted' && lead.status !== 'payment_completed') ? "outline" : "default"}
                            size="sm"
                            disabled={lead.status === "project_active" || (lead.status !== 'contacted' && lead.status !== 'payment_completed')}
                            onClick={() => {
                              setAssigningLead(lead);
                              setSelectedDesignerId("");
                              setProjectStartDate("");
                              setProjectEndDate("");
                            }}
                          >
                            배정
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>디자이너 배정 및 프로젝트 생성</DialogTitle>
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
                                      ? designers?.find((d) => d.id === selectedDesignerId)?.name
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
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              selectedDesignerId === "" ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          선택안함
                                        </CommandItem>
                                        {designers?.map((designer) => (
                                          <CommandItem
                                            key={designer.id}
                                            value={designer.name}
                                            onSelect={() => {
                                              setSelectedDesignerId(designer.id);
                                              setDesignerSearchOpen(false);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedDesignerId === designer.id ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            {designer.name}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
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
                  <TableHead className="w-[200px]">브랜드 / 담당자</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead className="w-[100px]">유형</TableHead>
                  <TableHead className="w-[150px]">상태</TableHead>
                  <TableHead>신청일</TableHead>
                  <TableHead>상세보기</TableHead>
                  <TableHead className="w-[90px]">디자이너</TableHead>
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
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">신규</SelectItem>
                          <SelectItem value="contacted">상담완료</SelectItem>
                          <SelectItem value="quoted">견적 제공</SelectItem>
                          <SelectItem value="payment_pending">결제 대기</SelectItem>
                          <SelectItem value="payment_completed">결제 완료</SelectItem>
                          <SelectItem value="project_active">진행중</SelectItem>
                          <SelectItem value="closed">종료</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            상세보기
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>매칭 요청 상세 정보</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-muted-foreground">브랜드명</Label>
                                <p className="font-medium">{request.brand_name || '-'}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">담당자</Label>
                                <p className="font-medium">{request.contact_name || '-'}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">이메일</Label>
                                <p className="font-medium">{request.contact_email || '-'}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">연락처</Label>
                                <p className="font-medium">{request.contact_phone || '-'}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">회원 유형</Label>
                                <Badge variant={request.user_id ? "default" : "secondary"}>
                                  {request.user_id ? "회원" : "비회원"}
                                </Badge>
                              </div>
                            </div>
                            {request.additional_requests && (
                              <div>
                                <Label className="text-muted-foreground">추가 요청사항</Label>
                                <p className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">
                                  {request.additional_requests}
                                </p>
                              </div>
                            )}
                            {request.reference_images && Array.isArray(request.reference_images) && request.reference_images.length > 0 && (
                              <div>
                                <Label className="text-muted-foreground">참고 이미지</Label>
                                <div className="mt-2 grid grid-cols-2 gap-4">
                                  {request.reference_images.map((image: any, index: number) => (
                                    <div key={index} className="border rounded-md overflow-hidden">
                                      <img 
                                        src={image.url || image} 
                                        alt={`참고 이미지 ${index + 1}`}
                                        className="w-full h-48 object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {request.designer_ids && Array.isArray(request.designer_ids) && request.designer_ids.length > 0 && (
                              <div>
                                <Label className="text-muted-foreground">선택한 디자이너</Label>
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {request.designer_ids.map((designerId: string, index: number) => {
                                    const designer = designers.find(d => d.id === designerId);
                                    return (
                                      <Badge key={index} variant="outline">
                                        {designer?.name || designerId}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant={request.status === "project_active" || (request.status !== 'contacted' && request.status !== 'payment_completed') ? "outline" : "default"}
                            size="sm"
                            disabled={request.status === "project_active" || (request.status !== 'contacted' && request.status !== 'payment_completed')}
                            onClick={() => {
                              setAssigningMatching(request);
                              setSelectedDesignerId("");
                              setProjectStartDate("");
                              setProjectEndDate("");
                            }}
                          >
                            배정
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>디자이너 배정 및 프로젝트 생성</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label htmlFor="designer-matching">디자이너 선택</Label>
                              <Popover open={designerSearchOpen} onOpenChange={setDesignerSearchOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={designerSearchOpen}
                                    className="w-full justify-between"
                                  >
                                    {selectedDesignerId
                                      ? designers?.find((d) => d.id === selectedDesignerId)?.name
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
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              selectedDesignerId === "" ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          선택안함
                                        </CommandItem>
                                        {designers?.map((designer) => (
                                          <CommandItem
                                            key={designer.id}
                                            value={designer.name}
                                            onSelect={() => {
                                              setSelectedDesignerId(designer.id);
                                              setDesignerSearchOpen(false);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedDesignerId === designer.id ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            {designer.name}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
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
