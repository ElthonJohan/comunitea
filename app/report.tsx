import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Path, Circle, G, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Colors } from '../constants/Colors';
import { Radii, Space, ShadowAmbientLight } from '../constants/Theme';
import { Fonts } from '../constants/Typography';
import { INTENT_CATEGORIES, CATEGORY_TO_INTENT } from '../constants/Categories';
import { GameHistoryPoint, useReport } from '../features/perfil/hooks/useReport';

const CHART_W = Dimensions.get('window').width - 32 - 40;

function SvgBarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
    const H = 110;
    const n = data.length || 1;
    const barW = Math.min(28, CHART_W / n - 6);
    const max = Math.max(...data.map(d => d.value), 1);
    const gradId = `bg-${color.replace('#', '')}`;

    return (
        <Svg width={CHART_W} height={H + 32}>
            <Defs>
                <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={color} stopOpacity={0.9} />
                    <Stop offset="1" stopColor={color} stopOpacity={0.5} />
                </LinearGradient>
            </Defs>
            {data.map((item, i) => {
                const x = (i / n) * CHART_W + (CHART_W / n - barW) / 2;
                const barH = Math.max(4, (item.value / max) * H);
                return (
                    <G key={i}>
                        <Rect x={x} y={H - barH} width={barW} height={barH} rx={6} fill={`url(#${gradId})`} />
                        {item.value > 0 && (
                            <SvgText
                                x={x + barW / 2} y={H - barH - 5}
                                textAnchor="middle" fontSize={10} fontWeight="600"
                                fill={Colors.text.secondary}>{item.value}</SvgText>
                        )}
                        <SvgText
                            x={x + barW / 2} y={H + 18}
                            textAnchor="middle" fontSize={10}
                            fill={Colors.text.disabled}>{item.label}</SvgText>
                    </G>
                );
            })}
        </Svg>
    );
}

function SvgLineChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
    const H = 100;
    const n = data.length;
    if (n === 0) return null;
    const max = Math.max(...data.map(d => d.value), 1);
    const pts = data.map((d, i) => ({
        x: n === 1 ? CHART_W / 2 : (i / (n - 1)) * CHART_W,
        y: H - Math.max(4, (d.value / max) * (H - 8)),
    }));
    const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const areaD = `${pathD} L${pts[pts.length - 1].x.toFixed(1)},${H} L${pts[0].x.toFixed(1)},${H} Z`;
    const areaId = `area-${color.replace('#', '')}`;

    return (
        <Svg width={CHART_W} height={H + 32}>
            <Defs>
                <LinearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={color} stopOpacity={0.25} />
                    <Stop offset="1" stopColor={color} stopOpacity={0} />
                </LinearGradient>
            </Defs>
            <Path d={areaD} fill={`url(#${areaId})`} />
            <Path d={pathD} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, i) => (
                <Circle key={i} cx={p.x} cy={p.y} r={4} fill={color} />
            ))}
            {data.map((d, i) => (
                <SvgText key={i} x={pts[i].x} y={H + 18} textAnchor="middle" fontSize={10} fill={Colors.text.disabled}>
                    {d.label}
                </SvgText>
            ))}
        </Svg>
    );
}

function DonutChart({ data }: { data: { label: string; value: number; color: string; emoji: string }[] }) {
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const R = 52; const CX = CHART_W / 2; const CY = 68; const SW = 20;
    let angle = -Math.PI / 2;
    const slices: { path: string; color: string }[] = [];

    data.filter(d => d.value > 0).forEach(item => {
        const sweep = (item.value / total) * 2 * Math.PI;
        const x1 = CX + R * Math.cos(angle);
        const y1 = CY + R * Math.sin(angle);
        const x2 = CX + R * Math.cos(angle + sweep);
        const y2 = CY + R * Math.sin(angle + sweep);
        const large = sweep > Math.PI ? 1 : 0;
        slices.push({ path: `M${x1.toFixed(1)},${y1.toFixed(1)} A${R},${R} 0 ${large} 1 ${x2.toFixed(1)},${y2.toFixed(1)}`, color: item.color });
        angle += sweep;
    });

    return (
        <Svg width={CHART_W} height={CY * 2}>
            {slices.map((s, i) => (
                <Path key={i} d={s.path} stroke={s.color} strokeWidth={SW} fill="none" strokeLinecap="butt" />
            ))}
            <SvgText x={CX} y={CY + 5} textAnchor="middle" fontSize={14} fontWeight="700" fill={Colors.text.primary}>
                {total}
            </SvgText>
            <SvgText x={CX} y={CY + 20} textAnchor="middle" fontSize={10} fill={Colors.text.secondary}>
                total
            </SvgText>
        </Svg>
    );
}

