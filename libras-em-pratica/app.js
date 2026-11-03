const VISION_PACKAGE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0";
let FilesetResolver = null;
let HandLandmarker = null;

const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0/wasm";
const STORAGE_KEY = "libras-em-pratica-pose-templates-v1";
const HOLD_MS = 1400;
const MATCH_LIMIT = 0.17;
const DYNAMIC = new Set(["Ç", "H", "J", "X", "Z"]);
const LETTERS = {
  A:["Punho com polegar ao lado","Feche os quatro dedos sobre a palma e mantenha o polegar posicionado ao lado do indicador."],
  B:["Mão aberta","Estenda os quatro dedos juntos e posicione o polegar dobrado sobre a palma."],
  C:["Formato curvo","Curve os dedos e o polegar, formando um espaço arredondado semelhante à letra C."],
  Ç:["Configuração C com movimento","Consulte a referência em vídeo adotada pelo seu curso para executar o movimento associado."],
  D:["Indicador em destaque","Estenda o indicador e flexione os demais dedos, observando a posição do polegar."],
  E:["Dedos curvados","Curve os dedos em direção à palma e aproxime o polegar deles."],
  F:["Polegar e indicador unidos","Aproxime as pontas do polegar e do indicador; mantenha os outros dedos estendidos conforme a referência."],
  G:["Polegar e indicador","Observe a orientação lateral do polegar e do indicador e mantenha os demais dedos flexionados."],
  H:["Configuração com movimento","Confira a configuração e o deslocamento exatos no material de referência utilizado por seu instrutor."],
  I:["Dedo mínimo estendido","Feche os demais dedos e mantenha o dedo mínimo estendido."],
  J:["Traçado de J","Parta da configuração indicada para I e execute o movimento que desenha a letra J no espaço."],
  K:["Indicador e médio","Estenda indicador e médio e observe cuidadosamente a posição do polegar na referência."],
  L:["Formato de L","Estenda o indicador e o polegar em direções perpendiculares, observando a orientação da palma."],
  M:["Polegar sob os dedos","Feche a mão e posicione o polegar sob os dedos, conforme o modelo visual de referência."],
  N:["Polegar sob os dedos","A configuração é próxima à de M; confira a quantidade de dedos posicionados sobre o polegar na referência."],
  O:["Formato arredondado","Curve os dedos e aproxime as pontas do polegar, formando uma configuração arredondada."],
  P:["Configuração inclinada","Observe a inclinação e a orientação da mão no modelo de referência."],
  Q:["Configuração direcionada para baixo","Observe a orientação da mão e a direção dos dedos no modelo de referência."],
  R:["Indicador e médio","Aproxime ou cruze os dedos indicador e médio conforme a variante ensinada."],
  S:["Punho fechado","Feche os dedos e posicione o polegar conforme a referência visual adotada."],
  T:["Polegar entre os dedos","Feche a mão e observe a posição específica do polegar entre os dedos."],
  U:["Dois dedos juntos","Estenda indicador e médio juntos e flexione os demais dedos."],
  V:["Dois dedos separados","Estenda indicador e médio separados, formando um V."],
  W:["Três dedos estendidos","Estenda indicador, médio e anelar, mantendo os outros dedos flexionados."],
  X:["Indicador em gancho","Posicione o indicador curvado e confira a orientação da mão no modelo de referência."],
  Y:["Polegar e mínimo","Estenda o polegar e o dedo mínimo, flexionando os três dedos centrais."],
  Z:["Traçado de Z","Use o indicador para traçar o movimento em zigue-zague que representa a letra Z."]
};
const $ = id => document.getElementById(id);
const ui = {
  form:$("wordForm"), input:$("wordInput"), sequence:$("sequence"), counter:$("counter"),
  progress:$("progressFill"), letter:$("currentLetter"), title:$("letterTitle"),
  instruction:$("instruction"), kind:$("letterKind"), movement:$("movement"),
  templateState:$("templateState"), previous:$("previousBtn"), next:$("nextBtn"),
  done:$("doneBtn"), completion:$("completion"), letterStage:$("letterStage"),
  letterActions:$("letterActions"), advanceFeedback:$("advanceFeedback"),
  completedWord:$("completedWord"), repeatBtn:$("repeatBtn"), newWordBtn:$("newWordBtn"),
  cameraBtn:$("cameraBtn"),
  stopBtn:$("stopBtn"), status:$("cameraStatus"), message:$("cameraMessage"),
  video:$("video"), canvas:$("overlay"), placeholder:$("cameraPlaceholder"),
  handBadge:$("handBadge"), fingers:$("fingerStates"), capture:$("captureBtn"),
  clear:$("clearBtn"), matchLabel:$("matchLabel"), matchPercent:$("matchPercent"),
  matchFill:$("matchFill"), matchHelp:$("matchHelp")
};
let sequence = [..."MICHEL"];
let step = 0;
let landmarker = null;
let stream = null;
let raf = 0;
let lastVideoTime = -1;
let currentDescriptor = null;
let currentLandmarks = null;
let templates = loadTemplates();
let recording = false;
let recordingStarted = 0;
let recordingSamples = [];
let lastSampleAt = 0;
let holdStarted = 0;
let holdLetter = "";
let lastAutoAdvance = 0;

