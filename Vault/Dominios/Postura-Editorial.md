---
tags: [dominio, editorial, postura]
created: 2026-05-28
updated: 2026-05-28
status: ativo
dependencies: [[Sem-Veredito-Proprio]]
---

# Postura Editorial

> **Tecnicista neutro radical, sem rosto, sem veredito próprio.**

## O que significa

1. **Tecnicista** — privilegiamos dados primários, fontes verificáveis, timestamps. Não fazemos opinião jornalística.
2. **Neutro radical** — não escolhemos lados. Cobertura paritária entre candidatos no mesmo critério (ver [[Criterio-Selecao-Candidatos]]).
3. **Sem rosto** — não há perfil de curador em destaque. O projeto é a marca; o curador é apenas o mantenedor.
4. **Sem veredito próprio** — Atlas **NUNCA** emite juízo de "verdadeiro/falso". Agregamos vereditos externos quando existem (ver [[Cascata-de-Vereditos]]).

## O que NÃO somos

- Não somos um fact-checker. Somos um **agregador transparente** de declarações + vereditos externos.
- Não somos jornalismo opinativo. Não há editorial.
- Não somos plataforma de campanha. Tratamos todos os candidatos pelo mesmo critério mecânico.

## Operacionalização

- Voz nos textos do site: terceira pessoa, presente, sem adjetivos avaliativos
- Quando há divergência entre fontes: registrar todas, sem peso editorial
- Quando não há veredito: dizer explicitamente "sem veredito de fact-checker reconhecido até <data>"
- Erratas públicas em `/errata`, datadas, com diff visível em git (processo materializado na página, sem decisão dedicada em `Vault/Decisoes/`)

## Links

- Decisão fundadora: [[Decisoes/Sem-Veredito-Proprio]]
- Spec mestre (seção 8): `docs/superpowers/specs/2026-05-27-atlas-design.md`
- Página pública que materializa: `/metodologia` (`src/pages/metodologia.astro`)
