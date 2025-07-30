let orderId = null;

var url = new URL(window.location.href);
orderId = url.searchParams.get("orderId");

if(orderId != null){
    document.getElementById("orderId").innerText = orderId;

    // la commande etant  validé on efface le panier
    localStorage.removeItem('cart');
}else{
    alert("Votre commande n'a pas été confirmée !");
    window.location.assign(`https://live-demo.portelas.fr/kanap/front/html/cart.html`);
}

