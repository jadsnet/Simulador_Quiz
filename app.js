let questions=[],currentQuestion=0,userAnswers=[],imageMap={},seconds=0,timerInterval;
const STORAGE_KEY='simulador_progresso';
const $=id=>document.getElementById(id);

$('startBtn').onclick=async()=>{await loadImages();loadCSV();};

async function loadImages(){imageMap={};for(const f of $('imageFolder').files){imageMap[f.name]=URL.createObjectURL(f);}}

function loadCSV(){
const file=$('csvFile').files[0];
if(!file)return alert('Selecione um CSV');
Papa.parse(file,{header:true,skipEmptyLines:true,encoding:'UTF-8',complete:r=>{
questions=r.data;
if($('shuffleQuestions').checked)questions.sort(()=>Math.random()-0.5);
questions=questions.slice(0,parseInt($('questionLimit').value||50));
$('totalQuestions').textContent=questions.length;
startQuiz();
}});
}

function startQuiz(){
$('start-screen').classList.add('hidden');
$('quiz-screen').classList.remove('hidden');
loadProgress();
timerInterval=setInterval(()=>{seconds++;updateTimer();saveProgress();},1000);
showQuestion();
}

function updateTimer(){
$('timer').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
}

function showQuestion(){
const q=questions[currentQuestion];
$('questionNumber').textContent=currentQuestion+1;
$('progressBar').style.width=((currentQuestion+1)/questions.length*100)+'%';
$('questionText').innerHTML=q.pergunta||'';
if(q.imagem_pergunta&&imageMap[q.imagem_pergunta]){$('questionImage').src=imageMap[q.imagem_pergunta];$('questionImage').classList.remove('hidden');}else $('questionImage').classList.add('hidden');
const box=$('optionsContainer');box.innerHTML='';
const type=(q.tipo||'single').toLowerCase();
$('multipleAlert').classList.toggle('hidden',type!=='multiple');

['a','b','c','d','e'].forEach(l=>{
if(!q['alt_'+l]&&!q['img_'+l])return;
const d=document.createElement('div');d.className='option';
const i=document.createElement('input');i.type=type==='multiple'?'checkbox':'radio';i.name='q';i.value=l.toUpperCase();
const saved=userAnswers[currentQuestion]||[];i.checked=saved.includes(l.toUpperCase());
i.onchange=()=>saveAnswer(l.toUpperCase(),type);
d.appendChild(i);
const s=document.createElement('span');
s.innerHTML='<b>'+l.toUpperCase()+')</b> '+(q['alt_'+l]||'');
if(q['img_'+l]&&imageMap[q['img_'+l]]) s.innerHTML+='<br><img src="'+imageMap[q['img_'+l]]+'">';
d.appendChild(s);box.appendChild(d);
});
attachImageZoom();
}

function attachImageZoom(){
document.querySelectorAll('.option img').forEach(img=>{
img.onclick=()=>{$('modalImage').src=img.src;$('imageModal').style.display='flex';};
});
}
$('imageModal').onclick=()=>{$('imageModal').style.display='none';};

function saveAnswer(a,t){
if(t==='multiple'){userAnswers[currentQuestion]??=[];let arr=userAnswers[currentQuestion];arr.includes(a)?userAnswers[currentQuestion]=arr.filter(x=>x!==a):arr.push(a);}
else userAnswers[currentQuestion]=[a];
saveProgress();
}

$('nextBtn').onclick=()=>currentQuestion<questions.length-1?(currentQuestion++,showQuestion()):finishQuiz();
$('prevBtn').onclick=()=>{if(currentQuestion>0){currentQuestion--;showQuestion();}};

function saveProgress(){localStorage.setItem(STORAGE_KEY,JSON.stringify({currentQuestion,userAnswers,seconds}));}
function loadProgress(){let s=localStorage.getItem(STORAGE_KEY);if(!s)return;try{let d=JSON.parse(s);currentQuestion=d.currentQuestion||0;userAnswers=d.userAnswers||[];seconds=d.seconds||0;updateTimer();}catch(e){}}

const norm=a=>(a||'').replace(/"/g,'').replace(/\s/g,'').toUpperCase().split(',').sort();
const eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);

function finishQuiz(){
clearInterval(timerInterval);
$('quiz-screen').classList.add('hidden');
$('result-screen').classList.remove('hidden');
let correct=0,wrong=0;
$('reviewContainer').innerHTML='';

questions.forEach((q,idx)=>{
const u=(userAnswers[idx]||[]).sort();
const r=norm(q.correta);
const ok=eq(u,r);
ok?correct++:wrong++;
createReviewItem(q,idx,u,r,ok);
});

$('correctCount').textContent=correct;
$('wrongCount').textContent=wrong;
$('scorePercent').textContent=Math.round(correct/questions.length*100)+'%';
localStorage.removeItem(STORAGE_KEY);
}

function createReviewItem(q,index,user,right,ok){
const div=document.createElement('div');
div.className='review-item';
div.dataset.result=ok?'correct':'wrong';
div.innerHTML='<h3>Questão '+(index+1)+'</h3><div>Sua resposta: '+(user.join(', ')||'Não respondida')+'</div><div>Resposta correta: '+right.join(', ')+'</div><div>'+ (q.feedback||'') +'</div>';
$('reviewContainer').appendChild(div);
}

$('showOnlyErrors').onclick=()=>{
document.querySelectorAll('.review-item').forEach(i=>{
i.style.display=i.dataset.result==='wrong'?'block':'none';
});
};

$('showAllReview').onclick=()=>{
document.querySelectorAll('.review-item').forEach(i=>i.style.display='block');
};
