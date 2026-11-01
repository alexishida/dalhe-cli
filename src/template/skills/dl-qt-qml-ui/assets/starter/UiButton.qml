import QtQuick
import QtQuick.Controls.Basic
import ModernShell

Button {
    id: control
    property bool secondary: false

    hoverEnabled: true
    implicitHeight: 42
    implicitWidth: Math.max(108, contentItem.implicitWidth + leftPadding + rightPadding)
    leftPadding: 18
    rightPadding: 18
    focusPolicy: Qt.StrongFocus
    font.pixelSize: 13
    font.weight: Font.DemiBold

    contentItem: Text {
        text: control.text
        font: control.font
        color: control.secondary ? Theme.primaryText : Theme.accentText
        opacity: control.enabled ? 1.0 : 0.48
        horizontalAlignment: Text.AlignHCenter
        verticalAlignment: Text.AlignVCenter
    }

    background: Rectangle {
        radius: Theme.radiusM
        color: !control.enabled ? Theme.surfaceHover
              : control.secondary ? (control.hovered ? Theme.surfaceHover : Theme.surface)
              : control.down ? Theme.accentHover
              : control.hovered ? Theme.accentHover : Theme.accent
        border.width: control.visualFocus ? 2 : (control.secondary ? 1 : 0)
        border.color: control.visualFocus ? Theme.accent : Theme.border
        Behavior on color { ColorAnimation { duration: Theme.durationFast } }
    }

    scale: down && Theme.motionEnabled ? 0.985 : 1
    Behavior on scale { NumberAnimation { duration: Theme.durationFast } }
}
