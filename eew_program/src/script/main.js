import { hideInfoOverlay, showInfoOverlay } from './map.js'
var infoBtn = document.getElementById('earthquake-info-btn-box');
var eewBtn = document.getElementById('eew-info-btn-box');
var tsunamiBtn = document.getElementById('tsunami-info-btn-box');
var settingBtn = document.getElementById('setting-info-btn-box');
var earthquakeInfo = document.getElementById('earthquake-info');
var eewInfo = document.getElementById('eew-info');
var tsunamiInfo = document.getElementById('tsunami-info');
var settingInfo = document.getElementById('setting-info');

function btnClear(){
    document.getElementById('earthquake-info-btn').classList.remove('clicked')
    document.getElementById('eew-info-btn').classList.remove('clicked')
    document.getElementById('tsunami-info-btn').classList.remove('clicked')
    document.getElementById('setting-info-btn').classList.remove('clicked')
    earthquakeInfo.style = 'display : none;'
    eewInfo.style = 'display : none;'
    tsunamiInfo.style = 'display : none;'
    settingInfo.style = 'display : none;'
    hideInfoOverlay()
}
export function gotoEarthquakeInfo(){
    btnClear();
    earthquakeInfo.style = 'display: block;'
    document.getElementById('earthquake-info-btn').classList.add('clicked');
    showInfoOverlay()
}
export function gotoEewInfo(){
    btnClear()
    eewInfo.style = 'display: block;'
    document.getElementById('eew-info-btn').classList.add('clicked')
}
export function gotoTsunamiInfo(){
    btnClear()
    tsunamiInfo.style = 'display: block;'
    document.getElementById('tsunami-info-btn').classList.add('clicked')
}
export function gotoSettingInfo(){
    btnClear()
    settingInfo.style = 'display: block;'
    document.getElementById('setting-info-btn').classList.add('clicked')
}
infoBtn.addEventListener('click', function(){
    gotoEarthquakeInfo()
});

eewBtn.addEventListener('click', function(){
    gotoEewInfo()
});

tsunamiBtn.addEventListener('click', function(){
    gotoTsunamiInfo()
});


settingBtn.addEventListener('click', function(){
    gotoSettingInfo()
});

export function MMDDHHMM(time){
    return `${time.slice(5,7)}월 ${time.slice(8,10)}일 ${time.slice(11,13)}:${time.slice(14,16)}`
};
