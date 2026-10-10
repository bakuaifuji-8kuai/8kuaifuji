import{o as $t}from"./chunk-JWPE2WC7-BPfUMuVx-BWhurgaw-CoPl3vX_-BqdpVP3i.js";import{d as gt,f as ut,R as bt,D as wt,g as Ct,h as kt,e as i,I as O,ac as Dt,i as Bt,V as At,a1 as Y,p as Q,a2 as Tt,ah as rt}from"./index-B0A2uqym.js";import{g as St}from"./cynefin-VYW2F7L2-BTJyEgdq-XyyeITFA-Bk2wJR-i-NRwBwzPK.js";var ot=i(()=>({domains:new Map,transitions:[]}),"createDefaultData"),V=ot(),zt=i(()=>V.domains,"getDomains"),Lt=i(()=>V.transitions,"getTransitions"),It=i(t=>{if(t)for(const e of t){const n=e.domain,a=(e.items??[]).map(c=>({label:c.label}));V.domains.set(n,{name:n,items:a})}},"setDomains"),Mt=i(t=>{t&&(V.transitions=t.filter(e=>e.from===e.to?(O.warn(`Cynefin: self-loop transition on domain "${e.from}" is not meaningful and will be skipped.`),!1):!0).map(e=>({from:e.from,to:e.to,label:e.label||void 0})))},"setTransitions"),Pt=i(()=>Y({...Tt.cynefin,...Q().cynefin}),"getConfig"),vt=i(()=>{At(),V=ot()},"clear"),q={getDomains:zt,getTransitions:Lt,setDomains:It,setTransitions:Mt,getConfig:Pt,clear:vt,setAccTitle:kt,getAccTitle:Ct,setDiagramTitle:wt,getDiagramTitle:bt,getAccDescription:ut,setAccDescription:gt},Ft=i(t=>{$t(t,q),q.setDomains(t.domains),q.setTransitions(t.transitions)},"populate"),Rt={parse:i(async t=>{const e=await St("cynefin",t);O.debug(e),Ft(e)},"parse")};function N(t){let e=t+1831565813|0;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}i(N,"seededRandom");function it(t){let e=0;for(let n=0;n<t.length;n++){const a=t.charCodeAt(n);e=(e<<5)-e+a,e|=0}return e}i(it,"hashString");function st(t,e){return typeof t=="number"&&Number.isFinite(t)&&t!==0?t:it(e)}i(st,"resolveSeed");function ct(t,e,n,a){const c=t/2,p=a??t*.015,k=7,F=e/k,d=[];for(let r=0;r<=k;r++){const m=N(n+r*17)*p*2-p;d.push({x:c+m,y:r*F})}let D=`M${d[0].x},${d[0].y}`;for(let r=0;r<d.length-1;r++){const m=d[r],s=d[r+1],f=(m.y+s.y)/2,b=r%2===0?1:-1,h=p*1.5*b*N(n+r*31+7),R=m.x+h,W=f,H=s.x-h;D+=` C${R},${W} ${H},${f} ${s.x},${s.y}`}return D}i(ct,"generateFoldPath");function lt(t,e,n,a){const c=e/2,p=a??e*.015,k=7,F=t/k,d=[];for(let r=0;r<=k;r++){const m=N(n+r*23)*p*2-p;d.push({x:r*F,y:c+m})}let D=`M${d[0].x},${d[0].y}`;for(let r=0;r<d.length-1;r++){const m=d[r],s=d[r+1],f=(m.x+s.x)/2,b=r%2===0?1:-1,h=p*1.5*b*N(n+r*37+11),R=f,W=m.y+h,H=f,E=s.y-h;D+=` C${R},${W} ${H},${E} ${s.x},${s.y}`}return D}i(lt,"generateHorizontalBoundary");function dt(t,e){const n=t/2,a=e*.5,c=e,p=t*.03;return[`M${n},${a}`,`C${n+p},${a+(c-a)*.2}`,`${n-p*1.5},${a+(c-a)*.55}`,`${n+p*.5},${a+(c-a)*.75}`,`C${n-p},${a+(c-a)*.85}`,`${n+p*.3},${a+(c-a)*.95}`,`${n},${c}`].join(" ")}i(dt,"generateCliffPath");function ft(t,e,n,a){return[`M${t-n},${e}`,`A${n},${a} 0 1,1 ${t+n},${e}`,`A${n},${a} 0 1,1 ${t-n},${e}`,"Z"].join(" ")}i(ft,"generateConfusionPath");var at={complex:{model:"Probe → Sense → Respond",practice:"Emergent Practices"},complicated:{model:"Sense → Analyse → Respond",practice:"Good Practices"},clear:{model:"Sense → Categorise → Respond",practice:"Best Practices"},chaotic:{model:"Act → Sense → Respond",practice:"Novel Practices"},confusion:{model:"",practice:"Disorder"}},Wt=i((t,e)=>{const n=t/2,a=e/2;return{complex:{cx:n/2,cy:a/2,x:0,y:0,w:n,h:a},complicated:{cx:n+n/2,cy:a/2,x:n,y:0,w:n,h:a},chaotic:{cx:n/2,cy:a+a/2,x:0,y:a,w:n,h:a},clear:{cx:n+n/2,cy:a+a/2,x:n,y:a,w:n,h:a},confusion:{cx:n,cy:a,x:n*.7,y:a*.7,w:n*.6,h:a*.6}}},"getDomainLayouts"),Ht=i(()=>{const t=rt(),e=Q();return Y(t,e.themeVariables).cynefin},"getCynefinDomainColors"),X=3,Et=i((t,e,n,a)=>{const c=a.db,p=c.getDomains(),k=c.getTransitions(),F=c.getDiagramTitle(),d=c.getAccTitle(),D=c.getAccDescription(),r=c.getConfig(),m=Ht();O.debug("Rendering Cynefin diagram");const s=r.width,f=r.height,b=r.padding,h=r.showDomainDescriptions,R=r.boundaryAmplitude,W=s+b*2,H=f+b*2,E={complex:m.complexBg,complicated:m.complicatedBg,clear:m.clearBg,chaotic:m.chaoticBg,confusion:m.confusionBg},B=Dt(e);Bt(B,H,W,r.useMaxWidth??!0),B.attr("viewBox",`0 0 ${W} ${H}`),d&&B.append("title").text(d),D&&B.append("desc").text(D);const A=B.append("g").attr("transform",`translate(${b}, ${b})`),j=Wt(s,f),Z=st(r.seed,e),pt=A.append("g").attr("class","cynefin-backgrounds"),K=["complex","complicated","chaotic","clear"];for(const l of K){const o=j[l];pt.append("rect").attr("class","cynefinDomain").attr("x",o.x).attr("y",o.y).attr("width",o.w).attr("height",o.h).attr("fill",E[l]).attr("fill-opacity",.4).attr("stroke","none")}const U=A.append("g").attr("class","cynefin-boundaries");U.append("path").attr("class","cynefinBoundary").attr("d",ct(s,f,Z,R)).attr("fill","none"),U.append("path").attr("class","cynefinBoundary").attr("d",lt(s,f,Z+100,R)).attr("fill","none"),U.append("path").attr("class","cynefinCliff").attr("d",dt(s,f)).attr("fill","none");const mt=s*.15,yt=f*.15;A.append("path").attr("class","cynefinConfusion").attr("d",ft(s/2,f/2,mt,yt)).attr("fill",E.confusion).attr("fill-opacity",.5);const _=A.append("g").attr("class","cynefin-labels");for(const l of K){const o=j[l];_.append("text").attr("class","cynefinDomainLabel").attr("x",o.cx).attr("y",h?o.cy-30:o.cy).attr("text-anchor","middle").attr("dominant-baseline","middle").text(l.charAt(0).toUpperCase()+l.slice(1))}if(_.append("text").attr("class","cynefinDomainLabel").attr("x",s/2).attr("y",h?f/2-10:f/2).attr("text-anchor","middle").attr("dominant-baseline","middle").text("Confusion"),h){const l=A.append("g").attr("class","cynefin-subtitles");for(const o of K){const x=j[o],y=at[o];l.append("text").attr("class","cynefinSubtitle").attr("x",x.cx).attr("y",x.cy-10).attr("text-anchor","middle").attr("dominant-baseline","middle").text(y.model),l.append("text").attr("class","cynefinSubtitle").attr("x",x.cx).attr("y",x.cy+5).attr("text-anchor","middle").attr("dominant-baseline","middle").text(y.practice)}l.append("text").attr("class","cynefinSubtitle").attr("x",s/2).attr("y",f/2+8).attr("text-anchor","middle").attr("dominant-baseline","middle").text(at.confusion.practice)}const J=A.append("g").attr("class","cynefin-items"),T=26,tt=10,xt=["complex","complicated","chaotic","clear","confusion"];for(const l of xt){const o=p.get(l);if(!o||o.items.length===0)continue;const x=j[l],y=l==="confusion";let I=o.items,M=0;y&&o.items.length>X&&(M=o.items.length-X,I=o.items.slice(0,X));let S;if(y){const g=h?22:14;S=x.cy+g}else S=x.cy+(h?25:15);if([...I].forEach((g,z)=>{const w=S+z*(T+4),L=J.append("g"),P=L.append("text").attr("class","cynefinItemText").attr("x",0).attr("y",T/2).attr("text-anchor","middle").attr("dominant-baseline","central").text(g.label);let u=g.label.length*7;const $=P.node();if($&&typeof $.getBBox=="function"){const G=$.getBBox();G.width>0&&(u=G.width)}const C=u+tt*2,v=x.cx-C/2;L.attr("transform",`translate(${v}, ${w})`),L.insert("rect","text").attr("class","cynefinItem").attr("x",0).attr("y",0).attr("width",C).attr("height",T).attr("rx",4).attr("ry",4).attr("fill",E[l]).attr("fill-opacity",.95),P.attr("x",C/2).attr("y",T/2)}),M>0){const g=S+I.length*(T+4),z=`+${M} more`,w=J.append("g"),L=w.append("text").attr("class","cynefinItemText").attr("x",0).attr("y",T/2).attr("text-anchor","middle").attr("dominant-baseline","central").text(z);let P=z.length*7;const u=L.node();if(u&&typeof u.getBBox=="function"){const v=u.getBBox();v.width>0&&(P=v.width)}const $=P+tt*2,C=x.cx-$/2;w.attr("transform",`translate(${C}, ${g})`),w.insert("rect","text").attr("class","cynefinItemOverflow").attr("x",0).attr("y",0).attr("width",$).attr("height",T).attr("rx",4).attr("ry",4).attr("fill",E[l]).attr("fill-opacity",.6),L.attr("x",$/2).attr("y",T/2)}}if(k.length>0){const l=B.select("defs").empty()?B.append("defs"):B.select("defs"),o=`cynefin-arrow-${e}`;l.append("marker").attr("id",o).attr("viewBox","0 0 10 10").attr("refX",9).attr("refY",5).attr("markerWidth",6).attr("markerHeight",6).attr("orient","auto-start-reverse").append("path").attr("d","M 0 0 L 10 5 L 0 10 z").attr("class","cynefinArrowHead");const x=A.append("g").attr("class","cynefin-arrows");k.forEach(y=>{const I=j[y.from],M=j[y.to];if(!I||!M)return;if(y.from===y.to){O.warn(`Cynefin renderer: skipping self-loop on domain "${y.from}"`);return}const S=I.cx,g=I.cy,z=M.cx,w=M.cy,L=(S+z)/2,P=(g+w)/2,u=z-S,$=w-g,C=Math.sqrt(u*u+$*$),v=C*.15,G=-$/C,ht=u/C,et=L+G*v,nt=P+ht*v;x.append("path").attr("class","cynefinArrowLine").attr("d",`M${S},${g} Q${et},${nt} ${z},${w}`).attr("fill","none").attr("marker-end",`url(#${o})`),y.label&&x.append("text").attr("class","cynefinArrowLabel").attr("x",et).attr("y",nt-6).attr("text-anchor","middle").attr("dominant-baseline","auto").text(y.label)})}F&&A.append("text").attr("class","cynefinTitle").attr("x",s/2).attr("y",-b/2).attr("text-anchor","middle").attr("dominant-baseline","middle").text(F)},"draw"),jt={draw:Et},Nt=i(()=>{const t=rt(),e=Q();return Y(t,e.themeVariables).cynefin},"getCynefinTheme"),Vt=i(()=>{const t=Nt();return`
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
	`},"styles"),Gt=Vt,Ut={parser:Rt,db:q,renderer:jt,styles:Gt};export{Ut as diagram};
