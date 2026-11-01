#include <QGuiApplication>
#include <QQmlApplicationEngine>

int main(int argc, char *argv[])
{
    QGuiApplication app(argc, argv);
    QCoreApplication::setApplicationName("Modern Shell");
    QQmlApplicationEngine engine;
    engine.loadFromModule("ModernShell", "Main");
    if (engine.rootObjects().isEmpty())
        return -1;
    return app.exec();
}
