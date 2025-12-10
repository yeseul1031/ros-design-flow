import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ArrowUpDown } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export const UserRoleManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      const usersWithRoles = profiles?.map((profile) => ({
        ...profile,
        roles: roles?.filter((r) => r.user_id === profile.id).map((r) => r.role) || [],
        primaryRole: roles?.find((r) => r.user_id === profile.id)?.role || 'customer',
      }));

      setUsers(usersWithRoles || []);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "오류 발생",
        description: "사용자 목록을 불러올 수 없습니다.",
        variant: "destructive",
      });
    }
  };

  const addRole = async () => {
    if (!selectedUserId || !selectedRole) {
      toast({
        title: "입력 오류",
        description: "사용자와 권한을 모두 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.rpc('assign_single_role', {
        target_user_id: selectedUserId,
        new_role: selectedRole as any,
      });
      if (error) throw error;

      toast({
        title: "권한 부여 완료",
        description: "사용자에게 선택한 권한이 적용되었습니다.",
      });

      setSelectedUserId("");
      setSelectedRole("");
      loadUsers();
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.message || "권한 부여에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const removeRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role as any);

      if (error) throw error;

      toast({
        title: "권한 제거 완료",
        description: "사용자의 권한이 제거되었습니다.",
      });

      loadUsers();
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.message || "권한 제거에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-50 text-red-600 border border-red-200";
      case "manager":
        return "bg-amber-50 text-amber-600 border border-amber-200";
      case "designer":
        return "bg-blue-50 text-blue-600 border border-blue-200";
      case "customer":
        return "bg-muted text-muted-foreground border border-border";
      default:
        return "bg-muted text-muted-foreground border border-border";
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "관리자",
      manager: "매니저",
      designer: "디자이너",
      customer: "고객",
    };
    return labels[role] || role;
  };

  const toggleSortOrder = () => {
    if (sortOrder === null) setSortOrder('asc');
    else if (sortOrder === 'asc') setSortOrder('desc');
    else setSortOrder(null);
  };

  // Filter and sort users
  const getSortedUsers = () => {
    let sorted = [...users];
    if (sortOrder) {
      const rolePriority: Record<string, number> = { 
        admin: 1, 
        manager: 2, 
        designer: 3, 
        customer: 4 
      };
      sorted.sort((a, b) => {
        const aPriority = rolePriority[a.primaryRole] || 5;
        const bPriority = rolePriority[b.primaryRole] || 5;
        return sortOrder === 'asc' ? aPriority - bPriority : bPriority - aPriority;
      });
    }
    return sorted;
  };

  const sortedUsers = getSortedUsers();
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getPageNumbers = () => {
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

  return (
    <div className="space-y-6">
      {/* 권한부여 Card */}
      <div className="bg-card rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-6">권한부여</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">사용자</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="권한을 부여할 사용자를 선택해주세요." />
              </SelectTrigger>
              <SelectContent className="bg-card">
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">권한</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="부여할 권한 유형을 선택하세요." />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="admin">관리자</SelectItem>
                <SelectItem value="manager">매니저</SelectItem>
                <SelectItem value="designer">디자이너</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={addRole} className="h-10">
            권한 부여
          </Button>
        </div>
      </div>

      {/* 멤버 Card */}
      <div className="bg-card rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">
          멤버 <span className="text-primary">({users.length})</span>
        </h2>

        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">이름</TableHead>
              <TableHead className="text-muted-foreground font-medium">이메일</TableHead>
              <TableHead className="text-muted-foreground font-medium">연락처</TableHead>
              <TableHead className="text-muted-foreground font-medium">
                <button 
                  onClick={toggleSortOrder}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  권한
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.id} className="border-b border-border/30 hover:bg-muted/30">
                <TableCell className="font-medium py-4">{user.name}</TableCell>
                <TableCell className="py-4 text-sm">{user.email}</TableCell>
                <TableCell className="py-4 text-sm">{user.phone || "-"}</TableCell>
                <TableCell className="py-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getRoleBadgeStyle(user.primaryRole)}`}>
                    {getRoleLabel(user.primaryRole)}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  {user.primaryRole !== 'customer' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => removeRole(user.id, user.primaryRole)}
                    >
                      권한 삭제
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {paginatedUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  등록된 멤버가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/30">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
            {getPageNumbers().map((page, idx) => (
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
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-1 text-sm px-4 py-2 rounded-md border transition-colors ${
              currentPage === totalPages
                ? 'border-border/50 text-muted-foreground bg-muted/30 cursor-not-allowed'
                : 'border-border bg-background text-foreground hover:bg-muted/50'
            }`}
          >
            다음 →
          </button>
        </div>
      </div>
    </div>
  );
};
