'use strict';

function playNapster(responseJson, apikeyN) {
    // Napster JS

    const topTracksLink = responseJson.search.data.artists[0].links.topTracks.href;

    console.log(`inside playNapster function, topTracksLink is ${topTracksLink}`);

    const tracksTemplateSource = document.getElementById('tracks-template').innerHTML;
    const tracksTemplate = Handlebars.compile(tracksTemplateSource);

    console.log(tracksTemplate);

    const $tracks = $('#tracks-container');

    const getTopTracks = $.get(`${topTracksLink}?apikey=${apikeyN}`);

        getTopTracks
        .then((response) => {
            if (response.tracks.length === 0) {
                document.getElementById('tracks-container').innerHTML =
                    `<p class="error">There are no tracks available for this artist.</p>`
            }
            else {$tracks.html(tracksTemplate(response));}
        });
}

function getArtistObject(artist) {
    console.log('The getArtistObject function ran.');
    // 1 - Do a search query with Napster for the artist
    const apikeyN = 'MTE5OWJjOWQtOWQ5My00MmRjLWIyNmQtODkzMWY0ZjQxOTVl';
    const params = {
        apikey: apikeyN,
        query: artist,
        type: 'artist',
    }
    const queryString = formatQueryParams(params);
    const searchURL = 'https://api.napster.com/v2.2/search?' + queryString;
    console.log(`fetching data from URL ${searchURL}`);

    $('.js-napster-error').text(``);

    fetch(searchURL)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error
            (response.statusText);
        })
        .then(responseJson => {
            if (responseJson.meta.totalCount === 0){
                throw new Error
                (`This artist doesn't have any tracks available at this time.`)
            }
            return responseJson
        })
        .then(responseJson => playNapster(responseJson, apikeyN))
        .finally(() => scrollToPlayer())
        .catch(err => {$('.js-napster-error').text(`Uh oh! Something went wrong. Here's what we know: ${err.message}`)});
}

function scrollToPlayer() {
    let current = window.location.href;
    window.location.href = current.replace(/#(.*)$/, '') + '#musicplayer';
}

function watchArtists() {
    // Listen for user to click an artist option then run getTopTracks
    console.log('The watchArtists function ran.');
    $('#events').on('click', `.listen`, event => {
        event.preventDefault();
        const artist = event.currentTarget.innerText;
        $('.play-artist').text(artist);
        getArtistObject(artist);
        })
}

function getMoreEvents() {
    // Listen for the user to click the "see more events" button then run getEvents/renderEventList again for more items
    // NOT A PRIORITY
    console.log('The getMoreEvents function ran.');

}

function renderEventList(responseJson, locationDisplayName) {
    $('.artist-response').toggleClass('hidden animated animatedFadeInUp fadeInUp');

    //Update the location displayed at the top of this section
    $('.location-submitted').text(`${locationDisplayName}`);

    //Use the data from the getEvents function to render the Event list in the browser
    console.log('The renderEventList function ran with response');
    console.log(responseJson);

    if (responseJson.resultsPage.totalEntries === 0) {
        $('.no-events-available').toggleClass('hidden animated animatedFadeInUp fadeInUp');
    }

    for (let i = 0; i < responseJson.resultsPage.results.event.length; i++){
        let concertName = `${responseJson.resultsPage.results.event[i].displayName}`;
        let venue = `${responseJson.resultsPage.results.event[i].venue.displayName}`;
        let date = `${responseJson.resultsPage.results.event[i].start.date}`;
        let eventLink = `${responseJson.resultsPage.results.event[i].uri}`;

         $('#events').append(
             `<li class="artist-result top">
                <p class="artist-name">${concertName}</p></li>`);

        for (let j = 0; j < responseJson.resultsPage.results.event[i].performance.length; j++){
            let artist = `${responseJson.resultsPage.results.event[i].performance[j].artist.displayName}`;
            $('#events').append(
                `<li class="artist-result middle">
                <p><button class="listen">
                <img src="images/playbutton.png" class="playbutton">
                ${artist}</button></p></li>`
            );
        }

        $('#events').append(`
        <li class="artist-result bottom">
        <p class="event-link"><a href="${eventLink}" target="_blank" class="event link">More info & buy tickets</a></p></li>`);
    };

    // $('#events').append(
    //     `<li class="artist-result request-more">
    //         <button class="see-more">See more events</button>
    //     </li>`
    // )
    watchArtists();
}

function getEvents(id, locationDisplayName, dates) {
    // Use the location ID from user location selection to fetch event data for their indicated dates
    console.log(`The getEvents function ran with location ID ${id}.`);
    const date_min = dates[0];
    const date_max = dates[1];
    let params = {
        apikey: `c7qHSQfxsiGbcNRd`,
        location: `sk:${id}`,
        min_date: `${date_min}`,
        max_date: `${date_max}`,
        type: 'Concert',
        per_page: 10
    };
    const queryString = formatQueryParams(params);
    const url = `https://api.songkick.com/api/3.0/events.json?` + queryString;
    console.log(`The getEvents function is fetching data from URL ${url}`);

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error
            (response.statusText);
        })
        .then(responseJson => renderEventList(responseJson, locationDisplayName))
        .catch(err => {
            if (responseJson.totalEntries === 0) {
                $('.js-event-error').text(`It looks like there are no events listed for your search.`);
            }
            $('.js-event-error').text(`Uh oh! Something went wrong. Here's what we know: ${err.message}`);
    });
}

