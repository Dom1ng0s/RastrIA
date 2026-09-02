import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, KeyRound, ToggleLeft, ToggleRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { DashboardLayout } from "../../components/DashboardLayout";
import { BaixarHistoricoMenu } from "../../components/BaixarHistoricoMenu";
import { FieldError } from "../../components/FieldError";
import { LogAcessoProntuario } from "../../components/LogAcessoProntuario";
import { useAcessibilidadeStore } from "../../features/acessibilidade/store";
import { useAuthStore } from "../../features/auth/store";
import { navItemsDoPapel, PAPEL_PADRAO } from "../../features/auth/navPorPapel";
import { useConsentimentoStore } from "../../features/consentimento/store";
import { useRankingPrefsStore } from "../../features/ranking/store";
import { useToast } from "../../features/ui/ToastProvider";
import { calcularIdade, formatarDataNascimento } from "../../lib/dataNascimento";
import {
  contatoEmergenciaNomeSchema,
  contatoEmergenciaTelefoneSchema,
  TIPOS_SANGUINEOS,
  tipoSanguineoSchema,
  validarContatoEmergencia,
} from "../../lib/dadosComplementares";
import { fieldErrorProps } from "../../lib/fieldA11y";
import {
  ALTURA_CM_MAX,
  ALTURA_CM_MIN,
  medidasCorporaisSchema,
  PESO_KG_MAX,
  PESO_KG_MIN,
} from "../../lib/medidasCorporais";

// Configurações (issue #88) — antes era o "Perfil", uma página única e longa com
// tudo empilhado. Agora é uma tela com seções navegáveis por abas:
//   Editar perfil · Meus dados · Ranking · Notificações · Acessibilidade
// O menu lateral chama esta rota de "Configurações" (ver DashboardLayout.jsx).
//
// A seção ativa é espelhada em `?secao=` para permitir link direto (ex.: uma
// futura chamada "abrir acessibilidade"). A troca de senha saiu daqui para tela
// própria (`/perfil/alterar-senha`, pages/AlterarSenha).
//
// O menu lateral e as seções de dado individual (medidas corporais, opt-out do
// ranking, baixar histórico) são derivados do papel logado — Configurações é a
// única tela alcançável por todos os papéis, sem guarda de papel na rota.

// Peso/altura validam faixa e unidade via `medidasCorporaisSchema`
// (lib/medidasCorporais.js), compartilhado com o Onboarding. Tipo sanguíneo e
// contato de emergência (issue #29) são dado complementar preenchido aqui, não
// no Onboarding — ver lib/dadosComplementares.js.
const perfilSchema = z
  .object({
    ...medidasCorporaisSchema.shape,
    tipoSanguineo: tipoSanguineoSchema,
    contatoEmergenciaNome: contatoEmergenciaNomeSchema,
    contatoEmergenciaTelefone: contatoEmergenciaTelefoneSchema,
  })
  .superRefine(validarContatoEmergencia);

// A idade deriva da data de nascimento (fonte da verdade: planilha de
// integrantes da instituição), nunca de um número digitado à mão.

// TODO: substituir por dado real via TanStack Query (GET /api/usuarios/me) quando
// o endpoint existir. `dataNascimento` vem da planilha de integrantes importada
// pela instituição (ver "Dados pessoais complementares" em agents/claude.md) —
// não é preenchida pelo usuário, por isso não aparece no formulário abaixo.
// `tipoSanguineo`/`contatoEmergencia*` também vêm de `GET /api/usuarios/me`
// quando existir (issue #29); PATCH usa os mesmos nomes de campo do form.
const dadosMock = {
  email: "usuario@rastria.app",
  dataNascimento: "1996-03-15",
  pesoKg: 70,
  alturaCm: 170,
  tipoSanguineo: "",
  contatoEmergenciaNome: "",
  contatoEmergenciaTelefone: "",
};

function ToggleLinha({ rotulo, descricao, ativo, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={ativo}
      className="flex w-full items-center justify-between gap-4 rounded-lg border border-line px-4 py-3 text-left text-sm font-medium hover:bg-bg-tint"
    >
      <span>
        {rotulo}
        {descricao && <span className="mt-0.5 block text-xs font-normal text-text-muted">{descricao}</span>}
      </span>
      {ativo ? (
        <ToggleRight size={28} className="shrink-0 text-seafoam" />
      ) : (
        <ToggleLeft size={28} className="shrink-0 text-text-muted" />
      )}
    </button>
  );
}

