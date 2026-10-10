import{o as rt}from"./chunk-JWPE2WC7-BPfUMuVx-BWhurgaw-CoPl3vX_-BqdpVP3i.js";import{f as nt,d as it,g as lt,h as st,R as ot,D as ct,e as h,I as j,x as ut,a1 as pt,ac as dt,ad as gt,i as ht,V as ft,a2 as mt,ae as C,af as xt,ag as I}from"./index-B0A2uqym.js";import{g as yt}from"./cynefin-VYW2F7L2-BTJyEgdq-XyyeITFA-Bk2wJR-i-NRwBwzPK.js";import{A as X}from"./arc-D_0w_X1x-C5kI_33h-CvZl-Xwt-BOdxqz3b.js";import{g as wt}from"./ordinal-Cboi1Yqb-DUCuiKwa-CWcq1aj8-Czq29l_9.js";import"./init-Gi6I4Gst-DHuO7-vr-BTi8F14B-DHuO7-vr.js";function vt(t,r){return r<t?-1:r>t?1:r>=t?0:NaN}function $t(t){return t}function St(){var t=$t,r=vt,v=null,p=C(0),f=C(I),$=C(0);function l(e){var s,n=(e=xt(e)).length,o,A,m=0,S=new Array(n),d=new Array(n),i=+p.apply(this,arguments),T=Math.min(I,Math.max(-I,f.apply(this,arguments)-i)),k,M=Math.min(Math.abs(T)/n,$.apply(this,arguments)),H=M*(T<0?-1:1),c;for(s=0;s<n;++s)(c=d[S[s]=s]=+t(e[s],s,e))>0&&(m+=c);for(r!=null?S.sort(function(R,O){return r(d[R],d[O])}):v!=null&&S.sort(function(R,O){return v(e[R],e[O])}),s=0,A=m?(T-n*H)/m:0;s<n;++s,i=k)o=S[s],c=d[o],k=i+(c>0?c*A:0)+H,d[o]={data:e[o],index:s,value:c,startAngle:i,endAngle:k,padAngle:M};return d}return l.value=function(e){return arguments.length?(t=typeof e=="function"?e:C(+e),l):t},l.sortValues=function(e){return arguments.length?(r=e,v=null,l):r},l.sort=function(e){return arguments.length?(v=e,r=null,l):v},l.startAngle=function(e){return arguments.length?(p=typeof e=="function"?e:C(+e),l):p},l.endAngle=function(e){return arguments.length?(f=typeof e=="function"?e:C(+e),l):f},l.padAngle=function(e){return arguments.length?($=typeof e=="function"?e:C(+e),l):$},l}var bt=mt.pie,q={sections:new Map,showData:!1},B=q.sections,Q=q.showData,At=structuredClone(bt),Tt=h(()=>structuredClone(At),"getConfig"),Ct=h(()=>{B=new Map,Q=q.showData,ft()},"clear"),Dt=h(({label:t,value:r})=>{if(r<0)throw new Error(`"${t}" has invalid value: ${r}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);B.has(t)||(B.set(t,r),j.debug(`added new section: ${t}, with value: ${r}`))},"addSection"),kt=h(()=>B,"getSections"),Mt=h(t=>{Q=t},"setShowData"),Rt=h(()=>Q,"getShowData"),_={getConfig:Tt,clear:Ct,setDiagramTitle:ct,getDiagramTitle:ot,setAccTitle:st,getAccTitle:lt,setAccDescription:it,getAccDescription:nt,addSection:Dt,getSections:kt,setShowData:Mt,getShowData:Rt},Ot=h((t,r)=>{rt(t,r),r.setShowData(t.showData),t.sections.map(r.addSection)},"populateDb"),zt={parse:h(async t=>{const r=await yt("pie",t);j.debug(r),Ot(r,_)},"parse")},Ft=h(t=>`
  .pieCircle{
    stroke: ${t.pieStrokeColor};
    stroke-width : ${t.pieStrokeWidth};
    opacity : ${t.pieOpacity};
  }
  .pieCircle.highlighted{
    scale: 1.05;
    opacity: 1;
  }
  .pieCircle.highlightedOnHover:hover{
    transition-duration: 250ms;
    scale: 1.05;
    opacity: 1;
  }
  .pieOuterCircle{
    stroke: ${t.pieOuterStrokeColor};
    stroke-width: ${t.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${t.pieTitleTextSize};
    fill: ${t.pieTitleTextColor};
    font-family: ${t.fontFamily};
  }
  .slice {
    font-family: ${t.fontFamily};
    fill: ${t.pieSectionTextColor};
    font-size:${t.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${t.pieLegendTextColor};
    font-family: ${t.fontFamily};
    font-size: ${t.pieLegendTextSize};
  }
`,"getStyles"),Ht=Ft,Pt=h(t=>{const r=[...t.values()].reduce((p,f)=>p+f,0),v=[...t.entries()].map(([p,f])=>({label:p,value:f})).filter(p=>p.value/r*100>=1);return St().value(p=>p.value).sort(null)(v)},"createPieArcs"),Wt=h((t,r,v,p)=>{var f;j.debug(`rendering pie chart
`+t);const $=p.db,l=ut(),e=pt($.getConfig(),l.pie),s=40,n=18,o=4,A=450,m=A,S=dt(r),d=S.append("g");d.attr("transform","translate("+m/2+","+A/2+")");const{themeVariables:i}=l;let[T]=gt(i.pieOuterStrokeWidth);T??(T=2);const k=e.legendPosition,M=e.textPosition,H=e.donutHole>0&&e.donutHole<=.9?e.donutHole:0,c=Math.min(m,A)/2-s,R=X().innerRadius(H*c).outerRadius(c),O=X().innerRadius(c*M).outerRadius(c*M),z=d.append("g");z.append("circle").attr("cx",0).attr("cy",0).attr("r",c+T/2).attr("class","pieOuterCircle");const P=$.getSections(),Y=Pt(P),Z=[i.pie1,i.pie2,i.pie3,i.pie4,i.pie5,i.pie6,i.pie7,i.pie8,i.pie9,i.pie10,i.pie11,i.pie12];let N=0;P.forEach(a=>{N+=a});const G=Y.filter(a=>(a.data.value/N*100).toFixed(0)!=="0"),L=wt(Z).domain([...P.keys()]);z.selectAll("mySlices").data(G).enter().append("path").attr("d",R).attr("fill",a=>L(a.data.label)).attr("class",a=>{let u="pieCircle";return e.highlightSlice==="hover"?u+=" highlightedOnHover":e.highlightSlice===a.data.label&&(u+=" highlighted"),u}),z.selectAll("mySlices").data(G).enter().append("text").text(a=>(a.data.value/N*100).toFixed(0)+"%").attr("transform",a=>"translate("+O.centroid(a)+")").style("text-anchor","middle").attr("class","slice");const tt=d.append("text").text($.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText"),F=[...P.entries()].map(([a,u])=>({label:a,value:u})),b=d.selectAll(".legend").data(F).enter().append("g").attr("class","legend");b.append("rect").attr("width",n).attr("height",n).style("fill",a=>L(a.label)).style("stroke",a=>L(a.label)),b.append("text").attr("x",n+o).attr("y",n-o).text(a=>$.getShowData()?`${a.label} [${a.value}]`:a.label);const D=Math.max(...b.selectAll("text").nodes().map(a=>(a==null?void 0:a.getBoundingClientRect().width)??0));let W=A,V=m+s;const g=n+o,E=F.length*g;switch(k){case"center":b.attr("transform",(a,u)=>{const x=g*F.length/2,y=-D/2-(n+o),w=u*g-x;return"translate("+y+","+w+")"});break;case"top":W+=E,b.attr("transform",(a,u)=>{const x=c,y=-D/2-(n+o),w=u*g-x;return`translate(${y}, ${w})`}),z.attr("transform",()=>`translate(0, ${E+g})`);break;case"bottom":W+=E,b.attr("transform",(a,u)=>{const x=-c-g,y=-D/2-(n+o),w=u*g-x;return"translate("+y+","+w+")"});break;case"left":V+=n+o+D,b.attr("transform",(a,u)=>{const x=g*F.length/2,y=-c-(n+o),w=u*g-x;return"translate("+y+","+w+")"}),z.attr("transform",()=>`translate(${D+n+o}, 0)`);break;case"right":default:V+=n+o+D,b.attr("transform",(a,u)=>{const x=g*F.length/2,y=12*n,w=u*g-x;return"translate("+y+","+w+")"});break}const J=((f=tt.node())==null?void 0:f.getBoundingClientRect().width)??0,et=m/2-J/2,at=m/2+J/2,K=Math.min(0,et),U=Math.max(V,at)-K;S.attr("viewBox",`${K} 0 ${U} ${W}`),ht(S,W,U,e.useMaxWidth)},"draw"),Bt={draw:Wt},qt={parser:zt,db:_,renderer:Bt,styles:Ht};export{qt as diagram};
