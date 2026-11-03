# Libras em Prática — Datilologia

Aplicação web educativa para praticar a sequência de letras de um nome ou palavra em Libras. O sistema exibe instruções de estudo, abre a câmera e utiliza o **MediaPipe Hand Landmarker** para localizar os 21 pontos de referência da mão.

## Abrir a aplicação

A página é estática: não exige Node.js, npm, instalação de dependências ou servidor de backend.

- **GitHub Pages:** abra a pasta `libras-em-pratica` pelo endereço publicado do repositório.
- **No computador:** entre nesta pasta pelo terminal e execute `python -m http.server 8000`. Depois, abra `http://localhost:8000`.
- A câmera exige uma origem segura: HTTPS ou localhost. Não abra o arquivo HTML diretamente pelo gerenciador de arquivos.

É necessária conexão com a internet na primeira utilização para carregar o módulo, os arquivos WebAssembly e o modelo oficial do MediaPipe. Depois de carregados, o processamento dos quadros da câmera ocorre no próprio navegador.

## Como utilizar

1. Digite seu nome ou uma palavra e selecione **Montar sequência**.
2. Selecione **Ativar câmera** e permita o acesso.
3. Posicione uma mão no enquadramento, com iluminação adequada.
4. Na primeira utilização de cada letra estática, use **Gravar referência da letra** e mantenha a pose correta estável durante a gravação. Use uma imagem/vídeo confiável de Libras ou orientação de pessoa fluente para garantir que a referência seja adequada.
5. Depois de gravada a referência, não é necessário clicar em aceitar: ao detectar uma pose suficientemente semelhante por cerca de 1 segundo, o sistema avança automaticamente para a próxima letra.
6. As referências ficam salvas no navegador. Ao digitar novamente uma palavra com letras já calibradas, a prática acontece sem nova gravação.
7. Para letras com movimento, execute o gesto e use a confirmação manual. A comparação estática não avalia trajetórias.
8. O botão de avançar foi removido do fluxo normal para evitar pular letras sem que a pose seja reconhecida.

As referências pessoais ficam no armazenamento local do navegador. O aplicativo não grava nem envia vídeos da câmera.

## Limites importantes

- **O MediaPipe Hand Landmarker detecta pontos da mão; não é, por si só, um tradutor ou classificador de Libras.**
- O reconhecimento automático das letras estáticas é uma comparação geométrica com uma pose de referência gravada pela própria pessoa. A aplicação não reconhece semanticamente a letra sem essa calibração. Se a referência for gravada com uma configuração incorreta, o sistema pode aceitar a pose incorreta. Por isso, calibre usando material confiável de Libras ou orientação especializada. A comparação não é uma avaliação linguística nem uma medida certificada de correção.
- A comparação depende do enquadramento, da iluminação, da orientação da mão e da consistência da pose. Pessoas diferentes podem precisar gravar referências próprias.
- Letras que envolvem movimento, como J e Z, exigem confirmação manual nesta versão. O reconhecimento temporal desses gestos ainda não está implementado.
- As instruções textuais são lembretes introdutórios, não substituem imagens ou vídeos de referência. Configurações, orientação, movimento e variantes regionais devem ser conferidos com materiais didáticos confiáveis e pessoas surdas/profissionais fluentes em Libras.
- Não utilize este protótipo para avaliar proficiência, certificar aprendizagem ou traduzir conversas.

## Tecnologias

- HTML, CSS e JavaScript moderno (ES Modules)
- MediaPipe Tasks Vision — Hand Landmarker
- Câmera via `navigator.mediaDevices.getUserMedia`
- Armazenamento local do navegador (`localStorage`)

## Privacidade

A aplicação usa a câmera somente após autorização explícita. O vídeo é processado no navegador pelo MediaPipe; os pontos da pose de referência são armazenados localmente no dispositivo. A biblioteca MediaPipe pode enviar métricas de utilização conforme a documentação e a política do fornecedor. Consulte a documentação do [Hand Landmarker para Web](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js).

## Créditos

Projeto educacional independente para apoio à prática de datilologia em Libras. O alfabeto e suas descrições precisam de validação por pessoas surdas e profissionais de Libras antes de uso didático formal.