function SecaoEditarPerfil({ ehUsuarioIndividual }) {
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(perfilSchema), defaultValues: dadosMock });

  const onSubmit = async (dados) => {
    // TODO: substituir por mutation do TanStack Query (PATCH /api/usuarios/me).
    showToast("Alterações salvas");
    reset(dados); // zera o isDirty: os valores salvos viram o novo baseline.
  };

  return (
    <div className="max-w-[400px] rounded-2xl border border-line bg-white p-7">
      <label className="mb-1.5 block text-xs font-medium text-text-dark">E-mail</label>
      <p className="mb-5 text-sm text-text-muted">{dadosMock.email}</p>

      {ehUsuarioIndividual && (
        <>
          <label className="mb-1.5 block text-xs font-medium text-text-dark">Data de nascimento</label>
          <p className="mb-5 text-sm text-text-muted">
            {formatarDataNascimento(dadosMock.dataNascimento)} · {calcularIdade(dadosMock.dataNascimento)} anos
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="pesoKg">
              Peso (kg)
            </label>
            <input
              id="pesoKg"
              type="number"
              step="0.1"
              min={PESO_KG_MIN}
              max={PESO_KG_MAX}
              className="mb-1 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
              {...register("pesoKg")}
              {...fieldErrorProps(errors.pesoKg, "pesoKg")}
            />
            <FieldError id="pesoKg-erro" className="mb-3">
              {errors.pesoKg?.message}
            </FieldError>

            <label className="mb-1.5 mt-3 block text-xs font-medium text-text-dark" htmlFor="alturaCm">
              Altura (cm)
            </label>
            <input
              id="alturaCm"
              type="number"
              min={ALTURA_CM_MIN}
              max={ALTURA_CM_MAX}
              className="mb-1 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
              {...register("alturaCm")}
              aria-invalid={errors.alturaCm ? true : undefined}
              aria-describedby={`alturaCm-dica${errors.alturaCm ? " alturaCm-erro" : ""}`}
            />
            <p id="alturaCm-dica" className="mb-1 text-xs text-text-muted">
              Em centímetros, não em metros (ex: 170).
            </p>
            <FieldError id="alturaCm-erro" className="mb-4">
              {errors.alturaCm?.message}
            </FieldError>

            <label className="mb-1.5 mt-3 block text-xs font-medium text-text-dark" htmlFor="tipoSanguineo">
              Tipo sanguíneo
            </label>
            <select
              id="tipoSanguineo"
              className="mb-1 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
              {...register("tipoSanguineo")}
              {...fieldErrorProps(errors.tipoSanguineo, "tipoSanguineo")}
            >
              <option value="">Não informado</option>
              {TIPOS_SANGUINEOS.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
            <FieldError id="tipoSanguineo-erro" className="mb-3">
              {errors.tipoSanguineo?.message}
            </FieldError>

            <p className="mb-1.5 mt-4 text-xs font-medium text-text-dark">Contato de emergência</p>
            <p className="mb-2 text-xs text-text-muted">
              Preenchimento opcional — usado só em caso de emergência, não aparece para outros papéis.
            </p>

            <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="contatoEmergenciaNome">
              Nome
            </label>
            <input
              id="contatoEmergenciaNome"
              type="text"
              placeholder="Nome completo"
              className="mb-1 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
              {...register("contatoEmergenciaNome")}
              {...fieldErrorProps(errors.contatoEmergenciaNome, "contatoEmergenciaNome")}
            />
            <FieldError id="contatoEmergenciaNome-erro" className="mb-3">
              {errors.contatoEmergenciaNome?.message}
            </FieldError>

            <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="contatoEmergenciaTelefone">
              Telefone
            </label>
            <input
              id="contatoEmergenciaTelefone"
              type="tel"
              placeholder="(82) 99999-9999"
              className="mb-1 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
              {...register("contatoEmergenciaTelefone")}
              {...fieldErrorProps(errors.contatoEmergenciaTelefone, "contatoEmergenciaTelefone")}
            />
            <FieldError id="contatoEmergenciaTelefone-erro" className="mb-4">
              {errors.contatoEmergenciaTelefone?.message}
            </FieldError>

            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="btn-primary mt-3 w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-40"
            >
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
            </button>
          </form>
        </>
      )}

      <Link
        to="/perfil/alterar-senha"
        className="btn-outline mt-6 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold"
      >
        <KeyRound size={16} /> Alterar senha
      </Link>
    </div>
  );
}

function SecaoMeusDados({ ehUsuarioIndividual }) {
  const consentimento = useConsentimentoStore((state) => state.consentimento);

  return (
    <div className="space-y-6">
      {ehUsuarioIndividual && (
        <div className="max-w-[520px] rounded-2xl border border-line bg-white p-7">
          <h2 className="mb-1 text-sm font-semibold text-text-dark">Baixar histórico</h2>
          <p className="mb-4 text-xs text-text-muted">
            Seu histórico é seu. Baixe uma cópia completa dos seus exames, índices e do seu último TAF em
            CSV ou PDF a qualquer momento — direito de portabilidade da LGPD.
          </p>
          <BaixarHistoricoMenu />
        </div>
      )}

      {ehUsuarioIndividual && <LogAcessoProntuario />}

      <div className="max-w-[520px] rounded-2xl border border-line bg-white p-7">
        <h2 className="mb-1 text-sm font-semibold text-text-dark">Consentimento LGPD</h2>
        <p className="mb-4 text-xs text-text-muted">
          {consentimento
            ? "Termo aceito no primeiro acesso. O aceite não pode ser revogado, mas você pode consultar o conteúdo do termo a qualquer momento."
            : "Nenhum registro de aceite encontrado nesta conta."}
        </p>
        <Link
          to="/perfil/termo-consentimento"
          className="btn-outline block w-full max-w-[280px] rounded-lg py-2.5 text-center text-sm font-semibold"
        >
          Consultar termo aceito
        </Link>
      </div>
    </div>
  );
}

