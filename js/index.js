import { recuperarPrevisaoTempo } from "./acessarPrevisaoTempo.js";

export function montarDashboard(dados) {
    let cardPrincipal = document.getElementById("cardPrincipal");
    let cardTemperatura = document.getElementById("cardTemperatura");
    let cardVento = document.getElementById("cardVento");
    let devoLevarGuardaChuva = document.getElementById("devoLevarGuardaChuva");

    // Capitaliza a descrição da previsão que é retornada com letras minusculas
    let descricao = dados.descricao.toLowerCase()
        .replace(
            /([^a-záéíóúâêîôãõç]|^)([a-záéíóúâêîôãõç])(?=[a-záéíóúâêîôãõç]{2})/g
            , function(_, g1, g2) {
                return g1 + g2.toUpperCase(); 
        });

    cardPrincipal.innerHTML = `<div style="padding:24pt;">
        <p class="titulo1">${dados.localidade}</p>
        <p class="subTitulo1">${descricao}</p>
        </div>
        <p><img src="http://openweathermap.org/img/wn/${dados.icone}@2x.png"></p>`;
    
    cardTemperatura.innerHTML = `<p class="titulo2">Temperatura agora: ${dados.temperatura} °C</p>
        <p>Máxima: ${dados.maxima} °C | Mínima: ${dados.minima} °C</p>`;
    
    cardVento.innerHTML = `<p class="titulo2">Velocidade do vento: ${dados.velocidadeVento} m/s</p>`
        + (dados.rajada != undefined ? '<p>Vel. rajada: ' + dados.rajada + ' m/s</p>' : "<p>&nbsp;</p>");
    
    devoLevarGuardaChuva.innerHTML = '<p class="tituloGrande">' + (dados.devoLevarGuardaChuva ? 'Não esqueça de levar seu guarda-chuva!' : 'Deixe o guarda-chuva em casa.') + '</p>';

}

window.onload = function() {
        
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(pos) {
                recuperarPrevisaoTempo(pos.coords.latitude, pos.coords.longitude).then(
                    function(previsaoTempo) {
                        montarDashboard(previsaoTempo);
                    }
                );
                
                return;
            }
        );
    } else {
        alert("Não foi possível recuperar a localização a partir do browser")
        return;
    }
};