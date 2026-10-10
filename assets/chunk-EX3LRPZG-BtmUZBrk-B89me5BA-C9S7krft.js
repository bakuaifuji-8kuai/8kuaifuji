import{a as te}from"./chunk-XXDRQBXY-CinZRrUc-BCY7jSXQ-D3yAhpck.js";import{l as ee}from"./chunk-VR4S4FIN-BBoZO6s4-DZQCUyX_-BA2E7lcR.js";import{Z as d,I as k,x as R,F as se,G as ie,k as re,l as ne,j as ae,i as oe,H as le,L as ce,av as he,s as X,U as de,h as _t,T as ue}from"./index-C38Q3iSC.js";import{w as pe}from"./chunk-32BRIVSS-B1bysRMQ-CRftgQYa-CB4hfSUm.js";var Dt=(function(){var t=d(function(P,n,r,f){for(r=r||{},f=P.length;f--;r[P[f]]=n);return r},"o"),e=[1,2],a=[1,3],s=[1,4],c=[2,4],o=[1,9],u=[1,11],S=[1,16],p=[1,17],m=[1,18],v=[1,19],g=[1,33],O=[1,20],L=[1,21],B=[1,22],N=[1,23],D=[1,24],h=[1,26],E=[1,27],A=[1,28],x=[1,29],F=[1,30],Y=[1,31],z=[1,32],it=[1,35],rt=[1,36],nt=[1,37],at=[1,38],M=[1,34],y=[1,4,5,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],ot=[1,4,5,14,15,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,39,40,41,45,48,51,52,53,54,57],Ct=[4,5,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],gt={trace:d(function(){},"trace"),yy:{},symbols_:{error:2,start:3,SPACE:4,NL:5,SD:6,document:7,line:8,statement:9,classDefStatement:10,styleStatement:11,cssClassStatement:12,idStatement:13,DESCR:14,"-->":15,HIDE_EMPTY:16,scale:17,WIDTH:18,COMPOSIT_STATE:19,STRUCT_START:20,STRUCT_STOP:21,STATE_DESCR:22,AS:23,ID:24,FORK:25,JOIN:26,CHOICE:27,CONCURRENT:28,note:29,notePosition:30,NOTE_TEXT:31,direction:32,acc_title:33,acc_title_value:34,acc_descr:35,acc_descr_value:36,acc_descr_multiline_value:37,CLICK:38,STRING:39,HREF:40,classDef:41,CLASSDEF_ID:42,CLASSDEF_STYLEOPTS:43,DEFAULT:44,style:45,STYLE_IDS:46,STYLEDEF_STYLEOPTS:47,class:48,CLASSENTITY_IDS:49,STYLECLASS:50,direction_tb:51,direction_bt:52,direction_rl:53,direction_lr:54,eol:55,";":56,EDGE_STATE:57,STYLE_SEPARATOR:58,left_of:59,right_of:60,$accept:0,$end:1},terminals_:{2:"error",4:"SPACE",5:"NL",6:"SD",14:"DESCR",15:"-->",16:"HIDE_EMPTY",17:"scale",18:"WIDTH",19:"COMPOSIT_STATE",20:"STRUCT_START",21:"STRUCT_STOP",22:"STATE_DESCR",23:"AS",24:"ID",25:"FORK",26:"JOIN",27:"CHOICE",28:"CONCURRENT",29:"note",31:"NOTE_TEXT",33:"acc_title",34:"acc_title_value",35:"acc_descr",36:"acc_descr_value",37:"acc_descr_multiline_value",38:"CLICK",39:"STRING",40:"HREF",41:"classDef",42:"CLASSDEF_ID",43:"CLASSDEF_STYLEOPTS",44:"DEFAULT",45:"style",46:"STYLE_IDS",47:"STYLEDEF_STYLEOPTS",48:"class",49:"CLASSENTITY_IDS",50:"STYLECLASS",51:"direction_tb",52:"direction_bt",53:"direction_rl",54:"direction_lr",56:";",57:"EDGE_STATE",58:"STYLE_SEPARATOR",59:"left_of",60:"right_of"},productions_:[0,[3,2],[3,2],[3,2],[7,0],[7,2],[8,2],[8,1],[8,1],[9,1],[9,1],[9,1],[9,1],[9,2],[9,3],[9,4],[9,1],[9,2],[9,1],[9,4],[9,3],[9,6],[9,1],[9,1],[9,1],[9,1],[9,4],[9,4],[9,1],[9,2],[9,2],[9,1],[9,5],[9,5],[10,3],[10,3],[11,3],[12,3],[32,1],[32,1],[32,1],[32,1],[55,1],[55,1],[13,1],[13,1],[13,3],[13,3],[30,1],[30,1]],performAction:d(function(P,n,r,f,T,i,b){var l=i.length-1;switch(T){case 3:return f.setRootDoc(i[l]),i[l];case 4:this.$=[];break;case 5:i[l]!="nl"&&(i[l-1].push(i[l]),this.$=i[l-1]);break;case 6:case 7:this.$=i[l];break;case 8:this.$="nl";break;case 12:this.$=i[l];break;case 13:const q=i[l-1];q.description=f.trimColon(i[l]),this.$=q;break;case 14:this.$={stmt:"relation",state1:i[l-2],state2:i[l]};break;case 15:const St=f.trimColon(i[l]);this.$={stmt:"relation",state1:i[l-3],state2:i[l-1],description:St};break;case 19:this.$={stmt:"state",id:i[l-3],type:"default",description:"",doc:i[l-1]};break;case 20:var G=i[l],J=i[l-2].trim();if(i[l].match(":")){var ct=i[l].split(":");G=ct[0],J=[J,ct[1]]}this.$={stmt:"state",id:G,type:"default",description:J};break;case 21:this.$={stmt:"state",id:i[l-3],type:"default",description:i[l-5],doc:i[l-1]};break;case 22:this.$={stmt:"state",id:i[l],type:"fork"};break;case 23:this.$={stmt:"state",id:i[l],type:"join"};break;case 24:this.$={stmt:"state",id:i[l],type:"choice"};break;case 25:this.$={stmt:"state",id:f.getDividerId(),type:"divider"};break;case 26:this.$={stmt:"state",id:i[l-1].trim(),note:{position:i[l-2].trim(),text:i[l].trim()}};break;case 29:this.$=i[l].trim(),f.setAccTitle(this.$);break;case 30:case 31:this.$=i[l].trim(),f.setAccDescription(this.$);break;case 32:this.$={stmt:"click",id:i[l-3],url:i[l-2],tooltip:i[l-1]};break;case 33:this.$={stmt:"click",id:i[l-3],url:i[l-1],tooltip:""};break;case 34:case 35:this.$={stmt:"classDef",id:i[l-1].trim(),classes:i[l].trim()};break;case 36:this.$={stmt:"style",id:i[l-1].trim(),styleClass:i[l].trim()};break;case 37:this.$={stmt:"applyClass",id:i[l-1].trim(),styleClass:i[l].trim()};break;case 38:f.setDirection("TB"),this.$={stmt:"dir",value:"TB"};break;case 39:f.setDirection("BT"),this.$={stmt:"dir",value:"BT"};break;case 40:f.setDirection("RL"),this.$={stmt:"dir",value:"RL"};break;case 41:f.setDirection("LR"),this.$={stmt:"dir",value:"LR"};break;case 44:case 45:this.$={stmt:"state",id:i[l].trim(),type:"default",description:""};break;case 46:this.$={stmt:"state",id:i[l-2].trim(),classes:[i[l].trim()],type:"default",description:""};break;case 47:this.$={stmt:"state",id:i[l-2].trim(),classes:[i[l].trim()],type:"default",description:""};break}},"anonymous"),table:[{3:1,4:e,5:a,6:s},{1:[3]},{3:5,4:e,5:a,6:s},{3:6,4:e,5:a,6:s},t([1,4,5,16,17,19,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],c,{7:7}),{1:[2,1]},{1:[2,2]},{1:[2,3],4:o,5:u,8:8,9:10,10:12,11:13,12:14,13:15,16:S,17:p,19:m,22:v,24:g,25:O,26:L,27:B,28:N,29:D,32:25,33:h,35:E,37:A,38:x,41:F,45:Y,48:z,51:it,52:rt,53:nt,54:at,57:M},t(y,[2,5]),{9:39,10:12,11:13,12:14,13:15,16:S,17:p,19:m,22:v,24:g,25:O,26:L,27:B,28:N,29:D,32:25,33:h,35:E,37:A,38:x,41:F,45:Y,48:z,51:it,52:rt,53:nt,54:at,57:M},t(y,[2,7]),t(y,[2,8]),t(y,[2,9]),t(y,[2,10]),t(y,[2,11]),t(y,[2,12],{14:[1,40],15:[1,41]}),t(y,[2,16]),{18:[1,42]},t(y,[2,18],{20:[1,43]}),{23:[1,44]},t(y,[2,22]),t(y,[2,23]),t(y,[2,24]),t(y,[2,25]),{30:45,31:[1,46],59:[1,47],60:[1,48]},t(y,[2,28]),{34:[1,49]},{36:[1,50]},t(y,[2,31]),{13:51,24:g,57:M},{42:[1,52],44:[1,53]},{46:[1,54]},{49:[1,55]},t(ot,[2,44],{58:[1,56]}),t(ot,[2,45],{58:[1,57]}),t(y,[2,38]),t(y,[2,39]),t(y,[2,40]),t(y,[2,41]),t(y,[2,6]),t(y,[2,13]),{13:58,24:g,57:M},t(y,[2,17]),t(Ct,c,{7:59}),{24:[1,60]},{24:[1,61]},{23:[1,62]},{24:[2,48]},{24:[2,49]},t(y,[2,29]),t(y,[2,30]),{39:[1,63],40:[1,64]},{43:[1,65]},{43:[1,66]},{47:[1,67]},{50:[1,68]},{24:[1,69]},{24:[1,70]},t(y,[2,14],{14:[1,71]}),{4:o,5:u,8:8,9:10,10:12,11:13,12:14,13:15,16:S,17:p,19:m,21:[1,72],22:v,24:g,25:O,26:L,27:B,28:N,29:D,32:25,33:h,35:E,37:A,38:x,41:F,45:Y,48:z,51:it,52:rt,53:nt,54:at,57:M},t(y,[2,20],{20:[1,73]}),{31:[1,74]},{24:[1,75]},{39:[1,76]},{39:[1,77]},t(y,[2,34]),t(y,[2,35]),t(y,[2,36]),t(y,[2,37]),t(ot,[2,46]),t(ot,[2,47]),t(y,[2,15]),t(y,[2,19]),t(Ct,c,{7:78}),t(y,[2,26]),t(y,[2,27]),{5:[1,79]},{5:[1,80]},{4:o,5:u,8:8,9:10,10:12,11:13,12:14,13:15,16:S,17:p,19:m,21:[1,81],22:v,24:g,25:O,26:L,27:B,28:N,29:D,32:25,33:h,35:E,37:A,38:x,41:F,45:Y,48:z,51:it,52:rt,53:nt,54:at,57:M},t(y,[2,32]),t(y,[2,33]),t(y,[2,21])],defaultActions:{5:[2,1],6:[2,2],47:[2,48],48:[2,49]},parseError:d(function(P,n){if(n.recoverable)this.trace(P);else{var r=new Error(P);throw r.hash=n,r}},"parseError"),parse:d(function(P){var n=this,r=[0],f=[],T=[null],i=[],b=this.table,l="",G=0,J=0,ct=2,q=1,St=i.slice.call(arguments,1),_=Object.create(this.lexer),W={yy:{}};for(var mt in this.yy)Object.prototype.hasOwnProperty.call(this.yy,mt)&&(W.yy[mt]=this.yy[mt]);_.setInput(P,W.yy),W.yy.lexer=_,W.yy.parser=this,typeof _.yylloc>"u"&&(_.yylloc={});var Tt=_.yylloc;i.push(Tt);var qt=_.options&&_.options.ranges;typeof W.yy.parseError=="function"?this.parseError=W.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function Qt(I){r.length=r.length-2*I,T.length=T.length-I,i.length=i.length-I}d(Qt,"popStack");function Lt(){var I;return I=f.pop()||_.lex()||q,typeof I!="number"&&(I instanceof Array&&(f=I,I=f.pop()),I=n.symbols_[I]||I),I}d(Lt,"lex");for(var C,K,w,kt,H={},ht,j,At,dt;;){if(K=r[r.length-1],this.defaultActions[K]?w=this.defaultActions[K]:((C===null||typeof C>"u")&&(C=Lt()),w=b[K]&&b[K][C]),typeof w>"u"||!w.length||!w[0]){var bt="";dt=[];for(ht in b[K])this.terminals_[ht]&&ht>ct&&dt.push("'"+this.terminals_[ht]+"'");_.showPosition?bt="Parse error on line "+(G+1)+`:
`+_.showPosition()+`
Expecting `+dt.join(", ")+", got '"+(this.terminals_[C]||C)+"'":bt="Parse error on line "+(G+1)+": Unexpected "+(C==q?"end of input":"'"+(this.terminals_[C]||C)+"'"),this.parseError(bt,{text:_.match,token:this.terminals_[C]||C,line:_.yylineno,loc:Tt,expected:dt})}if(w[0]instanceof Array&&w.length>1)throw new Error("Parse Error: multiple actions possible at state: "+K+", token: "+C);switch(w[0]){case 1:r.push(C),T.push(_.yytext),i.push(_.yylloc),r.push(w[1]),C=null,J=_.yyleng,l=_.yytext,G=_.yylineno,Tt=_.yylloc;break;case 2:if(j=this.productions_[w[1]][1],H.$=T[T.length-j],H._$={first_line:i[i.length-(j||1)].first_line,last_line:i[i.length-1].last_line,first_column:i[i.length-(j||1)].first_column,last_column:i[i.length-1].last_column},qt&&(H._$.range=[i[i.length-(j||1)].range[0],i[i.length-1].range[1]]),kt=this.performAction.apply(H,[l,J,G,W.yy,w[1],T,i].concat(St)),typeof kt<"u")return kt;j&&(r=r.slice(0,-1*j*2),T=T.slice(0,-1*j),i=i.slice(0,-1*j)),r.push(this.productions_[w[1]][0]),T.push(H.$),i.push(H._$),At=b[r[r.length-2]][r[r.length-1]],r.push(At);break;case 3:return!0}}return!0},"parse")},Zt=(function(){var P={EOF:1,parseError:d(function(n,r){if(this.yy.parser)this.yy.parser.parseError(n,r);else throw new Error(n)},"parseError"),setInput:d(function(n,r){return this.yy=r||this.yy||{},this._input=n,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},"setInput"),input:d(function(){var n=this._input[0];this.yytext+=n,this.yyleng++,this.offset++,this.match+=n,this.matched+=n;var r=n.match(/(?:\r\n?|\n).*/g);return r?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),n},"input"),unput:d(function(n){var r=n.length,f=n.split(/(?:\r\n?|\n)/g);this._input=n+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-r),this.offset-=r;var T=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),f.length-1&&(this.yylineno-=f.length-1);var i=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:f?(f.length===T.length?this.yylloc.first_column:0)+T[T.length-f.length].length-f[0].length:this.yylloc.first_column-r},this.options.ranges&&(this.yylloc.range=[i[0],i[0]+this.yyleng-r]),this.yyleng=this.yytext.length,this},"unput"),more:d(function(){return this._more=!0,this},"more"),reject:d(function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:"",token:null,line:this.yylineno});return this},"reject"),less:d(function(n){this.unput(this.match.slice(n))},"less"),pastInput:d(function(){var n=this.matched.substr(0,this.matched.length-this.match.length);return(n.length>20?"...":"")+n.substr(-20).replace(/\n/g,"")},"pastInput"),upcomingInput:d(function(){var n=this.match;return n.length<20&&(n+=this._input.substr(0,20-n.length)),(n.substr(0,20)+(n.length>20?"...":"")).replace(/\n/g,"")},"upcomingInput"),showPosition:d(function(){var n=this.pastInput(),r=new Array(n.length+1).join("-");return n+this.upcomingInput()+`
`+r+"^"},"showPosition"),test_match:d(function(n,r){var f,T,i;if(this.options.backtrack_lexer&&(i={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(i.yylloc.range=this.yylloc.range.slice(0))),T=n[0].match(/(?:\r\n?|\n).*/g),T&&(this.yylineno+=T.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:T?T[T.length-1].length-T[T.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+n[0].length},this.yytext+=n[0],this.match+=n[0],this.matches=n,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(n[0].length),this.matched+=n[0],f=this.performAction.call(this,this.yy,this,r,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),f)return f;if(this._backtrack){for(var b in i)this[b]=i[b];return!1}return!1},"test_match"),next:d(function(){if(this.done)return this.EOF;this._input||(this.done=!0);var n,r,f,T;this._more||(this.yytext="",this.match="");for(var i=this._currentRules(),b=0;b<i.length;b++)if(f=this._input.match(this.rules[i[b]]),f&&(!r||f[0].length>r[0].length)){if(r=f,T=b,this.options.backtrack_lexer){if(n=this.test_match(f,i[b]),n!==!1)return n;if(this._backtrack){r=!1;continue}else return!1}else if(!this.options.flex)break}return r?(n=this.test_match(r,i[T]),n!==!1?n:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},"next"),lex:d(function(){var n=this.next();return n||this.lex()},"lex"),begin:d(function(n){this.conditionStack.push(n)},"begin"),popState:d(function(){var n=this.conditionStack.length-1;return n>0?this.conditionStack.pop():this.conditionStack[0]},"popState"),_currentRules:d(function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},"_currentRules"),topState:d(function(n){return n=this.conditionStack.length-1-Math.abs(n||0),n>=0?this.conditionStack[n]:"INITIAL"},"topState"),pushState:d(function(n){this.begin(n)},"pushState"),stateStackSize:d(function(){return this.conditionStack.length},"stateStackSize"),options:{"case-insensitive":!0},performAction:d(function(n,r,f,T){function i(){const b=r.yytext.indexOf("%%");if(b===0)return!1;if(b>0){const l=r.yytext.slice(0,b),G=r.yytext.slice(b);G&&n.lexer.unput(G),r.yytext=l}return!0}switch(d(i,"processId"),f){case 0:return 38;case 1:return 40;case 2:return 39;case 3:return 44;case 4:return 51;case 5:return 52;case 6:return 53;case 7:return 54;case 8:return 5;case 9:break;case 10:break;case 11:break;case 12:break;case 13:return this.pushState("SCALE"),17;case 14:return 18;case 15:this.popState();break;case 16:return this.begin("acc_title"),33;case 17:return this.popState(),"acc_title_value";case 18:return this.begin("acc_descr"),35;case 19:return this.popState(),"acc_descr_value";case 20:this.begin("acc_descr_multiline");break;case 21:this.popState();break;case 22:return"acc_descr_multiline_value";case 23:return this.pushState("CLASSDEF"),41;case 24:return this.popState(),this.pushState("CLASSDEFID"),"DEFAULT_CLASSDEF_ID";case 25:return this.popState(),this.pushState("CLASSDEFID"),42;case 26:return this.popState(),43;case 27:return this.pushState("CLASS"),48;case 28:return this.popState(),this.pushState("CLASS_STYLE"),49;case 29:return this.popState(),50;case 30:return this.pushState("STYLE"),45;case 31:return this.popState(),this.pushState("STYLEDEF_STYLES"),46;case 32:return this.popState(),47;case 33:return this.pushState("SCALE"),17;case 34:return 18;case 35:this.popState();break;case 36:this.pushState("STATE");break;case 37:return this.popState(),r.yytext=r.yytext.slice(0,-8).trim(),25;case 38:return this.popState(),r.yytext=r.yytext.slice(0,-8).trim(),26;case 39:return this.popState(),r.yytext=r.yytext.slice(0,-10).trim(),27;case 40:return this.popState(),r.yytext=r.yytext.slice(0,-8).trim(),25;case 41:return this.popState(),r.yytext=r.yytext.slice(0,-8).trim(),26;case 42:return this.popState(),r.yytext=r.yytext.slice(0,-10).trim(),27;case 43:return 51;case 44:return 52;case 45:return 53;case 46:return 54;case 47:this.pushState("STATE_STRING");break;case 48:return this.pushState("STATE_ID"),"AS";case 49:return i()?(this.popState(),"ID"):void 0;case 50:this.popState();break;case 51:return"STATE_DESCR";case 52:throw new Error('Error: State name must be a single word. Found: "'+r.yytext.trim()+'"');case 53:return 19;case 54:this.popState();break;case 55:return this.popState(),this.pushState("struct"),20;case 56:return this.popState(),21;case 57:break;case 58:return this.begin("NOTE"),29;case 59:return this.popState(),this.pushState("NOTE_ID"),59;case 60:return this.popState(),this.pushState("NOTE_ID"),60;case 61:this.popState(),this.pushState("FLOATING_NOTE");break;case 62:return this.popState(),this.pushState("FLOATING_NOTE_ID"),"AS";case 63:break;case 64:return"NOTE_TEXT";case 65:return i()?(this.popState(),"ID"):void 0;case 66:return i()?(this.popState(),this.pushState("NOTE_TEXT"),24):void 0;case 67:return this.popState(),r.yytext=r.yytext.substr(2).trim(),31;case 68:return this.popState(),r.yytext=r.yytext.slice(0,-8).trim(),31;case 69:return 6;case 70:return 6;case 71:return 16;case 72:return 57;case 73:return i()?24:void 0;case 74:return r.yytext=r.yytext.trim(),14;case 75:return 15;case 76:return 28;case 77:return 58;case 78:return 5;case 79:return"INVALID"}},"anonymous"),rules:[/^(?:click\b)/i,/^(?:href\b)/i,/^(?:"[^"]*")/i,/^(?:default\b)/i,/^(?:.*direction\s+TB[^\n]*)/i,/^(?:.*direction\s+BT[^\n]*)/i,/^(?:.*direction\s+RL[^\n]*)/i,/^(?:.*direction\s+LR[^\n]*)/i,/^(?:[\n]+)/i,/^(?:[\s]+)/i,/^(?:((?!\n)\s)+)/i,/^(?:#[^\n]*)/i,/^(?:%%(?!\{)[^\n]*)/i,/^(?:scale\s+)/i,/^(?:\d+)/i,/^(?:\s+width\b)/i,/^(?:accTitle\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*\{\s*)/i,/^(?:[\}])/i,/^(?:[^\}]*)/i,/^(?:classDef\s+)/i,/^(?:DEFAULT\s+)/i,/^(?:\w+\s+)/i,/^(?:[^\n]*)/i,/^(?:class\s+)/i,/^(?:(\w+)+((,\s*\w+)*))/i,/^(?:[^\n]*)/i,/^(?:style\s+)/i,/^(?:[\w,]+\s+)/i,/^(?:[^\n]*)/i,/^(?:scale\s+)/i,/^(?:\d+)/i,/^(?:\s+width\b)/i,/^(?:state\s+)/i,/^(?:.*<<fork>>)/i,/^(?:.*<<join>>)/i,/^(?:.*<<choice>>)/i,/^(?:.*\[\[fork\]\])/i,/^(?:.*\[\[join\]\])/i,/^(?:.*\[\[choice\]\])/i,/^(?:.*direction\s+TB[^\n]*)/i,/^(?:.*direction\s+BT[^\n]*)/i,/^(?:.*direction\s+RL[^\n]*)/i,/^(?:.*direction\s+LR[^\n]*)/i,/^(?:["])/i,/^(?:\s*as\s+)/i,/^(?:[^\n\{]*)/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:\w+\s+\w+.*?\{)/i,/^(?:[^\n\s\{]+)/i,/^(?:\n)/i,/^(?:\{)/i,/^(?:\})/i,/^(?:[\n])/i,/^(?:note\s+)/i,/^(?:left of\b)/i,/^(?:right of\b)/i,/^(?:")/i,/^(?:\s*as\s*)/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:[^\n]*)/i,/^(?:\s*[^:\n\s\-]+)/i,/^(?:\s*:[^:\n;]+)/i,/^(?:[\s\S]*?\n\s*end note\b)/i,/^(?:stateDiagram\s+)/i,/^(?:stateDiagram-v2\s+)/i,/^(?:hide empty description\b)/i,/^(?:\[\*\])/i,/^(?:[^:\n\s\-\{]+)/i,/^(?:\s*:(?:[^:\n;]|:[^:\n;])+)/i,/^(?:-->)/i,/^(?:--)/i,/^(?::::)/i,/^(?:$)/i,/^(?:.)/i],conditions:{LINE:{rules:[10,11,12],inclusive:!1},struct:{rules:[10,11,12,23,27,30,36,43,44,45,46,56,57,58,72,73,74,75,76,77],inclusive:!1},FLOATING_NOTE_ID:{rules:[65],inclusive:!1},FLOATING_NOTE:{rules:[62,63,64],inclusive:!1},NOTE_TEXT:{rules:[67,68],inclusive:!1},NOTE_ID:{rules:[66],inclusive:!1},NOTE:{rules:[59,60,61],inclusive:!1},STYLEDEF_STYLEOPTS:{rules:[],inclusive:!1},STYLEDEF_STYLES:{rules:[32],inclusive:!1},STYLE_IDS:{rules:[],inclusive:!1},STYLE:{rules:[31],inclusive:!1},CLASS_STYLE:{rules:[29],inclusive:!1},CLASS:{rules:[28],inclusive:!1},CLASSDEFID:{rules:[26],inclusive:!1},CLASSDEF:{rules:[24,25],inclusive:!1},acc_descr_multiline:{rules:[21,22],inclusive:!1},acc_descr:{rules:[19],inclusive:!1},acc_title:{rules:[17],inclusive:!1},SCALE:{rules:[14,15,34,35],inclusive:!1},ALIAS:{rules:[],inclusive:!1},STATE_ID:{rules:[49],inclusive:!1},STATE_STRING:{rules:[50,51],inclusive:!1},FORK_STATE:{rules:[],inclusive:!1},STATE:{rules:[10,11,12,37,38,39,40,41,42,47,48,52,53,54,55],inclusive:!1},ID:{rules:[10,11,12],inclusive:!1},INITIAL:{rules:[0,1,2,3,4,5,6,7,8,9,11,12,13,16,18,20,23,27,30,33,36,55,58,69,70,71,72,73,74,75,77,78,79],inclusive:!0}}};return P})();gt.lexer=Zt;function lt(){this.yy={}}return d(lt,"Parser"),lt.prototype=gt,gt.Parser=lt,new lt})();Dt.parser=Dt;var Ue=Dt,ye="TB",Yt="TB",It="dir",Z="state",V="root",xt="relation",fe="classDef",ge="style",Se="applyClass",et="default",Pt="divider",Gt="fill:none",jt="fill: #333",zt="c",Ut="markdown",Wt="normal",Et="rect",vt="rectWithTitle",me="stateStart",Te="stateEnd",wt="divider",Ot="roundedWithTitle",ke="note",be="noteGroup",st="statediagram",_e="state",Ee=`${st}-${_e}`,Kt="transition",ve="note",De="note-edge",xe=`${Kt} ${De}`,$e=`${st}-${ve}`,Ce="cluster",Le=`${st}-${Ce}`,Ae="cluster-alt",Ie=`${st}-${Ae}`,Xt="parent",Mt="note",we="state",$t="----",Oe=`${$t}${Mt}`,Nt=`${$t}${Xt}`,Jt=d((t,e=Yt)=>{if(!t.doc)return e;let a=e;for(const s of t.doc)s.stmt==="dir"&&(a=s.value);return a},"getDir"),Ne=d(function(t,e){return e.db.getClasses()},"getClasses"),Re=d(async function(t,e,a,s){k.info("REF0:"),k.info("Drawing state diagram (v2)",e);const{securityLevel:c,state:o,layout:u}=R();s.db.extract(s.db.getRootDocV2());const S=s.db.getData(),p=te(e,c);S.type=s.type,S.layoutAlgorithm=u,S.nodeSpacing=(o==null?void 0:o.nodeSpacing)||50,S.rankSpacing=(o==null?void 0:o.rankSpacing)||50,R().look==="neo"?S.markers=["barbNeo"]:S.markers=["barb"],S.diagramId=e,await se(S,p);const m=8;try{(typeof s.db.getLinks=="function"?s.db.getLinks():new Map).forEach((v,g)=>{var O;const L=typeof g=="string"?g:typeof(g==null?void 0:g.id)=="string"?g.id:"",B=S.nodes.find(x=>x.id===L);if(!L){k.warn("⚠️ Invalid or missing stateId from key:",JSON.stringify(g));return}const N=(O=p.node())==null?void 0:O.querySelectorAll("g.node, g.rough-node");let D;if(N==null||N.forEach(x=>{var F;const Y=(F=x.textContent)==null?void 0:F.trim();(x.id===(B==null?void 0:B.domId)||Y===L)&&(D=x)}),!D){k.warn("⚠️ Could not find node matching text:",L);return}const h=D.parentNode;if(!h){k.warn("⚠️ Node has no parent, cannot wrap:",L);return}const E=document.createElementNS("http://www.w3.org/2000/svg","a"),A=v.url.replace(/^"+|"+$/g,"");if(E.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",A),E.setAttribute("target","_blank"),v.tooltip){const x=v.tooltip.replace(/^"+|"+$/g,"");E.setAttribute("title",x),D.setAttribute("title",x)}h.replaceChild(E,D),E.appendChild(D),k.info("🔗 Wrapped node in <a> tag for:",L,v.url)})}catch(v){k.error("❌ Error injecting clickable links:",v)}ie.insertTitle(p,"statediagramTitleText",(o==null?void 0:o.titleTopMargin)??25,s.db.getDiagramTitle()),ee(p,m,st,(o==null?void 0:o.useMaxWidth)??!0)},"draw"),We={getClasses:Ne,draw:Re,getDir:Jt},yt=new Map,U=0;function ft(t="",e=0,a="",s=$t){const c=a!==null&&a.length>0?`${s}${a}`:"";return`${we}-${t}${c}-${e}`}d(ft,"stateDomId");var Be=d((t,e,a,s,c,o,u,S)=>{k.trace("items",e),e.forEach(p=>{switch(p.stmt){case Z:tt(t,p,a,s,c,o,u,S);break;case et:tt(t,p,a,s,c,o,u,S);break;case xt:{tt(t,p.state1,a,s,c,o,u,S),tt(t,p.state2,a,s,c,o,u,S);const m=u==="neo",v={id:"edge"+U,start:p.state1.id,end:p.state2.id,arrowhead:"normal",arrowTypeEnd:m?"arrow_barb_neo":"arrow_barb",style:Gt,labelStyle:"",label:X.sanitizeText(p.description??"",R()),arrowheadStyle:jt,labelpos:zt,labelType:Ut,thickness:Wt,classes:Kt,look:u};c.push(v),U++}break}})},"setupDoc"),Rt=d((t,e=Yt)=>{let a=e;if(t.doc)for(const s of t.doc)s.stmt==="dir"&&(a=s.value);return a},"getDir");function Q(t,e,a){if(!e.id||e.id==="</join></fork>"||e.id==="</choice>")return;e.cssClasses&&(Array.isArray(e.cssCompiledStyles)||(e.cssCompiledStyles=[]),e.cssClasses.split(" ").forEach(c=>{const o=a.get(c);o&&(e.cssCompiledStyles=[...e.cssCompiledStyles??[],...o.styles])}));const s=t.find(c=>c.id===e.id);s?Object.assign(s,e):t.push(e)}d(Q,"insertOrUpdateNode");function Ht(t){var e;return((e=t==null?void 0:t.classes)==null?void 0:e.join(" "))??""}d(Ht,"getClassesFromDbInfo");function Vt(t){return(t==null?void 0:t.styles)??[]}d(Vt,"getStylesFromDbInfo");var tt=d((t,e,a,s,c,o,u,S)=>{var p,m,v;const g=e.id,O=a.get(g),L=Ht(O),B=Vt(O),N=R();if(k.info("dataFetcher parsedItem",e,O,B),g!=="root"){let D=Et;e.start===!0?D=me:e.start===!1&&(D=Te),e.type!==et&&(D=e.type),yt.get(g)||yt.set(g,{id:g,shape:D,description:X.sanitizeText(g,N),cssClasses:`${L} ${Ee}`,cssStyles:B});const h=yt.get(g);e.description&&(Array.isArray(h.description)?(h.shape=vt,h.description.push(e.description)):(p=h.description)!=null&&p.length&&h.description.length>0?(h.shape=vt,h.description===g?h.description=[e.description]:h.description=[h.description,e.description]):(h.shape=Et,h.description=e.description),h.description=X.sanitizeTextOrArray(h.description,N)),((m=h.description)==null?void 0:m.length)===1&&h.shape===vt&&(h.type==="group"?h.shape=Ot:h.shape=Et),!h.type&&e.doc&&(k.info("Setting cluster for XCX",g,Rt(e)),h.type="group",h.isGroup=!0,h.dir=Rt(e),h.explicitDir=e.doc.some(A=>A.stmt==="dir"),h.shape=e.type===Pt?wt:Ot,h.cssClasses=`${h.cssClasses} ${Le} ${o?Ie:""}`);const E={labelStyle:"",shape:h.shape,label:h.description,cssClasses:h.cssClasses,cssCompiledStyles:[],cssStyles:h.cssStyles,id:g,dir:h.dir,domId:ft(g,U),type:h.type,isGroup:h.type==="group",padding:8,rx:10,ry:10,look:u,labelType:"markdown"};if(E.shape===wt&&(E.label=""),t&&t.id!=="root"&&(k.trace("Setting node ",g," to be child of its parent ",t.id),E.parentId=t.id),E.centerLabel=!0,e.note){const A={labelStyle:"",shape:ke,label:e.note.text,labelType:"markdown",cssClasses:$e,cssStyles:[],cssCompiledStyles:[],id:g+Oe+"-"+U,domId:ft(g,U,Mt),type:h.type,isGroup:h.type==="group",padding:(v=N.flowchart)==null?void 0:v.padding,look:u,position:e.note.position},x=g+Nt,F={labelStyle:"",shape:be,label:e.note.text,cssClasses:h.cssClasses,cssStyles:[],id:g+Nt,domId:ft(g,U,Xt),type:"group",isGroup:!0,padding:16,look:u,position:e.note.position};U++,F.id=x,A.parentId=x,Q(s,F,S),Q(s,A,S),Q(s,E,S);let Y=g,z=A.id;e.note.position==="left of"&&(Y=A.id,z=g),c.push({id:Y+"-"+z,start:Y,end:z,arrowhead:"none",arrowTypeEnd:"",style:Gt,labelStyle:"",classes:xe,arrowheadStyle:jt,labelpos:zt,labelType:Ut,thickness:Wt,look:u})}else Q(s,E,S)}e.doc&&(k.trace("Adding nodes children "),Be(e,e.doc,a,s,c,!o,u,S))},"dataFetcher"),Fe=d(()=>{yt.clear(),U=0},"reset"),$={START_NODE:"[*]",START_TYPE:"start",END_NODE:"[*]",END_TYPE:"end",COLOR_KEYWORD:"color",FILL_KEYWORD:"fill",BG_FILL:"bgFill",STYLECLASS_SEP:","},Bt=d(()=>new Map,"newClassesList"),Ft=d(()=>({relations:[],states:new Map,documents:{}}),"newDoc"),ut=d(t=>JSON.parse(JSON.stringify(t)),"clone"),pt,Ke=(pt=class{constructor(t){this.version=t,this.nodes=[],this.edges=[],this.rootDoc=[],this.classes=Bt(),this.documents={root:Ft()},this.currentDocument=this.documents.root,this.startEndCount=0,this.dividerCnt=0,this.links=new Map,this.funs=[],this.getAccTitle=re,this.setAccTitle=ne,this.getAccDescription=ae,this.setAccDescription=oe,this.setDiagramTitle=le,this.getDiagramTitle=ce,this.clear(),this.setRootDoc=this.setRootDoc.bind(this),this.getDividerId=this.getDividerId.bind(this),this.setDirection=this.setDirection.bind(this),this.trimColon=this.trimColon.bind(this),this.bindFunctions=this.bindFunctions.bind(this)}extract(t){this.clear(!0);for(const s of Array.isArray(t)?t:t.doc)switch(s.stmt){case Z:this.addState(s.id.trim(),s.type,s.doc,s.description,s.note);break;case xt:this.addRelation(s.state1,s.state2,s.description);break;case fe:this.addStyleClass(s.id.trim(),s.classes);break;case ge:this.handleStyleDef(s);break;case Se:this.setCssClass(s.id.trim(),s.styleClass);break;case"click":this.addLink(s.id,s.url,s.tooltip);break}const e=this.getStates(),a=R();Fe(),tt(void 0,this.getRootDocV2(),e,this.nodes,this.edges,!0,a.look,this.classes);for(const s of this.nodes)if(Array.isArray(s.label)){if(s.description=s.label.slice(1),s.isGroup&&s.description.length>0)throw new Error(`Group nodes can only have label. Remove the additional description for node [${s.id}]`);s.label=s.label[0]}}handleStyleDef(t){const e=t.id.trim().split(","),a=t.styleClass.split(",");for(const s of e){let c=this.getState(s);if(!c){const o=s.trim();this.addState(o),c=this.getState(o)}c&&(c.styles=a.map(o=>{var u;return(u=o.replace(/;/g,""))==null?void 0:u.trim()}))}}setRootDoc(t){k.info("Setting root doc",t),this.rootDoc=t,this.version===1?this.extract(t):this.extract(this.getRootDocV2())}docTranslator(t,e,a){if(e.stmt===xt){this.docTranslator(t,e.state1,!0),this.docTranslator(t,e.state2,!1);return}if(e.stmt===Z&&(e.id===$.START_NODE?(e.id=t.id+(a?"_start":"_end"),e.start=a):e.id=e.id.trim()),e.stmt!==V&&e.stmt!==Z||!e.doc)return;const s=[];let c=[];for(const o of e.doc)if(o.type===Pt){const u=ut(o);u.doc=ut(c),s.push(u),c=[]}else c.push(o);if(s.length>0&&c.length>0){const o={stmt:Z,id:he(),type:"divider",doc:ut(c)};s.push(ut(o)),e.doc=s}e.doc.forEach(o=>this.docTranslator(e,o,!0))}getRootDocV2(){return this.docTranslator({id:V,stmt:V},{id:V,stmt:V,doc:this.rootDoc},!0),{id:V,doc:this.rootDoc}}addState(t,e=et,a=void 0,s=void 0,c=void 0,o=void 0,u=void 0,S=void 0){const p=t==null?void 0:t.trim();if(!this.currentDocument.states.has(p))k.info("Adding state ",p,s),this.currentDocument.states.set(p,{stmt:Z,id:p,descriptions:[],type:e,doc:a,note:c,classes:[],styles:[],textStyles:[]});else{const m=this.currentDocument.states.get(p);if(!m)throw new Error(`State not found: ${p}`);m.doc||(m.doc=a),m.type||(m.type=e)}if(s&&(k.info("Setting state description",p,s),(Array.isArray(s)?s:[s]).forEach(m=>this.addDescription(p,m.trim()))),c){const m=this.currentDocument.states.get(p);if(!m)throw new Error(`State not found: ${p}`);m.note=c,m.note.text=X.sanitizeText(m.note.text,R())}o&&(k.info("Setting state classes",p,o),(Array.isArray(o)?o:[o]).forEach(m=>this.setCssClass(p,m.trim()))),u&&(k.info("Setting state styles",p,u),(Array.isArray(u)?u:[u]).forEach(m=>this.setStyle(p,m.trim()))),S&&(k.info("Setting state styles",p,u),(Array.isArray(S)?S:[S]).forEach(m=>this.setTextStyle(p,m.trim())))}clear(t){this.nodes=[],this.edges=[],this.funs=[this.setupToolTips.bind(this)],this.documents={root:Ft()},this.currentDocument=this.documents.root,this.startEndCount=0,this.classes=Bt(),t||(this.links=new Map,de())}getState(t){return this.currentDocument.states.get(t)}getStates(){return this.currentDocument.states}logDocuments(){k.info("Documents = ",this.documents)}getRelations(){return this.currentDocument.relations}addLink(t,e,a){this.links.set(t,{url:e,tooltip:a}),k.warn("Adding link",t,e,a)}getLinks(){return this.links}startIdIfNeeded(t=""){return t===$.START_NODE?(this.startEndCount++,`${$.START_TYPE}${this.startEndCount}`):t}startTypeIfNeeded(t="",e=et){return t===$.START_NODE?$.START_TYPE:e}endIdIfNeeded(t=""){return t===$.END_NODE?(this.startEndCount++,`${$.END_TYPE}${this.startEndCount}`):t}endTypeIfNeeded(t="",e=et){return t===$.END_NODE?$.END_TYPE:e}addRelationObjs(t,e,a=""){const s=this.startIdIfNeeded(t.id.trim()),c=this.startTypeIfNeeded(t.id.trim(),t.type),o=this.startIdIfNeeded(e.id.trim()),u=this.startTypeIfNeeded(e.id.trim(),e.type);this.addState(s,c,t.doc,t.description,t.note,t.classes,t.styles,t.textStyles),this.addState(o,u,e.doc,e.description,e.note,e.classes,e.styles,e.textStyles),this.currentDocument.relations.push({id1:s,id2:o,relationTitle:X.sanitizeText(a,R())})}addRelation(t,e,a){if(typeof t=="object"&&typeof e=="object")this.addRelationObjs(t,e,a);else if(typeof t=="string"&&typeof e=="string"){const s=this.startIdIfNeeded(t.trim()),c=this.startTypeIfNeeded(t),o=this.endIdIfNeeded(e.trim()),u=this.endTypeIfNeeded(e);this.addState(s,c),this.addState(o,u),this.currentDocument.relations.push({id1:s,id2:o,relationTitle:a?X.sanitizeText(a,R()):void 0})}}addDescription(t,e){var a;const s=this.currentDocument.states.get(t),c=e.startsWith(":")?e.replace(":","").trim():e;(a=s==null?void 0:s.descriptions)==null||a.push(X.sanitizeText(c,R()))}cleanupLabel(t){return t.startsWith(":")?t.slice(2).trim():t.trim()}getDividerId(){return this.dividerCnt++,`divider-id-${this.dividerCnt}`}addStyleClass(t,e=""){this.classes.has(t)||this.classes.set(t,{id:t,styles:[],textStyles:[]});const a=this.classes.get(t);e&&a&&e.split($.STYLECLASS_SEP).forEach(s=>{const c=s.replace(/([^;]*);/,"$1").trim();if(RegExp($.COLOR_KEYWORD).exec(s)){const o=c.replace($.FILL_KEYWORD,$.BG_FILL).replace($.COLOR_KEYWORD,$.FILL_KEYWORD);a.textStyles.push(o)}a.styles.push(c)})}getClasses(){return this.classes}setupToolTips(t){const e=pe();_t(t).select("svg").selectAll("g.node, g.rough-node").on("mouseover",a=>{var s;const c=_t(a.currentTarget),o=c.attr("title");if(o===null)return;const u=(s=a.currentTarget)==null?void 0:s.getBoundingClientRect();e.transition().duration(200).style("opacity",".9"),e.style("left",window.scrollX+u.left+(u.right-u.left)/2+"px").style("top",window.scrollY+u.bottom+"px"),e.html(ue.sanitize(o)),c.classed("hover",!0)}).on("mouseout",a=>{e.transition().duration(500).style("opacity",0),_t(a.currentTarget).classed("hover",!1)})}setCssClass(t,e){t.split(",").forEach(a=>{var s;let c=this.getState(a);if(!c){const o=a.trim();this.addState(o),c=this.getState(o)}(s=c==null?void 0:c.classes)==null||s.push(e)})}setStyle(t,e){var a,s;(s=(a=this.getState(t))==null?void 0:a.styles)==null||s.push(e)}setTextStyle(t,e){var a,s;(s=(a=this.getState(t))==null?void 0:a.textStyles)==null||s.push(e)}bindFunctions(t){this.funs.forEach(e=>{e(t)})}getDirectionStatement(){return this.rootDoc.find(t=>t.stmt===It)}getDirection(){var t;return((t=this.getDirectionStatement())==null?void 0:t.value)??ye}setDirection(t){const e=this.getDirectionStatement();e?e.value=t:this.rootDoc.unshift({stmt:It,value:t})}trimColon(t){return t.startsWith(":")?t.slice(1).trim():t.trim()}getData(){const t=R();return{nodes:this.nodes,edges:this.edges,other:{},config:t,direction:Jt(this.getRootDocV2())}}getConfig(){return R().state}},d(pt,"StateDB"),pt.relationType={AGGREGATION:0,EXTENSION:1,COMPOSITION:2,DEPENDENCY:3},pt),Ye=d(t=>`
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
`,"getStyles"),Xe=Ye;export{Ke as H,Xe as K,We as U,Ue as z};
