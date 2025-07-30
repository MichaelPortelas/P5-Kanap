var url = new URL(window.location.href);
let productId = url.searchParams.get("id");

// On rajoute un point de validation sur le formulaire
document.getElementById("quantity").setAttribute("pattern", "[0-9]{1,}");

getProduct(productId);


// Fonction qui recupère le produit par son ID depuis l'API
function getProduct(productId){
    fetch(`http://live-demo.portelas.fr:4000/api/products/${productId}`)
    .then(data => data.json())
    .then(jsonDetailProduct => { showProduct(jsonDetailProduct) })
    .catch(error => console.log("Oh no", error));
}

// Fonction qui affiche le produit
function showProduct(jsonDetailProduct){
    
    // on affiche les details du produit
    document.querySelector(".item__img").innerHTML += `<img src="${jsonDetailProduct.imageUrl}" alt="${jsonDetailProduct.altTxt}">`;
    document.getElementById("title").innerText = jsonDetailProduct.name;
    document.getElementById("price").innerText = jsonDetailProduct.price;
    document.getElementById("description").innerText = jsonDetailProduct.description;
    
    //on crée la selection de couleur
    showColorSelect(jsonDetailProduct.colors);

    // on créé le panier au clic du bouton
    createCart(productId, jsonDetailProduct.colors[0]);
}

// Fonction qui créé la selection de couleur
function showColorSelect(colorList){
    for(let productColor of colorList){
        document.getElementById("colors").innerHTML += `<option value="${productColor}">${productColor}</option>`
    } 
}

// Fonction qui créer le panier
function createCart(productId, selectColor){
    
    // on recupère la couleur choisi par le client
    let colorChoice = selectColor;

    document.getElementById("colors").addEventListener("input", function(){
        colorChoice = this.value;
    })

    // on recupère le nombre de produit choisi par le client
    let quantityProduct = 0;
    var valid = true;

    document.getElementById("quantity").addEventListener("input", function(event){
        
        // on vérifie la valeur du formulaire
        valid &= document.querySelector("#quantity").reportValidity();
        
        if(!valid){
            alert("Merci d'indiquer une quantité valide !");
            location.reload();
        }else{
            quantityProduct = parseInt(this.value);
        }
    })

    // on ajoute le produit au panier
    document.getElementById("addToCart").addEventListener("click", function(){
        
        let jsonDatasProduct = {
            "id" : productId, 
            "color" : colorChoice, 
            "quantity" : quantityProduct
        };

        addProductCart(jsonDatasProduct);

        location.reload();
    })
}

// Fonction qui ajoute un produit dans le panier
function addProductCart(jsonDatasProduct){
    let productColor = jsonDatasProduct.color;
    let productQuantity = jsonDatasProduct.quantity;
    
    // on récupère le panier dans le localStorage
    let listProductCart = getProductCart();
    
    // si le panier est vide
    if(listProductCart.length == 0){
        listProductCart.push(jsonDatasProduct); // on ajoute le produit dans le panier
        saveProductCart(listProductCart);       // on sauvegarde le panier dans le localStorage
    }else{
        let detectProduct = false;
        
        // si le panier n'est pas vide
        for(productCart of listProductCart){
            
            // On check si il y a un produit identique (même ID, même Couleur) dans le panier
            if(productCart.id == productId && productCart.color == productColor){
                
                //si on en trouve un on incremente la quantité par le nouvel ajout
                productCart.quantity = productCart.quantity + productQuantity;
                detectProduct = true;
                
            }
        }

        //si le produit n'est pas deja dans le panier on l'ajoute
        if(!detectProduct){
            listProductCart.push(jsonDatasProduct);
        }

        saveProductCart(listProductCart); // on sauvegarde le panier dans le localStorage        
    }        
}

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

// Fonction qui sauvegarde le panier dans le localStorage
function saveProductCart(listProductCart){
    
    let sortListProductCart = listProductCart.sort(compare_id); // on fait un tri via la comparaison des Id du local storage
    
    localStorage.setItem("cart",JSON.stringify(sortListProductCart));
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
