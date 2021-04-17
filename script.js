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



// messages generation
nbMsg = 11;
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