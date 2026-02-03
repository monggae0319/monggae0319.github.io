function baseTime(time){
    return `${time.slice(0,4)}년 ${time.slice(4,6)}월 ${time.slice(6,8)}일 ${time.slice(8,10)}:${time.slice(10,12)}`
}
function getDir(deg){
    if (deg == null || isNaN(deg)) return null;

    // 0~360 정규화
    const normalized = ((deg % 360) + 360) % 360;

    const directions = [
        "북", "북북동", "북동", "동북동",
        "동", "동남동", "남동", "남남동",
        "남", "남남서", "남서", "서남서",
        "서", "서북서", "북서", "북북서"
    ];

    const index = Math.round(normalized / 22.5) % 16;
    return directions[index];
}
let bodyLoading = null;

function makeLoad() {
    const body = document.querySelector(".body");

    if (!bodyLoading) {
        bodyLoading = document.createElement("div");
        bodyLoading.className = "body-loading";

        const box = document.createElement("div");
        box.className = "loading-box";
        box.textContent = "로딩 중…";

        bodyLoading.appendChild(box);
        body.appendChild(bodyLoading);
    }

    bodyLoading.classList.remove("hidden");
}

function finLoad() {
    if (!bodyLoading) return;
    bodyLoading.classList.add("hidden");
}
function getSkyIcon(data){
    if(data.rainType == '없음'){
        
    }
}
function display(data){
    var nowWeather = data.body.weather.now;
    var forecastWeather = data.body.weather.forecast;

    document.getElementById('baseTime').textContent = `${(baseTime(nowWeather.basetime)).slice(10,)} 현재`
    document.getElementById('locationText').textContent = data.body.location.text;


    //현재 하늘
    if(nowWeather.data.rainType == '없음'){
        var sky = forecastWeather.items[0].data.sky;
        var skyImg = document.getElementById('nowSky');
        if(forecastWeather.items[0].data.raintype == '없음'){
            if(sky == '맑음'){
                skyImg.src = './icons/sunny.svg'
            }else if(sky == '구름 많음'){
                skyImg.src = './icons/partly_cloudy.svg'
            }else if(sky == '흐림'){
                skyImg.src = './icons/cloud.svg'
            }
        }else{
            var type = forecastWeather.items[0].data.rainType
            if(type == '비' || type == '빗방울'){
            skyImg.src = './icons/rain.svg'
            }else if(type == '비/눈'){
                skyImg.src = './icons/rainsnow.svg'
            }else if(type == '눈'){
                skyImg.src = './icons/snow.svg'
            }else if(type == '빗방울'){
                skyImg.src = './icons/rainylight.svg'
            }else if(type == '빗방울눈날림'){
                skyImg.src = './icons/mix.svg'
            }else if(type == '눈날림'){
                skyImg.src = './icons/snow.svg'
            }else{
                skyImg.src = './icons/sunny.svg'
            }
        }
    }else{
        var sky = nowWeather.data.rainType;
        if(sky == '비' || sky == '빗방울'){
            skyImg.src = './icons/rain.svg'
        }else if(sky == '비/눈'){
            skyImg.src = './icons/rainsnow.svg'
        }else if(sky == '눈'){
            skyImg.src = './icons/snow.svg'
        }else if(sky == '빗방울'){
            skyImg.src = './icons/rainylight.svg'
        }else if(sky == '빗방울눈날림'){
            skyImg.src = './icons/mix.svg'
        }else if(sky == '눈날림'){
            skyImg.src = './icons/snow.svg'
        }else{
            skyImg.src = './icons/sunny.svg'
        }
    }

    //현재 날씨
    document.getElementById('nowTemp').textContent = nowWeather.data.temp;
    document.getElementById('nowRain').textContent = nowWeather.data.rain + 'mm/h';
    document.getElementById('nowHumid').textContent = nowWeather.data.humid + '%';
    document.getElementById('nowWind').textContent = `${getDir(nowWeather.data.wind.dir)} ${nowWeather.data.wind.speed}m/s`;

    //기상특보
    var box = document.getElementById('warningBox');
    box.replaceChildren();
    if(data.body.warning != null){
        var warningData = data.body.warning.warning;
        function getColor(type){
            if(type == '경보'){
                return ['red', 'white']
            }else if(type == '주의'){
                return ['yellow', 'black']
            }else{
                return ['#00e5ff', "black"]
            }
        }
        warningData.forEach(item => {
            var warnBox = document.createElement('span');
            warnBox.textContent = item.type;
            warnBox.style = `background-color: ${getColor(item.level)[0]}; color: ${getColor(item.level)[1]}; padding: 0.5rem 2rem; border-radius:5px; font-weight:600;`
            box.appendChild(warnBox)
        })
    }

    //초단기예보
    const ultraSrtFcstBox = document.getElementById('ultraSrtFcstBox');
    const ultraSrtFcstData = data.body.weather.forecast;
    console.log(ultraSrtFcstData)
    document.getElementById('ultraSrtFcstBasetime').textContent = baseTime(ultraSrtFcstData.baseTime).slice(10,)
    ultraSrtFcstBox.replaceChildren();

    ultraSrtFcstData.items.forEach(element => {
        console.log(element)
        var box = document.createElement('div');
        box.className = 'ultraSrtFcstContent'

        var time = document.createElement('p');
        time.textContent = baseTime(element.forecastTime).slice(14, 16) + '시';
        time.className = 'ultraSrtFcstTime';
        box.appendChild(time);
        
        var temp = document.createElement('p');
        temp.textContent = element.data.temp + '°C'
        temp.className = 'ultraSrtFcstTemp';
        box.appendChild(temp)

        ultraSrtFcstBox.appendChild(box)
    });
}

