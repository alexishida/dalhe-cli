pragma Singleton
import QtQuick

QtObject {
    id: theme

    property bool dark: true
    property bool motionEnabled: true

    readonly property color canvas: dark ? "#0B101B" : "#F5F7FB"
    readonly property color sidebar: dark ? "#111929" : "#FFFFFF"
    readonly property color surface: dark ? "#161F2F" : "#FFFFFF"
    readonly property color surfaceHover: dark ? "#222E43" : "#F0F3FA"
    readonly property color border: dark ? "#2C394E" : "#DEE5EE"
    readonly property color primaryText: dark ? "#F3F6FC" : "#172034"
    readonly property color secondaryText: dark ? "#9DAEC6" : "#657188"
    readonly property color accent: dark ? "#8C83FF" : "#6556E8"
    readonly property color accentHover: dark ? "#A39AFF" : "#5140D4"
    readonly property color accentMuted: dark ? "#2B2949" : "#ECEAFF"
    readonly property color accentText: dark ? "#FFFFFF" : "#FFFFFF"
    readonly property color positive: dark ? "#57DFB5" : "#087D5D"

    readonly property int radiusS: 8
    readonly property int radiusM: 12
    readonly property int radiusL: 18
    readonly property int spaceS: 8
    readonly property int spaceM: 16
    readonly property int spaceL: 24
    readonly property int durationFast: motionEnabled ? 150 : 0
}
