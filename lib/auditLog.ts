/**
 * auditLog.ts
 * Utilitario compartido para registrar cambios de configuración en config_audit_log.
 * Best-effort: los errores se silencian para no interrumpir el flujo normal.
 */
import { supabase } from './supabase';

export async function auditLog(
    userId: string,
    field: string,
    oldValue: string,
    newValue: string,
): Promise<void> {
    try {
        await supabase.from('config_audit_log').insert({
            user_id:    userId,
            field_name: field,
            old_value:  oldValue,
            new_value:  newValue,
        });
    } catch {
        // No es crítico
    }
}
