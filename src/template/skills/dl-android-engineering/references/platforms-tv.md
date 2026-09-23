# Android TV e Google TV

## Modelo mental

TV não é telefone em tela grande. O usuário geralmente está a alguns metros da tela e navega por D-pad/controle remoto. Foco, legibilidade e previsibilidade de navegação têm prioridade.

## UI

Para projetos novos, prefira Compose for TV quando compatível com a base.

- Use componentes TV-specific quando existirem.
- Garanta foco visível e consistente.
- Nunca dependa somente de cor para indicar foco.
- Defina ordem de foco previsível.
- Teste esquerda/direita/cima/baixo, back e select.
- Não exija touch.
- Use tamanhos, espaçamentos e tipografia adequados à distância.
- Evite telas densas com muitos controles pequenos.
- Preserve posição/foco ao voltar de detalhes quando isso fizer sentido.

## Listas e conteúdo

- Use lazy containers compatíveis com Compose atual.
- Forneça keys estáveis.
- Não carregar thumbnails em resolução excessiva.
- Pré-carregue apenas quando medição justificar.
- Evite auto-play agressivo em carrosséis.
- Para mídia, trate lifecycle e áudio corretamente.

## Playback

Quando houver vídeo/áudio:

- use Media3/ExoPlayer conforme stack atual;
- implemente MediaSession quando integração do sistema exigir;
- trate pause/resume, áudio focus, controles remotos e background de acordo com o produto;
- teste seek, legendas, mudança de faixa, perda de rede e retomada;
- considere DRM apenas com implementação e threat model corretos.

## Manifest e distribuição

Confirme recursos/intent filters e requisitos atuais da Play Store para TV antes de publicar. Não suponha que uma configuração antiga continua válida.

## Testes

- emulator/TV device real quando possível;
- D-pad only;
- back stack;
- foco após recomposição;
- foco em listas grandes;
- mudança de conexão;
- playback prolongado;
- memory pressure;
- resolução/overscan/safe area conforme aparelho.

## Fontes oficiais

- Android TV: https://developer.android.com/training/tv
- Compose for TV: https://developer.android.com/training/tv/playback/compose
- AndroidX TV: https://developer.android.com/jetpack/androidx/releases/tv
