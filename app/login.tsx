import { useState } from 'react'
import {
  ScrollView,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native'
import { ScreenContainer } from '@/components/screen-container'
import { useAuth } from '@/hooks/use-auth'
import { useColors } from '@/hooks/use-colors'
import * as Haptics from 'expo-haptics'
import { trpc } from '@/lib/trpc'
import * as Auth from '@/lib/_core/auth'
import { useRouter } from 'expo-router'

export default function LoginScreen() {
  const colors = useColors()
  const { isAuthenticated, loading } = useAuth()
  const [email, setEmail] = useState('aluno@fitevolve.com')
  const [password, setPassword] = useState('teste123')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const testLoginMutation = trpc.authTest.testLogin.useMutation()

  const handleTestLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha email e senha')
      return
    }

    setIsLoading(true)
    setError(null)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    try {
      const result = await testLoginMutation.mutateAsync({
        email: email.trim(),
        password: password.trim(),
      })

      if (result.success && result.token) {
        // Salvar token e informações do usuário
        await Auth.setSessionToken(result.token)
        await Auth.setUserInfo({
          id: result.user.id,
          openId: result.user.id.toString(),
          name: result.user.name,
          email: result.user.email,
          loginMethod: 'test',
          lastSignedIn: new Date(),
        })

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        Alert.alert('Sucesso', `Bem-vindo, ${result.user.name}!`)

        // Redirecionar para home
        setTimeout(() => {
          router.push('/onboarding')
        }, 500)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Falha ao fazer login'
      setError(errorMsg)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert('Erro de Login', errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    )
  }

  if (isAuthenticated) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <Text className="text-lg font-semibold text-foreground">
          Você já está autenticado!
        </Text>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 32, alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: '700',
              color: colors.foreground,
              marginBottom: 8,
            }}
          >
            Fit_Evolve
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.muted,
              textAlign: 'center',
            }}
          >
            Seu ecossistema de saúde integrada
          </Text>
        </View>

        {/* Credenciais de Teste */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: colors.muted,
              marginBottom: 8,
              textTransform: 'uppercase',
            }}
          >
            🧪 Credenciais de Teste
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: colors.foreground,
              lineHeight: 20,
            }}
          >
            Email: aluno@fitevolve.com{'\n'}
            Senha: teste123
          </Text>
        </View>

        {/* Email Input */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.foreground,
              marginBottom: 8,
            }}
          >
            Email
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
              fontSize: 14,
              color: colors.foreground,
            }}
            placeholder="aluno@fitevolve.com"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.foreground,
              marginBottom: 8,
            }}
          >
            Senha
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
              fontSize: 14,
              color: colors.foreground,
            }}
            placeholder="teste123"
            placeholderTextColor={colors.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        {/* Error Message */}
        {error && (
          <View
            style={{
              backgroundColor: colors.error,
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: 'white',
                fontWeight: '500',
              }}
            >
              ❌ {error}
            </Text>
          </View>
        )}

        {/* Login Button */}
        <Pressable
          onPress={handleTestLogin}
          disabled={isLoading}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 14,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 16,
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              Entrar com Email
            </Text>
          )}
        </Pressable>

        {/* Info */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 8,
            padding: 12,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              lineHeight: 18,
            }}
          >
            💡 <Text style={{ fontWeight: '600' }}>Dica:</Text> Use as credenciais de teste acima para explorar todas as funcionalidades do Fit_Evolve.
          </Text>
        </View>

        {/* Profissionais de Teste */}
        <View
          style={{
            marginTop: 32,
            paddingTop: 24,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.foreground,
              marginBottom: 12,
            }}
          >
            👨‍⚕️ Profissionais de Teste
          </Text>

          {[
            { email: 'personal@fitevolve.com', name: 'Personal Trainer' },
            { email: 'nutri@fitevolve.com', name: 'Nutricionista' },
            { email: 'fisio@fitevolve.com', name: 'Fisioterapeuta' },
          ].map((prof, index) => (
            <Pressable
              key={index}
              onPress={() => {
                setEmail(prof.email)
                setPassword('teste123')
              }}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '500',
                  color: colors.foreground,
                }}
              >
                {prof.name}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.muted,
                  marginTop: 4,
                }}
              >
                {prof.email}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}