function loadTemplates() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}
function saveTemplates() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(templates)); }
  catch { ui.message.textContent = "Não foi possível salvar a referência neste navegador."; }
}
function normalize(value) {
  return value.replace(/[çÇ]/g,"§").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/§/g,"Ç").toUpperCase().replace(/[^A-ZÇ\s]/g,"").replace(/\s+/g," ").trim();
}
function current() { return sequence[step] || ""; }
function render() {
  const letter = current();
  const data = LETTERS[letter];
  const done = step >= sequence.length;
  ui.sequence.innerHTML = "";
  sequence.forEach((char,index) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "letter-chip" + (index === step ? " active" : "") + (index < step ? " done" : "");
    chip.textContent = char;
    chip.setAttribute("aria-label","Ir para a letra " + char);
    chip.addEventListener("click",() => { step = index; holdStarted = 0; render(); });
    ui.sequence.appendChild(chip);
  });
  ui.counter.textContent = sequence.length ? Math.min(step + 1,sequence.length) + " / " + sequence.length : "0 / 0";
  ui.progress.style.width = (sequence.length ? (step / sequence.length) * 100 : 0) + "%";
  ui.completion.hidden = !done;
  ui.letterStage.hidden = done;
  ui.letterActions.hidden = done;
  ui.advanceFeedback.hidden = true;
  ui.advanceFeedback.textContent = "";
  ui.done.disabled = done;
  ui.next.disabled = done;
  ui.previous.disabled = step === 0;
  if (done) {
    ui.letter.textContent = "✓";
    ui.title.textContent = "Muito bem! Você concluiu.";
    ui.instruction.textContent = "Prepare uma nova palavra para continuar praticando.";
    ui.kind.textContent = "SEQUÊNCIA CONCLUÍDA";
    ui.kind.classList.remove("dynamic");
    ui.movement.hidden = true;
    ui.templateState.textContent = "";
    ui.completedWord.textContent = sequence.join("");
    ui.capture.disabled = true;
    ui.matchLabel.textContent = "Prática finalizada";
    ui.matchHelp.textContent = "Digite outra palavra para iniciar uma nova sequência.";
    ui.matchPercent.textContent = "100%";
    ui.matchFill.style.width = "100%";
    return;
  }
  ui.letter.textContent = letter;
  ui.title.textContent = data[0];
  ui.instruction.textContent = data[1];
  const dynamic = DYNAMIC.has(letter);
  ui.kind.textContent = dynamic ? "SINAL COM MOVIMENTO / VARIAÇÃO" : "CONFIGURAÇÃO PARA PRÁTICA";
  ui.kind.classList.toggle("dynamic",dynamic);
  ui.movement.hidden = !dynamic;
  ui.movement.textContent = dynamic ? "Esta letra pode envolver movimento. A comparação estática não confirma sua execução; use a confirmação manual." : "";
  ui.templateState.textContent = templates[letter] ? "✓ Referência pessoal gravada neste navegador." : "Nenhuma referência pessoal gravada para esta letra.";
  ui.capture.disabled = !stream || dynamic;
  ui.clear.disabled = !templates[letter];
  if (dynamic) {
    ui.matchLabel.textContent = "Confirmação manual";
    ui.matchPercent.textContent = "MOV.";
    ui.matchFill.style.width = "0%";
    ui.matchHelp.textContent = "A letra envolve movimento ou variação; conclua manualmente após executar o gesto.";
  } else if (templates[letter]) {
    ui.matchLabel.textContent = "Comparando com sua referência";
    ui.matchHelp.textContent = "Mantenha a mão na configuração gravada. A confirmação automática é apenas uma estimativa.";
  } else {
    ui.matchLabel.textContent = "Referência não configurada";
    ui.matchPercent.textContent = "—";
    ui.matchFill.style.width = "0%";
    ui.matchHelp.textContent = "Grave uma referência pessoal para esta letra e compare a pose ao vivo.";
  }
}
function move(delta) {
  step = Math.max(0,Math.min(sequence.length,step + delta));
  holdStarted = 0;
  render();
}
function completeLetter(source = "manual") {
  if (step >= sequence.length) return;
  const acceptedLetter = current();
  move(1);
  if (step >= sequence.length) {
    ui.message.textContent = "Parabéns! Você concluiu todas as letras de " + sequence.join("") + "!";
    return;
  }
  const nextLetter = current();
  const feedback = source === "automatic"
    ? "A pose da letra " + acceptedLetter + " atingiu a semelhança definida com sua referência. Próxima letra: " + nextLetter + "."
    : "Letra " + acceptedLetter + " aceita! Vamos para a próxima: " + nextLetter + ".";
  ui.advanceFeedback.textContent = "✓ " + feedback;
  ui.advanceFeedback.hidden = false;
  ui.message.textContent = feedback;
}
ui.form.addEventListener("submit",event => {
  event.preventDefault();
  const word = normalize(ui.input.value).replace(/\s/g,"");
  if (!word) { ui.message.textContent = "Digite pelo menos uma letra de A a Z ou Ç."; return; }
  sequence = [...word];
  step = 0;
  holdStarted = 0;
  render();
  ui.message.textContent = "Sequência pronta: " + word + ". Faça uma letra de cada vez.";
});
ui.previous.addEventListener("click",() => move(-1));
ui.next.addEventListener("click",() => move(1));
ui.done.addEventListener("click",() => completeLetter("manual"));
ui.repeatBtn.addEventListener("click",() => {
  step = 0;
  holdStarted = 0;
  lastAutoAdvance = 0;
  render();
  ui.message.textContent = "Vamos novamente! Comece pela letra " + current() + ".";
});
ui.newWordBtn.addEventListener("click",() => {
  ui.input.value = "";
  ui.message.textContent = "Digite outra palavra no campo acima e selecione Montar sequência.";
  window.scrollTo({top:0,behavior:"smooth"});
  ui.input.focus({preventScroll:true});
});
ui.clear.addEventListener("click",() => {
  const letter = current();
  if (!letter || !templates[letter]) return;
  delete templates[letter]; saveTemplates(); holdStarted = 0; render();
  ui.message.textContent = "Referência da letra " + letter + " apagada.";
});
ui.capture.addEventListener("click",() => {
  if (!stream || !currentDescriptor || DYNAMIC.has(current())) return;
  recording = true; recordingStarted = performance.now(); lastSampleAt = 0; recordingSamples = [];
  ui.capture.disabled = true;
  ui.capture.textContent = "Gravando… mantenha a pose";
  ui.message.textContent = "Mantenha a configuração da letra " + current() + " estável por 1,5 segundo.";
});

