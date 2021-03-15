var myvar;

function func() {

    myvar = setTimeout(showpage, 3000)
}

function showpage() {
    document.getElementById("load").style.display = "none";
    document.getElementById("welcomepage").style.display = "block";

}