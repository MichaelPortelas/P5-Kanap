// on recupère le contenue du panier
class Product{
    constructor(jsonProduct){
        jsonProduct && Object.assign(this, jsonProduct);
    }
}

const totalCart = [];
let totalProductCard = [];
let totalPriceCart = [];

// on prépare l'objet à envoyer
let postRequest = [];
postRequest = {
   "contact": {
       "firstName" : "",
       "lastName" : "",
       "address": "",
       "city": "",
       "email": ""
   },
   "products":[]
};

// On rajoute des points de validation sur le formulaire
document.getElementById("firstName").setAttribute("pattern", "^[a-zA-ZÀ-ž \-]*$");
document.getElementById("lastName").setAttribute("pattern", "^[a-zA-ZÀ-ž \-]*$");
document.getElementById("city").setAttribute("pattern", "^[a-zA-ZÀ-ž \-]*$");


// on recupère le panier dans le local storage
let listProductCart = getProductCart();

for(jsonProductCart of listProductCart){
    
    let productCart = new Product(jsonProductCart);

    // on recupère les infos de chaque produit via l'ID dans l'API
    getProduct(productCart.id, productCart.color, productCart.quantity);       
}

// au click on controle la commande
document.querySelector(".cart__order__form").addEventListener("submit", controlOrder);

// Fonction qui récupère les infos du panier dans le localStorage
function getProductCart(){
    // on recupère le panier
    let listProductCart = localStorage.getItem("cart");

    // si le panier n'existe pas on renvois un tableau vide 
    if(listProductCart == null){
        return [];
    }else{
        // si il existe on renvois la liste des produits
        return JSON.parse(listProductCart);
    }
}

// Fonction qui récupère un produit dans l'api
function getProduct(productId, productCartColor, productCartQuantity){

    // on recupère les informations du produit dans l'api via son Id
    fetch(`http://live-demo.portelas.fr:4000/api/products/${productId}`)
        .then(data => data.json())
        .then(jsonDetailProduct => { showProduct(jsonDetailProduct, productCartColor, productCartQuantity) })
        .catch(error => console.log("Oh no", error));
};

// Fonction qui affiche le produit
function showProduct(jsonDetailProduct, productCartColor, productCartQuantity){
    let productApi = new Product(jsonDetailProduct);

            // on créer et on affiche le produit
            document.getElementById("cart__items").innerHTML += `
            <article class="cart__item" data-id="${productApi._id}" data-color="${productCartColor}">
                <div class="cart__item__img">
                    <img src="${productApi.imageUrl}" alt="${productApi.altTxt}">
                </div>
                <div class="cart__item__content">
                    <div class="cart__item__content__description">
                        <h2>${productApi.name}</h2>
                        <p>${productCartColor}</p>
                        <p>${productApi.price} €</p>
                    </div>
                    <div class="cart__item__content__settings">
                        <div class="cart__item__content__settings__quantity">
                            <p>Qté : </p>
                            <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${productCartQuantity}">
                        </div>
                        <div class="cart__item__content__settings__delete">
                            <p class="deleteItem">Supprimer</p>
                        </div>
                    </div>
                </div>
            </article>`;
            
            // On rajoute un point de validation sur le formulaire
            document.querySelector(".itemQuantity").setAttribute("pattern", "[0-9]{1,}");

            //on detecte si un changement de quantité à lieu
            getQuantityChange();

            // on calcul et on stock le prix de chaque èlement
            calcProductPrice(productApi.price, productCartQuantity);
            
            // on calcule et on affiche le nombre total de produit et la valeur total du panier
            totalProductCard = calcTotalProductCard();
            totalPriceCart = calcTotalPriceCart();

            document.getElementById("totalQuantity").innerText = totalProductCard;
            document.getElementById("totalPrice").innerText = totalPriceCart;

            // on detect si un clic a eu lieu sur Supprimer
            getDeleteProduct();
            
};

// Fonction qui detecte la modification de quantité d'un produit
function getQuantityChange(){
    var valid = true;

    document.querySelectorAll(".itemQuantity").forEach(product => {
        product.addEventListener("change", function(){                   
            
            valid &= document.querySelector(".itemQuantity").reportValidity();

            if(!valid){
                alert("Merci d'indiquer une quantité valide !");
                location.reload();
            }else{
                
                productCartQuantity = this.value;

                // on mets à jours le produit dans le panier
                updateProductcart(this.closest(".cart__item").dataset.id, this.closest(".cart__item").dataset.color, this.value);
            }
            
                                
        });
    });
}

// Fonction qui mets à jour un produit du panier 
function updateProductcart(productId, productColor, productQuantity){

    // on recupère le panier
    let listProductCart = getProductCart();

    // on recherche le produit, même ID, même COLOR
    for(productCart of listProductCart){
        if(productCart.id == productId && productCart.color == productColor){

            // on mets a jours la quantité
            productCart.quantity = parseInt(productQuantity);
        }
    };

    // on sauvegarde le panier dans le localStorage
    saveProductCart(listProductCart);

    location.reload();
}

