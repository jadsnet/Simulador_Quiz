// ==========================================
// ESTADO GLOBAL
// ==========================================

let questions = [];
let currentQuestion = 0;
let userAnswers = [];

let imageMap = {};

let timerSeconds = 0;
let timerInterval = null;

const STORAGE_KEY =
"simulador_v2_progresso";

// ==========================================
// ELEMENTOS
// ==========================================

const setupScreen =
document.getElementById("setupScreen");

const quizScreen =
document.getElementById("quizScreen");

const resultScreen =
document.getElementById("resultScreen");

const loadingOverlay =
document.getElementById("loadingOverlay");

const questionText =
document.getElementById("questionText");

const questionImage =
document.getElementById("questionImage");

const optionsContainer =
document.getElementById("optionsContainer");

const progressBar =
document.getElementById("progressBar");

// ==========================================
// EVENTOS
// ==========================================

document
.getElementById("startBtn")
.addEventListener(
    "click",
    startSimulation
);

document
.getElementById("nextBtn")
.addEventListener(
    "click",
    nextQuestion
);

document
.getElementById("prevBtn")
.addEventListener(
    "click",
    previousQuestion
);

document
.getElementById("restartBtn")
.addEventListener(
    "click",
    ()=>location.reload()
);

// ==========================================
// INICIAR
// ==========================================

async function startSimulation() {
    const fileInput = document.getElementById("csvFile");
    if (!fileInput || !fileInput.files[0]) {
        alert("Por favor, selecione um arquivo CSV.");
        return;
    }

    showLoading(true); // Ativa o loading

    try {
        await loadImages();
        loadCSV();
    } catch (error) {
        console.error("Erro na inicialização:", error);
        showLoading(false); // FORÇA o fechamento do loading se der erro
        alert("Erro ao processar: " + error.message);
    }
}

// ==========================================
// LOADING
// ==========================================

function showLoading(show){

    if(show){

        loadingOverlay
        .classList
        .remove("hidden");

    }else{

        loadingOverlay
        .classList
        .add("hidden");

    }

}

// ==========================================
// CARREGA IMAGENS
// ==========================================

async function loadImages(){

    imageMap = {};

    const files =
    document
    .getElementById(
        "imageFolder"
    )
    .files;

    for(const file of files){

        imageMap[file.name] =
        URL.createObjectURL(file);

    }

}

// ==========================================
// CSV
// ==========================================

function loadCSV(){

    const file =
    document
    .getElementById(
        "csvFile"
    )
    .files[0];

    if(!file){

        alert(
            "Selecione um arquivo CSV."
        );

        showLoading(false);

        return;
    }

    Papa.parse(file,{

        header:true,

        skipEmptyLines:true,

        encoding:"UTF-8",

        complete:function(result){

            questions =
            result.data;

            prepareQuestions();

        },

        error:function(){

            alert(
                "Erro ao importar CSV."
            );

            showLoading(false);

        }

    });

}

// ==========================================
// PREPARAÇÃO
// ==========================================

function prepareQuestions(){

    const limit =
    parseInt(
        document
        .getElementById(
            "questionLimit"
        )
        .value
    );

    const shuffle =
    document
    .getElementById(
        "shuffleQuestions"
    )
    .checked;

    if(shuffle){

        questions =
        questions.sort(
            ()=>Math.random()-0.5
        );

    }

    questions =
    questions.slice(
        0,
        limit
    );

    document
    .getElementById(
        "totalQuestions"
    )
    .textContent =
    questions.length;

    startQuiz();

}

// ==========================================
// START QUIZ
// ==========================================

function startQuiz(){

    setupScreen
    .classList
    .add("hidden");

    quizScreen
    .classList
    .remove("hidden");

    loadProgress();

    startTimer();

    renderQuestion();

    showLoading(false);

}

// ==========================================
// TIMER
// ==========================================

function startTimer(){

    if(timerInterval){

        clearInterval(
            timerInterval
        );

    }

    timerInterval =
    setInterval(()=>{

        timerSeconds++;

        updateTimer();

        saveProgress();

    },1000);

}

function updateTimer(){

    const min =
    String(
        Math.floor(
            timerSeconds/60
        )
    ).padStart(2,"0");

    const sec =
    String(
        timerSeconds%60
    ).padStart(2,"0");

    document
    .getElementById(
        "timer"
    )
    .textContent =
    `${min}:${sec}`;

}

// ==========================================
// QUESTÃO
// ==========================================

function renderQuestion(){

    const q =
    questions[currentQuestion];

    if(!q) return;

    updateDashboard();

    renderCategory(q);

    renderQuestionText(q);

    renderQuestionImage(q);

    renderOptions(q);

    updateProgress();

}

// ==========================================
// DASHBOARD
// ==========================================

