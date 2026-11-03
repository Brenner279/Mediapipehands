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
4. A aplicação exibe automaticamente a imagem de referência visual correspondente à letra atual, usando os arquivos de imagem disponíveis no diretório principal do repositório. No momento, `B.jpg` não está presente, então a letra B não terá imagem até que esse arquivo seja adicionado. As imagens são referências de estudo; somente A, C e S são atualmente utilizadas na tentativa de extração automática dos 21 pontos da mão pelo MediaPipe. Não é necessário gravar essas três letras manualmente quando a detecção na imagem for bem-sucedida.
5. Depois de obter uma referência, não é necessário clicar em aceitar: ao detectar uma pose suficientemente semelhante por cerca de 1 segundo, o sistema avança automaticamente para a próxima letra. A aplicação também testa a comparação com orientação horizontal espelhada.
6. As referências ficam salvas no navegador. Ao digitar novamente uma palavra com letras já calibradas, a prática acontece sem nova gravação.
7. Para letras com movimento, execute o gesto e use a confirmação manual. A comparação estática não avalia trajetórias.
8. O botão de avançar foi removido do fluxo normal para evitar pular letras sem que a pose seja reconhecida.

As referências pessoais ficam no armazenamento local do navegador. O aplicativo não grava nem envia vídeos da câmera.

## Limites importantes

- **O MediaPipe Hand Landmarker detecta pontos da mão; não é, por si só, um tradutor ou classificador de Libras.**
- Para **A, C e S**, o aplicativo tenta extrair landmarks diretamente das imagens do repositório. Isso depende de o MediaPipe detectar uma mão real e suficientemente nítida na imagem. Uma ilustração, desenho, mão parcialmente cortada ou imagem de baixa qualidade pode não gerar landmarks; nesse caso, o app informa que a referência está indisponível. Para outras letras estáticas, ainda há suporte a referência pessoal capturada pela câmera. A comparação geométrica não reconhece semanticamente a letra e não é uma avaliação linguística nem uma medida certificada de correção.
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