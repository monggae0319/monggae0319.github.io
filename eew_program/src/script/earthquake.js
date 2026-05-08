import { gotoEarthquakeInfo, MMDDHHMM } from "./main.js";
import { earthquake } from 'https://cdn.jsdelivr.net/gh/monggae0319/jma-lang-ko/src/index.js';
import { drawOverlay } from "./map.js";

const test = await fetch(
    './src/script/testdata/sanriku.json'
).then(r => r.json());
const color = await fetch(
    './src/script/color.json'
).then(r => r.json());
console.log(color)

export function VXSE53(data){
    console.log(data)
    gotoEarthquakeInfo()
    document.getElementById('earthquake-info-title').textContent = '진원・진도정보';
    document.getElementById('earthquake-info-reportTime').textContent = MMDDHHMM(data.reportDateTime) + ' 발표';

    //해일 유무 판단
    if(data.body.comments.forecast.codes.includes('0215')){
        //해일 없음
        var tsunami_textbox = document.getElementById('earthquake-info-tsunami')
        tsunami_textbox.textContent = '해일 우려 없음';
        tsunami_textbox.style = 'background-color: gray;'
    }else{
        //해일 있을 가능성
        if(data.body.comments.forecast.codes.includes('0211')){
            var tsunami_textbox = document.getElementById('earthquake-info-tsunami')
            tsunami_textbox.textContent = '해일 정보 발표중';
            tsunami_textbox.style = 'background-color: red;'
        }
    }
    var maxInt = data.body.intensity.maxInt
    document.getElementById('earthquake-info-intmag-box').style = `background-color : ${color.intensity[maxInt]}; color : ${color.intensity_text[maxInt]}`
    document.getElementById('earthquake-info-int').textContent = maxInt;
    document.getElementById('earthquake-info-mag-type').textContent = data.body.earthquake.magnitude.unit;
    document.getElementById('earthquake-info-mag').textContent = data.body.earthquake.magnitude.value;

    document.getElementById('earthquake-info-originTime').textContent = MMDDHHMM(data.body.earthquake.originTime) + ' 발생';
    document.getElementById('earthquake-info-hypocenter').textContent = earthquake.AreaEpicenterKR(data.body.earthquake.hypocenter.code);
    var depth = '';
    var depthdata = data.body.earthquake.hypocenter.depth;
    console.log(depthdata)
    if(depthdata.condition){
        if(depthdata.condition == 'ごく浅い'){
            depth = '매우 얕음'
        }else if(depthdata.condition == '７００km以上'){
            depth = '700km 이상'
        }else{
            depth = '불명'
        }
    }else{
        depth = `${depthdata.value}km`
    }
    document.getElementById('earthquake-info-depth').textContent = `깊이 ${depth}`;
    var comments = [];
    var forecast = data.body.comments.forecast.codes;
    forecast.forEach(element => {
        comments.push(element)
    });
    var comvar = data.body.comments.var.codes;
    comvar.forEach(element => {
        if(element != "0262"){
            comments.push(element)
        }
    });
    comments.forEach(element => {
        document.getElementById('earthquake-info-comments').textContent += `${earthquake.AdditionalCommentEarthquakeKR(element)}\n`
    })
    
    //진도 정보
    var intRegionData = data.body.intensity.regions;
    console.log(intRegionData);
    drawOverlay(intRegionData);
}

VXSE53(test)
