const form = $("#formRegistration");
const resultDiv = $("#result");
const resultList = $("#resultList");
const profileInput = $("#profilePhoto");
const photoPreview = $("#photoPreview");

const estados = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
//percorre o array e adiciona cada estado ao select 
estados.forEach(uf => $("#stateName").append(`<option value="${uf}">${uf}</option>`));

let photoDataURL = "";
let isValidPhoto = false;
let preenchidoPorCep = false;

// montar o HTML de resultados com os dados do usuário
function buildUserData() {
    const fields = {
        "Nome": `${$("#firstName").val()} ${$("#secondName").val()}`,
        "Email": $("#emailUser").val(),
        "Telefone": $("#phoneUser").val(),
        "Cidade": $("#cityName").val(),
        "Estado": $("#stateName").val(),
        "Logradouro": $("#address").val(),
        "CEP": $("#cep").val()
    };

    //cria lista dinâmica para cada campo 
    let html = Object.entries(fields)
        .map(([label, value]) => `<li><strong>${label}:</strong> ${value}</li>`)
        .join("");

    // adiciona a foto se houver
    if (photoDataURL) {
        html += `<li><strong>Foto:</strong><br><img src="${photoDataURL}" alt="Foto do usuário" class="result-photo"></li>`;
    }

    return html;
}

// exibir o resultado na tela 
function showResult(dataHTML) {
    resultList.html(dataHTML);
    resultDiv.fadeIn(500);
}

// reseta o preview da foto
function resetPhotoPreview() {
    photoPreview.attr("src", "");
    $(".profile-photo-container").removeClass("has-image");
    photoDataURL = "";
    isValidPhoto = false;
    profileInput.val('');
    $(".invalid-feedback-photo").remove();
    photoPreview.removeClass("is-invalid");
}

