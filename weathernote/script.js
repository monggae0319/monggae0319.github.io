function display(data){
    console.log(data)
}

function getWeather(lat, lon) {
    fetch(`https://weather-aacbbrnvla-du.a.run.app/?lat=${lat}&lon=${lon}`)
        .then(res => res.json())   // 응답을 JSON으로 변환
        .then(data => {
            console.log(data);     // 여기서 콘솔 출력
        })
        .catch(err => {
            console.error(err);
        });
}

var test = {
    "success": true,
    "timezone": "KST",
    "responseTime": "2025-12-30T14:23:34.836+09:00",
    "body": {
        "location": {
            "grid": [
                60,
                126
            ],
            "coord": [
                37.54,
                126.96
            ],
            "text": "서울특별시 용산구 효창동"
        },
        "weather": {
            "now": {
                "basetime": "202512301400",
                "data": {
                    "wind": {
                        "dir": "305",
                        "speed": "3.1"
                    },
                    "rainType": "없음",
                    "humid": "22",
                    "rain": "0",
                    "temp": "3"
                }
            },
            "forecast": {
                "baseTime": "202512301330",
                "items": [
                    {
                        "forecastTime": "202512301400",
                        "data": {
                            "temp": "2",
                            "rain": "강수없음",
                            "rainType": "없음",
                            "sky": "맑음",
                            "humid": "20",
                            "wind": {
                                "dir": "295",
                                "speed": "3"
                            }
                        }
                    },
                    {
                        "forecastTime": "202512301500",
                        "data": {
                            "temp": "2",
                            "rain": "강수없음",
                            "rainType": "없음",
                            "sky": "맑음",
                            "humid": "20",
                            "wind": {
                                "dir": "291",
                                "speed": "3"
                            }
                        }
                    },
                    {
                        "forecastTime": "202512301600",
                        "data": {
                            "temp": "2",
                            "rain": "강수없음",
                            "rainType": "없음",
                            "sky": "맑음",
                            "humid": "25",
                            "wind": {
                                "dir": "297",
                                "speed": "3"
                            }
                        }
                    },
                    {
                        "forecastTime": "202512301700",
                        "data": {
                            "temp": "1",
                            "rain": "강수없음",
                            "rainType": "없음",
                            "sky": "맑음",
                            "humid": "35",
                            "wind": {
                                "dir": "303",
                                "speed": "3"
                            }
                        }
                    },
                    {
                        "forecastTime": "202512301800",
                        "data": {
                            "temp": "0",
                            "rain": "강수없음",
                            "rainType": "없음",
                            "sky": "맑음",
                            "humid": "45",
                            "wind": {
                                "dir": "307",
                                "speed": "3"
                            }
                        }
                    },
                    {
                        "forecastTime": "202512301900",
                        "data": {
                            "temp": "-1",
                            "rain": "강수없음",
                            "rainType": "없음",
                            "sky": "맑음",
                            "humid": "45",
                            "wind": {
                                "dir": "315",
                                "speed": "3"
                            }
                        }
                    }
                ]
            }
        },
        "warning": null
    }
}
display(test)
document.getElementById('test').addEventListener("click", function(){
    var lat = document.getElementById('lat').value;
    var lon = document.getElementById('lon').value;
    getWeather(lat, lon)
})


// https://weather-aacbbrnvla-du.a.run.app/?lat=35.8266&lon=127.1332

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

/* 상태 */
let sigunguData = null;

const selected = {
    city: null,
    gu: null,
    dong: null
};

/* 데이터 로드 */
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

/* 공통 */
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

/* 1️⃣ 시 */
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

/* 2️⃣ 구 */
function renderGu(city) {
    clearContainer();

    // 🔙 상위 → 시
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

/* 3️⃣ 동 */
function renderDong(dongList) {
    clearContainer();

    // 🔙 상위 → 구
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

/* 선택 버튼 */
selectBtn.addEventListener("click", () => {
    const result = [selected.city, selected.gu, selected.dong]
        .filter(Boolean)
        .join(" ");
    if(result.length == 0){
        alert('지역을 선택해주세요')
    }else{
        console.log("선택 결과:", result);
        closeSigunguList()
    }
});

function closeSigunguList(){
    document.getElementById('sigunguListBox').style = "display:none;"
}
document.getElementById('listCloseBtn').addEventListener("click", function(){
    closeSigunguList()
});
