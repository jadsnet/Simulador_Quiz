let questions = [];
let currentQuestion = 0;
let userAnswers = [];

let imageMap = {};

let seconds = 0;
let timerInterval;

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const questionText = document.getElementById("questionText");
const questionImage = document.getElementById("questionImage");
const optionsContainer = document.getElementById("optionsContainer");

const questionNumber = document.getElementById("questionNumber");
const totalQuestions = document.getElementById("totalQuestions");

const progressBar = document.getElementById("progressBar");

document
.getElementById("startBtn")
.addEventListener("click", startImport);

async function startImport(){

    await loadImages();

    loadCSV();

}

async function loadImages(){

    imageMap = {};

    const files =
    document.getElementById("imageFolder").files;

    for(const file of files){

        imageMap[file.name] =
        URL.createObjectURL(file);

    }

}

function loadCSV(){

    const file =
    document.getElementById("csvFile").files[0];

    if(!file){

        alert("Selecione um CSV");
        return;
    }

    Papa.parse(file,{

        header:true,
        skipEmptyLines:true,
        encoding:"UTF-8",

        complete:function(results){

            questions = results.data;

            const limit =
            parseInt(
                document.getElementById("questionLimit").value
            );

            const shuffle =
            document.getElementById("shuffleQuestions").checked;

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

    });

}

function startQuiz(){

    startScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");

    startTimer();

    showQuestion();

}

function startTimer(){

    timerInterval = setInterval(()=>{

        seconds++;

        const mins =
        String(
            Math.floor(seconds/60)
        ).padStart(2,"0");

        const secs =
        String(
            seconds%60
        ).padStart(2,"0");

        document
        .getElementById("timer")
        .textContent =
        `${mins}:${secs}`;

    },1000);

}

function showQuestion(){

    const q =
    questions[currentQuestion];

    questionNumber.textContent =
    currentQuestion + 1;

    progressBar.style.width =
    (
        (currentQuestion+1)
        /
        questions.length
    )*100 + "%";

    questionText.innerHTML =
    q.pergunta || "";

    if(
        q.imagem_pergunta &&
        imageMap[q.imagem_pergunta]
    ){

        questionImage.src =
        imageMap[q.imagem_pergunta];

        questionImage.classList.remove(
            "hidden"
        );

    }else{

        questionImage.classList.add(
            "hidden"
        );

    }

    optionsContainer.innerHTML = "";

    const type =
    (q.tipo || "single")
    .toLowerCase();

    const letters =
    ["a","b","c","d","e"];

    letters.forEach(letter=>{

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

        const div =
        document.createElement("div");

        div.classList.add("option");

        const input =
        document.createElement("input");

        input.type =
        type === "multiple"
        ? "checkbox"
        : "radio";

        input.name =
        "questionOption";

        input.value =
        letter.toUpperCase();

        const saved =
        userAnswers[currentQuestion]
        || [];

        if(
            saved.includes(
                letter.toUpperCase()
            )
        ){

            input.checked = true;

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
            style="max-width:300px;">
            `;

        }

        div.appendChild(input);

        const span =
        document.createElement("span");

        span.innerHTML = html;

        div.appendChild(span);

        optionsContainer.appendChild(div);

    });

}

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

}

document
.getElementById("nextBtn")
.addEventListener("click",()=>{

    if(
        currentQuestion <
        questions.length-1
    ){

        currentQuestion++;

        showQuestion();

    }else{

        finishQuiz();

    }

});

document
.getElementById("prevBtn")
.addEventListener("click",()=>{

    if(currentQuestion>0){

        currentQuestion--;

        showQuestion();

    }

});

function normalizeAnswer(answer){

    if(!answer) return [];

    return answer
        .replace(/"/g,"")
        .replace(/\s/g,"")
        .toUpperCase()
        .split(",")
        .sort();

}

function arraysEqual(a,b){

    if(a.length!==b.length)
        return false;

    for(let i=0;i<a.length;i++){

        if(a[i]!==b[i])
            return false;

    }

    return true;

}

function finishQuiz(){

    clearInterval(timerInterval);

    quizScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");

    let correct = 0;

    const review =
    document.getElementById(
        "reviewContainer"
    );

    review.innerHTML = "";

    questions.forEach((q,index)=>{

        const user =
        userAnswers[index] || [];

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

            review.innerHTML += `
            <div class="review-item">

            <h3>
            Questão ${index+1}
            </h3>

            <p>
            Sua resposta:
            ${user.join(", ")}
            </p>

            <p>
            Correta:
            ${right.join(", ")}
            </p>

            <p>
            ${q.feedback || ""}
            </p>

            </div>
            `;
        }

    });

    const wrong =
    questions.length - correct;

    const percent =
    Math.round(
        correct
        /
        questions.length
        *100
    );

    document
    .getElementById("correctCount")
    .textContent =
    correct;

    document
    .getElementById("wrongCount")
    .textContent =
    wrong;

    document
    .getElementById("scorePercent")
    .textContent =
    percent + "%";

}