// validação do form
$(document).ready(function() {

    // validação de tamanho e preenchimento dos inputs
    $("#formRegistration").validate({
        rules: {
            firstName: {
                required: true,
                minlength: 3
            },
            secondName: {
                required: true,
                minlength: 3
            },
            emailUser: {
                required: true,
                email: true,
                minlength: 5
            },
            phoneUser: {
                required: true,
                minlength: 14 
            },
            cep: {
                required: true,
                minlength: 9
            },
            cityName: {
                required: true,
            },
            stateName: {
                required: true,
            },
            invalidCheck: {
                required: true
            },
            address: {
                required: false
            }
        },
        messages: {
            firstName: {
                required: "Por favor, digite seu primeiro nome.",
                minlength: "O nome deve ter no mínimo 3 caracteres."
            },
            secondName: {
                required: "Por favor, digite seu sobrenome.",
                minlength: "O sobrenome deve ter no mínimo 3 caracteres."
            },
            emailUser: {
                required: "Por favor, digite seu e-mail.",
                email: "Digite um e-mail válido.",
                minlength: "O e-mail deve ter pelo menos 5 caracteres."
            },
            phoneUser: {
                required: "Por favor, digite seu telefone.",
                minlength: "Digite o telefone completo no formato (00) 00000-0000."
            },
            cep: {
                required: "Por favor, digite seu CEP.",
                minlength: "O CEP deve ter 8 dígitos (00000-000)."
            },
            cityName: {
                required: "Por favor, selecione sua cidade.",
            },
            stateName: {
                required: "Por favor, selecione seu estado.",
            },
            invalidCheck: {
                required: "Você deve concordar, antes de continuar."
            }
        },
        errorElement: "div", // cada elemento de erro sera uma div
        errorClass: "invalid-feedback d-block", // classes do bootstrap p erro 
        highlight: function (element) { // coloca borda vermelha no input com erro 
            $(element).addClass("is-invalid").removeClass("is-valid");
        },
        unhighlight: function (element) { // coloca borda verde no input ok 
            $(element).removeClass("is-invalid").addClass("is-valid");
        }
    });
    // máscaras para telefone e cep 
    $("#phoneUser").mask("(00) 00000-0000");   
    $("#cep").mask("00000-000");

    // popula cidades via IBGE
    function populateCities(uf, selectedCity){
        //limpa o select de cidades 
        $("#cityName").empty().append('<option value="">Selecione a cidade</option>');
        // se não tiver estado selecionado, sai
        if(!uf) return;
        // consulta as cidades do estado selecionado via API do IBGE 
        $.getJSON(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`, function(data){
            // adiciona cada cidade ao select 
            data.forEach(cidade => {
                $("#cityName").append(`<option value="${cidade.nome}">${cidade.nome}</option>`);
            });
            // se tiver cidade selecionada (via cep), marca ela 
            if(selectedCity) $("#cityName").val(selectedCity);
        });
    }

    // consulta CEP via ViaCEP
    function lookupCEP(cep){
        // remove caracteres nao numericos do cep 
        cep = cep.replace(/\D/g,'');
        // se cep não tiver 8 digitos, sai 
        if(cep.length !== 8) return;
        // consulta cep via API do ViaCEP 
        $.getJSON(`https://viacep.com.br/ws/${cep}/json/`, function(data){
            console.log("Retorno ViaCEP:", data);
            // se nao tiver erro, preenche estado e cidade 
            if(!data.erro){
                preenchidoPorCep = true; // flag pra evitar conflito com onchange do estado
                $("#stateName").val(data.uf); // preenche estado
                populateCities(data.uf, data.localidade); // preenche cidades e seleciona a correta 
                setTimeout(() => { preenchidoPorCep = false; }, 100); // libera pra mudanças manuais
            }
        });
    }

    // quando o usuario sair do campo cep ou digitar, faz a consulta
    $("#cep").on("blur keyup", function(){
    let cep = $(this).val().replace(/\D/g,'');
    if (cep.length === 8) {
        lookupCEP(cep);
    }
    });

    // quando o usuario sair do campo estado, faz a consulta
    $("#stateName").on("change", function(){
        if(preenchidoPorCep) return; // não sobrescreve se veio do CEP
        populateCities($(this).val());
    });

    // aviso para CEP se cidade selecionada manualmente
    $("#cityName").on("change", function(){
        if(preenchidoPorCep) {
            $("#cepWarning").hide();
            return;
        }
        if($(this).val()){ // se cidade selecionada, mostra aviso de digitar o cep correto 
            $("#cepWarning").fadeIn();
        } else {
            $("#cepWarning").fadeOut();
        }
    });

    // esconde aviso quando o usuário digita no CEP
    $("#cep").on("input", function(){
        $("#cepWarning").fadeOut();
    });

    // preview da foto de perfil e validação
    profileInput.on("change", function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader(); //lê arquivo como base 64
            reader.onload = function(e) {
                photoDataURL = e.target.result;
                photoPreview.attr("src", photoDataURL);
                $(".profile-photo-container").addClass("has-image");

                isValidPhoto = true;
                photoPreview.removeClass("is-invalid");
                $(".invalid-feedback.d-block").remove();
            };
            reader.readAsDataURL(file);
        } else {
            resetPhotoPreview();
        }
    });

    // submissão do formulário
    form.on("submit", function(e) {
        e.preventDefault();

        // validação do plugin
        if (!form.valid()) return; 

        // validação extra da foto
        if (!isValidPhoto) {
            if (!$(".invalid-feedback-photo").length) {
                photoPreview.addClass("is-invalid");
                photoPreview.after('<div class="invalid-feedback invalid-feedback-photo d-block">Por favor, escolha uma foto.</div>');
            }
            return;
        }

        // tudo OK, montar e mostrar dados
        showResult(buildUserData());

        // reset geral
        form[0].reset();
        form.find(".is-invalid, .is-valid").removeClass("is-invalid is-valid");
        form.find(".invalid-feedback").remove();
        resetPhotoPreview();
    });
});
