import QtQuick
import QtQuick.Controls.Basic
import QtQuick.Layouts
import ModernShell

ApplicationWindow {
    id: window
    width: 1320
    height: 820
    minimumWidth: 900
    minimumHeight: 620
    visible: true
    title: "Modern Shell — Qt Quick"
    color: Theme.canvas
    property int activePage: 0
    readonly property var pageTitles: ["Overview", "Activity", "Preferences"]
    readonly property var pageDescriptions: [
        "Your workspace, at a glance.",
        "A concise timeline of recent changes.",
        "Tune the workspace to your preferences."
    ]

    RowLayout {
        anchors.fill: parent
        spacing: 0

        // Navigation surface. Keep the native window title bar for proper OS behavior.
        Rectangle {
            Layout.preferredWidth: 246
            Layout.fillHeight: true
            color: Theme.sidebar

            Rectangle {
                anchors.right: parent.right
                width: 1
                height: parent.height
                color: Theme.border
            }

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 18
                spacing: 11

                RowLayout {
                    Layout.fillWidth: true
                    Layout.topMargin: 10
                    Layout.bottomMargin: 32
                    spacing: 12
                    Rectangle {
                        width: 40
                        height: 40
                        radius: 13
                        color: Theme.accent
                        Text {
                            anchors.centerIn: parent
                            text: "Q"
                            font.pixelSize: 19
                            font.weight: Font.Bold
                            color: "white"
                        }
                    }
                    ColumnLayout {
                        spacing: 1
                        Text {
                            text: "QUANTUM"
                            color: Theme.primaryText
                            font.pixelSize: 14
                            font.weight: Font.Bold
                            font.letterSpacing: 1.2
                        }
                        Text {
                            text: "DESKTOP STUDIO"
                            color: Theme.secondaryText
                            font.pixelSize: 10
                            font.letterSpacing: 1.1
                        }
                    }
                }

                Text {
                    text: "WORKSPACE"
                    color: Theme.secondaryText
                    font.pixelSize: 10
                    font.weight: Font.DemiBold
                    font.letterSpacing: 1.2
                    Layout.leftMargin: 14
                    Layout.bottomMargin: 3
                }
                Repeater {
                    model: ["Overview", "Activity", "Preferences"]
                    delegate: UiNavItem {
                        required property int index
                        required property string modelData
                        text: modelData
                        indexLabel: "0" + (index + 1)
                        active: window.activePage === index
                        Layout.fillWidth: true
                        onClicked: window.activePage = index
                    }
                }
                Item { Layout.fillHeight: true }
                Rectangle {
                    Layout.fillWidth: true
                    implicitHeight: 88
                    radius: Theme.radiusM
                    color: Theme.surface
                    border.color: Theme.border
                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 14
                        spacing: 7
                        Text {
                            text: "QT QUICK · NATIVE"
                            font.pixelSize: 10
                            font.weight: Font.DemiBold
                            font.letterSpacing: 1.0
                            color: Theme.accent
                        }
                        Text {
                            text: "Web-grade polish.\nNo web runtime."
                            lineHeight: 1.25
                            color: Theme.secondaryText
                            font.pixelSize: 12
                        }
                    }
                }
                RowLayout {
                    Layout.fillWidth: true
                    Layout.topMargin: 8
                    spacing: 10
                    Rectangle {
                        Layout.preferredWidth: 34
                        Layout.preferredHeight: 34
                        radius: 17
                        color: Theme.accentMuted
                        Text {
                            anchors.centerIn: parent
                            text: "QT"
                            color: Theme.accent
                            font.pixelSize: 11
                            font.weight: Font.Bold
                        }
                    }
                    ColumnLayout {
                        Layout.fillWidth: true
                        spacing: 2
                        Text { text: "Local workspace"; color: Theme.primaryText; font.pixelSize: 12; font.weight: Font.DemiBold }
                        Text { text: "Demo project"; color: Theme.secondaryText; font.pixelSize: 11 }
                    }
                }
            }
        }

        Rectangle {
            id: contentPanel
            Layout.fillWidth: true
            Layout.fillHeight: true
            color: Theme.canvas

            ColumnLayout {
                anchors.fill: parent
                anchors.leftMargin: 34
                anchors.rightMargin: 34
                anchors.topMargin: 28
                anchors.bottomMargin: 22
                spacing: 25

                RowLayout {
                    Layout.fillWidth: true
                    spacing: 16
                    ColumnLayout {
                        Layout.fillWidth: true
                        spacing: 6
                        Text {
                            text: window.pageTitles[window.activePage]
                            color: Theme.primaryText
                            font.pixelSize: 27
                            font.weight: Font.DemiBold
                        }
                        Text {
                            text: window.pageDescriptions[window.activePage]
                            color: Theme.secondaryText
                            font.pixelSize: 13
                        }
                    }
                    UiButton {
                        secondary: true
                        text: Theme.dark ? "Light mode" : "Dark mode"
                        onClicked: Theme.dark = !Theme.dark
                        Accessible.name: "Toggle dark and light theme"
                    }
                    UiButton {
                        text: "View activity"
                        onClicked: window.activePage = 1
                        Accessible.name: "Open activity page"
                    }
                }

                ScrollView {
                    id: scroll
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    contentWidth: availableWidth
                    ScrollBar.horizontal.policy: ScrollBar.AlwaysOff
                    clip: true

                    ColumnLayout {
                        width: scroll.availableWidth
                        spacing: 20

                        RowLayout {
                            visible: window.activePage === 0
                            Layout.fillWidth: true
                            Layout.topMargin: 4
                            Text { text: "Performance snapshot"; color: Theme.primaryText; font.pixelSize: 17; font.weight: Font.DemiBold }
                            Item { Layout.fillWidth: true }
                            Text { text: "Illustrative data · 2026"; color: Theme.secondaryText; font.pixelSize: 12 }
                        }

                        GridLayout {
                            visible: window.activePage === 0
                            Layout.fillWidth: true
                            columns: width > 760 ? 3 : (width > 510 ? 2 : 1)
                            rowSpacing: 14
                            columnSpacing: 14
                            UiStatCard { label: "Active projects"; metric: "24"; trend: "+8.2%"; Layout.fillWidth: true }
                            UiStatCard { label: "Monthly sessions"; metric: "18.4k"; trend: "+12.8%"; Layout.fillWidth: true }
                            UiStatCard { label: "Completion rate"; metric: "94.6%"; trend: "+4.1%"; Layout.fillWidth: true }
                        }

                        GridLayout {
                            visible: window.activePage === 0
                            Layout.fillWidth: true
                            columns: width >= 840 ? 2 : 1
                            columnSpacing: 14
                            rowSpacing: 14

                            Rectangle {
                                Layout.fillWidth: true
                                Layout.minimumWidth: 280
                                Layout.preferredHeight: 344
                                radius: Theme.radiusL
                                color: Theme.surface
                                border.color: Theme.border

                                ColumnLayout {
                                    anchors.fill: parent
                                    anchors.margins: 24
                                    spacing: 9
                                    Text { text: "Engagement trends"; color: Theme.primaryText; font.pixelSize: 16; font.weight: Font.DemiBold }
                                    Text { text: "Sample activity for the last 12 months"; color: Theme.secondaryText; font.pixelSize: 12 }
                                    Item { Layout.preferredHeight: 15 }
                                    Item {
                                        id: chart
                                        Layout.fillWidth: true
                                        Layout.fillHeight: true

                                        // Lightweight sample bars: replace with real model/chart in production.
                                        Repeater {
                                            model: 4
                                            Rectangle {
                                                y: chart.height * (index + 1) / 4
                                                x: 0
                                                width: chart.width
                                                height: 1
                                                color: Theme.border
                                                opacity: 0.7
                                            }
                                        }
                                        RowLayout {
                                            anchors.fill: parent
                                            spacing: 8
                                            Repeater {
                                                model: [32, 44, 39, 57, 63, 51, 70, 62, 77, 68, 82, 91]
                                                delegate: Item {
                                                    Layout.fillWidth: true
                                                    Layout.fillHeight: true
                                                    Rectangle {
                                                        anchors.bottom: parent.bottom
                                                        anchors.left: parent.left
                                                        anchors.right: parent.right
                                                        height: Math.max(7, parent.height * modelData / 100)
                                                        radius: 6
                                                        color: index === 11 ? Theme.accent : Theme.accentMuted
                                                        Behavior on color { ColorAnimation { duration: Theme.durationFast } }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    RowLayout {
                                        Layout.fillWidth: true
                                        Text { text: "JAN"; color: Theme.secondaryText; font.pixelSize: 10 }
                                        Item { Layout.fillWidth: true }
                                        Text { text: "JUN"; color: Theme.secondaryText; font.pixelSize: 10 }
                                        Item { Layout.fillWidth: true }
                                        Text { text: "DEC"; color: Theme.secondaryText; font.pixelSize: 10 }
                                    }
                                }
                            }

                            Rectangle {
                                Layout.fillWidth: true
                                Layout.minimumWidth: 260
                                Layout.preferredHeight: 344
                                radius: Theme.radiusL
                                color: Theme.surface
                                border.color: Theme.border

                                ColumnLayout {
                                    anchors.fill: parent
                                    anchors.margins: 24
                                    spacing: 17
                                    Text { text: "Project health"; color: Theme.primaryText; font.pixelSize: 16; font.weight: Font.DemiBold }
                                    Text { text: "Sample operational indicators"; color: Theme.secondaryText; font.pixelSize: 12 }
                                    Repeater {
                                        model: [
                                            { "name": "Design system", "percent": 88 },
                                            { "name": "UI migration", "percent": 67 },
                                            { "name": "Component library", "percent": 95 }
                                        ]
                                        delegate: ColumnLayout {
                                            Layout.fillWidth: true
                                            spacing: 8
                                            RowLayout {
                                                Layout.fillWidth: true
                                                Text { text: modelData.name; color: Theme.primaryText; font.pixelSize: 12 }
                                                Item { Layout.fillWidth: true }
                                                Text { text: modelData.percent + "%"; color: Theme.secondaryText; font.pixelSize: 12 }
                                            }
                                            Rectangle {
                                                Layout.fillWidth: true
                                                Layout.preferredHeight: 8
                                                radius: 4
                                                color: Theme.surfaceHover
                                                Rectangle {
                                                    width: parent.width * modelData.percent / 100
                                                    height: parent.height
                                                    radius: 4
                                                    color: Theme.accent
                                                }
                                            }
                                        }
                                    }
                                    Item { Layout.fillHeight: true }
                                }
                            }
                        }

                        Rectangle {
                            visible: window.activePage === 1
                            Layout.fillWidth: true
                            Layout.preferredHeight: 390
                            radius: Theme.radiusL
                            color: Theme.surface
                            border.color: Theme.border
                            ColumnLayout {
                                anchors.fill: parent
                                anchors.margins: 26
                                spacing: 20
                                Text { text: "Recent changes"; color: Theme.primaryText; font.pixelSize: 19; font.weight: Font.DemiBold }
                                Repeater {
                                    model: [
                                        "Design tokens reviewed",
                                        "Navigation shell created",
                                        "Qt Quick components consolidated",
                                        "Keyboard focus states improved"
                                    ]
                                    delegate: RowLayout {
                                        Layout.fillWidth: true
                                        spacing: 14
                                        Rectangle {
                                            Layout.preferredWidth: 11
                                            Layout.preferredHeight: 11
                                            radius: 6
                                            color: Theme.positive
                                        }
                                        Text { text: modelData; color: Theme.primaryText; font.pixelSize: 14; Layout.fillWidth: true }
                                        Text { text: "Sample"; color: Theme.secondaryText; font.pixelSize: 12 }
                                    }
                                }
                                Item { Layout.fillHeight: true }
                                Text { text: "Illustrative activity — connect a real model to replace this list."; color: Theme.secondaryText; font.pixelSize: 12 }
                            }
                        }

                        Rectangle {
                            visible: window.activePage === 2
                            Layout.fillWidth: true
                            Layout.preferredHeight: 260
                            radius: Theme.radiusL
                            color: Theme.surface
                            border.color: Theme.border
                            ColumnLayout {
                                anchors.fill: parent
                                anchors.margins: 26
                                spacing: 20
                                Text { text: "Appearance"; color: Theme.primaryText; font.pixelSize: 19; font.weight: Font.DemiBold }
                                RowLayout {
                                    Layout.fillWidth: true
                                    ColumnLayout {
                                        Layout.fillWidth: true
                                        Text { text: "Dark interface"; color: Theme.primaryText; font.pixelSize: 14; font.weight: Font.DemiBold }
                                        Text { text: "Switch between both token palettes."; color: Theme.secondaryText; font.pixelSize: 12 }
                                    }
                                    Switch { checked: Theme.dark; onToggled: Theme.dark = checked; Accessible.name: "Dark interface" }
                                }
                                RowLayout {
                                    Layout.fillWidth: true
                                    ColumnLayout {
                                        Layout.fillWidth: true
                                        Text { text: "Motion"; color: Theme.primaryText; font.pixelSize: 14; font.weight: Font.DemiBold }
                                        Text { text: "Disable decorative transitions."; color: Theme.secondaryText; font.pixelSize: 12 }
                                    }
                                    Switch { checked: Theme.motionEnabled; onToggled: Theme.motionEnabled = checked; Accessible.name: "Enable animations" }
                                }
                                Item { Layout.fillHeight: true }
                            }
                        }
                    }
                }
                RowLayout {
                    Layout.fillWidth: true
                    Text { text: "Built with Qt 6 · QML · Qt Quick Controls"; color: Theme.secondaryText; font.pixelSize: 11 }
                    Item { Layout.fillWidth: true }
                    Text { text: "LOCAL DEMO"; color: Theme.secondaryText; font.pixelSize: 10; font.weight: Font.DemiBold; font.letterSpacing: 1.0 }
                }
            }
        }
    }
}
