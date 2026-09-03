import { useMutation, useQuery } from "@tanstack/react-query";

/**
 * Ponte temporária entre as telas e o TanStack Query enquanto não há backend
 * (issue #119).
 *
 * Cada hook de `features/<área>/queries.js` resolve um mock local, mas passando
 * pelo ciclo real do `useQuery` — então as telas já recebem hoje o mesmo
 * formato (`{ data, isLoading, isError, error, refetch }`) que vão receber
 * quando a `queryFn` virar `api.get(...)`. A troca fica isolada no `queries.js`;
 * a tela não muda.
 *
 * `delayMs` simula latência de rede para validar skeleton/erro (issue #120) e
 * `falhar` força o estado de erro. Os dois só existem no mock e somem junto com
 * ele quando o endpoint real entrar.
 */
export function useMockQuery({ queryKey, dados, delayMs = 0, falhar = false }) {
  return useQuery({
    queryKey,
    queryFn: () =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (falhar) {
            reject(new Error("Não foi possível carregar os dados (falha simulada)."));
            return;
          }
          resolve(typeof dados === "function" ? dados() : dados);
        }, delayMs);
      }),
    // Mock não tem por que re-tentar; e um `falhar: true` deve ir direto para o
    // estado de erro em vez de bater 3x no timeout antes de desistir.
    retry: false,
    // Dado mockado é estático — não faz sentido revalidar e re-exibir o
    // skeleton a cada navegação. Quando a `queryFn` virar `api.get(...)`,
    // reavaliar este `staleTime` conforme a volatilidade real do recurso.
    staleTime: Infinity,
  });
}

/**
 * Equivalente para mutations (issue #119). `mutationFn` recebe as variáveis e
 * devolve o que a tela precisa de volta; por padrão ecoa as variáveis após um
 * pequeno atraso. Quando o endpoint existir, troca-se por
 * `useMutation({ mutationFn: (v) => api.post(<endpoint>, v) })`.
 */
export function useMockMutation(mutationFn) {
  return useMutation({
    mutationFn:
      mutationFn ??
      ((variaveis) => new Promise((resolve) => setTimeout(() => resolve(variaveis), 400))),
  });
}
