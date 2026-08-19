import { Link } from "react-router-dom";

import { Logo } from "../../components/Logo";

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4">
        <Logo />
        <nav className="hidden items-center text-sm font-medium text-text-dark md:flex">
          <a href="#como-funciona" className="mr-8 hover:opacity-70">
            Como funciona
          </a>
          <a href="#instituicoes" className="mr-8 hover:opacity-70">
            Para instituições
          </a>
          <a href="#contato" className="hover:opacity-70">
            Contato
          </a>
        </nav>
        <div className="flex items-center">
          <Link to="/login" className="mr-4 hidden text-sm font-medium text-text-dark sm:block">
            Entrar
          </Link>
          <a href="#comecar" className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold">
            Criar conta
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto grid max-w-[1180px] items-center gap-12 overflow-hidden px-6 pb-20 pt-16 md:grid-cols-2 md:pt-24">
      <svg
        className="pointer-events-none absolute -z-10 opacity-[0.07]"
        width="500"
        height="500"
        viewBox="0 0 500 500"
        style={{ left: "-160px", top: "-40px" }}
      >
        <path
          d="M 0 250 C 60 250 80 150 130 150 C 170 150 180 350 220 350 C 250 350 260 100 300 100 C 340 100 350 300 500 250"
          fill="none"
          stroke="#0C4A44"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div>
        <span className="mb-5 inline-block rounded-full bg-bg-tint px-3 py-1.5 text-xs font-semibold text-primary">
          Aprovado na Fase 1 do Programa Centelha 3 · Alagoas
        </span>
        <h1 className="mb-5 text-4xl font-semibold leading-[1.15] text-primary md:text-5xl">
          Centralize, verifique
          <br />e conecte-se.
        </h1>
        <p className="mb-8 max-w-[440px] text-base text-text-muted md:text-lg">
          A Rastria reúne seu histórico de saúde e desempenho físico, verifica seus índices
          automaticamente e te conecta a profissionais qualificados — tudo em um só lugar.
        </p>
        <div className="flex flex-wrap gap-3">
          <a href="#comecar" className="btn-primary rounded-lg px-6 py-3 text-sm font-semibold">
            Começar agora
          </a>
          <a href="#instituicoes" className="btn-outline rounded-lg px-6 py-3 text-sm font-semibold">
            Sou uma instituição
          </a>
        </div>
      </div>

      <div className="relative hidden h-[300px] md:block">
        <div
          className="absolute left-6 top-2 w-[290px] rounded-xl border border-line bg-white p-4 shadow-lg"
          style={{ transform: "rotate(-3deg)" }}
        >
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium">Pressão arterial</span>
            <span className="badge-normal rounded-full px-2 py-0.5 text-[11px] font-semibold">Normal</span>
          </div>
          <span className="text-xs text-text-muted">10 ago 2026 · 12/8</span>
        </div>
        <div
          className="absolute left-16 top-[150px] w-[290px] rounded-xl border border-line bg-white p-4 shadow-xl"
          style={{ transform: "rotate(2deg)" }}
        >
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium">Glicemia em jejum</span>
            <span className="badge-atencao rounded-full px-2 py-0.5 text-[11px] font-semibold">Atenção</span>
          </div>
          <span className="text-xs text-text-muted">14 ago 2026 · 112 mg/dL</span>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  return (
    <section className="border-y border-line bg-bg-tint">
      <div className="mx-auto flex max-w-[1180px] flex-wrap justify-center px-6 py-6 text-sm font-medium text-text-dark">
        <span className="mx-6 my-1">🔒 Dado sensível protegido (LGPD)</span>
        <span className="mx-6 my-1">✓ Profissionais com CRM/CREF verificado</span>
        <span className="mx-6 my-1">🏛️ Modelo alinhado à NR-7/PCMSO</span>
      </div>
    </section>
  );
}

