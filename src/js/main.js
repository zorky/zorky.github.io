const positions = [
    {id: "full", male: "CP tech & Développeur fullstack", female: "Développeuse fullstack"}
];

const companies = [
    "Paris 8",
    "BusinessLine",
    "Edenred",
    "France Billet",
    "CCI France",
    "Alegria"
];

const specialities = {
    full: ["Angular/Material", "Typescript/Javascript", "Django DRF/Python"]
};

function getUser() {
    return {
        gender: 'male',
        name: {
            first: 'Olivier',
            last: 'Duval'
        },
        email: 'od+github@duval.dev',
        picture: {
            large: 'https://zorky.github.io/src/img/1516303331313.jpg',
            medium: 'https://zorky.github.io/src/img/1516303331313.jpg',
            thumbnail: 'https://zorky.github.io/src/img/1516303331313.jpg'
        },
        position: {
            'male': 'responsable d\'équipe / CP technique',
            id: 'full'
        },
        company: 'Université Paris 8',
        speciality: specialities['full'],
        location: {
            city: 'Saint-Denis',
            country: 'France'
        }
    };
}
function init(){
    renderFromUser(getUser());
}

function renderFromUser(user) {
    document.querySelector("#person-picture").src = user.picture.large; 
    document.querySelector("#person-fullname").innerHTML = `${user.name.first} ${user.name.last}`;
    document.querySelector("#person-firstname").innerHTML = user.name.first;
    document.querySelector("#person-job").innerHTML = user.position[user.gender];
    document.querySelector("#person-position").innerHTML = user.position[user.gender];
    document.querySelector("#person-company").innerHTML = user.company ? ` chez ${user.company}` : "en recherche d'emploi";
    document.querySelector("#person-city").innerHTML = `${user.location.city}, ${user.location.country}`;
    document.querySelector("#person-speciality").innerHTML = user.speciality;
    document.querySelector("#person-speciality").innerHTML = user.speciality;
    document.querySelector("#person-email").href = "mailto:"+user.email;
}

init();
