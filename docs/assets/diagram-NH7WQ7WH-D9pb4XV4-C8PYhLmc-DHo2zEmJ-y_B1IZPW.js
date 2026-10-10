import{o as C}from"./chunk-JWPE2WC7-BPfUMuVx-BWhurgaw-CoPl3vX_-BqdpVP3i.js";import{e as f,a1 as w,ac as v,i as P,I as m,h as z,g as S,D as F,R as T,f as W,d as D,p as E,a2 as R,V as I}from"./index-B0A2uqym.js";import{g as A}from"./cynefin-VYW2F7L2-BTJyEgdq-XyyeITFA-Bk2wJR-i-NRwBwzPK.js";var L=R.packet,u,x=(u=class{constructor(){this.packet=[],this.setAccTitle=z,this.getAccTitle=S,this.setDiagramTitle=F,this.getDiagramTitle=T,this.getAccDescription=W,this.setAccDescription=D}getConfig(){const t=w({...L,...E().packet});return t.showBits&&(t.paddingY+=10),t}getPacket(){return this.packet}pushWord(t){t.length>0&&this.packet.push(t)}clear(){I(),this.packet=[]}},f(u,"PacketDB"),u),Y=1e4,M=f((t,e)=>{C(t,e);let s=-1,r=[],l=1;const{bitsPerRow:n}=e.getConfig();for(let{start:a,end:o,bits:c,label:d}of t.blocks){if(a!==void 0&&o!==void 0&&o<a)throw new Error(`Packet block ${a} - ${o} is invalid. End must be greater than start.`);if(a??(a=s+1),a!==s+1)throw new Error(`Packet block ${a} - ${o??a} is not contiguous. It should start from ${s+1}.`);if(c===0)throw new Error(`Packet block ${a} is invalid. Cannot have a zero bit field.`);for(o??(o=a+(c??1)-1),c??(c=o-a+1),s=o,m.debug(`Packet block ${a} - ${s} with label ${d}`);r.length<=n+1&&e.getPacket().length<Y;){const[p,i]=N({start:a,end:o,bits:c,label:d},l,n);if(r.push(p),p.end+1===l*n&&(e.pushWord(r),r=[],l++),!i)break;({start:a,end:o,bits:c,label:d}=i)}}e.pushWord(r)},"populate"),N=f((t,e,s)=>{if(t.start===void 0)throw new Error("start should have been set during first phase");if(t.end===void 0)throw new Error("end should have been set during first phase");if(t.start>t.end)throw new Error(`Block start ${t.start} is greater than block end ${t.end}.`);if(t.end+1<=e*s)return[t,void 0];const r=e*s-1,l=e*s;return[{start:t.start,end:r,label:t.label,bits:r-t.start},{start:l,end:t.end,label:t.label,bits:t.end-l}]},"getNextFittingBlock"),y={parser:{yy:void 0},parse:f(async t=>{var e;const s=await A("packet",t),r=(e=y.parser)==null?void 0:e.yy;if(!(r instanceof x))throw new Error("parser.parser?.yy was not a PacketDB. This is due to a bug within Mermaid, please report this issue at https://github.com/mermaid-js/mermaid/issues.");m.debug(s),M(s,r)},"parse")},j=f((t,e,s,r)=>{const l=r.db,n=l.getConfig(),{rowHeight:a,paddingY:o,bitWidth:c,bitsPerRow:d}=n,p=l.getPacket(),i=l.getDiagramTitle(),b=a+o,h=b*(p.length+1)-(i?0:a),k=c*d+2,g=v(e);g.attr("viewBox",`0 0 ${k} ${h}`),P(g,h,k,n.useMaxWidth);for(const[$,B]of p.entries())q(g,B,$,n);g.append("text").text(i).attr("x",k/2).attr("y",h-b/2).attr("dominant-baseline","middle").attr("text-anchor","middle").attr("class","packetTitle")},"draw"),q=f((t,e,s,{rowHeight:r,paddingX:l,paddingY:n,bitWidth:a,bitsPerRow:o,showBits:c})=>{const d=t.append("g"),p=s*(r+n)+n;for(const i of e){const b=i.start%o*a+1,h=(i.end-i.start+1)*a-l;if(d.append("rect").attr("x",b).attr("y",p).attr("width",h).attr("height",r).attr("class","packetBlock"),d.append("text").attr("x",b+h/2).attr("y",p+r/2).attr("class","packetLabel").attr("dominant-baseline","middle").attr("text-anchor","middle").text(i.label),!c)continue;const k=i.end===i.start,g=p-2;d.append("text").attr("x",b+(k?h/2:0)).attr("y",g).attr("class","packetByte start").attr("dominant-baseline","auto").attr("text-anchor",k?"middle":"start").text(i.start),k||d.append("text").attr("x",b+h).attr("y",g).attr("class","packetByte end").attr("dominant-baseline","auto").attr("text-anchor","end").text(i.end)}},"drawWord"),H={draw:j},X={byteFontSize:"10px",startByteColor:"black",endByteColor:"black",labelColor:"black",labelFontSize:"12px",titleColor:"black",titleFontSize:"14px",blockStrokeColor:"black",blockStrokeWidth:"1",blockFillColor:"#efefef"},G=f(({packet:t}={})=>{const e=w(X,t);return`
	.packetByte {
		font-size: ${e.byteFontSize};
	}
	.packetByte.start {
		fill: ${e.startByteColor};
	}
	.packetByte.end {
		fill: ${e.endByteColor};
	}
	.packetLabel {
		fill: ${e.labelColor};
		font-size: ${e.labelFontSize};
	}
	.packetTitle {
		fill: ${e.titleColor};
		font-size: ${e.titleFontSize};
	}
	.packetBlock {
		stroke: ${e.blockStrokeColor};
		stroke-width: ${e.blockStrokeWidth};
		fill: ${e.blockFillColor};
	}
	`},"styles"),O={parser:y,get db(){return new x},renderer:H,styles:G};export{O as diagram};
