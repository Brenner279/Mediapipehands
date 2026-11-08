# Libras em Prática — PWA e Datilologia

Aplicação educativa instalável para praticar o alfabeto manual da Libras. O navegador utiliza o **MediaPipe Hand Landmarker** para localizar os 21 pontos de referência da mão e comparar poses geometricamente.

## Aplicativo no Chromebook

O projeto é um **Progressive Web App (PWA)**. No Chromebook, abra o endereço HTTPS do GitHub Pages no Google Chrome e use a opção **Instalar Libras em Prática** no ícone de instalação da barra de endereço ou em **⋮ → Transmitir, salvar e compartilhar → Instalar página como app** (o texto pode variar conforme a versão do ChromeOS).

Depois de instalado, o aplicativo aparece no iniciador do ChromeOS e pode abrir em uma janela própria.

## Primeiro carregamento e uso totalmente offline

A primeira abertura deve acontecer com internet. O service worker prepara o armazenamento local e baixa:
- interface, estilos, manifesto e ícone;
- imagens de referência A–Z;
- biblioteca MediaPipe Tasks Vision 1.2.0;
- arquivos WebAssembly (SIMD e fallback sem SIMD);
- modelo oficial Hand Landmarker.

A preparação pode levar alguns minutos, dependendo da conexão. O service worker só assume a página depois que os recursos obrigatórios forem armazenados. Ao terminar a instalação inicial, feche e abra o aplicativo novamente. Depois disso, a interface, as referências, o modelo e o reconhecimento de mãos são executados sem internet.

**Atenção:** não limpe os dados do site/aplicativo nem os dados de navegação do Chrome, pois isso pode apagar os arquivos offline. Atualizações publicadas no GitHub Pages precisam ser carregadas enquanto o Chromebook estiver conectado à internet.

## Câmera e privacidade

A câmera exige autorização e uma origem segura (HTTPS ou localhost). O vídeo é processado no próprio Chromebook; não é enviado pelo aplicativo. As poses de referência pessoais ficam no armazenamento local do navegador.

## Como utilizar

1. Digite um nome ou palavra e selecione **Montar sequência**.
2. Selecione **Ativar câmera** e permita o acesso.
3. Posicione a mão no enquadramento, com boa iluminação.
4. Observe a referência visual da letra atual. As imagens estão na pasta `referencias-libras/`.
5. Para letras com referência geométrica disponível, mantenha a pose até o sistema reconhecê-la e avançar.
6. Para outras letras estáticas, grave uma referência pessoal usando a câmera.
7. Para letras que envolvem movimento (Ç, H, J, X e Z), use a confirmação manual. O reconhecimento temporal de trajetórias não está implementado nesta versão.

## Limites pedagógicos e técnicos

- O **Hand Landmarker detecta pontos da mão**; não é, por si só, um tradutor nem um classificador semântico de Libras.
- As imagens A–Z são referências visuais. Somente A, C e S são atualmente utilizadas na tentativa de extração automática de landmarks; o resultado depende da qualidade e do enquadramento da imagem.
- A comparação de poses é geométrica, não uma avaliação linguística nem uma medida certificada de correção.
- Pessoas diferentes podem precisar gravar referências próprias.
- As configurações, orientações, movimentos e variantes regionais devem ser conferidos com materiais didáticos confiáveis e pessoas surdas/profissionais fluentes em Libras.
- Não utilize este protótipo para avaliar proficiência, certificar aprendizagem ou traduzir conversas.

## Tecnologias

- HTML, CSS e JavaScript (ES Modules)
- Progressive Web App: Web App Manifest e Service Worker
- MediaPipe Tasks Vision 1.2.0
- WebAssembly e modelo Hand Landmarker armazenados no cache local
- Câmera via `navigator.mediaDevices.getUserMedia`
- Armazenamento local do navegador (`localStorage` e Cache Storage)

## Desenvolvimento local

Para testar em computador, sirva a raiz do repositório por HTTPS ou localhost:

```bash
python -m http.server 8000
```

Acesse `http://localhost:8000`. A primeira preparação offline também precisa de internet para baixar a biblioteca, os arquivos WASM e o modelo.

## Créditos

Projeto educacional independente para apoio à prática de datilologia em Libras.


## Aplicativo Android (APK de teste)

O repositório também compila uma versão Android usando Capacitor. O APK inclui a interface, as referências visuais A–Z, a biblioteca MediaPipe, os arquivos WebAssembly e o modelo de detecção de mãos. Assim, a câmera e o reconhecimento não dependem do cache do Chrome nem de conexão com a internet após a instalação.

A cada atualização dos arquivos principais, o GitHub Actions executa a compilação automaticamente. Para gerar manualmente:

1. Abra a aba **Actions** do repositório.
2. Selecione **Gerar APK Android — Libras em Prática**.
3. Clique em **Run workflow** e aguarde o término com sucesso.
4. Abra a execução concluída e baixe o artefato **Libras-em-Pratica-APK-debug**.
5. Extraia o ZIP e instale o arquivo `app-debug.apk` no Android. Se solicitado, autorize a instalação de aplicativos dessa fonte.

Na primeira abertura do APK, autorize o uso da câmera. O aplicativo usa o endereço local seguro do Capacitor e solicita a permissão de câmera do Android. O processamento da mão é feito no próprio aparelho.

**Observação:** esta é uma compilação de depuração para testes, não uma versão assinada para publicação na Play Store. O APK precisa ser validado em aparelho Android real, especialmente a permissão de câmera, o desempenho do MediaPipe e a operação offline. As letras com movimento (Ç, H, J, X e Z) continuam usando confirmação manual, conforme os limites atuais do projeto.