async function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    ui.message.textContent = "Seu navegador não disponibiliza câmera. Use Chrome ou Safari em uma conexão HTTPS ou localhost.";
    return;
  }
  ui.cameraBtn.disabled = true;
  ui.status.classList.remove("live");
  ui.status.innerHTML = "<i></i> Preparando câmera…";
  ui.message.textContent = "Solicitando acesso à câmera e carregando o modelo de mãos.";
  try {
    stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:1280},height:{ideal:720}},audio:false});
    ui.video.srcObject = stream;
    await ui.video.play();
    if (!FilesetResolver || !HandLandmarker) {
      const visionModule = await import(VISION_PACKAGE);
      FilesetResolver = visionModule.FilesetResolver;
      HandLandmarker = visionModule.HandLandmarker;
    }
    if (!FilesetResolver || !HandLandmarker) throw new Error("Não foi possível carregar as classes do MediaPipe Tasks Vision.");
    const vision = await FilesetResolver.forVisionTasks(WASM_URL);
    try {
      landmarker = await HandLandmarker.createFromOptions(vision,{
        baseOptions:{modelAssetPath:MODEL_URL,delegate:"GPU"},
        runningMode:"VIDEO",numHands:2,minHandDetectionConfidence:0.55,
        minHandPresenceConfidence:0.55,minTrackingConfidence:0.5
      });
    } catch (gpuError) {
      landmarker = await HandLandmarker.createFromOptions(vision,{
        baseOptions:{modelAssetPath:MODEL_URL},
        runningMode:"VIDEO",numHands:2,minHandDetectionConfidence:0.55,
        minHandPresenceConfidence:0.55,minTrackingConfidence:0.5
      });
    }
    ui.canvas.width = ui.video.videoWidth;
    ui.canvas.height = ui.video.videoHeight;
    ui.video.parentElement.classList.add("active");
    ui.status.classList.add("live");
    ui.status.innerHTML = "<i></i> Câmera ativa";
    ui.cameraBtn.disabled = true;
    ui.stopBtn.disabled = false;
    ui.message.textContent = "Mão detectada? Posicione-a dentro da área e grave uma referência para a letra atual.";
    ui.capture.disabled = DYNAMIC.has(current()) || !current();
    raf = requestAnimationFrame(loop);
  } catch (error) {
    stopCamera();
    ui.cameraBtn.disabled = false;
    ui.status.classList.remove("live");
    ui.status.innerHTML = "<i></i> Câmera indisponível";
    ui.message.textContent = error && error.name === "NotAllowedError"
      ? "Acesso à câmera negado. Permita o uso da câmera nas configurações do navegador e tente novamente."
      : "Não foi possível iniciar a câmera/modelo. Verifique a conexão e tente novamente. " + (error && error.message ? error.message : "");
  }
}
function stopCamera() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  if (stream) stream.getTracks().forEach(track => track.stop());
  stream = null;
  if (landmarker) landmarker.close();
  landmarker = null;
  recording = false;
  ui.video.srcObject = null;
  ui.video.parentElement.classList.remove("active");
  const ctx = ui.canvas.getContext("2d");
  ctx.clearRect(0,0,ui.canvas.width,ui.canvas.height);
  ui.status.classList.remove("live");
  ui.status.innerHTML = "<i></i> Câmera desligada";
  ui.cameraBtn.disabled = false;
  ui.stopBtn.disabled = true;
  ui.capture.disabled = true;
  ui.capture.textContent = "＋ Gravar pose desta letra";
  ui.handBadge.textContent = "0 mãos detectadas";
  ui.fingers.innerHTML = ["Polegar","Indicador","Médio","Anelar","Mínimo"].map(name => '<span class="finger-chip">' + name + ' <b>—</b></span>').join("");
  ui.matchLabel.textContent = "Câmera desligada";
  ui.matchPercent.textContent = "—";
  ui.matchFill.style.width = "0%";
}
function descriptor(landmarks) {
  const wrist = landmarks[0];
  const base = landmarks[9];
  const scale = Math.hypot(base.x-wrist.x,base.y-wrist.y) || 1;
  const result = [];
  landmarks.forEach(point => {
    result.push((point.x-wrist.x)/scale,(point.y-wrist.y)/scale,(point.z-wrist.z)/scale);
  });
  return result;
}
function distance(a,b) {
  if (!a || !b || a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i=0;i<a.length;i++) sum += (a[i]-b[i]) ** 2;
  return Math.sqrt(sum/a.length);
}
function average(samples) {
  return samples[0].map((_,index) => samples.reduce((sum,sample) => sum+sample[index],0)/samples.length);
}
const connections = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
function draw(landmarks) {
  const ctx = ui.canvas.getContext("2d");
  ctx.clearRect(0,0,ui.canvas.width,ui.canvas.height);
  if (!landmarks) return;
  ctx.lineWidth = Math.max(2,ui.canvas.width/320);
  ctx.lineCap = "round";
  ctx.strokeStyle = "#8d9cff";
  connections.forEach(([a,b]) => {
    ctx.beginPath(); ctx.moveTo(landmarks[a].x*ui.canvas.width,landmarks[a].y*ui.canvas.height);
    ctx.lineTo(landmarks[b].x*ui.canvas.width,landmarks[b].y*ui.canvas.height); ctx.stroke();
  });
  landmarks.forEach((point,index) => {
    ctx.beginPath(); ctx.arc(point.x*ui.canvas.width,point.y*ui.canvas.height,index===0?5:3,0,Math.PI*2);
    ctx.fillStyle = [4,8,12,16,20].includes(index) ? "#4ef0c1" : "#ffffff"; ctx.fill();
  });
}
function fingerStatus(landmarks) {
  const tips = [4,8,12,16,20], pips = [3,6,10,14,18];
  const names = ["Polegar","Indicador","Médio","Anelar","Mínimo"];
  return names.map((name,index) => {
    let extended;
    if (index === 0) extended = Math.abs(landmarks[tips[index]].x-landmarks[2].x) > 0.11;
    else extended = landmarks[tips[index]].y < landmarks[pips[index]].y;
    return '<span class="finger-chip">' + name + ' <b>' + (extended ? "aberto" : "flexionado") + '</b></span>';
  }).join("");
}
function processMatch(now) {
  const letter = current();
  if (!letter || DYNAMIC.has(letter) || !templates[letter] || !currentDescriptor) {
    holdStarted = 0;
    if (!DYNAMIC.has(letter) && !templates[letter]) ui.matchLabel.textContent = "Referência não configurada";
    return;
  }
  const score = distance(currentDescriptor,templates[letter]);
  const percent = Math.max(0,Math.min(100,Math.round((1-score/0.42)*100)));
  ui.matchPercent.textContent = percent + "%";
  ui.matchFill.style.width = percent + "%";
  if (score <= MATCH_LIMIT) {
    if (!holdStarted || holdLetter !== letter) { holdStarted = now; holdLetter = letter; }
    const progress = Math.min(100,((now-holdStarted)/HOLD_MS)*100);
    ui.matchLabel.textContent = "Pose semelhante — mantenha";
    ui.matchHelp.textContent = "Segure a configuração até completar a confirmação.";
    ui.matchFill.style.width = progress + "%";
    if (progress >= 100 && now-lastAutoAdvance > 1700) {
      lastAutoAdvance = now;
      holdStarted = 0;
      completeLetter("automatic");
    }
  } else {
    holdStarted = 0;
    holdLetter = letter;
    ui.matchLabel.textContent = "Ajuste sua configuração";
    ui.matchHelp.textContent = "A semelhança estimada ainda está abaixo do limite de confirmação.";
  }
}
function loop(now) {
  if (!landmarker || !stream) return;
  if (ui.video.currentTime !== lastVideoTime && ui.video.readyState >= 2) {
    lastVideoTime = ui.video.currentTime;
    try {
      const result = landmarker.detectForVideo(ui.video,now);
      const hand = result.landmarks && result.landmarks.length ? result.landmarks[0] : null;
      currentLandmarks = hand;
      currentDescriptor = hand ? descriptor(hand) : null;
      draw(hand);
      ui.handBadge.textContent = (result.landmarks ? result.landmarks.length : 0) + (result.landmarks && result.landmarks.length === 1 ? " mão detectada" : " mãos detectadas");
      ui.fingers.innerHTML = hand ? fingerStatus(hand) : ["Polegar","Indicador","Médio","Anelar","Mínimo"].map(name => '<span class="finger-chip">' + name + ' <b>—</b></span>').join("");
      if (recording && currentDescriptor && now-lastSampleAt >= 75) {
        recordingSamples.push(currentDescriptor.slice()); lastSampleAt = now;
      }
      if (recording && now-recordingStarted >= 1500) finishRecording();
      processMatch(now);
    } catch (error) {
      ui.message.textContent = "Falha ao analisar o quadro da câmera: " + error.message;
    }
  }
  raf = requestAnimationFrame(loop);
}
function finishRecording() {
  recording = false;
  const letter = current();
  if (recordingSamples.length < 5) {
    ui.message.textContent = "Não houve amostras suficientes. Posicione a mão e tente gravar novamente.";
  } else {
    templates[letter] = average(recordingSamples);
    saveTemplates();
    ui.message.textContent = "Referência da letra " + letter + " gravada. Agora mantenha a pose diante da câmera para comparar.";
  }
  recordingSamples = [];
  ui.capture.textContent = "＋ Gravar pose desta letra";
  ui.capture.disabled = !stream || DYNAMIC.has(current());
  holdStarted = 0;
  render();
}
ui.cameraBtn.addEventListener("click",startCamera);
ui.stopBtn.addEventListener("click",stopCamera);
window.addEventListener("beforeunload",stopCamera);
render();