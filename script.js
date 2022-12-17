'use strict';

    const timeEl = document.getElementById('time');
    const dateEl = document.getElementById('date');
    const currentWeatherItemsEl = document.getElementById('current-weather-items');
    // const country = document.getElementById('country');
    // const cityEl = document.getElementById('city');
    const weatherForecastEl = document.getElementById('weather-forecast');
    const currentTempEl = document.getElementById('current-temp');

    const days = ['Sunday', 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const countrySelect = document.getElementById('country');
    const cirySelect = document.getElementById('city');
    var ciryList = [
        [{city:"Hokkaido", lat:43.43, long:142.93, timezone:"Asia%2FTokyo"},{city:"Tokyo", lat:35.69, long:139.69, timezone:"Asia%2FTokyo"},{city:"Nagoya", lat:35.18, long:136.91, timezone:"Asia%2FTokyo"},{city:"Ritto,Shiga", lat:35.03, long:136.00, timezone:"Asia%2FTokyo"},{city:"Osaka", lat:34.69, long:135.50, timezone:"Asia%2FTokyo"},{city:"Okinawa", lat:26.54, long:127.97, timezone:"Asia%2FTokyo"}],
        [{city:"London", lat:51.51, long:-0.13, timezone:"Europe%2FLondon"},{city:"Southampton", lat:50.90, long:-1.40, timezone:"Europe%2FLondon"},{city:"Manchester", lat:53.48, long:-2.24, timezone:"Europe%2FLondon"},{city:"Liverpool", lat:53.41, long:-2.98, timezone:"Europe%2FLondon"}],
        [{city:"Mindelo", lat:16.89, long:-24.98},{city:"Praia", lat:14.93, long:-23.51},{city:"São Filipe", lat:14.90, long:-24.50}],
        [{city:"Lisboa", lat:38.72, long:-9.13},{city:"Porto", lat:41.15, long:-8.61}],
    ];
    var timezoneList = [
        'Asia/Tokyo',  // 東京（日本）
        'Europe/London',  // ロンドン（イギリス）
        'Atlantic/Cape_Verde', // Cabo Verde
        'Europe/Lisbon', // ポルトガル（リスボン）
    ];
    
    // 国、都市が選択されたときの処理
    countrySelect.addEventListener('change', function() {
        // 画面中央、時間、日にちの値を取得
        setInterval(() => {
            if(this.value == "") return;
            var timezone = timezoneList[this.value];
            const time = new Date().toLocaleString('en-US', { timeZone: timezone });
            const timeOfLocal = new Date(time);
            const month = timeOfLocal.getMonth();
            const date = timeOfLocal.getDate();
            const day = timeOfLocal.getDay();
            const hour = timeOfLocal.getHours();
            const hoursIn12Hr = hour >= 13 ? hour %12: hour;
            const hours = hoursIn12Hr.toString().padStart(2,'0');
            const minutes = timeOfLocal.getMinutes().toString().padStart(2, '0');;
            const ampm = hour >=12 ? 'PM' : 'AM';

            timeEl.innerHTML = hours + ':' + minutes + '' + `<span id="am-pm">${ampm}</span>`;
            dateEl.innerHTML = days[day] + ', ' + date + ' ' + months[month];
        }, 1000);

        cirySelect.innerHTML = "";
        if(this.value == "") return;
        var list = ciryList[this.value];
        console.log(list);

        document.getElementById('city').innerHTML = '<option value="">Select your city</option>';
        for(var i = 0; i < list.length; i++) {
            var option = document.createElement('option');
            option.value = i;
            option.text = list[i].city;
            cirySelect.appendChild(option);
        }

        // 選択した都市の経度、緯度を取得
        cirySelect.addEventListener('change', function() {
            if(this.value == "") return;
            var lat = list[this.value].lat;
            var long = list[this.value].long;
            
            // open-meteoに接続
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;
            var ajax = new XMLHttpRequest();
            ajax.open('GET', url);
            ajax.send();

            ajax.onreadystatechange = function() {
                if (ajax.readyState === 4 && ajax.status === 200) {
                    var data = ajax.responseText;
                    var objData = JSON.parse(data);
                    console.log(objData);
                    
                    var daily = new Array(objData.daily);
                    var newDate = new Array(objData.daily.time);
                    console.log(newDate);

                    daily.forEach(function(forecast, index) {
                        const time = forecast.time;
                        // console.log(time);
                        
                        const weathercode = forecast.weathercode;
                        console.log(weathercode);
                        const weathercodeNumber = function(weathercode) {
                            if(weathercode === 0) return '01d'; // 0 : Clear Sky
                            if(weathercode <= 3) return '02d'; // 1-3 : Mainly clear, partly cloudy, and overcast
                            if(weathercode <= 48) return '02d';  // 45, 48 : Fog and depositing rime fog
                            if(weathercode <= 57) return '10d';  // 51, 53, 55 : Drizzle Light, Moderate And Dense Intensity ・ 56, 57 : Freezing Drizzle Light And Dense Intensity
                            if(weathercode <= 67) return '09d';  // 61, 63, 65 : Rain Slight, Moderate And Heavy Intensity ・66, 67 : Freezing Rain Light And Heavy Intensity
                            if(weathercode <= 77) return '13d';  // 71, 73, 75 : Snow Fall Slight, Moderate And Heavy Intensity ・ 77 : Snow Grains
                            if(weathercode <= 82) return '10d';  // 80, 81, 82 : Rain Showers Slight, Moderate And Violent
                            if(weathercode <= 86) return '13d';  // 85, 86 : Snow Showers Slight And Heavy
                            if(weathercode <= 99) return '11d';  // 95 : Thunderstorm Slight Or Moderate ・ 96, 99 : Thunderstorm With Slight And Heavy Hail
                            return '';
                        }
                        console.log(weathercodeNumber(weathercode[2]));
                        const temperature_max = forecast.temperature_2m_max;
                        const temperature_min = forecast.temperature_2m_min;
                        const sunrise = forecast.sunrise;
                        const sunriseT = sunrise.map( value => value.substr(-5));
                        const sunset = forecast.sunset;
                        const sunsetT = sunset.map( value => value.substr(-5) );
                        
                        const currentWeather = `
                            <div class="weather-icon">
                                <img src="http://openweathermap.org/img/wn/${weathercodeNumber(weathercode[0])}@2x.png" alt="weather icon" class="w-icon">
                            </div>
                            <div class="others" id="current-weather-items">
                                <div class="weather-item">
                                    <div class="weather-item-card">Maximum Temperature</div>
                                    <div class="weather-item-result">${temperature_max[0]}&#176; C</div>
                                </div>
                                <div class="weather-item">
                                    <div class="weather-item-card">Minimum Temperature</div>
                                    <div class="weather-item-result">${temperature_min[0]}&#176; C</div>
                                </div>
                                <div class="weather-item">
                                    <div class="weather-item-card">Sunrise</div>
                                    <div class="weather-item-result">${sunriseT[0]}</div>
                                </div>
                                <div class="weather-item">
                                    <div class="weather-item-card">Sunset</div>
                                    <div class="weather-item-result">${sunsetT[0]}</div>
                                </div>
                            </div>
                            `;
                            $('#current-weather-box').html(currentWeather);
                        const todaysWeather = `
                            <img src="http://openweathermap.org/img/wn/${weathercodeNumber(weathercode[0])}@2x.png" alt="weather icon" class="w-icon">
                            <div class="other">
                                <div class="today-text">TODAY</div>
                                <div class="day">${time[0]}</div>
                                <div class="temp">${temperature_max[0]}&#176; C / ${temperature_min[0]}&#176; C</div>
                            </div>
                        `;
                        $('#current-temp').html(todaysWeather);

                        
                         const weeklyWeather = `
                             <div class="weather-forecast-item">
                                 <div class="day">${time[1]}</div>
                                 <img src="http://openweathermap.org/img/wn/${weathercodeNumber(weathercode[1])}@2x.png" alt="weather icon" class="w-icon">
                                 <div class="temp">${temperature_max[1]}&#176; C / ${temperature_min[1]}&#176; C</div>
                             </div>
                             <div class="weather-forecast-item">
                                 <div class="day">${time[2]}</div>
                                 <img src="http://openweathermap.org/img/wn/${weathercodeNumber(weathercode[2])}@2x.png" alt="weather icon" class="w-icon">
                                 <div class="temp">${temperature_max[2]}&#176; C / ${temperature_min[2]}&#176; C</div>
                             </div>
                             <div class="weather-forecast-item">
                                 <div class="day">${time[3]}</div>
                                 <img src="http://openweathermap.org/img/wn/${weathercodeNumber(weathercode[3])}@2x.png" alt="weather icon" class="w-icon">
                                 <div class="temp">${temperature_max[3]}&#176; C / ${temperature_min[3]}&#176; C</div>
                             </div>
                             <div class="weather-forecast-item">
                                 <div class="day">${time[4]}</div>
                                 <img src="http://openweathermap.org/img/wn/${weathercodeNumber(weathercode[4])}@2x.png" alt="weather icon" class="w-icon">
                                 <div class="temp">${temperature_max[4]}&#176; C / ${temperature_min[4]}&#176; C</div>
                             </div>
                             <div class="weather-forecast-item">
                                 <div class="day">${time[5]}</div>
                                 <img src="http://openweathermap.org/img/wn/${weathercodeNumber(weathercode[5])}@2x.png" alt="weather icon" class="w-icon">
                                 <div class="temp">${temperature_max[5]}&#176; C / ${temperature_min[5]}&#176; C</div>
                             </div>
                         `;
                         $('#weather-forecast').html(weeklyWeather);
                    })
                    

                    
                    
                    
                } 
            }


        })
    })

    // getWeatherData();
    // function getWeatherData() {
    //     navigator.geolocation.getCurrentPosition((success) => {
    //         let {latitude, longitude} = success.coords;
    //         fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&appid=${API_KEY}`)
    //         .then(res => res.json()).then(data => {
    //             console.log(data);
    //             showWeatherData(data);
    //         })
    //     })
    // }

    // function showWeatherData(data)