import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
import { Check, ChevronsUpDown, Search, Trash2, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const ITEMS_PER_PAGE = 10;

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

  // Search and pagination for leads
  const [leadSearchQuery, setLeadSearchQuery] = useState("");
  const [leadCurrentPage, setLeadCurrentPage] = useState(1);
  const [leadSortOrder, setLeadSortOrder] = useState<'asc' | 'desc' | null>(null);

  // Search and pagination for matching requests
  const [matchingSearchQuery, setMatchingSearchQuery] = useState("");
  const [matchingCurrentPage, setMatchingCurrentPage] = useState(1);
  const [matchingSortOrder, setMatchingSortOrder] = useState<'asc' | 'desc' | null>(null);

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

  // Filter and sort leads
  const getFilteredLeads = () => {
    let filtered = leads;
    if (leadSearchQuery.trim()) {
      const query = leadSearchQuery.toLowerCase();
      filtered = leads.filter(lead =>
        lead.name?.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.company?.toLowerCase().includes(query)
      );
    }
    if (leadSortOrder) {
      filtered = [...filtered].sort((a, b) => {
        const aHasUser = a.user_id ? 1 : 0;
        const bHasUser = b.user_id ? 1 : 0;
        return leadSortOrder === 'asc' ? aHasUser - bHasUser : bHasUser - aHasUser;
      });
    }
    return filtered;
  };

  const filteredLeads = getFilteredLeads();
  const leadTotalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const paginatedLeads = filteredLeads.slice(
    (leadCurrentPage - 1) * ITEMS_PER_PAGE,
    leadCurrentPage * ITEMS_PER_PAGE
  );

  // Filter and sort matching requests
  const getFilteredMatchingRequests = () => {
    let filtered = matchingRequests;
    if (matchingSearchQuery.trim()) {
      const query = matchingSearchQuery.toLowerCase();
      filtered = matchingRequests.filter(req =>
        req.contact_name?.toLowerCase().includes(query) ||
        req.contact_email?.toLowerCase().includes(query) ||
        req.brand_name?.toLowerCase().includes(query)
      );
    }
    if (matchingSortOrder) {
      filtered = [...filtered].sort((a, b) => {
        const aHasUser = a.user_id ? 1 : 0;
        const bHasUser = b.user_id ? 1 : 0;
        return matchingSortOrder === 'asc' ? aHasUser - bHasUser : bHasUser - aHasUser;
      });
    }
    return filtered;
  };

  const filteredMatchingRequests = getFilteredMatchingRequests();
  const matchingTotalPages = Math.ceil(filteredMatchingRequests.length / ITEMS_PER_PAGE);
  const paginatedMatchingRequests = filteredMatchingRequests.slice(
    (matchingCurrentPage - 1) * ITEMS_PER_PAGE,
    matchingCurrentPage * ITEMS_PER_PAGE
  );

  const getPageNumbers = (totalPages: number, currentPage: number) => {
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

  const getUserTypeBadge = (hasUserId: boolean) => {
    return hasUserId
      ? "bg-primary/10 text-primary border border-primary/20"
      : "bg-muted text-muted-foreground border border-border";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}`;
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: status as any })
        .eq("id", leadId);
      if (error) throw error;
      toast({ title: "상태 변경 완료" });
      loadLeads();
    } catch (error) {
      toast({ title: "오류 발생", variant: "destructive" });
    }
  };

  const updateMatchingRequestStatus = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("matching_requests")
        .update({ status })
        .eq("id", requestId);
      if (error) throw error;
      toast({ title: "상태 변경 완료" });
      loadMatchingRequests();
    } catch (error) {
      toast({ title: "오류 발생", variant: "destructive" });
    }
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const handleSelectMatching = (matchingId: string) => {
    setSelectedMatchingIds((prev) =>
      prev.includes(matchingId) ? prev.filter((id) => id !== matchingId) : [...prev, matchingId]
    );
  };

  const handleDeleteSelectedLeads = async () => {
    if (selectedLeadIds.length === 0) return;
    try {
      const { error } = await supabase.from("leads").delete().in("id", selectedLeadIds);
      if (error) throw error;
      toast({ title: "삭제 완료", description: `${selectedLeadIds.length}개 삭제됨` });
      setSelectedLeadIds([]);
      loadLeads();
    } catch (error) {
      toast({ title: "오류 발생", variant: "destructive" });
    }
  };

  const handleDeleteSelectedMatching = async () => {
    if (selectedMatchingIds.length === 0) return;
    try {
      const { error } = await supabase.from("matching_requests").delete().in("id", selectedMatchingIds);
      if (error) throw error;
      toast({ title: "삭제 완료", description: `${selectedMatchingIds.length}개 삭제됨` });
      setSelectedMatchingIds([]);
      loadMatchingRequests();
    } catch (error) {
      toast({ title: "오류 발생", variant: "destructive" });
    }
  };

  const handleAssignDesigner = async () => {
    if (!assigningLead || !projectStartDate || !projectEndDate) {
      toast({ title: "입력 오류", description: "모든 필드를 입력해주세요.", variant: "destructive" });
      return;
    }
    try {
      const { error: projectError } = await supabase.from("projects").insert({
        user_id: assigningLead.user_id,
        assigned_designer_id: selectedDesignerId || null,
        start_date: projectStartDate,
        end_date: projectEndDate,
        status: "active",
      });
      if (projectError) throw projectError;
      await supabase.from("leads").update({ status: "project_active" }).eq("id", assigningLead.id);
      toast({ title: "성공", description: "프로젝트가 생성되었습니다." });
      setAssigningLead(null);
      setSelectedDesignerId("");
      setProjectStartDate("");
      setProjectEndDate("");
      loadLeads();
    } catch (error) {
      toast({ title: "오류 발생", variant: "destructive" });
    }
  };

  const handleAssignDesignerToMatching = async () => {
    if (!assigningMatching || !projectStartDate || !projectEndDate) {
      toast({ title: "입력 오류", description: "모든 필드를 입력해주세요.", variant: "destructive" });
      return;
    }
    if (!assigningMatching.user_id) {
      toast({ title: "오류", description: "비회원은 배정할 수 없습니다.", variant: "destructive" });
      return;
    }
    try {
      const { error: projectError } = await supabase.from("projects").insert({
        user_id: assigningMatching.user_id,
        assigned_designer_id: selectedDesignerId || null,
        start_date: projectStartDate,
        end_date: projectEndDate,
        status: "active",
      });
      if (projectError) throw projectError;
      await supabase.from("matching_requests").update({ status: "project_active" }).eq("id", assigningMatching.id);
      toast({ title: "성공", description: "프로젝트가 생성되었습니다." });
      setAssigningMatching(null);
      setSelectedDesignerId("");
      setProjectStartDate("");
      setProjectEndDate("");
      loadMatchingRequests();
    } catch (error) {
      toast({ title: "오류 발생", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">로딩 중...</div>
      </div>
    );
  }

  const renderPagination = (
    totalPages: number,
    currentPage: number,
    setCurrentPage: (page: number) => void
  ) => (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/30">
      <button
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
          getPageNumbers(totalPages, currentPage).map((page, idx) => (
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
        onClick={() => setCurrentPage(Math.min(totalPages || 1, currentPage + 1))}
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
  );

  const renderDesignerAssignDialog = (item: any, isMatching: boolean) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => {
            if (isMatching) setAssigningMatching(item);
            else setAssigningLead(item);
            setSelectedDesignerId("");
            setProjectStartDate("");
            setProjectEndDate("");
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
            <Label>디자이너 선택</Label>
            <Popover open={designerSearchOpen} onOpenChange={setDesignerSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedDesignerId === "none" ? "선택안함" : selectedDesignerId ? designers?.find((d) => d.id === selectedDesignerId)?.name : "선택하세요"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 bg-card">
                <Command>
                  <CommandInput placeholder="검색..." />
                  <CommandList>
                    <CommandEmpty>없음</CommandEmpty>
                    <CommandGroup>
                      <CommandItem value="선택안함" onSelect={() => { setSelectedDesignerId("none"); setDesignerSearchOpen(false); }}>
                        <Check className={cn("mr-2 h-4 w-4", selectedDesignerId === "none" ? "opacity-100" : "opacity-0")} />
                        선택안함
                      </CommandItem>
                      {designers?.map((designer) => (
                        <CommandItem key={designer.id} value={designer.name} onSelect={() => { setSelectedDesignerId(designer.id); setDesignerSearchOpen(false); }}>
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
          <div className="space-y-2">
            <Label>시작일</Label>
            <Input type="date" value={projectStartDate} onChange={(e) => setProjectStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>종료일</Label>
            <Input type="date" value={projectEndDate} onChange={(e) => setProjectEndDate(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { isMatching ? setAssigningMatching(null) : setAssigningLead(null); }}>취소</Button>
            <Button onClick={isMatching ? handleAssignDesignerToMatching : handleAssignDesigner}>배정</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-8">
      {/* 구독문의 Section */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="이름, 이메일 또는 회사명으로 검색"
          value={leadSearchQuery}
          onChange={(e) => { setLeadSearchQuery(e.target.value); setLeadCurrentPage(1); }}
          className="pl-10 bg-card border-0 h-12"
        />
      </div>

      <div className="bg-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            구독문의 <span className="text-primary">({filteredLeads.length})</span>
          </h2>
          {selectedLeadIds.length > 0 && (
            <button onClick={handleDeleteSelectedLeads} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="w-10"></TableHead>
              <TableHead className="text-muted-foreground font-medium">회사명 / 이름</TableHead>
              <TableHead className="text-muted-foreground font-medium">이메일</TableHead>
              <TableHead className="text-muted-foreground font-medium">연락처</TableHead>
              <TableHead className="text-muted-foreground font-medium">
                <button onClick={() => setLeadSortOrder(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc')} className="flex items-center gap-1 hover:text-foreground">
                  유형 <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">신청일</TableHead>
              <TableHead className="text-muted-foreground font-medium">상세보기</TableHead>
              <TableHead className="text-muted-foreground font-medium">상태</TableHead>
              <TableHead className="text-muted-foreground font-medium">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLeads.map((lead) => (
              <TableRow key={lead.id} className="border-b border-border/30 hover:bg-muted/30">
                <TableCell>
                  <Checkbox
                    checked={selectedLeadIds.includes(lead.id)}
                    onCheckedChange={() => handleSelectLead(lead.id)}
                    className="border-primary data-[state=checked]:bg-primary"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{lead.company || '-'}</span>
                    <span className="text-xs text-muted-foreground">{lead.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{lead.email}</TableCell>
                <TableCell className="text-sm">{lead.phone}</TableCell>
                <TableCell>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getUserTypeBadge(!!lead.user_id)}`}>
                    {lead.user_id ? "회원" : "비회원"}
                  </span>
                </TableCell>
                <TableCell className="text-sm">{formatDate(lead.created_at)}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-sm underline hover:text-primary">상세보기</button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-card">
                      <DialogHeader><DialogTitle>상담 상세 정보</DialogTitle></DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div><Label className="text-muted-foreground">회사명</Label><p className="font-medium">{lead.company || '-'}</p></div>
                          <div><Label className="text-muted-foreground">담당자</Label><p className="font-medium">{lead.name}</p></div>
                          <div><Label className="text-muted-foreground">이메일</Label><p className="font-medium">{lead.email}</p></div>
                          <div><Label className="text-muted-foreground">연락처</Label><p className="font-medium">{lead.phone}</p></div>
                        </div>
                        <div><Label className="text-muted-foreground">문의 내용</Label><p className="mt-1 p-3 bg-muted rounded-md">{lead.message || '-'}</p></div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell>
                  <Select value={lead.status} onValueChange={(value) => updateLeadStatus(lead.id, value)}>
                    <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-card">
                      <SelectItem value="new">신규</SelectItem>
                      <SelectItem value="contacted">상담완료</SelectItem>
                      <SelectItem value="quoted">견적제공</SelectItem>
                      <SelectItem value="payment_pending">결제대기</SelectItem>
                      <SelectItem value="payment_completed">결제완료</SelectItem>
                      <SelectItem value="project_active">진행중</SelectItem>
                      <SelectItem value="closed">종료</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{renderDesignerAssignDialog(lead, false)}</TableCell>
              </TableRow>
            ))}
            {paginatedLeads.length === 0 && (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">데이터가 없습니다.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>

        {renderPagination(leadTotalPages, leadCurrentPage, setLeadCurrentPage)}
      </div>

      {/* 매칭요청 Section */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="이름, 이메일 또는 회사명으로 검색"
          value={matchingSearchQuery}
          onChange={(e) => { setMatchingSearchQuery(e.target.value); setMatchingCurrentPage(1); }}
          className="pl-10 bg-card border-0 h-12"
        />
      </div>

      <div className="bg-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            매칭요청 <span className="text-primary">({filteredMatchingRequests.length})</span>
          </h2>
          {selectedMatchingIds.length > 0 && (
            <button onClick={handleDeleteSelectedMatching} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="w-10"></TableHead>
              <TableHead className="text-muted-foreground font-medium">회사명 / 이름</TableHead>
              <TableHead className="text-muted-foreground font-medium">이메일</TableHead>
              <TableHead className="text-muted-foreground font-medium">연락처</TableHead>
              <TableHead className="text-muted-foreground font-medium">
                <button onClick={() => setMatchingSortOrder(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc')} className="flex items-center gap-1 hover:text-foreground">
                  유형 <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">신청일</TableHead>
              <TableHead className="text-muted-foreground font-medium">상세보기</TableHead>
              <TableHead className="text-muted-foreground font-medium">상태</TableHead>
              <TableHead className="text-muted-foreground font-medium">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMatchingRequests.map((request) => (
              <TableRow key={request.id} className="border-b border-border/30 hover:bg-muted/30">
                <TableCell>
                  <Checkbox
                    checked={selectedMatchingIds.includes(request.id)}
                    onCheckedChange={() => handleSelectMatching(request.id)}
                    className="border-primary data-[state=checked]:bg-primary"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{request.brand_name || '-'}</span>
                    <span className="text-xs text-muted-foreground">{request.contact_name || '-'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{request.contact_email || '-'}</TableCell>
                <TableCell className="text-sm">{request.contact_phone || '-'}</TableCell>
                <TableCell>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getUserTypeBadge(!!request.user_id)}`}>
                    {request.user_id ? "회원" : "비회원"}
                  </span>
                </TableCell>
                <TableCell className="text-sm">{formatDate(request.created_at)}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-sm underline hover:text-primary">상세보기</button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-card">
                      <DialogHeader><DialogTitle>매칭 요청 상세</DialogTitle></DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div><Label className="text-muted-foreground">브랜드명</Label><p className="font-medium">{request.brand_name || '-'}</p></div>
                          <div><Label className="text-muted-foreground">담당자</Label><p className="font-medium">{request.contact_name || '-'}</p></div>
                          <div><Label className="text-muted-foreground">이메일</Label><p className="font-medium">{request.contact_email || '-'}</p></div>
                          <div><Label className="text-muted-foreground">연락처</Label><p className="font-medium">{request.contact_phone || '-'}</p></div>
                        </div>
                        {request.additional_requests && (
                          <div><Label className="text-muted-foreground">추가 요청</Label><p className="mt-1 p-3 bg-muted rounded-md">{request.additional_requests}</p></div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell>
                  <Select value={request.status} onValueChange={(value) => updateMatchingRequestStatus(request.id, value)}>
                    <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-card">
                      <SelectItem value="new">신규</SelectItem>
                      <SelectItem value="contacted">상담완료</SelectItem>
                      <SelectItem value="quoted">견적제공</SelectItem>
                      <SelectItem value="payment_pending">결제대기</SelectItem>
                      <SelectItem value="payment_completed">결제완료</SelectItem>
                      <SelectItem value="project_active">진행중</SelectItem>
                      <SelectItem value="closed">종료</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{renderDesignerAssignDialog(request, true)}</TableCell>
              </TableRow>
            ))}
            {paginatedMatchingRequests.length === 0 && (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">데이터가 없습니다.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>

        {renderPagination(matchingTotalPages, matchingCurrentPage, setMatchingCurrentPage)}
      </div>
    </div>
  );
};

export default AdminLeads;