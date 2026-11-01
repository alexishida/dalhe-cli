import QtQuick
import QtQuick.Layouts
import ModernShell

Rectangle {
    id: card
    property string label: "Metric"
    property string metric: "0"
    property string trend: "+0.0%"

    implicitHeight: 145
    implicitWidth: 210
    radius: Theme.radiusL
    color: Theme.surface
    border.color: Theme.border
    border.width: 1

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 21
        spacing: 8

        Text {
            text: card.label
            color: Theme.secondaryText
            font.pixelSize: 13
            Layout.fillWidth: true
            elide: Text.ElideRight
        }
        Text {
            text: card.metric
            color: Theme.primaryText
            font.pixelSize: 30
            font.weight: Font.DemiBold
            Layout.fillWidth: true
            elide: Text.ElideRight
        }
        Item { Layout.fillHeight: true }
        RowLayout {
            spacing: 8
            Rectangle {
                Layout.preferredWidth: indicator.implicitWidth + 16
                Layout.preferredHeight: 24
                radius: 8
                color: Theme.accentMuted
                Text {
                    id: indicator
                    anchors.centerIn: parent
                    text: card.trend
                    color: Theme.positive
                    font.pixelSize: 11
                    font.weight: Font.DemiBold
                }
            }
            Text {
                text: "vs last period"
                color: Theme.secondaryText
                font.pixelSize: 11
            }
        }
    }
}
