# Implementação Qt 6 / QML

## Estratégia de stack

- Projeto C++ existente: mantenha a inicialização do `QQmlApplicationEngine` e os modelos/serviços existentes; organize UI em um módulo QML.
- Projeto PySide6/PyQt6 existente: preserve Python como backend e o bootstrap. Prefira modelos (`QAbstractListModel` etc.)/signals/slots tipados a lógica de negócio dentro dos delegates QML.
- Projeto novo C++: Qt 6.5+, CMake, `qt_add_qml_module`, `QtQuick.Controls.Basic` para controles visuais próprios.
- Qt Widgets-only: migrar para QML **só** se o usuário pedir. Se precisa conviver, encapsule o Qt Quick de forma apropriada em vez de reconstruir o sistema inteiro.

## Exemplo de módulo QML

```cmake
find_package(Qt6 6.5 REQUIRED COMPONENTS Quick QuickControls2)
qt_standard_project_setup(REQUIRES 6.5)
qt_add_executable(myapp main.cpp)
set_source_files_properties(Theme.qml PROPERTIES QT_QML_SINGLETON_TYPE TRUE)
qt_add_qml_module(myapp
    URI MyApp
    VERSION 1.0
    QML_FILES Main.qml Theme.qml UiButton.qml
)
target_link_libraries(myapp PRIVATE Qt6::Quick Qt6::QuickControls2)
```

Em QML:

```qml
pragma Singleton
import QtQuick
QtObject {
    property bool dark: true
    readonly property color canvas: dark ? "#0B101B" : "#F5F7FB"
    readonly property color textPrimary: dark ? "#F3F6FC" : "#172034"
    readonly property int spaceM: 16
}
```

`Theme.qml` precisa do `pragma Singleton` **e** da propriedade `QT_QML_SINGLETON_TYPE` no CMake. Declare-a antes de `qt_add_qml_module()`.

## Componentização

- `Theme.qml`: cores, spacing, radius, motion.
- `UiButton.qml`, `UiInput.qml`, `UiNavItem.qml`, `UiCard.qml`: controles compartilhados; prefixo evita conflito com tipos Qt.
- `Shell.qml`: navegação, toolbar, layout de aplicação.
- `pages/*.qml`: páginas de domínio; não associe padrões visuais a dados fake sem explicitar o mock.
- `models/`: modelos reais, tipos de valor e bridge/backend.

Faça APIs mínimas e reativas, usando propriedades QML claras e signals de intenção. O backend é responsável por buscar, persistir e validar dados.

## Exemplo de controle estilizado

```qml
import QtQuick
import QtQuick.Controls.Basic
import MyApp

Button {
    id: control
    hoverEnabled: true
    implicitHeight: 42
    leftPadding: 16
    rightPadding: 16

    contentItem: Text {
        text: control.text
        font: control.font
        color: "white"
        horizontalAlignment: Text.AlignHCenter
        verticalAlignment: Text.AlignVCenter
    }

    background: Rectangle {
        radius: 10
        color: control.down ? "#5144C9" : control.hovered ? "#766AF1" : "#6255D8"
        Behavior on color { ColorAnimation { duration: 150 } }
    }
}
```

Adapte cores para tokens e adicione foco visível em produção. A seção é um padrão isolado; use os componentes mais completos do starter quando aplicável.

## Layout e performance

- Um item gerenciado por `RowLayout`/`ColumnLayout`/`GridLayout` deve usar `Layout.*` para tamanho e posição. Use `anchors` nos filhos *internos* desse item.
- `ScrollView` para telas com conteúdo amplo; `ListView` / `TableView` em listas e tabelas grandes (delegates enxutos; modelos no backend).
- Use `Text.ElideRight` e limites de largura para labels dinâmicas; não corte informação sem oferecer detalhe quando necessário.
- Evite excessos de `clip`, `opacity`, shaders e `layer.enabled` por item; a renderização e o custo GPU importam.
- Evite bindings que reavaliam cálculos pesados e loops JavaScript por frame.
- Animação deve comunicar mudanças, não mascarar inconsistências do layout.
- Prefira sinais e propriedades declarativas; `Connections` quando necessário.
- Se houver Qt Charts, use-o quando o módulo estiver instalado; não adicione dependência só para gráfico decorativo.

## Customização de controles

A documentação Qt recomenda usar os controles existentes e personalizá-los quando necessário. Para customização visual consistente, baseie-se em `QtQuick.Controls.Basic`, não nos estilos nativos do Windows/macOS. Se precisar de uma skin completa, considere um estilo próprio sobre `QtQuick.Templates`.

## Recursos e cross-platform

- SVGs devem ser importados como assets com licenças adequadas e incluir o módulo/plugin necessário quando aplicável.
- Preservar atalhos de teclado e acessibilidade no `Button`, `TextField`, `CheckBox` e outros controles reais.
- Não instale por padrão frameworks de janelas sem borda; a janela nativa é mais confiável.
- Teste em pelo menos duas dimensões da janela e, quando possível, em macOS/Windows/Linux.
- Preferir `engine.loadFromModule("MyApp", "Main")` (Qt 6.5+) para apps com módulo CMake.

Documentação: https://doc.qt.io/qt-6/qtquick-bestpractices.html ; https://doc.qt.io/qt-6/qtquickcontrols-customize.html ; https://doc.qt.io/qt-6/qtquick-performance.html ; https://doc.qt.io/qt-6/qt-add-qml-module.html
