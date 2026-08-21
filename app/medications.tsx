import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

type CatalogItem = {
  brand: string;
  activeIngredient: string;
  sourceUrl: string;
  summary: string;
};

const CATALOG: CatalogItem[] = [
  {
    brand: "Wegovy",
    activeIngredient: "semaglutida",
    sourceUrl: "https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/novos-medicamentos-e-indicacoes/wegovy-semaglutida",
    summary: "Controle de peso conforme indicação aprovada e prescrição.",
  },
  {
    brand: "Ozempic",
    activeIngredient: "semaglutida",
    sourceUrl: "https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2025/entra-em-vigor-norma-que-preve-retencao-de-receita-para-medicamentos-agonistas-glp-1",
    summary: "Registrar somente conforme a indicação da bula e a prescrição profissional.",
  },
  {
    brand: "Mounjaro",
    activeIngredient: "tirzepatida",
    sourceUrl: "https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2025/entra-em-vigor-norma-que-preve-retencao-de-receita-para-medicamentos-agonistas-glp-1",
    summary: "Registrar somente conforme a indicação da bula e a prescrição profissional.",
  },
  {
    brand: "Outro agonista GLP-1",
    activeIngredient: "informar conforme receita",
    sourceUrl: "https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2026/anvisa-emite-alerta-para-risco-de-pancreatite-aguda-associada-ao-uso-indevido-de-canetas-emagrecedoras",
    summary: "Use o nome e o princípio ativo exatamente como aparecem na receita.",
  },
];

const EVENT_OPTIONS = [
  { label: "Náusea", value: "nausea" as const },
  { label: "Diarreia", value: "diarrhea" as const },
  { label: "Vômito", value: "vomiting" as const },
  { label: "Constipação", value: "constipation" as const },
  { label: "Dor abdominal", value: "abdominal_pain" as const },
];

