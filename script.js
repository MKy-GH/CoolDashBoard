

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

    // var dateFormat = "de-CH";  // for tests use navigator.language for production
    var dateFormat = navigator.language;
    var now = new Date();
    var day = now.toLocaleDateString(dateFormat, { weekday: "long" });

    document.getElementById("day").innerHTML = day;
    document.getElementById("date").innerHTML = defdate(now);
    document.getElementById("time").innerHTML = defTime(now);
    document.getElementById("moment").innerHTML = defMoment(now);

    function defdate(date) {
        var options = { day: "numeric", month: "long", year: "numeric" };
        return date.toLocaleDateString(dateFormat, options);
    }
    function defTime(date) {
        // format display of time

        var hour = date.getHours(), minute = date.getMinutes(), second = date.getSeconds();
        var temp = "" + ((hour > 12) ? hour - 12 : hour);

        if (hour == 0) { temp = "12"; }
        temp += ((minute < 10) ? ":0" : ":") + minute;
        return temp;
    }
    function defMoment(date) {
        // day moment definition

        const momentDic = {
            //      0-6             6-12         12-13          13-18           18-24
            "fr": ["du matin", "avant-midi", "midi", "après-midi", "du soir"],
            "de": ["nachts", "vormittags", "mittags", "nachmittags", "abends"],
            "en": ["AM", "AM", "PM", "PM", "PM"]
        };
        const navLang = navigator.language.slice(0, 2);
        var lang = (navLang in momentDic) ? navLang : "en"; // en as default language

        var hour = date.getHours();
        if (hour < 6) { return momentDic[lang][0]; }
        else if (hour < 12) { return momentDic[lang][1]; }
        else if (hour < 13) { return momentDic[lang][2]; }
        else if (hour < 18) { return momentDic[lang][3]; }
        else { return momentDic[lang][4]; }
    }
}


/**
 * Messages composition and display
 */

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
        scope: "https://www.googleapis.com/auth/calendar.events.readonly",
        uxMode: 'redirect',
        // redirectUri: "https://cool.el-khoury.ch" // force cet url, au lieu de prendre la page actuelle
    }).then(function () {
        GoogleAuth = gapi.auth2.getAuthInstance();

        dispAfterSignIn(GoogleAuth.isSignedIn.get()); // check signin and start display

    }, function (error) {
        alert(JSON.stringify(error, null, 2));
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
        'timeMin': tMin.toISOString(), // Date has to be an object with new
        'timeMax': tMax.toISOString(),
    }).then(function (response) {
        var noImage = 1;
        var events = response.result.items;  // The array of Event-objects
        events.reverse();  // because orderBy endtime doesn't exist.

        // initialisation of messages and aside
        document.getElementById("messages").innerHTML = "";
        if ((asd = document.getElementById("myAside"))) {  //not good practice the "=", but compact
            asd.parentNode.removeChild(asd);
        }
        // screening and handling events
        if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
                if (!events[i].attachments) {
                    var para = document.createElement("P");
                    para.innerHTML = events[i].summary;
                    document.getElementById("messages").appendChild(para);
                }
                else if (noImage) {
                    var attachType = events[i].attachments[0].mimeType;
                    if (attachType.indexOf("image") !== -1) {
                        // console.log(events[i]);
                        var myMain = document.getElementsByTagName("main");
                        var asd = document.createElement("aside");
                        var fig = document.createElement("figure");
                        var photo = document.createElement("img");
                        var capt = document.createElement("figcaption");
                        var fileId = events[i].attachments[0].fileId;
                        var imgSrc = "https://drive.google.com/uc?id=" + fileId;  // otherwise try with uc?export=download&id=

                        asd.id = "myAside";
                        photo.setAttribute("src", imgSrc);
                        capt.innerHTML = events[i].summary;
                        fig.appendChild(photo);
                        fig.appendChild(capt);
                        asd.appendChild(fig);
                        myMain[0].appendChild(asd);
                        noImage = 0;
                    }

                }
            }
        }
    });
}

// STATUS :
// the branch Photo is ready with the possible display of picture/caption and ajusted font sizing.

// NEXT :
// - complement the user guide
// - explore a new push branch for the images
