import SettingsIframe from "./settings-iframe";


export default class Statistics {
    static main: () => void;
    static bindTime: () => void;
}


Statistics.main = async function() {
    await SettingsIframe.initUserSettings();
    Statistics.bindTime();
}


Statistics.bindTime = function() {
    const element = <HTMLElement>document.getElementById('statistics-time');

    // from seconds to hours.
    let time = SettingsIframe.userSettings.statistics.totalSecondsSpent / 3600;
    time = Math.floor(time);

    element.textContent = String(time);
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Statistics.main);
} else {
    Statistics.main();
}
