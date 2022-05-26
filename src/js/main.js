var positions = [
    { id: "full", male: "CP tech & Développeur fullstack", female: "Développeuse fullstack"},
    /* { id: "front",male: "Développeur front-end", female: "Développeuse front-end"},
    { id: "back",male: "Développeur back-end", female: "Développeuse back-end"},
    { id: "embedded",male: "Développeur embarqué", female: "Développeuse embarqué"} */
];

var companies = [
    "Trello",
    "Blablacar",
    "Microsoft",
    "Klassroom",
    "Citya",
    "Qwant"
]

var specialities =  {
    full: ["Angular/Material", "Typescript/Javascript", "Django DRF/Python"],
    front: ["React/Tailwind", "Vue/Material", "Angular/Bootstrap"],
    back: ["NodeJS/Express", "Python/Django"],
    embedded: ["Arduino/C++"]
}

function getUser() {
    const user = {
        gender: 'male',
        name: {
            first: 'Olivier',
            last: 'Duval'
        },
        email: 'od+github@duval.dev',
        picture: {
            large: 'https://zorky.github.io/john-doe/src/img/1516303331313.jpg',
            medium: 'https://zorky.github.io/john-doe/src/img/1516303331313.jpg',
            thumbnail: 'https://zorky.github.io/john-doe/src/img/1516303331313.jpg'
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
    return user;
}
function init(){
    renderFromUser(getUser());
    /* fetch('https://randomuser.me/api/?nat=fr')
    .then(response => response.json())
    .then(data => {
        var user = data.results[0];
        user.position = positions[Math.floor(Math.random() * (positions.length))];
        user.company = companies[Math.floor(Math.random() * (companies.length * 2))];
        user.speciality = specialities[user.position.id][Math.floor(Math.random() * (specialities[user.position.id].length))];
        console.log(user);
         renderFromUser(user);
    }); */
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
