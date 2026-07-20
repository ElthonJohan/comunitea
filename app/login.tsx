import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Colors } from '../constants/Colors';
import { Radii, outlineBorder, ShadowAmbientLight } from '../constants/Theme';
import { Fonts } from '../constants/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import PrimaryGradientButton from '../components/PrimaryGradientButton';

type Mode = 'login' | 'signup' | 'reset';

export default function LoginScreen() {
    const { signIn, signUp, resetPassword } = useAuth();

    const [mode, setMode] = useState<Mode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // -- Validaciones ------------------------------------------------------

    const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

    const validateForm = (): string | null => {
        if (!email.trim()) return 'Ingresa tu correo electrónico.';
        if (!validateEmail(email)) return 'El formato del correo no es válido.';
        if (mode === 'reset') return null;
        if (!password) return 'Ingresa tu contraseña.';
        if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
        if (mode === 'signup' && !firstName.trim()) return 'Ingresa tu nombre.';
        return null;
    };

    // -- Handlers ----------------------------------------------------------

    const handleSubmit = async () => {
        const validationError = validateForm();
        if (validationError) { Alert.alert('Datos inválidos', validationError); return; }

        setLoading(true);

        if (mode === 'login') {
            const error = await signIn(email.trim(), password);
            if (error) Alert.alert('Error al iniciar sesión', error);
            // Si no hay error, AuthContext + _layout.tsx redirigen automáticamente

        } else if (mode === 'signup') {
            const result = await signUp(email.trim(), password, firstName.trim());
            if (result === 'CHECK_EMAIL') {
                Alert.alert(
                    '¡Registro exitoso! 🎉',
                    'Revisa tu correo y confirma tu cuenta para continuar.',
                    [{ text: 'Entendido', onPress: () => setMode('login') }]
                );
            } else if (result) {
                Alert.alert('Error al registrarse', result);
            }

        } else if (mode === 'reset') {
            const error = await resetPassword(email.trim());
            if (error) {
                Alert.alert('Error', error);
            } else {
                Alert.alert(
                    'Correo enviado 📧',
                    'Revisa tu bandeja de entrada para restablecer tu contraseña.',
                    [{ text: 'Entendido', onPress: () => setMode('login') }]
                );
            }
        }

        setLoading(false);
    };

    // -- Textos dinámicos --------------------------------------------------

    const titles: Record<Mode, string> = {
        login: 'Iniciar Sesión',
        signup: 'Crear Cuenta',
        reset: 'Recuperar Contraseña',
    };

    const buttonLabels: Record<Mode, string> = {
        login: 'Iniciar Sesión',
        signup: 'Crear Cuenta',
        reset: 'Enviar Instrucciones',
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Logo simplificado → premium */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoIconWrap}>
                            <Ionicons name="chatbubbles" size={40} color={Colors.primary} />
                        </View>
                        <Text style={styles.logoWordmark}>
                            Comuni<Text style={styles.logoWordmarkTEA}>TEA</Text>
                        </Text>
                        <Text style={styles.logoSubtitle}>App de comunicación para niños TEA</Text>
                    </View>

                    <Text style={styles.title}>{titles[mode]}</Text>

                    {/* Campos con focus state */}
                    <View style={styles.formContainer}>
                        {mode === 'signup' && (
                            <TextInput
                                style={[styles.input, focusedField === 'name' && styles.inputFocused]}
                                placeholder="Tu nombre"
                                placeholderTextColor={Colors.text.disabled}
                                value={firstName}
                                onChangeText={setFirstName}
                                autoCapitalize="words"
                                returnKeyType="next"
                                onFocus={() => setFocusedField('name')}
                                onBlur={() => setFocusedField(null)}
                            />
                        )}

                        <TextInput
                            style={[styles.input, focusedField === 'email' && styles.inputFocused]}
                            placeholder="Correo electrónico"
                            placeholderTextColor={Colors.text.disabled}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            returnKeyType={mode === 'reset' ? 'send' : 'next'}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                        />

                        {mode !== 'reset' && (
                            <TextInput
                                style={[styles.input, focusedField === 'password' && styles.inputFocused]}
                                placeholder="Contraseña (mín. 6 caracteres)"
                                placeholderTextColor={Colors.text.disabled}
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                                autoCapitalize="none"
                                returnKeyType="done"
                                onSubmitEditing={handleSubmit}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                            />
                        )}
                    </View>

                    {/* Botón principal */}
                    <PrimaryGradientButton
                        label={buttonLabels[mode]}
                        onPress={handleSubmit}
                        disabled={loading}
                        loading={loading}
                        fullWidth
                    />

                    {/* Links secundarios */}
                    <View style={styles.footer}>
                        {mode === 'login' && (
                            <>
                                <TouchableOpacity onPress={() => { setMode('signup'); setPassword(''); }}>
                                    <Text style={styles.linkText}>¿No tienes cuenta? <Text style={styles.link}>Crear cuenta</Text></Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ marginTop: 12 }} onPress={() => { setMode('reset'); setPassword(''); }}>
                                    <Text style={styles.linkText}>¿Olvidaste tu contraseña? <Text style={styles.link}>Recuperar</Text></Text>
                                </TouchableOpacity>
                            </>
                        )}
                        {(mode === 'signup' || mode === 'reset') && (
                            <TouchableOpacity onPress={() => { setMode('login'); setPassword(''); setFirstName(''); }}>
                                <Text style={styles.linkText}>¿Ya tienes cuenta? <Text style={styles.link}>Iniciar sesión</Text></Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={styles.websiteText}>www.ComuniTEA.com</Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.surface },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 48,
    },
    // Logo
    logoContainer: { alignItems: 'center', marginBottom: 32 },
    logoIconWrap: {
        width: 72,
        height: 72,
        borderRadius: Radii.md,
        backgroundColor: Colors.surfaceContainerHigh,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        ...ShadowAmbientLight,
    },
    logoWordmark: {
        fontSize: 38,
        fontFamily: Fonts.displayExtraBold,
        color: Colors.text.primary,
        letterSpacing: -0.5,
    },
    logoWordmarkTEA: {
        color: Colors.primary,
    },
    logoSubtitle: {
        fontSize: 14,
        fontFamily: Fonts.bodyMedium,
        color: Colors.text.secondary,
        marginTop: 6,
        textAlign: 'center',
    },
    title: {
        fontSize: 22,
        fontFamily: Fonts.displayBold,
        color: Colors.text.primary,
        marginBottom: 24,
        alignSelf: 'flex-start',
    },
    formContainer: { width: '100%', gap: 14, marginBottom: 24 },
    input: {
        backgroundColor: Colors.surfaceContainerLowest,
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: Radii.full,
        fontSize: 16,
        fontFamily: Fonts.bodyMedium,
        color: Colors.text.primary,
        ...outlineBorder(1),
    },
    inputFocused: {
        borderColor: Colors.primaryContainer,
        backgroundColor: Colors.surfaceContainerLow,
        ...ShadowAmbientLight,
    },
    footer: { marginTop: 20, alignItems: 'center', gap: 6 },
    linkText: { fontSize: 14, fontFamily: Fonts.body, color: Colors.text.secondary, textAlign: 'center' },
    link: { color: Colors.primary, fontFamily: Fonts.bodyBold },
    websiteText: { fontSize: 12, fontFamily: Fonts.body, color: Colors.text.disabled, marginTop: 32 },
});