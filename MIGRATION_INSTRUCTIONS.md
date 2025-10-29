# 🔧 Database Migration Instructions

## 문제 상황
매칭 신청 시 "new row violates row-level security policy" 오류 발생

## 해결 방법

### 1️⃣ Supabase SQL Editor 접속
1. https://supabase.com/dashboard/project/fywtqewpvakirzjordhs 접속
2. 좌측 메뉴에서 **SQL Editor** 클릭
3. **New Query** 클릭

### 2️⃣ 아래 SQL 복사 & 실행

```sql
-- Step 1: Add missing columns to matching_requests table
ALTER TABLE public.matching_requests 
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.matching_requests 
  ADD COLUMN IF NOT EXISTS brand_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Step 2: Drop all existing INSERT policies
DROP POLICY IF EXISTS "Users can create own matching requests" ON public.matching_requests;
DROP POLICY IF EXISTS "Anyone can create matching requests" ON public.matching_requests;
DROP POLICY IF EXISTS "Anonymous can create matching requests" ON public.matching_requests;

-- Step 3: Create simple INSERT policy allowing everyone
CREATE POLICY "Allow all inserts"
ON public.matching_requests
FOR INSERT
WITH CHECK (true);

-- Step 4: Update SELECT policy to allow users to see their own requests
DROP POLICY IF EXISTS "Users can view own matching requests" ON public.matching_requests;

CREATE POLICY "Users can view own matching requests"
ON public.matching_requests
FOR SELECT
USING (
  (user_id IS NOT NULL AND auth.uid() = user_id) 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'manager'::app_role)
);
```

### 3️⃣ 실행 확인
- "Success" 메시지가 표시되면 성공
- 오류가 있다면 스크린샷을 공유해주세요

### 4️⃣ 테스트
웹사이트로 돌아가서 매칭 신청을 다시 시도해보세요!

---

## ⚠️ 주의사항
- SQL 실행 중 데이터베이스가 재시작 중이라는 메시지가 나오면 1-2분 기다린 후 다시 시도
- "FATAL: 57P03: the database system is starting up" 오류가 나오면 잠시 기다렸다가 재시도

---

## 🐛 문제가 계속되면
브라우저 콘솔(F12 > Console)의 에러 메시지를 캡처해서 공유해주세요.
