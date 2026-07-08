// ═══════════════════════════════════════
// STATE
// ═══════════════════════════════════════
var LANG = localStorage.getItem('sehhi_lang') || 'en';
var ZONE_NUM = localStorage.getItem('sehhi_zone_num') || '1';
var ZONE_GAME = localStorage.getItem('sehhi_zone_game') || 'all';
var CUR_SCREEN = 'home';

// ═══════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════
function showScreen(id){
  closeWin();
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
  document.getElementById('screen-'+id).classList.add('active');
  CUR_SCREEN = id;
}

function goHub(){
  cwKbHide();
  if(ZONE_GAME && ZONE_GAME!=='all'){
    showScreen('home');
  } else {
    showScreen('hub');
    refreshHub();
  }
}

function goGame(id){
  if(id==='dash'){ initDashSelect(); return; }
  showScreen(id);
  if(id==='ws') initWS();
  else if(id==='cw') initCW();
  else if(id==='pl') initPL();
  else if(id==='fa') initFA();
  else if(id==='ph') initPH();
  else if(id==='re') initRE();
  else if(id==='fg') initFG();
}

function homeStart(){
  if(ZONE_GAME && ZONE_GAME!=='all'){
    goGame(ZONE_GAME);
  } else {
    showScreen('hub');
    refreshHub();
  }
}

function refreshHub(){
  document.getElementById('hub-zone-badge').textContent = (LANG==='ar'?'منطقة ':'Zone ')+ZONE_NUM;
  document.getElementById('hub-title').textContent = LANG==='ar'?'اختر لعبة':'Choose a Game';
  var sub=document.getElementById('hub-subtitle');
  if(sub) sub.textContent = LANG==='ar'?'اضغط على أي لعبة للبدء':'Tap any game to start playing';
  // update bilingual elements inside hub
  document.querySelectorAll('#screen-hub [data-en]').forEach(function(el){
    el.textContent = LANG==='ar'?(el.dataset.ar||el.dataset.en):el.dataset.en;
  });
  document.querySelectorAll('[data-en]').forEach(function(el){
    el.textContent = LANG==='ar'? el.getAttribute('data-ar') : el.getAttribute('data-en');
  });
  syncLangBtns('hub');
}

// ═══════════════════════════════════════
// LANGUAGE
// ═══════════════════════════════════════
function setLang(l){
  LANG = l;
  localStorage.setItem('sehhi_lang', l);
  document.body.classList.toggle('ar', l==='ar');
  document.documentElement.setAttribute('lang', l);
  document.documentElement.setAttribute('dir', l==='ar'?'rtl':'ltr');
  syncAllLangBtns();
  refreshCurrentScreen();
}

function syncLangBtns(prefix){
  var en = document.getElementById(prefix+'-lang-en');
  var ar = document.getElementById(prefix+'-lang-ar');
  if(en) en.classList.toggle('active', LANG==='en');
  if(ar) ar.classList.toggle('active', LANG==='ar');
}

function syncAllLangBtns(){
  ['hub','ws','cw','pl','dash','dash-sel'].forEach(syncLangBtns);
}

function refreshCurrentScreen(){
  if(CUR_SCREEN==='hub') refreshHub();
  else if(CUR_SCREEN==='ws') renderWS();
  else if(CUR_SCREEN==='cw') renderCW();
  else if(CUR_SCREEN==='pl') renderPL();
  else if(CUR_SCREEN==='dash-select') dashRefreshSelectLang();
}

// ═══════════════════════════════════════
// HOME
// ═══════════════════════════════════════
function homeLang(l){
  LANG = l;
  localStorage.setItem('sehhi_lang', l);
  ['en','ar'].forEach(function(lang){
    ['home-title','home-sub','hbtn'].forEach(function(base){
      var el=document.getElementById(base+'-'+lang);
      if(el) el.classList.toggle('hidden', lang!==l);
    });
  });
  document.getElementById('hlang-en').classList.toggle('active', l==='en');
  document.getElementById('hlang-ar').classList.toggle('active', l==='ar');
  var src=document.getElementById('home-video-src');
  var vid=document.getElementById('home-video');
  src.src='Children '+(l==='ar'?'Ar':'En')+'.mp4';
  vid.load();
  vid.play().catch(function(){});
}

(function initHome(){
  var vid=document.getElementById('home-video');
  vid.addEventListener('error',function(){
    document.getElementById('home-fallback').style.display='block';
    vid.style.display='none';
  });
  vid.play().catch(function(){
    document.getElementById('home-fallback').style.display='block';
  });
  if(LANG==='ar') homeLang('ar');
})();

// ═══════════════════════════════════════
// TOAST / WIN
// ═══════════════════════════════════════
function showToast(msg){
  var t=document.getElementById('toast');
  t.textContent=msg;
  t.classList.add('show');
  setTimeout(function(){t.classList.remove('show');},2500);
}

function showWin(emoji,title,msg){
  document.getElementById('win-emoji').textContent=emoji||'🎉';
  document.getElementById('win-title').textContent=title||'Excellent!';
  document.getElementById('win-msg').textContent=msg||'';
  document.getElementById('win-overlay').classList.add('show');
  showWinAutoCountdown(15);
}

var winAutoTimer=null;

function showWinAutoCountdown(sec){
  clearTimeout(winAutoTimer);
  var btn=document.getElementById('win-btn');
  var origText=btn.textContent;
  var remain=sec;
  function tick(){
    btn.textContent=(LANG==='ar'?'العب مجدداً':'Play Again')+' ('+remain+')';
    if(remain<=0){ closeWin(); return; }
    remain--;
    winAutoTimer=setTimeout(tick,1000);
  }
  tick();
}

function closeWin(){
  clearTimeout(winAutoTimer);
  document.getElementById('win-overlay').classList.remove('show');
  // restart the current game
  var g=CUR_SCREEN;
  if(g==='ws') initWS();
  else if(g==='cw') initCW();
  else if(g==='pl') initPL();
}

// ═══════════════════════════════════════
// WORD SEARCH
// ═══════════════════════════════════════
var WS_DATA=[
  {e:'🍎',en:'FRUIT',    ar:'فاكهة',   arl:['ف','ا','ك','ه','ة']},
  {e:'🥩',en:'PROTEIN',  ar:'بروتين',  arl:['ب','ر','و','ت','ي','ن']},
  {e:'🧀',en:'DAIRY',    ar:'ألبان',   arl:['أ','ل','ب','ا','ن']},
  {e:'🥛',en:'MILK',     ar:'حليب',    arl:['ح','ل','ي','ب']},
  {e:'🍊',en:'ORANGE',   ar:'برتقال',  arl:['ب','ر','ت','ق','ا','ل']},
  {e:'🍗',en:'CHICKEN',  ar:'دجاج',    arl:['د','ج','ا','ج']},
  {e:'🥭',en:'MANGO',    ar:'مانجو',   arl:['م','ا','ن','ج','و']},
  {e:'🥦',en:'VEGETABLE',ar:'خضروات',  arl:['خ','ض','ر','و','ا','ت']},
  {e:'🥒',en:'CUCUMBERS',ar:'خيار',    arl:['خ','ي','ا','ر']},
  {e:'🌾',en:'GRAINS',   ar:'حبوب',    arl:['ح','ب','و','ب']}
];
var AR_FILL=['ص','ن','م','ل','ك','ج','ه','و','ي','ز','ر','ع','ت','س','ش','ق','د','ط','ث','غ'];
var WS_SIZE=12;
var wsDataEn,wsDataAr,wsFound=[];
var wsSelStart=null,wsSelCells=[];

function wsRandInt(n){return Math.floor(Math.random()*n);}

function buildWSGrid(lang){
  var size=WS_SIZE,grid=[];
  for(var r=0;r<size;r++){grid.push(new Array(size).fill(''));}
  var words=WS_DATA.map(function(w){return lang==='ar'?[...w.arl]:[...w.en];});
  var placed=[];
  words.forEach(function(letters){
    var attempts=0,ok=false,cells=[];
    while(!ok&&attempts<200){
      attempts++;
      var dr=0,dc=0,r,c;
      var dir=wsRandInt(3);
      if(dir===0){dr=0;dc=1;r=wsRandInt(size);c=wsRandInt(size-letters.length+1);}
      else if(dir===1){dr=1;dc=0;r=wsRandInt(size-letters.length+1);c=wsRandInt(size);}
      else{dr=1;dc=1;r=wsRandInt(size-letters.length+1);c=wsRandInt(size-letters.length+1);}
      var fits=true;
      for(var i=0;i<letters.length;i++){
        var nr=r+dr*i,nc=c+dc*i;
        if(nr<0||nr>=size||nc<0||nc>=size){fits=false;break;}
        if(grid[nr][nc]!==''&&grid[nr][nc]!==letters[i]){fits=false;break;}
      }
      if(fits){
        ok=true;cells=[];
        for(var i=0;i<letters.length;i++){
          grid[r+dr*i][c+dc*i]=letters[i];
          cells.push([r+dr*i,c+dc*i]);
        }
      }
    }
    placed.push(cells);
  });
  var fillArr=lang==='ar'?AR_FILL:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  for(var r=0;r<size;r++)for(var c=0;c<size;c++)if(!grid[r][c])grid[r][c]=fillArr[wsRandInt(fillArr.length)];
  return {grid:grid,placed:placed};
}

function initWS(){
  wsDataEn=buildWSGrid('en');
  wsDataAr=buildWSGrid('ar');
  wsFound=new Array(WS_DATA.length).fill(false);
  wsSelStart=null;wsSelCells=[];
  renderWS();
}

var WS_WORD_COLORS=['#E91E63','#9C27B0','#1976D2','#00897B','#F57F17','#D84315','#2E7D32','#AD1457','#0288D1','#5D4037'];

function renderWS(){
  syncLangBtns('ws');
  document.getElementById('ws-grid-title').textContent=LANG==='ar'?'ابحث عن الكلمات':'Find the Words';
  document.getElementById('ws-words-title').textContent=LANG==='ar'?'الكلمات المطلوبة':'Words to Find';
  document.getElementById('ws-check-btn').textContent=LANG==='ar'?'تحقق ✓':'Check Answers ✓';
  renderWSGrid('en');
  renderWSGrid('ar');
  document.getElementById('ws-grid-en').style.display=LANG==='ar'?'none':'inline-grid';
  document.getElementById('ws-grid-ar').style.display=LANG==='ar'?'inline-grid':'none';
  renderWSWords();
  updateWSProgress();
}

function renderWSGrid(lang){
  var data=lang==='ar'?wsDataAr:wsDataEn;
  var el=document.getElementById('ws-grid-'+lang);
  el.innerHTML='';
  el.style.gridTemplateColumns='repeat('+WS_SIZE+',54px)';
  if(!data)return;
  for(var r=0;r<WS_SIZE;r++){
    for(var c=0;c<WS_SIZE;c++){
      var cell=document.createElement('div');
      cell.className='ws-cell';
      cell.style.setProperty('--ci', r*WS_SIZE+c);
      cell.textContent=data.grid[r][c];
      cell.dataset.r=r;cell.dataset.c=c;cell.dataset.lang=lang;
      // Re-apply found color if already found
      WS_DATA.forEach(function(w,i){
        if(wsFound[i]&&data.placed[i]){
          data.placed[i].forEach(function(pos){
            if(pos[0]===r&&pos[1]===c){cell.classList.add('found');cell.style.background=WS_WORD_COLORS[i%WS_WORD_COLORS.length];}
          });
        }
      });
      cell.addEventListener('pointerdown',wsDown);
      cell.addEventListener('pointermove',wsMove);
      cell.addEventListener('pointerup',wsUp);
      el.appendChild(cell);
    }
  }
}

function renderWSWords(){
  var el=document.getElementById('ws-word-list');
  el.innerHTML='';
  WS_DATA.forEach(function(w,i){
    var div=document.createElement('div');
    div.className='ws-word-item'+(wsFound[i]?' done':'');
    if(wsFound[i]){
      var col=WS_WORD_COLORS[i%WS_WORD_COLORS.length];
      div.style.borderColor=col;
      div.style.borderWidth='2px';
      div.innerHTML='<span class="wi-emoji">'+w.e+'</span>'+
        '<span style="flex:1;font-weight:800;color:'+col+'">'+(LANG==='ar'?w.ar:w.en)+'</span>'+
        '<span style="color:'+col+';font-size:1.2rem;font-weight:900;">✓</span>';
    } else {
      div.innerHTML='<span class="wi-emoji">'+w.e+'</span>'+
        '<span style="flex:1">'+(LANG==='ar'?w.ar:w.en)+'</span>'+
        '<span style="opacity:.35;font-size:.75rem;">○</span>';
    }
    el.appendChild(div);
  });
  updateWSProgress();
}

function updateWSProgress(){
  var total=WS_DATA.length, found=wsFound.filter(Boolean).length;
  var pct=(found/total*100).toFixed(0);
  var bar=document.getElementById('ws-prog-bar');
  var label=document.getElementById('ws-prog-label');
  var emoji=document.getElementById('ws-prog-emoji');
  if(bar) bar.style.width=pct+'%';
  if(label) label.textContent=found+' / '+total+(LANG==='ar'?' كلمة':' words');
  if(emoji) emoji.textContent=found===0?'🔍':found===total?'🏆 ':found>=total/2?'🔥':'⚡';
}

function wsDown(e){
  e.preventDefault();
  wsSelStart={r:+e.currentTarget.dataset.r,c:+e.currentTarget.dataset.c,lang:e.currentTarget.dataset.lang};
  wsSelCells=[[wsSelStart.r,wsSelStart.c]];
  e.currentTarget.classList.add('hi');
  e.currentTarget.setPointerCapture(e.pointerId);
}

function wsMove(e){
  if(!wsSelStart)return;
  e.preventDefault();
  var lang=wsSelStart.lang;
  var grid=document.getElementById('ws-grid-'+lang);
  var target=document.elementFromPoint(e.clientX,e.clientY);
  if(!target||!target.classList.contains('ws-cell')||target.dataset.lang!==lang)return;
  var er=+target.dataset.r,ec=+target.dataset.c;
  var sr=wsSelStart.r,sc=wsSelStart.c;
  var dr=er-sr,dc=ec-sc;
  var len=Math.max(Math.abs(dr),Math.abs(dc));
  var newCells=[];
  if(len===0){newCells=[[sr,sc]];}
  else if(dr===0||dc===0||Math.abs(dr)===Math.abs(dc)){
    var rstep=dr?dr/Math.abs(dr):0,cstep=dc?dc/Math.abs(dc):0;
    for(var i=0;i<=len;i++)newCells.push([sr+rstep*i,sc+cstep*i]);
  } else return;
  wsClearHi();
  wsSelCells=newCells;
  newCells.forEach(function(pos){
    var cell=grid.querySelector('[data-r="'+pos[0]+'"][data-c="'+pos[1]+'"]');
    if(cell&&!cell.classList.contains('found'))cell.classList.add('hi');
  });
}

function wsUp(e){
  if(!wsSelStart)return;
  wsCheckSel();
  wsSelStart=null;wsSelCells=[];
  wsClearHi();
}

function wsClearHi(){
  var lang=wsSelStart?wsSelStart.lang:LANG;
  var grid=document.getElementById('ws-grid-'+lang);
  if(grid) grid.querySelectorAll('.ws-cell.hi').forEach(function(c){c.classList.remove('hi');});
}

function wsCheckSel(){
  if(wsSelCells.length<2)return;
  var lang=wsSelStart?wsSelStart.lang:LANG;
  var data=lang==='ar'?wsDataAr:wsDataEn;
  var letters=wsSelCells.map(function(pos){return data.grid[pos[0]][pos[1]];});
  var str=letters.join('');
  var strRev=letters.slice().reverse().join('');
  WS_DATA.forEach(function(w,i){
    if(wsFound[i])return;
    var target=lang==='ar'?w.arl.join(''):w.en;
    if(str===target||strRev===target){
      wsFound[i]=true;
      var placed=data.placed[i];
      var gridEl=document.getElementById('ws-grid-'+lang);
      var wordColor=WS_WORD_COLORS[i%WS_WORD_COLORS.length];
      if(placed&&placed.length){
        placed.forEach(function(pos,pi){
          setTimeout(function(){
            var cell=gridEl.querySelector('[data-r="'+pos[0]+'"][data-c="'+pos[1]+'"]');
            if(cell){
              cell.classList.remove('hi');
              cell.classList.add('found');
              cell.style.background=wordColor;
              cell.style.boxShadow='0 0 14px '+wordColor+'88';
              cell.style.animation='none';
              void cell.offsetWidth;
              cell.style.animation='wsFound .45s cubic-bezier(.34,1.56,.64,1)';
            }
          }, pi*45);
        });
      }
      setTimeout(function(){
        renderWSWords();
        confettiBurst(window.innerWidth/2, window.innerHeight/2, 18);
      }, placed.length*45+60);
      showToast(w.e+' '+(lang==='ar'?w.ar:w.en)+'!');
    }
  });
}

function wsCheck(){
  var total=WS_DATA.length,found=wsFound.filter(Boolean).length;
  if(found===total){
    showWin('🔤',LANG==='ar'?'ممتاز!':'Excellent!',LANG==='ar'?'وجدت جميع الكلمات!':'You found all the words!');
  } else {
    showToast((LANG==='ar'?'وجدت ':'Found ')+found+' / '+total);
  }
}

// ═══════════════════════════════════════
// CROSSWORD
// ═══════════════════════════════════════
var CW_EN_DATA=[
  {word:'SALAD',  emoji:'🥗',row:0,startCol:3,len:5,clue:{en:'A dish made of fresh different types of vegetables',ar:'طبق مصنوع من أنواع مختلفة من الخضار الطازجة'}},
  {word:'LETTUCE',emoji:'🥬',row:1,startCol:2,len:7,clue:{en:'A green leafy vegetable often used in salads',ar:'خضار أوراقه خضراء يستخدم كثيراً في السلطة'}},
  {word:'CHEESE', emoji:'🧀',row:2,startCol:2,len:6,clue:{en:'A dairy food that is often used in sandwiches',ar:'طعام ألبان يُستخدم كثيراً في السندويشات'}},
  {word:'HONEY',  emoji:'🍯',row:3,startCol:3,len:5,clue:{en:'A sweet nutritious liquid coming from bees',ar:'سائل حلو مغذٍّ يأتي من النحل'}},
  {word:'VITAMIN',emoji:'💊',row:4,startCol:2,len:7,clue:{en:'A nutrient that helps your body to fight germs',ar:'مغذٍّ يساعد جسمك على مقاومة الجراثيم'}}
];
var CW_EN_SCOL=3,CW_EN_ROWS=5,CW_EN_COLS=9,CW_EN_SECRET='SEHHI',CW_EN_SECRET_AR='صحي';

var CW_AR_DATA=[
  {letters:['ح','م','ص'],       emoji:'🧆',row:0,startCol:0,len:3,clue:{ar:'نوع من أنواع البقوليات يهرس ويأكل بالخبز وهو غني بالبروتين',en:'A legume paste eaten with bread, rich in protein'}},
  {letters:['ح','ل','ي','ب'],   emoji:'🥛',row:1,startCol:2,len:4,clue:{ar:'أحد منتجات الألبان غني بالكالسيوم ويقوي العظام',en:'A dairy product rich in calcium that strengthens bones'}},
  {letters:['ب','ط','ي','خ'],   emoji:'🍉',row:2,startCol:0,len:4,clue:{ar:'فاكهة غنية بالماء منعشة في الصيف قشرتها خضراء ولونها أحمر',en:'A water-rich fruit refreshing in summer, green skin red inside'}}
];
var CW_AR_ROWS=3,CW_AR_COLS=6,CW_AR_SCOL=2,CW_AR_SECRET='صحي',CW_AR_SECRET_EN='Healthy';

var cwUserAnswers={};

function initCW(){cwUserAnswers={};renderCW();}

function renderCW(){
  syncLangBtns('cw');
  var isAr=LANG==='ar';
  document.getElementById('cw-grid-en').style.display=isAr?'none':'inline-grid';
  document.getElementById('cw-grid-ar').style.display=isAr?'inline-grid':'none';
  document.getElementById('cw-check-btn').textContent=isAr?'تحقق ✓':'Check Answers ✓';
  document.getElementById('cw-clue-title').textContent=isAr?'التلميحات':'Clues';
  document.getElementById('cw-secret-label').textContent=isAr?'الكلمة السرية':'Secret Word';
  document.getElementById('cw-grid-title').textContent=isAr?'أكمل الكلمات المتقاطعة':'Fill in the Crossword';
  var hint=document.querySelector('.cw-secret-hint');
  if(hint) hint.textContent=isAr?'⭐ العمود المميز يكشف الكلمة السرية':'⭐ The highlighted column spells the Secret Word';
  buildCWGrid(isAr?'ar':'en');
  cwAttachKeyboard(isAr?'ar':'en');
  buildCWClues(isAr?'ar':'en');
  buildCWSecret(isAr?'ar':'en');
  cwKbHide();
}

function buildCWGrid(lang){
  var el=document.getElementById('cw-grid-'+lang);
  el.innerHTML='';
  var data=lang==='ar'?CW_AR_DATA:CW_EN_DATA;
  var rows=lang==='ar'?CW_AR_ROWS:CW_EN_ROWS;
  var cols=lang==='ar'?CW_AR_COLS:CW_EN_COLS;
  var scol=lang==='ar'?CW_AR_SCOL:CW_EN_SCOL;
  el.style.gridTemplateColumns='repeat('+cols+',62px)';
  var map={};
  data.forEach(function(w,wi){
    var letters=lang==='ar'?w.letters:[...w.word];
    for(var i=0;i<letters.length;i++){
      var r=w.row,c=w.startCol+i;
      if(!map[r])map[r]={};
      map[r][c]={letter:letters[i],wi:wi,ci:i,isSecret:(c===scol)};
    }
  });
  for(var r=0;r<rows;r++){
    for(var c=0;c<cols;c++){
      var td=document.createElement('div');
      td.className='cw-cell';
      td.dataset.row=r;
      if(map[r]&&map[r][c]){
        var info=map[r][c];
        td.classList.add(info.isSecret?'secret-cell':'input-cell');
        td.style.setProperty('--ri', r);
        var inp=document.createElement('input');
        inp.type='text';inp.maxLength=1;
        inp.dataset.r=r;inp.dataset.c=c;inp.dataset.wi=info.wi;inp.dataset.ci=info.ci;inp.dataset.lang=lang;
        var key=lang+'_'+r+'_'+c;
        if(cwUserAnswers[key])inp.value=cwUserAnswers[key];
        inp.addEventListener('input',function(e){
          var k=e.target.dataset.lang+'_'+e.target.dataset.r+'_'+e.target.dataset.c;
          cwUserAnswers[k]=(e.target.value||'').toUpperCase();
          e.target.value=cwUserAnswers[k];
          // auto-advance to next cell in same row
          if(cwUserAnswers[k]){
            var nextC=+e.target.dataset.c+1;
            var nextInp=document.querySelector('#cw-grid-'+e.target.dataset.lang+' input[data-r="'+e.target.dataset.r+'"][data-c="'+nextC+'"]');
            if(nextInp){
              cwKbActive=nextInp;
              document.querySelectorAll('.cw-kb-active-cell').forEach(function(c){c.classList.remove('cw-kb-active-cell');});
              if(nextInp.parentElement) nextInp.parentElement.classList.add('cw-kb-active-cell');
            }
          }
        });
        inp.addEventListener('keydown',function(e){
          if(e.key==='Backspace'&&!e.target.value){
            var prevC=+e.target.dataset.c-1;
            var prevInp=document.querySelector('#cw-grid-'+e.target.dataset.lang+' input[data-r="'+e.target.dataset.r+'"][data-c="'+prevC+'"]');
            if(prevInp){prevInp.focus();prevInp.select();}
          }
        });
        td.appendChild(inp);
      } else {
        td.classList.add('empty');
      }
      el.appendChild(td);
    }
  }
}

var cwWordCorrect=[];
function buildCWClues(lang){
  var el=document.getElementById('cw-clue-list');
  el.innerHTML='';
  var data=lang==='ar'?CW_AR_DATA:CW_EN_DATA;
  data.forEach(function(w,i){
    var div=document.createElement('div');
    div.className='cw-clue-item'+(cwWordCorrect[i]?' done':'');
    div.style.animationDelay=(i*.06)+'s';
    div.innerHTML=
      '<div class="cw-img-num">'+(cwWordCorrect[i]?'✓':(i+1))+'</div>'+
      '<div class="cw-img-emoji">'+w.emoji+'</div>'+
      '<div class="cw-img-hint">'+w.clue[lang]+'</div>';
    (function(row,idx){
      div.onclick=function(){
        // highlight row in grid
        var gridEl=document.getElementById('cw-grid-'+lang);
        gridEl.querySelectorAll('.cw-row-active').forEach(function(c){c.classList.remove('cw-row-active');});
        gridEl.querySelectorAll('[data-row="'+row+'"]').forEach(function(c){c.classList.add('cw-row-active');});
        // focus first input in that row
        var firstInp=gridEl.querySelector('input[data-r="'+row+'"]');
        if(firstInp){firstInp.focus();firstInp.select();}
        // mark active clue
        document.querySelectorAll('.cw-clue-item').forEach(function(c){c.classList.remove('active');});
        this.classList.add('active');
        setTimeout(function(){
          gridEl.querySelectorAll('.cw-row-active').forEach(function(c){c.classList.remove('cw-row-active');});
        },2000);
      };
    })(w.row, i);
    el.appendChild(div);
  });
  updateCWProgress();
}

function updateCWProgress(){
  var total=cwWordCorrect.length||5, done=cwWordCorrect.filter(Boolean).length;
  var pct=(done/total*100).toFixed(0);
  var bar=document.getElementById('cw-prog-bar');
  var label=document.getElementById('cw-prog-label');
  var emoji=document.getElementById('cw-prog-emoji');
  if(bar) bar.style.width=pct+'%';
  if(label) label.textContent=done+' / '+total+(LANG==='ar'?' تلميحات':' clues');
  if(emoji) emoji.textContent=done===0?'✏️':done===total?'🏆':done>=total/2?'🔥':'⚡';
}

function buildCWSecret(lang){
  var secret=lang==='ar'?CW_AR_SECRET:CW_EN_SECRET;
  var el=document.getElementById('cw-secret-boxes');
  el.innerHTML='';
  [...secret].forEach(function(){
    var box=document.createElement('div');
    box.className='cw-sbox';box.textContent='?';
    el.appendChild(box);
  });
  document.getElementById('cw-secret-reveal').style.display='none';
}

function cwCheck(){
  var lang=LANG==='ar'?'ar':'en';
  var data=lang==='ar'?CW_AR_DATA:CW_EN_DATA;
  var scol=lang==='ar'?CW_AR_SCOL:CW_EN_SCOL;
  var inputs=document.querySelectorAll('#cw-grid-'+lang+' input');
  var allCorrect=true,secretLetters={};
  // Track per-word correctness
  cwWordCorrect=new Array(data.length).fill(true);
  inputs.forEach(function(inp){
    var r=+inp.dataset.r,c=+inp.dataset.c,wi=+inp.dataset.wi,ci=+inp.dataset.ci;
    var w=data[wi];
    var letters=lang==='ar'?w.letters:[...w.word];
    var correct=(inp.value||'').toUpperCase()===letters[ci].toUpperCase();
    var cell=inp.parentElement;
    cell.classList.toggle('correct',correct);
    cell.classList.toggle('wrong',!correct);
    if(!correct){ allCorrect=false; cwWordCorrect[wi]=false; }
    if(c===scol)secretLetters[r]=correct?letters[ci]:'?';
    // re-trigger animation
    if(!correct){
      cell.style.animation='none'; void cell.offsetWidth;
      cell.style.animation='cwShake .4s ease';
    } else {
      cell.style.animation='none'; void cell.offsetWidth;
      cell.style.animation='cwCorrect .5s cubic-bezier(.34,1.56,.64,1)';
    }
  });
  // Update clues done state
  buildCWClues(lang);
  // Reveal secret boxes with stagger
  var secret=lang==='ar'?CW_AR_SECRET:CW_EN_SECRET;
  var boxes=document.querySelectorAll('#cw-secret-boxes .cw-sbox');
  var secretAllCorrect=true;
  [...secret].forEach(function(ch,i){
    var letter=secretLetters[i]||'?';
    if(letter==='?')secretAllCorrect=false;
    setTimeout(function(){
      if(boxes[i]){
        boxes[i].textContent=letter;
        boxes[i].classList.add('revealed');
        if(letter!=='?'){boxes[i].style.background='#FFF176';boxes[i].style.borderColor='#F9A825';}
      }
    }, i*120);
  });
  if(allCorrect){
    setTimeout(function(){
      document.getElementById('cw-secret-reveal').style.display='block';
      document.getElementById('cw-secret-reveal').innerHTML='🎉 '+(lang==='ar'?'الكلمة السرية: ':'Secret word: ')+'<strong>'+secret+'</strong>!';
      confettiBurst(window.innerWidth/2, window.innerHeight/2, 40);
      showWin('✏️',LANG==='ar'?'ممتاز!':'Excellent!',LANG==='ar'?'أجبت على جميع الكلمات!':'You solved the crossword!');
    }, [...secret].length*120+200);
  } else {
    showToast(LANG==='ar'?'حاول مجدداً!':'Keep trying!');
  }
}

// ═══════════════════════════════════════
// CW ON-SCREEN KEYBOARD
// ═══════════════════════════════════════
var cwKbActive=null; // currently focused input

var CW_KB_EN=[
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M','⌫']
];
var CW_KB_AR=[
  ['ض','ص','ث','ق','ف','غ','ع','ه','خ','ح','ج','د'],
  ['ش','س','ي','ب','ل','ا','ت','ن','م','ك','ط'],
  ['ئ','ء','ؤ','ر','ى','ة','و','ز','ظ','⌫']
];

function cwKbBuild(){
  var isAr=LANG==='ar';
  var rows=isAr?CW_KB_AR:CW_KB_EN;
  var label=document.getElementById('cw-kb-lang-label');
  if(label) label.textContent=isAr?'عربي':'English';
  var container=document.getElementById('cw-kb-rows');
  if(!container) return;
  container.innerHTML='';
  rows.forEach(function(row){
    var rowEl=document.createElement('div');
    rowEl.className='cw-kb-row'+(isAr?' ar-row':'');
    row.forEach(function(ch){
      var btn=document.createElement('button');
      btn.className='cw-kb-key'+(ch==='⌫'?' backspace':'');
      btn.textContent=ch;
      btn.addEventListener('pointerdown',function(e){
        e.preventDefault(); // prevent focus loss on active input
        if(ch==='⌫') cwKbBackspace();
        else cwKbType(ch);
      });
      rowEl.appendChild(btn);
    });
    container.appendChild(rowEl);
  });
}

function cwKbType(ch){
  if(!cwKbActive) return;
  cwKbActive.value=ch;
  cwKbActive.dispatchEvent(new Event('input',{bubbles:true}));
}

function cwKbBackspace(){
  if(!cwKbActive) return;
  cwKbActive.value='';
  cwKbActive.dispatchEvent(new Event('input',{bubbles:true}));
  // move to previous cell
  var prevC=+cwKbActive.dataset.c-1;
  var lang=cwKbActive.dataset.lang;
  var r=cwKbActive.dataset.r;
  var prevInp=document.querySelector('#cw-grid-'+lang+' input[data-r="'+r+'"][data-c="'+prevC+'"]');
  if(prevInp){ cwKbActive=prevInp; }
}

function cwKbShow(inp){
  cwKbActive=inp;
  var kb=document.getElementById('cw-keyboard');
  if(!kb) return;
  cwKbBuild();
  kb.style.display='block';
}

function cwKbHide(){
  var kb=document.getElementById('cw-keyboard');
  if(kb) kb.style.display='none';
  document.querySelectorAll('.cw-kb-active-cell').forEach(function(c){c.classList.remove('cw-kb-active-cell');});
  cwKbActive=null;
}

// Wire up keyboard to all CW inputs — called after buildCWGrid
function cwAttachKeyboard(lang){
  document.querySelectorAll('#cw-grid-'+lang+' .input-cell, #cw-grid-'+lang+' .secret-cell').forEach(function(cell){
    var inp=cell.querySelector('input');
    if(!inp) return;
    inp.setAttribute('readonly','readonly'); // block native keyboard
    // show keyboard on tap of the cell div or the input itself
    function openKb(e){
      e.preventDefault();
      cwKbActive=inp;
      cwKbShow(inp);
      // highlight row
      var gridEl=document.getElementById('cw-grid-'+lang);
      gridEl.querySelectorAll('.cw-kb-active-cell').forEach(function(c){c.classList.remove('cw-kb-active-cell');});
      cell.classList.add('cw-kb-active-cell');
    }
    cell.addEventListener('pointerdown', openKb);
    inp.addEventListener('pointerdown', openKb);
  });
}

// ═══════════════════════════════════════
// PLATE BUILDER
// ═══════════════════════════════════════
var PL_GROUPS=[
  {id:'protein', color:'#9C27B0',en:'Protein',   ar:'البروتين',
   benefitEn:'Builds strong muscles! 💪',benefitAr:'يبني العضلات القوية! 💪',
   emoji:['🥩','🍗','🐟','🥚'],names:['Meat','Chicken','Fish','Eggs'],namesAr:['لحم','دجاج','سمك','بيض']},
  {id:'vegetable',color:'#4CAF50',en:'Vegetable',ar:'الخضار',
   benefitEn:'Full of vitamins & fibre! 🌿',benefitAr:'غنية بالفيتامينات والألياف! 🌿',
   emoji:['🥦','🥒','🫑','🥕'],names:['Broccoli','Cucumber','Pepper','Carrot'],namesAr:['بروكلي','خيار','فلفل','جزر']},
  {id:'fruits',  color:'#FF5722',en:'Fruits',    ar:'الفاكهة',
   benefitEn:'Boosts your energy! ⚡',benefitAr:'يمنحك طاقة وحيوية! ⚡',
   emoji:['🍎','🍌','🥭','🍓'],names:['Apple','Banana','Mango','Strawberry'],namesAr:['تفاح','موز','مانجو','فراولة']},
  {id:'grains',  color:'#F9A825',en:'Grains',    ar:'الحبوب',
   benefitEn:'Gives you energy all day! ☀️',benefitAr:'يمنحك طاقة طوال اليوم! ☀️',
   emoji:['🍞','🍚','🥣','🌽'],names:['Bread','Rice','Oats','Corn'],namesAr:['خبز','أرز','شوفان','ذرة']},
  {id:'dairy',   color:'#2196F3',en:'Dairy',     ar:'منتجات الألبان',
   benefitEn:'Makes bones & teeth strong! 🦷',benefitAr:'يقوّي العظام والأسنان! 🦷',
   emoji:['🥛','🧀','🫙','🥤'],names:['Milk','Cheese','Yogurt','Laban'],namesAr:['حليب','جبنة','زبادي','لبن']}
];
var PL_SLOTS=[{top:'19%',left:'47%'},{top:'39%',left:'73%'},{top:'69%',left:'63%'},{top:'69%',left:'31%'},{top:'39%',left:'21%'}];
var plSel=[null,null,null,null,null];

function initPL(){plSel=[null,null,null,null,null];renderPL();}

function renderPL(){
  syncLangBtns('pl');
  document.getElementById('pl-submit-btn').textContent=LANG==='ar'?'تحقق من طبقي ✓':'Check My Plate ✓';
  document.getElementById('pl-benefit-placeholder').textContent=LANG==='ar'?'اختر طعاماً لرؤية فائدته! 🌟':'Pick a food to see its benefit! 🌟';
  document.getElementById('pl-plate-heading').textContent=LANG==='ar'?'ابنِ طبقك الصحي!':'Build Your Healthy Plate!';
  document.getElementById('pl-groups-title').textContent=LANG==='ar'?'المجموعات الغذائية':'Food Groups — المجموعات الغذائية';
  document.getElementById('pl-prog-label').textContent='0 / 5 '+(LANG==='ar'?'مجموعات':'groups');
  renderPLSlots();
  renderPLGroups();
  updatePLProgress();
}

var PL_FILLED=['#CE93D8','#A5D6A7','#FFAB91','#FFF176','#90CAF9'];
var PL_EMPTY=['#F3E5F5','#E8F5E9','#FFF3E0','#FFFDE7','#E3F2FD'];
function renderPLSlots(){
  PL_GROUPS.forEach(function(g,i){
    var slice=document.getElementById('pl-slice-'+i);
    var emo=document.getElementById('pl-emoji-'+i);
    var lbl=document.getElementById('pl-label-'+i);
    if(!slice) return;
    if(plSel[i]){
      slice.setAttribute('fill',PL_FILLED[i]);
      emo.textContent=plSel[i];
      emo.setAttribute('opacity','1');
      emo.setAttribute('font-size','44');
      if(lbl){lbl.setAttribute('opacity','1');lbl.setAttribute('font-size','13');}
    } else {
      slice.setAttribute('fill',PL_EMPTY[i]);
      emo.textContent=g.emoji[0];
      emo.setAttribute('opacity','0.22');
      emo.setAttribute('font-size','36');
      if(lbl){lbl.setAttribute('opacity','0.6');}
    }
    slice.onclick=function(){
      if(plSel[i]){plSel[i]=null;renderPLSlots();renderPLGroups();updatePLProgress();}
    };
  });
}

function updatePLProgress(){
  var filled=plSel.filter(Boolean).length;
  var total=PL_SLOTS.length;
  var pct=(filled/total*100).toFixed(0);
  var bar=document.getElementById('pl-prog-bar');
  var label=document.getElementById('pl-prog-label');
  if(bar) bar.style.width=pct+'%';
  if(label) label.textContent=filled+' / '+total+' '+(LANG==='ar'?'مجموعات':'groups');
  // Progress dots
  var dotsEl=document.getElementById('pl-prog-dots');
  if(dotsEl){
    dotsEl.innerHTML='';
    PL_GROUPS.forEach(function(g,i){
      var dot=document.createElement('div');
      dot.className='pl-prog-dot'+(plSel[i]?' filled':'');
      dot.textContent=plSel[i]||g.emoji[0];
      if(plSel[i]) dot.style.background=g.color;
      dotsEl.appendChild(dot);
    });
  }
}

function renderPLGroups(){
  var el=document.getElementById('pl-food-groups');
  el.innerHTML='';
  PL_GROUPS.forEach(function(g,gi){
    var grp=document.createElement('div');
    grp.className='pl-food-group';
    grp.style.borderColor=plSel[gi]?g.color:'rgba(255,255,255,.15)';
    if(plSel[gi]) grp.style.background='rgba(255,255,255,.15)';
    var doneHtml=plSel[gi]?'<span class="pl-group-done visible">✓</span>':'<span class="pl-group-done"></span>';
    grp.innerHTML=
      '<div class="pl-group-label" style="background:'+g.color+'22">'+
        '<span class="pl-group-icon">'+g.emoji[0]+'</span>'+
        '<span style="flex:1;">'+(LANG==='ar'?g.ar:g.en)+'</span>'+
        doneHtml+
      '</div>'+
      '<div class="pl-foods" id="pl-foods-'+gi+'"></div>';
    el.appendChild(grp);
    var foodsEl=document.getElementById('pl-foods-'+gi);
    var names=LANG==='ar'?g.namesAr:g.names;
    g.emoji.forEach(function(em,fi){
      var btn=document.createElement('div');
      btn.className='pl-food-btn'+(plSel[gi]===em?' sel':'');
      btn.style.animationDelay=(fi*.06)+'s';
      if(plSel[gi]===em){
        btn.style.borderColor=g.color;
        btn.style.background=g.color+'22';
      }
      btn.innerHTML='<span class="pf-emoji">'+em+'</span><span class="pf-name">'+names[fi]+'</span>';
      (function(group,emoji,idx){
        btn.addEventListener('click',function(e){
          plSel[idx]=emoji;
          renderPLSlots();
          renderPLGroups();
          updatePLProgress();
          var bt=document.getElementById('pl-benefit-text');
          var bp=document.getElementById('pl-benefit-placeholder');
          bt.textContent=LANG==='ar'?group.benefitAr:group.benefitEn;
          bt.style.display='none'; void bt.offsetWidth; bt.style.display='';
          bt.classList.add('show');
          if(bp) bp.style.display='none';
          confettiBurst(e.clientX,e.clientY,14);
        });
      })(g,em,gi);
      foodsEl.appendChild(btn);
    });
  });
}

function plSubmit(){
  var filled=plSel.filter(Boolean).length;
  if(filled<5){showToast(LANG==='ar'?'اختر طعاماً من كل مجموعة!':'Choose food from every group!');return;}
  showWin('🍽️',LANG==='ar'?'طبق صحي رائع!':'Healthy Plate!',LANG==='ar'?'لقد بنيت طبقاً صحياً متكاملاً!':'You built a complete healthy plate!');
}
// ═══════════════════════════════════════
// RIPPLE + INTERACTION SYSTEM
// ═══════════════════════════════════════
document.addEventListener('pointerdown', function(e){
  var el = e.target.closest('.hub-card,.fa-topic-card,.re-topic-card,.fa-back-btn,.re-back-btn,.re-sel-card,.re-skill-card,.re-grat-card,.re-emotion-btn,.re-root-node,.re-yet-card,.re-flip-card,.re-mindset-item,.back-btn,.btn,.hub-start-btn');
  if(!el) return;
  var r = document.createElement('span');
  r.className = 'ripple';
  var rect = el.getBoundingClientRect();
  var size = Math.max(rect.width, rect.height);
  r.style.cssText = 'width:'+size+'px;height:'+size+'px;left:'+(e.clientX-rect.left-size/2)+'px;top:'+(e.clientY-rect.top-size/2)+'px;';
  el.style.position = el.style.position || 'relative';
  el.appendChild(r);
  r.addEventListener('animationend', function(){ r.remove(); });
});

// Confetti burst
function confettiBurst(x, y, count){
  count = count || 20;
  var colors=['#F7941D','#00A99D','#4CAF50','#E91E63','#9C27B0','#FFEB3B','#03A9F4'];
  for(var i=0;i<count;i++){
    var p=document.createElement('div');
    p.className='confetti-piece';
    p.style.left=(x||window.innerWidth/2)+((Math.random()-.5)*200)+'px';
    p.style.top=(y||window.innerHeight/2)+'px';
    p.style.background=colors[Math.floor(Math.random()*colors.length)];
    p.style.transform='rotate('+(Math.random()*360)+'deg)';
    p.style.animationDelay=(Math.random()*.3)+'s';
    p.style.animationDuration=(.8+Math.random()*.6)+'s';
    p.style.width=(6+Math.random()*8)+'px';
    p.style.height=(6+Math.random()*8)+'px';
    document.body.appendChild(p);
    p.addEventListener('animationend',function(){p.remove();});
  }
}

// ═══════════════════════════════════════
// RESILIENCE
// ═══════════════════════════════════════
var RE_TOPICS = [
  { emoji:'🧒', color:'#F57F17', en:'About Me', ar:'عَنّي' },
  { emoji:'🌳', color:'#5D4037', en:'Perseverance', ar:'المثابرة' },
  { emoji:'📚', color:'#1565C0', en:'Learning Mindset', ar:'عقلية التعلم' },
  { emoji:'🧠', color:'#2E7D32', en:'Growth Mindset', ar:'عقلية النمو' },
  { emoji:'💬', color:'#AD1457', en:'Positive Self-Talk', ar:'الحديث الإيجابي' },
  { emoji:'😊', color:'#F9A825', en:'Feelings & Emotions', ar:'المشاعر والأحاسيس' },
  { emoji:'🌸', color:'#6A1B9A', en:'Gratitude', ar:'الامتنان' }
];

var reIdleInterval=null, reIdleRemain=0;
function initRE(){ reShowMenu(); }

function reShowMenu(){ reShowTopic(0); }
function reShowMenu_legacy(){
  document.getElementById('re-idle-wrap').style.display='none';
  reStopIdle();
}

function reShowTopic(idx){
  if(!RE_TOPICS||!RE_TOPICS[idx]) return;
  document.querySelectorAll('.re-tl-item').forEach(function(el){el.classList.remove('active');});
  var li=document.querySelector('.re-tl-item[data-idx="'+idx+'"]');
  if(li) li.classList.add('active');
  var t=RE_TOPICS[idx];
  var col=t.color;
  var detail=document.getElementById('re-detail');
  detail.innerHTML='';

  // Header
  var hdr=document.createElement('div');
  hdr.className='fa-detail-header';
  hdr.style.borderLeft='6px solid '+col;
  hdr.innerHTML='<div class="fa-detail-icon">'+t.emoji+'</div>'+
    '<div class="fa-detail-title">'+
      '<div class="fa-detail-title-en">'+t.en+'</div>'+
      '<div class="fa-detail-title-ar">'+t.ar+'</div>'+
    '</div>';
  detail.appendChild(hdr);

  // Render topic content
  var renderers=[reRender0,reRender1,reRender2,reRender3,reRender4,reRender5,reRender6];
  renderers[idx](detail, col);
  reStartIdle();
}

// ─── Topic 0: About Me ───
var reAboutAnswers = {};

var RE_ABOUT_FIELDS = [
  { key:'age',    en:'My age',              ar:'عمري',                icon:'🎂' },
  { key:'place',  en:'Favorite place',      ar:'مكاني المفضل',        icon:'📍' },
  { key:'love',   en:'I love myself because',ar:'أنا أحب نفسي لأن',  icon:'❤️' },
  { key:'better', en:'I am getting better at',ar:'أنا أتحسن في',     icon:'📈' },
  { key:'game',   en:'Favorite game',       ar:'اللعبة المفضلة',      icon:'🎮' },
  { key:'learn',  en:'I want to learn',     ar:'أريد أن أتعلم',       icon:'🌟' }
];

function reAboutOpen(key, col){
  document.querySelectorAll('.re-field-row').forEach(function(r){ r.classList.remove('re-field-active'); });
  var row = document.querySelector('.re-field-row[data-key="'+key+'"]');
  if(row) row.classList.add('re-field-active');
  var kb = document.getElementById('re-keyboard');
  if(!kb) return;
  kb.style.display='flex';
  kb.dataset.activeKey = key;
  kb.dataset.col = col;
  var inp = document.getElementById('re-kb-input');
  if(inp){ inp.textContent = reAboutAnswers[key] || ''; inp.dataset.key=key; }
}

function reAboutClose(){
  var kb = document.getElementById('re-keyboard');
  if(kb){ kb.style.display='none'; kb.dataset.activeKey=''; }
  document.querySelectorAll('.re-field-row').forEach(function(r){ r.classList.remove('re-field-active'); });
}

function reKbType(ch){
  var key = document.getElementById('re-keyboard').dataset.activeKey;
  if(!key) return;
  if(ch==='⌫'){
    reAboutAnswers[key] = (reAboutAnswers[key]||'').slice(0,-1);
  } else {
    reAboutAnswers[key] = (reAboutAnswers[key]||'') + ch;
  }
  var inp = document.getElementById('re-kb-input');
  if(inp) inp.textContent = reAboutAnswers[key] || '';
  var ans = document.querySelector('.re-field-row[data-key="'+key+'"] .re-field-answer');
  if(ans){ ans.textContent = reAboutAnswers[key] || ''; ans.classList.toggle('re-field-filled', !!reAboutAnswers[key]); }
  reUpdatePower();
}

var reAboutChips = {};   // persisted chip selections (survive topic switches)
var _rePowerCelebrated = false;

function reUpdatePower(){
  var fill = document.getElementById('re-power-fill');
  var pctEl = document.getElementById('re-power-pct');
  if(!fill) return;
  var fieldCount = 0;
  RE_ABOUT_FIELDS.forEach(function(f){ if((reAboutAnswers[f.key]||'').trim()) fieldCount++; });
  var chipCount = Object.keys(reAboutChips).filter(function(k){ return reAboutChips[k]; }).length;
  var total = RE_ABOUT_FIELDS.length + 14; // 6 fields + 14 abilities
  var pct = Math.round((fieldCount + chipCount) / total * 100);
  var prev = parseInt(fill.dataset.pct || '0', 10);
  fill.dataset.pct = pct;
  fill.style.width = pct + '%';
  if(pctEl) pctEl.textContent = pct + '%';
  // milestone feedback
  if(prev < 50 && pct >= 50 && typeof dashSFX === 'function') dashSFX('ability');
  if(prev < 100 && pct >= 100){
    if(typeof dashSFX === 'function') dashSFX('fanfare');
    if(!_rePowerCelebrated){ _rePowerCelebrated = true; reShowHeroCard(); }
  }
}

function reShowHeroCard(){
  var detail = document.getElementById('re-detail');
  if(!detail) return;
  var chips = Object.keys(reAboutChips).filter(function(k){ return reAboutChips[k]; });
  var top3 = chips.slice(0, 3).join(' · ');
  var ov = document.createElement('div');
  ov.className = 're-hero-overlay';
  ov.innerHTML =
    '<div class="re-hero-card">' +
      '<div class="re-hero-stars">⭐⭐⭐</div>' +
      '<div class="re-hero-title">I AM UNIQUE!</div>' +
      '<div class="re-hero-title-ar">أنا مميز!</div>' +
      '<div class="re-hero-line">💪 ' + chips.length + ' super abilities! / قدرات خارقة!</div>' +
      (top3 ? '<div class="re-hero-abils">' + top3 + '</div>' : '') +
      '<div class="re-hero-msg">You know yourself — that is real strength!<br>' +
        '<span style="font-family:var(--font-ar);direction:rtl;display:block;margin-top:4px;">معرفة نفسك هي القوة الحقيقية!</span></div>' +
      '<button class="quiz-start-btn" style="background:#F57F17" onclick="this.closest(\'.re-hero-overlay\').remove()">🎉 Awesome! / رائع!</button>' +
    '</div>';
  detail.appendChild(ov);
  if(typeof confettiBurst === 'function'){
    var r = detail.getBoundingClientRect();
    confettiBurst(r.left + r.width/2, r.top + r.height/3, 50);
  }
}

function reRender0(el, col){
  // ── "My Power Level" progress meter ──
  var meter = document.createElement('div');
  meter.className = 're-power-wrap';
  meter.innerHTML =
    '<div class="re-power-label">⚡ My Power Level — مستوى قوتي <span class="re-power-pct" id="re-power-pct">0%</span></div>' +
    '<div class="re-power-bar"><div class="re-power-fill" id="re-power-fill" data-pct="0"></div></div>' +
    '<div class="re-power-hint">Fill your profile & tap your abilities to power up! / املأ ملفك واضغط على قدراتك لرفع قوتك!</div>';
  el.appendChild(meter);

  var body=document.createElement('div');
  body.className='fa-body';

  // Left: Fillable Profile
  var left=document.createElement('div');
  left.className='fa-steps-col';
  left.style.flex='1';
  left.innerHTML='<div class="re-section-title">Each of us is unique — ما الذي يميزني؟</div>'+
    '<div style="text-align:center;font-size:3.5rem;margin:8px 0">🧒</div>';

  RE_ABOUT_FIELDS.forEach(function(f){
    var row = document.createElement('div');
    row.className='re-field-row';
    row.dataset.key = f.key;
    var saved = reAboutAnswers[f.key] || '';
    row.innerHTML =
      '<div class="re-field-label"><span class="re-field-icon">'+f.icon+'</span>'+
      '<span class="re-field-en">'+f.en+'</span><span class="re-field-ar">'+f.ar+'</span></div>'+
      '<div class="re-field-answer'+(saved?' re-field-filled':'')+'">'+
        (saved || '<span class="re-field-placeholder">Tap to write... / اضغط للكتابة</span>')+
      '</div>';
    row.addEventListener('pointerdown', function(e){
      e.stopPropagation();
      reAboutOpen(f.key, col);
    });
    left.appendChild(row);
  });
  body.appendChild(left);

  // Right: Tap abilities
  var right=document.createElement('div');
  right.className='fa-right-col';
  right.style.flex='1.2';
  right.innerHTML='<div class="re-section-title">⭐ My Unique Abilities — قدراتي الفريدة</div>'+
    '<div style="font-size:.75rem;color:var(--text-mid);font-weight:600;margin-bottom:10px;">Tap the abilities that describe you! / اضغط على قدراتك!</div>';
  var grid=document.createElement('div');
  grid.className='re-select-grid';
  var abilities=[
    {en:'I say kind words',ar:'أقول كلمات لطيفة',icon:'💬'},
    {en:'I can imagine things',ar:'يمكنني أن أتخيل',icon:'💭'},
    {en:'I never give up',ar:'أحاول ولا أستسلم',icon:'💪'},
    {en:'I have humor',ar:'لدي روح الدعابة',icon:'😄'},
    {en:'I share my ideas',ar:'أشارك أفكاري',icon:'💡'},
    {en:'I can say NO to wrong things',ar:'أستطيع قول لا للخطأ',icon:'🚫'},
    {en:'I am curious',ar:'لدي فضول',icon:'🔍'},
    {en:'I ask questions',ar:'أطرح أسئلة',icon:'❓'},
    {en:'I help others',ar:'أساعد الآخرين',icon:'🤝'},
    {en:'I love my body',ar:'أنا أحب جسدي',icon:'❤️'},
    {en:'I take care of myself',ar:'أعتني بنفسي',icon:'🌟'},
    {en:'I love all my feelings',ar:'أحب كل مشاعري',icon:'🌈'},
    {en:'I come up with great ideas',ar:'آتي بأفكار رائعة',icon:'🚀'},
    {en:'I can learn anything',ar:'يمكنني تعلم أي شيء',icon:'📚'}
  ];
  abilities.forEach(function(a){
    var card=document.createElement('div');
    card.className='re-sel-card';
    card.innerHTML=a.icon+' '+a.en+' / <span style="font-family:var(--font-ar)">'+a.ar+'</span>';
    // restore persisted selection
    if(reAboutChips[a.en]){ card.classList.add('on'); card.style.background=col; }
    card.onclick=function(e){
      this.classList.toggle('on');
      var on = this.classList.contains('on');
      reAboutChips[a.en] = on;
      this.style.background = on ? col : '';
      if(on){
        if(typeof dashSFX === 'function') dashSFX('pickup', Object.keys(reAboutChips).filter(function(k){return reAboutChips[k];}).length);
        var total=document.querySelectorAll('.re-sel-card.on').length;
        if(total===14) confettiBurst(e.clientX,e.clientY,40);
      }
      reUpdatePower();
    };
    grid.appendChild(card);
  });
  right.appendChild(grid);
  body.appendChild(right);
  el.appendChild(body);

  reUpdatePower();
  // Build RE keyboard after DOM is ready
  setTimeout(reKbBuild, 0);
}

var RE_KB_EN=[
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M','⌫'],
  ['SPACE','123']
];
var RE_KB_NUM=['1','2','3','4','5','6','7','8','9','0','.','⌫'];

function reKbBuild(){
  var container = document.getElementById('re-kb-rows');
  if(!container) return;
  container.innerHTML='';
  RE_KB_EN.forEach(function(row){
    var rowEl=document.createElement('div');
    rowEl.style.cssText='display:flex;justify-content:center;gap:6px;margin-bottom:6px;';
    row.forEach(function(ch){
      var btn=document.createElement('button');
      var isWide = ch==='SPACE'||ch==='123';
      btn.style.cssText='min-width:'+(ch==='SPACE'?'200px':isWide?'80px':'52px')+';height:50px;border-radius:9px;border:none;background:rgba(255,255,255,.12);color:#fff;font-size:'+(ch==='SPACE'||ch==='123'?'.8rem':'1.1rem')+';font-weight:700;cursor:pointer;transition:background .1s,transform .1s;touch-action:manipulation;font-family:inherit;';
      btn.textContent = ch==='SPACE' ? '— space —' : ch;
      btn.addEventListener('pointerdown',function(e){
        e.preventDefault();
        if(ch==='SPACE') reKbType(' ');
        else if(ch==='123'){ reKbBuildNum(); return; }
        else reKbType(ch);
        btn.style.background='rgba(76,175,80,.5)';
        setTimeout(function(){ btn.style.background='rgba(255,255,255,.12)'; },120);
      });
      rowEl.appendChild(btn);
    });
    container.appendChild(rowEl);
  });
}

function reKbBuildNum(){
  var container=document.getElementById('re-kb-rows');
  if(!container) return;
  container.innerHTML='';
  var rowEl=document.createElement('div');
  rowEl.style.cssText='display:flex;flex-wrap:wrap;justify-content:center;gap:6px;';
  RE_KB_NUM.forEach(function(ch){
    var btn=document.createElement('button');
    btn.style.cssText='min-width:70px;height:50px;border-radius:9px;border:none;background:rgba(255,255,255,.12);color:#fff;font-size:1.2rem;font-weight:700;cursor:pointer;touch-action:manipulation;font-family:inherit;';
    btn.textContent=ch;
    btn.addEventListener('pointerdown',function(e){
      e.preventDefault();
      if(ch==='⌫') reKbType('⌫');
      else reKbType(ch);
    });
    rowEl.appendChild(btn);
  });
  var backBtn=document.createElement('button');
  backBtn.style.cssText='min-width:120px;height:50px;border-radius:9px;border:none;background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);font-size:.85rem;font-weight:700;cursor:pointer;touch-action:manipulation;margin-top:6px;';
  backBtn.textContent='← ABC';
  backBtn.addEventListener('pointerdown',function(e){ e.preventDefault(); reKbBuild(); });
  rowEl.appendChild(backBtn);
  container.appendChild(rowEl);
}

// ─── Topic 1: Perseverance ───
function reRender1(el, col){
  // Story card
  var story=document.createElement('div');
  story.className='re-story';
  story.innerHTML='<div class="re-story-title">📖 The Perseverance Story — قصة المثابرة</div>'+
    '<div class="re-story-body">This young leader believed his people could reach a better life. He worked, learned and never stopped dreaming.</div>'+
    '<div style="margin:10px 0;display:flex;align-items:center;gap:10px;">'+
      '<span style="font-weight:900;font-size:1.1rem;">UAE</span>'+
      '<span style="font-weight:900;font-size:1.1rem">Sheikh Zayed — الشيخ زايد &nbsp;✨ A great example of perseverance</span>'+
    '</div>'+
    '<div class="re-story-body-ar">كان هناك قائد شاب يؤمن بأن شعبه يستطيع الوصول لحياة أفضل. عمل وتعلم ولم يتوقف عن الحلم.</div>';
  el.appendChild(story);

  // Quote
  var quote=document.createElement('div');
  quote.style.cssText='background:#FFF8E1;border-radius:var(--radius-lg);padding:16px 20px;border-left:5px solid #F9A825;font-size:.9rem;font-weight:700;color:#5D4037;line-height:1.6;margin-bottom:10px;';
  quote.innerHTML='🌳 <em>"The wind must blow, yet it quickly disappears — the tree stays strong because of its roots."</em>'+
    '<div style="font-family:var(--font-ar);direction:rtl;text-align:right;margin-top:8px;font-size:.88rem;color:#795548;">تذكر: الريح لا بد أن تهب لكنها سرعان ما تختفي، وتبقى الشجرة صامدة بسبب جذورها القوية</div>';
  el.appendChild(quote);

  // Fillable reflection field
  var reflectRow = document.createElement('div');
  reflectRow.className='re-field-row';
  reflectRow.dataset.key='perseverance_quote';
  var savedQ = reAboutAnswers['perseverance_quote'] || '';
  reflectRow.innerHTML=
    '<div class="re-field-label"><span class="re-field-icon">✍️</span>'+
    '<span class="re-field-en">My reflection on this quote</span>'+
    '<span class="re-field-ar">تأملي في هذه الكلمات</span></div>'+
    '<div class="re-field-answer'+(savedQ?' re-field-filled':'')+'">'+
      (savedQ || '<span class="re-field-placeholder">Tap to write your thoughts... / اضغط لكتابة أفكارك</span>')+
    '</div>';
  reflectRow.addEventListener('pointerdown',function(e){
    e.stopPropagation();
    reAboutOpen('perseverance_quote', col);
  });
  el.appendChild(reflectRow);
  setTimeout(reKbBuild, 0);

  // Roots
  var rootTitle=document.createElement('div');
  rootTitle.className='re-section-title';
  rootTitle.style.marginBottom='10px';
  rootTitle.textContent='🌱 My Strong Roots — جذوري الخاصة — Tap each root that keeps you strong!';
  el.appendChild(rootTitle);

  var roots=[
    {icon:'👨‍👩‍👧',en:'Family',ar:'العائلة',col:'#E91E63'},
    {icon:'🕌',en:'Faith',ar:'الإيمان',col:'#00897B'},
    {icon:'👫',en:'Friends',ar:'الأصدقاء',col:'#1976D2'},
    {icon:'UAE',en:'Country',ar:'الوطن',col:'#2E7D32'},
    {icon:'💡',en:'Ideas',ar:'الأفكار',col:'#F57F17'},
    {icon:'🏡',en:'Places',ar:'الأماكن',col:'#7B1FA2'},
    {icon:'🎨',en:'Hobbies',ar:'الهوايات',col:'#AD1457'}
  ];
  var rootGrid=document.createElement('div');
  rootGrid.className='re-roots-grid';
  roots.forEach(function(r){
    var node=document.createElement('div');
    node.className='re-root-node';
    node.innerHTML='<div class="rn-icon">'+r.icon+'</div><div class="rn-en">'+r.en+'</div><div class="rn-ar">'+r.ar+'</div>';
    node.onclick=function(){
      this.classList.toggle('on');
      this.style.background=this.classList.contains('on')?r.col:'';
      this.style.borderColor=this.classList.contains('on')?r.col:'#e0e0e0';
    };
    rootGrid.appendChild(node);
  });
  el.appendChild(rootGrid);
}

// ─── Topic 2: Learning Mindset ───
function reRender2(el, col){
  var body=document.createElement('div');
  body.className='fa-body';

  // Left: Skills
  var left=document.createElement('div');
  left.className='fa-steps-col';
  left.style.flex='1';
  left.innerHTML='<div class="re-section-title">🔑 Skills — المهارات</div>'+
    '<div style="font-size:.75rem;color:var(--text-mid);font-weight:600;margin-bottom:12px;">A skill grows through practice! Tap your skills / اضغط على مهاراتك!</div>';
  var sg=document.createElement('div');
  sg.className='re-skills-grid';
  var skills=[
    {icon:'🚲',en:'Cycling',ar:'ركوب الدراجة'},
    {icon:'🎨',en:'Drawing',ar:'الرسم'},
    {icon:'✍️',en:'Writing',ar:'الكتابة'},
    {icon:'👂',en:'Listening',ar:'الاستماع'},
    {icon:'⏰',en:'Time Management',ar:'إدارة الوقت'},
    {icon:'💡',en:'Creative Thinking',ar:'التفكير الإبداعي'},
    {icon:'🗣️',en:'Communication',ar:'التواصل'},
    {icon:'🤝',en:'Responsibility',ar:'تحمل المسؤولية'}
  ];
  skills.forEach(function(s){
    var c=document.createElement('div');
    c.className='re-skill-card';
    c.innerHTML=s.icon+' <div><div>'+s.en+'</div><div style="font-family:var(--font-ar);font-size:.76rem;color:var(--text-mid)">'+s.ar+'</div></div>';
    c.onclick=function(){ this.classList.toggle('on'); this.style.background=this.classList.contains('on')?col:''; this.style.color=this.classList.contains('on')?'#fff':''; };
    sg.appendChild(c);
  });
  left.appendChild(sg);
  body.appendChild(left);

  // Right: YET concept
  var right=document.createElement('div');
  right.className='fa-right-col';
  right.style.flex='1.1';
  right.innerHTML='<div class="re-section-title">💡 Learn to use "YET" — تعلم استخدام "مع ذلك"</div>'+
    '<div style="font-size:.78rem;color:var(--text-mid);font-weight:600;margin-bottom:12px;">Tap each card to flip the thought! / اضغط لتحويل الفكرة!</div>';
  var yets=[
    {neg:"I can't ride a bike now",pos:'I can\'t ride a bike now ... YET! I will keep training ✨',neg_ar:'لا أستطيع ركوب الدراجة الآن',pos_ar:'لا أستطيع ركوب الدراجة الآن ... مع ذلك سأستمر حتى أتقن ذلك ✨'},
    {neg:"I can't draw well",pos:"I can't draw well ... YET! I'll keep practicing 🎨",neg_ar:'لا أستطيع الرسم جيداً',pos_ar:'لا أستطيع الرسم جيداً ... مع ذلك سأستمر حتى أتحسن 🎨'},
    {neg:"I'm not good at this subject",pos:"I'm not good at this subject ... YET! I'll get there 📚",neg_ar:'لست جيداً في هذه المادة',pos_ar:'لست جيداً في هذه المادة ... مع ذلك سأصل إليها 📚'}
  ];
  yets.forEach(function(y){
    var card=document.createElement('div');
    card.className='re-yet-card';
    card.style.borderLeft='4px solid '+col;
    card.innerHTML='<div class="re-yet-negative">😟 '+y.neg+'</div>'+
      '<div style="font-family:var(--font-ar);direction:rtl;text-align:right;font-size:.8rem;color:#b71c1c;opacity:.6;text-decoration:line-through">'+y.neg_ar+'</div>'+
      '<div class="re-yet-positive">😊 '+y.pos+'<div style="font-family:var(--font-ar);direction:rtl;text-align:right;font-size:.8rem;margin-top:4px;color:#1B5E20">'+y.pos_ar+'</div></div>'+
      '<div class="re-yet-hint">👆 Tap to add YET! / اضغط لإضافة مع ذلك!</div>';
    card.onclick=function(e){ var wasHidden=!this.classList.contains('revealed'); this.classList.toggle('revealed'); if(wasHidden) confettiBurst(e.clientX,e.clientY,12); };
    right.appendChild(card);
  });
  body.appendChild(right);
  el.appendChild(body);
}

// ─── Topic 3: Growth vs Fixed Mindset ───
function reRender3(el, col){
  var intro=document.createElement('div');
  intro.style.cssText='background:var(--white);border-radius:var(--radius-lg);padding:14px 20px;box-shadow:var(--shadow-sm);font-size:.88rem;font-weight:700;color:var(--text-dark);text-align:center;';
  intro.innerHTML='Our minds grow every time we learn something new! — <span style="font-family:var(--font-ar)">عقولنا تنمو كلما تعلمنا شيئاً جديداً!</span>'+
    '<div style="font-size:.75rem;color:var(--text-mid);font-weight:600;margin-top:6px;">Tap Fixed Mindset items to see the Growth version! / اضغط على العقلية الثابتة لترى النمو!</div>';
  el.appendChild(intro);

  var cols=document.createElement('div');
  cols.className='re-mindset-cols';

  var pairs=[
    {g:{en:'Can try',ar:'أستطيع المحاولة'},f:{en:'Cannot try anymore',ar:'لا يمكن المحاولة'}},
    {g:{en:'Learn from mistakes',ar:'أتعلم من الأخطاء'},f:{en:'Hate failing',ar:'أكره الفشل'}},
    {g:{en:'Learns from feedback',ar:'أتعلم من الملاحظات'},f:{en:'Ignores feedback',ar:'أتجاهل الملاحظات'}},
    {g:{en:'Curious to learn',ar:'لدي فضول للتعلم'},f:{en:'Think I know everything',ar:'أعتقد أنني أعرف كل شيء'}},
    {g:{en:'Asks questions',ar:'أسأل الأسئلة'},f:{en:"Doesn't ask questions",ar:'لا أسأل الأسئلة'}}
  ];

  var growthCol=document.createElement('div');
  growthCol.className='re-mindset-col';
  growthCol.innerHTML='<div class="re-mindset-header" style="background:#E8F5E9;color:#1B5E20;">✅ Growth Mindset — عقلية النمو</div>';

  var fixedCol=document.createElement('div');
  fixedCol.className='re-mindset-col';
  fixedCol.innerHTML='<div class="re-mindset-header" style="background:#FFEBEE;color:#B71C1C;">❌ Fixed Mindset — العقلية الثابتة</div>';

  pairs.forEach(function(p,i){
    var gi=document.createElement('div');
    gi.className='re-mindset-item';
    gi.id='re-gm-g'+i;
    gi.style.background='#F1F8E9';
    gi.style.color='#2E7D32';
    gi.innerHTML='✅ '+p.g.en+' / <span style="font-family:var(--font-ar)">'+p.g.ar+'</span>';
    growthCol.appendChild(gi);

    var fi=document.createElement('div');
    fi.className='re-mindset-item';
    fi.style.background='#FFF3E0';
    fi.style.color='#BF360C';
    fi.style.cursor='pointer';
    fi.innerHTML='❌ '+p.f.en+' / <span style="font-family:var(--font-ar)">'+p.f.ar+'</span>';
    (function(gi,fi,p){
      fi.onclick=function(){
        if(this.classList.contains('flipped')){
          this.classList.remove('flipped');
          this.style.background='#FFF3E0'; this.style.color='#BF360C';
          this.innerHTML='❌ '+p.f.en+' / <span style="font-family:var(--font-ar)">'+p.f.ar+'</span>';
          gi.style.background='#F1F8E9'; gi.style.transform='';
        } else {
          this.classList.add('flipped');
          this.style.background='#E8F5E9'; this.style.color='#1B5E20';
          this.innerHTML='✅ '+p.g.en+' / <span style="font-family:var(--font-ar)">'+p.g.ar+'</span> 🎉';
          gi.style.background=col; gi.style.color='#fff'; gi.style.transform='scale(1.04)';
        }
      };
    })(gi,fi,p);
    fixedCol.appendChild(fi);
  });

  cols.appendChild(growthCol);
  cols.appendChild(fixedCol);
  el.appendChild(cols);

  var tip=document.createElement('div');
  tip.style.cssText='text-align:center;font-size:.8rem;font-weight:700;color:var(--text-mid);padding:8px;';
  tip.textContent='🎯 Tap the red ❌ items to flip them to green ✅ — اضغط على البنود الحمراء لتحويلها!';
  el.appendChild(tip);
}

// ─── Topic 4: Positive Self-Talk ───
function reRender4(el, col){
  var intro=document.createElement('div');
  intro.style.cssText='background:var(--white);border-radius:var(--radius-lg);padding:14px 20px;box-shadow:var(--shadow-sm);font-size:.88rem;font-weight:700;color:var(--text-dark);text-align:center;';
  intro.innerHTML='Your inner words have power! — <span style="font-family:var(--font-ar)">كلماتك الداخلية لها قوة!</span>'+
    '<div style="font-size:.75rem;color:var(--text-mid);font-weight:600;margin-top:4px;">Tap each card to flip negative → positive! / اضغط لتحويل السلبي إلى إيجابي!</div>';
  el.appendChild(intro);

  var pairs=[
    {neg:"I can't solve this problem",pos:"This is tricky — I can search for an answer 🔍",neg_ar:'لا أستطيع حل هذه المشكلة',pos_ar:'هذه المشكلة صعبة، يمكنني البحث عن إجابة'},
    {neg:"I am not good at this",pos:"I am not good at this ... YET! 💪",neg_ar:'أنا لست جيداً في هذا',pos_ar:'أنا لست جيداً في هذا ... مع ذلك!'},
    {neg:"This is the only thing I can do",pos:"I give effort and can do many things! 🌟",neg_ar:'هذا هو الشيء الوحيد الذي أفعله',pos_ar:'أبذل مجهوداً ويمكنني فعل أشياء كثيرة'},
    {neg:"This is hard and not achievable",pos:"This gets better with practice! 🎯",neg_ar:'هذا صعب ولا يمكن تحقيقه',pos_ar:'يتحسن مع التدريب'},
    {neg:"This was a complete failure",pos:"This was a great learning opportunity! 📚",neg_ar:'كان هذا فشلاً ذريعاً',pos_ar:'كانت هذه فرصة رائعة للتعلم'}
  ];

  var grid=document.createElement('div');
  grid.className='re-flip-grid';
  grid.style.gridTemplateColumns='1fr 1fr';
  grid.style.gap='12px';

  pairs.forEach(function(p){
    var fc=document.createElement('div');
    fc.className='re-flip-card';
    fc.style.height='100px';
    fc.innerHTML='<div class="re-flip-inner">'+
      '<div class="re-flip-face re-flip-front">'+
        '<span style="font-size:1.4rem">😟</span>'+
        '<div><div>'+p.neg+'</div><div style="font-family:var(--font-ar);font-size:.78rem;direction:rtl;text-align:right;margin-top:3px;opacity:.8">'+p.neg_ar+'</div>'+
        '<div class="re-flip-hint">👆 Tap to flip!</div></div>'+
      '</div>'+
      '<div class="re-flip-face re-flip-back">'+
        '<span style="font-size:1.4rem">😊</span>'+
        '<div><div>'+p.pos+'</div><div style="font-family:var(--font-ar);font-size:.78rem;direction:rtl;text-align:right;margin-top:3px;opacity:.85">'+p.pos_ar+'</div></div>'+
      '</div>'+
    '</div>';
    fc.onclick=function(e){ var wasFlipped=this.classList.contains('flipped'); this.classList.toggle('flipped'); if(!wasFlipped) confettiBurst(e.clientX,e.clientY,10); };
    grid.appendChild(fc);
  });
  el.appendChild(grid);
}

// ─── Topic 5: Feelings & Emotions ───
function reRender5(el, col){
  var intro=document.createElement('div');
  intro.style.cssText='background:var(--white);border-radius:var(--radius-lg);padding:14px 20px;box-shadow:var(--shadow-sm);font-size:.88rem;font-weight:700;color:var(--text-dark);text-align:center;';
  intro.innerHTML='We all feel all kinds of emotions — and that is completely normal! 🌈<br><span style="font-family:var(--font-ar)">نشعر جميعًا بكل أنواع المشاعر — وهذا أمر طبيعي تماماً!</span>'+
    '<div style="font-size:.75rem;color:var(--text-mid);font-weight:600;margin-top:4px;">Tap a feeling! / اضغط على مشاعرك!</div>';
  el.appendChild(intro);

  var emotions=[
    {icon:'😄',en:'Happy',ar:'سعيد',col:'#F9A825'},
    {icon:'😢',en:'Sad',ar:'حزين',col:'#42A5F5'},
    {icon:'😡',en:'Angry',ar:'غاضب',col:'#EF5350'},
    {icon:'😨',en:'Scared',ar:'خائف',col:'#7E57C2'},
    {icon:'😲',en:'Surprised',ar:'مندهش',col:'#FF7043'},
    {icon:'🤢',en:'Disgusted',ar:'متقزز',col:'#66BB6A'},
    {icon:'😌',en:'Calm',ar:'هادئ',col:'#26C6DA'},
    {icon:'😟',en:'Worried',ar:'قلق',col:'#8D6E63'},
    {icon:'🥰',en:'Loved',ar:'محبوب',col:'#EC407A'},
    {icon:'😤',en:'Frustrated',ar:'محبط',col:'#FF5722'},
    {icon:'😊',en:'Grateful',ar:'ممتنان',col:'#9CCC65'},
    {icon:'😎',en:'Confident',ar:'واثق',col:'#29B6F6'}
  ];

  var activeEl=null;
  var grid=document.createElement('div');
  grid.className='re-emotions-grid';

  var favBox=document.createElement('div');
  favBox.style.cssText='background:var(--white);border-radius:var(--radius-lg);padding:14px 20px;box-shadow:var(--shadow-sm);text-align:center;font-size:.88rem;font-weight:700;color:var(--text-mid);margin-top:4px;';
  favBox.id='re-fav-box';
  favBox.innerHTML='❤️ Which is your favorite feeling? / ما هو الشعور المفضل بالنسبة لك?';

  emotions.forEach(function(e){
    var btn=document.createElement('div');
    btn.className='re-emotion-btn';
    btn.innerHTML='<div class="re-emotion-icon">'+e.icon+'</div><div class="re-emotion-en">'+e.en+'</div><div class="re-emotion-ar">'+e.ar+'</div>';
    btn.onclick=function(){
      if(activeEl && activeEl!==this){
        activeEl.classList.remove('active');
        activeEl.style.background=''; activeEl.style.borderColor='#e0e0e0'; activeEl.style.color='';
      }
      this.classList.toggle('active');
      var isOn=this.classList.contains('active');
      this.style.background=isOn?e.col:'';
      this.style.borderColor=isOn?e.col:'#e0e0e0';
      this.style.color=isOn?'#fff':'';
      activeEl=isOn?this:null;
      document.getElementById('re-fav-box').innerHTML=isOn?
        '❤️ Your favorite feeling is: <strong style="color:'+e.col+'">'+e.icon+' '+e.en+' — <span style="font-family:var(--font-ar)">'+e.ar+'</span></strong> 🎉':
        '❤️ Which is your favorite feeling? / ما هو الشعور المفضل بالنسبة لك?';
    };
    grid.appendChild(btn);
  });

  el.appendChild(grid);
  el.appendChild(favBox);

  // ── Calm Breathing exercise ──
  var bb = document.createElement('div');
  bb.className = 're-breath-box';
  bb.innerHTML =
    '<div class="re-section-title">🌬️ Calm Breathing — التنفس الهادئ</div>' +
    '<div class="re-breath-sub">Feeling angry or worried? Breathe with the circle! / تشعر بالغضب أو القلق؟ تنفس مع الدائرة!</div>' +
    '<div class="re-breath-circle" id="re-breath-circle"><span id="re-breath-text">▶</span></div>' +
    '<div class="re-breath-round" id="re-breath-round"></div>';
  el.appendChild(bb);
  var circle = bb.querySelector('#re-breath-circle');
  var txt = bb.querySelector('#re-breath-text');
  var roundEl = bb.querySelector('#re-breath-round');
  var breathing = false;
  circle.onclick = function(){
    if(breathing) return;
    breathing = true;
    var round = 0;
    function cycle(){
      if(!document.contains(circle)){ breathing = false; return; } // left the topic
      round++;
      if(round > 3){
        circle.classList.remove('inhale');
        txt.innerHTML = '🌟';
        roundEl.textContent = 'Well done! You are calm now / أحسنت! أنت هادئ الآن';
        if(typeof dashSFX === 'function') dashSFX('heart');
        var r = circle.getBoundingClientRect();
        if(typeof confettiBurst === 'function') confettiBurst(r.left + r.width/2, r.top, 24);
        setTimeout(function(){ breathing = false; txt.innerHTML = '▶'; roundEl.textContent = ''; }, 3000);
        return;
      }
      roundEl.textContent = 'Round ' + round + ' / 3 — الجولة ' + round;
      // inhale 4s
      circle.classList.add('inhale');
      txt.innerHTML = 'Breathe in<br><span style="font-family:var(--font-ar)">استنشق</span>';
      if(typeof dashTone === 'function') dashTone(300, 3.5, 'sine', 0.05, 0, 480);
      setTimeout(function(){
        if(!document.contains(circle)){ breathing = false; return; }
        // exhale 4s
        circle.classList.remove('inhale');
        txt.innerHTML = 'Breathe out<br><span style="font-family:var(--font-ar)">ازفر</span>';
        if(typeof dashTone === 'function') dashTone(480, 3.5, 'sine', 0.05, 0, 300);
        setTimeout(cycle, 4000);
      }, 4000);
    }
    cycle();
  };
}

// ─── Topic 6: Gratitude ───
function reRender6(el, col){
  var counter=document.createElement('div');
  counter.className='re-counter';
  counter.style.borderTop='4px solid '+col;
  counter.innerHTML='<div class="re-grat-counter-num" id="re-grat-num" style="color:'+col+'">0</div>'+
    '<div style="font-size:.85rem;font-weight:700;color:var(--text-mid)">Things I am grateful for — أشياء أشعر بالامتنان لوجودها</div>'+
    '<div style="font-size:.75rem;color:var(--text-mid);margin-top:4px;">Tap to color them! / اضغط للتلوين!</div>';
  el.appendChild(counter);

  var items=[
    {icon:'👨‍👩‍👧',en:'Family',ar:'العائلة',col:'#E91E63'},
    {icon:'👫',en:'Friends',ar:'الأصدقاء',col:'#1976D2'},
    {icon:'🏠',en:'Home',ar:'البيت',col:'#F57F17'},
    {icon:'🌞',en:'Sunshine',ar:'الشمس',col:'#FDD835'},
    {icon:'📚',en:'Learning',ar:'التعلم',col:'#0288D1'},
    {icon:'🍎',en:'Food',ar:'الطعام',col:'#E53935'},
    {icon:'❤️',en:'Health',ar:'الصحة',col:'#00897B'},
    {icon:'🎨',en:'Creativity',ar:'الإبداع',col:'#7B1FA2'},
    {icon:'🐾',en:'Animals',ar:'الحيوانات',col:'#5D4037'},
    {icon:'🌍',en:'Homeland',ar:'الوطن',col:'#2E7D32'}
  ];

  var count=0;
  var grid=document.createElement('div');
  grid.className='re-grat-grid';

  items.forEach(function(item){
    var card=document.createElement('div');
    card.className='re-grat-card';
    card.innerHTML='<div class="re-grat-icon">'+item.icon+'</div><div class="re-grat-en">'+item.en+'</div><div class="re-grat-ar">'+item.ar+'</div>';
    card.onclick=function(){
      var on=this.classList.toggle('on');
      this.style.background=on?item.col:'';
      this.style.borderColor=on?item.col:'#e0e0e0';
      count+=on?1:-1;
      document.getElementById('re-grat-num').textContent=count;
      if(on && (count===5||count===10)) confettiBurst(event.clientX, event.clientY, count===10?40:20);
    };
    grid.appendChild(card);
  });
  el.appendChild(grid);

  var extra=document.createElement('div');
  extra.style.cssText='background:var(--white);border-radius:var(--radius-lg);padding:14px 20px;box-shadow:var(--shadow-sm);font-size:.85rem;font-weight:700;color:var(--text-mid);text-align:center;border-left:4px solid '+col+';';
  extra.innerHTML='✨ I am also grateful for ... — وأنا ممتن أيضاً لـ ...';
  el.appendChild(extra);
}

function reStartIdle(){
  reStopIdle(); reIdleRemain=45;
  document.getElementById('re-idle-wrap').style.display='flex';
  document.getElementById('re-idle-bar').style.width='100%';
  reIdleInterval=setInterval(function(){
    reIdleRemain--;
    var pct=Math.max(0,(reIdleRemain/45)*100);
    document.getElementById('re-idle-bar').style.width=pct+'%';
    document.getElementById('re-idle-label').textContent='Returning in '+reIdleRemain+'s';
    if(reIdleRemain<=0){reStopIdle();reShowMenu();}
  },1000);
}
function reStopIdle(){ if(reIdleInterval){clearInterval(reIdleInterval);reIdleInterval=null;} }
document.addEventListener('pointerdown',function(){
  if(CUR_SCREEN==='re' && reIdleInterval){ reIdleRemain=45; }
});

// ═══════════════════════════════════════
// PUBLIC HEALTH
// ═══════════════════════════════════════
var PH_TOPICS = [
  {
    emoji:'🙌', color:'#00897B',
    en:'Handwashing', ar:'غسل اليدين – درعك الأول',
    subtitle:{en:'Your #1 Shield', ar:'درعك الأول'},
    steps:[
      {en:'Wet your hands with running water', ar:'بلل يديك بالماء الجاري'},
      {en:'Apply enough soap to cover both hands', ar:'ضع كمية كافية من الصابون'},
      {en:'Rub hands together for a full 20 seconds', ar:'افرك يديك معاً لمدة 20 ثانية كاملة'},
      {en:"Don't forget between fingers, under nails and back of hands", ar:'لا تنسَ بين الأصابع، تحت الأظافر، وظهر اليدين'},
      {en:'Rinse hands well under running water', ar:'اشطف يديك جيداً تحت الماء الجاري'},
      {en:'Dry with a clean towel or paper towel', ar:'جفف يديك بمنشفة نظيفة أو ورق تجفيف'}
    ],
    when:[
      {icon:'🍽️', en:'Before & after eating', ar:'قبل وبعد الأكل'},
      {icon:'🚽', en:'After the toilet', ar:'بعد المرحاض'},
      {icon:'🤧', en:'After sneezing or coughing', ar:'بعد العطس أو السعال'},
      {icon:'🎮', en:'After playing', ar:'بعد اللعب'},
      {icon:'🐾', en:'After touching animals', ar:'بعد لمس الحيوانات'},
      {icon:'🩺', en:'Before first aid', ar:'قبل الإسعافات الأولية'}
    ],
    fact:{en:'Proper handwashing prevents 80% of infectious diseases from spreading', ar:'غسل اليدين الصحيح يقي من انتقال 80% من الأمراض المعدية'},
    source:'WHO – منظمة الصحة العالمية'
  },
  {
    emoji:'💉', color:'#7B1FA2',
    en:'Vaccines', ar:'اللقاحات',
    subtitle:{en:'Your Shield Against Disease', ar:'حصنك ضد الأمراض'},
    bullets:[
      {icon:'🛡️', en:'Vaccines protect your body from dangerous diseases like measles, polio and hepatitis', ar:'اللقاحات تحمي جسمك من الأمراض الخطيرة كالحصبة وشلل الأطفال والتهاب الكبد'},
      {icon:'📅', en:'Follow the UAE National Immunization Program schedule from birth to Grade 11', ar:'اتبع الجدول الوطني للتطعيم في الإمارات من الولادة حتى الصف 11'},
      {icon:'🌍', en:'UAE achieves 95%+ vaccination coverage – among the highest in the world (WHO)', ar:'الإمارات تحقق تغطية تطعيم تتجاوز 95% – من بين الأعلى عالمياً'},
      {icon:'🆓', en:'Free vaccination at all ADPHC & DOH primary health centers in Abu Dhabi', ar:'التطعيم مجاني في جميع مراكز الرعاية الصحية الأولية التابعة لـ ADPHC وDOH في أبوظبي'}
    ],
    diseases:[
      {emoji:'💉', en:'Measles MMR', ar:'الحصبة'},
      {emoji:'💉', en:'Polio', ar:'شلل الأطفال'},
      {emoji:'💉', en:'Hepatitis', ar:'التهاب الكبد'},
      {emoji:'💉', en:'Chickenpox', ar:'الجدري'},
    ],
    source:'DOH أبوظبي & WHO'
  },
  {
    emoji:'😴', color:'#1565C0',
    en:'Sleep', ar:'النوم الكافي',
    subtitle:{en:'Fuel for Your Brain', ar:'وقود الدماغ'},
    ageTable:[
      {group:{en:'Children', ar:'أطفال'}, age:{en:'6–12 years', ar:'6-12 سنة'}, hours:{en:'9–12 hours', ar:'9-12 ساعة'}},
      {group:{en:'Teens', ar:'مراهقون'}, age:{en:'13–18 years', ar:'13-18 سنة'}, hours:{en:'8–10 hours', ar:'8-10 ساعات'}}
    ],
    steps:[
      {en:'Turn off all screens 1 hour before bedtime', ar:'أغلق جميع الشاشات قبل ساعة من وقت النوم'},
      {en:'Go to sleep and wake up at the same time every day', ar:'اذهب للنوم واستيقظ في نفس الوقت يومياً'},
      {en:'Keep your bedroom quiet, dark and comfortable', ar:'اجعل غرفة نومك هادئة ومظلمة ومريحة'},
      {en:'Avoid caffeine and sugars before bedtime', ar:'تجنب الكافيين والسكريات قبل النوم'},
      {en:'Exercise during the day for better sleep', ar:'مارس نشاطاً بدنياً خلال النهار لنوم أفضل'}
    ],
    benefits:[
      {icon:'🧠', en:'Memory', ar:'تحسين الذاكرة'},
      {icon:'💪', en:'Healthy growth', ar:'نمو صحي'},
      {icon:'😊', en:'Better mood', ar:'مزاج أفضل'},
      {icon:'🛡️', en:'Strong immunity', ar:'مناعة قوية'},
      {icon:'📚', en:'Better focus', ar:'تركيز أعلى'}
    ],
    source:'ADPHC & WHO'
  },
  {
    emoji:'📱', color:'#E65100',
    en:'Screen Time', ar:'وقت الشاشة',
    subtitle:{en:'Balance Matters!', ar:'التوازن مهم!'},
    ageTable:[
      {group:{en:'Under 2 years', ar:'أقل من 2 سنة'}, age:{en:'🚫', ar:'🚫'}, hours:{en:'Zero', ar:'صفر'}},
      {group:{en:'2–5 years', ar:'2-5 سنوات'}, age:{en:'⏱️', ar:'⏱️'}, hours:{en:'1 hr/day max', ar:'ساعة يومياً كحد أقصى'}},
      {group:{en:'6 years+', ar:'6 سنوات فأكثر'}, age:{en:'✅', ar:'✅'}, hours:{en:'Reasonable limits', ar:'حدود معقولة'}}
    ],
    steps:[
      {en:'Make screen time educational and interactive, not passive', ar:'اجعل وقت الشاشة تعليمياً وتفاعلياً وليس سلبياً'},
      {en:'Meal and bedtime must always be screen-free', ar:'وقت الأكل والنوم يجب أن يكون بدون شاشات دائماً'},
      {en:'Choose sports and outdoor activities over screen time', ar:'مارس الرياضة والأنشطة الخارجية بدلاً من الشاشة'},
      {en:'Talk to children about the content they watch', ar:'تحدث مع الأطفال عن المحتوى الذي يشاهدونه'}
    ],
    source:'American Academy of Pediatrics & ADPHC'
  },
  {
    emoji:'⚽', color:'#2E7D32',
    en:'Physical Activity', ar:'النشاط البدني',
    subtitle:{en:'Move Your Body!', ar:'حرك جسمك!'},
    stat:{num:'60', unit:{en:'minutes daily', ar:'دقيقة يومياً'}, label:{en:'Minimum recommended', ar:'الحد الأدنى الموصى به'}},
    activities:[
      {icon:'🏃', en:'Running & brisk walking', ar:'الجري والمشي السريع'},
      {icon:'🏊', en:'Swimming', ar:'السباحة'},
      {icon:'🚴', en:'Cycling', ar:'ركوب الدراجة'},
      {icon:'⚽', en:'Team sports (football, basketball)', ar:'الرياضة الجماعية (كرة قدم، كرة سلة)'},
      {icon:'🤸', en:'Strength exercises & kids yoga', ar:'تمارين القوة واليوغا للأطفال'}
    ],
    fact:{en:'Daily physical activity reduces obesity risk by 50% and strengthens the heart, bones and mind!', ar:'النشاط البدني اليومي يقلل خطر السمنة بنسبة 50٪ ويقوي القلب والعظام والعقل!'},
    source:'ADPHC – Active Abu Dhabi Initiative'
  },
  {
    emoji:'🧠', color:'#AD1457',
    en:'Mental Health', ar:'الصحة النفسية',
    subtitle:{en:'Your Mind Matters!', ar:'عقلك يهم!'},
    steps:[
      {en:'Talk to someone you trust about your feelings', ar:'تحدث مع شخص تثق به عن مشاعرك'},
      {en:'Exercise – it improves mood naturally', ar:'مارس الرياضة – تحسّن المزاج بشكل طبيعي'},
      {en:'Good sleep and healthy food support your mental health', ar:'النوم الكافي والغذاء الصحي يدعمان صحتك النفسية'},
      {en:'Make time for rest and enjoyable hobbies', ar:'خصص وقتاً للراحة والهوايات الممتعة'},
      {en:'Maintain positive social relationships with friends & family', ar:'حافظ على علاقات اجتماعية إيجابية مع الأصدقاء والعائلة'},
      {en:'Asking for help when needed = STRENGTH, not weakness', ar:'طلب المساعدة عند الحاجة قوة وليس ضعفاً 💙'}
    ],
    fact:{en:'Good mental health helps you learn, grow and succeed', ar:'صحتك النفسية تساعدك على التعلم والتطور والنجاح'},
    hotline:{num:'800-SAKINA', label:{en:'Mental Health Support Line', ar:'خط الدعم النفسي – سكينة'}},
    source:'ADPHC Community Mental Health Programme'
  }
];

var phIdleInterval=null, phIdleRemain=0;

function initPH(){phShowMenu();}

function phShowMenu(){ phShowTopic(0); }
function phShowMenu_legacy(){
  document.getElementById('ph-idle-wrap').style.display='none';
  phStopIdle();
}

function phShowTopic(idx){
  if(!PH_TOPICS||!PH_TOPICS[idx]) return;
  document.querySelectorAll('.ph-tl-item').forEach(function(el){el.classList.remove('active');});
  var li=document.querySelector('.ph-tl-item[data-idx="'+idx+'"]');
  if(li) li.classList.add('active');
  var t=PH_TOPICS[idx];
  var col=t.color;
  var detail=document.getElementById('ph-detail');
  detail.innerHTML='';

  // Header
  var hdr=document.createElement('div');
  hdr.className='fa-detail-header';
  hdr.style.borderLeft='6px solid '+col;
  hdr.innerHTML='<div class="fa-detail-icon">'+t.emoji+'</div>'+
    '<div class="fa-detail-title">'+
      '<div class="fa-detail-title-en">'+t.en+' <span style="font-size:1rem;font-weight:700;color:var(--text-mid)">— '+t.subtitle.en+'</span></div>'+
      '<div class="fa-detail-title-ar">'+t.ar+'</div>'+
    '</div>';
  detail.appendChild(hdr);

  var body=document.createElement('div');
  body.className='fa-body';

  // LEFT COLUMN
  var left=document.createElement('div');
  left.className='fa-steps-col';

  if(t.steps){
    left.innerHTML='<div class="fa-steps-title">Steps / Tips — النصائح</div>';
    t.steps.forEach(function(s,i){
      var step=document.createElement('div');
      step.className='fa-step';
      step.innerHTML='<div class="fa-step-num" style="background:'+col+'">'+(i+1)+'</div>'+
        '<div class="fa-step-text">'+
          '<div class="fa-step-en">'+s.en+'</div>'+
          '<div class="fa-step-ar">'+s.ar+'</div>'+
        '</div>';
      left.appendChild(step);
    });
    makeStepsCheckable(left, col);
  }

  if(t.bullets){
    left.innerHTML='<div class="fa-steps-title">Key Facts — معلومات أساسية</div>';
    t.bullets.forEach(function(b){
      var item=document.createElement('div');
      item.className='fa-step';
      item.innerHTML='<div style="font-size:1.6rem;flex-shrink:0;margin-top:2px">'+b.icon+'</div>'+
        '<div class="fa-step-text">'+
          '<div class="fa-step-en">'+b.en+'</div>'+
          '<div class="fa-step-ar">'+b.ar+'</div>'+
        '</div>';
      left.appendChild(item);
    });
  }

  body.appendChild(left);

  // RIGHT COLUMN
  var right=document.createElement('div');
  right.className='fa-right-col';

  // Age table (Sleep, Screen Time)
  if(t.ageTable){
    var tableWrap=document.createElement('div');
    tableWrap.style.background='var(--white)';
    tableWrap.style.borderRadius='var(--radius-lg)';
    tableWrap.style.padding='16px';
    tableWrap.style.boxShadow='var(--shadow-sm)';
    var tbl='<div class="fa-steps-title" style="margin-bottom:10px">Recommended Hours — الساعات الموصى بها</div><table class="ph-age-table"><thead><tr><th>Group</th><th>Age</th><th>Hours</th></tr></thead><tbody>';
    t.ageTable.forEach(function(r){
      tbl+='<tr><td><b>'+r.group.en+'</b><br><span style="font-family:var(--font-ar);font-size:.78rem">'+r.group.ar+'</span></td>'+
           '<td>'+r.age.en+'<br><span style="font-family:var(--font-ar);font-size:.78rem">'+r.age.ar+'</span></td>'+
           '<td style="color:'+col+';font-size:.95rem">'+r.hours.en+'<br><span style="font-family:var(--font-ar);font-size:.78rem;color:var(--text-mid)">'+r.hours.ar+'</span></td></tr>';
    });
    tbl+='</tbody></table>';
    tableWrap.innerHTML=tbl;
    right.appendChild(tableWrap);
  }

  // Stat box (Physical Activity)
  if(t.stat){
    var stat=document.createElement('div');
    stat.className='ph-stat-box';
    stat.style.borderTop='4px solid '+col;
    stat.innerHTML='<div class="ph-stat-num" style="color:'+col+'">'+t.stat.num+'</div>'+
      '<div class="ph-stat-label">'+t.stat.unit.en+' — '+t.stat.label.en+'</div>'+
      '<div class="ph-stat-label-ar">'+t.stat.unit.ar+' — '+t.stat.label.ar+'</div>';
    right.appendChild(stat);
  }

  // Activities list
  if(t.activities){
    var actWrap=document.createElement('div');
    actWrap.className='ph-when-list';
    actWrap.style.flex='1';
    actWrap.innerHTML='<div class="fa-steps-title" style="margin-bottom:8px">Activities — الأنشطة</div>';
    t.activities.forEach(function(a){
      actWrap.innerHTML+='<div class="ph-when-item">'+a.icon+' <span>'+a.en+' &nbsp;/&nbsp; <span style="font-family:var(--font-ar)">'+a.ar+'</span></span></div>';
    });
    // activities go left if no steps/bullets
    if(!t.steps && !t.bullets){ left.innerHTML='<div class="fa-steps-title">Activities — الأنشطة</div>'; left.appendChild(actWrap); }
    else { right.appendChild(actWrap); }
  }

  // Diseases list (Vaccines)
  if(t.diseases){
    var disWrap=document.createElement('div');
    disWrap.className='ph-when-list';
    disWrap.innerHTML='<div class="fa-steps-title" style="margin-bottom:8px">Protects Against — يحمي من</div>';
    t.diseases.forEach(function(d){
      disWrap.innerHTML+='<div class="ph-when-item">'+d.emoji+' <span>'+d.en+' &nbsp;/&nbsp; <span style="font-family:var(--font-ar)">'+d.ar+'</span></span></div>';
    });
    right.appendChild(disWrap);
  }

  // When to wash (Handwashing)
  if(t.when){
    var whenWrap=document.createElement('div');
    whenWrap.className='ph-when-list';
    whenWrap.innerHTML='<div class="fa-steps-title" style="margin-bottom:8px">When to Wash — متى تغسل يديك؟</div>';
    t.when.forEach(function(w){
      whenWrap.innerHTML+='<div class="ph-when-item">'+w.icon+' <span>'+w.en+' &nbsp;/&nbsp; <span style="font-family:var(--font-ar)">'+w.ar+'</span></span></div>';
    });
    right.appendChild(whenWrap);
    // interactive 20-second practice timer for handwashing
    phWashTimer(right, col);
  }

  // Benefits grid (Sleep)
  if(t.benefits){
    var benWrap=document.createElement('div');
    benWrap.style.background='var(--white)';
    benWrap.style.borderRadius='var(--radius-lg)';
    benWrap.style.padding='16px';
    benWrap.style.boxShadow='var(--shadow-sm)';
    benWrap.innerHTML='<div class="fa-steps-title" style="margin-bottom:10px">Benefits — الفوائد</div><div class="ph-benefits-grid">';
    t.benefits.forEach(function(b){
      benWrap.innerHTML+='<div class="ph-benefit-item">'+b.icon+' <div><div>'+b.en+'</div><div style="font-family:var(--font-ar);font-size:.76rem;color:var(--text-mid)">'+b.ar+'</div></div></div>';
    });
    benWrap.innerHTML+='</div>';
    right.appendChild(benWrap);
  }

  // Fact box
  if(t.fact){
    var fact=document.createElement('div');
    fact.className='ph-fact';
    fact.style.background='linear-gradient(135deg,'+col+','+col+'cc)';
    fact.innerHTML='💡 '+t.fact.en+'<div class="ph-fact-ar">'+t.fact.ar+'</div>';
    right.appendChild(fact);
  }

  // Hotline (Mental Health)
  if(t.hotline){
    var hl=document.createElement('div');
    hl.className='ph-hotline';
    hl.innerHTML='<div class="ph-hotline-num">📞 '+t.hotline.num+'</div>'+
      '<div class="ph-hotline-label">'+t.hotline.label.en+'</div>'+
      '<div class="ph-hotline-label-ar">'+t.hotline.label.ar+'</div>';
    right.appendChild(hl);
  }

  // Source tag
  var src=document.createElement('div');
  src.style.cssText='font-size:.72rem;color:var(--text-mid);font-weight:700;text-align:right;padding:4px 0;';
  src.textContent='Source: '+t.source;
  right.appendChild(src);

  body.appendChild(right);
  detail.appendChild(body);
  phStartIdle();
}

function phStartIdle(){
  phStopIdle();
  phIdleRemain=45;
  document.getElementById('ph-idle-wrap').style.display='flex';
  document.getElementById('ph-idle-bar').style.width='100%';
  phIdleInterval=setInterval(function(){
    phIdleRemain--;
    var pct=Math.max(0,(phIdleRemain/45)*100);
    document.getElementById('ph-idle-bar').style.width=pct+'%';
    document.getElementById('ph-idle-label').textContent='Returning in '+phIdleRemain+'s';
    if(phIdleRemain<=0){phStopIdle();phShowMenu();}
  },1000);
}

function phStopIdle(){
  if(phIdleInterval){clearInterval(phIdleInterval);phIdleInterval=null;}
}

document.addEventListener('pointerdown',function(){
  if(CUR_SCREEN==='ph' && phIdleInterval){phIdleRemain=45;}
});

// ═══════════════════════════════════════
// FIRST AID
// ═══════════════════════════════════════
var FA_TOPICS = [
  {
    emoji:'🩹', color:'#E91E63',
    en:'Cuts & Scrapes', ar:'الجروح والخدوش',
    steps:[
      {en:'Wash your hands with soap and water for 20 seconds', ar:'اغسل يديك بالماء والصابون لمدة 20 ثانية'},
      {en:'Apply gentle pressure with a clean cloth to stop bleeding', ar:'اضغط برفق على الجرح بقطعة قماش نظيفة لوقف النزيف'},
      {en:'Rinse the wound thoroughly with clean running water', ar:'اشطف الجرح جيداً بالماء النظيف الجاري'},
      {en:'Apply mild antiseptic then cover with a clean bandage', ar:'ضع مطهراً خفيفاً ثم غطِّ الجرح بضمادة نظيفة'},
      {en:'Change the bandage daily or when it gets dirty', ar:'غيّر الضمادة يومياً أو عند الاتساخ'},
      {en:'Tell a parent or teacher immediately if the wound is deep', ar:'أخبر والديك أو المعلم فوراً إذا كان الجرح عميقاً'}
    ],
    doList:[
      {en:'Always wash hands first', ar:'اغسل اليدين أولاً دائماً'},
      {en:'Use a sterile bandage', ar:'استخدم ضمادة معقمة'}
    ],
    dontList:[
      {en:"Don't apply dirt or toothpaste", ar:'لا تضع تراباً أو معجون أسنان'},
      {en:"Don't ignore continuous bleeding", ar:'لا تتجاهل النزيف المستمر'}
    ],
    emergency:{en:'Call 999 if bleeding lasts more than 10 minutes or wound is very deep', ar:'اتصل بـ 999 إذا استمر النزيف لأكثر من 10 دقائق أو كان الجرح عميقاً جداً'}
  },
  {
    emoji:'🔥', color:'#FF5722',
    en:'Minor Burns', ar:'الحروق الخفيفة',
    steps:[
      {en:'Move the burned area away from the heat source immediately', ar:'أبعد الجزء المحروق عن مصدر الحرارة فوراً'},
      {en:'Hold under cool running water for a full 10 minutes', ar:'ضع الحرق تحت ماء بارد جارٍ لمدة 10 دقائق كاملة'},
      {en:'Do NOT use ice, butter, or toothpaste at all', ar:'لا تستخدم الجليد أو الزبدة أو المعجون إطلاقاً'},
      {en:'Gently cover with a clean non-stick dressing', ar:'غطِّ الحرق بضمادة نظيفة غير لاصقة برفق'},
      {en:'Do not break any blisters that form on the skin', ar:'لا تكسر أي فقاعات تتكون على الجلد'},
      {en:'Tell parents or teacher and see a doctor if needed', ar:'أبلغ والديك أو المعلم وتوجه للطبيب عند الحاجة'}
    ],
    doList:[
      {en:'Use cool (not cold) running water', ar:'استخدم ماءً فاتراً (ليس بارداً جداً)'},
      {en:'Cover loosely with a clean dressing', ar:'غطِّ الحرق بضمادة نظيفة بشكل خفيف'}
    ],
    dontList:[
      {en:"Don't use ice, butter or toothpaste", ar:'لا تستخدم الجليد أو الزبدة أو المعجون'},
      {en:"Don't break blisters", ar:'لا تكسر الفقاعات'}
    ],
    emergency:{en:'Call 999 if burn is larger than your palm, has blisters, or affects face/hands', ar:'اتصل بـ 999 إذا كان الحرق أكبر من راحة اليد أو ظهرت فقاعات أو أصاب الوجه أو اليدين'}
  },
  {
    emoji:'🩸', color:'#2196F3',
    en:'Nosebleed', ar:'نزيف الأنف',
    steps:[
      {en:'Sit upright and tilt head slightly forward only', ar:'اجلس بوضع مستقيم وامل رأسك للأمام قليلاً فقط'},
      {en:'Gently pinch both sides of the nose together for 10–15 minutes', ar:'اضغط بلطف على جانبي الأنف معاً لمدة 10-15 دقيقة'},
      {en:'Breathe calmly through your mouth while pinching', ar:'تنفس من فمك بهدوء أثناء الضغط'},
      {en:'Do NOT tilt head back or swallow the blood', ar:'لا تميل رأسك للخلف ولا تبلع الدم'},
      {en:'Do not blow your nose for 2 hours after bleeding stops', ar:'لا تنفخ أنفك خلال ساعتين بعد توقف النزيف'},
      {en:'Stay calm – most nosebleeds stop on their own', ar:'ابقَ هادئاً – معظم نزيف الأنف يتوقف وحده'}
    ],
    doList:[
      {en:'Sit upright, lean slightly forward', ar:'اجلس مستقيماً وامل للأمام قليلاً'},
      {en:'Pinch nose firmly for 10–15 min', ar:'اضغط على الأنف بحزم لـ 10-15 دقيقة'}
    ],
    dontList:[
      {en:"Don't tilt head back", ar:'لا تميل رأسك للخلف'},
      {en:"Don't swallow blood or blow nose", ar:'لا تبلع الدم ولا تنفخ أنفك'}
    ],
    emergency:{en:'Seek medical help if bleeding lasts more than 20 minutes or is severe', ar:'اطلب المساعدة الطبية إذا استمر النزيف لأكثر من 20 دقيقة أو كان شديداً'}
  },
  {
    emoji:'😰', color:'#9C27B0',
    en:'Choking', ar:'الاختناق',
    steps:[
      {en:'If they can cough – let them cough it out, do not interfere', ar:'إذا كان يستطيع السعال – دعه يسعل وحده، لا تتدخل'},
      {en:'If they stop breathing – get adult help immediately', ar:'إذا توقف عن التنفس – اطلب مساعدة كبار السن فوراً'},
      {en:'Lean them forward and give 5 firm back blows between shoulder blades', ar:'انحنِ للأمام واطلب ضرب الظهر 5 مرات بقوة بين لوحي الكتف'},
      {en:'Stay calm and reassure the affected person', ar:'ابقَ هادئاً وطمئن الشخص المصاب'},
      {en:'Never try to remove the object blindly with your finger', ar:'لا تحاول أبداً إخراج الجسم بإصبعك بشكل أعمى'}
    ],
    doList:[
      {en:'Let them cough if they can', ar:'دعهم يسعلون إن استطاعوا'},
      {en:'Give 5 firm back blows if needed', ar:'أعطِ 5 ضربات على الظهر عند الحاجة'}
    ],
    dontList:[
      {en:"Don't put fingers in their mouth blindly", ar:'لا تضع إصبعك في فمه بشكل أعمى'},
      {en:"Don't shake or panic them", ar:'لا تهزّه أو تُصيبه بالذعر'}
    ],
    emergency:{en:'Call 999 immediately if breathing stops or face turns blue', ar:'اتصل بـ 999 فوراً إذا توقف التنفس أو تحوّل الوجه للأزرق'},
    signs:[
      {en:'Cannot speak', ar:'لا يستطيع التحدث'},
      {en:'Severe difficulty breathing', ar:'صعوبة شديدة في التنفس'},
      {en:'Face turns blue or purple', ar:'الوجه يتحول للأزرق'},
      {en:'Grabbing the throat', ar:'الإمساك بالحلق'}
    ]
  },
  {
    emoji:'🧰', color:'#00897B',
    en:'First Aid Kit', ar:'حقيبة الإسعافات الأولية',
    isKit:true,
    items:[
      {emoji:'🩹', en:'Bandages in different sizes', ar:'ضمادات بأحجام مختلفة'},
      {emoji:'🧻', en:'Sterile medical gauze', ar:'شاش طبي معقم'},
      {emoji:'✂️', en:'Tweezers and medical scissors', ar:'ملقط ومقص طبي'},
      {emoji:'🧴', en:'Antiseptic (Betadine / Dettol)', ar:'مطهر جلدي (بيتادين / ديتول)'},
      {emoji:'💊', en:"Children's pain relief medication", ar:'مسكن ألم مناسب للأطفال'},
      {emoji:'🌡️', en:'Digital thermometer', ar:'ميزان حرارة رقمي'},
      {emoji:'🧤', en:'Sterile medical gloves', ar:'قفازات طبية معقمة'},
      {emoji:'📋', en:'Emergency numbers card', ar:'بطاقة أرقام الطوارئ'}
    ],
    emergency:{en:'Ambulance 998  |  Police 999  |  Fire 997', ar:'إسعاف 998  |  شرطة 999  |  إطفاء 997'}
  }
];

var faIdleTimer=null, faIdleSeconds=45, faIdleRemain=0, faIdleInterval=null;

function initFA(){
  faShowMenu();
}

function faShowMenu(){ faShowTopic(0); }
function faShowMenu_legacy(){
  document.getElementById('fa-idle-wrap').style.display='none';
  faStopIdle();
}

// Make step lists tappable: check each step, celebrate when all done
function makeStepsCheckable(container, col){
  var steps = container.querySelectorAll('.fa-step');
  if(!steps.length) return;
  steps.forEach(function(step){
    step.classList.add('fa-step-checkable');
    step.addEventListener('click', function(e){
      this.classList.toggle('done');
      var num = this.querySelector('.fa-step-num');
      if(this.classList.contains('done')){
        if(num){ num.dataset.orig = num.textContent; num.textContent = '✓'; num.style.background = '#4CAF50'; }
        var doneCount = container.querySelectorAll('.fa-step.done').length;
        if(typeof dashSFX === 'function') dashSFX('pickup', doneCount);
        if(doneCount === steps.length){
          if(typeof dashSFX === 'function') dashSFX('fanfare');
          if(typeof confettiBurst === 'function') confettiBurst(e.clientX, e.clientY, 30);
        }
      } else {
        if(num){ num.textContent = num.dataset.orig || ''; num.style.background = col; }
      }
    });
  });
  // hint line
  var hint = document.createElement('div');
  hint.className = 'fa-check-hint';
  hint.innerHTML = '👆 Tap each step when you know it! / اضغط على كل خطوة عندما تعرفها!';
  var title = container.querySelector('.fa-steps-title');
  if(title) title.insertAdjacentElement('afterend', hint);
}

// 20-second handwashing practice timer
function phWashTimer(wrap, col){
  var box = document.createElement('div');
  box.className = 'ph-wash-box';
  box.innerHTML =
    '<div class="fa-steps-title" style="margin-bottom:6px">🕐 Practice Timer — مؤقت التدريب</div>' +
    '<div class="ph-wash-sub">Can you wash for the FULL 20 seconds? / هل تستطيع الغسل لمدة 20 ثانية كاملة؟</div>' +
    '<div class="ph-wash-circle" id="ph-wash-circle"><span id="ph-wash-num">20</span></div>' +
    '<button class="ph-wash-btn" id="ph-wash-btn" style="background:' + col + '">▶ Start / ابدأ</button>' +
    '<div class="ph-wash-hint" id="ph-wash-hint">🎵 Sing "Happy Birthday" twice! / غنِّ "سنة حلوة" مرتين!</div>';
  wrap.appendChild(box);
  var running = false;
  box.querySelector('#ph-wash-btn').onclick = function(){
    if(running) return;
    running = true;
    var btn = this;
    btn.style.opacity = '0.4';
    var numEl = box.querySelector('#ph-wash-num');
    var circle = box.querySelector('#ph-wash-circle');
    var remain = 20;
    numEl.textContent = remain;
    circle.classList.add('washing');
    if(typeof dashSFX === 'function') dashSFX('go');
    var iv = setInterval(function(){
      if(!document.contains(circle)){ clearInterval(iv); return; }
      remain--;
      numEl.textContent = remain;
      if(remain % 5 === 0 && remain > 0 && typeof dashTone === 'function') dashTone(600, 0.08, 'sine', 0.08);
      if(remain <= 0){
        clearInterval(iv);
        circle.classList.remove('washing');
        numEl.textContent = '✨';
        btn.style.opacity = '1';
        running = false;
        if(typeof dashSFX === 'function') dashSFX('fanfare');
        var r = circle.getBoundingClientRect();
        if(typeof confettiBurst === 'function') confettiBurst(r.left + r.width/2, r.top, 26);
        setTimeout(function(){ numEl.textContent = '20'; }, 3000);
      }
    }, 1000);
  };
}

function faShowTopic(idx){
  if(!FA_TOPICS||!FA_TOPICS[idx]) return;
  document.querySelectorAll('.fa-tl-item').forEach(function(el){el.classList.remove('active');});
  var li=document.querySelector('.fa-tl-item[data-idx="'+idx+'"]');
  if(li) li.classList.add('active');
  var t=FA_TOPICS[idx];
  var col=t.color;
  var detail=document.getElementById('fa-detail');
  detail.innerHTML='';

  // Header
  var hdr=document.createElement('div');
  hdr.className='fa-detail-header';
  hdr.style.borderLeft='6px solid '+col;
  hdr.innerHTML='<div class="fa-detail-icon">'+t.emoji+'</div>'+
    '<div class="fa-detail-title">'+
      '<div class="fa-detail-title-en">'+t.en+'</div>'+
      '<div class="fa-detail-title-ar">'+t.ar+'</div>'+
    '</div>';
  detail.appendChild(hdr);

  if(t.isKit){
    // Kit layout
    var body=document.createElement('div');
    body.className='fa-body';
    var left=document.createElement('div');
    left.className='fa-steps-col';
    left.style.flex='1';
    left.innerHTML='<div class="fa-steps-title">Kit Contents — محتويات الحقيبة</div>'+
      '<div class="fa-check-hint">🎒 Tap each item to pack your kit! / اضغط على كل عنصر لتجهيز حقيبتك! <b id="fa-kit-count">0/'+t.items.length+'</b></div>'+
      '<div class="fa-kit-grid" id="fa-kit-grid"></div>';
    body.appendChild(left);
    detail.appendChild(body);
    var kg=document.getElementById('fa-kit-grid');
    t.items.forEach(function(item){
      var d=document.createElement('div');
      d.className='fa-kit-item';
      d.innerHTML='<span style="font-size:1.6rem">'+item.emoji+'</span>'+
        '<div><div style="font-size:.88rem;font-weight:700;color:var(--text-dark)">'+item.en+'</div>'+
        '<div class="fa-kit-item-ar">'+item.ar+'</div></div>';
      d.addEventListener('click', function(e){
        this.classList.toggle('packed');
        var packed = kg.querySelectorAll('.fa-kit-item.packed').length;
        var cnt = document.getElementById('fa-kit-count');
        if(cnt) cnt.textContent = packed + '/' + t.items.length;
        if(this.classList.contains('packed')){
          if(typeof dashSFX === 'function') dashSFX('pickup', packed);
          if(packed === t.items.length){
            if(typeof dashSFX === 'function') dashSFX('fanfare');
            if(typeof confettiBurst === 'function') confettiBurst(e.clientX, e.clientY, 34);
            if(cnt) cnt.textContent = '🎒 Kit ready! / الحقيبة جاهزة!';
          }
        }
      });
      kg.appendChild(d);
    });
    // Emergency row
    var emg=document.createElement('div');
    emg.className='fa-emergency';
    emg.style.background='linear-gradient(135deg,#b71c1c,#c62828)';
    emg.innerHTML='<div class="fa-emergency-num">🚨 '+t.emergency.en+'</div>'+
      '<div class="fa-emergency-text-ar">'+t.emergency.ar+'</div>';
    detail.appendChild(emg);
  } else {
    var body=document.createElement('div');
    body.className='fa-body';

    // Steps column
    var stepsCol=document.createElement('div');
    stepsCol.className='fa-steps-col';
    stepsCol.innerHTML='<div class="fa-steps-title">Steps — الخطوات</div>';
    t.steps.forEach(function(s,i){
      var step=document.createElement('div');
      step.className='fa-step';
      step.innerHTML='<div class="fa-step-num" style="background:'+col+'">'+(i+1)+'</div>'+
        '<div class="fa-step-text">'+
          '<div class="fa-step-en">'+s.en+'</div>'+
          '<div class="fa-step-ar">'+s.ar+'</div>'+
        '</div>';
      stepsCol.appendChild(step);
    });
    makeStepsCheckable(stepsCol, col);
    body.appendChild(stepsCol);

    // Right column
    var rightCol=document.createElement('div');
    rightCol.className='fa-right-col';

    // Signs (choking only)
    if(t.signs){
      var signs=document.createElement('div');
      signs.className='fa-dodont';
      signs.innerHTML='<div class="fa-do-title" style="color:'+col+'">⚠️ Warning Signs — علامات التحذير</div>';
      t.signs.forEach(function(s){
        signs.innerHTML+='<div class="fa-do-item">⚠️ <span>'+s.en+' &nbsp;/&nbsp; <span style="font-family:var(--font-ar)">'+s.ar+'</span></span></div>';
      });
      rightCol.appendChild(signs);
    }

    // Do / Don't
    var dodont=document.createElement('div');
    dodont.className='fa-dodont';
    if(t.doList && t.doList.length){
      dodont.innerHTML='<div class="fa-do-title do">✅ DO — افعل</div>';
      t.doList.forEach(function(d){
        dodont.innerHTML+='<div class="fa-do-item">✅ <span>'+d.en+' &nbsp;/&nbsp; <span style="font-family:var(--font-ar)">'+d.ar+'</span></span></div>';
      });
    }
    if(t.dontList && t.dontList.length){
      dodont.innerHTML+='<div class="fa-do-title dont" style="margin-top:10px">❌ DON\'T — لا تفعل</div>';
      t.dontList.forEach(function(d){
        dodont.innerHTML+='<div class="fa-do-item">❌ <span>'+d.en+' &nbsp;/&nbsp; <span style="font-family:var(--font-ar)">'+d.ar+'</span></span></div>';
      });
    }
    rightCol.appendChild(dodont);

    // Emergency
    var emg=document.createElement('div');
    emg.className='fa-emergency';
    emg.innerHTML='<div class="fa-emergency-num">🚨 999</div>'+
      '<div class="fa-emergency-text">'+t.emergency.en+'</div>'+
      '<div class="fa-emergency-text-ar">'+t.emergency.ar+'</div>';
    rightCol.appendChild(emg);

    body.appendChild(rightCol);
    detail.appendChild(body);
  }

  // Start idle countdown
  faStartIdle();
}

function faStartIdle(){
  faStopIdle();
  faIdleRemain=faIdleSeconds;
  document.getElementById('fa-idle-wrap').style.display='flex';
  document.getElementById('fa-idle-bar').style.width='100%';
  faIdleInterval=setInterval(function(){
    faIdleRemain--;
    var pct=Math.max(0,(faIdleRemain/faIdleSeconds)*100);
    document.getElementById('fa-idle-bar').style.width=pct+'%';
    document.getElementById('fa-idle-label').textContent='Returning in '+faIdleRemain+'s';
    if(faIdleRemain<=0){ faStopIdle(); faShowMenu(); }
  },1000);
}

function faStopIdle(){
  if(faIdleInterval){ clearInterval(faIdleInterval); faIdleInterval=null; }
}

// Reset idle timer on any touch in FA screen
document.addEventListener('pointerdown',function(){
  if(CUR_SCREEN==='fa' && faIdleInterval){ faIdleRemain=faIdleSeconds; }
});

// ═══════════════════════════════════════
// FOOD GROUPS FLOW  (drag-to-connect)
// ═══════════════════════════════════════

// Each group has 3-4 individual food items with different emoji
var FG_GROUPS = [
  {id:'fruits',     en:'Fruits',      ar:'الفواكه',        color:'#E53935', dark:'#8B0000',
   items:[{e:'🍎',n:'Apple',nAr:'تفاح'},{e:'🍇',n:'Grapes',nAr:'عنب'},{e:'🍊',n:'Orange',nAr:'برتقال'},{e:'🍓',n:'Strawberry',nAr:'فراولة'}]},
  {id:'vegetables', en:'Vegetables',  ar:'الخضروات',       color:'#43A047', dark:'#1B5E20',
   items:[{e:'🥦',n:'Broccoli',nAr:'بروكلي'},{e:'🥕',n:'Carrot',nAr:'جزر'},{e:'🍅',n:'Tomato',nAr:'طماطم'},{e:'🥒',n:'Cucumber',nAr:'خيار'}]},
  {id:'grains',     en:'Grains',      ar:'الحبوب',         color:'#FFB300', dark:'#6D3A00',
   items:[{e:'🍞',n:'Bread',nAr:'خبز'},{e:'🌾',n:'Wheat',nAr:'قمح'},{e:'🍚',n:'Rice',nAr:'أرز'},{e:'🍝',n:'Pasta',nAr:'معكرونة'}]},
  {id:'protein',    en:'Protein',     ar:'البروتين',       color:'#AB47BC', dark:'#4A148C',
   items:[{e:'🥩',n:'Meat',nAr:'لحم'},{e:'🥚',n:'Egg',nAr:'بيض'},{e:'🍗',n:'Chicken',nAr:'دجاج'},{e:'🥜',n:'Nuts',nAr:'مكسرات'}]},
  {id:'dairy',      en:'Dairy',       ar:'منتجات الألبان', color:'#29B6F6', dark:'#01579B',
   items:[{e:'🥛',n:'Milk',nAr:'حليب'},{e:'🧀',n:'Cheese',nAr:'جبن'},{e:'🥣',n:'Yogurt',nAr:'زبادي'}]}
];

// ── FLOW PUZZLE DATA ──
// 3 hand-crafted solvable puzzles on an 8×8 grid
// WIN CONDITION: all groups connected AND every cell filled (real Flow Free rule)
//
// Each group has 3 food items: [startItem, waypointItem, endItem]
// Each item: [row, col, itemIndex]  — itemIndex into FG_GROUPS[g].items[]
// Path must visit ALL 3 items; complete = start→waypoint→end all connected
// Completing a group triggers exit animation through the bottom EXIT strip
// All 3 puzzles hand-verified: routes exist without any path crossing another group's food item
// Puzzle 1 solution paths (for reference):
//   Fruits:  (0,0)→col0↓→(1,0)→(2,0)→(2,1)→(2,2)→(3,2)→(3,1)   items at NW quadrant
//   Veg:     (0,7)→(0,6)→(0,5)→(1,5)→(2,5)→(3,5)→(3,6)          items at NE quadrant
//   Grains:  (4,5)→(5,5)→(6,5)→(6,6)→(7,6)→(7,7)                items at SE quadrant
//   Protein: (4,2)→(5,2)→(6,2)→(6,1)→(7,1)→(7,0)                items at SW quadrant
//   Dairy:   (2,4)→(3,4)→(4,4)→(5,4)→(6,4)                       center column
var FG_PUZZLES = [
  { // Puzzle 1 — quadrant sectors, each group stays in its corner
    fruits:     [[0,0,0], [2,2,1], [3,1,2]],   // 🍎Apple → 🍇Grapes → 🍊Orange  (NW)
    vegetables: [[0,7,0], [1,5,1], [3,6,2]],   // 🥦Broccoli → 🥕Carrot → 🍅Tomato (NE)
    grains:     [[4,5,0], [6,6,1], [7,7,2]],   // 🍞Bread → 🌾Wheat → 🍚Rice      (SE)
    protein:    [[4,2,0], [6,1,1], [7,0,2]],   // 🥩Meat → 🥚Egg → 🍗Chicken     (SW)
    dairy:      [[2,4,0], [4,4,1], [6,4,2]]    // 🥛Milk → 🧀Cheese → 🥣Yogurt (center)
  },
  { // Puzzle 2 — different quadrant assignment
    fruits:     [[0,7,0], [2,6,1], [1,5,2]],   // 🍎 → 🍇 → 🍊  (NE)
    vegetables: [[0,0,0], [1,2,1], [2,1,2]],   // 🥦 → 🥕 → 🍅  (NW)
    grains:     [[7,7,0], [6,5,1], [5,6,2]],   // 🍞 → 🌾 → 🍚  (SE)
    protein:    [[7,0,0], [6,2,1], [5,1,2]],   // 🥩 → 🥚 → 🍗  (SW)
    dairy:      [[3,3,0], [4,4,1], [3,5,2]]    // 🥛 → 🧀 → 🥣  (center)
  },
  { // Puzzle 3 — verified routes (fruits left col, veg top-right, grains/protein SE/SW, dairy center)
    // Fruits:  (0,0)→col0↓→(3,0)→(4,0)→(4,1)→(4,2)→(5,2)→(6,2)
    // Veg:     (0,6)→(0,7)→col7↓→(3,7)
    // Grains:  (5,7)→(6,7)→(7,7)→(7,6)→(7,5)
    // Protein: (5,0)→(6,0)→(7,0)→(7,1)→(7,2)
    // Dairy:   (2,3)→(2,4)→(3,4)→(4,4)→(5,4)→(5,5)→(6,5)
    fruits:     [[0,0,0], [3,0,1], [6,2,2]],   // 🍎 → 🍇 → 🍊  (left side)
    vegetables: [[0,6,0], [0,7,1], [3,7,2]],   // 🥦 → 🥕 → 🍅  (top-right L)
    grains:     [[5,7,0], [7,7,1], [7,5,2]],   // 🍞 → 🌾 → 🍚  (SE corner)
    protein:    [[5,0,0], [7,0,1], [7,2,2]],   // 🥩 → 🥚 → 🍗  (SW corner)
    dairy:      [[2,3,0], [4,4,1], [6,5,2]]    // 🥛 → 🧀 → 🥣  (center diagonal)
  }
];

var FG_PUZ_IDX  = 0;
var FG_PATHS    = {};   // groupId → [{r,c}, …]
var FG_DRAWING  = null; // groupId currently being drawn
var FG_GRID     = [];   // 8×8: null | groupId
var FG_COMPLETED= {};   // groupId → true

var FG_ROWS = 8;   // grid size
var FG_CELL = 44;  // cell size (SVG units): (376-2*12)/8 = 44
var FG_PAD  = 12;  // board padding

function fgCellCtr(r,c){ return [FG_PAD+c*FG_CELL+FG_CELL/2, FG_PAD+r*FG_CELL+FG_CELL/2]; }

function fgInitGrid(){
  FG_GRID=[];
  for(var i=0;i<FG_ROWS;i++) FG_GRID.push(new Array(FG_ROWS).fill(null));
}

function fgMarkGrid(){
  fgInitGrid();
  FG_GROUPS.forEach(function(g){
    (FG_PATHS[g.id]||[]).forEach(function(cell){ FG_GRID[cell.r][cell.c]=g.id; });
  });
}

// Returns groupId if cell has any food item (endpoint or waypoint)
function fgFoodAt(r,c){
  var puz=FG_PUZZLES[FG_PUZ_IDX];
  for(var gid in puz){
    var items=puz[gid];
    for(var i=0;i<items.length;i++) if(items[i][0]===r&&items[i][1]===c) return gid;
  }
  return null;
}

// Returns groupId only if cell is an ENDPOINT (first or last item) of a group
function fgIsEndpoint(r,c){
  var puz=FG_PUZZLES[FG_PUZ_IDX];
  for(var gid in puz){
    var items=puz[gid];
    var f=items[0], l=items[items.length-1];
    if((f[0]===r&&f[1]===c)||(l[0]===r&&l[1]===c)) return gid;
  }
  return null;
}

// Returns true if drawn path for gid visits all food item positions
function fgAllVisited(gid){
  var items=FG_PUZZLES[FG_PUZ_IDX][gid];
  var path=FG_PATHS[gid]||[];
  return items.every(function(it){
    return path.some(function(cell){return cell.r===it[0]&&cell.c===it[1];});
  });
}

// Legacy alias kept for fgRender compat
function fgAnchorAt(r,c){ return fgIsEndpoint(r,c)||fgFoodAt(r,c); }

function fgSvgCell(evt){
  var svg=document.getElementById('fg-svg');
  var rect=svg.getBoundingClientRect();
  var src=evt.touches?evt.touches[0]:evt;
  var sx=(src.clientX-rect.left)*(376/rect.width);
  var sy=(src.clientY-rect.top)*(376/rect.height);
  var c=Math.floor((sx-FG_PAD)/FG_CELL);
  var r=Math.floor((sy-FG_PAD)/FG_CELL);
  if(r<0||r>FG_ROWS-1||c<0||c>FG_ROWS-1) return null;
  return {r:r,c:c};
}

function fgPointerDown(evt){
  evt.preventDefault();
  var cell=fgSvgCell(evt);
  if(!cell) return;
  var epGid=fgIsEndpoint(cell.r,cell.c);
  var cellGid=FG_GRID[cell.r][cell.c];
  var gid=epGid||cellGid;
  if(!gid) return;
  // Determine start: endpoints only; if on path cell find nearest endpoint
  var items=FG_PUZZLES[FG_PUZ_IDX][gid];
  var f=items[0], l=items[items.length-1];
  var sr,sc;
  if(epGid){ sr=cell.r; sc=cell.c; }
  else {
    var d0=Math.abs(cell.r-f[0])+Math.abs(cell.c-f[1]);
    var d1=Math.abs(cell.r-l[0])+Math.abs(cell.c-l[1]);
    sr=d0<=d1?f[0]:l[0]; sc=d0<=d1?f[1]:l[1];
  }
  FG_PATHS[gid]=[{r:sr,c:sc}];
  delete FG_COMPLETED[gid];
  FG_DRAWING=gid;
  fgMarkGrid(); fgRender();
}

function fgPointerMove(evt){
  evt.preventDefault();
  if(!FG_DRAWING) return;
  var cell=fgSvgCell(evt);
  if(!cell) return;
  var path=FG_PATHS[FG_DRAWING];
  var last=path[path.length-1];
  if(last.r===cell.r&&last.c===cell.c) return;
  if(Math.abs(cell.r-last.r)+Math.abs(cell.c-last.c)!==1) return;
  // Backtrack if revisiting own path
  for(var i=0;i<path.length-1;i++){
    if(path[i].r===cell.r&&path[i].c===cell.c){
      FG_PATHS[FG_DRAWING]=path.slice(0,i+1);
      fgMarkGrid(); fgRender(); return;
    }
  }
  // Block entry into food items of OTHER groups
  var foodOwner=fgFoodAt(cell.r,cell.c);
  if(foodOwner&&foodOwner!==FG_DRAWING) return;
  // Overwrite another group's path (non-food cells only)
  var occ=FG_GRID[cell.r][cell.c];
  if(occ&&occ!==FG_DRAWING){ FG_PATHS[occ]=[]; delete FG_COMPLETED[occ]; fgMarkGrid(); }
  // Extend path
  path.push({r:cell.r,c:cell.c});
  fgMarkGrid();
  // Check completion: on the other endpoint AND all food items visited
  var items=FG_PUZZLES[FG_PUZ_IDX][FG_DRAWING];
  var start=path[0];
  var f=items[0], l=items[items.length-1];
  var startIsFirst=(f[0]===start.r&&f[1]===start.c);
  var otherEnd=startIsFirst?l:f;
  if(cell.r===otherEnd[0]&&cell.c===otherEnd[1]&&fgAllVisited(FG_DRAWING)){
    var doneGid=FG_DRAWING;
    FG_COMPLETED[doneGid]=true; FG_DRAWING=null;
    fgRender(); fgExitAnimation(doneGid); fgCheckWin(); return;
  }
  fgRender();
}

function fgPointerUp(){ FG_DRAWING=null; fgRender(); }

function fgExitAnimation(gid){
  var g=FG_GROUPS.find(function(x){return x.id===gid;});
  var items=FG_PUZZLES[FG_PUZ_IDX][gid];
  var emojiList=items.map(function(it){return g.items[it[2]].e;});
  var card=document.querySelector('.fg-maze-card');
  if(!card) return;
  card.style.position='relative';
  // Animate each emoji as a particle flying down from the EXIT strip into bucket
  emojiList.forEach(function(emoji,i){
    var el=document.createElement('div');
    el.textContent=emoji;
    var xOff=(i-1)*32; // spread left/center/right
    el.style.cssText='position:absolute;left:50%;bottom:20px;'+
      'transform:translateX(calc(-50% + '+xOff+'px));'+
      'font-size:1.6rem;z-index:300;pointer-events:none;'+
      'filter:drop-shadow(0 0 8px '+g.color+') drop-shadow(0 0 4px '+g.color+');'+
      'transition:transform .55s cubic-bezier(.4,0,.6,1) '+(i*0.1)+'s,opacity .4s ease '+(i*0.1+0.2)+'s;';
    card.appendChild(el);
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        el.style.transform='translateX(calc(-50% + '+xOff+'px)) translateY(70px) scale(.7)';
        el.style.opacity='0';
      });
    });
    var delay=(i*0.1+0.55)*1000;
    setTimeout(function(d){ return function(){
      d.remove();
      // Fill the corresponding bucket slot
      var bkEl=document.getElementById('fg-bket-'+gid);
      if(bkEl){
        var sp=document.createElement('span');
        sp.textContent=emoji;
        sp.style.cssText='display:inline-block;animation:fgBktPop .35s cubic-bezier(.34,1.56,.64,1) both;';
        bkEl.appendChild(sp);
      }
    };}(el), delay);
  });
  // After last emoji lands, mark bucket as filled
  setTimeout(function(){
    var bkt=document.getElementById('fg-bkt-'+gid);
    if(bkt) bkt.classList.add('fg-bkt-filled');
  }, (emojiList.length*0.1+0.7)*1000);
}

function fgCheckWin(){
  var allDone=FG_GROUPS.every(function(g){return FG_COMPLETED[g.id];});
  if(!allDone) return;
  var isAr=LANG==='ar';
  var svg=document.getElementById('fg-svg');
  var t=0;
  var iv=setInterval(function(){
    svg.style.opacity=(t%2)?'1':'0.35'; t++;
    if(t>5){ clearInterval(iv); svg.style.opacity='1';
      FG_PUZ_IDX=(FG_PUZ_IDX+1)%FG_PUZZLES.length;
      fgReset();
      showWin(isAr?'رائع! جميع المجموعات الغذائية خرجت! 🎉':'Amazing! All food groups connected & exited! 🎉',
              isAr?'أنت خبير التغذية الصحية!':'You\'re a nutrition expert!');
    }
  },180);
}

function fgReset(){ FG_PATHS={}; FG_DRAWING=null; FG_COMPLETED={}; fgInitGrid(); fgInitBuckets(); fgRender(); }
function fgNextPuzzle(){ FG_PUZ_IDX=(FG_PUZ_IDX+1)%FG_PUZZLES.length; fgReset(); }

function fgRender(){
  var isAr=LANG==='ar';
  var puz=FG_PUZZLES[FG_PUZ_IDX];
  var s='';

  // ── DEFS ──
  s+='<defs>';
  s+='<filter id="fg-glow" x="-50%" y="-50%" width="200%" height="200%">';
  s+='<feGaussianBlur stdDeviation="6" result="b"/>';
  s+='<feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
  s+='<filter id="fg-drop" x="-15%" y="-15%" width="130%" height="130%">';
  s+='<feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="rgba(0,0,0,.65)"/></filter>';
  s+='</defs>';

  // ── BOARD ── deep purple grid
  var boardW=FG_ROWS*FG_CELL;
  var ge=FG_PAD+boardW;
  s+='<rect x="0" y="0" width="376" height="376" fill="#12003a" rx="12"/>';
  s+='<rect x="'+FG_PAD+'" y="'+FG_PAD+'" width="'+boardW+'" height="'+boardW+'" fill="#0d0028" rx="6"/>';
  s+='<radialGradient id="fg-vign" cx="50%" cy="50%" r="70%"><stop offset="0%" stop-color="rgba(120,40,200,.0)"/><stop offset="100%" stop-color="rgba(0,0,0,.45)"/></radialGradient>';
  s+='<rect x="'+FG_PAD+'" y="'+FG_PAD+'" width="'+boardW+'" height="'+boardW+'" fill="url(#fg-vign)" rx="6"/>';

  // Cell squares — purple tinted
  for(var cr=0;cr<FG_ROWS;cr++){
    for(var cc=0;cc<FG_ROWS;cc++){
      var cd=fgCellCtr(cr,cc);
      s+='<rect x="'+(cd[0]-19)+'" y="'+(cd[1]-19)+'" width="38" height="38" rx="5" fill="rgba(160,80,255,.07)" stroke="rgba(180,100,255,.13)" stroke-width="1"/>';
    }
  }

  // Grid lines — purple
  for(var i=0;i<=FG_ROWS;i++){
    var gx=FG_PAD+i*FG_CELL, gy=FG_PAD+i*FG_CELL;
    s+='<line x1="'+gx+'" y1="'+FG_PAD+'" x2="'+gx+'" y2="'+ge+'" stroke="rgba(180,100,255,.12)" stroke-width="1"/>';
    s+='<line x1="'+FG_PAD+'" y1="'+gy+'" x2="'+ge+'" y2="'+gy+'" stroke="rgba(180,100,255,.12)" stroke-width="1"/>';
  }

  // Center dots for empty undrawn cells
  for(var r=0;r<FG_ROWS;r++){
    for(var c=0;c<FG_ROWS;c++){
      if(!FG_GRID[r][c]&&!fgFoodAt(r,c)){
        var d=fgCellCtr(r,c);
        s+='<circle cx="'+d[0]+'" cy="'+d[1]+'" r="2.5" fill="rgba(200,140,255,.2)"/>';
      }
    }
  }

  // ── DRAWN PATHS ──
  FG_GROUPS.forEach(function(g){
    var path=FG_PATHS[g.id];
    if(!path||path.length<2) return;
    var done=FG_COMPLETED[g.id];
    var pts=path.map(function(cell){var d=fgCellCtr(cell.r,cell.c);return d[0]+','+d[1];}).join(' ');
    if(done){
      s+='<polyline points="'+pts+'" fill="none" stroke="'+g.color+'" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" opacity=".3" filter="url(#fg-glow)"/>';
    }
    s+='<polyline points="'+pts+'" fill="none" stroke="'+g.color+'" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" opacity="'+(done?'1':'.88')+'"/>';
    s+='<polyline points="'+pts+'" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>';
    s+='<polyline points="'+pts+'" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  });

  // ── FOOD ITEM NODES ── each item has its own emoji
  FG_GROUPS.forEach(function(g){
    var gItems=puz[g.id];
    if(!gItems) return;
    var done=FG_COMPLETED[g.id];
    var path=FG_PATHS[g.id]||[];
    gItems.forEach(function(item,idx){
      var r=item[0],c=item[1],iIdx=item[2];
      var food=g.items[iIdx];
      var d=fgCellCtr(r,c);
      var cx=d[0],cy=d[1];
      var isEndpt=(idx===0||idx===gItems.length-1);
      var visited=path.some(function(cell){return cell.r===r&&cell.c===c;});
      // Glow when done
      if(done){ s+='<circle cx="'+cx+'" cy="'+cy+'" r="21" fill="'+g.color+'" opacity=".45" filter="url(#fg-glow)"/>'; }
      // Outer ring — endpoints solid fill, waypoints visible with semi-filled colored background
      var outerFill=isEndpt?g.dark:(visited?g.dark:g.dark);
      var outerOpacity=isEndpt?1:(visited?1:0.75);
      var sw=isEndpt||(visited||done)?3:2.5;
      s+='<circle cx="'+cx+'" cy="'+cy+'" r="19" fill="'+outerFill+'" stroke="'+g.color+'" stroke-width="'+sw+'" opacity="'+outerOpacity+'"/>';
      // Inner fill — bright when endpoint or visited, colored but dimmer for unvisited waypoints
      var innerFill=isEndpt||visited||done?g.color:g.color;
      var innerOpacity=isEndpt||visited||done?1:0.45;
      var innerR=isEndpt?15:12;
      s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+innerR+'" fill="'+innerFill+'" opacity="'+innerOpacity+'"/>';
      // Dashed ring overlay for unvisited waypoints to indicate "needs visiting"
      if(!isEndpt&&!visited&&!done){
        s+='<circle cx="'+cx+'" cy="'+cy+'" r="19" fill="none" stroke="'+g.color+'" stroke-width="2" stroke-dasharray="5 3" opacity="0.9"/>';
      }
      // Gloss
      if(isEndpt||visited||done) s+='<ellipse cx="'+(cx-4)+'" cy="'+(cy-5)+'" rx="6" ry="4" fill="rgba(255,255,255,.38)"/>';
      // Food emoji — each item has its own unique emoji
      var fSize=isEndpt?16:13;
      s+='<text x="'+cx+'" y="'+(cy+7)+'" text-anchor="middle" dominant-baseline="middle" font-size="'+fSize+'" style="pointer-events:none;user-select:none;">'+food.e+'</text>';
      // Waypoint hint (unvisited, not done)
      if(!isEndpt&&!visited&&!done){
        s+='<circle cx="'+cx+'" cy="'+cy+'" r="5" fill="none" stroke="'+g.color+'" stroke-width="1.5" opacity=".6" cx="'+(cx+13)+'" cy="'+(cy-13)+'"/>';
        s+='<text x="'+(cx+14)+'" y="'+(cy-10)+'" font-size="9" fill="'+g.color+'" font-weight="900" opacity=".8" style="pointer-events:none;">⬡</text>';
      }
      // Checkmark on done
      if(done){ s+='<text x="'+(cx+11)+'" y="'+(cy-10)+'" font-size="11" fill="#fff" font-weight="900" filter="url(#fg-drop)" style="pointer-events:none;">✓</text>'; }
    });
  });

  // Drawing tip cursor
  if(FG_DRAWING){
    var path=FG_PATHS[FG_DRAWING];
    if(path&&path.length>0){
      var tip=path[path.length-1];
      var d=fgCellCtr(tip.r,tip.c);
      var gc=FG_GROUPS.find(function(g){return g.id===FG_DRAWING;});
      s+='<circle cx="'+d[0]+'" cy="'+d[1]+'" r="11" fill="rgba(255,255,255,.9)" stroke="'+gc.color+'" stroke-width="3" filter="url(#fg-glow)"/>';
    }
  }

  // EXIT strip — simple label (buckets below handle the visual)
  var doneCount=FG_GROUPS.filter(function(g){return FG_COMPLETED[g.id];}).length;
  s+='<rect x="0" y="358" width="376" height="18" rx="0" fill="rgba(0,0,0,.5)"/>';
  s+='<text x="188" y="370" text-anchor="middle" font-size="10" fill="#CE93D8" font-weight="800" letter-spacing="1" style="pointer-events:none;">'+(doneCount?doneCount+'/5 ✓  ':'')+( isAr?'▼ المخرج ▼':'▼ EXIT ▼')+'</text>';

  document.getElementById('fg-svg').innerHTML=s;

  // Status dots — show item emojis for each group
  var st='';
  FG_GROUPS.forEach(function(g){
    var done=FG_COMPLETED[g.id];
    var prog=FG_PATHS[g.id]&&FG_PATHS[g.id].length>1;
    var gItems=puz[g.id];
    var emos=gItems?gItems.map(function(it){return g.items[it[2]].e;}).join(''):'';
    st+='<div class="fg-sdot'+(done?' fg-sdone':(prog?' fg-sprog':''))+'" style="background:'+g.color+';box-shadow:0 0 0 3px '+g.dark+';font-size:.7rem;">'+emos+(done?' ✓':'')+'</div>';
  });
  var sel=document.getElementById('fg-status-row');
  if(sel) sel.innerHTML=st;

  // Reference panel — show only the 3 items used in this puzzle
  var rf='';
  FG_GROUPS.forEach(function(g){
    var gItems=puz[g.id]||[];
    var usedItems=gItems.map(function(it){return g.items[it[2]];});
    var itemEmojis=usedItems.map(function(it){return it.e;}).join(' ');
    var itemNames=usedItems.map(function(it){return isAr?it.nAr:it.n;}).join(', ');
    var done=FG_COMPLETED[g.id];
    var firstEmoji=usedItems[0]?usedItems[0].e:'';
    var allEmojis=usedItems.map(function(it){return it.e;}).join(' ');
    rf+='<div class="fg-ref-card" style="border-left-color:'+g.color+';opacity:'+(done?'.5':'1')+'">'+
        '<div class="fg-ref-icon">'+allEmojis+'</div>'+
        '<div>'+
          '<div class="fg-ref-en" style="color:'+g.color+'">'+(done?'✓ ':'')+g.en+'</div>'+
          '<div class="fg-ref-ar">'+g.ar+'</div>'+
          '<div class="fg-ref-foods">'+itemNames+'</div>'+
        '</div></div>';
  });
  var rfl=document.getElementById('fg-ref-list');
  if(rfl) rfl.innerHTML=rf;

  // Update top-strip progress dots
  var dotsEl=document.getElementById('fg-prog-dots');
  var labelEl=document.getElementById('fg-prog-label');
  if(dotsEl){
    var dHtml='';
    FG_GROUPS.forEach(function(g){
      var done=FG_COMPLETED[g.id];
      dHtml+='<div class="fg-how-prog-dot'+(done?' done':'')+'" style="'+(done?'--dot-color:'+g.color+';':'')+'"></div>';
    });
    dotsEl.innerHTML=dHtml;
  }
  if(labelEl){
    var doneCount2=FG_GROUPS.filter(function(g){return FG_COMPLETED[g.id];}).length;
    labelEl.textContent=doneCount2+' / 5';
  }

  // Heading
  var hd=document.getElementById('fg-maze-heading');
  if(hd) hd.textContent=isAr?'صِل المجموعات الغذائية!':'Connect the Food Groups!';
}

function fgInitBuckets(){
  var buckEl=document.getElementById('fg-buckets');
  if(!buckEl) return;
  var bHtml='';
  FG_GROUPS.forEach(function(g){
    bHtml+='<div class="fg-bucket" id="fg-bkt-'+g.id+'" style="--bc:'+g.color+'">'+
      '<div class="fg-bucket-bowl"><div class="fg-bucket-emojis" id="fg-bket-'+g.id+'"></div></div>'+
      '<div class="fg-bucket-label" style="color:'+g.color+'">'+g.en+'</div>'+
    '</div>';
  });
  buckEl.innerHTML=bHtml;
}

function initFG(){
  FG_PATHS={}; FG_DRAWING=null; FG_COMPLETED={}; fgInitGrid();
  fgInitBuckets();
  fgRender();
  var svg=document.getElementById('fg-svg');
  svg.onmousedown=fgPointerDown;
  svg.onmousemove=fgPointerMove;
  svg.onmouseup=fgPointerUp;
  svg.onmouseleave=fgPointerUp;
  svg.ontouchstart=fgPointerDown;
  svg.ontouchmove=fgPointerMove;
  svg.ontouchend=fgPointerUp;
}

// (old hex puzzle removed — replaced by Flow game above)
function fgGeneratePuzzle_UNUSED(){
  var groups = ['fruits','vegetables','grains','protein','dairy'];
  FG_ANSWER = groups[Math.floor(Math.random()*5)];
  var otherGroups = groups.filter(function(g){return g!==FG_ANSWER;});
  var rowSizes = [4,3,4,3,4]; // even rows: 4 cells, odd rows: 3 cells

  // Generate a valid connected path of column indices
  // even→odd: adj if nc===c || nc===c-1
  // odd→even: adj if nc===c || nc===c+1
  function adjChoices(row, c, nextSize){
    var choices=[];
    if(row%2===0){ // even→odd
      if(c-1>=0) choices.push(c-1);
      if(c<nextSize) choices.push(c);
    } else { // odd→even
      if(c<nextSize) choices.push(c);
      if(c+1<nextSize) choices.push(c+1);
    }
    return choices;
  }

  function shuffle(arr){
    for(var i=arr.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=arr[i];arr[i]=arr[j];arr[j]=t;}
    return arr;
  }

  // Build connected path via backtracking
  var path=[];
  function buildPath(row, prev){
    if(row===5){return true;}
    var size=rowSizes[row];
    var candidates;
    if(row===0){
      candidates=shuffle([0,1,2,3].slice(0,size));
    } else {
      candidates=shuffle(adjChoices(row-1, prev, size));
    }
    for(var i=0;i<candidates.length;i++){
      path[row]=candidates[i];
      if(buildPath(row+1,candidates[i])) return true;
    }
    return false;
  }
  buildPath(0,0);
  FG_CORRECT=path.slice();

  // Pick answer emojis (one per row, no repeats)
  var ansPool=shuffle(FG_POOLS[FG_ANSWER].slice()).slice(0,5);

  // Build grid data
  FG_DATA=[];
  for(var row=0;row<5;row++){
    var size=rowSizes[row];
    var ansPos=FG_CORRECT[row];
    var cells=new Array(size);
    cells[ansPos]={e:ansPool[row],g:FG_ANSWER};

    // Fill other positions with random foods from other groups
    var usedGrps=[];
    for(var col=0;col<size;col++){
      if(col===ansPos) continue;
      var gPool=otherGroups.filter(function(g){return usedGrps.indexOf(g)===-1;});
      if(!gPool.length) gPool=otherGroups.slice();
      var g=gPool[Math.floor(Math.random()*gPool.length)];
      usedGrps.push(g);
      var ePool=FG_POOLS[g];
      cells[col]={e:ePool[Math.floor(Math.random()*ePool.length)],g:g};
    }
    FG_DATA.push(cells);
  }
}

function fgRoundedHex_UNUSED(cx, cy, r, cr) {
  var ang=[-90,-30,30,90,150,210];
  var v=ang.map(function(a){var rad=a*Math.PI/180;return [cx+r*Math.cos(rad),cy+r*Math.sin(rad)];});
  var n=6, d='';
  for(var i=0;i<n;i++){
    var V=v[i], VP=v[(i-1+n)%n], VN=v[(i+1)%n], t=cr/r;
    var p1=[V[0]+t*(VP[0]-V[0]),V[1]+t*(VP[1]-V[1])];
    var p2=[V[0]+t*(VN[0]-V[0]),V[1]+t*(VN[1]-V[1])];
    d+=(i===0?'M':'L')+p1[0].toFixed(1)+','+p1[1].toFixed(1);
    d+='Q'+V[0].toFixed(1)+','+V[1].toFixed(1)+' '+p2[0].toFixed(1)+','+p2[1].toFixed(1);
  }
  return d+'Z';
}

function fgIsAdj_UNUSED(row, c, nc){
  return row%2===0 ? (nc===c||nc===c-1) : (nc===c||nc===c+1);
}

function fgRender_UNUSED(){
  var isAr = LANG==='ar';
  var R=46, CR=10; // hex corner radius

  // Vibrant food-group colors
  var GC = {
    fruits:     {a:'#FF6B6B',b:'#C0392B',s:'#8B0000'},
    vegetables: {a:'#55D464',b:'#1A7A2E',s:'#0A4015'},
    grains:     {a:'#FFD93D',b:'#E08000',s:'#804000'},
    protein:    {a:'#C86DD7',b:'#7B1FA2',s:'#4A0060'},
    dairy:      {a:'#5BC8F5',b:'#1565C0',s:'#003580'}
  };

  var s='';

  // ── DEFS ──
  s+='<defs>';
  // Per-group gradients (top-to-bottom)
  ['fruits','vegetables','grains','protein','dairy'].forEach(function(g){
    var c=GC[g];
    s+='<linearGradient id="fgg-'+g+'" x1="0" y1="0" x2="0" y2="1">';
    s+='<stop offset="0%" stop-color="'+c.a+'"/><stop offset="100%" stop-color="'+c.b+'"/></linearGradient>';
  });
  // Shine gradient (gloss overlay on each hex)
  s+='<linearGradient id="fgg-shine" x1="0" y1="0" x2="0" y2="1">';
  s+='<stop offset="0%" stop-color="#fff" stop-opacity=".45"/>';
  s+='<stop offset="50%" stop-color="#fff" stop-opacity=".08"/>';
  s+='<stop offset="100%" stop-color="#fff" stop-opacity="0"/></linearGradient>';
  // Selected hex gradient (gold)
  s+='<radialGradient id="fgg-sel" cx="50%" cy="35%" r="65%">';
  s+='<stop offset="0%" stop-color="#FFF176"/><stop offset="100%" stop-color="#F9A825"/></radialGradient>';
  // Drop shadow
  s+='<filter id="fg-shadow" x="-15%" y="-15%" width="130%" height="130%">';
  s+='<feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="rgba(0,0,0,.45)"/></filter>';
  // Glow for selected hex
  s+='<filter id="fg-glow" x="-35%" y="-35%" width="170%" height="170%">';
  s+='<feGaussianBlur stdDeviation="7" result="b"/>';
  s+='<feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
  // Path glow filter
  s+='<filter id="fg-pglow" x="-20%" y="-20%" width="140%" height="140%">';
  s+='<feGaussianBlur stdDeviation="3" result="b"/>';
  s+='<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
  s+='</defs>';

  // ── BOARD BACKGROUND ── dark felt look
  s+='<rect x="0" y="0" width="380" height="460" fill="#0F0700" rx="14"/>';
  // Subtle grid pattern dots
  s+='<rect x="0" y="0" width="380" height="460" fill="url(#fgg-dots)" rx="14" opacity=".3"/>';

  // Empty hex slots (very faint outlines showing possible positions)
  var rows0=[{xs:FG_X_EVEN,y:FG_Y[0]},{xs:FG_X_ODD,y:FG_Y[1]},{xs:FG_X_EVEN,y:FG_Y[2]},{xs:FG_X_ODD,y:FG_Y[3]},{xs:FG_X_EVEN,y:FG_Y[4]}];
  rows0.forEach(function(row){
    row.xs.forEach(function(cx){
      s+='<path d="'+fgRoundedHex(cx,row.y,R,CR)+'" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.1)" stroke-width="1.5"/>';
    });
  });

  // ── START BANNER ──
  // X_EVEN: 70..310, edges: 70-40=30, 310+40=350. Banner: x=24 w=332.
  s+='<rect x="24" y="5" width="332" height="40" rx="20" fill="#0D3B1A"/>';
  s+='<rect x="26" y="7" width="328" height="36" rx="18" fill="#1B5E20"/>';
  s+='<rect x="26" y="7" width="328" height="18" rx="18" fill="rgba(255,255,255,.08)"/>';
  s+='<text x="190" y="29" text-anchor="middle" font-size="14" font-weight="900" fill="#A5D6A7" font-family="Nunito,sans-serif" letter-spacing="2" style="pointer-events:none;">'+(isAr?'▲  البداية  START  ▲':'▲  START  البداية  ▲')+'</text>';

  // ── CONNECTION LINES (under hexes) ──
  // Determine path color from first selected group
  var pathClr='rgba(255,200,0,.7)', pathClrB='rgba(255,120,0,.9)';
  for(var ri=0;ri<5;ri++){
    if(FG_SELECTED[ri]!==null){var pg=FG_DATA[ri][FG_SELECTED[ri]].g;pathClr=GC[pg].a+'BB';pathClrB=GC[pg].b+'DD';break;}
  }
  for(var row=0;row<4;row++){
    var c1=FG_SELECTED[row], c2=FG_SELECTED[row+1];
    if(c1!==null && c2!==null){
      var x1=(row%2===0?FG_X_EVEN:FG_X_ODD)[c1], y1=FG_Y[row];
      var x2=((row+1)%2===0?FG_X_EVEN:FG_X_ODD)[c2], y2=FG_Y[row+1];
      var adj=fgIsAdj(row,c1,c2);
      var lc=adj?pathClr:'rgba(211,47,47,.8)';
      s+='<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+lc+'" stroke-width="12" stroke-linecap="round" filter="url(#fg-pglow)"/>';
      s+='<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="rgba(255,255,255,.35)" stroke-width="4" stroke-linecap="round"/>';
    }
  }

  // ── HEX CELLS ──
  for(var row=0;row<5;row++){
    var cells=FG_DATA[row];
    var xs=(row%2===0?FG_X_EVEN:FG_X_ODD);
    for(var col=0;col<cells.length;col++){
      var cx=xs[col], cy=FG_Y[row];
      var cell=cells[col];
      var isSel=(FG_SELECTED[row]===col);
      var hpath=fgRoundedHex(cx,cy,R,CR);
      var shinePath=fgRoundedHex(cx,cy,R-1,CR);

      if(isSel){
        // Glow ring behind
        s+='<path d="'+fgRoundedHex(cx,cy,R+5,CR+2)+'" fill="'+GC[cell.g].a+'" opacity=".4" filter="url(#fg-glow)"/>';
        // Gold selected fill
        s+='<path d="'+hpath+'" fill="url(#fgg-sel)" stroke="#FFF176" stroke-width="3" onclick="fgClick('+row+','+col+')" style="cursor:pointer;"/>';
        // White selection ring
        s+='<path d="'+fgRoundedHex(cx,cy,R-3,CR-1)+'" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="2" style="pointer-events:none;"/>';
      } else {
        // Normal hex — vibrant color gradient + shadow
        s+='<path d="'+hpath+'" fill="url(#fgg-'+cell.g+')" stroke="'+GC[cell.g].s+'" stroke-width="2" filter="url(#fg-shadow)" onclick="fgClick('+row+','+col+')" style="cursor:pointer;"/>';
        // Gloss shine overlay
        s+='<path d="'+shinePath+'" fill="url(#fgg-shine)" style="pointer-events:none;"/>';
        // Subtle dark inner stroke for depth
        s+='<path d="'+fgRoundedHex(cx,cy,R-2,CR)+'" fill="none" stroke="rgba(0,0,0,.15)" stroke-width="1.5" style="pointer-events:none;"/>';
      }
      // Emoji
      s+='<text x="'+cx+'" y="'+(cy+11)+'" text-anchor="middle" dominant-baseline="middle" font-size="28" style="pointer-events:none;user-select:none;">'+cell.e+'</text>';
    }
  }

  // ── START ARROWS (drawn over hexes) ── 4 columns pointing down into row 0
  // Row0 top vertex: Y[0]-R = 96-46 = 50. Arrow from banner bottom (y=45) to y=58.
  FG_X_EVEN.forEach(function(cx){
    s+='<line x1="'+cx+'" y1="46" x2="'+cx+'" y2="58" stroke="#2E7D32" stroke-width="5" stroke-linecap="round"/>';
    s+='<polygon points="'+(cx-11)+',55 '+(cx+11)+',55 '+cx+',68" fill="#43A047"/>';
    s+='<line x1="'+cx+'" y1="46" x2="'+cx+'" y2="56" stroke="#81C784" stroke-width="2" stroke-linecap="round"/>';
  });

  // ── EXIT BANNER + single downward arrow ──
  // Row4 bottom: Y[4]+R = 360+46 = 406. Banner: y=410.
  s+='<rect x="24" y="410" width="332" height="42" rx="21" fill="#4A0000"/>';
  s+='<rect x="26" y="412" width="328" height="38" rx="19" fill="#B71C1C"/>';
  s+='<rect x="26" y="412" width="328" height="19" rx="19" fill="rgba(255,255,255,.08)"/>';
  s+='<text x="190" y="435" text-anchor="middle" font-size="14" font-weight="900" fill="#FFCDD2" font-family="Nunito,sans-serif" letter-spacing="2" style="pointer-events:none;">'+(isAr?'▼  المخرج  EXIT  ▼':'▼  EXIT  المخرج  ▼')+'</text>';
  // Single center downward arrow from row4 bottom → exit banner (pointing DOWN)
  s+='<line x1="190" y1="407" x2="190" y2="415" stroke="#C62828" stroke-width="5" stroke-linecap="round"/>';
  s+='<polygon points="177,409 203,409 190,422" fill="#E53935"/>';
  s+='<line x1="190" y1="407" x2="190" y2="413" stroke="#EF9A9A" stroke-width="2" stroke-linecap="round"/>';

  document.getElementById('fg-svg').innerHTML=s;

  /* ── Group buttons ── */
  var gb='';
  FG_GROUPS.forEach(function(g){
    var sel=(FG_GROUP_SEL===g.id);
    gb+='<button class="fg-grp-btn'+(sel?' fg-grp-sel':'')+
        '" data-g="'+g.id+'" onclick="fgPickGroup(\''+g.id+'\')">'+g.e+' '+(isAr?g.ar:g.en)+'</button>';
  });
  document.getElementById('fg-group-btns').innerHTML=gb;

  /* ── Reference panel ── */
  var rf='';
  FG_GROUPS.forEach(function(g){
    rf+='<div class="fg-ref-card"><div class="fg-ref-icon">'+g.e+'</div>'+
        '<div><div class="fg-ref-en">'+g.en+'</div>'+
        '<div class="fg-ref-ar">'+g.ar+'</div>'+
        '<div class="fg-ref-foods">'+(isAr?g.foodsAr:g.foods)+'</div></div></div>';
  });
  document.getElementById('fg-ref-list').innerHTML=rf;

  /* ── Progress ── */
  var filled=FG_SELECTED.filter(function(x){return x!==null;}).length;
  document.getElementById('fg-prog-bar').style.width=(filled/5*100)+'%';
  document.getElementById('fg-prog-label').textContent=filled+' / 5 '+(isAr?'صفوف':'rows');
  document.getElementById('fg-prog-emoji').textContent=filled===5?'🌟':'🍀';

  /* ── Heading ── */
  document.getElementById('fg-maze-heading').textContent=
    isAr?'ابحث عن مسار المجموعة الغذائية!':'Find the Food Group Path!';
}


// ═══════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════
var adminZone = ZONE_NUM;
var adminGame = ZONE_GAME;
var adminLang = LANG;

var GAME_NAMES = {all:'All Games',ws:'Word Search',cw:'Crossword',pl:'Healthy Plate',cb:'Colour by Number',fa:'First Aid',ph:'Public Health',re:'Resilience',fg:'Food Groups Path',dash:'SEHHI Dash'};

// ── ADMIN HOLD-TO-OPEN ──
var adminHoldTimer=null;
var ADMIN_HOLD_MS=2000;

function adminHoldStart(){
  var circle=document.getElementById('admin-ring-circle');
  if(circle){
    circle.style.transition='none';
    circle.style.strokeDashoffset='138.2';
    void circle.getBoundingClientRect();
    circle.style.transition='stroke-dashoffset '+ADMIN_HOLD_MS+'ms linear';
    circle.style.strokeDashoffset='0';
  }
  adminHoldTimer=setTimeout(function(){
    adminModalOpen();
  }, ADMIN_HOLD_MS);
}

function adminHoldCancel(){
  clearTimeout(adminHoldTimer);
  adminHoldTimer=null;
  var circle=document.getElementById('admin-ring-circle');
  if(circle){
    circle.style.transition='stroke-dashoffset 0.2s ease';
    circle.style.strokeDashoffset='138.2';
  }
}

function adminModalOpen(){
  adminHoldCancel();
  adminRefresh();
  document.getElementById('admin-modal').classList.add('show');
}

function adminModalClose(){
  document.getElementById('admin-modal').classList.remove('show');
  var saved=document.getElementById('admin-saved');
  if(saved) saved.classList.remove('show');
}

function adminRefresh(){
  adminZone = localStorage.getItem('sehhi_zone_num')||'1';
  adminGame = localStorage.getItem('sehhi_zone_game')||'all';
  adminLang = localStorage.getItem('sehhi_lang')||'en';
  adminPickZone(+adminZone, true);
  adminPickGame(adminGame, true);
  adminPickLang(adminLang, true);
  adminUpdateCurrent();
}

function adminPickZone(n, silent){
  adminZone = String(n);
  document.querySelectorAll('.admin-zone-btn').forEach(function(b){
    b.classList.toggle('active', b.dataset.zone===adminZone);
  });
  if(!silent) adminUpdateCurrent();
}

function adminPickGame(g, silent){
  adminGame = g;
  document.querySelectorAll('.admin-game-btn').forEach(function(b){
    b.classList.toggle('active', b.dataset.game===g);
  });
  if(!silent) adminUpdateCurrent();
}

function adminPickLang(l, silent){
  adminLang = l;
  document.querySelectorAll('.admin-lang-pick').forEach(function(b){
    b.classList.toggle('active', b.dataset.lang===l);
  });
  if(!silent) adminUpdateCurrent();
}

function adminUpdateCurrent(){
  document.getElementById('admin-cur-zone').textContent = 'Zone '+adminZone;
  document.getElementById('admin-cur-game').textContent = GAME_NAMES[adminGame]||adminGame;
  document.getElementById('admin-cur-lang').textContent = adminLang==='ar'?'عربي':'English';
}

function adminSave(){
  localStorage.setItem('sehhi_zone_num', adminZone);
  localStorage.setItem('sehhi_zone_game', adminGame);
  localStorage.setItem('sehhi_lang', adminLang);
  ZONE_NUM = adminZone;
  ZONE_GAME = adminGame;
  setLang(adminLang);
  var saved = document.getElementById('admin-saved');
  saved.classList.add('show');
  setTimeout(function(){
    saved.classList.remove('show');
    adminModalClose();
    showScreen('home');
  }, 1800);
}

// ═══════════════════════════════════════
// SEHHI DASH — ENDLESS RUNNER
// ═══════════════════════════════════════

// ── TREE PNG ──
var TREE_IMG = new Image();
var TREE_IMG_READY = false;
TREE_IMG.onload = function(){ TREE_IMG_READY = true; };
TREE_IMG.src = 'Tree/Tree left side.png';

// ── SOUND ENGINE (WebAudio synth — no files, works offline) ──
var DASH_AC = null;
function dashAudioCtx(){
  if(!DASH_AC){
    try { DASH_AC = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){ return null; }
  }
  if(DASH_AC && DASH_AC.state === 'suspended') DASH_AC.resume();
  return DASH_AC;
}
// Play one synth note: freq(Hz), dur(s), type(waveform), vol, delay(s), slideTo(optional pitch slide)
function dashTone(freq, dur, type, vol, delay, slideTo){
  var ac = dashAudioCtx(); if(!ac) return;
  var t0 = ac.currentTime + (delay||0);
  var osc = ac.createOscillator(), g = ac.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if(slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g); g.connect(ac.destination);
  osc.start(t0); osc.stop(t0 + dur + 0.05);
}
function dashSFX(name, arg){
  switch(name){
    case 'pickup': // pitch rises with combo for satisfying streaks
      var step = Math.min(arg || 0, 10);
      dashTone(520 + step * 45, 0.10, 'triangle', 0.16);
      dashTone(780 + step * 55, 0.08, 'triangle', 0.10, 0.055);
      break;
    case 'heart':
      dashTone(440, 0.12, 'sine', 0.16); dashTone(660, 0.14, 'sine', 0.16, 0.09); dashTone(880, 0.18, 'sine', 0.14, 0.18);
      break;
    case 'star': // fast rising arpeggio
      [660, 830, 990, 1320].forEach(function(f, i){ dashTone(f, 0.10, 'square', 0.09, i * 0.055); });
      break;
    case 'hit':
      dashTone(200, 0.20, 'sawtooth', 0.22, 0, 70);
      dashTone(90, 0.25, 'square', 0.14, 0.02);
      break;
    case 'shield': // hit blocked — metallic ping
      dashTone(950, 0.14, 'triangle', 0.18, 0, 600);
      break;
    case 'ability':
      [392, 523, 659, 784].forEach(function(f, i){ dashTone(f, 0.13, 'triangle', 0.14, i * 0.07); });
      break;
    case 'beep':
      dashTone(660, 0.12, 'square', 0.12);
      break;
    case 'go':
      dashTone(880, 0.28, 'square', 0.15); dashTone(1108, 0.28, 'square', 0.10, 0.02);
      break;
    case 'fanfare': // balanced meal
      [523, 659, 784, 1046, 784, 1046].forEach(function(f, i){ dashTone(f, 0.14, 'triangle', 0.14, i * 0.09); });
      break;
    case 'dodge':
      dashTone(500, 0.07, 'sine', 0.07, 0, 750);
      break;
    case 'gameover':
      [523, 440, 349, 262].forEach(function(f, i){ dashTone(f, 0.24, 'triangle', 0.14, i * 0.17); });
      break;
  }
}

// ── CHARACTER SPRITES ──
var CHAR_RUN_SPRITES = [];
var CHAR_SPRITES_LOADED = false;
(function(){
  var total = 20, loaded = 0;
  for(var i = 1; i <= 20; i++){
    (function(idx){
      var img = new Image();
      img.onload = function(){ if(++loaded === total) CHAR_SPRITES_LOADED = true; };
      img.onerror = function(){ loaded++; };
      img.src = 'Charechtor/' + (idx < 10 ? '000' : '00') + idx + '.png';
      CHAR_RUN_SPRITES[idx - 1] = img;
    })(i);
  }
})();

var CHAR2_RUN_SPRITES = [];
var CHAR2_SPRITES_LOADED = false;
(function(){
  var total = 22, loaded = 0;
  for(var i = 1; i <= 22; i++){
    (function(idx){
      var img = new Image();
      img.onload = function(){ if(++loaded === total) CHAR2_SPRITES_LOADED = true; };
      img.onerror = function(){ loaded++; };
      img.src = 'Charector02/' + (idx < 10 ? '000' : '00') + idx + '.png';
      CHAR2_RUN_SPRITES[idx - 1] = img;
    })(i);
  }
})();

// ── DATA ──
var DASH_CHARS_DEF = {
  sehhi:{ id:'sehhi', bodyColor:'#E91E8C', darkColor:'#880E4F', headColor:'#FDBCB4', abilityName:'🧲 Magnet', abilityNameAr:'🧲 المغناطيس', ability:'magnet' },
  zayed:{ id:'zayed', bodyColor:'#1565C0', darkColor:'#0D47A1', headColor:'#FDBCB4', abilityName:'🛡️ Shield', abilityNameAr:'🛡️ الدرع', ability:'shield' }
};
var DASH_FOODS_DEF = [
  // Fruits — base 5pts, apple is special (10pts)
  {id:'apple',  emoji:'🍎',group:'fruits',color:'#E53935',points:10,special:true},
  {id:'orange', emoji:'🍊',group:'fruits',color:'#FB8C00',points:5},
  {id:'banana', emoji:'🍌',group:'fruits',color:'#FDD835',points:5},
  {id:'grapes', emoji:'🍇',group:'fruits',color:'#6A1B9A',points:5},
  {id:'watermelon',emoji:'🍉',group:'fruits',color:'#E53935',points:5},
  {id:'dates',  emoji:'🫙',group:'fruits',color:'#8D4E00',points:5},
  // Vegetables — base 5pts
  {id:'carrot',   emoji:'🥕',group:'veg',color:'#FF6F00',points:5},
  {id:'broccoli', emoji:'🥦',group:'veg',color:'#2E7D32',points:5},
  {id:'tomato',   emoji:'🍅',group:'veg',color:'#C62828',points:5},
  {id:'cucumber', emoji:'🥒',group:'veg',color:'#388E3C',points:5},
  {id:'corn',     emoji:'🌽',group:'veg',color:'#F9A825',points:5},
  // Grains — base 5pts
  {id:'bread',  emoji:'🍞',group:'grains',color:'#8D6E63',points:5},
  {id:'rice',   emoji:'🍚',group:'grains',color:'#9E9E9E',points:5},
  {id:'pita',   emoji:'🫓',group:'grains',color:'#A1887F',points:5},
  {id:'oats',   emoji:'🌾',group:'grains',color:'#C8A96E',points:5},
  // Protein — base 5pts; fish gives +heart (handled separately)
  {id:'chicken',  emoji:'🍗',group:'protein',color:'#FF8F00',points:5},
  {id:'egg',      emoji:'🥚',group:'protein',color:'#F9A825',points:5},
  {id:'fish',     emoji:'🐟',group:'protein',color:'#0288D1',points:0, heart:true},
  {id:'beans',    emoji:'🫘',group:'protein',color:'#6D4C41',points:5},
  {id:'nuts',     emoji:'🥜',group:'protein',color:'#A1620E',points:5},
  {id:'olive_oil',emoji:'🫒',group:'protein',color:'#6B8E23',points:10,special:true},
  // Dairy — base 5pts; milk is special (10pts)
  {id:'milk',   emoji:'🥛',group:'dairy',color:'#B3E5FC',points:10,special:true},
  {id:'cheese', emoji:'🧀',group:'dairy',color:'#FDD835',points:5},
  {id:'yogurt', emoji:'🥣',group:'dairy',color:'#E1F5FE',points:5},
];
var DASH_JUNK_DEF = [
  {id:'chips',emoji:'🍟',color:'#BF360C'},
  {id:'soda',emoji:'🥤',color:'#880E4F'},
  {id:'candy',emoji:'🍬',color:'#6A1B9A'},
  {id:'burger',emoji:'🍔',color:'#4E342E'},
  {id:'donut',emoji:'🍩',color:'#AD1457'}
];
var DASH_TIPS = {
  fruits:{en:'Fruits give you natural energy & vitamins! 🍎',ar:'الفواكه تمدّك بالطاقة والفيتامينات الطبيعية! 🍎'},
  veg:{en:'Vegetables keep you strong & healthy! 🥦',ar:'الخضروات تجعلك قوياً وبصحة جيدة! 🥦'},
  grains:{en:'Whole grains fuel your brain & body! 🍞',ar:'الحبوب الكاملة تغذّي عقلك وجسمك! 🍞'},
  protein:{en:'Fish makes you strong! 🐟',ar:'السمك يجعلك قوياً! 🐟'},
  dairy:{en:'Dairy makes your bones strong! 🥛',ar:'منتجات الألبان تقوّي عظامك! 🥛'}
};
var DASH_BEST = parseInt(localStorage.getItem('sehhi_dash_best')||'0');

// ── STATE ──
var DASH_CHAR = null;
var DASH_RAF = null;
var DASH_PHASE = 'idle'; // idle | countdown | playing | gameover
var DS = {};

function dashResetState(){
  var canvas = document.getElementById('dash-canvas');
  var cw = canvas.width, ch = canvas.height;
  var horizonY = ch * 0.36;
  var playerY  = ch * 0.82;
  var laneSpread = cw * 0.26;
  DS = {
    cw: cw, ch: ch,
    horizonY: horizonY,
    playerY: playerY,
    cx: cw / 2,
    laneSpread: laneSpread,
    fov: 320,
    lane: 1,
    playerWorldX: 0, targetPlayerWorldX: 0, moveDir: 0,
    charFrame: 0, charFrameT: 0, charBob: 0, charBobDir: 1,
    lives: 3,
    score: 0,
    speed: 4.5,
    speedPenalty: 1,       // FIX: multiplier decays to 1, not an override
    distance: 0,
    bgOff: [0, 0, 0, 0],
    items: [],
    spawnTimer: 50,
    abilCharge: 0,
    abilActive: false,
    abilTimer: 0,
    shieldActive: false,   // FIX: was missing, caused undefined -= dt
    shieldTimer: 0,
    invincible: 0,
    shakeFrames: 0,        // screen shake counter
    tip: null, tipTimer: 0,
    countdown: 3, countdownTimer: 60,
    scoreFloats: [],
    particles: [],
    milestoneFlash: 0,
    collected_pts: 0,
    combo: 0,              // consecutive food pickups
    bgMosqueOff: 0,
    roadCurve: 0,
    roadCurvePhase: 0,     // FIX: removed dead roadCurveTarget
    lastMilestoneDist: 0,  // for difficulty announcements
    allGroupsBonus: false  // balanced meal bonus given once per run
  };
  _dashCollectedGroups = {};
}

// Project world coords → screen coords
// worldZ=large → near horizon (top), worldZ=0 → at player (bottom)
function dashProject(worldX, worldZ){
  var scale = DS.fov / (DS.fov + Math.max(0.1, worldZ));
  return {
    x: DS.cx + worldX * scale * DS.laneSpread,
    y: DS.horizonY + (DS.playerY - DS.horizonY) * scale,
    scale: scale
  };
}

function dashLaneWorldX(lane){ return [-1, 0, 1][lane]; }

function dashGenTrees(){
  var trees = [];
  for(var i = 0; i < 8; i++){
    trees.push({ x: i * 180 + Math.random() * 80, relY: 0.15 + Math.random() * 0.1, h: 60 + Math.random() * 40 });
  }
  return trees;
}

// ── CHARACTER SELECT ──
function initDashSelect(){
  showScreen('dash-select');
  dashRefreshSelectLang();
  dashDrawCharPreview('sehhi');
  dashDrawCharPreview('zayed');
}

function dashRefreshSelectLang(){
  var isAr = LANG === 'ar';
  var titleEl = document.getElementById('dash-sel-title');
  var subEl = document.getElementById('dash-sel-sub');
  if(titleEl) titleEl.textContent = isAr ? 'اختر شخصيتك!' : 'Choose Your Runner!';
  if(subEl) subEl.textContent = isAr ? 'اختر شخصية لبدء مغامرتك الصحية' : 'Select a character to start your healthy adventure';
  var s1 = document.getElementById('dash-btn-sehhi');
  var s2 = document.getElementById('dash-btn-zayed');
  if(s1) s1.textContent = isAr ? '▶ اختيار' : '▶ Select';
  if(s2) s2.textContent = isAr ? '▶ اختيار' : '▶ Select';
}

// Front-facing avatar images for the select screen
var DASH_AVATARS = {
  sehhi: { img: new Image(), ready: false, bbox: null },
  zayed: { img: new Image(), ready: false, bbox: null }
};
DASH_AVATARS.sehhi.img.onload = function(){ DASH_AVATARS.sehhi.ready = true; };
DASH_AVATARS.zayed.img.onload = function(){ DASH_AVATARS.zayed.ready = true; };
DASH_AVATARS.sehhi.img.src = 'Charechtor/SehhiAvater.png';
DASH_AVATARS.zayed.img.src = 'Charector02/SehhiAvater2.png';

// Find the non-transparent bounding box of an image (cached).
// Falls back to the full image when pixel access is blocked (file:// kiosk mode).
function dashAvatarBBox(av){
  if(av.bbox) return av.bbox;
  var w = av.img.naturalWidth, h = av.img.naturalHeight;
  try {
    var oc = document.createElement('canvas');
    oc.width = w; oc.height = h;
    var octx = oc.getContext('2d');
    octx.drawImage(av.img, 0, 0);
    var data = octx.getImageData(0, 0, w, h).data;
    var minX = w, minY = h, maxX = 0, maxY = 0;
    for(var y = 0; y < h; y += 3){
      for(var x = 0; x < w; x += 3){
        if(data[(y * w + x) * 4 + 3] > 10){
          if(x < minX) minX = x; if(x > maxX) maxX = x;
          if(y < minY) minY = y; if(y > maxY) maxY = y;
        }
      }
    }
    if(maxX <= minX || maxY <= minY){ av.bbox = {x:0, y:0, w:w, h:h}; }
    else { av.bbox = {x:minX, y:minY, w:maxX-minX, h:maxY-minY}; }
  } catch(e){
    // SecurityError under file:// — use known character regions instead
    av.bbox = (av === DASH_AVATARS.zayed)
      ? {x:Math.round(w*0.17), y:Math.round(h*0.02), w:Math.round(w*0.66), h:Math.round(h*0.96)}
      : {x:Math.round(w*0.34), y:Math.round(h*0.08), w:Math.round(w*0.32), h:Math.round(h*0.88)};
  }
  return av.bbox;
}

function dashDrawCharPreview(id){
  var canvas = document.getElementById('dash-prev-' + id);
  if(!canvas) return;
  var ctx = canvas.getContext('2d');
  canvas.width = 160; canvas.height = 200;
  ctx.clearRect(0, 0, 160, 200);
  var av = DASH_AVATARS[id];
  if(av && av.ready){
    // Auto-crop transparent margins, then contain-fit into the card
    var b = dashAvatarBBox(av);
    var pad = 8;
    var fit = Math.min((160 - pad*2) / b.w, (200 - pad*2) / b.h);
    var dw = Math.round(b.w * fit), dh = Math.round(b.h * fit);
    ctx.drawImage(av.img, b.x, b.y, b.w, b.h, (160 - dw)/2, (200 - dh)/2, dw, dh);
  } else {
    // Avatar still loading — retry a few times, then give up quietly
    av._tries = (av._tries || 0) + 1;
    if(av._tries < 15) setTimeout(function(){ dashDrawCharPreview(id); }, 400);
  }
}

function dashSelectChar(id){
  DASH_CHAR = id;
  // Highlight selected card briefly before transition
  document.querySelectorAll('.dash-char-card').forEach(function(c){ c.classList.remove('selected'); });
  var card = document.querySelector('.dash-char-card[onclick*="' + id + '"]');
  if(card) card.classList.add('selected');
  setTimeout(function(){
    showScreen('dash');
    dashStartGame();
  }, 280);
}

// ── GAME INIT ──
function dashStartGame(){
  var canvas = document.getElementById('dash-canvas');
  var body = document.querySelector('.dash-body');
  var ctrlW = 90;
  canvas.width = body.clientWidth - ctrlW;
  canvas.height = body.clientHeight;
  dashResetState();
  dashUpdateHUD();
  var abilEl = document.getElementById('dash-abil-name');
  var charDef = DASH_CHARS_DEF[DASH_CHAR];
  if(abilEl) abilEl.textContent = charDef.abilityName.split(' ')[0];
  // Keyboard
  document.removeEventListener('keydown', dashKeyHandler);
  document.removeEventListener('keyup', dashKeyUpHandler);
  document.addEventListener('keydown', dashKeyHandler);
  document.addEventListener('keyup', dashKeyUpHandler);
  // Touch swipe
  dashInitSwipe(canvas);
  // Start countdown
  DASH_PHASE = 'countdown';
  dashStartCountdown();
}

function dashInitSwipe(canvas){
  // Touch-and-hold steering: hold left half = move left, right half = move right, release = stop
  canvas.removeEventListener('touchstart', canvas._dashTouchStart||null);
  canvas.removeEventListener('touchend', canvas._dashTouchEnd||null);
  canvas.removeEventListener('touchcancel', canvas._dashTouchEnd||null);
  canvas._dashTouchStart = function(e){
    var x = e.touches[0].clientX;
    var mid = canvas.getBoundingClientRect().width / 2;
    dashCtrlStart(x < mid ? -1 : 1);
  };
  canvas._dashTouchEnd = function(){ dashCtrlStop(); };
  canvas.addEventListener('touchstart', canvas._dashTouchStart, {passive:true});
  canvas.addEventListener('touchend', canvas._dashTouchEnd, {passive:true});
  canvas.addEventListener('touchcancel', canvas._dashTouchEnd, {passive:true});
}

function dashKeyHandler(e){
  if(DASH_PHASE !== 'playing') return;
  if(e.key === 'ArrowLeft' || e.key === 'a') dashCtrlStart(-1);
  if(e.key === 'ArrowRight' || e.key === 'd') dashCtrlStart(1);
  if(e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'a' || e.key === 'd') e.preventDefault();
}
function dashKeyUpHandler(e){
  if(e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'ArrowRight' || e.key === 'd') dashCtrlStop();
}

function dashCtrlStart(dir){
  if(DASH_PHASE !== 'playing') return;
  DS.moveDir = dir;
}
function dashCtrlStop(){
  DS.moveDir = 0;
}
function dashCtrl(dir){
  if(DASH_PHASE !== 'playing') return;
  if(dir === 'up') dashCtrlStart(-1);
  if(dir === 'dn') dashCtrlStart(1);
}

// ── COUNTDOWN ──
function dashStartCountdown(){
  DS.countdown = 3; DS.countdownTimer = 65;
  if(DASH_RAF) cancelAnimationFrame(DASH_RAF);
  DASH_RAF = requestAnimationFrame(dashCountdownLoop);
}

function dashCountdownLoop(ts){
  dashRender();
  var cdEl = document.getElementById('dash-countdown');
  if(DS.countdownTimer > 0){
    DS.countdownTimer--;
    if(DS.countdownTimer % 65 === 0 && DS.countdown > 0){
      DS.countdown--;
      if(cdEl){
        cdEl.classList.add('show');
        cdEl.textContent = DS.countdown === 0 ? (LANG==='ar'?'انطلق!':'GO!') : DS.countdown;
      }
      dashSFX(DS.countdown === 0 ? 'go' : 'beep');
      DS.countdownTimer = DS.countdown > 0 ? 65 : 40;
    }
  } else {
    if(cdEl){ cdEl.classList.remove('show'); cdEl.textContent = ''; }
    DASH_PHASE = 'playing';
    DASH_RAF = requestAnimationFrame(dashGameLoop);
    return;
  }
  DASH_RAF = requestAnimationFrame(dashCountdownLoop);
}

// ── MAIN LOOP ──
var _dashLastTs = 0;
function dashGameLoop(ts){
  if(DASH_PHASE !== 'playing'){ return; }
  var dt = Math.min((ts - _dashLastTs) / 16.67, 3);
  _dashLastTs = ts;
  if(dt === 0 || dt > 2.5) dt = 1;
  dashUpdate(dt);
  dashRender();
  DASH_RAF = requestAnimationFrame(dashGameLoop);
}

// ── UPDATE ──
function dashUpdate(dt){
  var S = DS;
  // Speed ramp — FIX: apply speedPenalty multiplier so barrier hits actually slow you
  var baseSpeed = Math.min(10, 4.5 + S.distance / 6000);
  S.speedPenalty = Math.min(1, S.speedPenalty + 0.008 * dt); // recover over ~125 frames
  S.speed = baseSpeed * S.speedPenalty;
  S.distance += S.speed * dt;
  // Score from distance
  S.score = Math.floor(S.distance / 10) + S.collected_pts;
  // Continuous free movement
  if(S.moveDir !== 0){
    S.targetPlayerWorldX = Math.max(-1.0, Math.min(1.0, S.targetPlayerWorldX + S.moveDir * 0.075 * dt));
  }
  S.playerWorldX += (S.targetPlayerWorldX - S.playerWorldX) * 0.18 * dt * 3;
  // Update position thumb
  var thumb = document.getElementById('dash-pos-thumb');
  if(thumb){ var pct = (S.playerWorldX + 1.0) / 2.0; thumb.style.left = (pct * 64 - 7) + 'px'; }
  // Character animation
  S.charFrameT += dt;
  var charFrameMax = (DASH_CHAR === 'zayed') ? 22 : 20;
  if(S.charFrameT > 3){ S.charFrame = (S.charFrame + 1) % charFrameMax; S.charFrameT = 0; }
  // Bob
  S.charBob += S.charBobDir * 0.4 * dt;
  if(S.charBob > 2.5 || S.charBob < -1) S.charBobDir *= -1;
  // Background scroll
  S.bgOff[0] += S.speed * 0.04 * dt;
  S.bgOff[3] += S.speed * 1.00 * dt;
  S.bgMosqueOff += S.speed * 0.05 * dt;
  // Road curve — gentle sinusoidal bends
  S.roadCurvePhase += 0.0006 * dt;
  S.roadCurve = Math.sin(S.roadCurvePhase) * 0.55 + Math.sin(S.roadCurvePhase * 0.6) * 0.28;
  S.cx = S.cw / 2 + S.roadCurve * S.laneSpread * 0.55;
  // Screen shake
  if(S.shakeFrames > 0) S.shakeFrames -= dt;
  if(S.milestoneFlash > 0) S.milestoneFlash -= dt;
  // Difficulty milestones
  var milestones = [1000, 3000, 6000, 10000];
  for(var mi = 0; mi < milestones.length; mi++){
    if(S.distance >= milestones[mi] && S.lastMilestoneDist < milestones[mi]){
      S.lastMilestoneDist = milestones[mi];
      var msgs = ['Going faster! 🏃','Challenge mode! ⚡','Danger zone! 🔥','Desert master! 🏆'];
      S.scoreFloats.push({ x: S.cw/2, y: S.ch*0.38, text: msgs[mi], life: 90, big: true });
      S.milestoneFlash = 35;
    }
  }
  // Spawn items
  S.spawnTimer -= dt;
  if(S.spawnTimer <= 0){
    dashSpawn();
    S.spawnTimer = Math.max(40, 100 - S.distance / 500) + Math.random() * 25;
  }
  // Move items toward camera
  for(var i = S.items.length - 1; i >= 0; i--){
    var item = S.items[i];
    item.worldZ -= S.speed * dt;
    // Barriers can drift lanes slightly for extra challenge (clamped to road)
    if(item.type === 'barrier' && item.drift){
      item.worldX = Math.max(-1.0, Math.min(1.0, item.worldX + item.drift * dt * 0.006));
    }
    // Magnet pull
    if(S.abilActive && DASH_CHARS_DEF[DASH_CHAR] && DASH_CHARS_DEF[DASH_CHAR].ability === 'magnet' && item.type === 'food'){
      item.worldX += (S.playerWorldX - item.worldX) * 0.08 * dt;
      item.worldZ -= S.speed * 0.5 * dt;
    }
    // Item has passed the player — despawn immediately, no more collision
    if(item.worldZ < 0){
      if(item.type === 'barrier' && !item.hit){
        S.scoreFloats.push({ x: S.cx + S.playerWorldX * S.laneSpread, y: S.playerY - 90, text: 'DODGE! +5', life: 50 });
        S.collected_pts += 5;
        dashSFX('dodge');
      }
      S.items.splice(i, 1);
      continue;
    }
    // Collision zone: item right at the player (worldZ 0→12)
    // Pixel-accurate: compare on-screen positions so the hitbox always
    // matches what the player SEES, at any screen size
    if(!item.collected && item.worldZ < 12){
      var isHazard = (item.type === 'barrier' || item.type === 'junk');
      var iScale = S.fov / (S.fov + Math.max(0.1, item.worldZ));
      var itemPX  = S.cx + item.worldX * iScale * S.laneSpread;
      var charPX  = S.cx + S.playerWorldX * S.laneSpread;
      // visible character half-width (sprite body is ~32% of its 0.24*ch frame)
      var charHalfW = S.ch * 0.24 * 0.32 * 0.5;
      // visible item radius on screen
      var itemR = isHazard ? 34 * iScale : 54 * iScale;
      var reach = charHalfW + itemR * (isHazard ? 0.55 : 0.75);
      var laneMatch = Math.abs(itemPX - charPX) < reach;
      if(laneMatch){
        item.collected = true;
        if(item.type === 'food') dashCollectFood(item);
        else if(item.type === 'star') dashCollectStar(item);
        else if(item.type === 'barrier'){ item.hit = true; dashHitBarrier(item); }
        else dashHitJunk(item);
        S.items.splice(i, 1);
        continue;
      }
    }
  }
  // Ability timer
  if(S.abilActive){
    S.abilTimer -= dt;
    if(S.abilTimer <= 0){ S.abilActive = false; S.abilTimer = 0; S.abilCharge = 0; dashAbilFlash(false); }
  }
  // Shield timer (FIX: now properly initialised in state)
  if(S.shieldActive){
    S.shieldTimer -= dt;
    if(S.shieldTimer <= 0){ S.shieldActive = false; }
  }
  // Invincibility
  if(S.invincible > 0) S.invincible -= dt;
  // Tip timer
  if(S.tipTimer > 0){
    S.tipTimer -= dt;
    if(S.tipTimer <= 0){
      var tb = document.getElementById('dash-tip-banner');
      if(tb) tb.classList.remove('show');
      S.tip = null;
    }
  }
  // Score floats
  for(var f = S.scoreFloats.length - 1; f >= 0; f--){
    S.scoreFloats[f].life -= dt;
    if(S.scoreFloats[f].life <= 0) S.scoreFloats.splice(f, 1);
  }
  dashUpdateHUD();
}

function dashSpawn(){
  var lane = Math.floor(Math.random() * 3);

  // Rare star power-up (~4% chance)
  if(Math.random() < 0.04){ dashSpawnStar(); return; }
  // Food trail (~12% chance) — line of same item in one lane
  if(Math.random() < 0.12){ dashSpawnTrail(); return; }
  // Barrier rows — chance increases with distance
  var barrierChance = Math.min(0.30, 0.08 + DS.distance / 8000);
  if(Math.random() < barrierChance){ dashSpawnZigZag(); return; }

  var isJunk = Math.random() < 0.28;
  var pool = isJunk ? DASH_JUNK_DEF : DASH_FOODS_DEF;
  var def = pool[Math.floor(Math.random() * pool.length)];
  DS.items.push({
    worldX: dashLaneWorldX(lane),
    worldZ: 430 + Math.random() * 40,
    lane: lane,
    type: isJunk ? 'junk' : 'food',
    emoji: def.emoji,
    color: def.color,
    group: def.group || null,
    points: def.points || 5,
    special: def.special || false,
    heart: def.heart || false,
    id: def.id,
    collected: false
  });
}

function dashSpawnZigZag(){
  var gapLane = Math.floor(Math.random() * 3);
  var baseZ = 430 + Math.random() * 30;  // FIX: was 480-520, now visible from spawn
  // At high distance some barriers drift slowly across lanes
  var useDrift = DS.distance > 4000 && Math.random() < 0.35;
  var driftDir = Math.random() < 0.5 ? 1 : -1;
  for(var li = 0; li < 3; li++){
    if(li === gapLane) continue;
    DS.items.push({
      worldX: dashLaneWorldX(li),
      worldZ: baseZ,
      lane: li,
      type: 'barrier',
      collected: false,
      hit: false,
      drift: useDrift ? driftDir : 0
    });
  }
  // Second staggered row — gap always ADJACENT to first gap (1 lane shift max)
  // and far enough behind that the player can physically reach it
  if(Math.random() < 0.55){
    var shift = (gapLane === 0) ? 1 : (gapLane === 2) ? -1 : (Math.random() < 0.5 ? 1 : -1);
    var gapLane2 = gapLane + shift;
    // Stagger scales with current speed so dodge time stays fair (~20 frames)
    var stagger = Math.max(120, DS.speed * 22);
    for(var li2 = 0; li2 < 3; li2++){
      if(li2 === gapLane2) continue;
      DS.items.push({
        worldX: dashLaneWorldX(li2),
        worldZ: baseZ + stagger,
        lane: li2,
        type: 'barrier',
        collected: false,
        hit: false,
        drift: 0
      });
    }
  }
}

function dashSpawnStar(){
  var lane = Math.floor(Math.random() * 3);
  DS.items.push({
    worldX: dashLaneWorldX(lane),
    worldZ: 430 + Math.random() * 30,
    lane: lane, type: 'star',
    emoji: '⭐', color: '#FFD700', collected: false
  });
}

function dashSpawnTrail(){
  // A long line of food items in one lane — "subway trail" effect
  var lane = Math.floor(Math.random() * 3);
  var pool = DASH_FOODS_DEF.filter(function(f){ return !f.heart; }); // exclude fish from trails
  var def  = pool[Math.floor(Math.random() * pool.length)];
  var COUNT = 6 + Math.floor(Math.random() * 4); // 6–9 items
  var GAP   = 38; // world units between each item
  var baseZ = 420;
  for(var ti = 0; ti < COUNT; ti++){
    DS.items.push({
      worldX: dashLaneWorldX(lane),
      worldZ: baseZ + ti * GAP,
      lane: lane,
      type: 'food',
      emoji: def.emoji,
      color: def.color,
      group: def.group || null,
      points: def.points || 5,
      special: def.special || false,
      heart: false,
      id: def.id,
      collected: false
    });
  }
}

var _dashCollectedGroups = {};
function dashCollectFood(item){
  var fx = DS.cx + DS.playerWorldX * DS.laneSpread;
  var fy = DS.playerY - 80;

  // Fish: gives +1 heart, or bonus points when already at full health
  if(item.heart){
    if(DS.lives < 3){
      DS.lives++;
      DS.scoreFloats.push({ x: fx, y: fy, text: '❤️ Fish makes you strong!', life: 90, big: true });
    } else {
      DS.collected_pts += 10;
      DS.scoreFloats.push({ x: fx, y: fy, text: '🐟 +10', life: 60, big: false });
    }
    dashSFX('heart');
    dashUpdateHUD();
    dashSpawnParticles(fx, fy, '#F06292', 14);
    if(item.group && !_dashCollectedGroups[item.group]){
      _dashCollectedGroups[item.group] = true;
      dashShowTip(item.group, item.emoji);
    }
    DS.combo = (DS.combo||0) + 1;
    return;
  }

  var pts = item.points || 5;
  // Combo multiplier
  DS.combo = (DS.combo || 0) + 1;
  dashSFX('pickup', DS.combo);
  var mult = DS.combo >= 5 ? 2 : DS.combo >= 3 ? 1.5 : 1;
  pts = Math.floor(pts * mult);
  if(!DS.collected_pts) DS.collected_pts = 0;
  DS.collected_pts += pts;
  DS.score = Math.floor(DS.distance / 10) + DS.collected_pts;
  // Ability charge
  DS.abilCharge = Math.min(100, DS.abilCharge + 12);
  if(DS.abilCharge >= 100 && !DS.abilActive) dashActivateAbility();
  // Float text — special items flash bigger
  var floatText = '+' + pts + (mult > 1 ? ' x' + mult + '!' : '');
  var isBig = mult > 1 || item.special;
  DS.scoreFloats.push({ x: fx, y: fy, text: floatText, life: 55, big: isBig });
  dashSpawnParticles(fx, fy, item.color || '#FFD600', isBig ? 14 : 8);
  // Best
  if(DS.score > DASH_BEST){ DASH_BEST = DS.score; localStorage.setItem('sehhi_dash_best', DASH_BEST); }
  // Tip: show when first of a group collected
  if(item.group && !_dashCollectedGroups[item.group]){
    _dashCollectedGroups[item.group] = true;
    dashShowTip(item.group, item.emoji);
  }
  // Balanced meal bonus — all 5 groups collected
  var groups = ['fruits','veg','grains','protein','dairy'];
  if(!DS.allGroupsBonus){
    var allDone = true;
    for(var gi=0;gi<groups.length;gi++){ if(!_dashCollectedGroups[groups[gi]]){ allDone=false; break; } }
    if(allDone){
      DS.allGroupsBonus = true;
      DS.collected_pts += 50;
      DS.scoreFloats.push({ x: DS.cw/2, y: DS.ch*0.42, text: '🍽️ BALANCED MEAL! +50', life: 100, big: true });
      dashSFX('fanfare');
    }
  }
}

function dashHitBarrier(item){
  if(DS.invincible > 0) return;
  if(DS.abilActive && DASH_CHARS_DEF[DASH_CHAR] && DASH_CHARS_DEF[DASH_CHAR].ability === 'shield'){
    DS.abilActive = false; DS.abilCharge = 0; dashAbilFlash(false);
    dashSFX('shield');
    return;
  }
  dashSFX('hit');
  DS.lives--;
  DS.invincible = 90;
  DS.speedPenalty = 0.6;  // FIX: use penalty multiplier — decays naturally in update
  DS.combo = 0;           // reset combo on hit
  DS.shakeFrames = 8;     // trigger screen shake
  dashUpdateHUD();
  dashShowHitFlash();
  if(DS.lives <= 0){ DASH_PHASE = 'gameover'; setTimeout(dashShowGameOver, 600); }
}

function dashCollectStar(item){
  dashSFX('star');
  DS.invincible = 180; // 3 seconds of invincibility
  // Star is a reward — keep the combo and add bonus points
  DS.collected_pts += 15;
  var sx = DS.cx + DS.playerWorldX * DS.laneSpread;
  DS.scoreFloats.push({ x: sx, y: DS.playerY - 90, text: '⭐ STAR POWER! +15', life: 80, big: true });
  dashSpawnParticles(sx, DS.playerY - 60, '#FFD600', 24);
}

function dashHitJunk(item){
  if(DS.invincible > 0) return;
  if(DS.abilActive && DASH_CHARS_DEF[DASH_CHAR] && DASH_CHARS_DEF[DASH_CHAR].ability === 'shield'){
    DS.abilActive = false; DS.abilCharge = 0; dashAbilFlash(false);
    dashSFX('shield');
    return;
  }
  dashSFX('hit');
  DS.lives--;
  DS.invincible = 90;
  DS.combo = 0;
  DS.shakeFrames = 6;
  dashUpdateHUD();
  dashShowHitFlash();
  if(DS.lives <= 0){
    DASH_PHASE = 'gameover';
    setTimeout(dashShowGameOver, 600);
  }
}

function dashActivateAbility(){
  dashSFX('ability');
  DS.abilActive = true;
  var dur = DASH_CHARS_DEF[DASH_CHAR].ability === 'magnet' ? 300 : 360;
  DS.abilTimer = dur;
  dashAbilFlash(true);
}

function dashAbilFlash(on){
  var el = document.getElementById('dash-abil-flash');
  if(el) el.classList.toggle('show', on);
}

function dashShowTip(group, emoji){
  var tip = DASH_TIPS[group];
  if(!tip) return;
  var tb = document.getElementById('dash-tip-banner');
  var tt = document.getElementById('dash-tip-txt');
  var ti = document.getElementById('dash-tip-icon');
  if(!tb || !tt) return;
  var txt = LANG === 'ar' ? tip.ar : tip.en;
  tt.textContent = txt;
  if(ti) ti.textContent = emoji;
  tb.classList.add('show');
  DS.tip = group;
  DS.tipTimer = 180;
}

function dashShowHitFlash(){
  var el = document.createElement('div');
  el.className = 'dash-hit-flash';
  document.querySelector('.dash-body').appendChild(el);
  setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 500);
}

function dashUpdateHUD(){
  var S = DS;
  var scoreEl = document.getElementById('dash-score');
  var bestEl = document.getElementById('dash-best');
  var livesEl = document.getElementById('dash-lives');
  var fillEl = document.getElementById('dash-abil-fill');
  var distEl = document.getElementById('dash-dist');
  if(scoreEl) scoreEl.textContent = S.score || 0;
  if(bestEl) bestEl.textContent = DASH_BEST;
  if(distEl) distEl.textContent = Math.floor(S.distance||0) + 'm';
  if(livesEl){
    var h = '';
    for(var i=0;i<3;i++) h += (i < S.lives) ? '❤️' : '🖤';
    livesEl.textContent = h;
  }
  if(fillEl){
    if(S.abilActive){
      fillEl.style.width = ((S.abilTimer / (DASH_CHARS_DEF[DASH_CHAR]&&DASH_CHARS_DEF[DASH_CHAR].ability==='magnet'?300:360))*100)+'%';
    } else {
      fillEl.style.width = S.abilCharge + '%';
    }
  }
}

// ── RENDER ──
function dashRender(){
  var canvas = document.getElementById('dash-canvas');
  if(!canvas) return;
  var ctx = canvas.getContext('2d');
  var cw = canvas.width, ch = canvas.height;
  DS.cw = cw; DS.ch = ch;
  ctx.clearRect(0, 0, cw, ch);
  // Screen shake
  if(DS.shakeFrames > 0){
    var sx = (Math.random()-0.5)*7, sy = (Math.random()-0.5)*5;
    ctx.save(); ctx.translate(sx, sy);
  }
  dashRenderBg(ctx, cw, ch);
  dashDraw3DBuildings(ctx, cw, ch);   // distant buildings (drawn before road)
  dashRenderRoad(ctx, cw, ch);
  dashDrawRoadPalms(ctx, cw, ch);     // palms drawn AFTER road so they appear on verge
  dashDrawStreetLights(ctx, cw, ch);
  dashDrawOverheadWires(ctx, cw, ch);
  dashRenderItems(ctx, cw, ch);
  dashRenderChar(ctx, cw, ch);
  dashRenderParticles(ctx);
  dashRenderFloats(ctx);
  dashRenderComboBadge(ctx, cw, ch);
  dashRenderFoodGroups(ctx, cw, ch);
  dashDrawVignette(ctx, cw, ch);
  if(DS.shakeFrames > 0) ctx.restore();
}

// ── UAE LANDMARK BUILDING DRAW FUNCTIONS ──
// Each takes (ctx, bx, hy, ch) — bx = left edge X, hy = horizon Y, ch = canvas height

function dashBldBurjKhalifa(ctx, bx, hy, ch){
  // World's tallest — very narrow tapering spire
  var s = ch * 0.28;
  var col = '#502208'; ctx.fillStyle = col; ctx.globalAlpha = 0.82;
  // Y-shaped base (3 wings)
  ctx.beginPath(); ctx.moveTo(bx+60, hy); ctx.lineTo(bx+60, hy-s*0.32);
  ctx.lineTo(bx+30, hy-s*0.45); ctx.lineTo(bx+45, hy-s*0.45);
  ctx.lineTo(bx+45, hy-s*0.30); ctx.lineTo(bx+55, hy-s*0.36);
  ctx.lineTo(bx+65, hy-s*0.36); ctx.lineTo(bx+75, hy-s*0.30);
  ctx.lineTo(bx+75, hy-s*0.45); ctx.lineTo(bx+90, hy-s*0.45);
  ctx.lineTo(bx+60, hy-s*0.32);
  ctx.lineTo(bx+60, hy); ctx.closePath(); ctx.fill();
  // Main shaft tapered
  for(var i=0;i<8;i++){
    var y0=hy-s*(0.45+i*0.07), y1=hy-s*(0.45+(i+1)*0.07);
    var ww=Math.max(2, 22-i*2.5);
    ctx.fillRect(bx+60-ww, y0-s*0.07, ww*2, s*0.07+2);
  }
  // Spire
  ctx.beginPath();
  ctx.moveTo(bx+60-4, hy-s*1.01); ctx.lineTo(bx+60+4, hy-s*1.01);
  ctx.lineTo(bx+60+1.5, hy-s*1.55); ctx.lineTo(bx+60-1.5, hy-s*1.55);
  ctx.closePath(); ctx.fill();
  // Setback rings
  ctx.strokeStyle='rgba(255,180,80,0.22)'; ctx.lineWidth=1;
  var rings=[0.42,0.52,0.62,0.72,0.80,0.88,0.94];
  for(var r=0;r<rings.length;r++){
    var rw=Math.max(1,20-r*2.5);
    ctx.beginPath(); ctx.moveTo(bx+60-rw, hy-s*rings[r]); ctx.lineTo(bx+60+rw, hy-s*rings[r]); ctx.stroke();
  }
}

function dashBldSZGM(ctx, bx, hy, ch){
  // Sheikh Zayed Grand Mosque — wide, white, 4 minarets + central dome
  var s = ch * 0.26;
  ctx.fillStyle = '#5C2A08'; ctx.globalAlpha = 0.78;
  // Main base wall
  ctx.fillRect(bx+10, hy-s*0.18, s*1.22, s*0.18);
  // Arched colonnades (7 arches)
  for(var a=0;a<7;a++){
    var ax=bx+16+a*s*0.165, aw=s*0.12, ah=s*0.12;
    ctx.beginPath(); ctx.rect(ax, hy-ah, aw, ah);
    ctx.arc(ax+aw/2, hy-ah, aw/2, Math.PI, 0); ctx.fill();
  }
  // Central large dome
  var dr=s*0.22, dcx=bx+s*0.61, dcy=hy-s*0.18-dr*0.6;
  ctx.beginPath(); ctx.arc(dcx, dcy, dr, Math.PI, 0); ctx.fill();
  ctx.beginPath(); ctx.moveTo(dcx-dr*0.22,dcy);
  ctx.bezierCurveTo(dcx-dr*0.12,dcy-dr*0.5,dcx,dcy-dr*0.95,dcx,dcy-dr*1.15);
  ctx.bezierCurveTo(dcx,dcy-dr*0.95,dcx+dr*0.12,dcy-dr*0.5,dcx+dr*0.22,dcy);
  ctx.fill();
  // 4 minarets
  var mxs=[bx+14, bx+s*0.285, bx+s*0.935, bx+s*1.21];
  for(var m=0;m<4;m++){
    var mh=s*(m%2===0?0.60:0.55), mw=s*0.045;
    ctx.fillRect(mxs[m]-mw/2, hy-s*0.18-mh, mw, mh);
    ctx.fillRect(mxs[m]-mw*0.9, hy-s*0.18-mh*0.52, mw*1.8, s*0.022);
    ctx.beginPath(); ctx.moveTo(mxs[m]-mw*0.7, hy-s*0.18-mh);
    ctx.bezierCurveTo(mxs[m]-mw*0.3,hy-s*0.18-mh-s*0.055,mxs[m],hy-s*0.18-mh-s*0.13,mxs[m],hy-s*0.18-mh-s*0.155);
    ctx.bezierCurveTo(mxs[m],hy-s*0.18-mh-s*0.13,mxs[m]+mw*0.3,hy-s*0.18-mh-s*0.055,mxs[m]+mw*0.7,hy-s*0.18-mh);
    ctx.fill();
  }
  // Side domes
  var sdxs=[bx+s*0.165, bx+s*1.055];
  for(var sd=0;sd<2;sd++){
    var sdr=s*0.08;
    ctx.beginPath(); ctx.arc(sdxs[sd],hy-s*0.18-sdr*0.4,sdr,Math.PI,0); ctx.fill();
  }
}

function dashBldEmiratesTowers(ctx, bx, hy, ch){
  // Two triangular-topped towers (Office Tower taller, Hotel Tower shorter)
  var s = ch * 0.26;
  ctx.fillStyle = '#160A28'; ctx.globalAlpha = 0.80;
  // Left (Office) tower — taller
  var lx=bx+20, lw=42, lh=s*0.95;
  ctx.fillRect(lx, hy-lh, lw, lh);
  // Triangular cap
  ctx.beginPath(); ctx.moveTo(lx, hy-lh); ctx.lineTo(lx+lw, hy-lh);
  ctx.lineTo(lx+lw/2, hy-lh-s*0.28); ctx.closePath(); ctx.fill();
  // Diagonal facade lines (slight perspective)
  ctx.strokeStyle='rgba(255,200,100,0.18)'; ctx.lineWidth=1;
  for(var i=0;i<5;i++){
    var lyi=hy-lh+i*(lh/5);
    ctx.beginPath(); ctx.moveTo(lx, lyi); ctx.lineTo(lx+lw, lyi); ctx.stroke();
  }
  // Right (Hotel) tower — shorter, slightly behind
  var rx=bx+78, rw=36, rh=s*0.72;
  ctx.fillStyle='#1E0E34'; ctx.globalAlpha=0.75;
  ctx.fillRect(rx, hy-rh, rw, rh);
  ctx.beginPath(); ctx.moveTo(rx, hy-rh); ctx.lineTo(rx+rw, hy-rh);
  ctx.lineTo(rx+rw/2, hy-rh-s*0.21); ctx.closePath(); ctx.fill();
}

function dashBldEtihadTowers(ctx, bx, hy, ch){
  // 5 slender curved towers of different heights
  var s = ch * 0.26;
  var hts=[s*0.80, s*0.95, s*1.05, s*0.88, s*0.72];
  var xs=[bx+8, bx+44, bx+88, bx+132, bx+168];
  var ws=[22, 24, 26, 23, 20];
  for(var i=0;i<5;i++){
    ctx.fillStyle = i===2 ? '#4A2005' : '#542408';
    ctx.globalAlpha = 0.78;
    // Slightly curved shaft
    ctx.beginPath();
    ctx.moveTo(xs[i], hy);
    ctx.bezierCurveTo(xs[i]-4, hy-hts[i]*0.5, xs[i]-2, hy-hts[i]*0.8, xs[i]+ws[i]/2, hy-hts[i]);
    ctx.bezierCurveTo(xs[i]+ws[i]+2, hy-hts[i]*0.8, xs[i]+ws[i]+4, hy-hts[i]*0.5, xs[i]+ws[i], hy);
    ctx.closePath(); ctx.fill();
    // Rounded cap
    ctx.beginPath(); ctx.arc(xs[i]+ws[i]/2, hy-hts[i], ws[i]/2, Math.PI, 0, true); ctx.fill();
  }
}

function dashBldLouvreAD(ctx, bx, hy, ch){
  // Louvre Abu Dhabi — iconic lattice dome floating over water
  var s = ch * 0.26;
  ctx.globalAlpha = 0.80;
  // Water reflection band
  ctx.fillStyle = '#0D1A3A';
  ctx.fillRect(bx, hy-s*0.05, s*1.1, s*0.05);
  // Low flat buildings/galleries
  ctx.fillStyle = '#4A2005';
  ctx.fillRect(bx+s*0.05, hy-s*0.10, s*0.95, s*0.10);
  // Central dome — disc shape (flattened ellipse, very wide)
  var dcx=bx+s*0.55, dcy=hy-s*0.22, drx=s*0.44, dry=s*0.10;
  ctx.fillStyle='#150928';
  ctx.beginPath(); ctx.ellipse(dcx, dcy, drx, dry, 0, Math.PI, 0, true); ctx.fill();
  // Dome overhang edge
  ctx.strokeStyle='rgba(255,180,80,0.28)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.ellipse(dcx, dcy, drx, dry*1.05, 0, Math.PI, 0, true); ctx.stroke();
  // Lattice pattern (star cutouts suggestion — bright dots)
  ctx.fillStyle='rgba(255,200,100,0.15)';
  for(var li=0;li<18;li++){
    var langle = Math.PI + li*(Math.PI/18);
    var ldx=dcx+Math.cos(langle)*drx*0.7, ldy=dcy+Math.sin(langle)*dry*0.7;
    ctx.beginPath(); ctx.arc(ldx, ldy, 1.2, 0, Math.PI*2); ctx.fill();
  }
}

function dashBldQasrWatan(ctx, bx, hy, ch){
  // Qasr Al Watan presidential palace — wide classical+Islamic
  var s = ch * 0.27;
  ctx.fillStyle = '#502208'; ctx.globalAlpha = 0.78;
  // Wide base
  ctx.fillRect(bx, hy-s*0.16, s*1.20, s*0.16);
  // Central large dome
  var dr=s*0.19, dcx=bx+s*0.60;
  ctx.beginPath(); ctx.arc(dcx, hy-s*0.16-dr*0.55, dr, Math.PI, 0); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(dcx-dr*0.20, hy-s*0.16-dr*1.05);
  ctx.bezierCurveTo(dcx-dr*0.10, hy-s*0.16-dr*1.45, dcx, hy-s*0.16-dr*1.80, dcx, hy-s*0.16-dr*2.0);
  ctx.bezierCurveTo(dcx, hy-s*0.16-dr*1.80, dcx+dr*0.10, hy-s*0.16-dr*1.45, dcx+dr*0.20, hy-s*0.16-dr*1.05);
  ctx.fill();
  // 4 corner turrets
  var tx=[bx+10, bx+s*0.30, bx+s*0.90, bx+s*1.12];
  for(var t=0;t<4;t++){
    var th=s*(t===0||t===3 ? 0.44 : 0.38), tw=s*0.055;
    ctx.fillRect(tx[t]-tw/2, hy-s*0.16-th, tw, th);
    ctx.beginPath(); ctx.arc(tx[t], hy-s*0.16-th, tw*0.7, Math.PI, 0); ctx.fill();
  }
  // Arched entrance (3)
  for(var a=0;a<5;a++){
    var aax=bx+s*0.22+a*s*0.155, aaw=s*0.10, aah=s*0.09;
    ctx.beginPath(); ctx.rect(aax, hy-aah, aaw, aah);
    ctx.arc(aax+aaw/2, hy-aah, aaw/2, Math.PI, 0); ctx.fill();
  }
}

function dashBldFrameTower(ctx, bx, hy, ch){
  // Dubai Frame — rectangular picture frame on legs
  var s = ch * 0.26;
  ctx.fillStyle = '#4A2005'; ctx.globalAlpha = 0.82;
  var fw=s*0.32, fh=s*0.80, legH=s*0.30, legW=s*0.055;
  var fx=bx+s*0.08;
  // Left leg
  ctx.fillRect(fx, hy-legH-fh, legW, legH+fh);
  // Right leg
  ctx.fillRect(fx+fw-legW, hy-legH-fh, legW, legH+fh);
  // Top beam
  ctx.fillRect(fx, hy-legH-fh, fw, legW*1.2);
  // Bottom beam (sky bridge)
  ctx.fillRect(fx, hy-legH-legW, fw, legW*1.2);
  // Golden frame glow
  ctx.strokeStyle='rgba(255,200,50,0.30)'; ctx.lineWidth=2;
  ctx.strokeRect(fx+legW*0.5, hy-legH-fh+legW*0.5, fw-legW, fh-legW);
}

function dashBldAldarHQ(ctx, bx, hy, ch){
  // Aldar HQ — the world's first circular skyscraper (Abu Dhabi)
  var s = ch * 0.26;
  var r = s * 0.42;
  var cx = bx + r + 6, cy = hy - r * 0.96;
  ctx.globalAlpha = 0.80;
  // Coin-shaped disc
  ctx.fillStyle = '#3A1A06';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
  // Curved glass sheen
  ctx.fillStyle = 'rgba(255,170,60,0.14)';
  ctx.beginPath(); ctx.arc(cx - r*0.25, cy - r*0.25, r*0.72, 0, Math.PI*2); ctx.fill();
  // Diagrid frame lines
  ctx.strokeStyle = 'rgba(255,190,90,0.22)'; ctx.lineWidth = 1;
  for(var g=-2; g<=2; g++){
    ctx.beginPath(); ctx.moveTo(cx - r*0.9, cy + g*r*0.4 - r*0.3); ctx.lineTo(cx + r*0.9, cy + g*r*0.4 + r*0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - r*0.9, cy + g*r*0.4 + r*0.3); ctx.lineTo(cx + r*0.9, cy + g*r*0.4 - r*0.3); ctx.stroke();
  }
  // Lit windows
  ctx.fillStyle = 'rgba(255,220,120,0.75)';
  for(var wy=-2; wy<=2; wy++){
    for(var wx=-2; wx<=2; wx++){
      if(Math.abs(wx)+Math.abs(wy) > 3) continue;
      if((wx*3+wy*7) % 3 === 0) ctx.fillRect(cx + wx*r*0.30, cy + wy*r*0.30, 2.5, 2.5);
    }
  }
  ctx.globalAlpha = 1;
}

function dashBldCapitalGate(ctx, bx, hy, ch){
  // Capital Gate — the world's furthest-leaning tower (Abu Dhabi)
  var s = ch * 0.26;
  var H = s * 1.02, W = s * 0.30;
  var baseX = bx + 20;
  var lean = W * 1.15; // top shifts right
  ctx.globalAlpha = 0.82;
  ctx.fillStyle = '#401C06';
  // Leaning curved silhouette
  ctx.beginPath();
  ctx.moveTo(baseX, hy);
  ctx.quadraticCurveTo(baseX + lean*0.15, hy - H*0.62, baseX + lean, hy - H);
  ctx.lineTo(baseX + lean + W*0.85, hy - H*0.96);
  ctx.quadraticCurveTo(baseX + W*1.3, hy - H*0.45, baseX + W, hy);
  ctx.closePath(); ctx.fill();
  // Diagrid glass lines
  ctx.strokeStyle = 'rgba(255,190,90,0.20)'; ctx.lineWidth = 1;
  for(var d=1; d<5; d++){
    var t = d/5;
    ctx.beginPath();
    ctx.moveTo(baseX + lean*t*t*0.9, hy - H*t);
    ctx.lineTo(baseX + lean*t*t*0.9 + W, hy - H*t + H*0.03);
    ctx.stroke();
  }
  // Window lights
  ctx.fillStyle = 'rgba(255,220,120,0.75)';
  for(var f=1; f<9; f++){
    var tt = f/9;
    var fx = baseX + lean*tt*tt*0.9 + W*0.2;
    if((f*5)%3===0) ctx.fillRect(fx, hy - H*tt, 2.5, 2.5);
    if((f*7)%4===0) ctx.fillRect(fx + W*0.45, hy - H*tt + 3, 2.5, 2.5);
  }
  ctx.globalAlpha = 1;
}

// ── BUILDING STRIP DEFINITIONS ── [x-position-in-strip, width, drawFn]
// Abu Dhabi landmarks lead the skyline; Dubai icons appear further along
var DASH_BLD_STRIP = 2800;
var DASH_BLDS = [
  { x:0,    w:400, fn: dashBldSZGM },           // Sheikh Zayed Grand Mosque (AD)
  { x:460,  w:210, fn: dashBldEtihadTowers },   // Etihad Towers (AD)
  { x:730,  w:150, fn: dashBldAldarHQ },        // Aldar HQ (AD)
  { x:930,  w:150, fn: dashBldCapitalGate },    // Capital Gate (AD)
  { x:1140, w:280, fn: dashBldLouvreAD },       // Louvre Abu Dhabi (AD)
  { x:1480, w:360, fn: dashBldQasrWatan },      // Qasr Al Watan (AD)
  { x:1900, w:140, fn: dashBldBurjKhalifa },    // Burj Khalifa (Dubai)
  { x:2100, w:210, fn: dashBldEmiratesTowers }, // Emirates Towers (Dubai)
  { x:2370, w:200, fn: dashBldFrameTower },     // Dubai Frame (Dubai)
  { x:2620, w:150, fn: dashBldCapitalGate }     // Capital Gate again before loop
];

function dashDrawVignette(ctx, cw, ch){
  // Milestone flash — orange wash over canvas
  if(DS.milestoneFlash > 0){
    ctx.save();
    ctx.globalAlpha = (DS.milestoneFlash / 35) * 0.38;
    ctx.fillStyle = '#F7941D';
    ctx.fillRect(0,0,cw,ch);
    // Bright ring at edges
    ctx.globalAlpha = (DS.milestoneFlash / 35) * 0.55;
    var mfg = ctx.createRadialGradient(cw/2,ch/2,ch*0.25,cw/2,ch/2,ch*0.7);
    mfg.addColorStop(0,'rgba(255,165,0,0)');
    mfg.addColorStop(1,'rgba(255,120,0,0.6)');
    ctx.fillStyle = mfg; ctx.fillRect(0,0,cw,ch);
    ctx.restore();
  }
  // Cinematic edge darkening + speed lines
  var vg = ctx.createRadialGradient(cw/2, ch/2, ch*0.28, cw/2, ch/2, ch*0.82);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.52)');
  ctx.fillStyle = vg; ctx.fillRect(0,0,cw,ch);
  // Speed lines when fast
  if(DS.speed > 6.5 && DASH_PHASE==='playing'){
    var spd = Math.min(1, (DS.speed-6.5)/3.5);
    ctx.save(); ctx.globalAlpha = spd * 0.18;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
    var cx2=cw/2, cy2=DS.horizonY;
    for(var sl=0;sl<22;sl++){
      var ang = (sl/22)*Math.PI*2;
      var r1 = ch*0.08, r2 = ch*(0.45 + Math.random()*0.3);
      ctx.beginPath();
      ctx.moveTo(cx2+Math.cos(ang)*r1, cy2+Math.sin(ang)*r1);
      ctx.lineTo(cx2+Math.cos(ang)*r2, cy2+Math.sin(ang)*r2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function dashDrawOverheadWires(ctx, cw, ch){
  // Removed — wires crossed the verge and looked like ground lines
}

function dashDrawChaser(ctx, cw, ch){
  if(DASH_PHASE !== 'playing') return;
  // Comical inspector chasing the player — visible at very bottom, slightly cut off
  // Offset left of center so he doesn't overlap the MOVE control panel
  var t = Date.now()*0.003;
  var cx2 = cw * 0.36 + Math.sin(t*1.4)*12;
  var cy2 = ch + 18; // bottom cut-off so only head/torso shows
  var bob = Math.abs(Math.sin(t*4))*8; // bouncy run
  cy2 -= bob;
  ctx.save();
  ctx.translate(cx2, cy2);

  // Shadow on ground
  ctx.save(); ctx.globalAlpha=0.20;
  ctx.beginPath(); ctx.ellipse(0, -8, 28, 8, 0, 0, Math.PI*2);
  ctx.fillStyle='#000'; ctx.fill(); ctx.restore();

  // LEGS (running)
  var lf = Math.sin(t*4)*0.55;
  var rf = -lf;
  // left leg
  ctx.save(); ctx.translate(-10,-60); ctx.rotate(lf);
  ctx.fillStyle='#2E7D32';
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-5,0,10,28,4) : ctx.rect(-5,0,10,28); ctx.fill();
  // boot
  ctx.fillStyle='#1B1B1B'; ctx.beginPath(); ctx.ellipse(lf*8,30,11,6,lf*0.2,0,Math.PI*2); ctx.fill();
  ctx.restore();
  // right leg
  ctx.save(); ctx.translate(10,-60); ctx.rotate(rf);
  ctx.fillStyle='#388E3C';
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-5,0,10,28,4) : ctx.rect(-5,0,10,28); ctx.fill();
  ctx.fillStyle='#1B1B1B'; ctx.beginPath(); ctx.ellipse(rf*8,30,11,6,rf*0.2,0,Math.PI*2); ctx.fill();
  ctx.restore();

  // BODY — khaki/olive uniform
  var bg2 = ctx.createLinearGradient(-18,-85,18,-42);
  bg2.addColorStop(0,'#8BC34A'); bg2.addColorStop(0.5,'#689F38'); bg2.addColorStop(1,'#4CAF50');
  ctx.fillStyle=bg2;
  ctx.beginPath();
  ctx.moveTo(-18,-42); ctx.lineTo(-15,-85); ctx.bezierCurveTo(-15,-90,15,-90,15,-85); ctx.lineTo(18,-42); ctx.closePath();
  ctx.fill();
  // Uniform badge
  ctx.fillStyle='rgba(255,215,0,0.85)'; ctx.beginPath(); ctx.arc(-8,-68,5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#FFD700'; ctx.font='bold 5px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('★',-8,-68);
  // Belt
  ctx.fillStyle='#3E2A00'; ctx.fillRect(-19,-55,38,7);
  ctx.fillStyle='#D4AC0D'; ctx.beginPath(); ctx.rect(-5,-56,10,9); ctx.fill();

  // ARMS (raised/waving angrily)
  var la2 = -0.7 + Math.sin(t*4)*0.5;
  var ra2 =  0.7 - Math.sin(t*4)*0.5;
  ctx.save(); ctx.translate(-18,-76); ctx.rotate(la2);
  ctx.fillStyle='#7CB342'; ctx.fillRect(-4,0,9,22);
  ctx.fillStyle='#FDBCB4'; ctx.beginPath(); ctx.arc(0,24,6,0,Math.PI*2); ctx.fill();
  ctx.restore();
  ctx.save(); ctx.translate(18,-76); ctx.rotate(ra2);
  ctx.fillStyle='#7CB342'; ctx.fillRect(-5,0,9,22);
  ctx.fillStyle='#FDBCB4'; ctx.beginPath(); ctx.arc(0,24,6,0,Math.PI*2); ctx.fill();
  ctx.restore();

  // HEAD
  var hg3 = ctx.createRadialGradient(-4,-115,3,0,-108,18);
  hg3.addColorStop(0,'#FFD5C8'); hg3.addColorStop(0.6,'#FDBCB4'); hg3.addColorStop(1,'#E8A090');
  ctx.fillStyle=hg3; ctx.beginPath(); ctx.arc(0,-108,17,0,Math.PI*2); ctx.fill();
  // Angry brows
  ctx.strokeStyle='#5D2E08'; ctx.lineWidth=2.5; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(-10,-116); ctx.lineTo(-3,-112); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10,-116); ctx.lineTo(3,-112); ctx.stroke();
  // Eyes (angry, squinting)
  ctx.fillStyle='#2C1810';
  ctx.beginPath(); ctx.ellipse(-5,-108,3,2,0.3,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(5,-108,3,2,-0.3,0,Math.PI*2); ctx.fill();
  // Angry mouth (open yelling)
  ctx.fillStyle='#8B1A00';
  ctx.beginPath(); ctx.arc(0,-101,5,0.2,Math.PI-0.2); ctx.fill();
  ctx.fillStyle='#fff'; ctx.fillRect(-3,-103,6,3);
  // Moustache
  ctx.fillStyle='#3E2000';
  ctx.beginPath(); ctx.ellipse(-4,-104,4,2,0.2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4,-104,4,2,-0.2,0,Math.PI*2); ctx.fill();

  // HAT (inspector peaked cap)
  ctx.fillStyle='#33691E';
  ctx.beginPath(); ctx.ellipse(0,-123,20,8,0,0,Math.PI*2); ctx.fill();
  ctx.fillRect(-16,-123,32,-14); // cap band body
  ctx.beginPath();
  ctx.moveTo(-16,-137); ctx.bezierCurveTo(-16,-146,16,-146,16,-137); ctx.lineTo(16,-137); ctx.closePath(); ctx.fill();
  // Peak/brim
  ctx.fillStyle='#2E7D32';
  ctx.beginPath(); ctx.ellipse(0,-124,22,5,0,0,Math.PI*2); ctx.fill();
  // Hat badge
  ctx.fillStyle='#FFD700'; ctx.beginPath(); ctx.arc(0,-134,5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#33691E'; ctx.font='bold 6px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('✦',0,-134);

  // Yelling speech bubble
  if(Math.floor(Date.now()/800)%3===0){
    ctx.save(); ctx.translate(22,-125);
    ctx.fillStyle='#FFF'; ctx.strokeStyle='#333'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(0,-16,44,20,6) : ctx.rect(0,-16,44,20); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2,-4); ctx.lineTo(-5,2); ctx.lineTo(8,-4); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#C62828'; ctx.font='bold 7.5px Nunito,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('STOP! 🚨',22,-6);
    ctx.restore();
  }

  ctx.restore();
}

function dashDrawCorridorWalls(ctx, cw, ch){
  var hy = DS.horizonY;
  var cx = DS.cx;
  var ls = cw * 0.40;
  var ts = 55;
  var wallBaseH = 300;

  // ── LEFT WALL FILL (3 layers: base + face shadow + inner face darkening) ──
  var lwg = ctx.createLinearGradient(0, 0, cx-ts, ch*0.5);
  lwg.addColorStop(0,   '#C05010');
  lwg.addColorStop(0.3, '#E06C20');
  lwg.addColorStop(0.6, '#F08030');
  lwg.addColorStop(1,   '#C04C10');
  ctx.fillStyle = lwg;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(cx-ts, hy); ctx.lineTo(cx-ls, ch); ctx.lineTo(0, ch);
  ctx.closePath(); ctx.fill();
  // Face shadow — inner edge is darker (depth illusion)
  var lsh = ctx.createLinearGradient(cx-ls-80, ch*0.5, cx-ts, hy);
  lsh.addColorStop(0,'rgba(0,0,0,0)'); lsh.addColorStop(1,'rgba(0,0,0,0.50)');
  ctx.fillStyle=lsh;
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(cx-ts,hy); ctx.lineTo(cx-ls,ch); ctx.lineTo(0,ch); ctx.closePath(); ctx.fill();
  // ── RIGHT WALL FILL ──
  var rwg = ctx.createLinearGradient(cx+ts, ch*0.5, cw, 0);
  rwg.addColorStop(0,   '#F08030');
  rwg.addColorStop(0.3, '#E06C20');
  rwg.addColorStop(0.7, '#C05010');
  rwg.addColorStop(1,   '#A03808');
  ctx.fillStyle = rwg;
  ctx.beginPath();
  ctx.moveTo(cw,0); ctx.lineTo(cx+ts,hy); ctx.lineTo(cx+ls,ch); ctx.lineTo(cw,ch);
  ctx.closePath(); ctx.fill();
  var rsh = ctx.createLinearGradient(cx+ts, hy, cx+ls+80, ch*0.5);
  rsh.addColorStop(0,'rgba(0,0,0,0.50)'); rsh.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=rsh;
  ctx.beginPath(); ctx.moveTo(cw,0); ctx.lineTo(cx+ts,hy); ctx.lineTo(cx+ls,ch); ctx.lineTo(cw,ch); ctx.closePath(); ctx.fill();

  // ── DECORATIVE HORIZONTAL BAND — scrolling UAE geometric band on walls ──
  var bandFrac = 0.42; // band sits 42% down from wall top
  var bandOff = DS.bgOff[3] * 0.13;
  // Draw band as a strip on each wall side
  function wallBandY(wallX, frac){
    var p0 = dashProject(wallX, 480), p1 = dashProject(wallX, 0);
    // frac=0 → horizon top, frac=1 → bottom
    return p0.y + (p1.y - p0.y) * frac - wallBaseH * dashProject(wallX,200).scale * (1-frac);
  }
  // Left band strip
  ctx.save(); ctx.globalAlpha = 0.65;
  var bandH = 22;
  // horizontal strip at mid-wall height, left side
  var lbY0 = hy + (ch - hy) * 0.18;
  var lbY1 = lbY0 + bandH;
  var bg3 = ctx.createLinearGradient(0, lbY0, cx-ts, lbY0);
  bg3.addColorStop(0,'#D4AC0D'); bg3.addColorStop(0.5,'#FFD700'); bg3.addColorStop(1,'#B8960A');
  ctx.fillStyle = bg3;
  ctx.beginPath(); ctx.moveTo(0,lbY0); ctx.lineTo(cx-ts,lbY0); ctx.lineTo(cx-ls,lbY1+4); ctx.lineTo(0,lbY1); ctx.closePath(); ctx.fill();
  // Right band
  var bg4 = ctx.createLinearGradient(cx+ts, lbY0, cw, lbY0);
  bg4.addColorStop(0,'#B8960A'); bg4.addColorStop(0.5,'#FFD700'); bg4.addColorStop(1,'#D4AC0D');
  ctx.fillStyle = bg4;
  ctx.beginPath(); ctx.moveTo(cx+ts,lbY0); ctx.lineTo(cw,lbY0); ctx.lineTo(cw,lbY1); ctx.lineTo(cx+ls,lbY1+4); ctx.closePath(); ctx.fill();
  // Geometric star/diamond pattern on band (dots scrolling)
  var dotSpacing = 32;
  var dotOff = bandOff % dotSpacing;
  ctx.fillStyle = '#8B6500';
  for(var di = -2; di < Math.ceil(cw/dotSpacing)+2; di++){
    var dx = di * dotSpacing - dotOff;
    // Left wall band dot
    if(dx > 0 && dx < cx-ts){
      var t2 = dx / (cx-ts);
      var dy = lbY0 + (lbY1-lbY0)*0.5 + t2*4;
      ctx.beginPath(); ctx.arc(dx, dy, 3.5, 0, Math.PI*2); ctx.fill();
      // Diamond
      ctx.save(); ctx.translate(dx, dy); ctx.rotate(Math.PI/4);
      ctx.fillRect(-3,-3,6,6);
      ctx.restore();
    }
    // Right wall band dot (mirrored)
    var rdx = cw - dx;
    if(rdx > cx+ts && rdx < cw){
      var t3 = (cw-rdx) / (cw-cx-ts);
      var rdy = lbY0 + (lbY1-lbY0)*0.5 + t3*4;
      ctx.beginPath(); ctx.arc(rdx, rdy, 3.5, 0, Math.PI*2); ctx.fill();
      ctx.save(); ctx.translate(rdx, rdy); ctx.rotate(Math.PI/4);
      ctx.fillRect(-3,-3,6,6); ctx.restore();
    }
  }
  ctx.restore();

  // ── VERTICAL PILASTERS (columns at regular intervals) ──
  var pilPeriod = 120;
  var pilOff = pilPeriod - (DS.bgOff[3] % pilPeriod);
  for(var side2=-1; side2<=1; side2+=2){
    var wxx = side2 * 1.88;
    for(var pi2=0; pi2<6; pi2++){
      var pz = pi2 * pilPeriod + pilOff;
      if(pz<2||pz>530) continue;
      var pp2 = dashProject(wxx, pz);
      if(pp2.y < hy || pp2.y > ch+40) continue;
      var sc2 = pp2.scale;
      var pW = Math.max(3, sc2 * 16);
      var pTop = pp2.y - wallBaseH * sc2;
      // Pilaster body
      var plg = ctx.createLinearGradient(pp2.x-pW, 0, pp2.x+pW, 0);
      plg.addColorStop(0,'rgba(0,0,0,0.25)'); plg.addColorStop(0.3,'rgba(255,255,255,0.18)'); plg.addColorStop(0.7,'rgba(0,0,0,0.0)'); plg.addColorStop(1,'rgba(0,0,0,0.20)');
      ctx.fillStyle=plg;
      ctx.fillRect(pp2.x - pW, pTop, pW*2, pp2.y - pTop);
      // Capital at top
      ctx.fillStyle='rgba(255,200,80,0.40)';
      ctx.fillRect(pp2.x - pW*1.4, pTop, pW*2.8, sc2*10);
      // Base
      ctx.fillRect(pp2.x - pW*1.4, pp2.y - sc2*12, pW*2.8, sc2*12);
    }
  }

  // ── SCROLLING ARCH WINDOWS ──
  var archPeriod = 120;
  var archOff = archPeriod - (DS.bgOff[3] % archPeriod);
  for(var side=-1; side<=1; side+=2){
    var wx = side * 1.88;
    for(var wa=0; wa<8; wa++){
      var wz = wa * archPeriod + archOff;
      if(wz < 5 || wz > 520) continue;
      var wp = dashProject(wx, wz);
      if(wp.y < hy || wp.y > ch+50) continue;
      var sc = wp.scale;
      var wTopY = wp.y - wallBaseH * sc;
      var archCy = wp.y - wallBaseH * sc * 0.46;
      var aH = wallBaseH * sc * 0.60;
      var aW = wallBaseH * sc * 0.36;

      // Deep window interior with warm glow
      var wg = ctx.createRadialGradient(wp.x, archCy, aW*0.05, wp.x, archCy, aW*0.85);
      wg.addColorStop(0, 'rgba(255,160,60,0.35)');
      wg.addColorStop(0.6, 'rgba(80,20,5,0.80)');
      wg.addColorStop(1, 'rgba(30,8,2,0.95)');
      ctx.fillStyle = wg;
      ctx.beginPath();
      ctx.rect(wp.x - aW/2, archCy - aH*0.35, aW, aH*0.68);
      ctx.arc(wp.x, archCy - aH*0.35, aW/2, Math.PI, 0);
      ctx.fill();

      // Outer arch frame (gold ornate border)
      var frameW = Math.max(2, sc*6);
      ctx.strokeStyle = 'rgba(220,170,40,0.85)';
      ctx.lineWidth = frameW;
      ctx.beginPath();
      ctx.moveTo(wp.x - aW/2 - frameW/2, archCy + aH*0.33);
      ctx.lineTo(wp.x - aW/2 - frameW/2, archCy - aH*0.35);
      ctx.arc(wp.x, archCy - aH*0.35, aW/2 + frameW/2, Math.PI, 0);
      ctx.lineTo(wp.x + aW/2 + frameW/2, archCy + aH*0.33);
      ctx.stroke();
      // Inner arch (double frame — Islamic style)
      ctx.strokeStyle = 'rgba(255,210,80,0.50)';
      ctx.lineWidth = Math.max(1, sc*2.5);
      var iW = aW*0.72;
      ctx.beginPath();
      ctx.moveTo(wp.x - iW/2, archCy + aH*0.22);
      ctx.lineTo(wp.x - iW/2, archCy - aH*0.25);
      ctx.arc(wp.x, archCy - aH*0.25, iW/2, Math.PI, 0);
      ctx.lineTo(wp.x + iW/2, archCy + aH*0.22);
      ctx.stroke();

      // Muqarnas hint (honeycomb squinch at arch base)
      if(sc > 0.28){
        ctx.save(); ctx.globalAlpha = 0.55;
        ctx.fillStyle = 'rgba(180,100,20,0.60)';
        var mqW = aW * 0.18;
        ctx.beginPath(); ctx.arc(wp.x - aW/2 + mqW, archCy - aH*0.35 - mqW*0.2, mqW, Math.PI, 0); ctx.fill();
        ctx.beginPath(); ctx.arc(wp.x + aW/2 - mqW, archCy - aH*0.35 - mqW*0.2, mqW, Math.PI, 0); ctx.fill();
        ctx.restore();
      }

      // Horizontal stone-course lines on wall (between arches)
      ctx.strokeStyle = side<0 ? 'rgba(100,40,8,0.28)' : 'rgba(100,40,8,0.28)';
      ctx.lineWidth = Math.max(0.5, sc*1.8);
      for(var bl=1; bl<5; bl++){
        var bly = wTopY + (wp.y - wTopY) * (bl/5.5);
        var blw = aW * 1.8;
        ctx.beginPath(); ctx.moveTo(wp.x - blw, bly); ctx.lineTo(wp.x + blw, bly); ctx.stroke();
      }
    }
  }

  // ── TOP WALL EDGE with crenellations ──
  var cW=20, cH=15, cGap=14, cPer=cW+cGap;
  var cOff = DS.bgOff[3] * 0.13;
  for(var ci=0; ci<30; ci++){
    var ct=(ci*cPer - cOff%(cPer*30)+cPer*35)%(cPer*30);
    var frac2=ct/(cPer*30); if(frac2>1) continue;
    var lx2=frac2*(cx-ts), ly2=frac2*hy;
    var cs3=0.35+frac2*0.65;
    // Left crenellation
    ctx.fillStyle='#D06018';
    ctx.fillRect(lx2, ly2-cH*cs3, cW*cs3, cH*cs3);
    ctx.fillStyle='rgba(255,200,80,0.30)';
    ctx.fillRect(lx2, ly2-cH*cs3, cW*cs3, cs3*3);
    // Right (mirror)
    var rx2=cw-lx2;
    ctx.fillStyle='#D06018';
    ctx.fillRect(rx2-cW*cs3, ly2-cH*cs3, cW*cs3, cH*cs3);
    ctx.fillStyle='rgba(255,200,80,0.30)';
    ctx.fillRect(rx2-cW*cs3, ly2-cH*cs3, cW*cs3, cs3*3);
  }
  // Gold rim line along wall top edges
  ctx.strokeStyle='rgba(255,210,80,0.55)'; ctx.lineWidth=2.5;
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(cx-ts,hy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cw,0); ctx.lineTo(cx+ts,hy); ctx.stroke();
}

// ═══════════════════════════════════════
// UAE OUTRUN-STYLE OPEN DESERT RUNNER
// ═══════════════════════════════════════
var DASH_BLD_ZW = 76; // kept for legacy references

function dashDraw3DBuildings(ctx, cw, ch){
  // OutRun-style open roadside: palm trees + distant UAE buildings
  var hy = DS.horizonY, lsp = DS.laneSpread;

  // ── DESERT ROCK OUTCROPS — scattered along both sides ──
  var ROCKS = [
    {wx:2.8, wz:120, rw:1.0, rh:0.55, seed:1},
    {wx:3.5, wz:180, rw:1.4, rh:0.40, seed:3},
    {wx:2.5, wz:260, rw:0.9, rh:0.65, seed:7},
    {wx:4.0, wz:320, rw:1.6, rh:0.50, seed:2},
    {wx:3.2, wz:400, rw:1.1, rh:0.45, seed:5},
    {wx:-2.8,wz:150, rw:1.2, rh:0.60, seed:4},
    {wx:-3.6,wz:210, rw:1.5, rh:0.42, seed:6},
    {wx:-2.4,wz:300, rw:0.8, rh:0.58, seed:8},
    {wx:-4.2,wz:360, rw:1.3, rh:0.48, seed:9},
    {wx:-3.0,wz:440, rw:1.0, rh:0.38, seed:2},
  ];
  for(var ri=0; ri<ROCKS.length; ri++){
    var rk = ROCKS[ri];
    var rp = dashProject(rk.wx, rk.wz);
    if(rp.y < hy || rp.y > ch+20) continue;
    var rw = Math.max(6, rk.rw * lsp * rp.scale * 2.4);
    var rh = Math.max(4, rk.rh * lsp * rp.scale * 1.2);
    var rx = rp.x, ry = rp.y;
    var sd = rk.seed;
    // Rock gradient — warm sandstone tones
    var rfg = ctx.createLinearGradient(rx-rw*0.5, ry-rh, rx+rw*0.5, ry);
    rfg.addColorStop(0,   '#B8864A');  // lit sandstone top
    rfg.addColorStop(0.4, '#9A6832');  // mid shadow
    rfg.addColorStop(1,   '#6A4018');  // dark base
    ctx.fillStyle = rfg;
    // Irregular rock silhouette using bezier
    ctx.beginPath();
    ctx.moveTo(rx - rw*0.50, ry);
    ctx.lineTo(rx - rw*(0.42+sd*0.01), ry - rh*(0.55+sd*0.03));
    ctx.quadraticCurveTo(rx - rw*(0.18+sd*0.02), ry - rh*(1.0+sd*0.04), rx - rw*(0.05+sd*0.01), ry - rh*(0.90+sd*0.02));
    ctx.quadraticCurveTo(rx + rw*(0.10+sd*0.01), ry - rh*(1.05+sd*0.03), rx + rw*(0.20+sd*0.02), ry - rh*(0.82+sd*0.02));
    ctx.quadraticCurveTo(rx + rw*(0.38+sd*0.01), ry - rh*(0.95+sd*0.02), rx + rw*(0.45+sd*0.01), ry - rh*(0.60+sd*0.02));
    ctx.lineTo(rx + rw*0.50, ry);
    ctx.closePath();
    ctx.fill();
    // Highlight edge (lit by sunset from the right)
    ctx.strokeStyle = 'rgba(220,160,80,0.35)';
    ctx.lineWidth = Math.max(1, rp.scale*2);
    ctx.stroke();
    // Shadow at base
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(rx, ry+1, rw*0.45, rh*0.12, 0, 0, Math.PI*2);
    ctx.fill();
  }

}

function dashDrawRoadPalms(ctx, cw, ch){
  var hy = DS.horizonY;

  // Sparse palms — only a few spots per side, wide spacing
  var PALMS = [
    {side: 1, wx:2.30, period:320, offset:0},
    {side:-1, wx:2.30, period:320, offset:160},
    {side: 1, wx:3.00, period:280, offset:80},
    {side:-1, wx:3.00, period:280, offset:220},
  ];
  for(var pi=0; pi<PALMS.length; pi++){
    var p = PALMS[pi];
    var sc = DS.bgOff[3] % p.period;
    for(var i=0; i<4; i++){
      var wz = (i*p.period + p.offset - sc + p.period*10) % (p.period*4);
      if(wz < 5 || wz > 460) continue;
      var pp = dashProject(p.side*p.wx, wz);
      if(pp.y < hy-5 || pp.y > ch+20) continue;
      if(TREE_IMG_READY){
        var th = Math.max(30, Math.round(340 * pp.scale));
        var tw = th;
        var tx = pp.x - tw/2;
        var ty = pp.y - th * 0.91;
        // Ground shadow ellipse beneath tree pot
        ctx.save();
        ctx.globalAlpha = 0.28;
        ctx.beginPath();
        ctx.ellipse(pp.x, pp.y + 2, tw * 0.22, tw * 0.055, 0, 0, Math.PI*2);
        ctx.fillStyle = '#1A0A00';
        ctx.fill();
        ctx.restore();
        ctx.drawImage(TREE_IMG, tx, ty, tw, th);
      } else {
        dashDrawPalm3D(ctx, pp.x, pp.y, Math.max(8, 340*pp.scale), pp.scale);
      }
    }
  }

  // Desert shrubs / low plants scattered in the verge
  var SHRUBS = [
    {side: 1, wx:2.05, period:190, offset:30},
    {side:-1, wx:2.05, period:190, offset:110},
    {side: 1, wx:2.70, period:220, offset:90},
    {side:-1, wx:2.70, period:220, offset:10},
    {side: 1, wx:3.50, period:250, offset:150},
    {side:-1, wx:3.50, period:250, offset:60},
  ];
  for(var si=0; si<SHRUBS.length; si++){
    var sh = SHRUBS[si];
    var ssc = DS.bgOff[3] % sh.period;
    for(var j=0; j<5; j++){
      var swz = (j*sh.period + sh.offset - ssc + sh.period*10) % (sh.period*5);
      if(swz < 5 || swz > 470) continue;
      var sp = dashProject(sh.side*sh.wx, swz);
      if(sp.y < hy-4 || sp.y > ch+15) continue;
      dashDrawDesertShrub(ctx, sp.x, sp.y, sp.scale);
    }
  }
}

function dashDrawDesertShrub(ctx, x, y, sc){
  // A small spiky desert bush — dusty olive-green
  var r = Math.max(4, sc * 28);
  var baseY = y;
  // Shadow blob
  ctx.beginPath();
  ctx.ellipse(x, baseY + r*0.15, r*0.7, r*0.18, 0, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fill();
  // Main bush body — irregular lumps
  var cols = ['#5A7A30','#4A6828','#6A8A38','#3E5A20'];
  for(var k=0; k<3; k++){
    var ox = (k-1)*r*0.38, oy = -r*(0.3+k*0.1);
    var rad = r*(0.55 + (k===1?0.18:0));
    ctx.beginPath();
    ctx.arc(x+ox, baseY+oy, rad, 0, Math.PI*2);
    ctx.fillStyle = cols[k % cols.length];
    ctx.fill();
  }
  // Tiny spiky highlights
  ctx.strokeStyle = '#8AAA50';
  ctx.lineWidth = Math.max(0.5, sc*1.5);
  for(var s=0; s<5; s++){
    var ang = (s/5)*Math.PI*2 - Math.PI*0.5;
    var rx = x + Math.cos(ang)*r*0.55;
    var ry = baseY - r*0.3 + Math.sin(ang)*r*0.4;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + Math.cos(ang)*r*0.25, ry + Math.sin(ang)*r*0.25);
    ctx.stroke();
  }
}

function dashDrawStreetLights(ctx, cw, ch){
  // Minimal UAE highway signs along the road shoulder
  var hy = DS.horizonY, lsp = DS.laneSpread;
  var PERIOD = 160;
  var pOff = PERIOD - (DS.bgOff[3] % PERIOD);
  for(var side=-1; side<=1; side+=2){
    for(var li=0; li<5; li++){
      var wz = li*PERIOD + pOff;
      if(wz < 5 || wz > 480) continue;
      var p = dashProject(side*1.88, wz);
      if(p.y < hy || p.y > ch+10) continue;
      var sc = p.scale;
      var pH = Math.max(4, sc*lsp*1.4);
      // Simple highway sign post
      ctx.fillStyle = '#A09070';
      ctx.fillRect(p.x - sc*1.5, p.y - pH, sc*3, pH);
      // Sign board
      ctx.fillStyle = '#1A4A20';
      ctx.fillRect(p.x - sc*12, p.y - pH - sc*10, sc*24, sc*10);
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = 0.85;
      ctx.fillRect(p.x - sc*10, p.y - pH - sc*8, sc*20, sc*6);
      ctx.globalAlpha = 1;
    }
  }
}

function dashRenderBg(ctx, cw, ch){
  var hy = DS.horizonY;
  var cx = DS.cx;
  var now = Date.now();

  // ══════════════════════════════════════════════════
  // UAE EVENING SKY — cinematic sunset
  // Deep violet-blue at zenith, warm amber-gold at horizon
  // ══════════════════════════════════════════════════
  var sky = ctx.createLinearGradient(0, 0, 0, hy);
  sky.addColorStop(0,    '#0C0828');   // deep space violet
  sky.addColorStop(0.22, '#1E0A50');   // rich indigo
  sky.addColorStop(0.42, '#4A1060');   // dark violet-purple
  sky.addColorStop(0.58, '#8A2040');   // deep rose
  sky.addColorStop(0.72, '#C84010');   // burnt sienna
  sky.addColorStop(0.86, '#E87020');   // warm orange
  sky.addColorStop(1,    '#F8C030');   // bright gold at horizon
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, cw, hy);

  // ── STARS — only in upper dark portion of sky ──
  var STAR_DATA = [
    [.03,.02,1.5],[.09,.05,1.1],[.16,.01,1.7],[.22,.08,1.0],[.30,.03,1.4],
    [.37,.07,0.9],[.44,.02,1.6],[.51,.10,1.0],[.59,.04,1.3],[.65,.08,1.7],
    [.73,.02,1.1],[.80,.06,1.5],[.88,.01,0.9],[.94,.09,1.2],[.06,.14,0.8],
    [.19,.13,1.3],[.35,.12,0.9],[.48,.15,1.4],[.61,.11,0.8],[.76,.13,1.1],
    [.12,.04,0.8],[.41,.06,1.1],[.56,.09,0.9],[.84,.04,1.3],[.27,.11,0.7]
  ];
  for(var s=0;s<STAR_DATA.length;s++){
    var sy=STAR_DATA[s][1];
    var fade=Math.max(0,1-sy/0.40);
    var sa=fade*(0.55+Math.sin(now*0.0008+s*2.1)*0.30);
    if(sa<=0) continue;
    ctx.fillStyle=s%5===0?'#D0E0FF':s%8===0?'#FFE8B0':'#FFFFFF';
    ctx.globalAlpha=sa;
    ctx.beginPath(); ctx.arc(STAR_DATA[s][0]*cw, sy*hy, STAR_DATA[s][2], 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha=1;

  // ── CRESCENT MOON ──
  var moonX=cw*0.80, moonY=hy*0.20, moonR=Math.max(18,ch*0.045);
  ctx.save();
  ctx.shadowBlur=40; ctx.shadowColor='rgba(255,230,120,0.70)';
  ctx.fillStyle='#FDE87A';
  ctx.beginPath(); ctx.arc(moonX, moonY, moonR, 0, Math.PI*2); ctx.fill();
  ctx.globalCompositeOperation='destination-out';
  ctx.beginPath(); ctx.arc(moonX+moonR*0.60, moonY-moonR*0.08, moonR*0.80, 0, Math.PI*2); ctx.fill();
  ctx.globalCompositeOperation='source-over';
  ctx.shadowBlur=0; ctx.restore();

  // ── DRAMATIC EVENING CLOUDS ──
  var cScroll = DS.bgOff[3] * 0.048;
  var CLOUDS = [
    {bx:0.02,y:0.09,rx:260,ry:42,top:'rgba(255,180,60,0.55)',bot:'rgba(60,10,30,0.70)'},
    {bx:0.30,y:0.06,rx:320,ry:30,top:'rgba(255,150,40,0.45)',bot:'rgba(80,20,40,0.65)'},
    {bx:0.58,y:0.11,rx:280,ry:48,top:'rgba(255,200,80,0.50)',bot:'rgba(50,10,30,0.72)'},
    {bx:0.80,y:0.07,rx:240,ry:35,top:'rgba(255,170,50,0.42)',bot:'rgba(70,15,35,0.62)'},
    {bx:1.08,y:0.10,rx:260,ry:38,top:'rgba(255,160,45,0.48)',bot:'rgba(60,12,28,0.68)'},
    {bx:0.44,y:0.22,rx:360,ry:20,top:'rgba(200,120,30,0.30)',bot:'rgba(40,8,20,0.50)'}
  ];
  var clW = cw * 1.5;
  for(var c=0;c<CLOUDS.length;c++){
    var cl = CLOUDS[c];
    var ccx = ((cl.bx*clW - cScroll%clW)+clW)%clW;
    var ccy = cl.y * hy;
    ctx.save(); ctx.scale(1, cl.ry/cl.rx);
    var cg1=ctx.createRadialGradient(ccx,(ccy-cl.ry*0.5)*(cl.rx/cl.ry),0, ccx,ccy*(cl.rx/cl.ry),cl.rx);
    cg1.addColorStop(0,cl.top); cg1.addColorStop(0.6,'rgba(0,0,0,0)');
    ctx.fillStyle=cg1;
    ctx.beginPath(); ctx.arc(ccx,ccy*(cl.rx/cl.ry),cl.rx,0,Math.PI*2); ctx.fill();
    var cg2=ctx.createRadialGradient(ccx,ccy*(cl.rx/cl.ry),0, ccx,ccy*(cl.rx/cl.ry),cl.rx*0.82);
    cg2.addColorStop(0.4,cl.bot); cg2.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=cg2;
    ctx.beginPath(); ctx.arc(ccx,ccy*(cl.rx/cl.ry),cl.rx*0.82,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  // ── HORIZON SUN GLOW BURST ──
  var glow=ctx.createRadialGradient(cx,hy,0,cx,hy,cw*0.72);
  glow.addColorStop(0,'rgba(255,235,110,0.78)'); glow.addColorStop(0.14,'rgba(255,160,30,0.55)');
  glow.addColorStop(0.35,'rgba(220,70,10,0.28)'); glow.addColorStop(0.65,'rgba(130,20,40,0.10)');
  glow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=glow; ctx.fillRect(0,0,cw,hy);

  // ── UAE CITY SKYLINE SILHOUETTE ──
  var silScroll = DS.bgOff[3] * 0.035;
  var SKY=[
    [0.00,70,0.13,0],[0.05,40,0.20,1],[0.09,22,0.50,2],[0.14,65,0.15,0],
    [0.20,30,0.25,1],[0.24,80,0.18,0],[0.30,20,0.14,0],[0.33,55,0.35,3],
    [0.40,28,0.12,0],[0.43,18,0.44,2],[0.48,72,0.20,0],[0.54,35,0.28,1],
    [0.58,22,0.16,4],[0.62,60,0.22,0],[0.67,28,0.38,3],[0.73,18,0.12,0],
    [0.76,45,0.30,1],[0.81,20,0.48,2],[0.86,66,0.16,0],[0.91,32,0.24,1],
    [0.95,22,0.13,0],[0.98,50,0.19,0]
  ];
  var silW=cw*1.60;
  ctx.save();
  for(var si=0;si<SKY.length;si++){
    var sk=SKY[si];
    var bx=((sk[0]*silW-silScroll%silW)+silW)%silW;
    var bw=sk[1], bh=sk[2]*hy, by2=hy-bh;
    var silFg=ctx.createLinearGradient(0,by2,0,hy);
    silFg.addColorStop(0,'#1A2840');   // dark steel-blue at top
    silFg.addColorStop(0.55,'#251830'); // deep violet mid
    silFg.addColorStop(1,'#3A1808');   // warm amber-brown at base (horizon glow)
    ctx.fillStyle=silFg;
    if(sk[3]===2){
      ctx.beginPath();
      ctx.moveTo(bx+bw*0.50,by2-bh*0.22);
      ctx.lineTo(bx+bw*0.52,by2+bh*0.04); ctx.lineTo(bx+bw*0.65,by2+bh*0.28);
      ctx.lineTo(bx+bw*0.80,by2+bh*0.52); ctx.lineTo(bx+bw,hy);
      ctx.lineTo(bx,hy); ctx.lineTo(bx+bw*0.20,by2+bh*0.52);
      ctx.lineTo(bx+bw*0.35,by2+bh*0.28); ctx.lineTo(bx+bw*0.48,by2+bh*0.04);
      ctx.closePath(); ctx.fill();
    } else if(sk[3]===3){
      var tw=bw*0.44;
      ctx.beginPath(); ctx.moveTo(bx,hy); ctx.lineTo(bx+tw*0.1,by2); ctx.lineTo(bx+tw*0.9,by2); ctx.lineTo(bx+tw,hy); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(bx+bw*0.54,hy); ctx.lineTo(bx+bw*0.60,by2+bh*0.07); ctx.lineTo(bx+bw*0.94,by2+bh*0.07); ctx.lineTo(bx+bw,hy); ctx.closePath(); ctx.fill();
    } else if(sk[3]===4){
      ctx.beginPath(); ctx.arc(bx+bw*0.5,by2+bh*0.35,bw*0.5,Math.PI,0);
      ctx.lineTo(bx+bw,hy); ctx.lineTo(bx,hy); ctx.closePath(); ctx.fill();
      ctx.fillRect(bx-6,by2,8,bh); ctx.fillRect(bx+bw,by2,8,bh);
    } else if(sk[3]===1){
      ctx.beginPath(); ctx.moveTo(bx+bw*0.12,by2); ctx.lineTo(bx+bw*0.88,by2);
      ctx.lineTo(bx+bw,hy); ctx.lineTo(bx,hy); ctx.closePath(); ctx.fill();
    } else {
      ctx.fillRect(bx,by2,bw,bh+1);
    }
    var nw=Math.max(1,Math.floor(bw/9)),nf=Math.max(1,Math.floor(bh/11));
    var WC=['#FFE060','#FFAA30','#FFFFFF','#60D0FF'];
    for(var ww=0;ww<nw;ww++) for(var ff=0;ff<nf;ff++){
      if((si*9+ww*7+ff*5)%6!==0) continue;
      ctx.fillStyle=WC[(si+ww+ff)%4]; ctx.globalAlpha=0.72;
      ctx.fillRect(bx+ww*9+2,by2+ff*11+3,5,6);
    }
    ctx.globalAlpha=1;
  }
  ctx.restore();

  // ── ABU DHABI LANDMARKS — drawn in front of the generic skyline ──
  // Sheikh Zayed Grand Mosque, Etihad Towers, Aldar HQ, Capital Gate,
  // Louvre AD and Qasr Al Watan lead the city; scaled to horizon size.
  var AD_LANDMARKS = [
    { x:0.03, fn:dashBldSZGM,        sc:0.66 },
    { x:0.24, fn:dashBldEtihadTowers, sc:0.60 },
    { x:0.40, fn:dashBldAldarHQ,      sc:0.58 },
    { x:0.52, fn:dashBldCapitalGate,  sc:0.60 },
    { x:0.66, fn:dashBldLouvreAD,     sc:0.55 },
    { x:0.82, fn:dashBldQasrWatan,    sc:0.60 }
  ];
  ctx.save();
  for(var li2=0; li2<AD_LANDMARKS.length; li2++){
    var lm = AD_LANDMARKS[li2];
    var lx = ((lm.x*silW - silScroll%silW) + silW) % silW;
    if(lx > cw + 80) continue; // off-screen right (allow slight overhang)
    lm.fn(ctx, lx, hy, ch * lm.sc);
  }
  ctx.restore();

  // Warm band at horizon over skyline
  var hband=ctx.createLinearGradient(0,hy*0.58,0,hy);
  hband.addColorStop(0,'rgba(0,0,0,0)');
  hband.addColorStop(0.5,'rgba(255,140,20,0.22)');
  hband.addColorStop(0.85,'rgba(255,200,60,0.42)');
  hband.addColorStop(1,'rgba(255,220,80,0.60)');
  ctx.fillStyle=hband; ctx.fillRect(0,hy*0.58,cw,hy*0.42);

  // ── DESERT DUNES — flanking the sides only ──
  ctx.save();
  var dOff=DS.bgOff[3]*0.07;
  var dlg=ctx.createLinearGradient(0,hy*0.72,0,hy);
  dlg.addColorStop(0,'#6A3008'); dlg.addColorStop(0.5,'#9A5820'); dlg.addColorStop(1,'#C88040');
  ctx.fillStyle=dlg; ctx.globalAlpha=0.96;
  var d0=((dOff*0.5)%(cw*0.5));
  ctx.beginPath(); ctx.moveTo(-5,hy);
  ctx.bezierCurveTo(cw*0.04-d0*0.02,hy, cw*0.08,hy*0.82, cw*0.18,hy*0.84);
  ctx.bezierCurveTo(cw*0.26,hy*0.85, cw*0.30,hy*0.82, cw*0.36,hy*0.86);
  ctx.lineTo(cw*0.36,hy); ctx.closePath(); ctx.fill();
  var d1=((dOff*0.5+cw*0.3)%(cw*0.5));
  ctx.beginPath(); ctx.moveTo(cw+5,hy);
  ctx.bezierCurveTo(cw*0.96+d1*0.02,hy, cw*0.92,hy*0.84, cw*0.82,hy*0.85);
  ctx.bezierCurveTo(cw*0.74,hy*0.86, cw*0.70,hy*0.83, cw*0.64,hy*0.87);
  ctx.lineTo(cw*0.64,hy); ctx.closePath(); ctx.fill();
  var dlg2=ctx.createLinearGradient(0,hy*0.86,0,hy);
  dlg2.addColorStop(0,'#C08840'); dlg2.addColorStop(1,'#E0B060');
  ctx.fillStyle=dlg2; ctx.globalAlpha=0.80;
  var d2=((dOff*0.75)%(cw*0.6));
  ctx.beginPath(); ctx.moveTo(-5,hy);
  ctx.bezierCurveTo(cw*0.05,hy, cw*0.10,hy*0.91, cw*0.20,hy*0.92);
  ctx.bezierCurveTo(cw*0.28,hy*0.93, cw*0.32,hy*0.90, cw*0.38,hy*0.94);
  ctx.lineTo(cw*0.38,hy); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cw+5,hy);
  ctx.bezierCurveTo(cw*0.95,hy, cw*0.90,hy*0.92, cw*0.80,hy*0.93);
  ctx.bezierCurveTo(cw*0.72,hy*0.94, cw*0.68,hy*0.91, cw*0.62,hy*0.95);
  ctx.lineTo(cw*0.62,hy); ctx.closePath(); ctx.fill();
  ctx.globalAlpha=1; ctx.restore();

  // ── GROUND — warm sandy desert ──
  var grnd=ctx.createLinearGradient(0,hy,0,ch);
  grnd.addColorStop(0,'#C88030'); grnd.addColorStop(0.3,'#A06020');
  grnd.addColorStop(0.7,'#7A4010'); grnd.addColorStop(1,'#5A2C08');
  ctx.fillStyle=grnd; ctx.fillRect(0,hy,cw,ch-hy);
  var ghaze=ctx.createLinearGradient(0,hy,0,hy+(ch-hy)*0.45);
  ghaze.addColorStop(0,'rgba(255,190,60,0.42)'); ghaze.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=ghaze; ctx.fillRect(0,hy,cw,(ch-hy)*0.45);

  // ── DISTANT CAMELS — silhouetted at horizon ──
  dashDrawCamels(ctx, cw, hy, now);

  // ── FALCON — soaring across the sky ──
  dashDrawFalcon(ctx, cw, hy, now);
}

function dashDrawCamels(ctx, cw, hy, now){
  // Two camels, slowly drifting right across the far desert
  var CAMELS = [
    {baseX: 0.18, speed: 0.000018, size: 1.0, yFrac: 0.96},
    {baseX: 0.26, speed: 0.000012, size: 0.75, yFrac: 0.97},
  ];
  ctx.save();
  ctx.fillStyle = '#3A1A08';  // warm dark silhouette
  for(var ci=0; ci<CAMELS.length; ci++){
    var cm = CAMELS[ci];
    var cx2 = ((cm.baseX + now * cm.speed) % 1.0) * cw;
    var cy2 = hy * cm.yFrac;
    var s = cm.size * (hy * 0.07);  // size relative to horizon height
    drawCamelSilhouette(ctx, cx2, cy2, s);
  }
  ctx.restore();
}

function drawCamelSilhouette(ctx, x, y, s){
  // Simple camel shape: body, neck, head, legs, hump
  ctx.beginPath();
  // Body
  ctx.ellipse(x, y - s*0.55, s*0.9, s*0.38, 0, 0, Math.PI*2);
  ctx.fill();
  // Hump
  ctx.beginPath();
  ctx.ellipse(x + s*0.2, y - s*0.88, s*0.32, s*0.28, -0.2, 0, Math.PI*2);
  ctx.fill();
  // Neck
  ctx.beginPath();
  ctx.moveTo(x - s*0.5, y - s*0.70);
  ctx.lineTo(x - s*0.62, y - s*1.10);
  ctx.lineTo(x - s*0.50, y - s*1.10);
  ctx.lineTo(x - s*0.38, y - s*0.68);
  ctx.closePath(); ctx.fill();
  // Head
  ctx.beginPath();
  ctx.ellipse(x - s*0.62, y - s*1.20, s*0.18, s*0.13, 0.3, 0, Math.PI*2);
  ctx.fill();
  // Legs (4 thin rectangles)
  var legX = [x-s*0.55, x-s*0.25, x+s*0.18, x+s*0.52];
  for(var li=0; li<4; li++){
    ctx.fillRect(legX[li] - s*0.06, y - s*0.20, s*0.10, s*0.22);
  }
}

function dashDrawFalcon(ctx, cw, hy, now){
  // Falcon glides slowly across upper sky, banking gently
  var t = now * 0.00022;
  var fx = ((t * 0.18) % 1.4 - 0.2) * cw;   // drifts L→R across screen
  var fy = hy * (0.18 + Math.sin(t * 0.7) * 0.06);  // gentle up-down sway
  var bank = Math.sin(t * 0.5) * 0.25;       // wing tilt angle
  var s = cw * 0.028;                          // size scales with canvas

  ctx.save();
  ctx.translate(fx, fy);
  ctx.rotate(bank);
  ctx.fillStyle = 'rgba(25,15,5,0.82)';

  // Body — slim teardrop
  ctx.beginPath();
  ctx.ellipse(0, 0, s*0.9, s*0.22, 0, 0, Math.PI*2);
  ctx.fill();

  // Wings — two swept arcs
  // Left wing
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-s*0.4, -s*0.15, -s*1.1, s*0.05, -s*1.3, s*0.18);
  ctx.bezierCurveTo(-s*1.0, s*0.22, -s*0.35, s*0.25, 0, s*0.10);
  ctx.closePath(); ctx.fill();
  // Right wing
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(s*0.4, -s*0.15, s*1.1, s*0.05, s*1.3, s*0.18);
  ctx.bezierCurveTo(s*1.0, s*0.22, s*0.35, s*0.25, 0, s*0.10);
  ctx.closePath(); ctx.fill();

  // Tail — small fan
  ctx.beginPath();
  ctx.moveTo(s*0.6, s*0.05);
  ctx.lineTo(s*1.0, -s*0.08);
  ctx.lineTo(s*1.05, s*0.12);
  ctx.lineTo(s*0.72, s*0.18);
  ctx.closePath(); ctx.fill();

  // Head — tiny circle
  ctx.beginPath();
  ctx.arc(-s*0.80, -s*0.05, s*0.14, 0, Math.PI*2);
  ctx.fill();

  ctx.restore();
}

// dashDrawMosque kept for potential standalone use
function dashDrawMosque(ctx, baseX, baseY, scale){ dashBldSZGM(ctx, baseX, baseY, scale/0.26/3.5); }

function dashRenderRoad(ctx, cw, ch){
  var hy = DS.horizonY, cx = DS.cx;

  // OutRun-style wide road
  var ls = cw * 0.46;   // half-width at bottom — road fills ~92% of canvas
  var ts = 32;          // half-width at horizon vanishing point
  var roadEdgeWX = ls / DS.laneSpread; // world X of road edge (~1.77)

  function hw(y){ return ts + (ls-ts)*((y-hy)/(ch-hy)); }

  // ── SAND VERGE fills the full ground area behind road ──
  var vg = ctx.createLinearGradient(0, hy, 0, ch);
  vg.addColorStop(0,   '#C88030');
  vg.addColorStop(0.3, '#B06820');
  vg.addColorStop(0.7, '#885010');
  vg.addColorStop(1,   '#603808');
  ctx.fillStyle = vg;
  ctx.fillRect(0, hy, cw, ch-hy);

  // ── ASPHALT — warm desert highway grey ──
  ctx.beginPath();
  ctx.moveTo(cx-ts, hy); ctx.lineTo(cx+ts, hy);
  ctx.lineTo(cx+ls, ch); ctx.lineTo(cx-ls, ch);
  ctx.closePath();
  var rg = ctx.createLinearGradient(0, hy, 0, ch);
  rg.addColorStop(0,    '#706050');
  rg.addColorStop(0.25, '#5C4E40');
  rg.addColorStop(0.60, '#4A3C30');
  rg.addColorStop(1,    '#382E24');
  ctx.fillStyle = rg; ctx.fill();

  // Centre highlight (sun reflection streak down the middle)
  var sg = ctx.createLinearGradient(0, hy, 0, ch);
  sg.addColorStop(0,   'rgba(255,200,100,0.0)');
  sg.addColorStop(0.3, 'rgba(255,180,60,0.14)');
  sg.addColorStop(0.7, 'rgba(200,130,30,0.20)');
  sg.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(cx-ts*0.5,hy); ctx.lineTo(cx+ts*0.5,hy);
  ctx.lineTo(cx+ls*0.38,ch); ctx.lineTo(cx-ls*0.38,ch);
  ctx.closePath(); ctx.fill();

  // ── OutRun KERB STRIPES — animated red/white at road edges ──
  var KP = 50;  // world units per full stripe cycle
  var kOff = DS.bgOff[3] % (KP*2);
  for(var ki=0; ki<22; ki++){
    var kz1 = ki*KP - kOff;
    var kz2 = kz1 + KP;
    if(kz2 < 0 || kz1 > 500) continue;
    var kp1 = dashProject(0, Math.max(0.5,kz1));
    var kp2 = dashProject(0, Math.max(0.5,kz2));
    if(kp2.y < hy || kp1.y > ch) continue;
    var krw1 = Math.max(2, hw(kp1.y)*0.07);  // kerb width = 7% of road half-width
    var krw2 = Math.max(2, hw(kp2.y)*0.07);
    var kCol = ki%2===0 ? '#CC1A10' : '#F4F4F4';  // UAE red / white
    ctx.fillStyle = kCol;
    // Left kerb quad
    ctx.beginPath();
    ctx.moveTo(cx - hw(kp1.y),          kp1.y);
    ctx.lineTo(cx - hw(kp1.y) + krw1,   kp1.y);
    ctx.lineTo(cx - hw(kp2.y) + krw2,   kp2.y);
    ctx.lineTo(cx - hw(kp2.y),          kp2.y);
    ctx.closePath(); ctx.fill();
    // Right kerb quad (mirrored)
    ctx.beginPath();
    ctx.moveTo(cx + hw(kp1.y),          kp1.y);
    ctx.lineTo(cx + hw(kp1.y) - krw1,   kp1.y);
    ctx.lineTo(cx + hw(kp2.y) - krw2,   kp2.y);
    ctx.lineTo(cx + hw(kp2.y),          kp2.y);
    ctx.closePath(); ctx.fill();
  }

  // ── LANE DASHES — 2 lanes (3 lines: left, centre, right) ──
  var DIV = [-0.62, 0, 0.62];
  var dlLen = 50, dlGap = 38, dlPer = dlLen + dlGap;
  var dOff2 = dlPer - (DS.bgOff[3] % dlPer);
  for(var di=0; di<DIV.length; di++){
    for(var d=0; d<16; d++){
      var dz1 = dOff2 + d*dlPer;
      var dz2 = dz1 + dlLen;
      var dp1 = dashProject(DIV[di], dz1);
      var dp2 = dashProject(DIV[di], dz2);
      if(dp2.y < hy || dp1.y > ch) continue;
      var lw1 = Math.max(1.5, dp1.scale*8), lw2 = Math.max(1.5, dp2.scale*8);
      ctx.fillStyle = 'rgba(255,255,255,0.80)';
      ctx.beginPath();
      ctx.moveTo(dp1.x-lw1/2, dp1.y); ctx.lineTo(dp1.x+lw1/2, dp1.y);
      ctx.lineTo(dp2.x+lw2/2, dp2.y); ctx.lineTo(dp2.x-lw2/2, dp2.y);
      ctx.closePath(); ctx.fill();
    }
  }

  // ── SOLID EDGE LINES ──
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.lineWidth = 4; ctx.lineCap='butt';
  ctx.beginPath(); ctx.moveTo(cx-ts,hy); ctx.lineTo(cx-ls,ch); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+ts,hy); ctx.lineTo(cx+ls,ch); ctx.stroke();
  ctx.restore();

  // ── ATMOSPHERIC HAZE near horizon ──
  var haze = ctx.createLinearGradient(0,hy,0,hy+(ch-hy)*0.35);
  haze.addColorStop(0,'rgba(220,150,60,0.45)');
  haze.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=haze;
  ctx.beginPath();
  ctx.moveTo(cx-ts,hy); ctx.lineTo(cx+ts,hy);
  ctx.lineTo(cx+ls,ch); ctx.lineTo(cx-ls,ch);
  ctx.closePath(); ctx.fill();
}

function dashDrawPalm3D(ctx, x, y, h, sc){
  if(h < 10) return;
  // Cap height so palms don't overflow above sky
  h = Math.min(h, y - DS.horizonY * 0.15);
  if(h < 10) return;

  ctx.save();
  ctx.globalAlpha = Math.min(0.92, 0.5 + sc * 0.6);

  var tw = Math.max(2.5, h * 0.07);
  // Crown top position (trunk leans slightly)
  var topX = x + h * 0.06;
  var topY = y - h;

  // ── TRUNK ── tapered rectangle with slight curve
  ctx.beginPath();
  ctx.moveTo(x - tw * 0.8, y);           // base left
  ctx.lineTo(x + tw * 0.8, y);           // base right
  ctx.lineTo(topX + tw * 0.4, topY);     // top right
  ctx.lineTo(topX - tw * 0.4, topY);     // top left
  ctx.closePath();
  var tg = ctx.createLinearGradient(x - tw, 0, x + tw, 0);
  tg.addColorStop(0, '#1A0E06');
  tg.addColorStop(0.45, '#2E1A0A');
  tg.addColorStop(1, '#120A04');
  ctx.fillStyle = tg;
  ctx.fill();
  // Trunk ring marks
  ctx.strokeStyle = 'rgba(80,40,10,0.45)';
  ctx.lineWidth = Math.max(0.5, tw * 0.3);
  for(var r = 1; r < 6; r++){
    var ry = y - h * (r / 6);
    var rx = x + (topX - x) * (r / 6);
    var rw = tw * (1 - r * 0.12);
    ctx.beginPath();
    ctx.moveTo(rx - rw, ry);
    ctx.lineTo(rx + rw, ry);
    ctx.stroke();
  }

  // ── DATE PALM FRONDS ── arc upward then droop at tips
  // Date palm fronds: go up-and-out from crown, curve downward at end
  var frondDefs = [
    { ax:-0.85, ay:-0.18, tipX:-1.10, tipY: 0.40 },  // far left drooping
    { ax:-0.65, ay:-0.55, tipX:-0.90, tipY: 0.05 },  // left-mid
    { ax:-0.35, ay:-0.85, tipX:-0.50, tipY:-0.30 },  // upper-left
    { ax: 0.00, ay:-1.00, tipX: 0.00, tipY:-0.50 },  // straight up
    { ax: 0.35, ay:-0.85, tipX: 0.50, tipY:-0.30 },  // upper-right
    { ax: 0.65, ay:-0.55, tipX: 0.90, tipY: 0.05 },  // right-mid
    { ax: 0.85, ay:-0.18, tipX: 1.10, tipY: 0.40 }   // far right drooping
  ];

  var fl = h * 0.70; // frond length scale
  var fw = Math.max(1.5, h * 0.055); // frond width at base

  for(var f = 0; f < frondDefs.length; f++){
    var fd = frondDefs[f];
    // Arch midpoint (peak of the arc)
    var mx = topX + fd.ax * fl * 0.45;
    var my = topY + fd.ay * fl * 0.55;
    // Tip (droops down)
    var ex = topX + fd.tipX * fl * 0.72;
    var ey = topY + fd.tipY * fl * 0.65 + fl * 0.35; // tips droop down

    // Direction perpendicular for leaf width
    var dx = ex - topX, dy = ey - topY;
    var dl = Math.sqrt(dx*dx+dy*dy) || 1;
    var nx = -dy/dl, ny = dx/dl;

    var w0 = fw * 0.5;    // width at base
    var w1 = fw;          // width at mid (widest)
    var w2 = 0;           // tip (pointed)

    ctx.beginPath();
    // Upper edge: base → mid → tip
    ctx.moveTo(topX + nx*w0, topY + ny*w0);
    ctx.quadraticCurveTo(mx + nx*w1, my + ny*w1, ex, ey);
    // Lower edge: tip → mid → base
    ctx.quadraticCurveTo(mx - nx*w1, my - ny*w1, topX - nx*w0, topY - ny*w0);
    ctx.closePath();

    var lg = ctx.createLinearGradient(topX, topY, ex, ey);
    lg.addColorStop(0, '#1A6020');
    lg.addColorStop(0.4, '#2E8A30');
    lg.addColorStop(1, '#4CAF50');
    ctx.fillStyle = lg;
    ctx.fill();

    // Center midrib
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(mx, my, ex, ey);
    ctx.strokeStyle = 'rgba(20,120,20,0.65)';
    ctx.lineWidth = Math.max(0.5, fw * 0.28);
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // ── DATES cluster at crown ──
  if(h > 30){
    ctx.fillStyle = '#D4861A';
    var cr = Math.max(1.5, h * 0.048);
    var datePos = [[-cr*1.4, cr*0.6],[0, cr*0.9],[cr*1.3, cr*0.5],[cr*0.6,-cr*0.2],[-cr*0.5,-cr*0.1]];
    for(var dp = 0; dp < datePos.length; dp++){
      ctx.beginPath();
      ctx.arc(topX + datePos[dp][0], topY + datePos[dp][1] + cr, cr, 0, Math.PI*2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function dashRenderItems(ctx, cw, ch){
  // Sort items back-to-front so near items draw on top
  var sorted = DS.items.slice().sort(function(a,b){ return b.worldZ - a.worldZ; });
  for(var i=0;i<sorted.length;i++){
    var item = sorted[i];
    var p = dashProject(item.worldX, item.worldZ);
    if(p.y < DS.horizonY || p.y > ch + 40) continue;
    if(item.type === 'barrier'){ dashDrawBarrier(ctx, p); continue; }
    if(item.type === 'star'){ dashDrawStar(ctx, p); continue; }
    var r = Math.max(10, 54 * p.scale);
    // Depth fade — far items remain visible
    var depthAlpha = Math.min(1, 0.5 + p.scale * 0.6);
    // Ground shadow
    ctx.save();
    ctx.globalAlpha = 0.28 * p.scale;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + r*0.6, r*0.9, r*0.22, 0, 0, Math.PI*2);
    ctx.fillStyle = '#000'; ctx.fill();
    ctx.restore();
    // Bright outer glow ring
    ctx.save();
    ctx.globalAlpha = 0.55 * depthAlpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r*1.6, 0, Math.PI*2);
    var glowCol = item.type==='junk' ? '#FF1744' : item.color;
    var glowGrad = ctx.createRadialGradient(p.x, p.y, r*0.5, p.x, p.y, r*1.6);
    glowGrad.addColorStop(0, glowCol);
    glowGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glowGrad;
    ctx.fill();
    ctx.restore();
    // Main ball with radial gradient
    var baseCol = item.type==='junk' ? '#D50000' : item.color;
    var cg = ctx.createRadialGradient(p.x - r*0.35, p.y - r*0.35, 0, p.x, p.y, r);
    cg.addColorStop(0, '#FFFFFF');
    cg.addColorStop(0.25, baseCol);
    cg.addColorStop(1, darkenColor(baseCol, 0.5));
    ctx.save();
    ctx.globalAlpha = depthAlpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI*2);
    ctx.fillStyle = cg; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = Math.max(2, p.scale * 4);
    ctx.stroke();
    ctx.restore();
    // Emoji — bigger and centered
    ctx.save();
    ctx.globalAlpha = depthAlpha;
    ctx.font = 'bold ' + Math.max(14, Math.round(r * 1.15)) + 'px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(item.emoji, p.x, p.y);
    ctx.restore();
    // Junk skull / X
    if(item.type === 'junk'){
      ctx.save();
      ctx.strokeStyle = 'rgba(255,80,80,0.85)';
      ctx.lineWidth = Math.max(1.5, p.scale * 3);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p.x - r*0.42, p.y - r*0.9);
      ctx.lineTo(p.x + r*0.42, p.y - r*0.1);
      ctx.moveTo(p.x + r*0.42, p.y - r*0.9);
      ctx.lineTo(p.x - r*0.42, p.y - r*0.1);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function dashDrawBarrier(ctx, p){
  // Traffic cone / desert barrier — orange + white stripes
  var s = p.scale;
  var x = p.x, y = p.y;
  var coneH = Math.max(10, s * 68);
  var coneW = Math.max(6,  s * 34);

  // Shadow
  ctx.save();
  ctx.globalAlpha = 0.28 * s;
  ctx.beginPath();
  ctx.ellipse(x, y + 2, coneW * 0.65, coneH * 0.08, 0, 0, Math.PI*2);
  ctx.fillStyle = '#000'; ctx.fill();
  ctx.restore();

  // Base plate
  ctx.fillStyle = '#222';
  ctx.fillRect(x - coneW*0.60, y - coneH*0.10, coneW*1.20, coneH*0.10);

  // Cone body — 3 alternating orange/white bands
  var bands = [
    {col:'#E65100', h:0.42},
    {col:'#FFFFFF', h:0.16},
    {col:'#E65100', h:0.26},
    {col:'#FFFFFF', h:0.16},
  ];
  var curY = y;
  for(var bi=0; bi<bands.length; bi++){
    var bh = coneH * bands[bi].h;
    var frac = (curY - (y - coneH)) / coneH;
    var w1 = coneW * (1 - frac);
    var w0 = coneW * (1 - (frac + bands[bi].h));
    ctx.fillStyle = bands[bi].col;
    ctx.beginPath();
    ctx.moveTo(x - w1*0.5, curY);
    ctx.lineTo(x + w1*0.5, curY);
    ctx.lineTo(x + w0*0.5, curY - bh);
    ctx.lineTo(x - w0*0.5, curY - bh);
    ctx.closePath(); ctx.fill();
    curY -= bh;
  }
  // Tip
  ctx.fillStyle = '#E65100';
  ctx.beginPath();
  ctx.moveTo(x - coneW*0.05, curY);
  ctx.lineTo(x + coneW*0.05, curY);
  ctx.lineTo(x, curY - coneH*0.05);
  ctx.closePath(); ctx.fill();
}

function dashDrawStar(ctx, p){
  var x = p.x, y = p.y, s = Math.max(8, p.scale * 38);
  var now = Date.now();
  // Pulsing glow
  var pulse = 0.7 + Math.sin(now * 0.008) * 0.3;
  ctx.save();
  ctx.globalAlpha = 0.45 * pulse * p.scale;
  ctx.beginPath(); ctx.arc(x, y, s * 1.6, 0, Math.PI*2);
  ctx.fillStyle = '#FFD700'; ctx.fill();
  ctx.globalAlpha = 1;
  // 5-point star shape
  ctx.translate(x, y);
  ctx.rotate(now * 0.002);
  ctx.beginPath();
  for(var i=0;i<10;i++){
    var r2 = i%2===0 ? s : s*0.42;
    var a = (i/10)*Math.PI*2 - Math.PI/2;
    if(i===0) ctx.moveTo(Math.cos(a)*r2, Math.sin(a)*r2);
    else ctx.lineTo(Math.cos(a)*r2, Math.sin(a)*r2);
  }
  ctx.closePath();
  ctx.fillStyle = '#FFE500'; ctx.fill();
  ctx.strokeStyle = '#FFF176'; ctx.lineWidth = Math.max(1, p.scale*2); ctx.stroke();
  ctx.restore();
}

function darkenColor(hex, factor){
  if(!hex||hex[0]!=='#') return hex;
  var r = parseInt(hex.slice(1,3),16);
  var g = parseInt(hex.slice(3,5),16);
  var b = parseInt(hex.slice(5,7),16);
  return 'rgb('+Math.floor(r*factor)+','+Math.floor(g*factor)+','+Math.floor(b*factor)+')';
}

function dashRenderChar(ctx, cw, ch){
  var S = DS;
  // Character sits at bottom center, X shifts by lane
  var cx = S.cx + S.playerWorldX * S.laneSpread;
  var cy = S.playerY + S.charBob;
  // Invincibility — golden star aura + flicker
  if(S.invincible > 0){
    var at = Date.now()*0.007;
    var aRadius = 58 + Math.sin(at*4)*9;
    var auraCy = cy - Math.round(ch * 0.24) * 0.50; // center of character body
    var aura = ctx.createRadialGradient(cx, auraCy, 6, cx, auraCy, aRadius);
    aura.addColorStop(0, 'rgba(255,220,30,0.55)');
    aura.addColorStop(0.55, 'rgba(255,180,0,0.22)');
    aura.addColorStop(1, 'rgba(255,180,0,0)');
    ctx.save();
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(cx, auraCy, aRadius, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
    if(Math.floor(S.invincible/5)%2 === 0){ return; }
  }
  // Ground shadow — feet land at cy (image shifted so feet=cy)
  ctx.save();
  var spd = Math.min(1, (S.speed||0) / 400);
  var shadowW = 32 + spd * 14;
  var shadowH = 9 + spd * 3;
  var shadowOffX = spd * 10;
  ctx.globalAlpha = 0.42;
  ctx.beginPath();
  ctx.ellipse(cx + shadowOffX, cy + 5, shadowW, shadowH, 0, 0, Math.PI*2);
  ctx.fillStyle = '#1A0A00';
  ctx.fill();
  ctx.restore();
  // Shield glow
  if(S.abilActive && DASH_CHARS_DEF[DASH_CHAR] && DASH_CHARS_DEF[DASH_CHAR].ability === 'shield'){
    ctx.save(); ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.arc(cx, cy, 65, 0, Math.PI*2);
    ctx.fillStyle = '#42A5F5'; ctx.fill(); ctx.restore();
  }
  // Magnet glow ring
  if(S.abilActive && DASH_CHARS_DEF[DASH_CHAR] && DASH_CHARS_DEF[DASH_CHAR].ability === 'magnet'){
    ctx.save(); ctx.globalAlpha = 0.22;
    ctx.beginPath(); ctx.arc(cx, cy, 80, 0, Math.PI*2);
    ctx.fillStyle = '#FFB300'; ctx.fill(); ctx.restore();
  }
  var useChar2 = (DASH_CHAR === 'zayed');
  var spriteList = useChar2 ? CHAR2_RUN_SPRITES : CHAR_RUN_SPRITES;
  var spritesReady = useChar2 ? CHAR2_SPRITES_LOADED : CHAR_SPRITES_LOADED;
  if(spritesReady && spriteList[S.charFrame] && spriteList[S.charFrame].complete){
    var spr = spriteList[S.charFrame];
    var dh = Math.round(ch * 0.24);
    var dw = Math.round(dh * spr.naturalWidth / spr.naturalHeight);
    var imgTop = cy - dh * 0.88;
    ctx.drawImage(spr, cx - dw/2, imgTop, dw, dh);
  } else {
    dashDrawCharacter(ctx, cx, cy, DASH_CHAR, S.charFrame % 4, S, 1.55);
  }
}

function dashDrawCharacter(ctx, cx, cy, charId, frame, S, scale){
  // ── BACK VIEW — player runs away from camera like Subway Surfers ──
  var isGirl = charId === 'sehhi';
  var s = scale || 1.0;
  var cyc = frame % 4;
  // Running leg cycle (back view: legs kick behind)
  var lLeg = [ 0.50,  0.15, -0.42, -0.12][cyc];
  var rLeg = [-0.42, -0.12,  0.50,  0.15][cyc];
  var lArm = [-0.50, -0.15,  0.48,  0.14][cyc];
  var rArm = [ 0.48,  0.14, -0.50, -0.15][cyc];
  var bobY = [0, -2.5, 0, 2.5][cyc];

  ctx.save();
  ctx.translate(cx, cy + bobY * s);
  ctx.scale(s, s);

  // ── SHADOW ──
  ctx.save(); ctx.globalAlpha = 0.30;
  var sg = ctx.createRadialGradient(0,40,0, 0,40,24);
  sg.addColorStop(0,'rgba(0,0,0,0.7)'); sg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=sg; ctx.beginPath(); ctx.ellipse(0,40,24,7,0,0,Math.PI*2); ctx.fill();
  ctx.restore();

  // ── helper: rounded-rect limb with 3D gradient ──
  function limb3d(lx,ly,lw,lh,ang,col,hiCol,shCol){
    ctx.save(); ctx.translate(lx,ly); ctx.rotate(ang);
    var g=ctx.createLinearGradient(-lw,0,lw,0);
    g.addColorStop(0,shCol); g.addColorStop(0.3,hiCol); g.addColorStop(0.7,col); g.addColorStop(1,shCol);
    ctx.fillStyle=g;
    var r=lw*0.5;
    ctx.beginPath(); ctx.moveTo(-lw+r,0); ctx.arcTo(lw,0,lw,lh,r); ctx.arcTo(lw,lh,-lw,lh,r); ctx.arcTo(-lw,lh,-lw,0,r); ctx.arcTo(-lw,0,lw,0,r); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  if(isGirl){
    // ── SEHHI — BACK VIEW ──
    var pk='#F50057', dpk='#880E4F', mpk='#C2185B', lpk='#FF80AB';
    var skin='#FDBCB4';

    // LEGS (dark leggings visible below abaya hem)
    limb3d(-9, 20, 5, 24, lLeg, mpk, lpk, dpk);
    // L shoe
    ctx.save(); ctx.translate(-9+Math.sin(lLeg)*24, 20+Math.cos(lLeg)*24);
    var shg=ctx.createLinearGradient(-8,0,8,8); shg.addColorStop(0,'#2E1A3A'); shg.addColorStop(1,'#0A0010');
    ctx.fillStyle=shg; ctx.beginPath(); ctx.ellipse(lLeg*7,6,9,5,lLeg*0.2,0,Math.PI*2); ctx.fill();
    ctx.restore();
    limb3d(9, 20, 5, 24, rLeg, mpk, lpk, dpk);
    // R shoe
    ctx.save(); ctx.translate(9+Math.sin(rLeg)*24, 20+Math.cos(rLeg)*24);
    ctx.fillStyle=shg; ctx.beginPath(); ctx.ellipse(rLeg*7,6,9,5,rLeg*0.2,0,Math.PI*2); ctx.fill();
    ctx.restore();

    // ABAYA BACK — flowing robe, wider at bottom
    var abg=ctx.createLinearGradient(-15,-14,15,24);
    abg.addColorStop(0,lpk); abg.addColorStop(0.35,pk); abg.addColorStop(1,dpk);
    ctx.fillStyle=abg;
    ctx.beginPath();
    ctx.moveTo(-16,24);
    ctx.bezierCurveTo(-18,15, -13,-10, -11,-14);
    ctx.bezierCurveTo(-6,-18, 6,-18, 11,-14);
    ctx.bezierCurveTo(13,-10, 18,15, 16,24);
    ctx.closePath(); ctx.fill();
    // Back highlight streak
    var bkhl=ctx.createLinearGradient(0,-14,0,24);
    bkhl.addColorStop(0,'rgba(255,255,255,0.35)'); bkhl.addColorStop(0.5,'rgba(255,255,255,0.10)'); bkhl.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=bkhl; ctx.beginPath(); ctx.ellipse(0,5,4,16,0,0,Math.PI*2); ctx.fill();
    // Fabric fold lines (vertical curves on back)
    ctx.strokeStyle='rgba(136,14,79,0.30)'; ctx.lineWidth=1; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(-7,-10); ctx.bezierCurveTo(-9,0,-11,12,-13,22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(7,-10); ctx.bezierCurveTo(9,0,11,12,13,22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,-14); ctx.lineTo(0,24); ctx.stroke();

    // ARMS (pink sleeves, swinging)
    limb3d(-16,-6, 5, 22, lArm, mpk, lpk, dpk);
    limb3d(16,-6, 5, 22, rArm, mpk, lpk, dpk);
    // Hands (skin-coloured, peeking out of sleeves)
    ctx.fillStyle=skin;
    ctx.save(); ctx.translate(-16+Math.sin(lArm)*22, -6+Math.cos(lArm)*22);
    ctx.beginPath(); ctx.ellipse(0,0,5,5.5,lArm*0.3,0,Math.PI*2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(16+Math.sin(rArm)*22, -6+Math.cos(rArm)*22);
    ctx.beginPath(); ctx.ellipse(0,0,5,5.5,rArm*0.3,0,Math.PI*2); ctx.fill(); ctx.restore();

    // HEAD + HIJAB (back view — dome of headscarf visible)
    // Hijab dome (sphere from back — light source from top-left)
    var hjg=ctx.createRadialGradient(-5,-34,3, 0,-28,20);
    hjg.addColorStop(0,lpk); hjg.addColorStop(0.45,pk); hjg.addColorStop(1,dpk);
    ctx.fillStyle=hjg; ctx.beginPath(); ctx.arc(0,-28,19,0,Math.PI*2); ctx.fill();
    // Hijab back drape (fabric falls down nape of neck)
    var hdg=ctx.createLinearGradient(0,-18,0,-5);
    hdg.addColorStop(0,mpk); hdg.addColorStop(1,dpk);
    ctx.fillStyle=hdg;
    ctx.beginPath(); ctx.moveTo(-14,-20); ctx.bezierCurveTo(-16,-14,-14,-8,-10,-6); ctx.lineTo(10,-6); ctx.bezierCurveTo(14,-8,16,-14,14,-20); ctx.closePath(); ctx.fill();
    // Hijab edge rim (bright pink trim at forehead-line, seen from back = back of head arch)
    ctx.strokeStyle=lpk; ctx.lineWidth=2.2; ctx.lineCap='round';
    ctx.beginPath(); ctx.arc(0,-28,18.5,Math.PI*0.1,Math.PI*0.9); ctx.stroke();

  } else {
    // ── ZAYED — BACK VIEW ──
    var wh='#F8F8F8', lwh='#FFFFFF', dwh='#B0BEC5', mwh='#E0E6EA';
    var skin2='#FDBCB4';

    // LEGS (trousers under kandura)
    limb3d(-9, 20, 5, 26, lLeg, '#B0BEC5', '#E0E6EA', '#78909C');
    // L shoe
    ctx.save(); ctx.translate(-9+Math.sin(lLeg)*26, 20+Math.cos(lLeg)*26);
    var shg2=ctx.createLinearGradient(-9,0,9,9); shg2.addColorStop(0,'#3E3E3E'); shg2.addColorStop(1,'#111');
    ctx.fillStyle=shg2; ctx.beginPath(); ctx.ellipse(lLeg*7,6,10,5,lLeg*0.2,0,Math.PI*2); ctx.fill();
    ctx.restore();
    limb3d(9, 20, 5, 26, rLeg, '#B0BEC5', '#E0E6EA', '#78909C');
    ctx.save(); ctx.translate(9+Math.sin(rLeg)*26, 20+Math.cos(rLeg)*26);
    ctx.fillStyle=shg2; ctx.beginPath(); ctx.ellipse(rLeg*7,6,10,5,rLeg*0.2,0,Math.PI*2); ctx.fill();
    ctx.restore();

    // KANDURA BACK — white robe flowing
    var kbg=ctx.createLinearGradient(-15,-14,15,26);
    kbg.addColorStop(0,lwh); kbg.addColorStop(0.4,wh); kbg.addColorStop(1,dwh);
    ctx.fillStyle=kbg;
    ctx.beginPath();
    ctx.moveTo(-17,26);
    ctx.bezierCurveTo(-19,16,-14,-10,-12,-14);
    ctx.bezierCurveTo(-6,-18, 6,-18, 12,-14);
    ctx.bezierCurveTo(14,-10, 19,16, 17,26);
    ctx.closePath(); ctx.fill();
    // Back highlight
    var kbkhl=ctx.createLinearGradient(0,-14,0,26);
    kbkhl.addColorStop(0,'rgba(255,255,255,0.60)'); kbkhl.addColorStop(0.4,'rgba(255,255,255,0.20)'); kbkhl.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=kbkhl; ctx.beginPath(); ctx.ellipse(0,4,4,17,0,0,Math.PI*2); ctx.fill();
    // Center seam
    ctx.strokeStyle='rgba(160,170,180,0.45)'; ctx.lineWidth=1.5; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(0,-14); ctx.lineTo(0,26); ctx.stroke();
    // Fold lines
    ctx.strokeStyle='rgba(150,160,170,0.25)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(-7,-10); ctx.bezierCurveTo(-10,0,-12,14,-14,24); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(7,-10); ctx.bezierCurveTo(10,0,12,14,14,24); ctx.stroke();

    // ARMS (wide white sleeves)
    limb3d(-16,-6, 6, 22, lArm, mwh, lwh, dwh);
    limb3d(16,-6, 6, 22, rArm, mwh, lwh, dwh);
    ctx.fillStyle=skin2;
    ctx.save(); ctx.translate(-16+Math.sin(lArm)*22,-6+Math.cos(lArm)*22);
    ctx.beginPath(); ctx.ellipse(0,0,5,5.5,lArm*0.3,0,Math.PI*2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(16+Math.sin(rArm)*22,-6+Math.cos(rArm)*22);
    ctx.beginPath(); ctx.ellipse(0,0,5,5.5,rArm*0.3,0,Math.PI*2); ctx.fill(); ctx.restore();

    // KEFFIYEH (back view — white cloth draped on head)
    // Main cloth dome
    var kfg=ctx.createRadialGradient(-5,-34,3, 0,-27,20);
    kfg.addColorStop(0,lwh); kfg.addColorStop(0.5,wh); kfg.addColorStop(1,dwh);
    ctx.fillStyle=kfg; ctx.beginPath(); ctx.arc(0,-27,18,0,Math.PI*2); ctx.fill();
    // Red check pattern (dashed border visible from back)
    ctx.strokeStyle='rgba(180,20,20,0.50)'; ctx.lineWidth=1.4; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.arc(0,-27,17,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
    // A second inner check ring
    ctx.strokeStyle='rgba(180,20,20,0.28)'; ctx.lineWidth=1; ctx.setLineDash([3,4]);
    ctx.beginPath(); ctx.arc(0,-27,13,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
    // Keffiyeh tail flowing to shoulder (back view)
    var ktg=ctx.createLinearGradient(-18,-24,-8,-5);
    ktg.addColorStop(0,mwh); ktg.addColorStop(1,dwh);
    ctx.fillStyle=ktg;
    ctx.beginPath(); ctx.moveTo(-17,-22); ctx.bezierCurveTo(-22,-16,-20,-8,-16,-5); ctx.lineTo(-10,-5); ctx.bezierCurveTo(-13,-9,-16,-16,-10,-22); ctx.closePath(); ctx.fill();
    // AGAL (black rope crown — back view: circle)
    var agg=ctx.createRadialGradient(0,-35,0,0,-33,9);
    agg.addColorStop(0,'#444'); agg.addColorStop(1,'#0A0A0A');
    ctx.fillStyle=agg; ctx.beginPath(); ctx.arc(0,-34,8.5,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#555'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(0,-34,7,Math.PI*0.6,Math.PI*0.4); ctx.stroke();
  }

  ctx.restore();
}

function dashRenderFloats(ctx){
  for(var f=0;f<DS.scoreFloats.length;f++){
    var fl = DS.scoreFloats[f];
    var maxLife = fl.life > 70 ? fl.life : 55;
    var alpha = Math.min(1, fl.life / (maxLife * 0.35)) * Math.min(1, fl.life / maxLife * 2);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    var fontSize = fl.big ? 28 : 22;
    ctx.font = 'bold ' + fontSize + 'px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = fl.big ? '#FFF176' : '#FFD54F';
    // Outline for readability
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 3;
    var ty = fl.y - (1 - fl.life/maxLife) * 55;
    ctx.strokeText(fl.text, fl.x, ty);
    ctx.fillText(fl.text, fl.x, ty);
    ctx.restore();
  }
}

function dashSpawnParticles(x, y, color, count){
  if(!DS.particles) DS.particles = [];
  for(var i=0;i<count;i++){
    var ang = Math.random()*Math.PI*2;
    var spd = 1.5 + Math.random()*4.5;
    DS.particles.push({
      x:x, y:y,
      vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd - 2,
      life: 28 + Math.random()*22,
      maxLife: 50,
      color: color,
      size: 2 + Math.random()*4.5
    });
  }
}

function dashRenderParticles(ctx){
  if(!DS.particles || !DS.particles.length) return;
  for(var i=DS.particles.length-1;i>=0;i--){
    var p = DS.particles[i];
    p.x += p.vx; p.y += p.vy;
    p.vy += 0.18;
    p.life--;
    if(p.life <= 0){ DS.particles.splice(i,1); continue; }
    var a = p.life / p.maxLife;
    ctx.save();
    ctx.globalAlpha = a * 0.9;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * a + 0.5, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}

function dashRenderComboBadge(ctx, cw, ch){
  var combo = DS.combo || 0;
  if(combo < 3 || DASH_PHASE !== 'playing') return;
  var mult = combo >= 5 ? 'x2' : 'x1.5';
  var t = Date.now()*0.006;
  var pulse = 1 + Math.sin(t*3)*0.05;
  var col = combo >= 5 ? '#FF6F00' : '#F9A825';
  var bx = cw - 52, by = ch * 0.38;
  ctx.save();
  ctx.translate(bx, by);
  ctx.scale(pulse, pulse);
  // Shadow glow
  ctx.shadowColor = col;
  ctx.shadowBlur = 18;
  // Badge background (rounded rect via path)
  var w=90, h=50, r=14;
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(-w/2+r,-h/2); ctx.lineTo(w/2-r,-h/2);
  ctx.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
  ctx.lineTo(w/2,h/2-r); ctx.quadraticCurveTo(w/2,h/2,w/2-r,h/2);
  ctx.lineTo(-w/2+r,h/2); ctx.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);
  ctx.lineTo(-w/2,-h/2+r); ctx.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px Nunito,sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(mult, 0, -9);
  ctx.font = 'bold 11px Nunito,sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(combo+' STREAK', 0, 10);
  ctx.restore();
}

function dashRenderFoodGroups(ctx, cw, ch){
  if(DASH_PHASE !== 'playing') return;
  var groups = [
    {g:'fruits',  emoji:'🍎', col:'#E53935'},
    {g:'veg',     emoji:'🥦', col:'#388E3C'},
    {g:'grains',  emoji:'🌾', col:'#C8A96E'},
    {g:'protein', emoji:'🍗', col:'#FF8F00'},
    {g:'dairy',   emoji:'🥛', col:'#42A5F5'}
  ];
  var size=32, gap=7, total=groups.length*(size+gap)-gap;
  var sx = cw - total - 14, sy = ch * 0.60;
  // Subtle backing pill so the tracker reads as one UI group
  ctx.save();
  ctx.globalAlpha = 0.30;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  var pr = size/2 + 7;
  ctx.roundRect ? ctx.roundRect(sx - pr + size/2 - 2, sy - pr, total + 18, pr*2, pr)
                : ctx.rect(sx - pr + size/2 - 2, sy - pr, total + 18, pr*2);
  ctx.fill();
  ctx.restore();
  for(var i=0;i<groups.length;i++){
    var gd = groups[i];
    var done = !!_dashCollectedGroups[gd.g];
    var bx = sx + i*(size+gap) + size/2;
    ctx.save();
    ctx.globalAlpha = done ? 0.95 : 0.5;
    if(done){ ctx.shadowColor = gd.col; ctx.shadowBlur = 12; }
    ctx.fillStyle = done ? gd.col : '#777';
    ctx.beginPath();
    ctx.arc(bx, sy, size/2, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = done ? 1 : 0.55;
    ctx.font = '17px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(gd.emoji, bx, sy);
    ctx.restore();
  }
}

// ── GAME OVER ──
function dashShowGameOver(){
  dashSFX('gameover');
  if(DASH_RAF) cancelAnimationFrame(DASH_RAF);
  var goEl = document.getElementById('dash-gameover');
  var scoreEl = document.getElementById('dash-go-score-val');
  var bestEl = document.getElementById('dash-go-best-val');
  var tipEl = document.getElementById('dash-go-tip');
  var titleEl = document.getElementById('dash-go-title');
  var emojiEl = document.getElementById('dash-go-emoji');
  var isAr = LANG === 'ar';
  var distGoEl = document.getElementById('dash-go-dist-val');
  var distGoLbl = document.getElementById('dash-go-dist-lbl');
  // Persist best score (distance points count too, not just food pickups)
  if(DS.score > DASH_BEST){
    DASH_BEST = DS.score;
    localStorage.setItem('sehhi_dash_best', DASH_BEST);
  }
  if(titleEl) titleEl.textContent = isAr ? 'انتهت اللعبة!' : 'Game Over!';
  if(emojiEl) emojiEl.textContent = DS.score > 200 ? '🏆' : '🏁';
  if(scoreEl) scoreEl.textContent = DS.score;
  if(bestEl) bestEl.textContent = DASH_BEST;
  if(distGoEl) distGoEl.textContent = Math.floor(DS.distance||0) + 'm';
  if(distGoLbl) distGoLbl.textContent = isAr ? 'المسافة' : 'Distance';
  // Random tip
  var groups = Object.keys(DASH_TIPS);
  var rGroup = groups[Math.floor(Math.random() * groups.length)];
  if(tipEl) tipEl.textContent = isAr ? DASH_TIPS[rGroup].ar : DASH_TIPS[rGroup].en;
  if(goEl) goEl.classList.remove('hidden');
}

function dashRetry(){
  var goEl = document.getElementById('dash-gameover');
  if(goEl) goEl.classList.add('hidden');
  dashStartGame();
}

function dashQuit(){
  if(DASH_RAF){ cancelAnimationFrame(DASH_RAF); DASH_RAF = null; }
  DASH_PHASE = 'idle';
  document.removeEventListener('keydown', dashKeyHandler);
  document.removeEventListener('keyup', dashKeyUpHandler);
  goHub();
}

// ═══════════════════════════════════════
// QUIZ MODE — Public Health, First Aid & Resilience
// Turns the info pages into playable quizzes.
// Learn mode (the original topic browser) stays one tap away.
// ═══════════════════════════════════════
var QUIZ_DEFS = {
  ph: {
    icon:'🏥', color:'#00BCD4',
    title:{en:'Health Hero Quiz', ar:'اختبار بطل الصحة'},
    sub:{en:'How well do you know your health?', ar:'كم تعرف عن صحتك؟'},
    questions:[
      { q:{en:'How long should you wash your hands?', ar:'كم من الوقت يجب أن تغسل يديك؟'},
        opts:[{en:'20 seconds', ar:'20 ثانية'},{en:'3 seconds', ar:'3 ثوانٍ'},{en:'1 second', ar:'ثانية واحدة'}], c:0,
        ex:{en:'20 seconds — like singing Happy Birthday twice! It removes 99% of germs.', ar:'20 ثانية — مثل غناء "سنة حلوة" مرتين! تزيل 99% من الجراثيم.'} },
      { q:{en:'When should you wash your hands?', ar:'متى يجب أن تغسل يديك؟'},
        opts:[{en:'All of these!', ar:'كل ما سبق!'},{en:'Before eating', ar:'قبل الأكل'},{en:'After the toilet', ar:'بعد الحمام'}], c:0,
        ex:{en:'Before eating, after the toilet, after playing — every time!', ar:'قبل الأكل، بعد الحمام، بعد اللعب — في كل مرة!'} },
      { q:{en:'How many hours of sleep do children need?', ar:'كم ساعة نوم يحتاج الأطفال؟'},
        opts:[{en:'9–12 hours', ar:'9–12 ساعة'},{en:'4–5 hours', ar:'4–5 ساعات'},{en:'2 hours', ar:'ساعتان'}], c:0,
        ex:{en:'Growing bodies and brains need 9–12 hours every night.', ar:'الأجسام والعقول النامية تحتاج 9–12 ساعة كل ليلة.'} },
      { q:{en:'How much exercise should you get daily?', ar:'كم من النشاط البدني تحتاج يومياً؟'},
        opts:[{en:'60 minutes', ar:'60 دقيقة'},{en:'5 minutes', ar:'5 دقائق'},{en:'None', ar:'لا شيء'}], c:0,
        ex:{en:'At least 60 minutes of active play every day keeps you strong!', ar:'60 دقيقة على الأقل من اللعب النشط يومياً تجعلك قوياً!'} },
      { q:{en:'Why is too much screen time bad?', ar:'لماذا وقت الشاشة الطويل ضار؟'},
        opts:[{en:'It hurts eyes and sleep', ar:'يضر العينين والنوم'},{en:'It makes you taller', ar:'يجعلك أطول'},{en:'It is not bad', ar:'ليس ضاراً'}], c:0,
        ex:{en:'Long screen time tires your eyes and makes it harder to sleep well.', ar:'وقت الشاشة الطويل يتعب عينيك ويصعّب النوم الجيد.'} },
      { q:{en:'What do vaccines do?', ar:'ماذا تفعل اللقاحات؟'},
        opts:[{en:'Protect you from diseases', ar:'تحميك من الأمراض'},{en:'Make you sick', ar:'تجعلك مريضاً'},{en:'Taste like candy', ar:'طعمها كالحلوى'}], c:0,
        ex:{en:'Vaccines train your body to fight diseases before they can hurt you.', ar:'اللقاحات تدرّب جسمك على محاربة الأمراض قبل أن تؤذيك.'} },
      { q:{en:'Asking for help when you feel sad is…', ar:'طلب المساعدة عندما تشعر بالحزن هو…'},
        opts:[{en:'Strength!', ar:'قوة!'},{en:'Weakness', ar:'ضعف'},{en:'Embarrassing', ar:'محرج'}], c:0,
        ex:{en:'Talking about feelings is brave. Asking for help = STRENGTH.', ar:'التحدث عن المشاعر شجاعة. طلب المساعدة = قوة.'} },
      { q:{en:'What is the best drink for your body?', ar:'ما هو أفضل مشروب لجسمك؟'},
        opts:[{en:'Water', ar:'الماء'},{en:'Soda', ar:'المشروبات الغازية'},{en:'Energy drinks', ar:'مشروبات الطاقة'}], c:0,
        ex:{en:'Water keeps every part of your body working perfectly.', ar:'الماء يحافظ على عمل كل أجزاء جسمك بشكل مثالي.'} },
      { q:{en:'What removes germs best?', ar:'ما الذي يزيل الجراثيم بشكل أفضل؟'},
        opts:[{en:'Soap and water', ar:'الصابون والماء'},{en:'Wiping hands on clothes', ar:'مسح اليدين بالملابس'},{en:'Just cold water', ar:'الماء البارد فقط'}], c:0,
        ex:{en:'Soap grabs the germs so water can wash them away.', ar:'الصابون يمسك الجراثيم ليغسلها الماء بعيداً.'} },
      { q:{en:'The Abu Dhabi health hotline is…', ar:'خط صحة أبوظبي هو…'},
        opts:[{en:'800-HEALTH', ar:'800-HEALTH'},{en:'123-FOOD', ar:'123-FOOD'},{en:'555-PLAY', ar:'555-PLAY'}], c:0,
        ex:{en:'800-HEALTH — the Abu Dhabi Health Hotline.', ar:'800-HEALTH — خط صحة أبوظبي.'} }
    ]
  },
  fa: {
    icon:'🩺', color:'#E91E63',
    title:{en:'First Aid Hero Quiz', ar:'اختبار بطل الإسعافات'},
    sub:{en:'Would you know what to do?', ar:'هل تعرف ماذا تفعل؟'},
    questions:[
      { q:{en:'First thing to do for a small burn?', ar:'أول شيء تفعله عند حرق بسيط؟'},
        opts:[{en:'Cool water for 10 minutes', ar:'ماء بارد لمدة 10 دقائق'},{en:'Put ice directly on it', ar:'ضع الثلج مباشرة'},{en:'Put butter on it', ar:'ضع الزبدة عليه'}], c:0,
        ex:{en:'Cool running water — NEVER ice or butter, they make burns worse!', ar:'ماء جارٍ بارد — أبداً لا تضع الثلج أو الزبدة، فهما يزيدان الحرق سوءاً!'} },
      { q:{en:'For a nosebleed, you should lean…', ar:'عند نزيف الأنف، يجب أن تميل…'},
        opts:[{en:'Forward and pinch your nose', ar:'للأمام واضغط على أنفك'},{en:'Backward', ar:'للخلف'},{en:'Lie down flat', ar:'استلقِ تماماً'}], c:0,
        ex:{en:'Lean FORWARD and pinch the soft part of your nose for 10 minutes.', ar:'انحنِ للأمام واضغط على الجزء اللين من أنفك لمدة 10 دقائق.'} },
      { q:{en:'What is the ambulance number in the UAE?', ar:'ما هو رقم الإسعاف في الإمارات؟'},
        opts:[{en:'998', ar:'998'},{en:'999', ar:'999'},{en:'997', ar:'997'}], c:0,
        ex:{en:'998 = Ambulance. 999 = Police. 997 = Fire.', ar:'998 = إسعاف. 999 = شرطة. 997 = إطفاء.'} },
      { q:{en:'What is the police number in the UAE?', ar:'ما هو رقم الشرطة في الإمارات؟'},
        opts:[{en:'999', ar:'999'},{en:'998', ar:'998'},{en:'997', ar:'997'}], c:0,
        ex:{en:'999 = Police. 998 = Ambulance. 997 = Fire.', ar:'999 = شرطة. 998 = إسعاف. 997 = إطفاء.'} },
      { q:{en:'What is the fire department number?', ar:'ما هو رقم الإطفاء؟'},
        opts:[{en:'997', ar:'997'},{en:'998', ar:'998'},{en:'999', ar:'999'}], c:0,
        ex:{en:'997 = Fire (Civil Defence). Remember all three!', ar:'997 = الإطفاء (الدفاع المدني). تذكر الأرقام الثلاثة!'} },
      { q:{en:'Someone is badly hurt. What FIRST?', ar:'شخص مصاب بشدة. ماذا تفعل أولاً؟'},
        opts:[{en:'Call an adult for help', ar:'نادِ شخصاً بالغاً للمساعدة'},{en:'Run away', ar:'اهرب'},{en:'Take a photo', ar:'التقط صورة'}], c:0,
        ex:{en:'Always get an adult first — then they can call 998 if needed.', ar:'دائماً نادِ شخصاً بالغاً أولاً — ثم يمكنه الاتصال بـ998 عند الحاجة.'} },
      { q:{en:'A small cut on your finger. First step?', ar:'جرح صغير في إصبعك. الخطوة الأولى؟'},
        opts:[{en:'Wash it with clean water', ar:'اغسله بماء نظيف'},{en:'Ignore it', ar:'تجاهله'},{en:'Lick it clean', ar:'العقه لتنظيفه'}], c:0,
        ex:{en:'Clean water first, then a bandage keeps germs out.', ar:'الماء النظيف أولاً، ثم الضمادة تمنع الجراثيم.'} },
      { q:{en:'What belongs in a first aid kit?', ar:'ماذا يجب أن يكون في حقيبة الإسعافات؟'},
        opts:[{en:'Bandages and antiseptic', ar:'ضمادات ومطهر'},{en:'Candy and chips', ar:'حلوى ورقائق'},{en:'Toys', ar:'ألعاب'}], c:0,
        ex:{en:'Bandages, gauze, antiseptic, thermometer, gloves — real helpers!', ar:'ضمادات، شاش، مطهر، ميزان حرارة، قفازات — أدوات حقيقية!'} },
      { q:{en:'If your clothes catch fire…', ar:'إذا اشتعلت النار في ملابسك…'},
        opts:[{en:'Stop, Drop and Roll', ar:'قف، انبطح وتدحرج'},{en:'Run as fast as you can', ar:'اركض بأقصى سرعة'},{en:'Jump up and down', ar:'اقفز للأعلى والأسفل'}], c:0,
        ex:{en:'Running feeds the fire with air. Stop, drop to the ground, and roll!', ar:'الركض يغذي النار بالهواء. قف، انبطح على الأرض وتدحرج!'} },
      { q:{en:'A bee stung your friend and it is swelling…', ar:'لدغت نحلة صديقك وبدأ التورم…'},
        opts:[{en:'Cold pack wrapped in cloth', ar:'كمادة باردة ملفوفة بقماش'},{en:'Rub it hard', ar:'افركه بقوة'},{en:'Put sand on it', ar:'ضع الرمل عليه'}], c:0,
        ex:{en:'A wrapped cold pack reduces swelling — and tell an adult.', ar:'الكمادة الباردة الملفوفة تقلل التورم — وأخبر شخصاً بالغاً.'} }
    ]
  },
  re: {
    icon:'🌱', color:'#4CAF50',
    title:{en:'Resilience Power Quiz', ar:'اختبار قوة المرونة'},
    sub:{en:'Train your growing brain!', ar:'درّب عقلك النامي!'},
    questions:[
      { q:{en:'"I can\'t do this ___" — which word helps you grow?', ar:'"لا أستطيع فعل هذا ___" — أي كلمة تساعدك على النمو؟'},
        opts:[{en:'YET', ar:'بعد'},{en:'NEVER', ar:'أبداً'},{en:'EVER', ar:'إطلاقاً'}], c:0,
        ex:{en:'Adding YET turns limits into possibilities. You just can\'t do it YET!', ar:'إضافة "بعد" تحوّل الحدود إلى إمكانيات. أنت فقط لا تستطيع فعلها بعد!'} },
      { q:{en:'Mistakes are…', ar:'الأخطاء هي…'},
        opts:[{en:'How we learn!', ar:'طريقة تعلمنا!'},{en:'Something to hide', ar:'شيء نخفيه'},{en:'Proof you are bad', ar:'دليل أنك سيئ'}], c:0,
        ex:{en:'Every expert was once a beginner who made lots of mistakes.', ar:'كل خبير كان مبتدئاً ارتكب الكثير من الأخطاء.'} },
      { q:{en:'Your friend failed a test and feels sad. You…', ar:'رسب صديقك في اختبار ويشعر بالحزن. أنت…'},
        opts:[{en:'Encourage and help them', ar:'تشجعه وتساعده'},{en:'Laugh at them', ar:'تضحك عليه'},{en:'Ignore them', ar:'تتجاهله'}], c:0,
        ex:{en:'Kind friends help each other grow stronger.', ar:'الأصدقاء الطيبون يساعدون بعضهم على أن يصبحوا أقوى.'} },
      { q:{en:'A puzzle is too hard. What do you do?', ar:'اللغز صعب جداً. ماذا تفعل؟'},
        opts:[{en:'Try again a different way', ar:'حاول مرة أخرى بطريقة مختلفة'},{en:'Give up forever', ar:'استسلم للأبد'},{en:'Get angry and quit', ar:'اغضب واترك اللعب'}], c:0,
        ex:{en:'Perseverance means trying new ways until you find one that works.', ar:'المثابرة تعني تجربة طرق جديدة حتى تجد الطريقة الناجحة.'} },
      { q:{en:'When you feel very angry, the best thing is…', ar:'عندما تشعر بغضب شديد، أفضل شيء هو…'},
        opts:[{en:'Breathe deeply and talk about it', ar:'تنفس بعمق وتحدث عن الأمر'},{en:'Hit something', ar:'اضرب شيئاً'},{en:'Keep it secret forever', ar:'اكتمه للأبد'}], c:0,
        ex:{en:'Deep breaths calm your body. Talking helps your heart.', ar:'التنفس العميق يهدئ جسمك. والتحدث يساعد قلبك.'} },
      { q:{en:'Gratitude means…', ar:'الامتنان يعني…'},
        opts:[{en:'Being thankful for what you have', ar:'الشكر على ما لديك'},{en:'Wanting more toys', ar:'طلب المزيد من الألعاب'},{en:'Never being happy', ar:'عدم السعادة أبداً'}], c:0,
        ex:{en:'Thinking of 3 good things each day makes your brain happier!', ar:'التفكير في 3 أشياء جيدة كل يوم يجعل عقلك أكثر سعادة!'} },
      { q:{en:'Positive self-talk sounds like…', ar:'الحديث الإيجابي مع النفس يبدو مثل…'},
        opts:[{en:'"I can do hard things!"', ar:'"أستطيع فعل الأشياء الصعبة!"'},{en:'"I always fail"', ar:'"أنا أفشل دائماً"'},{en:'"I am useless"', ar:'"أنا عديم الفائدة"'}], c:0,
        ex:{en:'The words you say to yourself shape what you believe. Choose strong words!', ar:'الكلمات التي تقولها لنفسك تشكل ما تؤمن به. اختر كلمات قوية!'} },
      { q:{en:'Who built the UAE with perseverance?', ar:'من بنى الإمارات بالمثابرة؟'},
        opts:[{en:'Sheikh Zayed', ar:'الشيخ زايد'},{en:'A superhero', ar:'بطل خارق'},{en:'A robot', ar:'روبوت'}], c:0,
        ex:{en:'Sheikh Zayed\'s perseverance built a nation. Yours builds your future!', ar:'مثابرة الشيخ زايد بنت أمة. ومثابرتك تبني مستقبلك!'} },
      { q:{en:'Talking about your feelings is…', ar:'التحدث عن مشاعرك هو…'},
        opts:[{en:'Healthy and brave', ar:'صحي وشجاع'},{en:'Only for babies', ar:'للأطفال الصغار فقط'},{en:'A waste of time', ar:'مضيعة للوقت'}], c:0,
        ex:{en:'All feelings are OK. Sharing them is a superpower.', ar:'كل المشاعر طبيعية. ومشاركتها قوة خارقة.'} },
      { q:{en:'Your brain grows most when you…', ar:'ينمو عقلك أكثر عندما…'},
        opts:[{en:'Practice difficult things', ar:'تتدرب على الأشياء الصعبة'},{en:'Only do easy things', ar:'تفعل الأشياء السهلة فقط'},{en:'Never try', ar:'لا تحاول أبداً'}], c:0,
        ex:{en:'Hard practice builds new connections in your brain — like a muscle!', ar:'التدريب الصعب يبني وصلات جديدة في عقلك — مثل العضلات!'} }
    ]
  }
};

var QUIZ_STATE = null;
var QUIZ_ROUND = 8;       // questions per round
var QUIZ_TIME = 20;       // seconds per question
var _quizTimerIv = null;

function quizBestKey(key){ return 'sehhi_quiz_best_' + key; }

function quizMount(key){
  var body = document.getElementById(key + '-body');
  if(!body) return null;
  var ov = document.getElementById('quiz-ov-' + key);
  if(!ov){
    ov = document.createElement('div');
    ov.id = 'quiz-ov-' + key;
    ov.className = 'quiz-overlay';
    body.appendChild(ov);
  }
  ov.style.display = 'flex';
  return ov;
}

function quizLearnMode(key){
  var ov = document.getElementById('quiz-ov-' + key);
  if(ov) ov.style.display = 'none';
  quizStopTimer();
  // Quiz button centered under the center card
  var btn = document.getElementById('quiz-return-' + key);
  if(!btn){
    btn = document.createElement('button');
    btn.id = 'quiz-return-' + key;
    btn.className = 'quiz-center-btn';
    btn.innerHTML = '🎯 Quiz Mode / وضع الاختبار';
    btn.onclick = function(){ btn.style.display = 'none'; quizIntro(key); };
    // Outside the center card: appended to the game body, below the main layout
    var body = document.getElementById(key + '-body');
    if(body) body.appendChild(btn);
  }
  btn.style.display = 'flex';
}

function quizIntro(key){
  var def = QUIZ_DEFS[key];
  var ov = quizMount(key);
  if(!ov) return;
  var rbtn = document.getElementById('quiz-return-' + key);
  if(rbtn) rbtn.style.display = 'none';
  var best = parseInt(localStorage.getItem(quizBestKey(key)) || '0', 10);
  ov.innerHTML =
    '<div class="quiz-card quiz-intro">' +
      '<div class="quiz-big-icon">' + def.icon + '</div>' +
      '<div class="quiz-title">' + def.title.en + '</div>' +
      '<div class="quiz-title-ar">' + def.title.ar + '</div>' +
      '<div class="quiz-sub">' + def.sub.en + ' — ' + def.sub.ar + '</div>' +
      (best > 0 ? '<div class="quiz-best">🏆 Best: ' + best + ' / ' + QUIZ_ROUND + '</div>' : '') +
      '<button class="quiz-start-btn" style="background:' + def.color + '" onclick="quizStart(\'' + key + '\')">▶ Start / ابدأ</button>' +
      '<button class="quiz-learn-btn" onclick="quizLearnMode(\'' + key + '\')">📖 Learn Mode / وضع التعلم</button>' +
    '</div>';
}

function quizShuffle(arr){
  var a = arr.slice();
  for(var i = a.length - 1; i > 0; i--){
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function quizStart(key){
  var def = QUIZ_DEFS[key];
  QUIZ_STATE = {
    key: key,
    qs: quizShuffle(def.questions).slice(0, QUIZ_ROUND),
    idx: 0,
    score: 0,
    locked: false
  };
  dashSFX('go');
  quizShowQuestion();
}

function quizStopTimer(){
  if(_quizTimerIv){ clearInterval(_quizTimerIv); _quizTimerIv = null; }
}

function quizShowQuestion(){
  var S = QUIZ_STATE;
  if(!S) return;
  var def = QUIZ_DEFS[S.key];
  var ov = document.getElementById('quiz-ov-' + S.key);
  if(!ov) return;
  var q = S.qs[S.idx];
  S.locked = false;
  // shuffle options but remember correct
  var order = quizShuffle(q.opts.map(function(_, i){ return i; }));
  S.order = order;
  var optsHtml = '';
  for(var i = 0; i < order.length; i++){
    var o = q.opts[order[i]];
    optsHtml += '<button class="quiz-opt" data-oi="' + order[i] + '" onclick="quizAnswer(this)">' +
      '<span class="quiz-opt-en">' + o.en + '</span><span class="quiz-opt-ar">' + o.ar + '</span></button>';
  }
  ov.innerHTML =
    '<div class="quiz-card">' +
      '<div class="quiz-head">' +
        '<span class="quiz-prog">' + def.icon + ' ' + (S.idx + 1) + ' / ' + S.qs.length + '</span>' +
        '<span class="quiz-score">⭐ ' + S.score + '</span>' +
      '</div>' +
      '<div class="quiz-timer"><div class="quiz-timer-fill" id="quiz-timer-fill" style="background:' + def.color + '"></div></div>' +
      '<div class="quiz-q">' + q.q.en + '</div>' +
      '<div class="quiz-q-ar">' + q.q.ar + '</div>' +
      '<div class="quiz-opts">' + optsHtml + '</div>' +
      '<div class="quiz-explain" id="quiz-explain"></div>' +
    '</div>';
  // timer
  quizStopTimer();
  var remain = QUIZ_TIME * 10;
  var fill = document.getElementById('quiz-timer-fill');
  _quizTimerIv = setInterval(function(){
    remain--;
    if(fill) fill.style.width = (remain / (QUIZ_TIME * 10) * 100) + '%';
    if(remain <= 0){ quizStopTimer(); quizTimeout(); }
  }, 100);
}

function quizTimeout(){
  var S = QUIZ_STATE;
  if(!S || S.locked) return;
  S.locked = true;
  dashSFX('hit');
  var ov = document.getElementById('quiz-ov-' + S.key);
  var q = S.qs[S.idx];
  // highlight the correct answer
  ov.querySelectorAll('.quiz-opt').forEach(function(b){
    b.disabled = true;
    if(parseInt(b.dataset.oi, 10) === q.c) b.classList.add('correct');
  });
  var ex = document.getElementById('quiz-explain');
  if(ex){
    ex.innerHTML = '<div class="quiz-ex-tag quiz-ex-wrong">⏰ Time\'s up! / انتهى الوقت!</div>' +
      '<div>' + q.ex.en + '</div><div class="quiz-ex-ar">' + q.ex.ar + '</div>';
    ex.classList.add('show');
  }
  setTimeout(quizNext, 3200);
}

function quizAnswer(btn){
  var S = QUIZ_STATE;
  if(!S || S.locked) return;
  S.locked = true;
  quizStopTimer();
  var q = S.qs[S.idx];
  var picked = parseInt(btn.dataset.oi, 10);
  var right = picked === q.c;
  var ov = document.getElementById('quiz-ov-' + S.key);
  ov.querySelectorAll('.quiz-opt').forEach(function(b){
    b.disabled = true;
    var oi = parseInt(b.dataset.oi, 10);
    if(oi === q.c) b.classList.add('correct');
    else if(oi === picked && !right) b.classList.add('wrong');
  });
  if(right){ S.score++; dashSFX('pickup', S.score); }
  else { dashSFX('hit'); }
  var ex = document.getElementById('quiz-explain');
  if(ex){
    ex.innerHTML =
      '<div class="quiz-ex-tag ' + (right ? 'quiz-ex-right' : 'quiz-ex-wrong') + '">' +
        (right ? '✅ Correct! / صحيح!' : '❌ Not quite / ليس تماماً') + '</div>' +
      '<div>' + q.ex.en + '</div><div class="quiz-ex-ar">' + q.ex.ar + '</div>';
    ex.classList.add('show');
  }
  setTimeout(quizNext, right ? 2200 : 3200);
}

function quizNext(){
  var S = QUIZ_STATE;
  if(!S) return;
  S.idx++;
  if(S.idx >= S.qs.length){ quizResults(); }
  else { quizShowQuestion(); }
}

function quizResults(){
  var S = QUIZ_STATE;
  var def = QUIZ_DEFS[S.key];
  var ov = document.getElementById('quiz-ov-' + S.key);
  if(!ov) return;
  quizStopTimer();
  var bk = quizBestKey(S.key);
  var best = parseInt(localStorage.getItem(bk) || '0', 10);
  var isNewBest = S.score > best;
  if(isNewBest){ best = S.score; localStorage.setItem(bk, best); }
  var pct = S.score / S.qs.length;
  var stars = pct >= 0.9 ? '⭐⭐⭐' : pct >= 0.6 ? '⭐⭐' : pct >= 0.3 ? '⭐' : '💪';
  var msg = pct >= 0.9 ? {en:'Amazing! You are a true hero!', ar:'مذهل! أنت بطل حقيقي!'} :
            pct >= 0.6 ? {en:'Great job! Almost perfect!', ar:'عمل رائع! اقتربت من الكمال!'} :
            pct >= 0.3 ? {en:'Good try! Play again to learn more!', ar:'محاولة جيدة! العب مجدداً لتتعلم أكثر!'} :
                         {en:'Visit Learn Mode, then try again!', ar:'زر وضع التعلم ثم حاول مجدداً!'};
  if(pct >= 0.6) dashSFX('fanfare'); else dashSFX('heart');
  ov.innerHTML =
    '<div class="quiz-card quiz-results">' +
      '<div class="quiz-stars">' + stars + '</div>' +
      (isNewBest ? '<div class="quiz-newbest">🎉 NEW BEST! / رقم قياسي جديد!</div>' : '') +
      '<div class="quiz-final-score">' + S.score + ' / ' + S.qs.length + '</div>' +
      '<div class="quiz-msg">' + msg.en + '</div>' +
      '<div class="quiz-msg-ar">' + msg.ar + '</div>' +
      '<div class="quiz-best">🏆 Best: ' + best + ' / ' + QUIZ_ROUND + '</div>' +
      '<button class="quiz-start-btn" style="background:' + def.color + '" onclick="quizStart(\'' + S.key + '\')">🔄 Play Again / العب مجدداً</button>' +
      '<button class="quiz-learn-btn" onclick="quizLearnMode(\'' + S.key + '\')">📖 Learn Mode / وضع التعلم</button>' +
    '</div>';
}

// Learn Mode opens first; the centered Quiz button launches quiz mode.
// (These declarations override the originals — app.js loads after the inline script.)
function initPH(){ phShowMenu(); quizLearnMode('ph'); }
function initFA(){ faShowMenu(); quizLearnMode('fa'); }
function initRE(){ reShowMenu(); quizLearnMode('re'); }

// ═══════════════════════════════════════
// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
(function init(){
  if(LANG==='ar'){
    document.body.classList.add('ar');
    document.documentElement.setAttribute('lang','ar');
    document.documentElement.setAttribute('dir','rtl');
  }
  syncAllLangBtns();
  // Game logo in every game header (after the back button)
  document.querySelectorAll('.game-header .gh-left').forEach(function(el){
    if(el.querySelector('.gh-logo')) return;
    var img = document.createElement('img');
    img.src = 'SVG/Gamelogo.svg';
    img.className = 'gh-logo';
    img.alt = '';
    var back = el.querySelector('.back-btn');
    el.insertBefore(img, back ? back.nextSibling : el.firstChild);
  });
})();
