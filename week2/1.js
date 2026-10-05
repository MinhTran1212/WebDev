const potato = document.querySelector("h1");

// tag selector h1, p, img
// ID select: #
// class: .class

potato.innerText = "Something else";
// this will not show up in italic

potato.innerHTML = "Something <i>new</i>";

const apple = document.querySelector("p")
// if no match -> null

apple.innerHTML = "Hehe" //always change the first element

apple.style.color = "blue";
// CSS: background-color, JS: backgroundColor

apple.style.backgroundColor = "#12f912"

const sixseven = document.querySelector("img");
sixseven.src = "entries.png";

const apples = document.querySelectorAll("p");
// select ALL matching elements
// no match -> empty nodelist 

for (const a of apples) //use loop for qsa
    a.innerHTML = "Hello"

