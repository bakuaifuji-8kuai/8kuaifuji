import{o as I}from"./chunk-JWPE2WC7-BPfUMuVx-BWhurgaw-CoPl3vX_-BqdpVP3i.js";import{d as S,f as F,R as P,D as R,g as z,h as E,e as c,ac as D,V,a1 as y,p as w,a2 as B,I as G,ah as W,i as j}from"./index-B0A2uqym.js";import{g as _}from"./cynefin-VYW2F7L2-BTJyEgdq-XyyeITFA-Bk2wJR-i-NRwBwzPK.js";var h={showLegend:!0,ticks:5,max:null,min:0,graticule:"circle"},b={axes:[],curves:[],options:h},x=structuredClone(b),q=B.radar,N=c(()=>y({...q,...w().radar}),"getConfig"),C=c(()=>x.axes,"getAxes"),H=c(()=>x.curves,"getCurves"),J=c(()=>x.options,"getOptions"),K=c(a=>{x.axes=a.map(t=>({name:t.name,label:t.label??t.name}))},"setAxes"),Q=c(a=>{x.curves=a.map(t=>({name:t.name,label:t.label??t.name,entries:U(t.entries)}))},"setCurves"),U=c(a=>{if(a[0].axis==null)return a.map(e=>e.value);const t=C();if(t.length===0)throw new Error("Axes must be populated before curves for reference entries");return t.map(e=>{const r=a.find(s=>{var n;return((n=s.axis)==null?void 0:n.$refText)===e.name});if(r===void 0)throw new Error("Missing entry for axis "+e.label);return r.value})},"computeCurveEntries"),X=c(a=>{var t,e,r,s,n;const i=a.reduce((o,l)=>(o[l.name]=l,o),{});x.options={showLegend:((t=i.showLegend)==null?void 0:t.value)??h.showLegend,ticks:((e=i.ticks)==null?void 0:e.value)??h.ticks,max:((r=i.max)==null?void 0:r.value)??h.max,min:((s=i.min)==null?void 0:s.value)??h.min,graticule:((n=i.graticule)==null?void 0:n.value)??h.graticule}},"setOptions"),Y=c(()=>{V(),x=structuredClone(b)},"clear"),f={getAxes:C,getCurves:H,getOptions:J,setAxes:K,setCurves:Q,setOptions:X,getConfig:N,clear:Y,setAccTitle:E,getAccTitle:z,setDiagramTitle:R,getDiagramTitle:P,getAccDescription:F,setAccDescription:S},Z=c(a=>{I(a,f);const{axes:t,curves:e,options:r}=a;f.setAxes(t),f.setCurves(e),f.setOptions(r)},"populate"),tt={parse:c(async a=>{const t=await _("radar",a);G.debug(t),Z(t)},"parse")},et=c((a,t,e,r)=>{const s=r.db,n=s.getAxes(),i=s.getCurves(),o=s.getOptions(),l=s.getConfig(),d=s.getDiagramTitle(),u=D(t),g=at(u,l),p=o.max??Math.max(...i.map(v=>Math.max(...v.entries))),m=o.min,$=Math.min(l.width,l.height)/2;rt(g,n,$,o.ticks,o.graticule),st(g,n,$,l),M(g,n,i,m,p,o.graticule,l),k(g,i,o.showLegend,l),g.append("text").attr("class","radarTitle").text(d).attr("x",0).attr("y",-l.height/2-l.marginTop)},"draw"),at=c((a,t)=>{const e=t.width+t.marginLeft+t.marginRight,r=t.height+t.marginTop+t.marginBottom,s={x:t.marginLeft+t.width/2,y:t.marginTop+t.height/2};return j(a,r,e,t.useMaxWidth??!0),a.attr("viewBox",`0 0 ${e} ${r}`).attr("overflow","visible"),a.append("g").attr("transform",`translate(${s.x}, ${s.y})`)},"drawFrame"),rt=c((a,t,e,r,s)=>{if(s==="circle")for(let n=0;n<r;n++){const i=e*(n+1)/r;a.append("circle").attr("r",i).attr("class","radarGraticule")}else if(s==="polygon"){const n=t.length;for(let i=0;i<r;i++){const o=e*(i+1)/r,l=t.map((d,u)=>{const g=2*u*Math.PI/n-Math.PI/2,p=o*Math.cos(g),m=o*Math.sin(g);return`${p},${m}`}).join(" ");a.append("polygon").attr("points",l).attr("class","radarGraticule")}}},"drawGraticule"),st=c((a,t,e,r)=>{const s=t.length;for(let n=0;n<s;n++){const i=t[n].label,o=2*n*Math.PI/s-Math.PI/2,l=Math.cos(o),d=Math.sin(o);a.append("line").attr("x1",0).attr("y1",0).attr("x2",e*r.axisScaleFactor*l).attr("y2",e*r.axisScaleFactor*d).attr("class","radarAxisLine");const u=l>.01?"start":l<-.01?"end":"middle",g=d>.01?"hanging":d<-.01?"auto":"central",p=4;a.append("text").text(i).attr("x",e*r.axisLabelFactor*l+p*l).attr("y",e*r.axisLabelFactor*d+p*d).attr("text-anchor",u).attr("dominant-baseline",g).attr("class","radarAxisLabel")}},"drawAxes");function M(a,t,e,r,s,n,i){const o=t.length,l=Math.min(i.width,i.height)/2;e.forEach((d,u)=>{if(d.entries.length!==o)return;const g=d.entries.map((p,m)=>{const $=2*Math.PI*m/o-Math.PI/2,v=L(p,r,s,l),A=v*Math.cos($),O=v*Math.sin($);return{x:A,y:O}});n==="circle"?a.append("path").attr("d",T(g,i.curveTension)).attr("class",`radarCurve-${u}`):n==="polygon"&&a.append("polygon").attr("points",g.map(p=>`${p.x},${p.y}`).join(" ")).attr("class",`radarCurve-${u}`)})}c(M,"drawCurves");function L(a,t,e,r){const s=Math.min(Math.max(a,t),e);return r*(s-t)/(e-t)}c(L,"relativeRadius");function T(a,t){const e=a.length;let r=`M${a[0].x},${a[0].y}`;for(let s=0;s<e;s++){const n=a[(s-1+e)%e],i=a[s],o=a[(s+1)%e],l=a[(s+2)%e],d={x:i.x+(o.x-n.x)*t,y:i.y+(o.y-n.y)*t},u={x:o.x-(l.x-i.x)*t,y:o.y-(l.y-i.y)*t};r+=` C${d.x},${d.y} ${u.x},${u.y} ${o.x},${o.y}`}return`${r} Z`}c(T,"closedRoundCurve");function k(a,t,e,r){if(!e)return;const s=(r.width/2+r.marginRight)*3/4,n=-(r.height/2+r.marginTop)*3/4,i=20;t.forEach((o,l)=>{const d=a.append("g").attr("transform",`translate(${s}, ${n+l*i})`);d.append("rect").attr("width",12).attr("height",12).attr("class",`radarLegendBox-${l}`),d.append("text").attr("x",16).attr("y",0).attr("class","radarLegendText").text(o.label)})}c(k,"drawLegend");var nt={draw:et},it=c((a,t)=>{let e="";for(let r=0;r<a.THEME_COLOR_LIMIT;r++){const s=a[`cScale${r}`];e+=`
		.radarCurve-${r} {
			color: ${s};
			fill: ${s};
			fill-opacity: ${t.curveOpacity};
			stroke: ${s};
			stroke-width: ${t.curveStrokeWidth};
		}
		.radarLegendBox-${r} {
			fill: ${s};
			fill-opacity: ${t.curveOpacity};
			stroke: ${s};
		}
		`}return e},"genIndexStyles"),ot=c(a=>{const t=W(),e=w(),r=y(t,e.themeVariables),s=y(r.radar,a);return{themeVariables:r,radarOptions:s}},"buildRadarStyleOptions"),lt=c(({radar:a}={})=>{const{themeVariables:t,radarOptions:e}=ot(a);return`
	.radarTitle {
		font-size: ${t.fontSize};
		color: ${t.titleColor};
		dominant-baseline: hanging;
		text-anchor: middle;
	}
	.radarAxisLine {
		stroke: ${e.axisColor};
		stroke-width: ${e.axisStrokeWidth};
	}
	.radarAxisLabel {
		font-size: ${e.axisLabelFontSize}px;
		color: ${e.axisColor};
	}
	.radarGraticule {
		fill: ${e.graticuleColor};
		fill-opacity: ${e.graticuleOpacity};
		stroke: ${e.graticuleColor};
		stroke-width: ${e.graticuleStrokeWidth};
	}
	.radarLegendText {
		text-anchor: start;
		font-size: ${e.legendFontSize}px;
		dominant-baseline: hanging;
	}
	${it(t,e)}
	`},"styles"),ut={parser:tt,db:f,renderer:nt,styles:lt};export{ut as diagram};
