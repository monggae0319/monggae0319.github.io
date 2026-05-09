import { gotoEarthquakeInfo, MMDDHHMM } from "./main.js";
import { earthquake } from 'https://cdn.jsdelivr.net/gh/monggae0319/jma-lang-ko/src/index.js';
import { drawIntOverlay, moveToLatLon, fitIntensityRegions, addImageAtLatLon, clearMapImages } from "./map.js";

const data = await fetch(
    './src/script/testdata/now.json'
).then(r => r.json());
const color = await fetch(
    './src/script/color.json'
).then(r => r.json());
console.log(color)
export function groupByMaxInt(data) {
    const grouped = {};
    data.forEach(item => {
        const key = item.maxInt;
        if (!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key].push(item);
    });

    const order = {
        "1": 1,
        "2": 2,
        "3": 3,
        "4": 4,
        "5-": 5,
        "5+": 6,
        "6-": 7,
        "6+": 8,
        "7": 9
    };

    return Object.entries(grouped)

        .sort(
            (a, b) =>
                order[b[0]] -
                order[a[0]]
        )

        .map(([maxInt, regions]) => ({
            maxInt,
            regions
        }));
}

var earthquakeInfoTitle = document.getElementById('earthquake-info-title');
var earthquakeInfoReportTime = document.getElementById('earthquake-info-reportTime');
var earthquakeInfoIntmagBox = document.getElementById('earthquake-info-intmag-box')
var earthquakeInfoInt = document.getElementById('earthquake-info-int');
var earthquakeInfoMagType = document.getElementById('earthquake-info-mag-type');
var earthquakeInfoMag = document.getElementById('earthquake-info-mag');
var earthquakeInfoOriginTime = document.getElementById('earthquake-info-originTime');
var earthquakeInfoHypocenter = document.getElementById('earthquake-info-hypocenter');
var earthquakeInfoDepth = document.getElementById('earthquake-info-depth');
const intInfoAreaBox = document.getElementById('earthquake-info-intinfo-areabox');
const intInfoCityBox = document.getElementById('earthquake-info-intinfo-citybox');

function getComments(items){
    document.getElementById('earthquake-info-comments').textContent = ''
    var comments = [];
    var forecast = items.forecast.codes;
    forecast.forEach(element => {
        comments.push(element)
    });
    if(items.var){
        var comvar = items.var.codes;
        comvar.forEach(element => {
            if(element != "0262"){
                comments.push(element)
            }
        });
    }
    comments.forEach(element => {
        document.getElementById('earthquake-info-comments').textContent += `${earthquake.AdditionalCommentEarthquakeKR(element)}\n`
    })
}

