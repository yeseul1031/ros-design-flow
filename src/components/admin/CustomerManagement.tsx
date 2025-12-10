import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export const CustomerManagement = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const { data: customerRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "customer");

      if (rolesError) throw rolesError;

      const customerRoleIds = (customerRoles || []).map((r: any) => r.user_id);
      
      if (customerRoleIds.length === 0) {
        setCustomers([]);
        return;
      }

      const { data: staffRoles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", customerRoleIds)
        .in("role", ["admin", "manager", "designer"]);

      const staffIds = new Set((staffRoles || []).map((r: any) => r.user_id));
      const pureCustomerIds = customerRoleIds.filter((id: string) => !staffIds.has(id));

      if (pureCustomerIds.length === 0) {
        setCustomers([]);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", pureCustomerIds)
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const customersWithData = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: projects } = await supabase
            .from("projects")
            .select("id")
            .eq("user_id", profile.id);

          const { data: payments } = await supabase
            .from("payments")
            .select("amount")
            .eq("user_id", profile.id);

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

  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.company?.toLowerCase().includes(query)
    );
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE));
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 9) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 5) {
        for (let i = 1; i <= 8; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 4) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 7; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="이름, 이메일 또는 회사명으로 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card border-0 h-12"
        />
      </div>

      {/* Customer List */}
      <div className="bg-card rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-6">
          고객 <span className="text-primary">({filteredCustomers.length})</span>
        </h2>

        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50">
              <TableHead className="text-muted-foreground font-medium">이름</TableHead>
              <TableHead className="text-muted-foreground font-medium">회사</TableHead>
              <TableHead className="text-muted-foreground font-medium">이메일</TableHead>
              <TableHead className="text-muted-foreground font-medium">연락처</TableHead>
              <TableHead className="text-muted-foreground font-medium">가입일</TableHead>
              <TableHead className="text-muted-foreground font-medium">프로젝트 수</TableHead>
              <TableHead className="text-muted-foreground font-medium">결제내역</TableHead>
              <TableHead className="text-muted-foreground font-medium">상세보기</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              paginatedCustomers.map((customer) => (
                <TableRow key={customer.id} className="border-b border-border/30">
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.company || "-"}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone || "-"}</TableCell>
                  <TableCell>
                    {new Date(customer.created_at).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    }).replace(/\. /g, ". ")}
                  </TableCell>
                  <TableCell>{customer.projectCount || 0}</TableCell>
                  <TableCell>
                    {customer.paymentCount || 0}건 / {customer.totalPayment?.toLocaleString() || 0}원
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => navigate(`/admin/customers/${customer.id}`)}
                      className="text-foreground underline underline-offset-2 hover:text-primary transition-colors"
                    >
                      상세보기
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/30">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 border border-border/50 rounded-md bg-background"
          >
            <ChevronLeft className="h-4 w-4" />
            이전
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span key={`ellipsis-${index}`} className="text-muted-foreground px-1">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  className={`w-8 h-8 text-sm rounded-md ${
                    currentPage === page
                      ? "border border-foreground text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 border border-border/50 rounded-md bg-background"
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
