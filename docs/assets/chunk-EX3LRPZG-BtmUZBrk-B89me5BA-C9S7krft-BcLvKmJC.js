import{d as te}from"./chunk-XXDRQBXY-CinZRrUc-BCY7jSXQ-D3yAhpck-H-oaXXjJ.js";import{u as ee}from"./chunk-VR4S4FIN-BBoZO6s4-DZQCUyX_-BA2E7lcR-BORhQdd3.js";import{e as d,I as k,x as R,z as se,Z as ie,g as re,h as ne,f as oe,d as ae,D as le,R as ce,aw as he,q as X,V as de,t as bt,U as ue}from"./index-B0A2uqym.js";import{w as pe}from"./chunk-32BRIVSS-B1bysRMQ-CRftgQYa-CB4hfSUm-B4FKUitp.js";var vt=(function(){var t=d(function(P,n,r,f){for(r=r||{},f=P.length;f--;r[P[f]]=n);return r},"o"),e=[1,2],o=[1,3],s=[1,4],c=[2,4],a=[1,9],u=[1,11],m=[1,16],p=[1,17],S=[1,18],D=[1,19],g=[1,33],O=[1,20],L=[1,21],B=[1,22],N=[1,23],v=[1,24],h=[1,26],E=[1,27],I=[1,28],x=[1,29],F=[1,30],Y=[1,31],z=[1,32],it=[1,35],rt=[1,36],nt=[1,37],ot=[1,38],V=[1,34],y=[1,4,5,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],at=[1,4,5,14,15,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,39,40,41,45,48,51,52,53,54,57],Ct=[4,5,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],gt={trace:d(function(){},"trace"),yy:{},symbols_:{error:2,start:3,SPACE:4,NL:5,SD:6,document:7,line:8,statement:9,classDefStatement:10,styleStatement:11,cssClassStatement:12,idStatement:13,DESCR:14,"-->":15,HIDE_EMPTY:16,scale:17,WIDTH:18,COMPOSIT_STATE:19,STRUCT_START:20,STRUCT_STOP:21,STATE_DESCR:22,AS:23,ID:24,FORK:25,JOIN:26,CHOICE:27,CONCURRENT:28,note:29,notePosition:30,NOTE_TEXT:31,direction:32,acc_title:33,acc_title_value:34,acc_descr:35,acc_descr_value:36,acc_descr_multiline_value:37,CLICK:38,STRING:39,HREF:40,classDef:41,CLASSDEF_ID:42,CLASSDEF_STYLEOPTS:43,DEFAULT:44,style:45,STYLE_IDS:46,STYLEDEF_STYLEOPTS:47,class:48,CLASSENTITY_IDS:49,STYLECLASS:50,direction_tb:51,direction_bt:52,direction_rl:53,direction_lr:54,eol:55,";":56,EDGE_STATE:57,STYLE_SEPARATOR:58,left_of:59,right_of:60,$accept:0,$end:1},terminals_:{2:"error",4:"SPACE",5:"NL",6:"SD",14:"DESCR",15:"-->",16:"HIDE_EMPTY",17:"scale",18:"WIDTH",19:"COMPOSIT_STATE",20:"STRUCT_START",21:"STRUCT_STOP",22:"STATE_DESCR",23:"AS",24:"ID",25:"FORK",26:"JOIN",27:"CHOICE",28:"CONCURRENT",29:"note",31:"NOTE_TEXT",33:"acc_title",34:"acc_title_value",35:"acc_descr",36:"acc_descr_value",37:"acc_descr_multiline_value",38:"CLICK",39:"STRING",40:"HREF",41:"classDef",42:"CLASSDEF_ID",43:"CLASSDEF_STYLEOPTS",44:"DEFAULT",45:"style",46:"STYLE_IDS",47:"STYLEDEF_STYLEOPTS",48:"class",49:"CLASSENTITY_IDS",50:"STYLECLASS",51:"direction_tb",52:"direction_bt",53:"direction_rl",54:"direction_lr",56:";",57:"EDGE_STATE",58:"STYLE_SEPARATOR",59:"left_of",60:"right_of"},productions_:[0,[3,2],[3,2],[3,2],[7,0],[7,2],[8,2],[8,1],[8,1],[9,1],[9,1],[9,1],[9,1],[9,2],[9,3],[9,4],[9,1],[9,2],[9,1],[9,4],[9,3],[9,6],[9,1],[9,1],[9,1],[9,1],[9,4],[9,4],[9,1],[9,2],[9,2],[9,1],[9,5],[9,5],[10,3],[10,3],[11,3],[12,3],[32,1],[32,1],[32,1],[32,1],[55,1],[55,1],[13,1],[13,1],[13,3],[13,3],[30,1],[30,1]],performAction:d(function(P,n,r,f,T,i,_){var l=i.length-1;switch(T){case 3:return f.setRootDoc(i[l]),i[l];case 4:this.$=[];break;case 5:i[l]!="nl"&&(i[l-1].push(i[l]),this.$=i[l-1]);break;case 6:case 7:this.$=i[l];break;case 8:this.$="nl";break;case 12:this.$=i[l];break;case 13:const Z=i[l-1];Z.description=f.trimColon(i[l]),this.$=Z;break;case 14:this.$={stmt:"relation",state1:i[l-2],state2:i[l]};break;case 15:const mt=f.trimColon(i[l]);this.$={stmt:"relation",state1:i[l-3],state2:i[l-1],description:mt};break;case 19:this.$={stmt:"state",id:i[l-3],type:"default",description:"",doc:i[l-1]};break;case 20:var G=i[l],K=i[l-2].trim();if(i[l].match(":")){var ct=i[l].split(":");G=ct[0],K=[K,ct[1]]}this.$={stmt:"state",id:G,type:"default",description:K};break;case 21:this.$={stmt:"state",id:i[l-3],type:"default",description:i[l-5],doc:i[l-1]};break;case 22:this.$={stmt:"state",id:i[l],type:"fork"};break;case 23:this.$={stmt:"state",id:i[l],type:"join"};break;case 24:this.$={stmt:"state",id:i[l],type:"choice"};break;case 25:this.$={stmt:"state",id:f.getDividerId(),type:"divider"};break;case 26:this.$={stmt:"state",id:i[l-1].trim(),note:{position:i[l-2].trim(),text:i[l].trim()}};break;case 29:this.$=i[l].trim(),f.setAccTitle(this.$);break;case 30:case 31:this.$=i[l].trim(),f.setAccDescription(this.$);break;case 32:this.$={stmt:"click",id:i[l-3],url:i[l-2],tooltip:i[l-1]};break;case 33:this.$={stmt:"click",id:i[l-3],url:i[l-1],tooltip:""};break;case 34:case 35:this.$={stmt:"classDef",id:i[l-1].trim(),classes:i[l].trim()};break;case 36:this.$={stmt:"style",id:i[l-1].trim(),styleClass:i[l].trim()};break;case 37:this.$={stmt:"applyClass",id:i[l-1].trim(),styleClass:i[l].trim()};break;case 38:f.setDirection("TB"),this.$={stmt:"dir",value:"TB"};break;case 39:f.setDirection("BT"),this.$={stmt:"dir",value:"BT"};break;case 40:f.setDirection("RL"),this.$={stmt:"dir",value:"RL"};break;case 41:f.setDirection("LR"),this.$={stmt:"dir",value:"LR"};break;case 44:case 45:this.$={stmt:"state",id:i[l].trim(),type:"default",description:""};break;case 46:this.$={stmt:"state",id:i[l-2].trim(),classes:[i[l].trim()],type:"default",description:""};break;case 47:this.$={stmt:"state",id:i[l-2].trim(),classes:[i[l].trim()],type:"default",description:""};break}},"anonymous"),table:[{3:1,4:e,5:o,6:s},{1:[3]},{3:5,4:e,5:o,6:s},{3:6,4:e,5:o,6:s},t([1,4,5,16,17,19,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],c,{7:7}),{1:[2,1]},{1:[2,2]},{1:[2,3],4:a,5:u,8:8,9:10,10:12,11:13,12:14,13:15,16:m,17:p,19:S,22:D,24:g,25:O,26:L,27:B,28:N,29:v,32:25,33:h,35:E,37:I,38:x,41:F,45:Y,48:z,51:it,52:rt,53:nt,54:ot,57:V},t(y,[2,5]),{9:39,10:12,11:13,12:14,13:15,16:m,17:p,19:S,22:D,24:g,25:O,26:L,27:B,28:N,29:v,32:25,33:h,35:E,37:I,38:x,41:F,45:Y,48:z,51:it,52:rt,53:nt,54:ot,57:V},t(y,[2,7]),t(y,[2,8]),t(y,[2,9]),t(y,[2,10]),t(y,[2,11]),t(y,[2,12],{14:[1,40],15:[1,41]}),t(y,[2,16]),{18:[1,42]},t(y,[2,18],{20:[1,43]}),{23:[1,44]},t(y,[2,22]),t(y,[2,23]),t(y,[2,24]),t(y,[2,25]),{30:45,31:[1,46],59:[1,47],60:[1,48]},t(y,[2,28]),{34:[1,49]},{36:[1,50]},t(y,[2,31]),{13:51,24:g,57:V},{42:[1,52],44:[1,53]},{46:[1,54]},{49:[1,55]},t(at,[2,44],{58:[1,56]}),t(at,[2,45],{58:[1,57]}),t(y,[2,38]),t(y,[2,39]),t(y,[2,40]),t(y,[2,41]),t(y,[2,6]),t(y,[2,13]),{13:58,24:g,57:V},t(y,[2,17]),t(Ct,c,{7:59}),{24:[1,60]},{24:[1,61]},{23:[1,62]},{24:[2,48]},{24:[2,49]},t(y,[2,29]),t(y,[2,30]),{39:[1,63],40:[1,64]},{43:[1,65]},{43:[1,66]},{47:[1,67]},{50:[1,68]},{24:[1,69]},{24:[1,70]},t(y,[2,14],{14:[1,71]}),{4:a,5:u,8:8,9:10,10:12,11:13,12:14,13:15,16:m,17:p,19:S,21:[1,72],22:D,24:g,25:O,26:L,27:B,28:N,29:v,32:25,33:h,35:E,37:I,38:x,41:F,45:Y,48:z,51:it,52:rt,53:nt,54:ot,57:V},t(y,[2,20],{20:[1,73]}),{31:[1,74]},{24:[1,75]},{39:[1,76]},{39:[1,77]},t(y,[2,34]),t(y,[2,35]),t(y,[2,36]),t(y,[2,37]),t(at,[2,46]),t(at,[2,47]),t(y,[2,15]),t(y,[2,19]),t(Ct,c,{7:78}),t(y,[2,26]),t(y,[2,27]),{5:[1,79]},{5:[1,80]},{4:a,5:u,8:8,9:10,10:12,11:13,12:14,13:15,16:m,17:p,19:S,21:[1,81],22:D,24:g,25:O,26:L,27:B,28:N,29:v,32:25,33:h,35:E,37:I,38:x,41:F,45:Y,48:z,51:it,52:rt,53:nt,54:ot,57:V},t(y,[2,32]),t(y,[2,33]),t(y,[2,21])],defaultActions:{5:[2,1],6:[2,2],47:[2,48],48:[2,49]},parseError:d(function(P,n){if(n.recoverable)this.trace(P);else{var r=new Error(P);throw r.hash=n,r}},"parseError"),parse:d(function(P){var n=this,r=[0],f=[],T=[null],i=[],_=this.table,l="",G=0,K=0,ct=2,Z=1,mt=i.slice.call(arguments,1),b=Object.create(this.lexer),M={yy:{}};for(var St in this.yy)Object.prototype.hasOwnProperty.call(this.yy,St)&&(M.yy[St]=this.yy[St]);b.setInput(P,M.yy),M.yy.lexer=b,M.yy.parser=this,typeof b.yylloc>"u"&&(b.yylloc={});var Tt=b.yylloc;i.push(Tt);var Zt=b.options&&b.options.ranges;typeof M.yy.parseError=="function"?this.parseError=M.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function Qt(A){r.length=r.length-2*A,T.length=T.length-A,i.length=i.length-A}d(Qt,"popStack");function Lt(){var A;return A=f.pop()||b.lex()||Z,typeof A!="number"&&(A instanceof Array&&(f=A,A=f.pop()),A=n.symbols_[A]||A),A}d(Lt,"lex");for(var C,j,w,kt,q={},ht,W,It,dt;;){if(j=r[r.length-1],this.defaultActions[j]?w=this.defaultActions[j]:((C===null||typeof C>"u")&&(C=Lt()),w=_[j]&&_[j][C]),typeof w>"u"||!w.length||!w[0]){var _t="";dt=[];for(ht in _[j])this.terminals_[ht]&&ht>ct&&dt.push("'"+this.terminals_[ht]+"'");b.showPosition?_t="Parse error on line "+(G+1)+`:
`+b.showPosition()+`
Expecting `+dt.join(", ")+", got '"+(this.terminals_[C]||C)+"'":_t="Parse error on line "+(G+1)+": Unexpected "+(C==Z?"end of input":"'"+(this.terminals_[C]||C)+"'"),this.parseError(_t,{text:b.match,token:this.terminals_[C]||C,line:b.yylineno,loc:Tt,expected:dt})}if(w[0]instanceof Array&&w.length>1)throw new Error("Parse Error: multiple actions possible at state: "+j+", token: "+C);switch(w[0]){case 1:r.push(C),T.push(b.yytext),i.push(b.yylloc),r.push(w[1]),C=null,K=b.yyleng,l=b.yytext,G=b.yylineno,Tt=b.yylloc;break;case 2:if(W=this.productions_[w[1]][1],q.$=T[T.length-W],q._$={first_line:i[i.length-(W||1)].first_line,last_line:i[i.length-1].last_line,first_column:i[i.length-(W||1)].first_column,last_column:i[i.length-1].last_column},Zt&&(q._$.range=[i[i.length-(W||1)].range[0],i[i.length-1].range[1]]),kt=this.performAction.apply(q,[l,K,G,M.yy,w[1],T,i].concat(mt)),typeof kt<"u")return kt;W&&(r=r.slice(0,-1*W*2),T=T.slice(0,-1*W),i=i.slice(0,-1*W)),r.push(this.productions_[w[1]][0]),T.push(q.$),i.push(q._$),It=_[r[r.length-2]][r[r.length-1]],r.push(It);break;case 3:return!0}}return!0},"parse")},Ht=(function(){var P={EOF:1,parseError:d(function(n,r){if(this.yy.parser)this.yy.parser.parseError(n,r);else throw new Error(n)},"parseError"),setInput:d(function(n,r){return this.yy=r||this.yy||{},this._input=n,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},"setInput"),input:d(function(){var n=this._input[0];this.yytext+=n,this.yyleng++,this.offset++,this.match+=n,this.matched+=n;var r=n.match(/(?:\r\n?|\n).*/g);return r?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),n},"input"),unput:d(function(n){var r=n.length,f=n.split(/(?:\r\n?|\n)/g);this._input=n+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-r),this.offset-=r;var T=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),f.length-1&&(this.yylineno-=f.length-1);var i=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:f?(f.length===T.length?this.yylloc.first_column:0)+T[T.length-f.length].length-f[0].length:this.yylloc.first_column-r},this.options.ranges&&(this.yylloc.range=[i[0],i[0]+this.yyleng-r]),this.yyleng=this.yytext.length,this},"unput"),more:d(function(){return this._more=!0,this},"more"),reject:d(function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:"",token:null,line:this.yylineno});return this},"reject"),less:d(function(n){this.unput(this.match.slice(n))},"less"),pastInput:d(function(){var n=this.matched.substr(0,this.matched.length-this.match.length);return(n.length>20?"...":"")+n.substr(-20).replace(/\n/g,"")},"pastInput"),upcomingInput:d(function(){var n=this.match;return n.length<20&&(n+=this._input.substr(0,20-n.length)),(n.substr(0,20)+(n.length>20?"...":"")).replace(/\n/g,"")},"upcomingInput"),showPosition:d(function(){var n=this.pastInput(),r=new Array(n.length+1).join("-");return n+this.upcomingInput()+`
`+r+"^"},"showPosition"),test_match:d(function(n,r){var f,T,i;if(this.options.backtrack_lexer&&(i={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(i.yylloc.range=this.yylloc.range.slice(0))),T=n[0].match(/(?:\r\n?|\n).*/g),T&&(this.yylineno+=T.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:T?T[T.length-1].length-T[T.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+n[0].length},this.yytext+=n[0],this.match+=n[0],this.matches=n,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(n[0].length),this.matched+=n[0],f=this.performAction.call(this,this.yy,this,r,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),f)return f;if(this._backtrack){for(var _ in i)this[_]=i[_];return!1}return!1},"test_match"),next:d(function(){if(this.done)return this.EOF;this._input||(this.done=!0);var n,r,f,T;this._more||(this.yytext="",this.match="");for(var i=this._currentRules(),_=0;_<i.length;_++)if(f=this._input.match(this.rules[i[_]]),f&&(!r||f[0].length>r[0].length)){if(r=f,T=_,this.options.backtrack_lexer){if(n=this.test_match(f,i[_]),n!==!1)return n;if(this._backtrack){r=!1;continue}else return!1}else if(!this.options.flex)break}return r?(n=this.test_match(r,i[T]),n!==!1?n:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},"next"),lex:d(function(){var n=this.next();return n||this.lex()},"lex"),begin:d(function(n){this.conditionStack.push(n)},"begin"),popState:d(function(){var n=this.conditionStack.length-1;return n>0?this.conditionStack.pop():this.conditionStack[0]},"popState"),_currentRules:d(function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},"_currentRules"),topState:d(function(n){return n=this.conditionStack.length-1-Math.abs(n||0),n>=0?this.conditionStack[n]:"INITIAL"},"topState"),pushState:d(function(n){this.begin(n)},"pushState"),stateStackSize:d(function(){return this.conditionStack.length},"stateStackSize"),options:{"case-insensitive":!0},performAction:d(function(n,r,f,T){function i(){const _=r.yytext.indexOf("%%");if(_===0)return!1;if(_>0){const l=r.yytext.slice(0,_),G=r.yytext.slice(_);G&&n.lexer.unput(G),r.yytext=l}return!0}switch(d(i,"processId"),f){case 0:return 38;case 1:return 40;case 2:return 39;case 3:return 44;case 4:return 51;case 5:return 52;case 6:return 53;case 7:return 54;case 8:return 5;case 9:break;case 10:break;case 11:break;case 12:break;case 13:return this.pushState("SCALE"),17;case 14:return 18;case 15:this.popState();break;case 16:return this.begin("acc_title"),33;case 17:return this.popState(),"acc_title_value";case 18:return this.begin("acc_descr"),35;case 19:return this.popState(),"acc_descr_value";case 20:this.begin("acc_descr_multiline");break;case 21:this.popState();break;case 22:return"acc_descr_multiline_value";case 23:return this.pushState("CLASSDEF"),41;case 24:return this.popState(),this.pushState("CLASSDEFID"),"DEFAULT_CLASSDEF_ID";case 25:return this.popState(),this.pushState("CLASSDEFID"),42;case 26:return this.popState(),43;case 27:return this.pushState("CLASS"),48;case 28:return this.popState(),this.pushState("CLASS_STYLE"),49;case 29:return this.popState(),50;case 30:return this.pushState("STYLE"),45;case 31:return this.popState(),this.pushState("STYLEDEF_STYLES"),46;case 32:return this.popState(),47;case 33:return this.pushState("SCALE"),17;case 34:return 18;case 35:this.popState();break;case 36:this.pushState("STATE");break;case 37:return this.popState(),r.yytext=r.yytext.slice(0,-8).trim(),25;case 38:return this.popState(),r.yytext=r.yytext.slice(0,-8).trim(),26;case 39:return this.popState(),r.yytext=r.yytext.slice(0,-10).trim(),27;case 40:return this.popState(),r.yytext=r.yytext.slice(0,-8).trim(),25;case 41:return this.popState(),r.yytext=r.yytext.slice(0,-8).trim(),26;case 42:return this.popState(),r.yytext=r.yytext.slice(0,-10).trim(),27;case 43:return 51;case 44:return 52;case 45:return 53;case 46:return 54;case 47:this.pushState("STATE_STRING");break;case 48:return this.pushState("STATE_ID"),"AS";case 49:return i()?(this.popState(),"ID"):void 0;case 50:this.popState();break;case 51:return"STATE_DESCR";case 52:throw new Error('Error: State name must be a single word. Found: "'+r.yytext.trim()+'"');case 53:return 19;case 54:this.popState();break;case 55:return this.popState(),this.pushState("struct"),20;case 56:return this.popState(),21;case 57:break;case 58:return this.begin("NOTE"),29;case 59:return this.popState(),this.pushState("NOTE_ID"),59;case 60:return this.popState(),this.pushState("NOTE_ID"),60;case 61:this.popState(),this.pushState("FLOATING_NOTE");break;case 62:return this.popState(),this.pushState("FLOATING_NOTE_ID"),"AS";case 63:break;case 64:return"NOTE_TEXT";case 65:return i()?(this.popState(),"ID"):void 0;case 66:return i()?(this.popState(),this.pushState("NOTE_TEXT"),24):void 0;case 67:return this.popState(),r.yytext=r.yytext.substr(2).trim(),31;case 68:return this.popState(),r.yytext=r.yytext.slice(0,-8).trim(),31;case 69:return 6;case 70:return 6;case 71:return 16;case 72:return 57;case 73:return i()?24:void 0;case 74:return r.yytext=r.yytext.trim(),14;case 75:return 15;case 76:return 28;case 77:return 58;case 78:return 5;case 79:return"INVALID"}},"anonymous"),rules:[/^(?:click\b)/i,/^(?:href\b)/i,/^(?:"[^"]*")/i,/^(?:default\b)/i,/^(?:.*direction\s+TB[^\n]*)/i,/^(?:.*direction\s+BT[^\n]*)/i,/^(?:.*direction\s+RL[^\n]*)/i,/^(?:.*direction\s+LR[^\n]*)/i,/^(?:[\n]+)/i,/^(?:[\s]+)/i,/^(?:((?!\n)\s)+)/i,/^(?:#[^\n]*)/i,/^(?:%%(?!\{)[^\n]*)/i,/^(?:scale\s+)/i,/^(?:\d+)/i,/^(?:\s+width\b)/i,/^(?:accTitle\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*\{\s*)/i,/^(?:[\}])/i,/^(?:[^\}]*)/i,/^(?:classDef\s+)/i,/^(?:DEFAULT\s+)/i,/^(?:\w+\s+)/i,/^(?:[^\n]*)/i,/^(?:class\s+)/i,/^(?:(\w+)+((,\s*\w+)*))/i,/^(?:[^\n]*)/i,/^(?:style\s+)/i,/^(?:[\w,]+\s+)/i,/^(?:[^\n]*)/i,/^(?:scale\s+)/i,/^(?:\d+)/i,/^(?:\s+width\b)/i,/^(?:state\s+)/i,/^(?:.*<<fork>>)/i,/^(?:.*<<join>>)/i,/^(?:.*<<choice>>)/i,/^(?:.*\[\[fork\]\])/i,/^(?:.*\[\[join\]\])/i,/^(?:.*\[\[choice\]\])/i,/^(?:.*direction\s+TB[^\n]*)/i,/^(?:.*direction\s+BT[^\n]*)/i,/^(?:.*direction\s+RL[^\n]*)/i,/^(?:.*direction\s+LR[^\n]*)/i,/^(?:["])/i,/^(?:\s*as\s+)/i,/^(?:[^\n\{]*)/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:\w+\s+\w+.*?\{)/i,/^(?:[^\n\s\{]+)/i,/^(?:\n)/i,/^(?:\{)/i,/^(?:\})/i,/^(?:[\n])/i,/^(?:note\s+)/i,/^(?:left of\b)/i,/^(?:right of\b)/i,/^(?:")/i,/^(?:\s*as\s*)/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:[^\n]*)/i,/^(?:\s*[^:\n\s\-]+)/i,/^(?:\s*:[^:\n;]+)/i,/^(?:[\s\S]*?\n\s*end note\b)/i,/^(?:stateDiagram\s+)/i,/^(?:stateDiagram-v2\s+)/i,/^(?:hide empty description\b)/i,/^(?:\[\*\])/i,/^(?:[^:\n\s\-\{]+)/i,/^(?:\s*:(?:[^:\n;]|:[^:\n;])+)/i,/^(?:-->)/i,/^(?:--)/i,/^(?::::)/i,/^(?:$)/i,/^(?:.)/i],conditions:{LINE:{rules:[10,11,12],inclusive:!1},struct:{rules:[10,11,12,23,27,30,36,43,44,45,46,56,57,58,72,73,74,75,76,77],inclusive:!1},FLOATING_NOTE_ID:{rules:[65],inclusive:!1},FLOATING_NOTE:{rules:[62,63,64],inclusive:!1},NOTE_TEXT:{rules:[67,68],inclusive:!1},NOTE_ID:{rules:[66],inclusive:!1},NOTE:{rules:[59,60,61],inclusive:!1},STYLEDEF_STYLEOPTS:{rules:[],inclusive:!1},STYLEDEF_STYLES:{rules:[32],inclusive:!1},STYLE_IDS:{rules:[],inclusive:!1},STYLE:{rules:[31],inclusive:!1},CLASS_STYLE:{rules:[29],inclusive:!1},CLASS:{rules:[28],inclusive:!1},CLASSDEFID:{rules:[26],inclusive:!1},CLASSDEF:{rules:[24,25],inclusive:!1},acc_descr_multiline:{rules:[21,22],inclusive:!1},acc_descr:{rules:[19],inclusive:!1},acc_title:{rules:[17],inclusive:!1},SCALE:{rules:[14,15,34,35],inclusive:!1},ALIAS:{rules:[],inclusive:!1},STATE_ID:{rules:[49],inclusive:!1},STATE_STRING:{rules:[50,51],inclusive:!1},FORK_STATE:{rules:[],inclusive:!1},STATE:{rules:[10,11,12,37,38,39,40,41,42,47,48,52,53,54,55],inclusive:!1},ID:{rules:[10,11,12],inclusive:!1},INITIAL:{rules:[0,1,2,3,4,5,6,7,8,9,11,12,13,16,18,20,23,27,30,33,36,55,58,69,70,71,72,73,74,75,77,78,79],inclusive:!0}}};return P})();gt.lexer=Ht;function lt(){this.yy={}}return d(lt,"Parser"),lt.prototype=gt,gt.Parser=lt,new lt})();vt.parser=vt;var Ue=vt,ye="TB",Yt="TB",At="dir",H="state",J="root",xt="relation",fe="classDef",ge="style",me="applyClass",et="default",Pt="divider",Gt="fill:none",Wt="fill: #333",zt="c",Ut="markdown",Mt="normal",Et="rect",Dt="rectWithTitle",Se="stateStart",Te="stateEnd",wt="divider",Ot="roundedWithTitle",ke="note",_e="noteGroup",st="statediagram",be="state",Ee=`${st}-${be}`,jt="transition",De="note",ve="note-edge",xe=`${jt} ${ve}`,$e=`${st}-${De}`,Ce="cluster",Le=`${st}-${Ce}`,Ie="cluster-alt",Ae=`${st}-${Ie}`,Xt="parent",Vt="note",we="state",$t="----",Oe=`${$t}${Vt}`,Nt=`${$t}${Xt}`,Kt=d((t,e=Yt)=>{if(!t.doc)return e;let o=e;for(const s of t.doc)s.stmt==="dir"&&(o=s.value);return o},"getDir"),Ne=d(function(t,e){return e.db.getClasses()},"getClasses"),Re=d(async function(t,e,o,s){k.info("REF0:"),k.info("Drawing state diagram (v2)",e);const{securityLevel:c,state:a,layout:u}=R();s.db.extract(s.db.getRootDocV2());const m=s.db.getData(),p=te(e,c);m.type=s.type,m.layoutAlgorithm=u,m.nodeSpacing=(a==null?void 0:a.nodeSpacing)||50,m.rankSpacing=(a==null?void 0:a.rankSpacing)||50,R().look==="neo"?m.markers=["barbNeo"]:m.markers=["barb"],m.diagramId=e,await se(m,p);const S=8;try{(typeof s.db.getLinks=="function"?s.db.getLinks():new Map).forEach((D,g)=>{var O;const L=typeof g=="string"?g:typeof(g==null?void 0:g.id)=="string"?g.id:"",B=m.nodes.find(x=>x.id===L);if(!L){k.warn("⚠️ Invalid or missing stateId from key:",JSON.stringify(g));return}const N=(O=p.node())==null?void 0:O.querySelectorAll("g.node, g.rough-node");let v;if(N==null||N.forEach(x=>{var F;const Y=(F=x.textContent)==null?void 0:F.trim();(x.id===(B==null?void 0:B.domId)||Y===L)&&(v=x)}),!v){k.warn("⚠️ Could not find node matching text:",L);return}const h=v.parentNode;if(!h){k.warn("⚠️ Node has no parent, cannot wrap:",L);return}const E=document.createElementNS("http://www.w3.org/2000/svg","a"),I=D.url.replace(/^"+|"+$/g,"");if(E.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",I),E.setAttribute("target","_blank"),D.tooltip){const x=D.tooltip.replace(/^"+|"+$/g,"");E.setAttribute("title",x),v.setAttribute("title",x)}h.replaceChild(E,v),E.appendChild(v),k.info("🔗 Wrapped node in <a> tag for:",L,D.url)})}catch(D){k.error("❌ Error injecting clickable links:",D)}ie.insertTitle(p,"statediagramTitleText",(a==null?void 0:a.titleTopMargin)??25,s.db.getDiagramTitle()),ee(p,S,st,(a==null?void 0:a.useMaxWidth)??!0)},"draw"),Me={getClasses:Ne,draw:Re,getDir:Kt},yt=new Map,U=0;function ft(t="",e=0,o="",s=$t){const c=o!==null&&o.length>0?`${s}${o}`:"";return`${we}-${t}${c}-${e}`}d(ft,"stateDomId");var Be=d((t,e,o,s,c,a,u,m)=>{k.trace("items",e),e.forEach(p=>{switch(p.stmt){case H:tt(t,p,o,s,c,a,u,m);break;case et:tt(t,p,o,s,c,a,u,m);break;case xt:{tt(t,p.state1,o,s,c,a,u,m),tt(t,p.state2,o,s,c,a,u,m);const S=u==="neo",D={id:"edge"+U,start:p.state1.id,end:p.state2.id,arrowhead:"normal",arrowTypeEnd:S?"arrow_barb_neo":"arrow_barb",style:Gt,labelStyle:"",label:X.sanitizeText(p.description??"",R()),arrowheadStyle:Wt,labelpos:zt,labelType:Ut,thickness:Mt,classes:jt,look:u};c.push(D),U++}break}})},"setupDoc"),Rt=d((t,e=Yt)=>{let o=e;if(t.doc)for(const s of t.doc)s.stmt==="dir"&&(o=s.value);return o},"getDir");function Q(t,e,o){if(!e.id||e.id==="</join></fork>"||e.id==="</choice>")return;e.cssClasses&&(Array.isArray(e.cssCompiledStyles)||(e.cssCompiledStyles=[]),e.cssClasses.split(" ").forEach(c=>{const a=o.get(c);a&&(e.cssCompiledStyles=[...e.cssCompiledStyles??[],...a.styles])}));const s=t.find(c=>c.id===e.id);s?Object.assign(s,e):t.push(e)}d(Q,"insertOrUpdateNode");function qt(t){var e;return((e=t==null?void 0:t.classes)==null?void 0:e.join(" "))??""}d(qt,"getClassesFromDbInfo");function Jt(t){return(t==null?void 0:t.styles)??[]}d(Jt,"getStylesFromDbInfo");var tt=d((t,e,o,s,c,a,u,m)=>{var p,S,D;const g=e.id,O=o.get(g),L=qt(O),B=Jt(O),N=R();if(k.info("dataFetcher parsedItem",e,O,B),g!=="root"){let v=Et;e.start===!0?v=Se:e.start===!1&&(v=Te),e.type!==et&&(v=e.type),yt.get(g)||yt.set(g,{id:g,shape:v,description:X.sanitizeText(g,N),cssClasses:`${L} ${Ee}`,cssStyles:B});const h=yt.get(g);e.description&&(Array.isArray(h.description)?(h.shape=Dt,h.description.push(e.description)):(p=h.description)!=null&&p.length&&h.description.length>0?(h.shape=Dt,h.description===g?h.description=[e.description]:h.description=[h.description,e.description]):(h.shape=Et,h.description=e.description),h.description=X.sanitizeTextOrArray(h.description,N)),((S=h.description)==null?void 0:S.length)===1&&h.shape===Dt&&(h.type==="group"?h.shape=Ot:h.shape=Et),!h.type&&e.doc&&(k.info("Setting cluster for XCX",g,Rt(e)),h.type="group",h.isGroup=!0,h.dir=Rt(e),h.explicitDir=e.doc.some(I=>I.stmt==="dir"),h.shape=e.type===Pt?wt:Ot,h.cssClasses=`${h.cssClasses} ${Le} ${a?Ae:""}`);const E={labelStyle:"",shape:h.shape,label:h.description,cssClasses:h.cssClasses,cssCompiledStyles:[],cssStyles:h.cssStyles,id:g,dir:h.dir,domId:ft(g,U),type:h.type,isGroup:h.type==="group",padding:8,rx:10,ry:10,look:u,labelType:"markdown"};if(E.shape===wt&&(E.label=""),t&&t.id!=="root"&&(k.trace("Setting node ",g," to be child of its parent ",t.id),E.parentId=t.id),E.centerLabel=!0,e.note){const I={labelStyle:"",shape:ke,label:e.note.text,labelType:"markdown",cssClasses:$e,cssStyles:[],cssCompiledStyles:[],id:g+Oe+"-"+U,domId:ft(g,U,Vt),type:h.type,isGroup:h.type==="group",padding:(D=N.flowchart)==null?void 0:D.padding,look:u,position:e.note.position},x=g+Nt,F={labelStyle:"",shape:_e,label:e.note.text,cssClasses:h.cssClasses,cssStyles:[],id:g+Nt,domId:ft(g,U,Xt),type:"group",isGroup:!0,padding:16,look:u,position:e.note.position};U++,F.id=x,I.parentId=x,Q(s,F,m),Q(s,I,m),Q(s,E,m);let Y=g,z=I.id;e.note.position==="left of"&&(Y=I.id,z=g),c.push({id:Y+"-"+z,start:Y,end:z,arrowhead:"none",arrowTypeEnd:"",style:Gt,labelStyle:"",classes:xe,arrowheadStyle:Wt,labelpos:zt,labelType:Ut,thickness:Mt,look:u})}else Q(s,E,m)}e.doc&&(k.trace("Adding nodes children "),Be(e,e.doc,o,s,c,!a,u,m))},"dataFetcher"),Fe=d(()=>{yt.clear(),U=0},"reset"),$={START_NODE:"[*]",START_TYPE:"start",END_NODE:"[*]",END_TYPE:"end",COLOR_KEYWORD:"color",FILL_KEYWORD:"fill",BG_FILL:"bgFill",STYLECLASS_SEP:","},Bt=d(()=>new Map,"newClassesList"),Ft=d(()=>({relations:[],states:new Map,documents:{}}),"newDoc"),ut=d(t=>JSON.parse(JSON.stringify(t)),"clone"),pt,je=(pt=class{constructor(t){this.version=t,this.nodes=[],this.edges=[],this.rootDoc=[],this.classes=Bt(),this.documents={root:Ft()},this.currentDocument=this.documents.root,this.startEndCount=0,this.dividerCnt=0,this.links=new Map,this.funs=[],this.getAccTitle=re,this.setAccTitle=ne,this.getAccDescription=oe,this.setAccDescription=ae,this.setDiagramTitle=le,this.getDiagramTitle=ce,this.clear(),this.setRootDoc=this.setRootDoc.bind(this),this.getDividerId=this.getDividerId.bind(this),this.setDirection=this.setDirection.bind(this),this.trimColon=this.trimColon.bind(this),this.bindFunctions=this.bindFunctions.bind(this)}extract(t){this.clear(!0);for(const s of Array.isArray(t)?t:t.doc)switch(s.stmt){case H:this.addState(s.id.trim(),s.type,s.doc,s.description,s.note);break;case xt:this.addRelation(s.state1,s.state2,s.description);break;case fe:this.addStyleClass(s.id.trim(),s.classes);break;case ge:this.handleStyleDef(s);break;case me:this.setCssClass(s.id.trim(),s.styleClass);break;case"click":this.addLink(s.id,s.url,s.tooltip);break}const e=this.getStates(),o=R();Fe(),tt(void 0,this.getRootDocV2(),e,this.nodes,this.edges,!0,o.look,this.classes);for(const s of this.nodes)if(Array.isArray(s.label)){if(s.description=s.label.slice(1),s.isGroup&&s.description.length>0)throw new Error(`Group nodes can only have label. Remove the additional description for node [${s.id}]`);s.label=s.label[0]}}handleStyleDef(t){const e=t.id.trim().split(","),o=t.styleClass.split(",");for(const s of e){let c=this.getState(s);if(!c){const a=s.trim();this.addState(a),c=this.getState(a)}c&&(c.styles=o.map(a=>{var u;return(u=a.replace(/;/g,""))==null?void 0:u.trim()}))}}setRootDoc(t){k.info("Setting root doc",t),this.rootDoc=t,this.version===1?this.extract(t):this.extract(this.getRootDocV2())}docTranslator(t,e,o){if(e.stmt===xt){this.docTranslator(t,e.state1,!0),this.docTranslator(t,e.state2,!1);return}if(e.stmt===H&&(e.id===$.START_NODE?(e.id=t.id+(o?"_start":"_end"),e.start=o):e.id=e.id.trim()),e.stmt!==J&&e.stmt!==H||!e.doc)return;const s=[];let c=[];for(const a of e.doc)if(a.type===Pt){const u=ut(a);u.doc=ut(c),s.push(u),c=[]}else c.push(a);if(s.length>0&&c.length>0){const a={stmt:H,id:he(),type:"divider",doc:ut(c)};s.push(ut(a)),e.doc=s}e.doc.forEach(a=>this.docTranslator(e,a,!0))}getRootDocV2(){return this.docTranslator({id:J,stmt:J},{id:J,stmt:J,doc:this.rootDoc},!0),{id:J,doc:this.rootDoc}}addState(t,e=et,o=void 0,s=void 0,c=void 0,a=void 0,u=void 0,m=void 0){const p=t==null?void 0:t.trim();if(!this.currentDocument.states.has(p))k.info("Adding state ",p,s),this.currentDocument.states.set(p,{stmt:H,id:p,descriptions:[],type:e,doc:o,note:c,classes:[],styles:[],textStyles:[]});else{const S=this.currentDocument.states.get(p);if(!S)throw new Error(`State not found: ${p}`);S.doc||(S.doc=o),S.type||(S.type=e)}if(s&&(k.info("Setting state description",p,s),(Array.isArray(s)?s:[s]).forEach(S=>this.addDescription(p,S.trim()))),c){const S=this.currentDocument.states.get(p);if(!S)throw new Error(`State not found: ${p}`);S.note=c,S.note.text=X.sanitizeText(S.note.text,R())}a&&(k.info("Setting state classes",p,a),(Array.isArray(a)?a:[a]).forEach(S=>this.setCssClass(p,S.trim()))),u&&(k.info("Setting state styles",p,u),(Array.isArray(u)?u:[u]).forEach(S=>this.setStyle(p,S.trim()))),m&&(k.info("Setting state styles",p,u),(Array.isArray(m)?m:[m]).forEach(S=>this.setTextStyle(p,S.trim())))}clear(t){this.nodes=[],this.edges=[],this.funs=[this.setupToolTips.bind(this)],this.documents={root:Ft()},this.currentDocument=this.documents.root,this.startEndCount=0,this.classes=Bt(),t||(this.links=new Map,de())}getState(t){return this.currentDocument.states.get(t)}getStates(){return this.currentDocument.states}logDocuments(){k.info("Documents = ",this.documents)}getRelations(){return this.currentDocument.relations}addLink(t,e,o){this.links.set(t,{url:e,tooltip:o}),k.warn("Adding link",t,e,o)}getLinks(){return this.links}startIdIfNeeded(t=""){return t===$.START_NODE?(this.startEndCount++,`${$.START_TYPE}${this.startEndCount}`):t}startTypeIfNeeded(t="",e=et){return t===$.START_NODE?$.START_TYPE:e}endIdIfNeeded(t=""){return t===$.END_NODE?(this.startEndCount++,`${$.END_TYPE}${this.startEndCount}`):t}endTypeIfNeeded(t="",e=et){return t===$.END_NODE?$.END_TYPE:e}addRelationObjs(t,e,o=""){const s=this.startIdIfNeeded(t.id.trim()),c=this.startTypeIfNeeded(t.id.trim(),t.type),a=this.startIdIfNeeded(e.id.trim()),u=this.startTypeIfNeeded(e.id.trim(),e.type);this.addState(s,c,t.doc,t.description,t.note,t.classes,t.styles,t.textStyles),this.addState(a,u,e.doc,e.description,e.note,e.classes,e.styles,e.textStyles),this.currentDocument.relations.push({id1:s,id2:a,relationTitle:X.sanitizeText(o,R())})}addRelation(t,e,o){if(typeof t=="object"&&typeof e=="object")this.addRelationObjs(t,e,o);else if(typeof t=="string"&&typeof e=="string"){const s=this.startIdIfNeeded(t.trim()),c=this.startTypeIfNeeded(t),a=this.endIdIfNeeded(e.trim()),u=this.endTypeIfNeeded(e);this.addState(s,c),this.addState(a,u),this.currentDocument.relations.push({id1:s,id2:a,relationTitle:o?X.sanitizeText(o,R()):void 0})}}addDescription(t,e){var o;const s=this.currentDocument.states.get(t),c=e.startsWith(":")?e.replace(":","").trim():e;(o=s==null?void 0:s.descriptions)==null||o.push(X.sanitizeText(c,R()))}cleanupLabel(t){return t.startsWith(":")?t.slice(2).trim():t.trim()}getDividerId(){return this.dividerCnt++,`divider-id-${this.dividerCnt}`}addStyleClass(t,e=""){this.classes.has(t)||this.classes.set(t,{id:t,styles:[],textStyles:[]});const o=this.classes.get(t);e&&o&&e.split($.STYLECLASS_SEP).forEach(s=>{const c=s.replace(/([^;]*);/,"$1").trim();if(RegExp($.COLOR_KEYWORD).exec(s)){const a=c.replace($.FILL_KEYWORD,$.BG_FILL).replace($.COLOR_KEYWORD,$.FILL_KEYWORD);o.textStyles.push(a)}o.styles.push(c)})}getClasses(){return this.classes}setupToolTips(t){const e=pe();bt(t).select("svg").selectAll("g.node, g.rough-node").on("mouseover",o=>{var s;const c=bt(o.currentTarget),a=c.attr("title");if(a===null)return;const u=(s=o.currentTarget)==null?void 0:s.getBoundingClientRect();e.transition().duration(200).style("opacity",".9"),e.style("left",window.scrollX+u.left+(u.right-u.left)/2+"px").style("top",window.scrollY+u.bottom+"px"),e.html(ue.sanitize(a)),c.classed("hover",!0)}).on("mouseout",o=>{e.transition().duration(500).style("opacity",0),bt(o.currentTarget).classed("hover",!1)})}setCssClass(t,e){t.split(",").forEach(o=>{var s;let c=this.getState(o);if(!c){const a=o.trim();this.addState(a),c=this.getState(a)}(s=c==null?void 0:c.classes)==null||s.push(e)})}setStyle(t,e){var o,s;(s=(o=this.getState(t))==null?void 0:o.styles)==null||s.push(e)}setTextStyle(t,e){var o,s;(s=(o=this.getState(t))==null?void 0:o.textStyles)==null||s.push(e)}bindFunctions(t){this.funs.forEach(e=>{e(t)})}getDirectionStatement(){return this.rootDoc.find(t=>t.stmt===At)}getDirection(){var t;return((t=this.getDirectionStatement())==null?void 0:t.value)??ye}setDirection(t){const e=this.getDirectionStatement();e?e.value=t:this.rootDoc.unshift({stmt:At,value:t})}trimColon(t){return t.startsWith(":")?t.slice(1).trim():t.trim()}getData(){const t=R();return{nodes:this.nodes,edges:this.edges,other:{},config:t,direction:Kt(this.getRootDocV2())}}getConfig(){return R().state}},d(pt,"StateDB"),pt.relationType={AGGREGATION:0,EXTENSION:1,COMPOSITION:2,DEPENDENCY:3},pt),Ye=d(t=>`
defs [id$="-barbEnd"] {
    fill: ${t.transitionColor};
    stroke: ${t.transitionColor};
  }
g.stateGroup text {
  fill: ${t.nodeBorder};
  stroke: none;
  font-size: 10px;
}
g.stateGroup text {
  fill: ${t.textColor};
  stroke: none;
  font-size: 10px;

}
g.stateGroup .state-title {
  font-weight: bolder;
  fill: ${t.stateLabelColor};
}

g.stateGroup rect {
  fill: ${t.mainBkg};
  stroke: ${t.nodeBorder};
}

g.stateGroup line {
  stroke: ${t.lineColor};
  stroke-width: ${t.strokeWidth||1};
}

.transition {
  stroke: ${t.transitionColor};
  stroke-width: ${t.strokeWidth||1};
  fill: none;
}

.stateGroup .composit {
  fill: ${t.background};
  border-bottom: 1px
}

.stateGroup .alt-composit {
  fill: #e0e0e0;
  border-bottom: 1px
}

.state-note {
  stroke: ${t.noteBorderColor};
  fill: ${t.noteBkgColor};

  text {
    fill: ${t.noteTextColor};
    stroke: none;
    font-size: 10px;
  }
}

.stateLabel .box {
  stroke: none;
  stroke-width: 0;
  fill: ${t.mainBkg};
  opacity: 0.5;
}

.edgeLabel .label rect {
  fill: ${t.labelBackgroundColor};
  opacity: 0.5;
}
.edgeLabel {
  background-color: ${t.edgeLabelBackground};
  p {
    background-color: ${t.edgeLabelBackground};
  }
  rect {
    opacity: 0.5;
    background-color: ${t.edgeLabelBackground};
    fill: ${t.edgeLabelBackground};
  }
  text-align: center;
}
.edgeLabel .label text {
  fill: ${t.transitionLabelColor||t.tertiaryTextColor};
}
.label div .edgeLabel {
  color: ${t.transitionLabelColor||t.tertiaryTextColor};
}

.stateLabel text {
  fill: ${t.stateLabelColor};
  font-size: 10px;
  font-weight: bold;
}

.node circle.state-start {
  fill: ${t.specialStateColor};
  stroke: ${t.specialStateColor};
}

.node .fork-join {
  fill: ${t.specialStateColor};
  stroke: ${t.specialStateColor};
}

.node circle.state-end {
  fill: ${t.innerEndBackground};
  stroke: ${t.background};
  stroke-width: 1.5
}
.end-state-inner {
  fill: ${t.compositeBackground||t.background};
  // stroke: ${t.background};
  stroke-width: 1.5
}

.node rect {
  fill: ${t.stateBkg||t.mainBkg};
  stroke: ${t.stateBorder||t.nodeBorder};
  stroke-width: ${t.strokeWidth||1}px;
}
.node polygon {
  fill: ${t.mainBkg};
  stroke: ${t.stateBorder||t.nodeBorder};;
  stroke-width: ${t.strokeWidth||1}px;
}
[id$="-barbEnd"] {
  fill: ${t.lineColor};
}

.statediagram-cluster rect {
  fill: ${t.compositeTitleBackground};
  stroke: ${t.stateBorder||t.nodeBorder};
  stroke-width: ${t.strokeWidth||1}px;
}

.cluster-label, .nodeLabel {
  color: ${t.stateLabelColor};
  // line-height: 1;
}

.statediagram-cluster rect.outer {
  rx: 5px;
  ry: 5px;
}
.statediagram-state .divider {
  stroke: ${t.stateBorder||t.nodeBorder};
}

.statediagram-state .title-state {
  rx: 5px;
  ry: 5px;
}
.statediagram-cluster.statediagram-cluster .inner {
  fill: ${t.compositeBackground||t.background};
}
.statediagram-cluster.statediagram-cluster-alt .inner {
  fill: ${t.altBackground?t.altBackground:"#efefef"};
}

.statediagram-cluster .inner {
  rx:0;
  ry:0;
}

.statediagram-state rect.basic {
  rx: 5px;
  ry: 5px;
}
.statediagram-state rect.divider {
  stroke-dasharray: 10,10;
  fill: ${t.altBackground?t.altBackground:"#efefef"};
}

.note-edge {
  stroke-dasharray: 5;
}

.statediagram-note rect {
  fill: ${t.noteBkgColor};
  stroke: ${t.noteBorderColor};
  stroke-width: 1px;
  rx: 0;
  ry: 0;
}
.statediagram-note rect {
  fill: ${t.noteBkgColor};
  stroke: ${t.noteBorderColor};
  stroke-width: 1px;
  rx: 0;
  ry: 0;
}

.statediagram-note text {
  fill: ${t.noteTextColor};
}

.statediagram-note .nodeLabel {
  color: ${t.noteTextColor};
}
.statediagram .edgeLabel {
  color: red; // ${t.noteTextColor};
}

[id$="-dependencyStart"], [id$="-dependencyEnd"] {
  fill: ${t.lineColor};
  stroke: ${t.lineColor};
  stroke-width: ${t.strokeWidth||1};
}

.statediagramTitleText {
  text-anchor: middle;
  font-size: 18px;
  fill: ${t.textColor};
}

[data-look="neo"].statediagram-cluster rect {
  fill: ${t.mainBkg};
  stroke: ${t.useGradient?"url("+t.svgId+"-gradient)":t.stateBorder||t.nodeBorder};
  stroke-width: ${t.strokeWidth??1};
}
[data-look="neo"].statediagram-cluster rect.outer {
  rx: ${t.radius}px;
  ry: ${t.radius}px;
  filter: ${t.dropShadow?t.dropShadow.replace("url(#drop-shadow)",`url(${t.svgId}-drop-shadow)`):"none"}
}
`,"getStyles"),Xe=Ye;export{je as K,Ue as U,Me as W,Xe as X};
