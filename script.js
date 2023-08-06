let dataSet = 'films';
let url = "https://ghibliapi.vercel.app/" + dataSet ;
const main = document.querySelector('main'); 

let overallData = {
    films : null ,
    people : null,
    locations : null,
    species : null ,
    vehicles : null ,
}

const mainNav = document.querySelectorAll('#mainnav ul li a');
let isClicked = false ;
mainNav.forEach( a =>{ 
    a.addEventListener('click',(evt)=>{
        evt.preventDefault();
        if(isClicked){alert('Loading data... Please wait 3s and click again.')}
        if(!isClicked){
            dataSet = evt.target.getAttribute('href').substring(1);
            url = "https://ghibliapi.vercel.app/" + dataSet ;
            overallData[dataSet] !== null ?  createUI() : getData(url);
            //console.log( overallData[dataSet])
        }
        isClicked = true ;
        setTimeout(() => {
            isClicked = false
        }, 4000);
    })
})

async function getData(url){
    const response = await fetch(url);
    const jsonData = await response.json() ;
    overallData[dataSet] = jsonData ;
    createUI();
}
getData(url);

function createUI(){
    addCards(overallData[dataSet]);
    if(dataSet==='films'){
        sortFilms( overallData.films );
        document.getElementById('sortorder').style.visibility = "visible";
        document.getElementById('sortorder').removeAttribute("disabled");
    }else{
        console.log('hide')
        document.getElementById('sortorder').style.visibility = "hidden";
    }
}

document.getElementById('sortorder').addEventListener('change', () =>{
    sortFilms( overallData.films );
    addCards( overallData.films );
})

function sortFilms(films){
    const order = document.getElementById('sortorder').value
    switch(order){
        case "title":  films.sort((a,b)=>a.title > b.title ? 1 : -1) ; break;
        case 'rt_score':  films.sort((a,b)=> parseInt(a.rt_score) > parseInt(b.rt_score) ? -1 : 1) ; break;
        case "release_date":  films.sort((a,b)=> parseInt(a.release_date) > parseInt(b.release_date) ? 1 : -1); break;
    }
}

function addCards(dataArray){
    main.innerHTML = "";
    dataArray.forEach( data => {
        createCard(data);
    });
}

async function createCard(data){
    const article = document.createElement('article');
    switch(dataSet){
        case "films": article.innerHTML = createFilmContents(data); break;
        case "people": article.innerHTML =await createPeopleContents(data);  break;
        case "locations": article.innerHTML =await createLocationContents(data);  break;
        case "species": article.innerHTML =await createSpeciesContents(data);  break;
        case "vehicles": article.innerHTML =await createVehiclesContents(data);  break;
    }
    main.appendChild(article);
}

function createFilmContents(data){
    let html = `<h2>${data.title}</h2>
    <img src="${data.image}" alt="movie image">
    <p><strong>Director :</strong> ${data.director}</p>
    <p><strong>Released Year :</strong> ${data.release_date}</p>
    <p><strong>Description :</strong> ${data.description}</p>
    <p><strong>Rotten Tomatoes Score :</strong> ${data.rt_score}</p>`;
    return html ;
}

async function createPeopleContents(data){
    let showFilms = [];
    const films = data.films ;
    for(let eachFilm of films ){
        const title =await getPropertyFromUrl( eachFilm , "title" )
        showFilms.push(title);
    }

    const species = await getPropertyFromUrl( data.species, "name" )
    let html = `<p><strong>Character :</strong><h2>${data.name}</h2></p>`;
    html += `<p><strong>Details...</strong> <br>
    gender :${data.gender}, age :${data.age}, eye color :${data.eye_color}, hair color :${data.hair_color}</p>`;
    html += `<p><strong>Films :</strong> ${showFilms.join(", ")}</p>`;
    html +=`<p><strong>Species :</strong> ${species}</p>`;
    return html;
}

async function createLocationContents(data){
    const regex = "https?:\/\/";
    let residentNames = [];
    const theResidents = data.residents ;
    for(let resident of theResidents ){
        if( resident.match(regex)){        
            const resName =await getPropertyFromUrl( resident , "name" )
            residentNames.push(resName);
        }else{
            residentNames[0] = 'no data avaliable ...';
        }
    }

    let showFilms = [];
    const films = data.films ;
    for(let eachFilm of films ){
        const title =await getPropertyFromUrl( eachFilm , "title" )
        showFilms.push(title);
    }

    let html = `<p><strong>location :</strong><h2>${data.name}</h2></p>`;
    html += `<p><strong>Details...</strong> <br>
    climate : ${data.climate}, terrain : ${data.terrain}, surface water: ${data.surface_water}%</p>`;
    html += `<p><strong>Residents :</strong> ${residentNames.join(", ")}</p>`;
    html +=`<p><strong>Films :</strong> ${showFilms.join(', ')}</p>`;
    return html;
}

async function createSpeciesContents(data){

    let peopleNames = [];
    const people = data.people ;
    for(let person of people ){
        const personName =await getPropertyFromUrl( person , "name" )
        peopleNames.push(personName);
    }
    let showFilms = [];
    const films = data.films ;
    for(let eachFilm of films ){
        const title =await getPropertyFromUrl( eachFilm , "title" )
        showFilms.push(title);
    }

    let html = `<p><strong>Species :</strong><h2>${data.name}</h2></p>`;
    html += `<p><strong>Details...</strong><p>`;
    html +=`<p><strong>Eye Colors :</strong> ${data.eye_colors} </p>`;
    html +=`<p><strong>Hair Colors :</strong> ${data.hair_colors} </p>`;
    html +=`<p><strong>People :</strong> ${peopleNames.join(', ')}</p>`;
    html +=`<p><strong>Films :</strong> ${showFilms.join(', ')}</p>`;
    return html;
}

async function createVehiclesContents(data){
    let html = `<p><strong>Vehicle :</strong><h2>${data.name}</h2></p>`;
    html +=`<p><strong>Description :</strong> ${data.description} </p>`;
    html +=`<p><strong>Length :</strong> ${data.length} feet</p>`;
    html +=`<p><strong>Pilot :</strong> ${await getPropertyFromUrl(data.pilot , 'name')}</p>`;
    html +=`<p><strong>Film :</strong> ${await getPropertyFromUrl(data.films , 'title')}</p>`;
    return html;
}

async function getPropertyFromUrl( url , property ){
    let theItem ; 
    try{
        const response = await fetch(url);
        const json  = await response.json() ;
        theItem = json[property];
    }catch(err){
        theItem = "no data available...";
    }finally{
        return theItem;
    }
}