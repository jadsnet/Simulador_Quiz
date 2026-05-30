// =========================
// ARQUIVO: app.js
// VERSÃO CORRIGIDA E MELHORADA
// =========================

let questions = [];
let currentQuestion = 0;
let userAnswers = [];

let seconds = 0;
let timerInterval;

// ELEMENTOS
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const questionText = document.getElementById("questionText");
const questionImage = document.getElementById("questionImage");
const optionsContainer = document.getElementById("optionsContainer");

const questionNumber = document.getElementById("questionNumber");
const totalQuestions = document.getElementById("totalQuestions");

const progressBar = document.getElementById("progressBar");

// BOTÃO START
document
.getElementById("startBtn")
.addEventListener("click", loadCSV);

// =========================
// CARREGAR CSV
// =========================

function loadCSV(){

  const file =
  document.getElementById("csvFile").files[0];

  if(!file){

    alert("Selecione um arquivo CSV");
    return;
  }

  Papa.parse(file,{

    header:true,
    skipEmptyLines:true,
    encoding:"UTF-8",

    complete:function(results){

      questions = results.data;

      // LIMITE
      const limit =
      parseInt(
        document.getElementById("questionLimit").value
      );

      // EMBARALHAR
      const shuffle =
      document.getElementById("shuffleQuestions").checked;

      if(shuffle){

        questions =
        questions.sort(() => Math.random() - 0.5);
      }

      // LIMITAR QUESTÕES
      questions = questions.slice(0, limit);

      totalQuestions.textContent =
      questions.length;

      startQuiz();
    }

  });

}

// =========================
// INICIAR QUIZ
// =========================

function startQuiz(){

  startScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");

  startTimer();

  showQuestion();
}

// =========================
// TIMER
// =========================

function startTimer(){

  timerInterval = setInterval(() => {

    seconds++;

    const mins =
    String(Math.floor(seconds / 60))
    .padStart(2,'0');

    const secs =
    String(seconds % 60)
    .padStart(2,'0');

    document.getElementById("timer")
    .textContent = `${mins}:${secs}`;

  },1000);

}

// =========================
// MOSTRAR QUESTÃO
// =========================

function showQuestion(){

  const q = questions[currentQuestion];

  questionNumber.textContent =
  currentQuestion + 1;

  // PROGRESSO
  const progress =
  ((currentQuestion + 1) / questions.length) * 100;

  progressBar.style.width =
  progress + "%";

  // TEXTO DA QUESTÃO
  questionText.innerHTML =
  q.pergunta || "";

  // IMAGEM DA QUESTÃO
  if(q.imagem_pergunta &&
     q.imagem_pergunta.trim() !== ""){

    questionImage.src =
    q.imagem_pergunta;

    questionImage.classList.remove("hidden");

  }else{

    questionImage.classList.add("hidden");
  }

  // LIMPA OPÇÕES
  optionsContainer.innerHTML = "";

  // TIPO
  const questionType =
  (q.tipo || "single")
  .trim()
  .toLowerCase();

  const options = ["a","b","c","d"];

  options.forEach(letter => {

    const optionText =
    q[`alt_${letter}`] || "";

    const optionImage =
    q[`img_${letter}`] || "";

    // CRIA DIV
    const div =
    document.createElement("div");

    div.classList.add("option");

    // INPUT
    const input =
    document.createElement("input");

    input.type =
    questionType === "multiple"
    ? "checkbox"
    : "radio";

    input.name = "questionOption";

    input.value =
    letter.toUpperCase();

    // VERIFICA SE ESTÁ MARCADA
    const savedAnswer =
    userAnswers[currentQuestion] || [];

    if(savedAnswer.includes(letter.toUpperCase())){

      input.checked = true;

      div.classList.add("selected");
    }

    // EVENTO
    input.addEventListener("change", () => {

      saveAnswer(
        letter.toUpperCase(),
        questionType
      );

    });

    // LABEL
    const label =
    document.createElement("label");

    label.innerHTML = `
      <strong>${letter.toUpperCase()})</strong>
      ${optionText}
      ${
        optionImage
        ? `<img src="${optionImage}">`
        : ""
      }
    `;

    div.appendChild(input);
    div.appendChild(label);

    optionsContainer.appendChild(div);

  });

}

// =========================
// SALVAR RESPOSTA
// =========================

function saveAnswer(answer, questionType){

  // MULTIPLE
  if(questionType === "multiple"){

    if(!Array.isArray(userAnswers[currentQuestion])){

      userAnswers[currentQuestion] = [];
    }

    const answers =
    userAnswers[currentQuestion];

    // ADICIONA
    if(answers.includes(answer)){

      userAnswers[currentQuestion] =
      answers.filter(a => a !== answer);

    }else{

      answers.push(answer);
    }

  }

  // SINGLE
  else{

    userAnswers[currentQuestion] = [answer];
  }

  showQuestion();

}

// =========================
// BOTÃO NEXT
// =========================

document
.getElementById("nextBtn")
.addEventListener("click", () => {

  if(currentQuestion < questions.length - 1){

    currentQuestion++;

    showQuestion();

  }else{

    finishQuiz();
  }

});

// =========================
// BOTÃO PREV
// =========================

document
.getElementById("prevBtn")
.addEventListener("click", () => {

  if(currentQuestion > 0){

    currentQuestion--;

    showQuestion();
  }

});

// =========================
// NORMALIZAR RESPOSTA
// =========================

function normalizeAnswer(answer){

  if(!answer) return [];

  return answer
    .replace(/"/g,'')
    .replace(/\s/g,'')
    .toUpperCase()
    .split(',')
    .sort();

}

// =========================
// COMPARAR ARRAYS
// =========================

function arraysEqual(a,b){

  if(a.length !== b.length)
    return false;

  for(let i=0;i<a.length;i++){

    if(a[i] !== b[i])
      return false;
  }

  return true;
}

// =========================
// FINALIZAR QUIZ
// =========================

function finishQuiz(){

  clearInterval(timerInterval);

  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  let correct = 0;

  const reviewContainer =
  document.getElementById("reviewContainer");

  reviewContainer.innerHTML = "";

  questions.forEach((q,index) => {

    // RESPOSTA USUÁRIO
    const user =
    userAnswers[index] || [];

    // RESPOSTA CORRETA
    const correctAnswer =
    normalizeAnswer(q.correta);

    // ORDENA
    const normalizedUser =
    [...user].sort();

    // COMPARA
    const isCorrect =
    arraysEqual(
      normalizedUser,
      correctAnswer
    );

    // ACERTO
    if(isCorrect){

      correct++;
    }

    // ERRO
    else{

      const div =
      document.createElement("div");

      div.classList.add("review-item");

      div.innerHTML = `

        <h3>
          Questão ${index + 1}
        </h3>

        <p class="user-answer">
          Sua resposta:
          ${
            user.length
            ? user.join(", ")
            : "Não respondida"
          }
        </p>

        <p class="correct-answer">
          Resposta correta:
          ${correctAnswer.join(", ")}
        </p>

        <div class="feedback">
          ${q.feedback || ""}
        </div>

      `;

      reviewContainer.appendChild(div);

    }

  });

  // RESULTADOS
  const wrong =
  questions.length - correct;

  const percent =
  Math.round(
    (correct / questions.length) * 100
  );

  document
  .getElementById("correctCount")
  .textContent = correct;

  document
  .getElementById("wrongCount")
  .textContent = wrong;

  document
  .getElementById("scorePercent")
  .textContent = percent + "%";

}