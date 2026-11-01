cmake_minimum_required(VERSION 3.21)
project(ModernShell VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Qt6 6.5 REQUIRED COMPONENTS Quick QuickControls2)
qt_standard_project_setup(REQUIRES 6.5)

qt_add_executable(modern_shell main.cpp)

set_source_files_properties(Theme.qml PROPERTIES QT_QML_SINGLETON_TYPE TRUE)

qt_add_qml_module(modern_shell
    URI ModernShell
    VERSION 1.0
    QML_FILES
        Main.qml
        Theme.qml
        UiButton.qml
        UiNavItem.qml
        UiStatCard.qml
)

target_link_libraries(modern_shell PRIVATE Qt6::Quick Qt6::QuickControls2)

set_target_properties(modern_shell PROPERTIES
    WIN32_EXECUTABLE TRUE
    MACOSX_BUNDLE TRUE
)
