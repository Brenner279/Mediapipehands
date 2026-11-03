# Libras em Prática — Datilologia Interativa

Aplicação web em React + TypeScript + Vite para praticar a soletração de nomes e palavras em Libras. O usuário digita um texto, visualiza a sequência letra por letra, consulta um guia visual e utiliza a webcam para rastrear a mão com MediaPipe.

## Recursos
- Entrada de nomes e palavras (A–Z, Ç e espaços).
- Cartões por letra, destaque da letra atual e barra de progresso.
- MediaPipe Hand Landmarker no navegador, com até duas mãos e 21 landmarks por mão.
- Esqueleto da mão desenhado sobre a imagem da câmera.
- Indicadores dos cinco dedos.
- Guia visual vetorial esquemático para A–Z e Ç.
- Calibração pessoal de poses estáticas, salva no localStorage.
- Confirmação manual para letras que exigem movimento nesta versão inicial.

## Instalação
Requer Node.js 20+, navegador atualizado e webcam.

```bash
npm install
npm run dev
```

Abra http://localhost:5173 e permita o acesso à câmera. A webcam exige localhost ou HTTPS.

## Como praticar
1. Digite um nome ou palavra e clique em **Montar sequência**.
2. Ative a câmera.
3. Para cada letra estática, grave exemplos com **Gravar exemplo desta letra**.
4. Mantenha a mão na posição para a comparação com o modelo pessoal.
5. Para letras dinâmicas, execute o movimento e use a confirmação manual.

## Publicação
O workflow em `.github/workflows/deploy.yml` compila e publica esta aplicação no GitHub Pages quando houver push na branch main. Como o projeto está em uma subpasta de um repositório maior, o workflow deve ser executado a partir da raiz do repositório e o caminho de build deve ser ajustado para esta pasta antes de ativar o deploy.

## Limitações importantes
O MediaPipe Hand Landmarker localiza a mão e produz 21 pontos; ele não classifica automaticamente letras de Libras. O protótipo compara poses com exemplos gravados pelo usuário. Letras com movimento não são reconhecidas automaticamente. As ilustrações e descrições são esquemáticas e precisam de validação com pessoas surdas e profissionais de Libras. Não é um tradutor automático nem uma avaliação de proficiência.

## Tecnologias
React 18, TypeScript, Vite, MediaPipe Tasks Vision e Lucide React.
