import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Header } from "@/components/layout/Header";
import { ArrowLeft, Calendar, DollarSign, Pause, Check, X, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CustomerDetail = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAccess();
    if (customerId) {
      loadCustomer();
    }
  }, [customerId]);

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

  const loadCustomer = async () => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", customerId)
        .single();

      if (profileError) throw profileError;

      const [
        { data: projects },
        { data: payments },
        { data: pauseRequests },
        { data: leads },
        { data: supportTickets }
      ] = await Promise.all([
        supabase
          .from("projects")
          .select("*, designers:assigned_designer_id(name)")
          .eq("user_id", customerId)
          .order("created_at", { ascending: false }),
        supabase
          .from("payments")
          .select("*")
          .eq("user_id", customerId)
          .order("created_at", { ascending: false }),
        supabase
          .from("project_pause_requests")
          .select("*")
          .eq("user_id", customerId)
          .order("created_at", { ascending: false }),
        supabase
          .from("leads")
          .select("*")
          .eq("user_id", customerId)
          .order("created_at", { ascending: false }),
        supabase
          .from("support_tickets")
          .select("*")
          .eq("user_id", customerId)
          .order("created_at", { ascending: false })
      ]);

      setCustomer({
        ...profile,
        projects: projects || [],
        payments: payments || [],
        pauseRequests: pauseRequests || [],
        leads: leads || [],
        supportTickets: supportTickets || [],
      });
    } catch (error) {
      console.error("Error loading customer:", error);
      toast({
        title: "오류",
        description: "고객 정보를 불러올 수 없습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

      loadCustomer();
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">고객을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background p-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-4xl font-bold">{customer.name} - 고객 상세정보</h1>
          </div>

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
                    <p className="font-medium">{customer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">연락처</p>
                    <p className="font-medium">{customer.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">회사</p>
                    <p className="font-medium">{customer.company || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">가입일</p>
                    <p className="font-medium">
                      {new Date(customer.created_at).toLocaleDateString("ko-KR")}
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
                  프로젝트 ({customer.projects?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customer.projects?.length > 0 ? (
                  <div className="space-y-2">
                    {customer.projects.map((project: any) => (
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
                  결제 내역 ({customer.payments?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customer.payments?.length > 0 ? (
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
                      {customer.payments.map((payment: any) => (
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
                  홀딩 요청 ({customer.pauseRequests?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customer.pauseRequests?.length > 0 ? (
                  <div className="space-y-2">
                    {customer.pauseRequests.map((request: any) => (
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

            {/* Inquiry History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  프로젝트 문의 ({customer.supportTickets?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customer.supportTickets?.length > 0 ? (
                  <div className="space-y-2">
                    {customer.supportTickets.map((ticket: any) => (
                      <div 
                        key={ticket.id} 
                        className="border rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Badge variant="outline" className="mb-2">{ticket.category}</Badge>
                            <p className="font-medium text-sm">{ticket.subject}</p>
                            <p className="text-sm mt-1 line-clamp-2">{ticket.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(ticket.created_at).toLocaleDateString("ko-KR")}
                            </p>
                          </div>
                          <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>
                            {ticket.status === 'open' ? '처리 중' : '완료'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    문의 내역이 없습니다.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerDetail;
