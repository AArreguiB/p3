// Funciones para el form
function agregarFila() {
    // Obtiene el cuerpo de la tabla
    var table = document.getElementById("tablaIngredientes").getElementsByTagName('tbody')[0];

    // Crea una nueva fila
    var newRow = table.insertRow();

    // Crea las celdas para la fila
    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    var cell3 = newRow.insertCell(2);

    // Añade los inputs para ingrediente y cantidad en las celdas
    cell1.innerHTML = '<input type="text" name="ingredientes[]" required>';
    cell2.innerHTML = '<input type="text" name="cantidades[]" required>';
    cell3.innerHTML = '<button type="button" onclick="eliminarFila(this)">🗑️</button>';
}
        
function eliminarFila(boton) {
    // Elimina la fila en la que está el botón de eliminar
    var row = boton.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

//Funciones para la API
function ObtenerProductos(ingrediente) {
    fetch("https://dummyjson.com/c/5092-fe35-4c6e-9ad0")
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const productosRelacionados = data.products.filter(producto =>
                producto.title.toLowerCase().includes(ingrediente.toLowerCase())
            );

            if (productosRelacionados.length > 0) {
                mostrarProductos(productosRelacionados);
            } else {
                console.log("No se encontraron productos relacionados con: " + ingrediente);
                document.getElementById("productos-recomendados").innerHTML = 
                "<h2>Productos recomendados</h2> No hay ingredientes para estas recetas";
            }
        })
        .catch(error => console.error("Error al obtener productos:", error));
}

function mostrarProductos(productos){
    const contenedor=document.getElementById("productos-recomendados");
    productos.slice(0, 3).forEach(producto => {
        const productoHTML = `
            <div class="producto">
                <img src="${producto.image}" alt="${producto.title}" >
                <button class="boton-comprar">Comprar</button>
                <h3>${producto.title}</h3>
                <p>Precio: ${producto.price}</p>
            </div>
        `;
        contenedor.innerHTML += productoHTML;
    });
}
const rutaActual = window.location.pathname;

const ingredientesPorPagina = {
    "recetas_rapidas.html": ["Avocado", "Tomatoes", "Salmon"],
    "recetas_partido.html": ["Tortillas", "puff pastry", "bao bread"],
    "postres.html": ["Whipped cream", "Cinamon", "Cocoa powder"],
    "recetas_internacionales.html": ["bomb rice", "Peppers", "octopus"]
};

for (const [pagina, ingredientes] of Object.entries(ingredientesPorPagina)) {
    if (rutaActual.includes(pagina)) {
        ingredientes.forEach(ingrediente => ObtenerProductos(ingrediente));
    }
}



document.addEventListener("DOMContentLoaded", function() {
    cargarReceta();
});

function cargarReceta() {
    if (window.location.pathname.includes("receta_sorpresa.html")) {
        fetch("https://www.themealdb.com/api/json/v1/1/random.php")
            .then(respuesta => respuesta.json())
            .then(datos => {
                const receta = datos.meals[0];
                
                document.getElementById("nombre").textContent = receta.strMeal;

                document.getElementById("tipo").innerHTML= `<strong>Categoría:</strong> ${receta.strCategory}`;
                document.getElementById("Nac").innerHTML=`<strong>Area:</strong> ${receta.strArea}`;
                
                document.getElementById("imagen").src = receta.strMealThumb;

                const listaIngredientes = document.getElementById("ingredientes");
                const cabeceras = `
                    <tr>
                        <th>Ingrediente</th>
                        <th>Cantidad</th>
                    </tr>
                `;
                listaIngredientes.innerHTML = cabeceras;

                for (let i = 1; i <= 20; i++) {
                    const ingrediente = receta[`strIngredient${i}`];
                    const medida = receta[`strMeasure${i}`];

                    if (ingrediente && ingrediente.trim() !== "") {
                        const fila = document.createElement("tr");
                        const tdIngrediente = document.createElement("td");
                        const tdCantidad = document.createElement("td");
                        
                        tdIngrediente.textContent = ingrediente;
                        tdCantidad.textContent = medida;
                        
                        fila.appendChild(tdIngrediente);
                        fila.appendChild(tdCantidad);
                        listaIngredientes.appendChild(fila);
                    }
                }

                const pasos = receta.strInstructions;
                const pasosLista = document.getElementById("pasos");
                pasosLista.innerHTML = ""; 

                const pasosConNumeros = pasos.split("\n").map(paso => paso.trim()).filter(paso => paso.length > 0);
                let pasosNumerados = pasosConNumeros.every(paso => paso.match(/^[0-9]+\./));

                if (pasosNumerados) {
                    pasosConNumeros.forEach((paso, index) => {
                        const li = document.createElement("li");
                        li.innerHTML = `👨‍🍳  ${paso}`;
                        pasosLista.appendChild(li);
                    });
                } else {
                    const pasosArray = pasos.split(".").map(paso => paso.trim()).filter(paso => paso.length > 0);
                    pasosArray.forEach((paso, index) => {
                        const li = document.createElement("li");
                        li.innerHTML = `👨‍🍳 ${paso}.`;
                        pasosLista.appendChild(li);
                    });
                }
            })
            .catch(error => {
                console.error("Error al obtener la receta:", error);
            });
    }
}


