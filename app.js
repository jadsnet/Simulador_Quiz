// ======================================
// ESTADO GLOBAL
// ======================================

let questions = [];
let currentQuestion = 0;
let userAnswers = [];

let imageMap = {};

let seconds = 0;
let timerInterval = null;

const STORAGE_KEY = "simulador_progresso";

// ======================================
// ELEMENTOS
// ======================================

const startScreen =
document.getElementById("start-screen");

const quizScreen =
document.getElementById("quiz-screen");

const resultScreen =
document.getElementById("result-screen");

const questionText =
document.getElementById("questionText");

const questionImage =
document.getElementById("questionImage");

const optionsContainer =
document.getElementById("optionsContainer");

const questionNumber =
document.getElementById("questionNumber");

const totalQuestions =
document.getElementById("totalQuestions");

const progressBar =
document.getElementById("progressBar");

const timerDisplay =
document.getElementById("timer");

const loadingOverlay =
document.getElementById("loadingOverlay");

// ======================================
// INICIALIZAÇÃO
// ======================================

document
.getElementById("startBtn")
.addEventListener(
    "click",
    startImport
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
    prevQuestion
);

// ======================================
// IMPORTAÇÃO
// ======================================

async function startImport(){

    showLoading(true);

    await loadImages();

    loadCSV();

}

// ======================================
// CARREGA IMAGENS
// ======================================

async function loadImages(){

    imageMap = {};

    const files =
    document
    .getElementById("imageFolder")
    .files;

    for(const file of files){

        imageMap[file.name] =
        URL.createObjectURL(file);

    }

}

// ======================================
// CSV
// ======================================

function loadCSV(){

    const file =
    document
    .getElementById("csvFile")
    .files[0];

    if(!file){

        alert(
            "Selecione um arquivo CSV"
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

        error:function(error){

            console.error(error);

            alert(
                "Erro ao ler CSV"
            );

            showLoading(false);
        }

    });

}

// ======================================
// PREPARAÇÃO
// ======================================

function prepareQuestions(){

    const limit =
    parseInt(
        document
        .getElementById(
            "questionLimit"
        ).value
    );

    const shuffle =
    document
    .getElementById(
        "shuffleQuestions"
    ).checked;

    if(shuffle){

        questions =
        questions.sort(
            ()=>Math.random()-0.5
        );

    }

    questions =
    questions.slice(0,limit);

    totalQuestions.textContent =
    questions.length;

    startQuiz();

}

// ======================================
// QUIZ
// ======================================

function startQuiz(){

    startScreen
    .classList
    .add("hidden");

    quizScreen
    .classList
    .remove("hidden");

    loadProgress();

    startTimer();

    showQuestion();

    showLoading(false);

}

// ======================================
// TIMER
// ======================================

function startTimer(){

    if(timerInterval){

        clearInterval(
            timerInterval
        );
    }

    timerInterval =
    setInterval(()=>{

        seconds++;

        updateTimer();

        saveProgress();

    },1000);

}

function updateTimer(){

    const mins =
    String(
        Math.floor(seconds/60)
    ).padStart(2,"0");

    const secs =
    String(
        seconds%60
    ).padStart(2,"0");

    timerDisplay.textContent =
    `${mins}:${secs}`;

}

// ======================================
// EXIBIÇÃO
// ======================================

function showQuestion(){

    const q =
    questions[currentQuestion];

    if(!q) return;

    questionNumber.textContent =
    currentQuestion + 1;

    updateProgressBar();

    showCategory(q);

    showQuestionText(q);

    showQuestionImage(q);

    renderOptions(q);

    saveProgress();

}

// ======================================
// CATEGORIA
// ======================================

function showCategory(q){

    const badge =
    document.getElementById(
        "questionCategory"
    );

    if(
        q.categoria &&
        q.categoria.trim()
    ){

        badge.textContent =
        q.categoria;

        badge.classList.remove(
            "hidden"
        );

    }else{

        badge.classList.add(
            "hidden"
        );
    }

}

// ======================================
// TEXTO
// ======================================

function showQuestionText(q){

    questionText.innerHTML =
    q.pergunta || "";

}

// ======================================
// IMAGEM
// ======================================

