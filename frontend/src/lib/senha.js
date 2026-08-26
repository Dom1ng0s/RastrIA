import { z } from "zod";

/**
 * Regra de senha definida para contas provisionadas (ver issue "troca de senha
 * obrigatória no primeiro acesso"): mínimo 8 caracteres, 1 maiúscula, 1 número,
 * 1 símbolo. Reutilizado em qualquer tela que crie/troque senha.
 */
export const senhaForteSchema = z
  .string()
  .min(8, "Mínimo de 8 caracteres")
  .regex(/[A-Z]/, "Inclua pelo menos 1 letra maiúscula")
  .regex(/[0-9]/, "Inclua pelo menos 1 número")
  .regex(/[^A-Za-z0-9]/, "Inclua pelo menos 1 símbolo (ex: ! @ # $ %)");