function getWeather(lat, lon) {
    makeLoad()
    fetch(`https://weather-aacbbrnvla-du.a.run.app/?lat=${lat}&lon=${lon}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);   
            display(data);
        })
        .catch(err => {
            console.error(err);
        })
        .finally(() => {
            finLoad();
        });
}
function getWeatherSigungu(add){
    makeLoad()
    fetch(`https://geocoding-aacbbrnvla-du.a.run.app/?loc=${add}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);   
            display(data)
        })
        .catch(err => {
            console.error(err);
        })
        .finally(() => {
            finLoad();
        });
}
// getWeather(37.49, 126.91)
var test = {
    "success": true,
    "timezone": "KST",
    "responseTime": "2026-01-19T13:08:34.861+09:00",
    "body": {
        "location": {
            "grid": [
                59,
                125
            ],
            "coord": [
                37.49,
                126.91
            ],
            "text": "서울특별시 동작구 신대방동"
        },
        "weather": {
            "now": {
                "basetime": "202601191200",
                "data": {
                    "wind": {
                        "dir": "291",
                        "speed": "2.5"
                    },
                    "rainType": "없음",
                    "humid": "47",
                    "rain": "0",
                    "temp": "-4.1"
                }
            },
            "forecast": {
                "baseTime": "202601191230",
                "items": [
                    {
                        "forecastTime": "202601191300",
                        "data": {
                            "temp": "-3",
                            "rain": "강수없음",
                            "rainType": "없음",
                            "sky": "구름 많음",
                            "humid": "40",
                            "wind": {
                                "dir": "8",
                                "speed": "2"
                            }
                        }
                    },
                    {
                        "forecastTime": "202601191400",
                        "data": {
                            "temp": "-3",
                            "rain": "강수없음",
                            "rainType": "없음",
                            "sky": "맑음",
                            "humid": "35",
                            "wind": {
                                "dir": "10",
                                "speed": "2"
                            }
                        }
                    },
                    {
                        "forecastTime": "202601191500",
                        "data": {
                            "temp": "-3",
                            "rain": "강수없음",
                            "rainType": "없음",
                            "sky": "구름 많음",
                            "humid": "35",
                            "wind": {
                                "dir": "328",
                                "speed": "3"
                            }
                        }
                    },
                    {
                        "forecastTime": "202601191600",
                        "data": {
                            "temp": "-4",
                            "rain": "강수없음",
                            "rainType": "없음",
                            "sky": "구름 많음",
                            "humid": "30",
                            "wind": {
                                "dir": "318",
                                "speed": "5"
                            }
                        }
                    },
                    {
                        "forecastTime": "202601191700",
                        "data": {
                            "temp": "-6",
                            "rain": "강수없음",
                            "rainType": "없음",
                            "sky": "흐림",
                            "humid": "35",
                            "wind": {
                                "dir": "313",
                                "speed": "6"
                            }
                        }
                    },
                    {
                        "forecastTime": "202601191800",
                        "data": {
                            "temp": "-7",
                            "rain": "강수없음",
                            "rainType": "없음",
                            "sky": "흐림",
                            "humid": "35",
                            "wind": {
                                "dir": "315",
                                "speed": "6"
                            }
                        }
                    }
                ]
            }
        },
        "warning": {
            "warning": [
                {
                    "regId": "L1100300",
                    "type": "한파",
                    "level": "주의",
                    "order": "발표",
                    "issue": "202601192100",
                    "over": ""
                }
            ]
        }
    }
}
console.log(test)
display(test)