function getItemIdFromElement(item) {
    return $(item)
        .closest('button')
        .data('item-id');
}

function watchLocations(dates) {
    // Listen for user to click a location option (event delegation) and get the location ID from user selection
    console.log('The wachLocations function ran.');
    $('#locations').on('click', `.location-result`, event => {
        event.preventDefault();
        const id = getItemIdFromElement(event.currentTarget);
        console.log(`A location option with id ${id} was selected.`)
        let locationDisplayName = event.currentTarget.innerText;
        console.log(`locationDisplayName is ${locationDisplayName}`);
        $('.location-select').toggleClass('hidden animated animatedFadeInUp fadeInUp');
        getEvents(id, locationDisplayName, dates);
    })
}

function renderDates(dates, dateArray) {
    // Render the dates the user has submitted in the browser heading
    console.log(`The renderDates function ran with dates = ${dates} and dateArray is`);
    console.log(dateArray);

    const monthsArray = [
        "",
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ]

    const startMonth = monthsArray[parseInt(dateArray[0].month,10)];
    const endMonth = monthsArray[parseInt(dateArray[1].month,10)];

    // console.log(`The first month in the first object in dateArray is ${monthsArray[startMonth]}`);
    // console.log(`The end month in the first object in dateArray is ${monthsArray[endMonth]}`);


    $('.date-submitted').text(`${startMonth} ${dateArray[0].day}, ${dateArray[0].year} to ${endMonth} ${dateArray[1].day}, ${dateArray[1].year}`);
}

function renderLocations(responseJson, location, dates, dateArray) {
    $('.landing-view').toggleClass('hidden animated animatedFadeInUp fadeInUp');
    $('.location-select').toggleClass('hidden animated animatedFadeInUp fadeInUp');

    renderDates(dates, dateArray);

    // Use data from Songkick to render a list of location options for user to select
    console.log(`The renderLocations function ran with location ${location}, dates ${dates}, and responseJson was:`);
    console.log(responseJson)

    for (let i = 0; i < responseJson.resultsPage.results.location.length; i++) {
        const state = responseJson.resultsPage.results.location[i].city.state ? responseJson.resultsPage.results.location[i].city.state.displayName + ',' : ''
        $('#locations').append(
            `<button class="location-result" data-item-id="${responseJson.resultsPage.results.location[i].metroArea.id}">
            ${responseJson.resultsPage.results.location[i].city.displayName}, 
            ${state} 
            ${responseJson.resultsPage.results.location[i].city.country.displayName}
            </button>`)};
    watchLocations(dates);
}

function formatQueryParams(params) {
    const queryItems = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

function getLocations(location, dates, dateArray) {
    // Use Songkick API to fetch location options
    console.log(`The getLocations function ran with location = ${location} and dates = 
    ${dates}`);

    const apikeySK = 'c7qHSQfxsiGbcNRd';
    const params = {
        apikey: apikeySK,
        query: location,
        page:1,
        per_page:5,
    }
    const queryString = formatQueryParams(params);
    const url = 'https://api.songkick.com/api/3.0/search/locations.json?' + queryString;
    console.log(`fetching data from URL ${url}`);

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error
            (response.statusText);
        })
        .then(responseJson => {
            if (responseJson.resultsPage.totalEntries === 0) {
                throw new Error
                (`Sorry, we can't find any location that matches your search. Please try again.`)
            }
            return responseJson;
        })
        .then(responseJson => renderLocations(responseJson, location, dates, dateArray))
        .catch(err => {
            $('.js-error-message').text(`Uh oh! Something went wrong. Here's what we know: ${err.message}`);
        });
}

