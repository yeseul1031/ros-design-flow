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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminLeads = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [leads, setLeads] = useState<any[]>([]);
  const [matchingRequests, setMatchingRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAccess();
    loadLeads();
    loadMatchingRequests();
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
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-4xl font-bold">상담 관리</h1>
        </div>

        <div className="space-y-8">
          <div className="bg-card rounded-lg border border-border">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">구독 문의</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>브랜드 / 담당자</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>신청일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{lead.company || '-'}</span>
                        <span className="text-xs text-muted-foreground">{lead.name || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.phone}</TableCell>
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
                          <SelectItem value="contacted">연락 완료</SelectItem>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="bg-card rounded-lg border border-border">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">디자이너 매칭 요청</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>브랜드 / 담당자</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>신청일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matchingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{request.brand_name || "-"}</span>
                        <span className="text-xs text-muted-foreground">{request.contact_name || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{request.contact_email || "-"}</TableCell>
                    <TableCell>{request.contact_phone || "-"}</TableCell>
                    <TableCell>
                      <Select
                        value={request.status}
                        onValueChange={(value) => updateMatchingRequestStatus(request.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">신규</SelectItem>
                          <SelectItem value="contacted">연락 완료</SelectItem>
                          <SelectItem value="quoted">견적 제공</SelectItem>
                          <SelectItem value="payment_pending">결제 대기</SelectItem>
                          <SelectItem value="payment_completed">결제 완료</SelectItem>
                          <SelectItem value="project_active">프로젝트 진행</SelectItem>
                          <SelectItem value="closed">종료</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString("ko-KR")}
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