function showQuestionImage(q){

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

// ======================================
// OPÇÕES
// ======================================

function renderOptions(q){

    optionsContainer.innerHTML =
    "";

    const type =
    (
        q.tipo ||
        "single"
    )
    .trim()
    .toLowerCase();

    const multipleAlert =
    document.getElementById(
        "multipleAlert"
    );

    if(type==="multiple"){

        multipleAlert
        .classList
        .remove("hidden");

    }else{

        multipleAlert
        .classList
        .add("hidden");
    }

    const letters =
    ["a","b","c","d","e"];

    letters.forEach(letter=>{

        createOption(
            q,
            letter,
            type
        );

    });

}

// ======================================
// CRIA OPÇÃO
// ======================================

function createOption(
    q,
    letter,
    type
){

    const optionText =
    q[`alt_${letter}`];

    const optionImage =
    q[`img_${letter}`];

    if(
        !optionText &&
        !optionImage
    ){
        return;
    }

    const optionDiv =
    document.createElement("div");

    optionDiv.className =
    "option";

    const input =
    document.createElement("input");

    input.type =
    type==="multiple"
    ? "checkbox"
    : "radio";

    input.name =
    "questionOption";

    input.value =
    letter.toUpperCase();

    const saved =
    userAnswers[
        currentQuestion
    ] || [];

    if(
        saved.includes(
            letter.toUpperCase()
        )
    ){
        input.checked = true;

        optionDiv.classList.add(
            "selected"
        );
    }

    input.addEventListener(
        "change",
        ()=>{
            saveAnswer(
                letter.toUpperCase(),
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
        ${letter.toUpperCase()})
        </strong>
        ${optionText || ""}
    `;

    if(
        optionImage &&
        imageMap[optionImage]
    ){

        html += `
        <br>
        <img
        src="${imageMap[optionImage]}"
        alt="">
        `;
    }

    label.innerHTML = html;

    optionDiv.appendChild(
        input
    );

    optionDiv.appendChild(
        label
    );

    optionsContainer.appendChild(
        optionDiv
    );

}
// ======================================
// SALVAR RESPOSTA
// ======================================

function saveAnswer(answer,type){

    if(type==="multiple"){

        if(
            !Array.isArray(
                userAnswers[currentQuestion]
            )
        ){

            userAnswers[currentQuestion]=[];

        }

        const arr =
        userAnswers[currentQuestion];

        if(arr.includes(answer)){

            userAnswers[currentQuestion] =
            arr.filter(
                a=>a!==answer
            );

        }else{

            arr.push(answer);

        }

    }else{

        userAnswers[currentQuestion] =
        [answer];

    }

    saveProgress();

}

// ======================================
// NAVEGAÇÃO
// ======================================

function nextQuestion(){

    if(
        currentQuestion <
        questions.length - 1
    ){

        currentQuestion++;

        showQuestion();

    }else{

        finishQuiz();

    }

}

function prevQuestion(){

    if(currentQuestion > 0){

        currentQuestion--;

        showQuestion();

    }

}

// ======================================
// PROGRESS BAR
// ======================================

function updateProgressBar(){

    const percent =
    (
        (currentQuestion+1)
        /
        questions.length
    ) * 100;

    progressBar.style.width =
    percent + "%";

}

// ======================================
// LOCAL STORAGE
// ======================================

function saveProgress(){

    const data = {

        currentQuestion,
        userAnswers,
        seconds

    };

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
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

        seconds =
        data.seconds || 0;

        updateTimer();

    }catch(err){

        console.error(err);

    }

}

// ======================================
// NORMALIZA RESPOSTAS
// ======================================

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

// ======================================
// COMPARAÇÃO
// ======================================

function arraysEqual(a,b){

    if(a.length!==b.length){

        return false;

    }

    for(let i=0;i<a.length;i++){

        if(a[i]!==b[i]){

            return false;

        }

    }

    return true;

}

// ======================================
// FINALIZA
// ======================================

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

// ======================================
// RESULTADOS
// ======================================

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

        const userSorted =
        [...user].sort();

        const ok =
        arraysEqual(
            userSorted,
            right
        );

        if(ok){

            correct++;

        }else{

            wrong++;

            createReviewItem(
                q,
                index,
                user,
                right
            );

        }

    });

    const percent =
    Math.round(
        (
            correct
            /
            questions.length
        ) * 100
    );

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
    percent + "%";

}

// ======================================
// REVIEW
// ======================================

function createReviewItem(
    q,
    index,
    user,
    right
){

    const review =
    document.getElementById(
        "reviewContainer"
    );

    const div =
    document.createElement(
        "div"
    );

    div.className =
    "review-item";

    let html = `
    <h3>
        Questão ${index+1}
    </h3>

    <div class="user-answer">
        Sua resposta:
        ${user.length
            ? user.join(", ")
            : "Não respondida"}
    </div>

    <div class="correct-answer">
        Resposta correta:
        ${right.join(", ")}
    </div>
    `;

    if(q.feedback){

        html += `
        <div class="feedback">
            ${q.feedback
                .replace(
                    /\n/g,
                    "<br>"
                )}
        </div>
        `;
    }

    if(
        q.imagem_pergunta &&
        imageMap[
            q.imagem_pergunta
        ]
    ){

        html += `
        <br>

        <img
        src="${
            imageMap[
                q.imagem_pergunta
            ]
        }"

        style="
            max-width:100%;
            border-radius:12px;
        ">
        `;
    }

    div.innerHTML = html;

    review.appendChild(
        div
    );

}

// ======================================
// FILTROS
// ======================================

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
        .forEach(
            item=>{

                item.style.display =
                "block";

            }
        );

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
        .forEach(
            item=>{

                item.style.display =
                "block";

            }
        );

    }
);

// ======================================
// LOADING
// ======================================

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
