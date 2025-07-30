class Product{
    constructor(jsonProduct){
        jsonProduct && Object.assign(this, jsonProduct);
    }
}

getAllProducts();

// Fonction qui recupère tous les produits depuis l'API
function getAllProducts(){
    fetch("http://live-demo.portelas.fr:4000/api/products")
    .then(data => data.json())
    .then(jsonListProduct => { showProducts(jsonListProduct) })
    .catch(error => console.log("Oh no", error));
}

// Fonction qui affiche tous les produits
function showProducts(jsonListProduct){

    for(let jsonProduct of jsonListProduct){
        let product = new Product(jsonProduct);
        
        document.getElementById("items").innerHTML += `<a href="./product.html?id=${product._id}">
                                                            <article>
                                                                <img src="${product.imageUrl}" alt="${product.altTxt}">
                                                                <h3 class="productName">${product.name}</h3>
                                                                <p class="productDescription">${product.description}.</p>
                                                            </article>
                                                        </a>`        
    }    
}
