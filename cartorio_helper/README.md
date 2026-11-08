# Cartório Helper

Ferramenta de mesa (desktop) para a rotina de um cartório — Electron + React + Vite, offline.

| Ferramenta | O que faz |
| --- | --- |
| Upload de Arquivos XML | Lê remessas XML do sistema registral, monta a tabela auditável com Σ emolumentos e exporta CSV / copia a tabela |
| Gerador de Etiquetas & Averbação | Minuta de averbação de CPF em conformidade com os Provimentos CNJ 149/2023 e 182/2024, preenchível pela última remessa |
| Formatador de Texto | Higieniza texto colado de certidões: quebras, espaços e aspas |
| Leitor de Certidões PDF | Extração local de campos de certidões de nascimento, casamento e óbito |
| Consulta CRM / Médicos | Portal CREMERJ embutido (requer Electron — usa `<webview>`) |

## Desenvolvimento

```bash
npm install
npm run dev          # Vite em http://localhost:5173 (a aba Consulta só funciona no Electron)
npm run test         # vitest
npm run lint         # eslint
npm run build        # bundle de produção em dist/
npm run electron:dev # shell Electron apontando para o dev server
npm run package      # build + electron-builder (NSIS / DMG / deb)
```

## Notas

- Estado por fluxo é persistido em `localStorage` com chaves versionadas (`src/utils/storage.js`) — sem rede, sem back-end.
- A tabela de remessa nunca perde a linha: registros repetidos (mesmo selo + código) não entram duas vezes.
- CSP de produção em `index.html` é estrita; o dev relaxa inline-scripts apenas em memória (vite hook) para o Fast-Refresh do React.
