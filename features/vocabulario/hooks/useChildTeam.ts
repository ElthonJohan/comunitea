import { useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { useChildProfile } from '../../../context/ChildProfileContext';
import { auditLog } from '../../../lib/auditLog';

// ----------------------------------------------------------------
// Tipos
// ----------------------------------------------------------------
export type TeamRole = 'padre_madre' | 'terapeuta' | 'psicologo' | 'docente';

export const ROLE_LABELS: Record<TeamRole, string> = {
    padre_madre: '👨‍👩‍👧 Padre / Madre',
    terapeuta:   '🏥 Terapeuta',
    psicologo:   '🧠 Psicólogo / a',
    docente:     '🏫 Docente',
};

export interface TeamMember {
    id: string;
    child_id: string;
    invited_by: string;
    user_id: string | null;
    role: TeamRole;
    can_view_reports: boolean;
    can_edit_vocabulary: boolean;
    invite_token: string;
    invite_email: string | null;
    status: 'pending' | 'active' | 'revoked';
    created_at: string;
    accepted_at: string | null;
}

export interface ShareToken {
    id: string;
    token: string;
    expires_at: string;
}

// ----------------------------------------------------------------
// Hook
// ----------------------------------------------------------------
export function useChildTeam() {
    const { user } = useAuth();
    const { childProfile } = useChildProfile();
    const [members, setMembers]     = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError]         = useState<string | null>(null);

    // Cargar equipo del niño activo
    const loadTeam = useCallback(async () => {
        if (!childProfile?.id) return;
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: err } = await supabase
                .from('child_team')
                .select('*')
                .eq('child_id', childProfile.id)
                .order('created_at', { ascending: true });

            if (err) throw err;
            setMembers((data ?? []) as TeamMember[]);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Error al cargar equipo');
        } finally {
            setIsLoading(false);
        }
    }, [childProfile?.id]);

// Permisos por defecto según el rol del profesional
const ROLE_DEFAULT_PERMISSIONS: Record<TeamRole, { can_view_reports: boolean; can_edit_vocabulary: boolean }> = {
    padre_madre: { can_view_reports: true,  can_edit_vocabulary: true  },
    terapeuta:   { can_view_reports: true,  can_edit_vocabulary: true  },
    psicologo:   { can_view_reports: true,  can_edit_vocabulary: false },
    docente:     { can_view_reports: true,  can_edit_vocabulary: false },
};

    // Crear invitación: genera un registro pending con token
    const inviteMember = useCallback(async (
        role: TeamRole,
        email?: string,
    ): Promise<TeamMember | null> => {
        if (!user || !childProfile?.id) return null;
        setError(null);
        try {
            const { data, error: err } = await supabase
                .from('child_team')
                .insert({
                    child_id:    childProfile.id,
                    invited_by:  user.id,
                    role,
                    invite_email: email ?? null,
                    ...ROLE_DEFAULT_PERMISSIONS[role],
                })
                .select()
                .single();

            if (err) throw err;
            const newMember = data as TeamMember;
            setMembers((prev) => [...prev, newMember]);
            await auditLog(user.id, 'child_team_invite', '', `role=${role} child=${childProfile.id}`);
            return newMember;
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Error al crear invitación');
            return null;
        }
    }, [user, childProfile?.id]);

    // Aceptar invitación por código (llamado por el profesional)
    const acceptInvite = useCallback(async (token: string): Promise<string | null> => {
        setError(null);
        try {
            const { error: err } = await supabase.rpc('accept_team_invite', { p_token: token.trim() });
            if (err) throw err;
            return null; // sin error
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Código inválido o ya utilizado';
            setError(msg);
            return msg;
        }
    }, []);

    // Revocar miembro
    const revokeMember = useCallback(async (memberId: string): Promise<void> => {
        setError(null);
        try {
            const { error: err } = await supabase
                .from('child_team')
                .update({ status: 'revoked' })
                .eq('id', memberId);

            if (err) throw err;
            setMembers((prev) =>
                prev.map((m) => m.id === memberId ? { ...m, status: 'revoked' } : m)
            );
            if (user) await auditLog(user.id, 'child_team_revoke', 'active', `memberId=${memberId}`);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Error al revocar acceso');
        }
    }, []);

    // Actualizar permisos de un miembro
    const updatePermissions = useCallback(async (
        memberId: string,
        perms: { can_view_reports?: boolean; can_edit_vocabulary?: boolean },
    ): Promise<void> => {
        setError(null);
        try {
            const { error: err } = await supabase
                .from('child_team')
                .update(perms)
                .eq('id', memberId);

            if (err) throw err;
            setMembers((prev) =>
                prev.map((m) => m.id === memberId ? { ...m, ...perms } : m)
            );
            if (user) {
                for (const [key, value] of Object.entries(perms)) {
                    const member = members.find((m) => m.id === memberId);
                    const oldVal = member ? String(member[key as keyof TeamMember] ?? '') : '';
                    await auditLog(user.id, `child_team_perm_${key}`, oldVal, String(value));
                }
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Error al actualizar permisos');
        }
    }, []);

    // Generar token temporal para compartir reporte (7 días)
    const generateShareToken = useCallback(async (): Promise<string | null> => {
        if (!user || !childProfile?.id) return null;
        setError(null);
        try {
            // Limpiar tokens expirados del mismo usuario primero
            await supabase
                .from('share_tokens')
                .delete()
                .eq('user_id', user.id)
                .lt('expires_at', new Date().toISOString());

            const { data, error: err } = await supabase
                .from('share_tokens')
                .insert({ user_id: user.id, child_id: childProfile.id })
                .select('token, expires_at')
                .single();

            if (err) throw err;
            return (data as ShareToken).token;
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Error al generar token');
            return null;
        }
    }, [user, childProfile?.id]);

    return {
        members,
        isLoading,
        error,
        loadTeam,
        inviteMember,
        acceptInvite,
        revokeMember,
        updatePermissions,
        generateShareToken,
    };
}