export default function MedicationsScreen() {
  const router = useRouter();
  const colors = useColors();
  const utils = trpc.useUtils();
  const [selected, setSelected] = useState(CATALOG[0]);
  const [prescriberName, setPrescriberName] = useState("");
  const [notes, setNotes] = useState("");

  const plansQuery = trpc.medication.listPlans.useQuery();
  const createPlan = trpc.medication.createPlan.useMutation({
    onSuccess: () => {
      setPrescriberName("");
      setNotes("");
      void utils.medication.listPlans.invalidate();
      Alert.alert("Acompanhamento criado", "Agora registre apenas aplicações realizadas conforme sua receita.");
    },
    onError: (error) => Alert.alert("Não foi possível salvar", error.message),
  });
  const recordApplication = trpc.medication.recordApplication.useMutation({
    onSuccess: () => {
      Alert.alert("Aplicação registrada", "O registro foi salvo para acompanhamento com seu profissional.");
    },
    onError: (error) => Alert.alert("Não foi possível registrar", error.message),
  });
  const recordEvent = trpc.medication.recordEvent.useMutation({
    onSuccess: () => Alert.alert("Efeito registrado", "Se os sintomas forem intensos ou persistentes, procure atendimento médico."),
    onError: (error) => Alert.alert("Não foi possível registrar", error.message),
  });

  const plans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);

  const handleCreate = () => {
    if (!prescriberName.trim()) {
      Alert.alert("Informe o profissional", "Registre o nome do profissional que acompanha o tratamento. O Fit_Evolve não prescreve medicamentos.");
      return;
    }

    createPlan.mutate({
      medicationName: selected.brand,
      activeIngredient: selected.activeIngredient,
      therapeuticClass: "agonista do receptor GLP-1",
      prescriberName: prescriberName.trim(),
      notes: notes.trim() || undefined,
      sourceUrl: selected.sourceUrl,
      consentToShare: false,
    });
  };

  const openSource = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
  };

  const renderPlan = ({ item }: { item: (typeof plans)[number] }) => (
    <View style={[styles.plan, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.planHeader}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
          <Ionicons name="medical" size={20} color={colors.background} />
        </View>
        <View style={styles.planTitle}>
          <Text style={[styles.planName, { color: colors.foreground }]}>{item.medicationName}</Text>
          <Text style={[styles.muted, { color: colors.muted }]}>{item.activeIngredient} · {item.status}</Text>
        </View>
      </View>
      <Text style={[styles.small, { color: colors.muted }]}>Acompanhante: {item.prescriberName || "não informado"}</Text>
      <View style={styles.rowActions}>
        <Pressable
          onPress={() => recordApplication.mutate({ planId: item.id })}
          style={({ pressed }) => [styles.actionButton, { backgroundColor: colors.primary, opacity: pressed ? 0.75 : 1 }]}
        >
          <Ionicons name="checkmark-circle" size={17} color={colors.background} />
          <Text style={[styles.actionText, { color: colors.background }]}>Registrar aplicação</Text>
        </Pressable>
        <View style={styles.eventRow}>
          {EVENT_OPTIONS.slice(0, 3).map((event) => (
            <Pressable
              key={event.value}
              accessibilityLabel={`Registrar ${event.label}`}
              onPress={() => recordEvent.mutate({ planId: item.id, eventType: event.value, severity: "moderate" })}
              style={({ pressed }) => [styles.eventButton, { borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}
            >
              <Text style={[styles.eventText, { color: colors.foreground }]}>{event.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <FlatList
        data={plans}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderPlan}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <View style={styles.topBar}>
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={22} color={colors.foreground} />
              </Pressable>
              <Text style={[styles.title, { color: colors.foreground }]}>Acompanhamento</Text>
              <View style={styles.backButton} />
            </View>

            <View style={[styles.warning, { backgroundColor: "#FFF7ED", borderColor: "#FDBA74" }]}>
              <Ionicons name="shield-checkmark" size={22} color="#C2410C" />
              <Text style={styles.warningText}>
                O Fit_Evolve registra informações para acompanhamento. Não prescreve, calcula dose nem substitui consulta médica.
              </Text>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Dados importantes no Brasil</Text>
            <Text style={[styles.body, { color: colors.muted }]}>A Anvisa informa que o Wegovy (semaglutida) é indicado, com dieta e exercício, para adultos com IMC inicial ≥30 kg/m² ou entre 27 e &lt;30 kg/m² com comorbidade relacionada ao peso, conforme bula.</Text>
            <Text style={[styles.body, { color: colors.muted }]}>Desde 23/06/2025, agonistas GLP-1 como Ozempic, Mounjaro e Wegovy exigem receita em duas vias, com retenção na farmácia e validade de até 90 dias.</Text>
            <Text style={[styles.body, { color: colors.muted }]}>Náusea, diarreia, vômitos e constipação aparecem entre os efeitos gastrointestinais mais comuns em estudos. Dor abdominal intensa e persistente, especialmente com náuseas ou vômitos, exige atendimento médico imediato.</Text>
            <Pressable onPress={() => openSource(selected.sourceUrl)} style={styles.sourceLink}>
              <Ionicons name="open-outline" size={16} color={colors.primary} />
              <Text style={[styles.sourceText, { color: colors.primary }]}>Ver fonte oficial selecionada</Text>
            </Pressable>

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Adicionar acompanhamento</Text>
            <Text style={[styles.body, { color: colors.muted }]}>Selecione o medicamento exatamente como aparece na receita. O princípio ativo é informativo e não altera a prescrição.</Text>
            <View style={styles.chipGrid}>
              {CATALOG.map((item) => (
                <Pressable
                  key={item.brand}
                  onPress={() => setSelected(item)}
                  style={({ pressed }) => [styles.chip, { borderColor: item.brand === selected.brand ? colors.primary : colors.border, backgroundColor: item.brand === selected.brand ? "#E0F2FE" : colors.surface, opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={[styles.chipText, { color: item.brand === selected.brand ? colors.primary : colors.foreground }]}>{item.brand}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              value={prescriberName}
              onChangeText={setPrescriberName}
              placeholder="Nome do profissional que acompanha"
              placeholderTextColor={colors.muted}
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]}
              returnKeyType="next"
            />
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Observações da prescrição (opcional)"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.multiline, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]}
              multiline
            />
            <Pressable
              onPress={handleCreate}
              disabled={createPlan.isPending}
              style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary, opacity: createPlan.isPending || pressed ? 0.7 : 1 }]}
            >
              <Ionicons name="add-circle" size={20} color={colors.background} />
              <Text style={[styles.primaryButtonText, { color: colors.background }]}>{createPlan.isPending ? "Salvando..." : "Salvar acompanhamento"}</Text>
            </Pressable>
            <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Acompanhamentos salvos</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.empty, { borderColor: colors.border }]}>
            <Ionicons name="clipboard-outline" size={32} color={colors.muted} />
            <Text style={[styles.body, { color: colors.muted, textAlign: "center" }]}>Nenhum acompanhamento registrado ainda.</Text>
          </View>
        }
        ListFooterComponent={
          <Text style={[styles.footer, { color: colors.muted }]}>Conteúdo educativo revisado em 21/08/2026. Regras e bulas podem mudar; confirme sempre com profissional habilitado e fonte oficial.</Text>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  topBar: { minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 21, fontWeight: "700" },
  warning: { marginTop: 10, padding: 14, borderWidth: 1, flexDirection: "row", gap: 10, alignItems: "flex-start" },
  warningText: { flex: 1, color: "#9A3412", fontSize: 13, lineHeight: 19 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 22, marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 21, marginBottom: 8 },
  sourceLink: { flexDirection: "row", alignItems: "center", gap: 6, paddingTop: 4, paddingBottom: 4 },
  sourceText: { fontSize: 14, fontWeight: "600" },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, marginBottom: 12 },
  chip: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 18 },
  chipText: { fontSize: 13, fontWeight: "600" },
  input: { minHeight: 48, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, fontSize: 15, borderRadius: 10 },
  multiline: { minHeight: 82, textAlignVertical: "top" },
  primaryButton: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 16, borderRadius: 10 },
  primaryButtonText: { fontSize: 15, fontWeight: "700" },
  plan: { borderWidth: 1, padding: 14, marginBottom: 12, borderRadius: 12 },
  planHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  iconCircle: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  planTitle: { flex: 1 },
  planName: { fontSize: 16, fontWeight: "700" },
  muted: { fontSize: 12 },
  small: { fontSize: 13, marginBottom: 12 },
  rowActions: { gap: 10 },
  actionButton: { minHeight: 42, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 7, paddingHorizontal: 12, borderRadius: 9 },
  actionText: { fontSize: 13, fontWeight: "700" },
  eventRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  eventButton: { borderWidth: 1, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 8 },
  eventText: { fontSize: 12 },
  empty: { borderWidth: 1, padding: 24, alignItems: "center", gap: 8, marginBottom: 12, borderRadius: 10 },
  footer: { fontSize: 12, lineHeight: 18, marginTop: 18, textAlign: "center" },
});
