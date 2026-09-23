# Android Auto e Android Automotive OS

## Distinção essencial

Android Auto projeta uma experiência do app do smartphone na tela compatível do carro. Android Automotive OS (AAOS) é Android executando nativamente no veículo.

Não confunda os dois ambientes. Alguns componentes, permissões e superfícies diferem.

## Segurança e elegibilidade

Antes de implementar:

1. confirme se a categoria do app é atualmente permitida para Android Auto e/ou AAOS;
2. confirme requisitos de qualidade e distração do motorista;
3. confirme se a experiência deve funcionar dirigindo, estacionado, ou ambos;
4. confirme versão atual da Car App Library e APIs utilizadas.

Nunca tente contornar limites de templates ou restrições de driver distraction.

## Car App Library

Para categorias baseadas em templates, use `androidx.car.app` e templates oficiais.

- Não replique a UI mobile.
- Use ações e conteúdo permitidos pela categoria.
- Minimize passos e texto.
- Preserve legibilidade e comandos de voz quando aplicável.
- Considere diferenças de host, display e input.
- Prefira código compartilhado de domínio/data e adapte apenas a apresentação/plataforma.

## Media

Apps de mídia seguem integração própria com MediaBrowser/MediaSession/Media3 conforme documentação atual. Não force Car App Library se a categoria usa outra integração oficial.

## Mensagens, chamadas, navegação e outras categorias

Cada categoria possui requisitos e APIs específicos. Consulte a documentação atual antes de definir arquitetura final. Categorias suportadas e regras de publicação podem mudar.

## Android Auto

- O app principal continua no telefone.
- Teste projeção usando ferramentas oficiais de desktop/head unit quando disponíveis.
- Não assuma acesso a hardware do veículo.
- Solicite apenas permissões necessárias.

## Android Automotive OS

- O app é instalado no veículo.
- Pode haver experiências parked-only.
- Hardware/permissions podem diferir por fabricante.
- Não suponha Google built-in em todo AAOS.
- Use APIs de hardware do carro somente quando autorizadas e necessárias.
- Mantenha fallback seguro quando dados do carro não existirem.

## Arquitetura compartilhada

Uma organização comum:

- `core/domain` e `core/data` compartilhados;
- UI mobile separada da UI/template de carro;
- abstrações apenas para diferenças reais de plataforma;
- feature flags/capability checks para recursos variáveis.

## Testes

- Desktop Head Unit / ferramentas oficiais do Android Auto;
- AAOS emulator quando aplicável;
- conexão/desconexão;
- permissões negadas;
- app em background;
- mudança de host;
- modo parked/driving quando aplicável;
- fluxos no limite de templates;
- ausência de hardware/capabilities opcionais.

## Fontes oficiais

- Android for Cars: https://developer.android.com/training/cars
- Android Auto: https://developer.android.com/training/cars/platforms/android-auto
- Car App Library: https://developer.android.com/training/cars/apps/library
- App quality for cars: https://developer.android.com/docs/quality-guidelines/car-app-quality
