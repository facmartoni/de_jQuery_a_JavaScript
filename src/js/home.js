const key = '&apikey=14afd686';
const url = `http://www.omdbapi.com/`;

(async function load(){
  const getData = async (url) =>{
    const response = await fetch(url)
    const data = await response.json();
    return data;  
  }

  const actionList = await getData(`${url}?s=horse${key}`); 
  const dramaList = await getData(`${url}?s=cow${key}`); 
  const animationList = await getData(`${url}?s=child${key}`); 

  console.log(actionList, dramaList, animationList)

  // const $home = $('.home .list #item') // Selector en jQuery

  const $modal = document.getElementById('modal'); 
  const $overlay = document.getElementById('overlay'); 
  const $hideModal = document.getElementById('hideModal');
  const modalImage = $modal.querySelector('img');
  const modalTitle = $modal.querySelector('h1');
  const modalDescription = $modal.querySelector('p');
  
  const $actionContainer = document.querySelector('#action');
  const $dramaContainer = document.querySelector('#drama');
  const $animationContainer = document.querySelector('#animation');

})()