function updateDashboard(){

    document
    .getElementById(
        "currentQuestion"
    )
    .textContent =
    currentQuestion + 1;

    document
    .getElementById(
        "answeredCount"
    )
    .textContent =
    userAnswers.filter(
        a=>a
    ).length;

}

// ==========================================
// CATEGORIA
// ==========================================

function renderCategory(q){

    const badge =
    document
    .getElementById(
        "questionCategory"
    );

    if(
        q.categoria &&
        q.categoria.trim()
    ){

        badge.textContent =
        q.categoria;

        badge.classList
        .remove("hidden");

    }else{

        badge.classList
        .add("hidden");

    }

}

// ==========================================
// TEXTO
// ==========================================

function renderQuestionText(q){

    questionText.innerHTML =
    q.pergunta || "";

}

// ==========================================
// IMAGEM QUESTÃO
// ==========================================

function renderQuestionImage(q){

    if(
        q.imagem_pergunta &&
        imageMap[
            q.imagem_pergunta
        ]
    ){

        questionImage.src =
        imageMap[
            q.imagem_pergunta
        ];

        questionImage
        .classList
        .remove("hidden");

    }else{

        questionImage
        .classList
        .add("hidden");

    }

}
// ==========================================
// OPÇÕES
// ==========================================

function renderOptions(q){

    optionsContainer.innerHTML = "";

    const type =
    (q.tipo || "single")
    .trim()
    .toLowerCase();

    const multipleAlert =
    document.getElementById(
        "multipleAlert"
    );

    if(type === "multiple"){

        multipleAlert
        .classList
        .remove("hidden");

    }else{

        multipleAlert
        .classList
        .add("hidden");

    }

    let options = [];

    ["a","b","c","d","e"].forEach(letter=>{

        const text =
        q[`alt_${letter}`];

        const image =
        q[`img_${letter}`];

        if(text || image){

            options.push({
                letter:
                letter.toUpperCase(),

                text,
                image
            });

        }

    });

    const shuffleAnswers =
    document
    .getElementById(
        "shuffleAnswers"
    )
    .checked;

    if(shuffleAnswers){

        options =
        options.sort(
            ()=>Math.random()-0.5
        );

    }

    options.forEach(option=>{

        createOption(
            option,
            type
        );

    });

}

// ==========================================
// CRIA OPÇÃO
// ==========================================

function createOption(
    option,
    type
){

    const div =
    document.createElement(
        "div"
    );

    div.className =
    "option";

    const saved =
    userAnswers[
        currentQuestion
    ] || [];

    const checked =
    saved.includes(
        option.letter
    );

    if(checked){

        div.classList.add(
            "selected"
        );

    }

    const input =
    document.createElement(
        "input"
    );

    input.type =
    type === "multiple"
    ? "checkbox"
    : "radio";

    input.name =
    "questionOption";

    input.value =
    option.letter;

    input.checked =
    checked;

    input.addEventListener(
        "change",
        ()=>{
            saveAnswer(
                option.letter,
                type
            );
        }
    );

    const label =
    document.createElement(
        "label"
    );

    let html = `
        <strong>
            ${option.letter})
        </strong>
        ${option.text || ""}
    `;

    if(
        option.image &&
        imageMap[
            option.image
        ]
    ){

        html += `
        <br>
        <img
            src="${
                imageMap[
                    option.image
                ]
            }"
            class="zoomable-image">
        `;

    }

    label.innerHTML = html;

    div.appendChild(
        input
    );

    div.appendChild(
        label
    );

    optionsContainer
    .appendChild(div);

    activateImageZoom();

}

// ==========================================
// ZOOM IMAGENS
// ==========================================

function activateImageZoom(){

    document
    .querySelectorAll(
        ".zoomable-image"
    )
    .forEach(img=>{

        img.onclick =
        function(){

            document
            .getElementById(
                "modalImage"
            )
            .src =
            this.src;

            document
            .getElementById(
                "imageModal"
            )
            .style.display =
            "flex";

        };

    });

}

document
.getElementById(
    "imageModal"
)
.addEventListener(
    "click",
    ()=>{

        document
        .getElementById(
            "imageModal"
        )
        .style.display =
        "none";

    }
);

// ==========================================
// SALVAR RESPOSTA
// ==========================================

function saveAnswer(
    answer,
    type
){

    if(type === "multiple"){

        if(
            !Array.isArray(
                userAnswers[
                    currentQuestion
                ]
            )
        ){

            userAnswers[
                currentQuestion
            ] = [];

        }

        const answers =
        userAnswers[
            currentQuestion
        ];

        if(
            answers.includes(
                answer
            )
        ){

            userAnswers[
                currentQuestion
            ] =
            answers.filter(
                a=>a!==answer
            );

        }else{

            answers.push(
                answer
            );

        }

    }else{

        userAnswers[
            currentQuestion
        ] = [answer];

    }

    saveProgress();

}

