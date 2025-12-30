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
function display(data){
    console.log(data)
    var nowWeather = data.body.weather.now;
    var forecastWeather = data.body.weather.forecast;

    document.getElementById('baseTime').textContent = `${(baseTime(nowWeather.basetime)).slice(10,)} 현재`
    console.log(baseTime(data.body.weather.now.basetime))
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
            console.log(item)
            var warnBox = document.createElement('span');
            console.log(item.type)
            warnBox.textContent = item.type;
            warnBox.style = `background-color: ${getColor(item.level)[0]}; color: ${getColor(item.level)[1]}; padding: 0.5rem 2rem; border-radius:5px; font-weight:600;`
            box.appendChild(warnBox)
        })
    }
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
    "responseTime": "2025-12-30T15:25:30.481+09:00",
    "body": {
        "location": {
            "grid": [
                67,
                140
            ],
            "coord": [
                38.1646509515925,
                127.415710898265
            ],
            "text": "강원특별자치도 철원군 서면 자등리"
        },
        "weather": {
            "now": {
                "basetime": "202512301500",
                "data": {
                    "wind": {
                        "dir": "225",
                        "speed": "2.6"
                    },
                    "rainType": "없음",
                    "humid": "29",
                    "rain": "0",
                    "temp": "0.2"
                }
            },
            "forecast": {
                "baseTime": "202512301430",
                "items": [
                    {
                        "forecastTime": "202512301500",
                        "data": {
                            "temp": "-3",
                            "rain": "강수없음",
                            "rainType": "없음",
                            "sky": "맑음",
                            "humid": "40",
                            "wind": {
                                "dir": "317",
                                "speed": "4"
                            }
                        }
                    },
                    {
                        "forecastTime": "202512301600",
                        "data": {
                            "temp": "-3",
                            "rain": "강수없음",
                            "rainType": "없음",
                            "sky": "맑음",
                            "humid": "40",
                            "wind": {
                                "dir": "316",
                                "speed": "4"
                            }
                        }
                    },
                    {
                        "forecastTime": "202512301700",
                        "data": {
                            "temp": "-3",
                            "rain": "강수없음",
                            "rainType": "없음",
                            "sky": "맑음",
                            "humid": "50",
                            "wind": {
                                "dir": "312",
                                "speed": "4"
                            }
                        }
                    },
                    {
                        "forecastTime": "202512301800",
                        "data": {
                            "temp": "-5",
                            "rain": "강수없음",
                            "rainType": "없음",
                            "sky": "맑음",
                            "humid": "60",
                            "wind": {
                                "dir": "293",
                                "speed": "3"
                            }
                        }
                    },
                    {
                        "forecastTime": "202512301900",
                        "data": {
                            "temp": "-6",
                            "rain": "강수없음",
                            "rainType": "없음",
                            "sky": "맑음",
                            "humid": "65",
                            "wind": {
                                "dir": "279",
                                "speed": "3"
                            }
                        }
                    },
                    {
                        "forecastTime": "202512302000",
                        "data": {
                            "temp": "-7",
                            "rain": "강수없음",
                            "rainType": "없음",
                            "sky": "구름 많음",
                            "humid": "75",
                            "wind": {
                                "dir": "277",
                                "speed": "3"
                            }
                        }
                    }
                ]
            }
        },
        "warning": {
            "warning": [
                {
                    "regId": "L1021300",
                    "type": "한파",
                    "level": "주의",
                    "order": "발표",
                    "issue": "202512302100",
                    "over": ""
                },
                {
                    "regId": "L1021300",
                    "type": "건조",
                    "level": "경보",
                    "order": "발표",
                    "issue": "202512302100",
                    "over": ""
                }
            ]
        }
    }
}
display(test)

document.getElementById('getLocation').addEventListener("click", function(){
    navigator.geolocation.getCurrentPosition((position) => {
        var lat = (position.coords.latitude).toFixed(2);
        var lon = (position.coords.longitude).toFixed(2);
        console.log(lat,lon)
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
        console.log("선택 결과:", result);
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
