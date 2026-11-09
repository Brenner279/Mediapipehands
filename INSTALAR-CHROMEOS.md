# Instalar o Libras em Prática no ChromeOS

O Libras em Prática é distribuído para Chromebook como um PWA (aplicativo web instalável). Não é necessário instalar Linux, APK ou extensão.

## Primeira instalação (com internet)

1. Abra o Google Chrome no Chromebook.
2. Acesse https://brenner279.github.io/Mediapipehands/.
3. Aguarde o carregamento completo da página e a preparação do modo offline. Na primeira visita, o aplicativo baixa e armazena no dispositivo os arquivos do MediaPipe, o modelo de detecção da mão, as imagens e os arquivos da aplicação.
4. No Chrome, abra o menu ⋮ e escolha **Instalar Libras em Prática** ou **Instalar página como app**. Em algumas versões, aparece um ícone de instalação na barra de endereço.
5. Confirme a instalação. O aplicativo ficará disponível no inicializador de aplicativos do ChromeOS.

## Testar sem internet

1. Ainda conectado, abra o aplicativo instalado e aguarde alguns instantes.
2. Ative a câmera e confirme que a detecção da mão inicia normalmente.
3. Feche o aplicativo.
4. Desative o Wi-Fi do Chromebook.
5. Abra novamente o Libras em Prática pelo inicializador e teste as telas, as referências e a câmera.

## Observações importantes

- A primeira instalação e o primeiro preparo do cache exigem internet.
- Depois que todos os recursos forem armazenados, a aplicação pode abrir e executar a detecção localmente sem conexão.
- A câmera exige permissão do ChromeOS e contexto seguro; use o aplicativo instalado pelo Chrome.
- Os cadastros de movimentos ficam no armazenamento local do navegador/dispositivo. Eles não são sincronizados automaticamente.
- O funcionamento offline deve ser confirmado no Chromebook de destino, pois espaço disponível, políticas da escola e versão do ChromeOS podem interferir.
- Para atualizar o aplicativo, conecte o Chromebook à internet e abra o aplicativo novamente para receber a versão publicada.

## Projeto

Código-fonte: https://github.com/Brenner279/Mediapipehands