// function validatedate(inputText)
//   {
//   var dateformat = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
//   // Match the date format through regular expression
//   if(inputText.value.match(dateformat))
//   {
//   document.form1.text1.focus();
//   //Test which seperator is used '/' or '-'
//   var opera1 = inputText.value.split('/');
//   var opera2 = inputText.value.split('-');
//   lopera1 = opera1.length;
//   lopera2 = opera2.length;
//   // Extract the string into month, date and year
//   if (lopera1>1)
//   {
//   var pdate = inputText.value.split('/');
//   }
//   else if (lopera2>1)
//   {
//   var pdate = inputText.value.split('-');
//   }
//   var dd = parseInt(pdate[0]);
//   var mm  = parseInt(pdate[1]);
//   var yy = parseInt(pdate[2]);
//   // Create list of days of a month [assume there is no leap year by default]
//   var ListofDays = [31,28,31,30,31,30,31,31,30,31,30,31];
//   if (mm==1 || mm>2)
//   {
//   if (dd>ListofDays[mm-1])
//   {
//   alert('Invalid date format!');
//   return false;
//   }
//   }
//   if (mm==2)
//   {
//   var lyear = false;
//   if ( (!(yy % 4) && yy % 100) || !(yy % 400)) 
//   {
//   lyear = true;
//   }
//   if ((lyear==false) && (dd>=29))
//   {
//   alert('Invalid date format!');
//   return false;
//   }
//   if ((lyear==true) && (dd>29))
//   {
//   alert('Invalid date format!');
//   return false;
//   }
//   }
//   }
//   else
//   {
//   alert("Invalid date format!");
//   document.form1.text1.focus();
//   return false;
//   }
//   }


function renderAlbumArt(oneAlbumURL) {
    $('#album-container').append(
        `<img class="album-image" src="${oneAlbumURL}">`
    );

    $('#album-container').addClass('load');
    // let myElement = document.querySelector("body");
    // myElement.style.background="purple";
}

function getOneAlbum(responseJson) {
    let oneAlbumArt = $.grep(responseJson.images, function(image) {
        return image.width == 170;
    });
    let oneAlbumURL = oneAlbumArt[0].url;
    renderAlbumArt(oneAlbumURL);
}

function getAlbumArt(responseJson) {
    for (let i = 0; i < responseJson.albums.length; i++) {
        let url = `${responseJson.albums[i].links.images.href}?apikey=MTE5OWJjOWQtOWQ5My00MmRjLWIyNmQtODkzMWY0ZjQxOTVl`;

        fetch(url)
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error
                (response.statusText);})
            .then(responseJson => getOneAlbum(responseJson))
            .catch(err => {
                $('.js-error-message').text(`
                Uh oh! Something went wrong. Here's what we know: ${err.message}`)
            })
    }
}

function getStaffPicks() {
    let url = 'https://api.napster.com/v2.2/albums/picks?apikey=MTE5OWJjOWQtOWQ5My00MmRjLWIyNmQtODkzMWY0ZjQxOTVl';

    fetch(url) 
        .then(response =>  {
            if (response.ok) {
                return response.json();
            }
            throw new Error
            (response.statusText);})
        .then(responseJson => getAlbumArt(responseJson))
        .catch(err => {
            $('.js-error-message').text(`
            Uh oh! Something went wrong. Here's what we know: ${err.message}`)})
}

function getTopAlbums() {
    let url = 'https://api.napster.com/v2.2/albums/top?apikey=MTE5OWJjOWQtOWQ5My00MmRjLWIyNmQtODkzMWY0ZjQxOTVl';

    fetch(url) 
        .then(response =>  {
            if (response.ok) {
                return response.json();
            }
            throw new Error
            (response.statusText);})
        .then(responseJson => getAlbumArt(responseJson))
        .catch(err => {
            $('.js-error-message').text(`
            Uh oh! Something went wrong. Here's what we know: ${err.message}`)})
}

