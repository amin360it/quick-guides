var fs = require('fs');

var NON_GUIDES = ['index.html','topics.html','search.html','favorites.html','test.html'];
var FAKE = ['axum.html','actix-web.html','rocket.html','warp.html','salvo.html'];
var disk = fs.readdirSync('.').filter(function(f){ return /\.html$/.test(f); });
var guides = disk.filter(function(f){ return NON_GUIDES.indexOf(f)===-1 && FAKE.indexOf(f)===-1; });

var bad = [];
var totCh=0, totSub=0, totCode=0, totH4=0;
guides.forEach(function(f) {
  var c = fs.readFileSync(f, 'utf8');
  var m = c.match(/<main id="content">([\s\S]*)<\/main>/);
  var body = m ? m[1] : c;
  var chapters = (body.match(/<h2[^>]*data-toc/g)||[]).length;
  var subs     = (body.match(/<h3[^>]*data-toc/g)||[]).length;
  var topics    = chapters + subs;              // <- band "topics" = chapters + subsections
  var code     = (body.match(/<div class="codeWrap">/g)||[]).length;
  totCh+=chapters; totSub+=subs; totCode+=code; totH4 += (body.match(/<h4/g)||[]).length;

  var band = (c.match(/<span class="am-band-s">([\s\S]*?)<\/span>/)||[])[1];
  if (!band) return;
  var bt = band.replace(/&middot;/g,'.').replace(/&amp;/g,'&').replace(/,/g,'');
  var errs = [];
  var mc = bt.match(/(\d+)\s*chapters?/);
  var mt = bt.match(/(\d+)\s*topics?/);
  var mk = bt.match(/(\d+)\s*code samples?/);
  if (mc && +mc[1] !== chapters) errs.push('chapters '+mc[1]+' vs '+chapters);
  if (mt && +mt[1] !== topics)    errs.push('topics '+mt[1]+' vs '+topics);
  if (mk && +mk[1] !== code)      errs.push('code '+mk[1]+' vs '+code);
  if (errs.length) bad.push(f + ' :: ' + errs.join(' | '));
});
console.log('=== BAND MISMATCHES (topics=ch+subs): ' + bad.length + ' ===');
bad.forEach(function(b){ console.log('  ' + b); });
console.log('\nTOTALS over ' + guides.length + ' guides:');
console.log('  chapters=' + totCh + '  subsections=' + totSub + '  topics(ch+subs)=' + (totCh+totSub));
console.log('  h4=' + totH4 + '  code blocks=' + totCode);