# Rework da home da IZMED

Nova versão da página inicial de `izmed.com.br`.

## Como ver no computador

Precisa só do Node 18 ou mais novo. Na pasta do projeto:

```bash
node tools/serve.mjs site 4321
```

Depois abra `http://localhost:4321`.

O servidor da prévia manda a mesma política de segurança (CSP) que o servidor da IZMED. Se algo for bloqueado em produção, aparece bloqueado aqui também.

Na prévia local, o envio do formulário e os eventos de rastreamento dão erro 404, porque a API (`/api/public/...`) só existe no servidor da IZMED. O resto funciona: demonstração, validação do formulário, menu, seletor de tema e animações.

## Como publicar

Copie para a raiz do servidor da IZMED:

| Arquivo | O que fazer |
|---|---|
| `site/index.html` | Substitui o HTML servido em `/` e em `/site` |
| `site/home.css` | Arquivo novo |
| `site/home.js` | Arquivo novo |
| `site/home-demo.js` | Arquivo novo (cópia de `site-demo.js` com dois textos ajustados) |
| `site/theme-init.js` | Arquivo novo (aplica o tema escolhido antes da página aparecer) |
| `site/site-assets/` | Pasta nova, com as fontes, as licenças delas e as fotos |

Não substitua `site.css`, `site.js`, `site-demo.js`, `proof.js` nem `specialties.js`. As páginas de guias, ferramentas e privacidade ainda usam esses arquivos. `proof.js`, `specialties.js` e `favicon.svg` desta pasta são cópias idênticas às de produção, só para a prévia funcionar.

## Fotos

As quatro fotos estão em `site/site-assets/img/`, em WebP, cada uma em 3 a 5 tamanhos. O navegador baixa só o tamanho certo para a tela. Elas precisam ficar no próprio domínio: a política de segurança do servidor bloqueia imagens de outros sites. Quando houver fotos reais do consultório e da equipe, basta trocar esses arquivos mantendo os nomes e as proporções.

| Onde aparece | Foto original | Autor |
|---|---|---|
| Topo | https://unsplash.com/photos/egCFrNJ6Djw | Vitaly Gariev |
| Plataforma, Agenda e recepção | https://unsplash.com/photos/xM_1ZYHOc9E | Cdn Pages |
| Sala de espera | https://unsplash.com/photos/B_sK_xgzwVA | Benyamin Bohlouli |
| Cuidado humano | https://unsplash.com/photos/MJmsLpeHPfg | Vitaly Gariev |

Todas estão sob a licença gratuita do Unsplash, que permite uso comercial sem pedir autorização.

## Licenças

- Fontes Outfit e Figtree: SIL Open Font License 1.1 (arquivos de licença em `site/site-assets/fonts/`).
- Ícones: Phosphor Icons, licença MIT.
- O logo virou um SVG desenhado a partir da fonte Inter (SIL Open Font License 1.1), no mesmo peso e espaçamento que o CSS atual declara.
