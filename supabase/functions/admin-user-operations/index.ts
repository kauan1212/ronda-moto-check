
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  isAdmin: boolean;
}

interface UpdateUserRequest {
  userId: string;
  fullName: string;
  isAdmin: boolean;
  newPassword?: string;
}

interface ResetPasswordRequest {
  userId: string;
  email: string;
}

serve(async (req) => {
  console.log('🚀 Admin User Operations - Request received:', req.method, req.url);

  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 Creating Supabase admin client...');
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header found');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔐 Verifying admin permissions...');
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('❌ Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      console.error('❌ Insufficient permissions:', profileError);
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📝 Parsing request body...');
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log('📤 Raw body:', bodyText);
      requestBody = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action } = requestBody;
    console.log('🎯 Processing action:', action);

    if (action === 'create_user') {
      const { email, password, fullName, isAdmin } = requestBody as CreateUserRequest;
      console.log('👤 Creating user:', { email, fullName, isAdmin });

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: { full_name: fullName },
        email_confirm: true
      });

      if (authError) {
        console.error('❌ Auth creation error:', authError);
        return new Response(
          JSON.stringify({ error: authError.message || 'Failed to create user' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (authData.user) {
        console.log('✅ User created in auth, updating profile...');
        
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            is_admin: isAdmin,
            account_status: 'pending'
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('❌ Profile update error:', profileError);
          return new Response(
            JSON.stringify({ error: profileError.message || 'Failed to update profile' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (isAdmin) {
          const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role: 'admin'
            });

          if (roleError) {
            console.error('⚠️ Role assignment error (non-critical):', roleError);
          }
        }

        try {
          await supabaseAdmin.from('security_audit').insert({
            user_id: user.id,
            target_user_id: authData.user.id,
            action: 'user_created',
            details: { email, is_admin: isAdmin },
            user_agent: req.headers.get('user-agent')
          });
        } catch (auditError) {
          console.error('⚠️ Audit log error (non-critical):', auditError);
        }

        console.log('✅ User creation completed successfully');
        return new Response(
          JSON.stringify({ 
            success: true, 
            user: authData.user,
            message: 'User created successfully'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (action === 'update_user') {
      const { userId, fullName, isAdmin, newPassword } = requestBody as UpdateUserRequest;
      console.log('🔄 Updating user:', { userId, fullName, isAdmin, hasNewPassword: !!newPassword });

      // Update profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          full_name: fullName,
          is_admin: isAdmin 
        })
        .eq('id', userId);

      if (profileError) {
        console.error('❌ Profile update error:', profileError);
        return new Response(
          JSON.stringify({ error: profileError.message || 'Failed to update profile' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update password if provided
      if (newPassword) {
        const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { password: newPassword }
        );

        if (passwordError) {
          console.error('❌ Password update error:', passwordError);
          return new Response(
            JSON.stringify({ error: passwordError.message || 'Failed to update password' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Manage roles
      if (isAdmin) {
        await supabaseAdmin
          .from('user_roles')
          .upsert({
            user_id: userId,
            role: 'admin'
          });
      } else {
        await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
      }

      try {
        await supabaseAdmin.from('security_audit').insert({
          user_id: user.id,
          target_user_id: userId,
          action: 'user_updated',
          details: { full_name: fullName, is_admin: isAdmin, password_changed: !!newPassword },
          user_agent: req.headers.get('user-agent')
        });
      } catch (auditError) {
        console.error('⚠️ Audit log error (non-critical):', auditError);
      }

      console.log('✅ User update completed successfully');
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'User updated successfully'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'reset_password') {
      const { userId, email } = requestBody as ResetPasswordRequest;
      console.log('🔑 Resetting password for:', email);

      const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: `${req.headers.get('origin')}/auth/reset-password`
        }
      });

      if (resetError) {
        console.error('❌ Password reset error:', resetError);
        return new Response(
          JSON.stringify({ error: resetError.message || 'Failed to send reset email' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        await supabaseAdmin.from('password_resets').insert({
          email,
          requested_by: user.id,
          request_type: 'admin_reset'
        });

        await supabaseAdmin.from('security_audit').insert({
          user_id: user.id,
          target_user_id: userId,
          action: 'password_reset_requested',
          details: { email },
          user_agent: req.headers.get('user-agent')
        });
      } catch (logError) {
        console.error('⚠️ Logging error (non-critical):', logError);
      }

      console.log('✅ Password reset completed successfully');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Password reset email sent successfully' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.error('❌ Invalid action:', action);
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        stack: error.stack 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
