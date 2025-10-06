const form = $("#formRegistration");
const resultDiv = $("#result");
const resultList = $("#resultList");
const profileInput = $("#profilePhoto");
const photoPreview = $("#photoPreview");

let photoDataURL = "";
let isValidPhoto = false;

// montar o HTML de resultados com os dados do usuário
function buildUserData() {
    const fields = {
        "Nome": `${$("#firstName").val()} ${$("#secondName").val()}`,
        "Email": $("#emailUser").val(),
        "Telefone": $("#phoneUser").val(),
        "Cidade": $("#cityName").val(),
        "Estado": $("#stateName").val(),
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

// Reseta o preview da foto
function resetPhotoPreview() {
    photoPreview.attr("src", "");
    $(".profile-photo-container").removeClass("has-image");
    photoDataURL = "";
    isValidPhoto = false;
    $(".invalid-feedback-photo").remove();
    photoPreview.removeClass("is-invalid");
}

// validação do form
$(document).ready(function() {

    // máscaras 
    $("#phoneUser").mask("(00) 00000-0000");   
    $("#cep").mask("00000-000");
    $("#emailUser").attr("type", "email");

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

        // validação da foto
        if (!isValidPhoto && !$(".invalid-feedback-photo").length) {
            photoPreview.addClass("is-invalid");
            photoPreview.after('<div class="invalid-feedback invalid-feedback-photo d-block">Por favor, escolha uma foto.</div>');
        }

        // validação do form Bootstrap
        this.classList.add("was-validated");
        if (!this.checkValidity() || !isValidPhoto) return;

        // tudo OK, montar e mostrar dados
        showResult(buildUserData());

        // reset geral
        form[0].reset();
        this.classList.remove("was-validated");
        form.find(".is-invalid").removeClass("is-invalid");
        resetPhotoPreview();
    });

});