function ComoFunciona() {
  const passos = [
    { numero: 1, cor: "bg-seafoam", titulo: "Cadastre", texto: "Exames laboratoriais, avaliações cardiológicas, bioimpedância e desempenho físico." },
    { numero: 2, cor: "bg-primary", titulo: "Verifique", texto: "Seus índices são comparados automaticamente com parâmetros de referência clínica." },
    { numero: 3, cor: "bg-coral", titulo: "Conecte-se", texto: "Acesse médicos e educadores físicos de uma rede pré-qualificada, com continuidade." },
  ];

  return (
    <section id="como-funciona" className="mx-auto max-w-[1180px] px-6 py-24">
      <div className="mx-auto mb-14 max-w-[560px] text-center">
        <span className="text-xs font-semibold text-seafoam">COMO FUNCIONA</span>
        <h2 className="mt-2 text-3xl font-semibold text-primary">Três passos, um único histórico</h2>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {passos.map((passo) => (
          <div key={passo.numero} className="text-center">
            <div
              className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white ${passo.cor}`}
            >
              {passo.numero}
            </div>
            <h3 className="mb-2 text-lg font-semibold">{passo.titulo}</h3>
            <p className="text-sm text-text-muted">{passo.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Institucional() {
  return (
    <section id="instituicoes" className="mx-auto grid max-w-[1180px] items-center gap-14 px-6 py-24 md:grid-cols-2">
      <div>
        <span className="text-xs font-semibold text-seafoam">PARA INSTITUIÇÕES</span>
        <h2 className="mb-5 mt-2 text-3xl font-semibold text-primary">
          Gestão de saúde ocupacional, sem expor dado individual a quem não deveria vê-lo
        </h2>
        <p className="mb-6 text-base text-text-muted">
          Empresas, academias e corporações já são obrigadas a acompanhar a saúde de seus
          integrantes. A Rastria digitaliza esse processo com acesso segmentado por papel.
        </p>
        <ul className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="text-seafoam">●</span>
            <span>
              <strong>Comando/gestor</strong> vê apenas indicadores agregados — nunca dado clínico individual.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary">●</span>
            <span>
              <strong>Médico responsável</strong> acessa o dado individual completo, como já faz hoje.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-coral">●</span>
            <span>
              <strong>Integrante</strong> mantém controle sobre seu próprio histórico.
            </span>
          </li>
        </ul>
        <a href="#contato" className="btn-primary mt-8 inline-block rounded-lg px-6 py-3 text-sm font-semibold">
          Falar com o time
        </a>
      </div>

      <div className="rounded-2xl bg-primary p-6">
        <div className="mb-4 rounded-xl bg-white/10 p-5">
          <span className="text-xs font-medium text-white/70">Painel do comando</span>
          <div className="mt-1 text-3xl font-semibold text-white">
            92% <span className="font-body text-base font-normal text-white/70">do efetivo em dia</span>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-white p-4">
          <span className="text-sm font-medium">Sargento A.</span>
          <span className="badge-normal rounded-full px-2 py-0.5 text-[11px] font-semibold">Exame em dia</span>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-xl bg-white p-4">
          <span className="text-sm font-medium">Soldado B.</span>
          <span className="badge-atencao rounded-full px-2 py-0.5 text-[11px] font-semibold">Pendente</span>
        </div>
      </div>
    </section>
  );
}

function CtaFinal() {
  return (
    <section id="comecar" className="mx-auto max-w-[1180px] px-6 pb-24">
      <div className="rounded-2xl bg-bg-tint p-10 text-center md:p-14">
        <h2 className="mb-3 text-3xl font-semibold text-primary">Pronto para começar?</h2>
        <p className="mx-auto mb-8 max-w-[440px] text-base text-text-muted">
          Escolha o caminho que faz sentido pra você.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {/* TODO: vira rota /cadastro quando essa tela existir */}
          <a href="#" className="btn-primary rounded-lg px-7 py-3.5 text-sm font-semibold">
            Sou uma pessoa
          </a>
          <a href="#contato" className="btn-outline rounded-lg px-7 py-3.5 text-sm font-semibold">
            Represento uma instituição
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="contato" className="bg-primary">
      <div className="mx-auto grid max-w-[1180px] gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <Logo reverse className="mb-3" />
          <p className="max-w-[240px] text-sm text-[#CFEAE3]">
            O rastro dos seus dados, o caminho até o cuidado certo.
          </p>
        </div>
        <div>
          <span className="mb-3 block text-xs font-semibold text-[#9FCFC4]">PRODUTO</span>
          <div className="space-y-2 text-sm text-[#CFEAE3]">
            <a href="#como-funciona" className="block hover:text-white">
              Como funciona
            </a>
            <a href="#instituicoes" className="block hover:text-white">
              Para instituições
            </a>
            <a href="https://rastria.up.railway.app" className="block hover:text-white">
              rastria.up.railway.app
            </a>
          </div>
        </div>
        <div>
          <span className="mb-3 block text-xs font-semibold text-[#9FCFC4]">CONTATO</span>
          <p className="text-sm text-[#CFEAE3]">Maceió, Alagoas</p>
          <p className="mt-1 text-sm text-[#CFEAE3]">Programa Centelha 3 — Alagoas</p>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="relative">
      <Header />
      <Hero />
      <TrustStrip />
      <ComoFunciona />
      <Institucional />
      <CtaFinal />
      <Footer />
    </div>
  );
}