document.getElementById('getLocation').addEventListener("click", function(){
    navigator.geolocation.getCurrentPosition((position) => {
        var lat = (position.coords.latitude).toFixed(2);
        var lon = (position.coords.longitude).toFixed(2);
        getWeather(lat, lon)
    });
})

const box = document.getElementById("sigunguListBox");

/* 고정 요소 */
const closeBox = document.createElement('div');
closeBox.setAttribute('id', 'listCloseBox')
const closeImg = document.createElement('img')
closeImg.src = './icons/close.svg';
closeImg.setAttribute('id', 'listCloseBtn')
closeBox.appendChild(closeImg)
const pathText = document.createElement("p");
pathText.className = "selected-path";

const container = document.createElement("div");
container.className = "sigungu-container";

const selectBtn = document.createElement("p");
selectBtn.textContent = "선택";
selectBtn.className = 'selectBtn'
selectBtn.setAttribute('id', 'selectBtn')

box.appendChild(closeBox);
box.appendChild(pathText);
box.appendChild(container);
box.appendChild(selectBtn);

let sigunguData = null;

const selected = {
    city: null,
    gu: null,
    dong: null
};

document.getElementById('getSigungu').addEventListener("click", () => {
    fetch('./data/sigungu_list.json')
        .then(res => res.json())
        .then(data => {
            document.getElementById('sigunguListBox').style ="display:block;"
            sigunguData = data;
            resetSelected("city");
            renderCities();
            updatePath();
        })
        .catch(console.error);
});

function clearContainer() {
    container.replaceChildren();
}

function createButton(text, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = text;
    btn.addEventListener("click", onClick);
    return btn;
}

function updatePath() {
    const path = [selected.city, selected.gu, selected.dong]
        .filter(Boolean)
        .join(" ");
    pathText.textContent = path || "지역을 선택하세요";
}

function resetSelected(level) {
    if (level === "city") {
        selected.city = null;
        selected.gu = null;
        selected.dong = null;
    } else if (level === "gu") {
        selected.gu = null;
        selected.dong = null;
    } else if (level === "dong") {
        selected.dong = null;
    }
}

function renderCities() {
    clearContainer();

    Object.keys(sigunguData).forEach(city => {
        container.appendChild(
            createButton(city, () => {
                selected.city = city;
                resetSelected("gu");
                updatePath();
                renderGu(city);
            })
        );
    });
}

function renderGu(city) {
    clearContainer();

    container.appendChild(
        createButton("← 상위", () => {
            resetSelected("city");
            updatePath();
            renderCities();
        })
    );

    sigunguData[city].forEach(item => {
        const gu = Object.keys(item)[0];

        container.appendChild(
            createButton(gu, () => {
                selected.gu = gu;
                resetSelected("dong");
                updatePath();
                renderDong(item[gu]);
            })
        );
    });
}

function renderDong(dongList) {
    clearContainer();

    container.appendChild(
        createButton("← 상위", () => {
            resetSelected("dong");
            updatePath();
            renderGu(selected.city);
        })
    );

    dongList.forEach(dong => {
        container.appendChild(
            createButton(dong, () => {
                selected.dong = dong;
                updatePath();
            })
        );
    });
}

selectBtn.addEventListener("click", () => {
    const result = [selected.city, selected.gu, selected.dong]
        .filter(Boolean)
        .join(" ");
    if(result.length == 0){
        alert('지역을 선택해주세요')
    }else{
        getWeatherSigungu(result)
        closeSigunguList()
    }
});

function closeSigunguList(){
    document.getElementById('sigunguListBox').style = "display:none;"
}
document.getElementById('listCloseBtn').addEventListener("click", function(){
    closeSigunguList()
});
