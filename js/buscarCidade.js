import { autoCompletar, recuperarPrevisaoTempo } from "./acessarPrevisaoTempo.js";
import { montarDashboard } from "./index.js";

// Função que valida se a opção digitada foi algum dos itens retornado pela api, dessa forma
// evito que aconteça erros de inexistir uma localidade. Além disso é nesta função que faço a
// recuperação dos dados sobre tempo da localidade em questão
function validarInputEBuscarCondicaoClimatica(input) {

    if (input.value.trim() == "") {
        alert("Nenhum valor preenchido")
        return;
    }
    
    // Recupero o <datalist> para pode validar a opção digitada/selecionada
    let listaOpcoesLocalizacao = input.list;
    let itemExiste = false;
    let latitude;
    let longitude;

    // Se encontrar um item que exite no <datalist> executa a recuperação da informação da localidade
    for (let item of listaOpcoesLocalizacao.children) {

        if (item.value == input.value) {
            itemExiste = true;
            latitude = item.id.slice((item.id.indexOf(":") + 1), item.id.indexOf("|"));
            longitude = item.id.slice(item.id.lastIndexOf(":") + 1);
            break;
        }
    }

    if (itemExiste) {

        recuperarPrevisaoTempo(latitude, longitude).then(
            function(previsaoTempo) {
                montarDashboard(previsaoTempo);
                dashboard.style.display = "grid";
            }
        );
        return;
    }
    
    // we send an error message
    alert("Local selecionado não existe!")
    return;
}

let dashboard = document.getElementById("dashboardIn");
console.log(dashboard);

window.onload = function() {
    dashboard.style.display = "none";
}

let inputBuscaLocalizacao = document.getElementById('buscaLocalizacao');
let btnBuscarPrevTempo = document.getElementById('buscarPrevTempo');
        
// Coloca um evento keyup no <input> de busca da localização. Chama a função autoCompletar que fará o processo de busca do termo na api
inputBuscaLocalizacao.addEventListener(
    "keyup", function(event) {
        autoCompletar(event);
    }
);

btnBuscarPrevTempo.addEventListener(
    "click", function(event) {
        validarInputEBuscarCondicaoClimatica(inputBuscaLocalizacao);
    }
);