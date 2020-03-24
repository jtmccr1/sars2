/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import React, {useEffect, useState,useMemo} from 'react';
import {parseNexus,FigTree,Nodes,collapseUnsupportedNodes,InteractionContainer,
    orderByNodeDensity,Branches,annotateNode,Axis,Legend,NodeBackgrounds,
    Map,Features,GreatCircleArcMissal,getDateRange,getTips,Timeline,Label,PlotLayer,Element,
AxisBars} from "figtreejs-react"
import {csv} from "d3-fetch";
import {schemeTableau10,schemeSet3,schemePaired} from "d3-scale-chromatic";
import {scaleOrdinal, scaleTime} from "d3-scale";
import {max,min} from "d3-array";
import {timeFormat} from "d3-time-format";
import {feature} from "topojson-client";
import {geoPeirceQuincuncial} from "d3-geo-projection";
import ReactTooltip from "react-tooltip";
import {format} from "d3-format";
import {line} from "d3-shape";
import {extent} from "d3-array";


const processTree=tree=> {
    return collapseUnsupportedNodes(orderByNodeDensity(tree, false), node => node.annotations.posterior < 0.5);
};
function App() {
  const [tree,setTree]=useState(null);
  const [originalTree,setOriginalTree] = useState(null);
  const [geographies,setGeographies] = useState(null);
  useEffect(()=>{
    // fetch(process.env.PUBLIC_URL+"/data/2020-03-10/tree.MCC")
    fetch(process.env.PUBLIC_URL+"/data/2020-03-10/2020-03-19_nCoV.mcc.tre")
        .then(res=> res.text())
        .then(text=> {
          let tree= processTree(parseNexus(text,{datePrefix: "|",dateFormat:"%Y-%m-%d"})[0]);
            // csv(process.env.PUBLIC_URL+"/data/2020-03-10/metadata.csv")
            //     .then((data)=>{
            //         const externalNodes =getTips(tree).map(t=>t.name);
            //         for(const tip of data){
            //             if(externalNodes.includes(tip.label)){
            //                 tree=annotateNode(tree,tip.label,{country:tip.country})
            //             }
            //         }
            //         setTree(tree);
            //     })
            const externalNodes =getTips(tree);//.map(t=>t.name);
            for(const tip of externalNodes){
                let country = tip.name.split("|").reverse()[1];
                country= country==="USA"?"United States of America":
                    country==="UnitedKingdom"?"United Kingdom":
                        country==="SouthKorea"?"South Korea":
                            country==="HongKong"?"Hong Kong":
                                country==="CzechRepublic"?"Czech Republic":
                                    country==="NewZealand"?"New Zealand":country;
                tree=annotateNode(tree,tip.id,{country:country})
            }
            setTree(tree);
            setOriginalTree(tree);
        })
  },[]);


  useEffect(()=>{
      fetch(process.env.PUBLIC_URL+"/data/world-110m.json")
          .then(response => {
          if (response.status !== 200) {
              return
          }
          response.json().then(worlddata => {
              const countries = feature(worlddata, worlddata.objects.countries).features;
              countries.forEach(f=>f["annotations"]={"country":f.properties.name});
              setGeographies(countries)
          })
      })
  },[]);


  useEffect(()=>{
      ReactTooltip.rebuild();
  },[tree]);
  const width=1100,height=600,margins={top:10,right:210,bottom:75,left:40};
  const mapWidth=400,mapHeight=400;

  if(tree!==null&&geographies!==null){
      const scheme = schemeTableau10.concat(schemeSet3).concat(schemePaired);
      const colorScale = scaleOrdinal().domain(originalTree.annotationTypes.country.values).range(scheme);
      const timeScale = scaleTime().domain(getDateRange(tree)).range([0,(width-margins.left-margins.right)]);
      const projection = geoPeirceQuincuncial()
          .translate([ mapWidth/2, mapHeight/2 ])
          .scale(85);
      const figtreeSize = {width:width-margins.left-margins.right,height:(height-margins.top-margins.bottom)};
      const nodeWidth = min([10,max([2,figtreeSize.height/2/getTips(tree).length])]);
      return (
          <div css={css`display: flex; flex-direction: row; padding-left: 2%; padding-top: 2%; flex-wrap: nowrap;justify-content: flex-start;   align-items: center;}`}>

          <InteractionContainer>
              <div css={css`flex-basis:90%;`}>
              <svg viewBox={`0,0,${width},${height}`}>
                  <rect width={width} height={height} fill={"none"} pointerEvents={"all"} onClick={()=>{setTree(originalTree)}}/>

                  <FigTree width={figtreeSize.width} height={figtreeSize.height} data={tree} pos={{x:margins.left,y:margins.top}} getDateExtent={getDateRange} >
                                <Nodes.Coalescent filter={(v=>v.node.children && v.node.children.length>2)}
                                                attrs={{fill:v=>(v.node.annotations.country?colorScale(v.node.annotations.country):"grey")}}
                                                interactions={{"onClick":(v)=>{console.log(v);setTree(v.node)}}}/>
                              <NodeBackgrounds.Circle filter={(v=>v.node.children===null)} attrs={{r:nodeWidth+1,fill:"black"}}/>
                              <Nodes.Circle tooltip={{'data-tip':v=>v.id}}
                                            filter={(v=>v.node.children===null)}
                                            attrs={{r:nodeWidth,fill:v=>colorScale(v.node.annotations.country),strokeWidth:0,stroke:"black"}}
                                            hoveredAttrs={{r:nodeWidth+4,strokeWidth:1}}/>
                              {/*<Label css={`opacity:0; pointer-events:all;&:hover {opacity:1};`}/>*/}
                              <Branches.Coalescent filter={(e=>e.v0.node.children.length>2)} attrs={{strokeWidth:2, stroke:e=>e.v1.node.annotations.country? colorScale(e.v1.node.annotations.country):"grey"}}/>
                              <Branches.Rectangular filter={(e=>e.v0.node.children.length<=2)} attrs={{strokeWidth:2, stroke:e=>e.v1.node.annotations.country? colorScale(e.v1.node.annotations.country):"grey"}}/>
                                <Axis direction={"horizontal"} scale={timeScale} gap={10} ticks={{number: 10, format: timeFormat("%m-%d"), padding: 20, style: {}, length: 6}}>
                                  <AxisBars lift={5}/>
                              </Axis>
                              <Legend.Discrete height={700} columns={1} width={200} pos={{x:870,y:0}} swatchSize={8} scale={colorScale} annotation={"country"}/>
                          </FigTree>

              </svg>
              </div>
                {/*<div css={css`flex-basis:30%`}>*/}

                {/*    <svg viewBox={`0,0,${mapWidth},${mapHeight}`}>*/}
                {/*          <Map projection = {projection}>*/}
                {/*            <Features geographies={geographies}*/}
                {/*                      attrs={{stroke:"black",strokeWidth:1,opacity:0.9,*/}
                {/*                          fill:(f)=>colorScale.domain().includes(f.properties.name)?colorScale(f.properties.name):'#f5f5dc'}}*/}
                {/*                      hoveredAttrs={{strokeWidth:2,opacity:1}}*/}
                {/*                      hoverKey={"country"}*/}
                {/*              tooltip={{'data-tip':v=>v.annotations.country}}*/}
                {/*            />*/}
                {/*            /!*<GreatCircleArc start={{long:112,lat:33}} stop={{long:-120,lat:47}} attrs={{stroke:"red", strokeWidth:4, fill:"none"}} />*!/*/}
                {/*            /!*<GreatCircleArcMissal  pathProps={{start:{long:112,lat:33}, stop:{long:-120,lat:47}, attrs:{stroke:"none", strokeWidth:0, fill:"none"}}} missileProps={{relativeLength:0.5,maxWidth:5, progress:offset}} />*!/*/}
                {/*          </Map>*/}
                {/*         </svg>*/}
                {/*</div>*/}
          </InteractionContainer>
              <ReactTooltip type='light' effect={"solid"}   delayHide={200}  place={'right'} delayUpdate={50}/>

          </div>

      )
  }else{
      return (
      <div css={css`text-align:center;margin:auto`}>
          <p>Loading data</p>
      </div>
      )
  }

}

export default App;

function plotDateExtent(data){

    return extent(data.reduce((acc,d)=> acc.concat(extent(getDates(d))),[]))
}
function getDates(d){
    return d.cases.map(x=>x.date)
}

