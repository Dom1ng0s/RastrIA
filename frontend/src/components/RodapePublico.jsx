import { Link } from "react-router-dom";

/**
 * Rodapé das páginas públicas (termos, política, acessibilidade) — issue #150.
 * O eMAG pede que a página de acessibilidade seja alcançável de qualquer lugar
 * do sítio, então ela anda junto das legais, nunca sozinha.
 */
export function RodapePublico({ atual }) {
  const links = [
    { to: "/termos-de-uso", rotulo: "Termos de Uso" },
    { to: "/politica-de-privacidade", rotulo: "Política de Privacidade" },
    { to: "/acessibilidade", rotulo: "Acessibilidade" },
  ];

  return (
    <footer className="border-t border-line px-6 py-8">
      <nav aria-label="Páginas institucionais" className="mx-auto flex max-w-[720px] flex-wrap gap-x-6 gap-y-2 text-sm">
        {links.map((link) =>
          link.to === atual ? (
            <span key={link.to} aria-current="page" className="font-semibold text-primary">
              {link.rotulo}
            </span>
          ) : (
            <Link key={link.to} to={link.to} className="text-text-muted underline hover:text-primary">
              {link.rotulo}
            </Link>
          ),
        )}
      </nav>
    </footer>
  );
}
