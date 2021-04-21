// French version to be replaced with intl module
var weekDays = ["DIMANCHE", "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];
var yearMonths = ["JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN", "JUILLET", "AOÛT",
    "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE"];
var dayMoments = ["matin", "avant-midi", "après-midi", "soir"];

var GoogleAuth; // shortcut for API



/**
 * Header composition and display
 */
loopHeader();

function loopHeader() {
    const headInterval = 1 * 60000; // Header refersh interval in minutes
    dispHeader();
    headerIntervalID = setInterval(dispHeader, headInterval);
}
function dispHeader() {
    // handle the Header part of the page

    var now = new Date();
    const year = now.getFullYear(), month = now.getMonth(), date = now.getDate();
    const day = now.getDay(), hour = now.getHours(), sec = now.getSeconds();
    var min = now.getMinutes(); // var because manipulated in the funtion
    var dayMoment = "";

    // day moment definition
    if (hour < 9) { dayMoment = dayMoments[0]; }
    else if (hour < 12) { dayMoment = dayMoments[1] }
    else if (hour > 18) { dayMoment = dayMoments[3]; }
    else if (hour > 13) { dayMoment = dayMoments[2]; }
    if (Number(min) < 10) { min = "0" + min; }

    // 1st line
    document.getElementById("firstLine").innerHTML =
        `<span class="highlight">${weekDays[day]}</span> ${dayMoment}`;

    // 2nd line
    document.getElementById("secondLine").innerHTML =
        `<span class="highlight">${hour}:${min}</span> ${date} ${yearMonths[month]} ${year}`
    // hour + ":" + min + ":" + sec + " " + dayMoment;  // to debug with seconds
}



function handleClientLoad() {
    // Loads the API's client and auth2 modules
    // then calls the initClient function
    gapi.load('client:auth2', initClient);
}

function initClient() {
    //Initializes the API client library (crendentials from CoolDashBord developper Console)
    //then sets up sign-in state listeners
    gapi.client.init({
        apiKey: 'AIzaSyBDcPRIKUneAEh1OzqO8i0TfU_fzOOMbzM',
        clientId: '852314254764-osbdrq5dg727tm16vh9n1ahcsr4h9ieo.apps.googleusercontent.com',
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        scope: "https://www.googleapis.com/auth/calendar.events.readonly"
    }).then(function () {
        GoogleAuth = gapi.auth2.getAuthInstance();

        dispAfterSignIn(GoogleAuth.isSignedIn.get()); // check signin and start display

    }, function (error) {
        appendPre(JSON.stringify(error, null, 2));
    });
}

function dispAfterSignIn(isSignedIn) {
    //     // insure the first signin, then only display the list of messages
    if (!isSignedIn) {
        GoogleAuth.signIn().then(loopMessages);
    } else {
        loopMessages();
    }
}

function loopMessages() {
    const fetchInterval = 5 * 60000; // Messages refersh interval, convert min into ms
    dispMessages();
    const createClock = setInterval(dispMessages, fetchInterval);
}


function dispMessages() {

    // variable required to get the active events
    var tMin = new Date();
    var tMax = new Date();
    tMax.setMinutes(tMax.getMinutes() + 1); // timeMax has to be > timeMin for the GAPI

    gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'maxResults': 10,
        'orderBy': 'startTime',
        'showDeleted': false,
        'singleEvents': true,
        'timeMin': tMin.toISOString(), // mky: Date has to be an object with new
        'timeMax': tMax.toISOString(),
    }).then(function (response) {
        var events = response.result.items;  // MKy: The array of Event-objects
        document.getElementById("messages").innerHTML ="";
        
        if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
                var para = document.createElement("P");
                para.innerHTML = events[i].summary;
                document.getElementById("messages").appendChild(para);
            }
        }
    });
}


// events is an array of objects. try to sort by endTime (cannot use endTime in the list)
// controler les overflow (si pas de place sur la page)
// Attention à mettre à jour les token
// inverser les couleurs jour et nuit ou plus fréquent pour protéger l'écran
// plus tard : utiliser le display:grid calendrier en haut à droite, gestion des langues et des photos, de la parole

// voir comment programmer ouverture en full screen
// désactiver screen saver (mais penser à protéger l'écran)
// DOM Events ?