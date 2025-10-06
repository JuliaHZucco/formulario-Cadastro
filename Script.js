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
                minlength: 3
            },
            stateName: {
                required: true,
                minlength: 2
            },
            invalidCheck: {
                required: true
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
                required: "Por favor, digite sua cidade.",
                minlength: "A cidade deve ter no mínimo 3 caracteres."
            },
            stateName: {
                required: "Por favor, digite seu estado.",
                minlength: "O estado deve ter no mínimo 2 caracteres."
            },
            invalidCheck: {
                required: "Você deve concordar, antes de continuar."
            }
        },
        errorElement: "div",
        errorClass: "invalid-feedback d-block", 
        highlight: function (element) {
            $(element).addClass("is-invalid").removeClass("is-valid");
        },
        unhighlight: function (element) {
            $(element).removeClass("is-invalid").addClass("is-valid");
        }
    });
    // máscaras 
    $("#phoneUser").mask("(00) 00000-0000");   
    $("#cep").mask("00000-000");

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
