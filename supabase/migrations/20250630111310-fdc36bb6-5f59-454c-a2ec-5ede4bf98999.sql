
-- Create security_audit table for logging security events
CREATE TABLE public.security_audit (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on security_audit table
ALTER TABLE public.security_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view security audit logs
CREATE POLICY "Admins can view security audit logs"
  ON public.security_audit
  FOR SELECT
  USING (public.is_current_user_admin());

-- System can insert audit logs (no RLS restriction for inserts)
CREATE POLICY "System can insert audit logs"
  ON public.security_audit
  FOR INSERT
  WITH CHECK (true);

-- Create password_resets table for tracking password reset requests
CREATE TABLE public.password_resets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  request_type text NOT NULL CHECK (request_type IN ('user_request', 'admin_reset')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '1 hour')
);

-- Enable RLS on password_resets table
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;

-- Users can view their own reset requests, admins can view all
CREATE POLICY "Users can view own resets, admins can view all"
  ON public.password_resets
  FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
    public.is_current_user_admin()
  );

-- System can insert reset requests
CREATE POLICY "System can insert reset requests"
  ON public.password_resets
  FOR INSERT
  WITH CHECK (true);
