import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const CustomerManagement = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      // 1) 회원(user_id가 있는) leads의 user_id 조회
      const { data: leadsWithUsers, error: leadsError } = await supabase
        .from("leads")
        .select("user_id")
        .not("user_id", "is", null);

      if (leadsError) throw leadsError;

      const leadUserIds = new Set((leadsWithUsers || []).map((l: any) => l.user_id));
      
      // 2) 고객 역할이 있는 사용자 조회
      const { data: customerRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .eq("role", "customer");

      if (rolesError) throw rolesError;

      const customerRoleIds = new Set((customerRoles || []).map((r: any) => r.user_id));
      
      // 3) 두 조건을 모두 만족하는 사용자 ID 추출 (leads에 있고 customer 역할)
      const allCustomerIds = Array.from(new Set([...leadUserIds, ...customerRoleIds]));
      
      if (allCustomerIds.length === 0) {
        setCustomers([]);
        return;
      }

      // 4) 관리자/매니저/디자이너 권한도 가진 사용자 제외
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

      // 5) 필터된 고객 프로필 로드
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", customerIds)
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;
      if (!profiles) {
        setCustomers([]);
        return;
      }

      // 6) 각 고객의 프로젝트/결제 정보 로드
      const customersWithData = await Promise.all(
        profiles.map(async (profile) => {
          const { data: projects } = await supabase
            .from("projects")
            .select("id")
            .eq("user_id", profile.id);

          const { data: payments } = await supabase
            .from("payments")
            .select("amount")
            .eq("user_id", profile.id);

          // leads 정보도 가져오기
          const { data: leadInfo } = await supabase
            .from("leads")
            .select("status, created_at")
            .eq("user_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...profile,
            projectCount: projects?.length || 0,
            paymentCount: payments?.length || 0,
            totalPayment: payments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0,
            leadStatus: leadInfo?.status || null,
            leadCreatedAt: leadInfo?.created_at || profile.created_at,
          };
        })
      );

      setCustomers(customersWithData);
    } catch (error) {
      console.error("Error loading customers:", error);
      setCustomers([]);
    }
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
                  <TableCell>{customer.projectCount || 0}</TableCell>
                  <TableCell>
                    {customer.paymentCount || 0}건 / ₩{customer.totalPayment?.toLocaleString() || 0}
                  </TableCell>
                  <TableCell>
                    {new Date(customer.created_at).toLocaleDateString("ko-KR")}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/admin/customers/${customer.id}`)}
                    >
                      상세보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