function ProgressRing({ pct, color, size = 68 }: { pct: number; color: string; size?: number }) {
    const R = size / 2 - 7;
    const C = 2 * Math.PI * R;
    const offset = C - Math.min(pct / 100, 1) * C;
    const cx = size / 2; const cy = size / 2;

    return (
        <Svg width={size} height={size}>
            <Circle cx={cx} cy={cy} r={R} stroke={Colors.surfaceContainerHigh} strokeWidth={8} fill="none" />
            <Circle cx={cx} cy={cy} r={R} stroke={color} strokeWidth={8} fill="none"
                strokeDasharray={C} strokeDashoffset={offset}
                strokeLinecap="round"
                rotation={-90} origin={`${cx},${cy}`} />
            <SvgText x={cx} y={cy + 5} textAnchor="middle" fontSize={13} fontWeight="800" fill={color}>
                {pct}%
            </SvgText>
        </Svg>
    );
}

function CompareRow({ label, current, previous }: { label: string; current: number; previous: number | null }) {
    const diff = previous !== null ? current - previous : null;
    const pct = previous && previous > 0 ? Math.round((diff! / previous) * 100) : null;
    const badgeStyle = diff === null
        ? compare.badgeFlat
        : diff > 0
            ? compare.badgeUp
            : diff < 0
                ? compare.badgeDown
                : compare.badgeFlat;

    return (
        <View style={compare.row}>
            <Text style={compare.label}>{label}</Text>
            <View style={compare.right}>
                <Text style={compare.current}>{current}</Text>
                {pct !== null && (
                    <View style={[compare.badge, badgeStyle]}>
                        <Text style={compare.badgeText}>
                            {diff! > 0 ? '▲' : diff! < 0 ? '▼' : '─'} {Math.abs(pct)}%
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

function GameRow({ item }: { item: GameHistoryPoint }) {
    const date = new Date(item.completed_at).toLocaleDateString('es', { day: '2-digit', month: 'short' });
    const pctColor = item.pct >= 80 ? Colors.success : item.pct >= 60 ? '#e0a060' : Colors.danger;

    return (
        <View style={game.row}>
            <View style={game.badge}>
                <Text style={game.badgeText}>N{item.sublevel}</Text>
            </View>
            <Text style={game.date}>{date}</Text>
            <View style={game.barWrap}>
                <View style={[game.bar, { width: `${item.pct}%`, backgroundColor: pctColor }]} />
            </View>
            <Text style={[game.pct, { color: pctColor }]}>{item.pct}%</Text>
        </View>
    );
}

function buildHtml(period: number, report: ReturnType<typeof useReport>['data']) {
    if (!report) return '';

    const { current, previous, daily, gameHistory, insights } = report;
    const dailyRows = daily
        .map(point => `<tr><td>${point.day}</td><td>${point.sessions}</td><td>${point.sentence_plays}</td><td>${point.pictogram_taps}</td></tr>`)
        .join('');
    const picRows = current.topPictograms
        .slice(0, 5)
        .map((item, index) => `<tr><td>${index + 1}. ${item.id}</td><td>${item.count}</td></tr>`)
        .join('');
    const gameRows = gameHistory
        .slice(0, 8)
        .map(item => `<tr><td>Nivel ${item.sublevel}</td><td>${new Date(item.completed_at).toLocaleDateString('es')}</td><td>${item.correct}/${item.total_trials}</td><td>${item.pct}%</td></tr>`)
        .join('');
    const insightRows = insights
        .map(item => `<li>${item.message}</li>`)
        .join('');

    return `<!DOCTYPE html><html><head><meta charset="utf-8" />
<style>
body{font-family:sans-serif;color:#37475a;padding:24px;max-width:700px;margin:auto}
h1{color:#a4c3b2;font-size:22px}h2{color:#5c6b7d;font-size:16px;margin-top:24px}
table{width:100%;border-collapse:collapse;margin-top:8px}
th,td{text-align:left;padding:6px 10px;border-bottom:1px solid #d4d8dc;font-size:13px}
th{background:#f8f4e3;font-weight:600}.meta{color:#9ca8b8;font-size:12px;margin-bottom:16px}
.stat{display:inline-block;margin-right:24px;margin-bottom:12px}.stat-val{font-size:28px;font-weight:700;color:#a4c3b2}.stat-lab{font-size:12px;color:#5c6b7d}
ul{padding-left:20px}
</style></head><body>
<h1>Reporte de uso — ComuniTEA</h1>
<p class="meta">Período: últimos ${period} días · Generado el ${new Date().toLocaleDateString('es')}</p>
<div>
<div class="stat"><div class="stat-val">${current.sessions}</div><div class="stat-lab">Sesiones</div></div>
<div class="stat"><div class="stat-val">${current.sentencePlays}</div><div class="stat-lab">Frases</div></div>
<div class="stat"><div class="stat-val">${current.pictogramTaps}</div><div class="stat-lab">Taps pictogramas</div></div>
</div>
<p>${current.description}</p>
${previous ? `<h2>Comparativa vs período anterior</h2><table><tr><th>Métrica</th><th>Actual</th><th>Anterior</th></tr><tr><td>Sesiones</td><td>${current.sessions}</td><td>${previous.sessions}</td></tr><tr><td>Frases</td><td>${current.sentencePlays}</td><td>${previous.sentencePlays}</td></tr><tr><td>Taps</td><td>${current.pictogramTaps}</td><td>${previous.pictogramTaps}</td></tr></table>` : ''}
${daily.length ? `<h2>Uso diario</h2><table><tr><th>Día</th><th>Sesiones</th><th>Frases</th><th>Taps</th></tr>${dailyRows}</table>` : ''}
${current.topPictograms.length ? `<h2>Pictogramas más usados</h2><table><tr><th>Pictograma</th><th>Usos</th></tr>${picRows}</table>` : ''}
${gameHistory.length ? `<h2>Historial de juego</h2><table><tr><th>Nivel</th><th>Fecha</th><th>Aciertos</th><th>%</th></tr>${gameRows}</table>` : ''}
${insights.length ? `<h2>Sugerencias de IA</h2><ul>${insightRows}</ul>` : ''}
</body></html>`;
}

export default function ReportScreen() {
    const router = useRouter();
    const { data, loading, error, fetchReport } = useReport();
    const [period, setPeriod] = useState<7 | 30>(7);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchReport(period);
    }, [fetchReport, period]);

    const handleExport = useCallback(async () => {
        if (!data) return;
        setExporting(true);

        try {
            const html = buildHtml(period, data);
            const { uri } = await Print.printToFileAsync({ html, base64: false });
            const canShare = await Sharing.isAvailableAsync();

            if (canShare) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Exportar reporte',
                    UTI: 'com.adobe.pdf',
                });
            } else {
                Alert.alert('PDF guardado', uri);
            }
        } catch {
            Alert.alert('Error', 'No se pudo generar el PDF');
        } finally {
            setExporting(false);
        }
    }, [data, period]);

    // F2: Desglose por intención comunicativa (cliente-side via CATEGORY_TO_INTENT)
    const intentBreakdown = useMemo(() => {
        if (!data) return [];
        const counts: Record<string, number> = {};
        for (const { id, count } of data.current.topPictograms) {
            const intent = CATEGORY_TO_INTENT[id];
            if (intent) {
                counts[intent] = (counts[intent] ?? 0) + count;
            }
        }
        const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
        return INTENT_CATEGORIES.map(intent => ({
            ...intent,
            count: counts[intent.id] ?? 0,
            pct: Math.round(((counts[intent.id] ?? 0) / total) * 100),
        }));
    }, [data]);

    const dailyChart = data?.daily.slice(-7).map(point => ({
        label: point.day.slice(5),
        value: point.pictogram_taps + point.sentence_plays,
    })) ?? [];

    const hourlyChart = data
        ? Object.entries(data.current.byHour)
            .sort((left, right) => Number(left[0]) - Number(right[0]))
            .filter((_, index) => index % 3 === 0)
            .map(([hour, value]) => ({ label: `${hour}h`, value }))
        : [];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Reporte de uso</Text>
                <TouchableOpacity
                    style={[styles.exportBtn, (exporting || !data) && styles.exportBtnDisabled]}
                    onPress={handleExport}
                    disabled={exporting || !data}
                >
                    {exporting ? (
                        <ActivityIndicator size="small" color={Colors.text.inverse} />
                    ) : (
                        <Ionicons name="share-outline" size={20} color={Colors.text.inverse} />
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.periodRow}>
                {([7, 30] as const).map(value => (
                    <TouchableOpacity
                        key={value}
                        style={[styles.periodBtn, period === value && styles.periodBtnActive]}
                        onPress={() => setPeriod(value)}
                    >
                        <Text style={[styles.periodBtnText, period === value && styles.periodBtnTextActive]}>
                            {value === 7 ? 'Últimos 7 días' : 'Últimos 30 días'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading && !data ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : error ? (
                <View style={styles.centered}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => fetchReport(period)}>
                        <Text style={styles.retryText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            ) : data ? (
                <ScrollView contentContainerStyle={styles.scroll}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Actividad</Text>
                        <CompareRow label="Sesiones" current={data.current.sessions} previous={data.previous?.sessions ?? null} />
                        <CompareRow label="Frases reproducidas" current={data.current.sentencePlays} previous={data.previous?.sentencePlays ?? null} />
                        <CompareRow label="Taps a pictogramas" current={data.current.pictogramTaps} previous={data.previous?.pictogramTaps ?? null} />
                        {data.previous && <Text style={styles.compareNote}>▲▼ respecto al período anterior de {period} días</Text>}
                    </View>

                    {dailyChart.length > 0 && (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Uso por día</Text>
                            <Text style={styles.cardSub}>Taps + frases combinados</Text>
                            <SvgLineChart data={dailyChart} color={Colors.primary} />
                        </View>
                    )}

                    {hourlyChart.length > 0 && (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Horarios de uso</Text>
                            <Text style={styles.cardSub}>Actividad cada 3 horas</Text>
                            <SvgBarChart data={hourlyChart} color={Colors.accent} />
                        </View>
                    )}

                    {data.current.topPictograms.length > 0 && (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Pictogramas más usados</Text>
                            {data.current.topPictograms.slice(0, 5).map((item, index) => {
                                const max = data.current.topPictograms[0]?.count ?? 1;
                                const pct = Math.round((item.count / max) * 100);
                                return (
                                    <View key={item.id} style={styles.picRow}>
                                        <Text style={styles.picRank}>{index + 1}</Text>
                                        <View style={styles.picInfo}>
                                            <View style={styles.picBarRow}>
                                                <Text style={styles.picLabel}>{item.id}</Text>
                                                <Text style={styles.picCount}>{item.count}</Text>
                                            </View>
                                            <View style={styles.picBarBg}>
                                                <View style={[styles.picBar, { width: `${pct}%` }]} />
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {data.gameHistory.length > 0 && (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Modo juego</Text>
                            <Text style={styles.cardSub}>Últimas sesiones</Text>
                            {data.gameHistory.slice(0, 6).map(item => {
                                const pctColor = item.pct >= 80 ? Colors.success : item.pct >= 60 ? '#e0a060' : Colors.danger;
                                return (
                                    <View key={`${item.completed_at}-${item.sublevel}`} style={game.ringRow}>
                                        <ProgressRing pct={item.pct} color={pctColor} size={60} />
                                        <View style={{ flex: 1 }}>
                                            <GameRow item={item} />
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* F2: Intenciones comunicativas */}
                    {intentBreakdown.some(i => i.count > 0) && (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Intenciones comunicativas</Text>
                            <Text style={styles.cardSub}>Distribución del tipo de comunicación</Text>
                            <DonutChart data={intentBreakdown.map(i => ({ label: i.label, value: i.count, color: i.color, emoji: i.emoji }))} />
                            <View style={styles.intentLegend}>
                                {intentBreakdown.filter(i => i.count > 0).map(intent => (
                                    <View key={intent.id} style={styles.intentLegendRow}>
                                        <View style={[styles.intentDot, { backgroundColor: intent.color }]} />
                                        <Text style={styles.intentEmoji}>{intent.emoji}</Text>
                                        <Text style={styles.intentLabelText}>{intent.label}</Text>
                                        <Text style={styles.intentCount}>{intent.pct}%</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Sugerencias de IA</Text>
                        {data.insights.length > 0 ? (
                            data.insights.map((item) => (
                                <View key={item.id} style={styles.insightRow}>
                                    <View style={[styles.insightDot, item.seen && styles.insightDotSeen]} />
                                    <View style={styles.insightBody}>
                                        <Text style={styles.insightType}>{item.insight_type.replace(/_/g, ' ')}</Text>
                                        <Text style={styles.insightText}>{item.message}</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyHint}>Todavía no hay sugerencias generadas para este período.</Text>
                        )}
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Observación</Text>
                        <Text style={styles.description}>{data.current.description}</Text>
                    </View>
                </ScrollView>
            ) : null}
        </SafeAreaView>
    );
}



const compare = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Space.md,
        marginBottom: Space.sm,
        backgroundColor: Colors.surfaceContainerLow,
        borderRadius: Radii.default,
        paddingHorizontal: Space.md,
    },
    label: { fontSize: 15, fontFamily: Fonts.bodyMedium, color: Colors.text.primary },
    right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    current: { fontSize: 16, fontFamily: Fonts.bodyBold, color: Colors.primary },
    badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
    badgeUp: { backgroundColor: '#d4e6dd' },
    badgeDown: { backgroundColor: '#f0d4ce' },
    badgeFlat: { backgroundColor: Colors.surfaceContainerHigh },
    badgeText: { fontSize: 11, fontWeight: '700', color: Colors.text.secondary },
});

const game = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
    badge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
    date: { fontSize: 12, color: Colors.text.secondary, width: 50 },
    barWrap: {
        flex: 1,
        height: 10,
        backgroundColor: Colors.surfaceContainerHigh,
        borderRadius: 5,
        overflow: 'hidden',
    },
    bar: { height: 10, borderRadius: 5 },
    pct: { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },
    ringRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.surface },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.surfaceContainerLow,
        ...ShadowAmbientLight,
    },
    backButton: { padding: 8, marginRight: 8 },
    title: { flex: 1, fontSize: 20, fontFamily: Fonts.displayBold, color: Colors.text.primary },
    exportBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    exportBtnDisabled: { opacity: 0.5 },
    periodRow: { flexDirection: 'row', padding: 16, gap: 12 },
    periodBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: Radii.default,
        backgroundColor: Colors.surfaceContainerLow,
        alignItems: 'center',
    },
    periodBtnActive: { backgroundColor: Colors.surfaceContainerHigh },
    periodBtnText: { fontSize: 14, fontFamily: Fonts.bodySemiBold, color: Colors.text.secondary },
    periodBtnTextActive: { color: Colors.primary, fontFamily: Fonts.bodyBold },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    errorText: { color: Colors.danger, fontSize: 16, textAlign: 'center', marginBottom: 16 },
    retryBtn: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
    },
    retryText: { color: Colors.text.inverse, fontWeight: '700' },
    scroll: { padding: 16, paddingBottom: 40 },
    card: {
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: Radii.lg,
        padding: 20,
        marginBottom: Space.md,
        ...ShadowAmbientLight,
    },
    cardTitle: { fontSize: 18, fontFamily: Fonts.displayBold, color: Colors.text.primary, marginBottom: 4 },
    cardSub: { fontSize: 12, color: Colors.text.disabled, marginBottom: 8 },
    compareNote: { fontSize: 11, color: Colors.text.disabled, marginTop: 10, fontStyle: 'italic' },
    description: { fontSize: 15, color: Colors.text.secondary, lineHeight: 24 },
    picRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
    picRank: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: Colors.primaryLight,
        textAlign: 'center',
        lineHeight: 22,
        fontSize: 12,
        fontWeight: '700',
        color: Colors.primary,
    },
    picInfo: { flex: 1 },
    picBarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    picLabel: { fontSize: 14, color: Colors.text.primary },
    picCount: { fontSize: 13, fontWeight: '700', color: Colors.primary },
    picBarBg: {
        height: 8,
        backgroundColor: Colors.surfaceContainerHigh,
        borderRadius: 4,
        overflow: 'hidden',
    },
    picBar: { height: 8, backgroundColor: Colors.primary, borderRadius: 4 },
    insightRow: {
        flexDirection: 'row',
        gap: 10,
        paddingVertical: Space.md,
        marginBottom: Space.sm,
        backgroundColor: Colors.surfaceContainerLow,
        borderRadius: Radii.default,
        paddingHorizontal: Space.md,
    },
    insightDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
        marginTop: 6,
    },
    insightDotSeen: { backgroundColor: Colors.text.disabled },
    insightBody: { flex: 1 },
    insightType: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.text.disabled,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    insightText: { fontSize: 14, color: Colors.text.primary, lineHeight: 20 },
    emptyHint: { fontSize: 14, color: Colors.text.secondary, lineHeight: 22 },
    // F2: intent breakdown — donut legend
    intentLegend: { gap: 8, marginTop: 12 },
    intentLegendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    intentDot: { width: 10, height: 10, borderRadius: 5 },
    intentEmoji: { fontSize: 16, width: 22, textAlign: 'center' },
    intentLabelText: { flex: 1, fontSize: 13, color: Colors.text.primary },
    intentCount: { fontSize: 13, fontWeight: '700', color: Colors.text.secondary },
});