export function VXSE53(data){
    console.log(data)
    gotoEarthquakeInfo()
    earthquakeInfoTitle.textContent = '진원・진도정보';
    earthquakeInfoReportTime.textContent = MMDDHHMM(data.reportDateTime) + ' 발표';

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
    earthquakeInfoIntmagBox.style = `background-color : ${color.intensity[maxInt]}; color : ${color.intensity_text[maxInt]}`
    earthquakeInfoInt.textContent = maxInt;
    earthquakeInfoMagType.textContent = data.body.earthquake.magnitude.unit;
    earthquakeInfoMag.textContent = data.body.earthquake.magnitude.value;

    earthquakeInfoOriginTime.textContent = MMDDHHMM(data.body.earthquake.originTime) + ' 발생';
    earthquakeInfoHypocenter.textContent = earthquake.AreaEpicenterKR(data.body.earthquake.hypocenter.code);
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
    earthquakeInfoDepth.textContent = `깊이 ${depth}`;
    getComments(data.body.comments)

    //진앙 마크
    var lat = data.body.earthquake.hypocenter.coordinate.latitude.value;
    var lon = data.body.earthquake.hypocenter.coordinate.longitude.value;
    moveToLatLon(lat, lon, 3000)
    const hypocenterIcon = new Image();
    hypocenterIcon.src = './src/icons/hypocenter.png';
    hypocenterIcon.onload = () => {
        addImageAtLatLon(
            hypocenterIcon,
            lat,
            lon,
            35
        );
    };
    
    //진도 정보
    var intRegionData = data.body.intensity.regions;
    var intCitiesData = data.body.intensity.cities;
    console.log(intRegionData);
    console.log(intCitiesData);
    drawIntOverlay(intRegionData);
    clearMapImages();
    fitIntensityRegions(intRegionData);

    var intRegionDataGroup = groupByMaxInt(intRegionData);
    var intCitiesDataGroup = groupByMaxInt(intCitiesData);
    console.log(intRegionDataGroup)
    
    while (intInfoAreaBox.firstChild) {
        intInfoAreaBox.removeChild(intInfoAreaBox.firstChild);
    }
    while (intInfoCityBox.firstChild) {
        intInfoCityBox.removeChild(intInfoCityBox.firstChild);
    }
    intRegionDataGroup.forEach(element => {
        console.log(element)
        var intBox = document.createElement('div');
        intBox.className = 'earthquake-info-intinfo-area';

        var inti = document.createElement('div');
        inti.className = 'earthquake-info-intinfo-class'
        var int = document.createElement('h4');
        int.textContent = `진도 ${element.maxInt}`;
        int.style = `background-color: ${color.intensity[element.maxInt]}; color: ${color.intensity_text[element.maxInt]}`
        inti.appendChild(int)
        intBox.appendChild(inti)


        var intTextBox = document.createElement('div')
        intTextBox.className = 'earthquake-info-intinfo-area-text';

        element.regions.forEach(items => {
            var intText = document.createElement('p');
            intText.textContent = earthquake.AreaForecastLocalEKR(items.code);
            intTextBox.appendChild(intText)
        })

        intBox.appendChild(intTextBox)

        intInfoAreaBox.appendChild(intBox);
    })
    intCitiesDataGroup.forEach(element => {
        console.log(element);
        var intBox = document.createElement('div');
        intBox.className = 'earthquake-info-intinfo-city';

        var inti = document.createElement('div');
        inti.className = 'earthquake-info-intinfo-class'
        var int = document.createElement('h4');
        int.textContent = `진도 ${element.maxInt}`;
        int.style = `background-color: ${color.intensity[element.maxInt]}; color: ${color.intensity_text[element.maxInt]}`
        inti.appendChild(int)
        intBox.appendChild(inti)


        var intTextBox = document.createElement('div')
        intTextBox.className = 'earthquake-info-intinfo-city-text';

        element.regions.forEach(items => {
            var intText = document.createElement('p');
            intText.textContent = earthquake.AreaInformationCityKR(items.code);
            intTextBox.appendChild(intText)
        })

        intBox.appendChild(intTextBox)

        intInfoCityBox.appendChild(intBox);
    })
}
export function VXSE51(data){
    gotoEarthquakeInfo();
    clearMapImages();
    
    earthquakeInfoTitle.textContent = `진도속보`;
    earthquakeInfoReportTime.textContent = MMDDHHMM(data.reportDateTime) + ' 발표';var tsunami_textbox = document.getElementById('earthquake-info-tsunami')
    tsunami_textbox.textContent = '해일 조사중';
    tsunami_textbox.style = 'background-color: gray;'


    var maxInt = data.body.intensity.maxInt
    earthquakeInfoIntmagBox.style = `background-color : ${color.intensity[maxInt]}; color : ${color.intensity_text[maxInt]}`;
    earthquakeInfoInt.textContent = maxInt;
    earthquakeInfoMagType.textContent = '';
    earthquakeInfoMag.textContent = '조사중';

    earthquakeInfoOriginTime.textContent = MMDDHHMM(data.targetDateTime) + ' 검지';
    earthquakeInfoHypocenter.textContent = '진앙 조사중';
    earthquakeInfoDepth.textContent = '깊이 조사중';
    getComments(data.body.comments)

    var intRegionData = data.body.intensity.regions;
    drawIntOverlay(intRegionData);
    clearMapImages();
    fitIntensityRegions(intRegionData);

    var intRegionDataGroup = groupByMaxInt(intRegionData);
    while (intInfoAreaBox.firstChild) {
        intInfoAreaBox.removeChild(intInfoAreaBox.firstChild);
    }
    while (intInfoCityBox.firstChild) {
        intInfoCityBox.removeChild(intInfoCityBox.firstChild);
    }
    intRegionDataGroup.forEach(element => {
        console.log(element)
        var intBox = document.createElement('div');
        intBox.className = 'earthquake-info-intinfo-area';

        var inti = document.createElement('div');
        inti.className = 'earthquake-info-intinfo-class'
        var int = document.createElement('h4');
        int.textContent = `진도 ${element.maxInt}`;
        int.style = `background-color: ${color.intensity[element.maxInt]}; color: ${color.intensity_text[element.maxInt]}`
        inti.appendChild(int)
        intBox.appendChild(inti)


        var intTextBox = document.createElement('div')
        intTextBox.className = 'earthquake-info-intinfo-area-text';

        element.regions.forEach(items => {
            var intText = document.createElement('p');
            intText.textContent = earthquake.AreaForecastLocalEKR(items.code);
            intTextBox.appendChild(intText)
        })

        intBox.appendChild(intTextBox)

        intInfoAreaBox.appendChild(intBox);
    })
}

export function VXSE52(data){
    gotoEarthquakeInfo();
    clearMapImages();
    
    earthquakeInfoTitle.textContent = `진원에 관한 정보`;
    earthquakeInfoReportTime.textContent = MMDDHHMM(data.reportDateTime) + ' 발표';
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

    earthquakeInfoMagType.textContent = data.body.earthquake.magnitude.unit;
    earthquakeInfoMag.textContent = data.body.earthquake.magnitude.value;

    earthquakeInfoOriginTime.textContent = MMDDHHMM(data.targetDateTime) + ' 발생';
    earthquakeInfoHypocenter.textContent = earthquake.AreaEpicenterKR(data.body.earthquake.hypocenter.code);
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
    earthquakeInfoDepth.textContent = `깊이 ${depth}`;
    getComments(data.body.comments);
    //진앙 마크
    var lat = data.body.earthquake.hypocenter.coordinate.latitude.value;
    var lon = data.body.earthquake.hypocenter.coordinate.longitude.value;
    moveToLatLon(lat, lon, 3000)
    const hypocenterIcon = new Image();
    hypocenterIcon.src = './src/icons/hypocenter.png';
    hypocenterIcon.onload = () => {
        addImageAtLatLon(
            hypocenterIcon,
            lat,
            lon,
            35
        );
    };
    moveToLatLon(lat, lon, 4500)
}

VXSE53(data)