
const apiExample = document.getElementById("ejem");

fetch("https://rickandmortyapi.com/api/character/1")
  .then(res => res.json())
  .then(data => {
    const json = JSON.stringify(data, null, 1);
    apiExample.textContent = json;
  })
  .catch(err => {
    apiExample.textContent = "Error al cargar el ejemplo.";
    console.error(err);
  });