function updateFormValues() {
    console.log(`Function updateFormValues ran.`)
    $('#day1').on('blur', function() {
        let str = document.getElementById('day1').value;
        console.log(`Value of string is ${str}`);
        document.getElementById('day1').value = str.padStart(2, "0");
    })

    $('#day2').on('blur', function() {
        let str = document.getElementById('day2').value;
        console.log(`Value of string is ${str}`);
        document.getElementById('day2').value = str.padStart(2, "0");
    })

    $('#year1').on('blur', function() {
        let str = document.getElementById('year1').value;
        console.log(`Value of string is ${str}`);
        document.getElementById('year1').value = str.padStart(4, "20");
    })

    $('#year2').on('blur', function() {
        let str = document.getElementById('year2').value;
        console.log(`Value of string is ${str}`);
        document.getElementById('year2').value = str.padStart(4, "20");
    })
}

function watchForm() {
    // Listen for user to input location and dates and click submit
    console.log('The watchForm function ran.');

    // window.addEventListener('DOMContentLoaded', (event) => {
    //     console.log('DOM fully loaded and parsed');
    //     $('#album-container').toggleClass('hidden');
    // });

    updateFormValues();

    $('.location-submit').click(function() {
        event.preventDefault();

        let date1string = `${$('#year1').val()}-${$('#month1').val()}-${$('#day1').val()}`;
        let date1 = new Date($('#year1').val(), ($('#month1').val()-1), $('#day1').val());

        // console.log(new Date(date1).toISOString().getMonth() + 1);
        const date2string = `${$('#year2').val()}-${$('#month2').val()}-${$('#day2').val()}`;
        const date2 = new Date($('#year2').val(), ($('#month2').val()-1), $('#day2').val());

        let today = new Date();
        let dd = today.getDate();
        let mm = today.getMonth()+1; //As January is 0.
        let yyyy = today.getFullYear();
        // const todayString = `${yyyy}-${mm}-${dd}`;

        let dates = [date1string,date2string];
        //Run the getLocations function to get locations from Songkick with the form information

        let curdate = function(sp){            
            if(dd<10) dd='0'+dd;
            if(mm<10) mm='0'+mm;
            return (yyyy+sp+mm+sp+dd);
        };

        let curmonth = function(){
            return (mm);
        };

        let curyear = function(){
            return (yyyy);
        };

        console.log(`Current month is ${curmonth()}`);
        console.log(`Current year is ${curyear()}`);
        console.log(`Current date is ${curdate('-')}`);

        let locationInput = $('#location').val();
        console.log(`the value of location input is ${locationInput}`)
        if (locationInput.length <= 3) {
            $('.location').toggleClass('hidden');
            throw 'error';
        };

        const parsedDate1 = Date.parse(date1string);
        const parsedDate2 = Date.parse(date2string);

        console.log(`date1string with the PARSE method returns ${parsedDate1}`);

        if (isNaN(parsedDate1)) {
            $('.dates').toggleClass('hidden');
            throw 'error';
        }

        if (isNaN(parsedDate2)) {
            $('.dates').toggleClass('hidden');
            throw 'error';
        }


        if (date1 < today) {
            console.log(`Today's date is greater than date1`)
            $('.dates').toggleClass('hidden');
            throw 'error';
        };

        if (date2 < today) {
            console.log(`Today's date is greater than date2`)
            $('.dates').toggleClass('hidden');
            throw 'error';
        };
        
        if (date2 < date1) {
            console.log(`date1 is greater than date2`)
            $('.dates').toggleClass('hidden');
            $('.dates').append('<p>Date 1 must be earlier or the same as date 2.</p>');
            throw 'error';
        };

        let location = $('.location-input').val();
        // Creating the variable 'dates' as an array with two items for min_date and max_date
        // Songkick date format must be YYYY-MM-DD

        let dateArray = [
            {month:$('#month1').val(),
            day:$('#day1').val(),
            year:$('#year1').val()},
            {month:$('#month2').val(),
            day:$('#day2').val(),
            year:$('#year2').val()}
        ]

        getLocations(location, dates, dateArray);
    });

    getStaffPicks();
    getTopAlbums();

    // console.log(moment.now);

    $('.landing-view').toggleClass('hidden');
};

watchForm();