// Fonction qui sauvegarde le panier dans le localStorage
function saveProductCart(listProductCart){

    let sortListProductCart = listProductCart.sort(compare_id); // on fait un tri via la comparaison des Id du local storage

    localStorage.setItem("cart",JSON.stringify(sortListProductCart));
}

// Fonction qui calcul le prix d'un èlement du panier en fonction de sa quantité
function calcProductPrice(productPrice, productQuantity){
    let totalProduct = productPrice * productQuantity;
    let calc = {
        "quantity" : productQuantity,
        "totalPrice" : totalProduct
    };   
    return totalCart.push(calc);
}

// Fonction qui calcule et retourne le nombre total de produit dans le panier
function calcTotalProductCard(){
    let sum = 0;

    for(let i = 0; i < totalCart.length; i++){
        sum += totalCart[i].quantity;
    }

    return sum;
}

// Fonction qui calcule et retourne le prix total du panier
function calcTotalPriceCart(){
    let sum = 0;

    for(let i = 0; i < totalCart.length; i++){
        sum += totalCart[i].totalPrice;
    }

    return sum;
}

// Function qui detecte si le client veux supprimer un produit
function getDeleteProduct(){
    document.querySelectorAll(".deleteItem").forEach(event => {
        event.addEventListener("click", function(){

            console.log("click delete !");                    
            document.getElementById("cart__items").removeChild(this.closest(".cart__item"));

            // on supprime le produit du panier
            deleteProductCart(this.closest(".cart__item").dataset.id, this.closest(".cart__item").dataset.color);
        });
    });
}

// Fonction qui supprime un produit du panier
function deleteProductCart(productId, productColor){
    
    // on recupère le panier
    let listProductCart = getProductCart();

    // on recherche le produit, même ID, même COLOR
    for(let i =0; i < listProductCart.length; i++){
        if(listProductCart[i].id == productId && listProductCart[i].color == productColor){
            listProductCart.splice(i,1);
        }
    }

    // on sauvegarde le panier dans le localStorage
    saveProductCart(listProductCart);

    location.reload();
}

// Fonction qui compare les id des produits
function compare_id( a, b )
  {
  if ( a.id.toLowerCase() < b.id.toLowerCase()){
    return -1;
  }
  if ( a.id.toLowerCase() > b.id.toLowerCase()){
    return 1;
  }
  return 0;
}

// Fonction qui recupère tous les Product_id du panier
function listProductId(){
    let listProductsId = [];
    let listProductCart = getProductCart();

    for(i = 0; i < listProductCart.length; i++){
        listProductsId.push(listProductCart[i].id);
    }

    return listProductsId;
}

// Fonction qui controle et prépare la commande
function controlOrder(e){

    e.preventDefault();

    var valid = true;

    // On controle que le panier n'est pas vide
    console.log(listProductId().length);
    if(listProductId().length != 0){
        
        // on controle si tous les champs du formulaire sont valide
        for(let input of document.querySelectorAll("form input")){

            valid &= input.reportValidity();

            if(!valid){
                break;
            }
        }
        if(valid){

            // si tous les champs sont valide on prépare l'objet a envoyer
            postRequest.contact.firstName = document.getElementById("firstName").value;
            postRequest.contact.lastName = document.getElementById("lastName").value;
            postRequest.contact.address = document.getElementById("address").value;
            postRequest.contact.city = document.getElementById("city").value;
            postRequest.contact.email = document.getElementById("email").value;
            
            postRequest.products = listProductId(); 
            
            postOrder(postRequest);
        }

    }else{

        // si le panier est vide on envois un message d'alerte et on redirige le client vers la page d'accueil
        alert("Commande impossible : Votre Panier est vide ! ");
        window.location.assign(`http://live-demo.portelas.fr/kanap/front/html/index.html`);
    }

}

// Fonction qui envois la commande via la methode POST à l'API
function postOrder(postRequest){

    // on envois l'objet à l'API via la methode POST
    fetch("http://live-demo.portelas.fr:4000/api/products/order", {
        method: "POST",
        headers: { 
            'Accept': 'application/json', 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(postRequest)
    })
    .then(function(res) {
        if (res.ok) {
            return res.json();
        }
    })
    .then(function(value) {        
        // on recupère l'id de confirmation et on redirige le client
        window.location.assign(`http://live-demo.portelas.fr/kanap/front/html/confirmation.html?orderId=${value.orderId}`);
    })
    .catch(function(error) {
        console.log('Il y a eu un problème avec l\'opération fetch: ' + error.message);
    });
}

