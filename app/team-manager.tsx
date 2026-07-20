import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    Alert,
    ActivityIndicator,
    Switch,
    Share,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Colors } from '../constants/Colors';
import { useChildTeam, TeamMember, TeamRole, ROLE_LABELS } from '../features/vocabulario/hooks/useChildTeam';
import { useChildProfile } from '../context/ChildProfileContext';

// ----------------------------------------------------------------
// Colores de estado
// ----------------------------------------------------------------
const STATUS_COLOR: Record<string, string> = {
    active:  '#4CAF50',
    pending: '#FF9800',
    revoked: '#9E9E9E',
};
const STATUS_LABEL: Record<string, string> = {
    active:  'Activo',
    pending: 'Pendiente',
    revoked: 'Revocado',
};

const ROLES: TeamRole[] = ['terapeuta', 'psicologo', 'docente', 'padre_madre'];

// ----------------------------------------------------------------
// Componentes de presentación
// ----------------------------------------------------------------
function MemberCard({
    member,
    onRevoke,
    onToggleReports,
    onToggleVocab,
}: {
    member: TeamMember;
    onRevoke: () => void;
    onToggleReports: (val: boolean) => void;
    onToggleVocab: (val: boolean) => void;
}) {
    const isActive  = member.status === 'active';
    const isPending = member.status === 'pending';

    return (
        <View style={styles.memberCard}>
            <View style={styles.memberHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.memberRole}>{ROLE_LABELS[member.role]}</Text>
                    <Text style={styles.memberEmail}>
                        {member.invite_email ?? (isActive ? 'Vinculado' : 'Sin email')}
                    </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: STATUS_COLOR[member.status] }]}>
                    <Text style={styles.badgeText}>{STATUS_LABEL[member.status]}</Text>
                </View>
            </View>

            {isPending && (
                <View style={styles.tokenBox}>
                    <Text style={styles.tokenLabel}>Código de invitación:</Text>
                    <Text style={styles.tokenValue} selectable>{member.invite_token}</Text>
                    <TouchableOpacity
                        style={styles.copyBtn}
                        onPress={() =>
                            Share.share({
                                message: `Te invito a colaborar en ComuniTEA. Tu código de acceso es: ${member.invite_token}`,
                                title: 'Invitación ComuniTEA',
                            })
                        }
                    >
                        <Ionicons name="share-outline" size={16} color={Colors.primary} />
                        <Text style={styles.copyBtnText}>Compartir código</Text>
                    </TouchableOpacity>
                </View>
            )}

            {isActive && (
                <View style={styles.permissionsBox}>
                    <View style={styles.permRow}>
                        <Text style={styles.permLabel}>Ver reportes</Text>
                        <Switch
                            value={member.can_view_reports}
                            onValueChange={onToggleReports}
                            trackColor={{ false: '#DDD', true: Colors.primary }}
                            thumbColor="#FFF"
                        />
                    </View>
                    <View style={styles.permRow}>
                        <Text style={styles.permLabel}>Editar vocabulario</Text>
                        <Switch
                            value={member.can_edit_vocabulary}
                            onValueChange={onToggleVocab}
                            trackColor={{ false: '#DDD', true: Colors.primary }}
                            thumbColor="#FFF"
                        />
                    </View>
                </View>
            )}

            {member.status !== 'revoked' && (
                <TouchableOpacity style={styles.revokeBtn} onPress={onRevoke}>
                    <Ionicons name="person-remove-outline" size={15} color="#F44336" />
                    <Text style={styles.revokeBtnText}>Revocar acceso</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

// ----------------------------------------------------------------
// Pantalla principal
// ----------------------------------------------------------------
export default function TeamManagerScreen() {
    const router = useRouter();
    const { childProfile } = useChildProfile();
    const {
        members, isLoading, error,
        loadTeam, inviteMember, acceptInvite,
        revokeMember, updatePermissions, generateShareToken,
    } = useChildTeam();

    const [tab, setTab]             = useState<'equipo' | 'unirse'>('equipo');
    const [inviting, setInviting]   = useState(false);
    const [joinCode, setJoinCode]   = useState('');
    const [joining, setJoining]     = useState(false);
    const [genToken, setGenToken]   = useState(false);

    useEffect(() => { loadTeam(); }, [loadTeam]);

    // ---- Equipo — crear invitación ----
    const handleInvite = () => {
        Alert.alert('Invitar persona', 'Elige el rol del profesional', [
            ...ROLES.map((role) => ({
                text: ROLE_LABELS[role],
                onPress: async () => {
                    setInviting(true);
                    const member = await inviteMember(role);
                    setInviting(false);
                    if (member) {
                        Alert.alert(
                            'Invitación creada',
                            `Comparte este código con la persona:\n\n${member.invite_token}`,
                            [
                                {
                                    text: 'Compartir',
                                    onPress: () =>
                                        Share.share({
                                            message: `Te invito a colaborar en ComuniTEA. Tu código de acceso es: ${member.invite_token}`,
                                            title: 'Invitación ComuniTEA',
                                        }),
                                },
                                { text: 'Cerrar', style: 'cancel' },
                            ],
                        );
                    }
                },
            })),
            { text: 'Cancelar', style: 'cancel' },
        ]);
    };

    // ---- Compartir reporte ----
    const handleShareReport = async () => {
        setGenToken(true);
        const token = await generateShareToken();
        setGenToken(false);
        if (token) {
            Share.share({
                message: `Accede al reporte de ComuniTEA con este código (válido 7 días):\n\n${token}`,
                title: 'Reporte ComuniTEA',
            });
        }
    };

    // ---- Unirse — aceptar código ----
    const handleJoin = async () => {
        if (!joinCode.trim()) return;
        setJoining(true);
        const err = await acceptInvite(joinCode);
        setJoining(false);
        if (err) {
            Alert.alert('Error', err);
        } else {
            Alert.alert('¡Listo!', 'Te has unido al equipo correctamente.');
            setJoinCode('');
            loadTeam();
        }
    };

    const activeAndPending = members.filter((m) => m.status !== 'revoked');
    const childName = childProfile?.name ?? 'del niño';

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Equipo de {childName}</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
                {(['equipo', 'unirse'] as const).map((t) => (
                    <TouchableOpacity
                        key={t}
                        style={[styles.tab, tab === t && styles.tabActive]}
                        onPress={() => setTab(t)}
                    >
                        <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                            {t === 'equipo' ? '👥 Mi equipo' : '🔗 Unirse'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Error */}
            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : null}

            {/* TAB: EQUIPO */}
            {tab === 'equipo' && (
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.sectionDesc}>
                        Invita terapeutas, docentes u otros cuidadores para que puedan ver reportes
                        y colaborar en el seguimiento de {childName}.
                    </Text>

                    {isLoading ? (
                        <ActivityIndicator color={Colors.primary} style={{ marginTop: 32 }} />
                    ) : activeAndPending.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Ionicons name="people-outline" size={48} color="#CCC" />
                            <Text style={styles.emptyText}>Aún no hay nadie en el equipo</Text>
                        </View>
                    ) : (
                        activeAndPending.map((member) => (
                            <MemberCard
                                key={member.id}
                                member={member}
                                onRevoke={() =>
                                    Alert.alert(
                                        'Revocar acceso',
                                        `¿Seguro que quieres revocar el acceso de este ${ROLE_LABELS[member.role]}?`,
                                        [
                                            { text: 'Cancelar', style: 'cancel' },
                                            { text: 'Revocar', style: 'destructive', onPress: () => revokeMember(member.id) },
                                        ],
                                    )
                                }
                                onToggleReports={(val) =>
                                    updatePermissions(member.id, { can_view_reports: val })
                                }
                                onToggleVocab={(val) =>
                                    updatePermissions(member.id, { can_edit_vocabulary: val })
                                }
                            />
                        ))
                    )}

                    <TouchableOpacity
                        style={styles.inviteBtn}
                        onPress={handleInvite}
                        disabled={inviting}
                    >
                        {inviting ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="person-add-outline" size={20} color="#FFF" />
                                <Text style={styles.inviteBtnText}>Invitar persona</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.shareReportBtn}
                        onPress={handleShareReport}
                        disabled={genToken}
                    >
                        {genToken ? (
                            <ActivityIndicator color={Colors.primary} />
                        ) : (
                            <>
                                <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
                                <Text style={styles.shareReportBtnText}>Compartir reporte (código 7 días)</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            )}

            {/* TAB: UNIRSE */}
            {tab === 'unirse' && (
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.sectionDesc}>
                        Si recibiste un código de invitación, introdúcelo aquí para unirte
                        al equipo y acceder a los reportes.
                    </Text>

                    <View style={styles.joinCard}>
                        <Text style={styles.joinLabel}>Código de invitación</Text>
                        <TextInput
                            style={styles.codeInput}
                            value={joinCode}
                            onChangeText={setJoinCode}
                            placeholder="ej. a3f9c12b4e1d..."
                            autoCapitalize="none"
                            autoCorrect={false}
                            placeholderTextColor="#AAA"
                        />
                        <TouchableOpacity
                            style={[styles.joinBtn, (!joinCode.trim() || joining) && styles.joinBtnDisabled]}
                            onPress={handleJoin}
                            disabled={!joinCode.trim() || joining}
                        >
                            {joining ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.joinBtnText}>Unirse al equipo</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
                        <Text style={styles.infoText}>
                            El código es generado por el padre o tutor desde su panel. Cada código
                            es de un solo uso. Si tienes problemas, pide uno nuevo.
                        </Text>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

// ----------------------------------------------------------------
// Estilos
// ----------------------------------------------------------------
const styles = StyleSheet.create({
    container:   { flex: 1, backgroundColor: '#F5F7FA' },
    header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    title:       { fontSize: 17, fontWeight: '700', color: Colors.text.primary },
    tabRow:      { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    tab:         { flex: 1, paddingVertical: 12, alignItems: 'center' },
    tabActive:   { borderBottomWidth: 2, borderBottomColor: Colors.primary },
    tabText:     { fontSize: 14, color: Colors.text.secondary },
    tabTextActive: { color: Colors.primary, fontWeight: '600' },
    content:     { padding: 16, paddingBottom: 40 },
    sectionDesc: { fontSize: 14, color: Colors.text.secondary, marginBottom: 20, lineHeight: 20 },
    errorText:   { color: '#F44336', textAlign: 'center', marginVertical: 8, paddingHorizontal: 16 },
    // Member card
    memberCard:  { backgroundColor: Colors.surfaceContainerLowest, borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: Colors.onSurface, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    memberHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
    memberRole:  { fontSize: 15, fontWeight: '600', color: Colors.text.primary },
    memberEmail: { fontSize: 12, color: Colors.text.secondary, marginTop: 2 },
    badge:       { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    badgeText:   { color: '#FFF', fontSize: 11, fontWeight: '700' },
    tokenBox:    { backgroundColor: '#F0F4FF', borderRadius: 8, padding: 10, marginBottom: 8 },
    tokenLabel:  { fontSize: 12, color: Colors.text.secondary, marginBottom: 4 },
    tokenValue:  { fontSize: 13, fontFamily: 'monospace', color: Colors.primary, letterSpacing: 1, marginBottom: 8 },
    copyBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
    copyBtnText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
    permissionsBox: { borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 8, marginTop: 4, marginBottom: 8 },
    permRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
    permLabel:   { fontSize: 13, color: Colors.text.primary },
    revokeBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 4 },
    revokeBtnText: { fontSize: 13, color: '#F44336' },
    // Empty
    emptyBox:    { alignItems: 'center', paddingVertical: 40, gap: 12 },
    emptyText:   { fontSize: 15, color: '#AAA' },
    // Buttons
    inviteBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 12, padding: 14, marginTop: 8 },
    inviteBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
    shareReportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 12, padding: 13, marginTop: 10 },
    shareReportBtnText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
    // Join tab
    joinCard:    { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16 },
    joinLabel:   { fontSize: 14, fontWeight: '600', color: Colors.text.primary, marginBottom: 8 },
    codeInput:   { borderWidth: 1.5, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 14, color: Colors.text.primary, fontFamily: 'monospace', marginBottom: 12 },
    joinBtn:     { backgroundColor: Colors.primary, borderRadius: 10, padding: 13, alignItems: 'center' },
    joinBtnDisabled: { opacity: 0.5 },
    joinBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
    infoBox:     { flexDirection: 'row', gap: 8, backgroundColor: '#E8F0FE', borderRadius: 10, padding: 12 },
    infoText:    { flex: 1, fontSize: 13, color: Colors.text.secondary, lineHeight: 18 },
});