// ==========================================
// NAVEGAÇÃO
// ==========================================

function nextQuestion(){

    if(
        currentQuestion <
        questions.length - 1
    ){

        currentQuestion++;

        renderQuestion();

    }else{

        finishQuiz();

    }

}

function previousQuestion(){

    if(
        currentQuestion > 0
    ){

        currentQuestion--;

        renderQuestion();

    }

}

// ==========================================
// PROGRESSO
// ==========================================

function updateProgress(){

    const percent =
    (
        (
            currentQuestion + 1
        )
        /
        questions.length
    ) * 100;

    progressBar.style.width =
    percent + "%";

}

// ==========================================
// LOCAL STORAGE
// ==========================================

function saveProgress(){

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({

            currentQuestion,

            userAnswers,

            timerSeconds

        })
    );

}

function loadProgress(){

    const saved =
    localStorage.getItem(
        STORAGE_KEY
    );

    if(!saved) return;

    try{

        const data =
        JSON.parse(saved);

        currentQuestion =
        data.currentQuestion || 0;

        userAnswers =
        data.userAnswers || [];

        timerSeconds =
        data.timerSeconds || 0;

        updateTimer();

    }catch(err){

        console.error(err);

    }

}

// ==========================================
// NORMALIZA RESPOSTAS
// ==========================================

function normalizeAnswer(answer){

    if(!answer){

        return [];

    }

    return answer
        .replace(/"/g,"")
        .replace(/\s/g,"")
        .toUpperCase()
        .split(",")
        .sort();

}

function arraysEqual(a,b){

    if(
        a.length !== b.length
    ){

        return false;

    }

    for(
        let i=0;
        i<a.length;
        i++
    ){

        if(
            a[i] !== b[i]
        ){

            return false;

        }

    }

    return true;

}

// ==========================================
// FINALIZA
// ==========================================

function finishQuiz(){

    clearInterval(
        timerInterval
    );

    quizScreen
    .classList
    .add("hidden");

    resultScreen
    .classList
    .remove("hidden");

    calculateResults();

    localStorage.removeItem(
        STORAGE_KEY
    );

}

// ==========================================
// RESULTADOS
// ==========================================

function calculateResults(){

    let correct = 0;
    let wrong = 0;

    const review =
    document.getElementById(
        "reviewContainer"
    );

    review.innerHTML = "";

    questions.forEach(
        (
            q,
            index
        )=>{

        const user =
        userAnswers[index]
        || [];

        const right =
        normalizeAnswer(
            q.correta
        );

        const ok =
        arraysEqual(
            [...user].sort(),
            right
        );

        if(ok){

            correct++;

        }else{

            wrong++;

        }

        createReviewItem(
            q,
            index,
            user,
            right,
            ok
        );

    });

    document
    .getElementById(
        "correctCount"
    )
    .textContent =
    correct;

    document
    .getElementById(
        "wrongCount"
    )
    .textContent =
    wrong;

    document
    .getElementById(
        "scorePercent"
    )
    .textContent =
    Math.round(
        (
            correct /
            questions.length
        ) * 100
    ) + "%";

}

// ==========================================
// REVIEW
// ==========================================

function createReviewItem(
    q,
    index,
    user,
    right,
    ok
){

    const div =
    document.createElement(
        "div"
    );

    div.className =
    `review-item ${
        ok
        ? "correct"
        : "wrong"
    }`;

    div.dataset.result =
    ok
    ? "correct"
    : "wrong";

    div.innerHTML = `
        <h3>
            Questão ${index+1}
        </h3>

        <div class="user-answer">
            Sua resposta:
            ${
                user.length
                ? user.join(", ")
                : "Não respondida"
            }
        </div>

        <div class="correct-answer">
            Resposta correta:
            ${right.join(", ")}
        </div>

        <div class="feedback">
            ${q.feedback || ""}
        </div>
    `;

    document
    .getElementById(
        "reviewContainer"
    )
    .appendChild(div);

}

// ==========================================
// FILTROS
// ==========================================

document
.getElementById(
    "showOnlyErrors"
)
.addEventListener(
    "click",
    ()=>{

        document
        .querySelectorAll(
            ".review-item"
        )
        .forEach(item=>{

            item.style.display =
            item.dataset.result === "wrong"
            ? "block"
            : "none";

        });

    }
);

document
.getElementById(
    "showAllReview"
)
.addEventListener(
    "click",
    ()=>{

        document
        .querySelectorAll(
            ".review-item"
        )
        .forEach(item=>{

            item.style.display =
            "block";

        });

    }
);
