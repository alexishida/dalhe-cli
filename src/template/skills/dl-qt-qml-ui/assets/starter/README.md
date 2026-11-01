# ModernShell — exemplo Qt/QML

Exemplo de interface desktop moderna, **100% Qt Quick/QML**. Inclui navegação real entre 3 telas, temas claro/escuro, tokens centralizados, componentes reutilizáveis e animações discretas. Os números são **dados fictícios explicitamente identificados na interface**.

Requisitos: Qt 6.5+ com Quick e Quick Controls 2, CMake 3.21+, compilador C++17.

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build
# Linux: ./build/modern_shell (o caminho exato pode variar conforme o gerador)
```

Este projeto é um exemplo de design e arquitetura, **não** um modelo obrigatório para todos os apps: troque layout, navegação, conteúdos e tokens para atender ao produto real. Não substitua controles de produção por gráficos falsos.
