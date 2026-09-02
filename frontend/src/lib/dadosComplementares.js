import { z } from "zod";

/**
 * Tipo sanguíneo e contato de emergência (issue #29) — decisão de 25/08/2026
 * registrada em agents/claude.md: são dado complementar preenchido pelo
 * próprio usuário (não vêm da planilha da instituição), e vivem em
 * Perfil → Editar perfil (não no Onboarding, que fica restrito ao mínimo
 * necessário para a verificação automática no primeiro login).
 *
 * Tipo sanguíneo é sempre um select fechado (nunca texto livre) — evita
 * variação de digitação ("O+", "o positivo", "OPOS") virar dado inconsistente
 * num campo que pode ser lido em uma emergência real.
 */
export const TIPOS_SANGUINEOS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const tipoSanguineoSchema = z.union([z.enum(TIPOS_SANGUINEOS), z.literal("")]).optional();

// Telefone brasileiro com DDD, com ou sem o 9º dígito, aceitando pontuação
// comum de digitação (parênteses, hífen, espaço) — mesmo padrão frouxo já
// usado no restante do app para não travar quem digita "(82) 99999-9999"
// ou "82999999999".
const TELEFONE_REGEX = /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/;

export const contatoEmergenciaNomeSchema = z
  .string()
  .trim()
  .max(120, "Nome muito longo")
  .optional()
  .or(z.literal(""));

export const contatoEmergenciaTelefoneSchema = z
  .string()
  .trim()
  .refine((valor) => valor === "" || TELEFONE_REGEX.test(valor), "Telefone inválido (ex: (82) 99999-9999)")
  .optional()
  .or(z.literal(""));

// Aplicado via `.superRefine` por quem compuser o schema final (ex: Perfil.jsx,
// que junta isto a medidasCorporaisSchema) — não dá pra fazer `.refine()` aqui
// e depois espalhar `.shape` no schema composto (ZodEffects perde `.shape`).
export function validarContatoEmergencia(dados, ctx) {
  if (dados.contatoEmergenciaTelefone && !dados.contatoEmergenciaNome) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Informe o nome do contato de emergência",
      path: ["contatoEmergenciaNome"],
    });
  }
}
