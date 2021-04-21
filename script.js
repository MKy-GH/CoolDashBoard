// var d = new Date();
// var h = d.getHours();
var moment = "";
var msg, txt, nbMsg, i;
var refreshId = null;

// French version
var jours = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
var mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août",
    "septembre", "octobre", "novembre", "décembre"];
var moments = ["du matin", "de l'avant-midi", "de l'après-midi", "du soir"];

var GoogleAuth; // shortcut like above
const fetchInterval = 5 * 60000; // Messages refersh interval, convert min into ms

// messages generation
nbMsg = 3;
msg = ["This screen width : " + screen.availWidth];
for (i = 1; i < nbMsg; i++) {
    msg.push("Voici le message " + i);
}

//window.onload = function() {openFullscreen()};
refreshPage();
// refereshId = setInterval(refreshPage, 1000);

function refreshPage() {
    const d = new Date(), h = d.getHours(); m = d.getMinutes();

    // first header with day, month and year
    document.getElementById("dateLine").innerHTML =
        `<span class="highlight">${jours[d.getDay()]}</span> 
    ${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()}`;

    // second header with time and moment of the day
    if (h < 9) { moment = moments[0]; }
    else if (h < 12) { moment = moments[1] }
    else if (h > 18) { moment = moments[3]; }
    else if (h > 13) { moment = moments[2]; }
    if (Number(m) < 10) { m = "0" + m; }
    document.getElementById("hourLine").innerHTML =
        "il est " + h + ":" + m + " " + moment;


    // message display (may not be supported everywhere)
    txt = msg.reduce(myFunction);
    document.getElementById("msgSection").innerHTML = txt;

    function myFunction(total, value) {
        return total + "<p>" + value + "</p>";
    }

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

        dispAfterSignIn (GoogleAuth.isSignedIn.get()); // check signin and start display

    }, function (error) {
        appendPre(JSON.stringify(error, null, 2));
    });
}

function dispAfterSignIn (isSignedIn) {
//     // insure the first signin, then only display the list of messages
    if (!isSignedIn) {
        GoogleAuth.signIn().then(loopMessages);
    } else {
        loopMessages();
    }
}

function loopMessages() {
    listUpcomingEvents();
    const createClock = setInterval(listUpcomingEvents, fetchInterval);
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
    var pre = document.getElementById('content');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */

function listUpcomingEvents() {

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
        var events = response.result.items;  // MKy: this is the array of Events
        document.getElementById('content').innerHTML = "check of : " + tMin.toLocaleTimeString() + "\n";

        if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
                var event = events[i];
                appendPre(event.summary)
            }
        } else {
            appendPre('No upcoming events found.');
        }
    });
}


// mettre en page (sans photo et calendar?)
// controler les overflow (si pas de place sur la page)
// ajouter lien à gmail calendar
// voir comment rafraichir heure, les messages : auto dans head (rarement pour sécurité), 
//      horloge Java pour la montre, une autre pour les messages (ou push)
// Attention à mettre à jour les token
// inverser les couleurs jour et nuit ou plus fréquent pour protéger l'écran
// plus tard : utiliser le display:grid calendrier en haut à droite, gestion des langues et des photos, de la parole

// voir comment programmer ouverture en full screen
// désactiver screen saver (mais penser à protéger l'écran)
// DOM Events ?