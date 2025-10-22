import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Calendar, DollarSign, Pause, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const CustomerManagement = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      // 1) 고객 역할이 있는 사용자만 추출
      const { data: customerRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .eq("role", "customer");

      if (rolesError) throw rolesError;

      const allCustomerIds = (customerRoles || []).map((r: any) => r.user_id);
      if (allCustomerIds.length === 0) {
        setCustomers([]);
        return;
      }

      // 2) 관리자/매니저/디자이너 권한도 가진 사용자 제외
      const { data: staffRoles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", allCustomerIds)
        .in("role", ["admin", "manager", "designer"]);

      const staffIds = new Set((staffRoles || []).map((r: any) => r.user_id));
      const customerIds = allCustomerIds.filter((id: string) => !staffIds.has(id));

      if (customerIds.length === 0) {
        setCustomers([]);
        return;
      }

      // 3) 필터된 고객 프로필 로드
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", customerIds)
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;
      if (!profiles) return;

      // 4) 각 고객의 프로젝트/결제/홀딩 요청 로드
      const customersWithData = await Promise.all(
        profiles.map(async (profile) => {
          const { data: projects } = await supabase
            .from("projects")
            .select("*, designers:assigned_designer_id(name)")
            .eq("user_id", profile.id)
            .order("created_at", { ascending: false });

          const { data: payments } = await supabase
            .from("payments")
            .select("*")
            .eq("user_id", profile.id)
            .order("created_at", { ascending: false });

          const { data: pauseRequests } = await supabase
            .from("project_pause_requests")
            .select("*")
            .eq("user_id", profile.id)
            .order("created_at", { ascending: false });

          return {
            ...profile,
            projects: projects || [],
            payments: payments || [],
            pauseRequests: pauseRequests || [],
          };
        })
      );

      setCustomers(customersWithData);
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  const openDetails = (customer: any) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  };

  const handlePauseRequestStatus = async (requestId: string, newStatus: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("project_pause_requests")
        .update({ status: newStatus })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: newStatus === "approved" ? "홀딩 요청 승인됨" : "홀딩 요청 거절됨",
        description: `홀딩 요청이 ${newStatus === "approved" ? "승인" : "거절"}되었습니다.`,
      });

      // Reload customer data
      loadCustomers();
      if (selectedCustomer) {
        const updatedCustomer = customers.find(c => c.id === selectedCustomer.id);
        if (updatedCustomer) {
          setSelectedCustomer(updatedCustomer);
        }
      }
    } catch (error) {
      console.error("Error updating pause request:", error);
      toast({
        title: "오류",
        description: "홀딩 요청 상태 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
      active: { label: "진행중", variant: "default" },
      paused: { label: "홀딩", variant: "secondary" },
      completed: { label: "완료", variant: "secondary" },
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: "secondary" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            고객 관리
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>회사</TableHead>
                <TableHead>프로젝트 수</TableHead>
                <TableHead>결제 내역</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.company || "-"}</TableCell>
                  <TableCell>{customer.projects?.length || 0}</TableCell>
                  <TableCell>
                    {customer.payments?.length || 0}건 / ₩
                    {customer.payments
                      ?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
                      .toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(customer.created_at).toLocaleDateString("ko-KR")}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => openDetails(customer)}>
                      상세보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCustomer?.name} - 고객 상세정보</DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">기본 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">이메일</p>
                      <p className="font-medium">{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">연락처</p>
                      <p className="font-medium">{selectedCustomer.phone || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">회사</p>
                      <p className="font-medium">{selectedCustomer.company || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">가입일</p>
                      <p className="font-medium">
                        {new Date(selectedCustomer.created_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Projects */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    프로젝트 ({selectedCustomer.projects?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCustomer.projects?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCustomer.projects.map((project: any) => (
                        <div key={project.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium">
                                담당: {project.designers?.name || "미배정"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(project.start_date).toLocaleDateString("ko-KR")} ~{" "}
                                {new Date(project.end_date).toLocaleDateString("ko-KR")}
                              </p>
                            </div>
                            {getStatusBadge(project.status)}
                          </div>
                          {project.paused_days > 0 && (
                            <p className="text-sm text-muted-foreground">
                              홀딩 일수: {project.paused_days}일
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      진행 중인 프로젝트가 없습니다.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Payments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    결제 내역 ({selectedCustomer.payments?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCustomer.payments?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>금액</TableHead>
                          <TableHead>결제일</TableHead>
                          <TableHead>결제방법</TableHead>
                          <TableHead>발행담당자</TableHead>
                          <TableHead>상태</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCustomer.payments.map((payment: any) => (
                          <TableRow key={payment.id}>
                            <TableCell>₩{payment.amount?.toLocaleString()}</TableCell>
                            <TableCell>
                              {payment.paid_at
                                ? new Date(payment.paid_at).toLocaleDateString("ko-KR")
                                : "-"}
                            </TableCell>
                            <TableCell>{payment.method || "-"}</TableCell>
                            <TableCell>{payment.invoice_manager || "-"}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  payment.status === "completed" ? "default" : "secondary"
                                }
                              >
                                {payment.status === "completed" ? "완료" : "대기중"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      결제 내역이 없습니다.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Pause Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Pause className="h-4 w-4" />
                    홀딩 요청 ({selectedCustomer.pauseRequests?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCustomer.pauseRequests?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCustomer.pauseRequests.map((request: any) => (
                        <div key={request.id} className="border rounded-lg p-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium">
                                {new Date(request.start_date).toLocaleDateString("ko-KR")} ~{" "}
                                {new Date(request.end_date).toLocaleDateString("ko-KR")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {request.pause_days}일간 홀딩
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  request.status === "approved"
                                    ? "default"
                                    : request.status === "rejected"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {request.status === "approved"
                                  ? "승인됨"
                                  : request.status === "rejected"
                                  ? "거절됨"
                                  : "대기중"}
                              </Badge>
                              {request.status === "pending" && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handlePauseRequestStatus(request.id, "approved")}
                                  >
                                    <Check className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handlePauseRequestStatus(request.id, "rejected")}
                                  >
                                    <X className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      홀딩 요청 내역이 없습니다.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