function guardarReceta(event){

    event.preventDefault();
    const nombre=document.getElementById("nombre").value;
    const categoria=document.getElementById("categoria").value;
    const tiempo=document.getElementById("tiempo").value;
    const dificultad=document.getElementById("dificultad").value;
    const preparacion=document.getElementById("preparacion").value;
    const foto=document.getElementById("imagen").value;

    const ingredientes = [];
    const filasIngredientes = document.querySelectorAll("#tablaIngredientes tbody tr");
    filasIngredientes.forEach(fila => {
        const ingrediente = fila.querySelector("td:nth-child(1) input").value;
        const cantidad = fila.querySelector("td:nth-child(2) input").value;
        ingredientes.push({ nombre: ingrediente, cantidad: cantidad });
    });

    const receta={
        "nombre":nombre,
        "categoria":categoria,
        "tiempoPreparacion":tiempo,
        "dificultad":dificultad,
        "ingredientes":ingredientes,
        "fotoUrl":foto,
        "preparacion":preparacion
    };

    console.log("Objeto receta:", receta);

    fetch("http://localhost:8000/api/recetas",{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify(receta)
    })
    .then(response=>{
        if (response.ok) {
            return response.json(); 
        }
        throw new Error('Error al guardar la receta');
    })
    .then(data=>{
        console.log("Receta guardada con exito");
        alert("¡Receta guardada exitosamente!");

    
    })
    .catch(error => {
        console.error('Error:', error); 
        alert("Hubo un error al guardar la receta. Intenta de nuevo.");
    });

}

document.addEventListener("DOMContentLoaded", function() {
 
    if (window.location.pathname.includes("recetas_nuevas.html")) {
        fetch("http://localhost:8000/api/recetas")
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la solicitud');
                }
                return response.json();
            })
            .then(data => {
                console.log("Recetas obtenidas:", data);

                const listaRecetas = document.getElementById("listaRecetas");

                if (Array.isArray(data)) {
                    data.forEach(receta => {
                        const li = document.createElement("li");
                        li.textContent = receta.nombre;
                        // Al hacer clic en el nombre de la receta, se muestran los detalles
                        li.addEventListener("click", function() {
                            mostrarDetallesReceta(receta);
                        });
                        listaRecetas.appendChild(li);
                    });
                } else {
                    alert("No se encontraron recetas.");
                }
            })
            .catch(error => {
                console.error('Error al obtener las recetas:', error);
                alert("Hubo un error al cargar las recetas.");
            });
    }
});

function mostrarDetallesReceta(receta) {
    // Mostrar el contenedor de detalles
    const detallesReceta = document.getElementById("detallesReceta");
    detallesReceta.style.display = "block"; 

    // Mostrar los detalles de la receta
    document.getElementById("detalleNombre").textContent = receta.nombre;
    document.getElementById("detalleDificultad").textContent = "★".repeat(receta.dificultad) + "☆☆☆☆☆".slice(receta.dificultad);
    document.getElementById("detalleTiempo").textContent = "Tiempo de preparación: " + receta.tiempoPreparacion;

    // Mostrar los ingredientes en formato de tabla
    const ingredientesTable = document.getElementById("detalleIngredientes");
    receta.ingredientes.forEach(ingrediente => {
        const row = document.createElement("tr");
        const tdIngrediente = document.createElement("td");
        const tdCantidad = document.createElement("td");

        tdIngrediente.textContent = ingrediente.nombre;
        tdCantidad.textContent = ingrediente.cantidad;

        row.appendChild(tdIngrediente);
        row.appendChild(tdCantidad);
        ingredientesTable.appendChild(row);
    });

    document.getElementById("detalleImagen").src = receta.fotoUrl;

    const pasosList = document.getElementById("detallePasos");
    pasosList.innerHTML = ""; 
    if (receta.preparacion) {
        const pasosArray = receta.preparacion.split("\n\n");

        // Crear elementos <li> para cada paso
        pasosArray.forEach((paso, index) => {
            const li = document.createElement("li");
            li.innerHTML = `👨‍🍳 <strong>Paso ${index + 1}:</strong> ${paso.trim()}`;
            pasosList.appendChild(li);
        });
    } else {
        console.log("No se encontraron pasos en la receta.");
    }
}

function obtenerReceta() {
    return document.getElementById("detalleNombre").textContent;
}

function loHare(event){
    const nombre=obtenerReceta();

    const url=`http://localhost:8000/api/recetas/${encodeURIComponent(nombre)}/incremento/1`;

    fetch(url, {
        method:"PUT",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("No se pudo incrementar el contador");
        }
        return response.json();
    })
    .then(data => {
        document.getElementById("cocineros").textContent = data.cocineros; 
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error al incrementar el contador");
    });

}

function cargarReceta(nombreReceta) {
    fetch(`/api/recetas/${nombreReceta}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("cocineros").innerText = data.cocineros; 
        })
        .catch(error => console.error("Error:", error));
}

document.addEventListener("DOMContentLoaded", function () {
    let recetaNombre = document.getElementById("detalleNombre").innerText; 
    cargarReceta(recetaNombre);
});


function Borrar(event){
    const nombre=obtenerReceta();

    const respuesta=confirm("¿Estas seguro de que quieres eliminar esta receta? Esta acción no se puede eliminar y podrás dejar a alguien sin probar esta deliciosa receta");
    
    if(respuesta){
        const url=`http://localhost:8000/api/recetas/${encodeURIComponent(nombre)}`;
        console.log(url);
    
        fetch(url,{
            method:"DELETE",
            headers:{
                "Content-type":"application/json"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la eliminación: ${response.status} ${response.statusText}`);
            }
            return response.status === 204 ? null : response.json();
        })
        .then(data=>{
            console.log("Receta eliminada correctamente: ", data);
            alert(`RECETA ELIMINADA. NUNCA SABREMOS A QUE SABÍA ${nombre} :'(`);
            location.reload();

        })
        .catch(error=>{
            console.error("Error al eliminar la receta ", error);
            alert("Hubo un error al eliminar la receta. Igual es una señal para que no la borres...");
            location.reload();
        })
    } else {
        console.log("La eliminacion de la receta ha sido cancelada");
    }
}