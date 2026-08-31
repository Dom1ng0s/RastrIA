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

/**
 * Mesmos requisitos do `senhaForteSchema` acima, em forma de lista para o
 * indicador de força em tempo real (componente `ForcaSenha`, issue #96). Se a
 * regra mudar, os dois precisam ser atualizados juntos.
 */
export const CRITERIOS_SENHA = [
  { id: "tamanho", label: "Mínimo de 8 caracteres", testar: (senha) => senha.length >= 8 },
  { id: "maiuscula", label: "1 letra maiúscula", testar: (senha) => /[A-Z]/.test(senha) },
  { id: "numero", label: "1 número", testar: (senha) => /[0-9]/.test(senha) },
  { id: "simbolo", label: "1 símbolo (ex: ! @ # $ %)", testar: (senha) => /[^A-Za-z0-9]/.test(senha) },
];

/**
 * Avalia uma senha contra os `CRITERIOS_SENHA`, para o feedback visual enquanto
 * o usuário digita. Não substitui a validação de envio (`senhaForteSchema`).
 */
export function avaliarSenha(senha = "") {
  const criterios = CRITERIOS_SENHA.map((criterio) => ({
    id: criterio.id,
    label: criterio.label,
    ok: criterio.testar(senha),
  }));
  const cumpridos = criterios.filter((criterio) => criterio.ok).length;
  return { criterios, cumpridos, total: CRITERIOS_SENHA.length, forte: cumpridos === CRITERIOS_SENHA.length };
}
