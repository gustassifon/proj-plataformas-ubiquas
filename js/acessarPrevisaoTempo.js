// ApiKey para usar o endpoint que retornar uma localidade a partir do nome ou coordenadas
const geocodingApiKey = "ed49200a97ede67fec5954a3186e3d0f";

// ApiKey para usar a api que retorna a condição do tempo na localidade passada como parâmetro
const weatherApiKey = "db8b7392017d9a874c61dffd71811c8d";

// Determinar o máximo de resultados retornado pela api de geocoding
const geocodingLimiteResultado = 10;

// Cria uma variável global para as requisições feitas para o autoCompletar, dessa forma é possível abortar uma requisição feita anteriormente enquanto
// o usuário digita uma nova letra
let requestAutoCompletar = new XMLHttpRequest();

// Recebe um JSON retornado pela api de geocoding
function montarNomeLocalidade (local) {

    // Testa para saber se o objeto local tem conteúdo, se não retorna um valor nulo.
    if (!local) {
        return null;
    }

    // Atribui o nome da localidade com um valor que sempre será retornado pela api.
    let nomeLocal = local.name;

    // O objeto JSON retornado para api, pode conter nomes para algumas linguas. Testo para saber se existe e se existir pego a versão de nome em português
    if (local.hasOwnProperty("local_names")) {
        let nomeEmPortugues = local.local_names;

        if (nomeEmPortugues.hasOwnProperty("pt")) {
            nomeLocal = nomeEmPortugues.pt;
        } 
    } 

    // Adiciono um separador para colocar a sigla do país
    nomeLocal += " - ";

    // Adiciono infomação de estado e país. Estado nem sempre existe então faço o teste para saber se devo adicionar
    if (local.hasOwnProperty("state")) {
        nomeLocal += local.state + ", " + local.country;
    } else {
        nomeLocal += local.country;
    }

    return nomeLocal;
}

// Função principal do sistema. Busca a previsão do tempo
export async function recuperarPrevisaoTempo(latitude, longitude) {

    const urlLocalizacao = `https://api.openweathermap.org/data/2.5/weather?units=metric&lang=pt&lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}`;
    const porcentagemChuvoso = 50;
    
    let responseLocalizacao = await fetch(urlLocalizacao);
    let devoLevarGuardaChuva = false;
    let localidade = null;
    var jsonRetorno = new Object();

    if (responseLocalizacao.ok) {

        let previsaoTempo = await responseLocalizacao.json();
        
        // console.log("Imprime previsaoTempo da função recuperarPrevisaoTempo");
        console.log(previsaoTempo);
        // console.log("Imprime atributo clouds.all da variavel previsaoTempo da função recuperarPrevisaoTempo");
        // console.log(previsaoTempo.clouds.all);
        // console.log("Imprime atributo hasOwnProperty(rain) da variavel previsaoTempo da função recuperarPrevisaoTempo");
        // console.log(previsaoTempo.hasOwnProperty("rain"));
        
        // A propriedade clouds, indica a porcentagem de nuvens no céu. Se for maior ou igual a 50%, o sistema decide pode levar um guarda-chuva ou se exis-
        // tir a propriedade rain no JSON retornado, significa que está chuvendo, então, esta propriedade determina que sim, deve-se levar o guarda-chuva
        devoLevarGuardaChuva = (previsaoTempo.clouds.all >= porcentagemChuvoso) || (previsaoTempo.hasOwnProperty("rain")) ? true: false;

        const urlReverseGeocoding = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=${geocodingLimiteResultado}&appid=${geocodingApiKey}`;
        let responseReverseGeocoding = await fetch(urlReverseGeocoding);

        if (responseReverseGeocoding.ok) {
            localidade = await responseReverseGeocoding.json();
        }

        jsonRetorno = {
            "localidade" : montarNomeLocalidade(localidade[0]),
            "devoLevarGuardaChuva" : devoLevarGuardaChuva,
            "temperatura" : previsaoTempo.main.temp,
            "minima" : previsaoTempo.main.temp_min,
            "maxima" : previsaoTempo.main.temp_max,
            "velocidadeVento" : previsaoTempo.wind.speed,
            "descricao" : previsaoTempo.weather[0].description,
            "titulo" : previsaoTempo.weather[0].main,
            "icone": previsaoTempo.weather[0].icon,
            "rajada": previsaoTempo.wind.gust
        };

    } else {
        jsonRetorno = {
            "erro" : "Erro - " + responseLocalizacao.status + ": " + responseLocalizacao.statusText
        }; 
    }

    // console.log("Imprime localidade da função recuperarPrevisaoTempo");
    // console.log(localidade);

    //h2.innerHTML = "Para sair em " + montarNomeLocalidade(localidade[0]) + " devo levar guarda-chuva?<br />"
    //h2.innerHTML += devoLevarGuardaChuva ? "SIM" : "NÃO";
    return jsonRetorno;
}

// A função que ajudará no auto completar da api. Importante ressaltar que a api só retorna valores exatos
export function autoCompletar(event) {

    // Monta o url usado para buscar uma localidade a partir do nome na api de geocoding, necessário acrescentar o valor de "q="
    const urlAutoCompletar = `http://api.openweathermap.org/geo/1.0/direct?limit=${geocodingLimiteResultado}&appid=${geocodingApiKey}&q=`;

    // Junto com o evento é possível recuperar o objeto, no caso o <input> de busca
    let input = event.target;

    // Recupera o <datalist> que será povoado com as sugestões de localização recuperadas da api
    let listaOpcoesLocalizacao = input.list;

    // Número mínimo de caracteres necessários para começar a disparar a busca de localizações.
    let numMinCaracteres = 3;

    if (input.value.length < numMinCaracteres ) { 
        return;
    } else { 

        // Aborta qualquer requisição feita anteriormente para fazer uma nova
        requestAutoCompletar.abort();

        requestAutoCompletar.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {

                // Pega o JSON retornado pela api
                let response = JSON.parse(this.responseText);

                // Limpa o <datalist> para repopula-lo
                listaOpcoesLocalizacao.innerHTML = "";

                response.forEach(
                    function(item) {
                        
                        // Cria um novo elemento <option>.
                        let opcao = document.createElement('option');
                        opcao.className = "option";
                        
                        // Monta o id do option com a latitude e longitude da localização para posterior
                        // consulta na api de tempo (wheather)
                        opcao.id = "lat:" + item.lat + "|lon:" + item.lon;

                        // Atribui o nome da localidade
                        opcao.value = montarNomeLocalidade(item);

                        listaOpcoesLocalizacao.appendChild(opcao);
                    }
                );
            }
        };

        let sliceInput = input.value.indexOf(" - ") === -1 ? input.value.length : input.value.indexOf(" - ");
        requestAutoCompletar.open("GET", urlAutoCompletar + input.value.slice(0, sliceInput), true);
        requestAutoCompletar.send();
    }
}