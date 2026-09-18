#!/usr/bin/env python3
"""
Confere se as copias do mapa mestre (CLAUDE.md) e das cadeiras transversais
(gabinete / guarda) estao identicas em todos os repositorios do Moviki.

Regra que este script automatiza (CLAUDE.md, topo e secao 15):
  - CLAUDE.md: 6 copias identicas (5 repos de codigo + moviki-vault)
  - .claude/skills/gabinete/SKILL.md e guarda/SKILL.md: 5 copias identicas
    (so nos repos de codigo; o vault nao e codigo e nao tem skills)

Saida:
  - exit 0  -> tudo batendo
  - exit 1  -> divergencia encontrada (relatorio em markdown no stdout)
  - exit 2  -> erro ao consultar o GitHub (nao trata como divergencia)

Usa o gh CLI, que ja vem no runner do GitHub Actions e usa o GITHUB_TOKEN.
"""

import base64
import hashlib
import json
import subprocess
import sys

DONO = "eikosistemas-pj"

REPOS_CODIGO = [
    "moviki",
    "moviki-robo",
    "moviki-app",
    "moviki-ai",
    "moviki-assistente-social",
]

# O vault entra so na conferencia do mapa: nao e repositorio de codigo.
REPOS_MAPA = REPOS_CODIGO + ["moviki-vault"]

ARQUIVOS = [
    ("CLAUDE.md", REPOS_MAPA, "mapa mestre"),
    (".claude/skills/gabinete/SKILL.md", REPOS_CODIGO, "cadeira Gabinete"),
    (".claude/skills/guarda/SKILL.md", REPOS_CODIGO, "cadeira Guarda"),
]


class ErroGitHub(Exception):
    pass


def buscar(repo: str, caminho: str):
    """Devolve (hash_curto, bytes) ou (None, None) se o arquivo nao existir."""
    proc = subprocess.run(
        ["gh", "api", f"repos/{DONO}/{repo}/contents/{caminho}"],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        erro = (proc.stderr or "").strip()
        if "404" in erro or "Not Found" in erro:
            return None, None
        raise ErroGitHub(f"{repo}/{caminho}: {erro[:200]}")

    try:
        dados = json.loads(proc.stdout)
        bruto = base64.b64decode(dados["content"])
    except Exception as exc:  # noqa: BLE001
        raise ErroGitHub(f"{repo}/{caminho}: resposta invalida ({exc})") from exc

    return hashlib.sha256(bruto).hexdigest()[:12], bruto


def conferir():
    problemas = []
    linhas = []

    for caminho, repos, rotulo in ARQUIVOS:
        achados = {}
        ausentes = []

        for repo in repos:
            digest, bruto = buscar(repo, caminho)
            if digest is None:
                ausentes.append(repo)
            else:
                achados[repo] = (digest, len(bruto))

        linhas.append(f"### {rotulo} — `{caminho}`")
        linhas.append("")

        if ausentes:
            problemas.append(f"{rotulo}: ausente em {', '.join(ausentes)}")
            for repo in ausentes:
                linhas.append(f"- `{repo}` — **AUSENTE**")

        # Maioria manda: a versao mais repetida e tratada como a correta.
        contagem = {}
        for digest, _ in achados.values():
            contagem[digest] = contagem.get(digest, 0) + 1
        referencia = max(contagem, key=lambda d: contagem[d]) if contagem else None

        for repo in repos:
            if repo in achados:
                digest, tamanho = achados[repo]
                marca = "ok" if digest == referencia else "**DIVERGENTE**"
                linhas.append(f"- `{repo}` — `{digest}` · {tamanho} bytes · {marca}")

        divergentes = [r for r, (d, _) in achados.items() if d != referencia]
        if divergentes:
            problemas.append(f"{rotulo}: divergente em {', '.join(divergentes)}")

        linhas.append("")

    return problemas, linhas


def main():
    try:
        problemas, linhas = conferir()
    except ErroGitHub as exc:
        print(f"ERRO ao consultar o GitHub: {exc}", file=sys.stderr)
        return 2

    if not problemas:
        print("Todas as copias do mapa e das cadeiras transversais estao identicas.")
        print()
        print("\n".join(linhas))
        return 0

    print("## As copias do mapa sairam de sincronia")
    print()
    print("A regra no topo do `CLAUDE.md` exige que as copias sejam identicas.")
    print("Hoje nao estao:")
    print()
    for p in problemas:
        print(f"- {p}")
    print()
    print("Para corrigir: copie a versao boa (a que aparece na maioria dos")
    print("repositorios) por cima da divergente, no mesmo ciclo, e nao 'depois'.")
    print()
    print("<!-- conferidor-mapa -->")
    print()
    print("\n".join(linhas))
    return 1


if __name__ == "__main__":
    sys.exit(main())