function SecaoRanking() {
  const optedOut = useRankingPrefsStore((state) => state.optedOut);
  const toggleOptOut = useRankingPrefsStore((state) => state.toggleOptOut);

  return (
    <div className="max-w-[520px] rounded-2xl border border-line bg-white p-7">
      <h2 className="mb-1 text-sm font-semibold text-text-dark">Ranking de desempenho físico</h2>
      <p className="mb-4 text-xs text-text-muted">
        O ranking mostra seu nome, restrito a integrantes da sua instituição. Você pode optar por não
        aparecer nele a qualquer momento.
      </p>
      <ToggleLinha rotulo="Aparecer no ranking" ativo={!optedOut} onToggle={toggleOptOut} />
    </div>
  );
}

function SecaoNotificacoes() {
  return (
    <div className="max-w-[520px] rounded-2xl border border-line bg-white p-7">
      <div className="mb-3 flex items-center gap-2 text-text-muted">
        <Bell size={18} />
        <h2 className="text-sm font-semibold text-text-dark">Notificações</h2>
      </div>
      <p className="text-xs text-text-muted">
        Em breve: preferências de notificações in-app (avisos de exame pendente, confirmação de
        acompanhamento, novidades do sistema). Ainda não há nada para configurar aqui.
      </p>
    </div>
  );
}

function SecaoAcessibilidade() {
  const fonteGrande = useAcessibilidadeStore((state) => state.fonteGrande);
  const modoSimplificado = useAcessibilidadeStore((state) => state.modoSimplificado);
  const toggleFonteGrande = useAcessibilidadeStore((state) => state.toggleFonteGrande);
  const toggleModoSimplificado = useAcessibilidadeStore((state) => state.toggleModoSimplificado);

  return (
    <div className="max-w-[520px] space-y-3 rounded-2xl border border-line bg-white p-7">
      <h2 className="text-sm font-semibold text-text-dark">Exibição</h2>
      <p className="mb-2 text-xs text-text-muted">
        Ajustes de exibição para deixar o sistema mais confortável de usar. As preferências ficam
        salvas neste navegador.
      </p>
      <ToggleLinha
        rotulo="Fonte grande"
        descricao="Aumenta o tamanho do texto em todo o sistema."
        ativo={fonteGrande}
        onToggle={toggleFonteGrande}
      />
      <ToggleLinha
        rotulo="Modo simplificado"
        descricao="Esconde elementos decorativos e reforça o contraste do texto."
        ativo={modoSimplificado}
        onToggle={toggleModoSimplificado}
      />
    </div>
  );
}

export default function Perfil() {
  const papel = useAuthStore((state) => state.usuario?.papel) ?? PAPEL_PADRAO;
  const navItems = navItemsDoPapel(papel);
  // Medidas corporais, ranking de desempenho físico e baixar histórico só
  // existem para o usuário individual; para médico/educador físico/comando as
  // Configurações são e-mail, senha, consentimento, notificações e acessibilidade.
  const ehUsuarioIndividual = papel === "usuario";

  const secoes = [
    { id: "editar", rotulo: "Editar perfil", render: () => <SecaoEditarPerfil ehUsuarioIndividual={ehUsuarioIndividual} /> },
    { id: "dados", rotulo: "Meus dados", render: () => <SecaoMeusDados ehUsuarioIndividual={ehUsuarioIndividual} /> },
    ...(ehUsuarioIndividual
      ? [{ id: "ranking", rotulo: "Ranking", render: () => <SecaoRanking /> }]
      : []),
    { id: "notificacoes", rotulo: "Notificações", render: () => <SecaoNotificacoes /> },
    { id: "acessibilidade", rotulo: "Acessibilidade", render: () => <SecaoAcessibilidade /> },
  ];

  const [searchParams, setSearchParams] = useSearchParams();
  const secaoParam = searchParams.get("secao");
  const secaoAtiva = secoes.some((s) => s.id === secaoParam) ? secaoParam : secoes[0].id;

  const irPara = (id) => {
    setSearchParams(id === secoes[0].id ? {} : { secao: id }, { replace: true });
  };

  return (
    <DashboardLayout title="Configurações" navItems={navItems}>
      <nav
        aria-label="Seções de configurações"
        className="mb-6 flex flex-wrap gap-1 border-b border-line"
      >
        {secoes.map((secao) => (
          <button
            key={secao.id}
            type="button"
            onClick={() => irPara(secao.id)}
            aria-current={secao.id === secaoAtiva ? "page" : undefined}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              secao.id === secaoAtiva
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text-dark"
            }`}
          >
            {secao.rotulo}
          </button>
        ))}
      </nav>

      {secoes.find((s) => s.id === secaoAtiva).render()}
    </DashboardLayout>
  );
}
