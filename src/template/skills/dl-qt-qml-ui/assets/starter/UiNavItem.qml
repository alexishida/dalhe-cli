import QtQuick
import QtQuick.Controls.Basic
import QtQuick.Layouts
import ModernShell

Button {
    id: control
    property bool active: false
    property string indexLabel: "01"

    hoverEnabled: true
    focusPolicy: Qt.StrongFocus
    implicitHeight: 44
    leftPadding: 14
    rightPadding: 12
    font.pixelSize: 13
    font.weight: active ? Font.DemiBold : Font.Medium

    contentItem: RowLayout {
        spacing: 13

        Text {
            text: control.indexLabel
            color: control.active ? Theme.accent : Theme.secondaryText
            font.pixelSize: 11
            font.weight: Font.DemiBold
            Layout.preferredWidth: 22
        }
        Text {
            text: control.text
            color: control.active ? Theme.primaryText : Theme.secondaryText
            font: control.font
            Layout.fillWidth: true
            elide: Text.ElideRight
        }
    }

    background: Rectangle {
        radius: Theme.radiusM
        color: control.active ? Theme.accentMuted
              : control.hovered ? Theme.surfaceHover : "transparent"
        border.width: control.visualFocus ? 2 : 0
        border.color: Theme.accent
        Behavior on color { ColorAnimation { duration: Theme.durationFast } }
    }
}
