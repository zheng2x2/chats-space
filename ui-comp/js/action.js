document.querySelector("#confirmStart").addEventListener('click', function(){
    document.querySelector(".modal").style.display = 'none';
    // botResponse("홈");
    document.querySelector(".msger-chat").scrollTop = document.querySelector(".msger-chat").scrollHeight
})


document.querySelector("#sendTextForm").addEventListener('submit', function(e){
    e.preventDefault();
})

document.querySelector(".buttons").addEventListener("click", function(e){
    const body = document.querySelector("body");
    body.classList.remove(...body.classList);

    if(e.target.className == "btn-normal") {
        body.classList.add("btn-normal")
    }else if(e.target.className == "btn-dark") {
        body.classList.add("o2o-dark")
    }else if(e.target.className == "btn-shinhan") {
        body.classList.add("o2o-sh")
    }else if(e.target.className == "btn-green") {
        body.classList.add("o2o-green")
    }

})