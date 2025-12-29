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

document.getElementById('test').addEventListener("click", function(){
    var lat = document.getElementById('lat').value;
    var lon = document.getElementById('lon').value;
    getWeather(lat, lon)
})


// https://weather-aacbbrnvla-du.a.run.app/?lat=35.8266&lon=127.1332