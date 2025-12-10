import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, ChevronsUpDown, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface EmailTemplate {
  id: string;
  template_key: string;
  subject: string;
  html_content: string;
  description: string | null;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  company: string | null;
}

const DEFAULT_TEMPLATE = `<div style="font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f0eb;">
  <!-- Header with Logo -->
  <div style="background-color: #8b7355; padding: 40px 20px; text-align: center;">
    <div style="width: 80px; height: 80px; margin: 0 auto; background-color: #f5f0eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden;">
      <img src="{{logoUrl}}" alt="ROS" style="width: 60px; height: 60px; object-fit: contain;" />
    </div>
  </div>
  
  <!-- Content Area -->
  <div style="background-color: #ffffff; margin: 0 20px; padding: 50px 40px; text-align: center; border: 1px solid #e5e0db;">
    <p style="font-size: 12px; color: #8b7355; letter-spacing: 3px; margin: 0 0 20px 0;">NOTICE</p>
    <h1 style="font-size: 24px; font-weight: 600; color: #333; margin: 0 0 40px 0; line-height: 1.4;">계약 만료 안내문</h1>
    
    <div style="line-height: 1.8; color: #555; font-size: 14px;">
      <p style="margin: 0 0 20px 0;">
        안녕하세요, {{customerName}}님<br>
        항상 저희 ROS 디자인 서비스를<br>
        이용해주셔서 감사합니다.
      </p>
      
      <p style="margin: 0 0 20px 0;">
        <strong style="color: #333;">{{endDate}}</strong> 부터<br>
        귀하의 디자인 서비스 계약이<br>
        만료될 예정입니다.
      </p>
      
      <p style="margin: 0 0 30px 0;">
        서비스를 계속 이용하시려면<br>
        아래 링크를 통해 재계약을 진행해주세요.
      </p>
      
      <a href="{{surveyLink}}" style="display: inline-block; background-color: #EB4B29; color: white; padding: 14px 32px; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 500;">재계약 문의하기</a>
      
      <p style="margin: 40px 0 0 0; color: #333;">
        감사합니다.
      </p>
    </div>
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #999; margin: 0;">발송일 &nbsp;&nbsp; {{sendDate}}</p>
    </div>
  </div>
  
  <!-- Footer -->
  <div style="background-color: #8b7355; padding: 20px; text-align: center;">
    <p style="color: #f5f0eb; font-size: 12px; margin: 0;">문 의 &nbsp; | &nbsp; support@ros.co.kr</p>
  </div>
</div>`;

export const EmailTemplateManager = () => {
  const { toast } = useToast();
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedSubject, setEditedSubject] = useState("[ROS] {{customerName}}님 계약 만료 안내 및 재계약 문의");
  const [editedContent, setEditedContent] = useState(DEFAULT_TEMPLATE);
  
  // Customer selection
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);

  useEffect(() => {
    loadTemplate();
    loadCustomers();
  }, []);

  const loadTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("template_key", "contract_expiring")
        .single();

      if (error) {
        // Template doesn't exist, use defaults
        console.log("No template found, using defaults");
      } else {
        setTemplate(data);
        setEditedSubject(data.subject);
        setEditedContent(data.html_content);
      }
    } catch (error) {
      console.error("Error loading template:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const { data: customerRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "customer");

      if (!customerRoles || customerRoles.length === 0) return;

      const customerIds = customerRoles.map(r => r.user_id);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, email, company")
        .in("id", customerIds);

      setCustomers(profiles || []);
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (template) {
        const { error } = await supabase
          .from("email_templates")
          .update({
            subject: editedSubject,
            html_content: editedContent,
            updated_at: new Date().toISOString(),
          })
          .eq("id", template.id);

        if (error) throw error;
      } else {
        // Create new template
        const { error } = await supabase
          .from("email_templates")
          .insert({
            template_key: "contract_expiring",
            subject: editedSubject,
            html_content: editedContent,
            description: "계약 만료 예정 고객 알림 이메일",
          });

        if (error) throw error;
      }

      toast({
        title: "저장 완료",
        description: "이메일 템플릿이 성공적으로 저장되었습니다.",
      });

      await loadTemplate();
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "저장 실패",
        description: "이메일 템플릿 저장에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setEditedSubject("[ROS] {{customerName}}님 계약 만료 안내 및 재계약 문의");
    setEditedContent(DEFAULT_TEMPLATE);
    setSelectedCustomer(null);
    toast({
      title: "초기화 완료",
      description: "템플릿이 기본값으로 초기화되었습니다.",
    });
  };

  const getPreviewSubject = () => {
    const name = selectedCustomer?.name || "아무개";
    return editedSubject.replace(/\{\{customerName\}\}/g, name);
  };

  const getPreviewContent = () => {
    const name = selectedCustomer?.name || "아무개";
    const today = new Date();
    const sendDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
    // For preview, use a placeholder or the actual logo URL when deployed
    const logoUrl = window.location.origin + "/images/service/icon.png";
    return editedContent
      .replace(/\{\{customerName\}\}/g, name)
      .replace(/\{\{endDate\}\}/g, "2025년 12월 31일")
      .replace(/\{\{surveyLink\}\}/g, "#")
      .replace(/\{\{sendDate\}\}/g, sendDate)
      .replace(/\{\{logoUrl\}\}/g, logoUrl);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Selection */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={customerSearchOpen}
              className="w-full justify-between pl-10 h-12 bg-card border border-border text-muted-foreground"
            >
              {selectedCustomer 
                ? `${selectedCustomer.name} (${selectedCustomer.email})`
                : "고객을 선택하세요 (미리보기에 반영됩니다)"
              }
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[500px] p-0 bg-card" align="start">
            <Command>
              <CommandInput placeholder="고객 이름 또는 이메일로 검색..." />
              <CommandList>
                <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                <CommandGroup>
                  {customers.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      value={`${customer.name} ${customer.email}`}
                      onSelect={() => {
                        setSelectedCustomer(customer);
                        setCustomerSearchOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0")} />
                      <div className="flex flex-col">
                        <span className="font-medium">{customer.name}</span>
                        <span className="text-xs text-muted-foreground">{customer.email}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Template Editor */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">이메일 템플릿</h2>
          
          <div className="space-y-2">
            <Label htmlFor="subject">제목</Label>
            <Input
              id="subject"
              value={editedSubject}
              onChange={(e) => setEditedSubject(e.target.value)}
              placeholder="이메일 제목"
              className="bg-card border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">내용</Label>
            <Textarea
              id="content"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="템플릿 영역"
              rows={16}
              className="font-mono text-sm bg-card border-border resize-none"
            />
          </div>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">이메일 미리보기</h2>
          
          <div className="space-y-2">
            <Label>제목</Label>
            <div className="p-3 bg-card rounded-md border border-border text-sm">
              {getPreviewSubject()}
            </div>
          </div>

          <div className="space-y-2">
            <Label>내용</Label>
            <div className="p-4 bg-background rounded-md border border-border min-h-[400px] overflow-auto">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={handleReset}
          variant="outline"
          disabled={isSaving}
        >
          초기화
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90"
        >
          {isSaving ? "저장 중..." : "저장하기"}
        </Button>
      </div>
    </div>
  );
};
