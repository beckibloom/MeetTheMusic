'use strict';

function playNapster(responseJson, apikeyN) {
    // Napster JS

    const topTracksLink = responseJson.search.data.artists[0].links.topTracks.href

    const tracksTemplateSource = document.getElementById('tracks-template').innerHTML;
    const tracksTemplate = Handlebars.compile(tracksTemplateSource);

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
    console.log('The getTopTracks function ran.');
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

    fetch(searchURL)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error
            (response.statusText);
        })
        .then(responseJson => playNapster(responseJson, apikeyN))
        .finally(() => scrollToPlayer())
        .catch(err => {$('.js-napster-error').text(`Uh oh! Something went wrong. Here's what we know: ${err.message}`)})
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
    $('.artist-response').toggleClass('hidden');

    //Update the location displayed at the top of this section
    $('.location-submitted').text(`${locationDisplayName}`);

    //Use the data from the getEvents function to render the Event list in the browser
    console.log('The renderEventList function ran with response');
    console.log(responseJson);
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

        $('#events').append(`
        <li class="artist-result bottom">
        <p class="event-link"><a href="${eventLink}" target="_blank" class="event link">More info & buy tickets</a></p></li>`);
    }
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
                $('.js-event-error').text(`It looks like there are no events listed for your search. Refresh the page to try a new search.`);
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
        $('.location-select').toggleClass('hidden');
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
    $('.location-select').toggleClass('hidden');
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
        .then(responseJson => renderLocations(responseJson, location, dates, dateArray))
        .catch(err => {
            $('.js-error-message').text(`Uh oh! Something went wrong. Here's what we know: ${err.message}`);
        });
}

function watchForm() {
    // Listen for user to input location and dates and click submit
    console.log('The watchForm function ran.');
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

    $('.location-submit').click(function() {
        event.preventDefault();

        let locationInput = $('#location').val();
        console.log(`the value of location input is ${locationInput}`)
        if (locationInput.length <= 3) {
            $('.location').toggleClass('hidden');
            throw 'error';
        };

        let dateInputFirst = $('#day1').val();
        if (dateInputFirst.length < 2) {
            $('.dates').toggleClass('hidden');
            throw 'error';
        }

        let dateInputSecond = $('#day2').val();
        if (dateInputSecond.length < 2) {
            $('.dates').toggleClass('hidden');
            throw 'error';
        }

        let yearInputFirst = $('#year1').val();
        if (yearInputFirst.length < 4) {
            $('.dates').toggleClass('hidden');
            throw 'error';
        }

        let yearInputSecond = $('#year2').val();
        if (yearInputSecond.length < 4) {
            $('.dates').toggleClass('hidden');
            throw 'error';
        }

        let location = $('.location-input').val();
        // Creating the variable 'dates' as an array with two items for min_date and max_date
        // Songkick date format must be YYYY-MM-DD

        let date1 = `${$('#year1').val()}-${$('#month1').val()}-${$('#day1').val()}`;
        // console.log(new Date(date1).toISOString().getMonth() + 1);
        let date2 = `${$('#year2').val()}-${$('#month2').val()}-${$('#day2').val()}`;
        let dates = [date1,date2];
        //Run the getLocations function to get locations from Songkick with the form information

        let dateArray = [
            {month:$('#month1').val(),
            day:$('#day1').val(),
            year:$('#year1').val()},
            {month:$('#month2').val(),
            day:$('#day2').val(),
            year:$('#year2').val()}
        ]

        $('.landing-view').toggleClass('hidden');
        getLocations(location, dates, dateArray);
    });

    getStaffPicks();
    getTopAlbums();

    // console.log(moment.now);

    $('.landing-view').toggleClass('hidden');
};

function renderAlbumArt(oneAlbumURL) {
    $('#album-container').append(
        `<img class="album-image" src="${oneAlbumURL}">`
    );
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
                $('.js-error-message').text(`Uh oh! Something went wrong. Here's what we know: ${err.message}`)
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
            $('.js-error-message').text(`Uh oh! Something went wrong. Here's what we know: ${err.message}`)})
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
            $('.js-error-message').text(`Uh oh! Something went wrong. Here's what we know: ${err.message}`)})
}

watchForm();
