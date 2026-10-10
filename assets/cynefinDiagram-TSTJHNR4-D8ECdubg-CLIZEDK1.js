import{m as $t}from"./chunk-JWPE2WC7-BPfUMuVx-BWhurgaw.js";import{D as gt,f as ut,z as bt,x as wt,g as Ct,h as Dt,e as i,I as O,aa as kt,i as Bt,O as At,$ as X,c as Y,a0 as St,af as rt}from"./index-C4z2R8F4.js";import{y as Tt}from"./cynefin-VYW2F7L2-BTJyEgdq-XyyeITFA.js";var ot=i(()=>({domains:new Map,transitions:[]}),"createDefaultData"),G=ot(),zt=i(()=>G.domains,"getDomains"),Mt=i(()=>G.transitions,"getTransitions"),Pt=i(t=>{if(t)for(const e of t){const n=e.domain,a=(e.items??[]).map(c=>({label:c.label}));G.domains.set(n,{name:n,items:a})}},"setDomains"),vt=i(t=>{t&&(G.transitions=t.filter(e=>e.from===e.to?(O.warn(`Cynefin: self-loop transition on domain "${e.from}" is not meaningful and will be skipped.`),!1):!0).map(e=>({from:e.from,to:e.to,label:e.label||void 0})))},"setTransitions"),It=i(()=>X({...St.cynefin,...Y().cynefin}),"getConfig"),Lt=i(()=>{At(),G=ot()},"clear"),_={getDomains:zt,getTransitions:Mt,setDomains:Pt,setTransitions:vt,getConfig:It,clear:Lt,setAccTitle:Dt,getAccTitle:Ct,setDiagramTitle:wt,getDiagramTitle:bt,getAccDescription:ut,setAccDescription:gt},Rt=i(t=>{$t(t,_),_.setDomains(t.domains),_.setTransitions(t.transitions)},"populate"),Ft={parse:i(async t=>{const e=await Tt("cynefin",t);O.debug(e),Rt(e)},"parse")};function j(t){let e=t+1831565813|0;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}i(j,"seededRandom");function it(t){let e=0;for(let n=0;n<t.length;n++){const a=t.charCodeAt(n);e=(e<<5)-e+a,e|=0}return e}i(it,"hashString");function st(t,e){return typeof t=="number"&&Number.isFinite(t)&&t!==0?t:it(e)}i(st,"resolveSeed");function ct(t,e,n,a){const c=t/2,p=a??t*.015,D=7,R=e/D,d=[];for(let r=0;r<=D;r++){const m=j(n+r*17)*p*2-p;d.push({x:c+m,y:r*R})}let k=`M${d[0].x},${d[0].y}`;for(let r=0;r<d.length-1;r++){const m=d[r],s=d[r+1],f=(m.y+s.y)/2,b=r%2===0?1:-1,h=p*1.5*b*j(n+r*31+7),F=m.x+h,W=f,E=s.x-h;k+=` C${F},${W} ${E},${f} ${s.x},${s.y}`}return k}i(ct,"generateFoldPath");function lt(t,e,n,a){const c=e/2,p=a??e*.015,D=7,R=t/D,d=[];for(let r=0;r<=D;r++){const m=j(n+r*23)*p*2-p;d.push({x:r*R,y:c+m})}let k=`M${d[0].x},${d[0].y}`;for(let r=0;r<d.length-1;r++){const m=d[r],s=d[r+1],f=(m.x+s.x)/2,b=r%2===0?1:-1,h=p*1.5*b*j(n+r*37+11),F=f,W=m.y+h,E=f,H=s.y-h;k+=` C${F},${W} ${E},${H} ${s.x},${s.y}`}return k}i(lt,"generateHorizontalBoundary");function dt(t,e){const n=t/2,a=e*.5,c=e,p=t*.03;return[`M${n},${a}`,`C${n+p},${a+(c-a)*.2}`,`${n-p*1.5},${a+(c-a)*.55}`,`${n+p*.5},${a+(c-a)*.75}`,`C${n-p},${a+(c-a)*.85}`,`${n+p*.3},${a+(c-a)*.95}`,`${n},${c}`].join(" ")}i(dt,"generateCliffPath");function ft(t,e,n,a){return[`M${t-n},${e}`,`A${n},${a} 0 1,1 ${t+n},${e}`,`A${n},${a} 0 1,1 ${t-n},${e}`,"Z"].join(" ")}i(ft,"generateConfusionPath");var at={complex:{model:"Probe → Sense → Respond",practice:"Emergent Practices"},complicated:{model:"Sense → Analyse → Respond",practice:"Good Practices"},clear:{model:"Sense → Categorise → Respond",practice:"Best Practices"},chaotic:{model:"Act → Sense → Respond",practice:"Novel Practices"},confusion:{model:"",practice:"Disorder"}},Wt=i((t,e)=>{const n=t/2,a=e/2;return{complex:{cx:n/2,cy:a/2,x:0,y:0,w:n,h:a},complicated:{cx:n+n/2,cy:a/2,x:n,y:0,w:n,h:a},chaotic:{cx:n/2,cy:a+a/2,x:0,y:a,w:n,h:a},clear:{cx:n+n/2,cy:a+a/2,x:n,y:a,w:n,h:a},confusion:{cx:n,cy:a,x:n*.7,y:a*.7,w:n*.6,h:a*.6}}},"getDomainLayouts"),Et=i(()=>{const t=rt(),e=Y();return X(t,e.themeVariables).cynefin},"getCynefinDomainColors"),Q=3,Ht=i((t,e,n,a)=>{const c=a.db,p=c.getDomains(),D=c.getTransitions(),R=c.getDiagramTitle(),d=c.getAccTitle(),k=c.getAccDescription(),r=c.getConfig(),m=Et();O.debug("Rendering Cynefin diagram");const s=r.width,f=r.height,b=r.padding,h=r.showDomainDescriptions,F=r.boundaryAmplitude,W=s+b*2,E=f+b*2,H={complex:m.complexBg,complicated:m.complicatedBg,clear:m.clearBg,chaotic:m.chaoticBg,confusion:m.confusionBg},B=kt(e);Bt(B,E,W,r.useMaxWidth??!0),B.attr("viewBox",`0 0 ${W} ${E}`),d&&B.append("title").text(d),k&&B.append("desc").text(k);const A=B.append("g").attr("transform",`translate(${b}, ${b})`),N=Wt(s,f),Z=st(r.seed,e),pt=A.append("g").attr("class","cynefin-backgrounds"),q=["complex","complicated","chaotic","clear"];for(const l of q){const o=N[l];pt.append("rect").attr("class","cynefinDomain").attr("x",o.x).attr("y",o.y).attr("width",o.w).attr("height",o.h).attr("fill",H[l]).attr("fill-opacity",.4).attr("stroke","none")}const K=A.append("g").attr("class","cynefin-boundaries");K.append("path").attr("class","cynefinBoundary").attr("d",ct(s,f,Z,F)).attr("fill","none"),K.append("path").attr("class","cynefinBoundary").attr("d",lt(s,f,Z+100,F)).attr("fill","none"),K.append("path").attr("class","cynefinCliff").attr("d",dt(s,f)).attr("fill","none");const mt=s*.15,yt=f*.15;A.append("path").attr("class","cynefinConfusion").attr("d",ft(s/2,f/2,mt,yt)).attr("fill",H.confusion).attr("fill-opacity",.5);const J=A.append("g").attr("class","cynefin-labels");for(const l of q){const o=N[l];J.append("text").attr("class","cynefinDomainLabel").attr("x",o.cx).attr("y",h?o.cy-30:o.cy).attr("text-anchor","middle").attr("dominant-baseline","middle").text(l.charAt(0).toUpperCase()+l.slice(1))}if(J.append("text").attr("class","cynefinDomainLabel").attr("x",s/2).attr("y",h?f/2-10:f/2).attr("text-anchor","middle").attr("dominant-baseline","middle").text("Confusion"),h){const l=A.append("g").attr("class","cynefin-subtitles");for(const o of q){const x=N[o],y=at[o];l.append("text").attr("class","cynefinSubtitle").attr("x",x.cx).attr("y",x.cy-10).attr("text-anchor","middle").attr("dominant-baseline","middle").text(y.model),l.append("text").attr("class","cynefinSubtitle").attr("x",x.cx).attr("y",x.cy+5).attr("text-anchor","middle").attr("dominant-baseline","middle").text(y.practice)}l.append("text").attr("class","cynefinSubtitle").attr("x",s/2).attr("y",f/2+8).attr("text-anchor","middle").attr("dominant-baseline","middle").text(at.confusion.practice)}const U=A.append("g").attr("class","cynefin-items"),S=26,tt=10,xt=["complex","complicated","chaotic","clear","confusion"];for(const l of xt){const o=p.get(l);if(!o||o.items.length===0)continue;const x=N[l],y=l==="confusion";let P=o.items,v=0;y&&o.items.length>Q&&(v=o.items.length-Q,P=o.items.slice(0,Q));let T;if(y){const g=h?22:14;T=x.cy+g}else T=x.cy+(h?25:15);if([...P].forEach((g,z)=>{const w=T+z*(S+4),M=U.append("g"),I=M.append("text").attr("class","cynefinItemText").attr("x",0).attr("y",S/2).attr("text-anchor","middle").attr("dominant-baseline","central").text(g.label);let u=g.label.length*7;const $=I.node();if($&&typeof $.getBBox=="function"){const V=$.getBBox();V.width>0&&(u=V.width)}const C=u+tt*2,L=x.cx-C/2;M.attr("transform",`translate(${L}, ${w})`),M.insert("rect","text").attr("class","cynefinItem").attr("x",0).attr("y",0).attr("width",C).attr("height",S).attr("rx",4).attr("ry",4).attr("fill",H[l]).attr("fill-opacity",.95),I.attr("x",C/2).attr("y",S/2)}),v>0){const g=T+P.length*(S+4),z=`+${v} more`,w=U.append("g"),M=w.append("text").attr("class","cynefinItemText").attr("x",0).attr("y",S/2).attr("text-anchor","middle").attr("dominant-baseline","central").text(z);let I=z.length*7;const u=M.node();if(u&&typeof u.getBBox=="function"){const L=u.getBBox();L.width>0&&(I=L.width)}const $=I+tt*2,C=x.cx-$/2;w.attr("transform",`translate(${C}, ${g})`),w.insert("rect","text").attr("class","cynefinItemOverflow").attr("x",0).attr("y",0).attr("width",$).attr("height",S).attr("rx",4).attr("ry",4).attr("fill",H[l]).attr("fill-opacity",.6),M.attr("x",$/2).attr("y",S/2)}}if(D.length>0){const l=B.select("defs").empty()?B.append("defs"):B.select("defs"),o=`cynefin-arrow-${e}`;l.append("marker").attr("id",o).attr("viewBox","0 0 10 10").attr("refX",9).attr("refY",5).attr("markerWidth",6).attr("markerHeight",6).attr("orient","auto-start-reverse").append("path").attr("d","M 0 0 L 10 5 L 0 10 z").attr("class","cynefinArrowHead");const x=A.append("g").attr("class","cynefin-arrows");D.forEach(y=>{const P=N[y.from],v=N[y.to];if(!P||!v)return;if(y.from===y.to){O.warn(`Cynefin renderer: skipping self-loop on domain "${y.from}"`);return}const T=P.cx,g=P.cy,z=v.cx,w=v.cy,M=(T+z)/2,I=(g+w)/2,u=z-T,$=w-g,C=Math.sqrt(u*u+$*$),L=C*.15,V=-$/C,ht=u/C,et=M+V*L,nt=I+ht*L;x.append("path").attr("class","cynefinArrowLine").attr("d",`M${T},${g} Q${et},${nt} ${z},${w}`).attr("fill","none").attr("marker-end",`url(#${o})`),y.label&&x.append("text").attr("class","cynefinArrowLabel").attr("x",et).attr("y",nt-6).attr("text-anchor","middle").attr("dominant-baseline","auto").text(y.label)})}R&&A.append("text").attr("class","cynefinTitle").attr("x",s/2).attr("y",-b/2).attr("text-anchor","middle").attr("dominant-baseline","middle").text(R)},"draw"),Nt={draw:Ht},jt=i(()=>{const t=rt(),e=Y();return X(t,e.themeVariables).cynefin},"getCynefinTheme"),Gt=i(()=>{const t=jt();return`
	.cynefinDomain {
		stroke: none;
	}
	.cynefinDomainLabel {
		font-size: ${t.domainFontSize}px;
		font-weight: bold;
		fill: ${t.labelColor};
	}
	.cynefinSubtitle {
		font-size: ${t.itemFontSize-1}px;
		fill: ${t.textColor};
		font-style: italic;
	}
	.cynefinItem {
		fill-opacity: 0.95;
		stroke: ${t.boundaryColor};
		stroke-width: 1;
	}
	.cynefinItemText {
		font-size: ${t.itemFontSize}px;
		fill: ${t.textColor};
	}
	.cynefinItemOverflow {
		fill-opacity: 0.6;
		stroke: ${t.boundaryColor};
		stroke-width: 1;
		stroke-dasharray: 3 2;
	}
	.cynefinBoundary {
		stroke: ${t.boundaryColor};
		stroke-width: ${t.boundaryWidth};
		stroke-dasharray: 6 3;
	}
	.cynefinCliff {
		stroke: ${t.cliffColor};
		stroke-width: ${t.cliffWidth};
	}
	.cynefinConfusion {
		stroke: ${t.boundaryColor};
		stroke-width: 1.5;
		stroke-dasharray: 4 2;
	}
	.cynefinArrowLine {
		stroke: ${t.arrowColor};
		stroke-width: ${t.arrowWidth};
		fill: none;
	}
	.cynefinArrowHead {
		fill: ${t.arrowColor};
		stroke: none;
	}
	.cynefinArrowLabel {
		font-size: ${t.itemFontSize-1}px;
		fill: ${t.textColor};
	}
	.cynefinTitle {
		font-size: ${t.domainFontSize+2}px;
		font-weight: bold;
		fill: ${t.labelColor};
	}
	`},"styles"),Vt=Gt,Kt={parser:Ft,db:_,renderer:Nt,styles:Vt};export{Kt as diagram};
