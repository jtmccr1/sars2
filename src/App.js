import React, {useEffect, useState} from 'react';
import {parseNexus,FigTree,Nodes,collapseUnsupportedNodes,
    orderByNodeDensity,Branches,annotateNode,Axis,Legend,NodeBackgrounds,Map,Features,GreatCircleArcMissal,
AxisBars} from "figtreejs-react"
import{tsv} from "d3-fetch";
import {schemeTableau10,schemeSet3} from "d3-scale-chromatic";
import {scaleOrdinal, scaleTime} from "d3-scale";
import {timeFormat} from "d3-time-format";
import {geoEqualEarth, geoPath} from "d3-geo";
import {feature} from "topojson-client";
import {geoGingery, geoPeirceQuincuncial} from "d3-geo-projection";

const processTree=tree=> {
    return collapseUnsupportedNodes(orderByNodeDensity(tree, false), node => node.annotations.posterior < 0.5);
};
function App() {
  const [tree,setTree]=useState(null);
  const [geographies,setGeographies] = useState(null);
  const [offset,setOffset] = useState(0);

  useEffect(()=>{
    fetch(process.env.PUBLIC_URL+"/data/exp.MCC.txt")
        .then(res=> res.text())
        .then(text=> {
          let tree= processTree(parseNexus(text,{datePrefix: "|",dateFormat:"%Y-%m-%d"})[0]);
            tsv(process.env.PUBLIC_URL+"/data/location_trait.txt")
                .then((data)=>{
                    for(const tip of data){
                        tree=annotateNode(tree,tip.taxa,{location:tip.location})
                    }
                    setTree(tree);
                })
        })
  },[]);


  useEffect(()=>{
      fetch(process.env.PUBLIC_URL+"/data/world-110m.json")
          .then(response => {
          if (response.status !== 200) {
              console.log(`There was a problem: ${response.status}`);
              return
          }
          response.json().then(worlddata => {
              setGeographies(feature(worlddata, worlddata.objects.countries).features)
          })
      })
  },[]);


  const width=1000,height=600,margins={top:50,right:50,bottom:75,left:20};

  if(tree!==null&&geographies!==null){
      const scheme = schemeTableau10.concat(schemeSet3);
      const colorScale = scaleOrdinal().domain(tree.annotationTypes.location.values).range(scheme);
      const timeScale = scaleTime().domain(tree.annotationTypes.date.extent).range([0,(width-margins.left-margins.right)]);

      const projection = geoPeirceQuincuncial()
          .translate([ width / 2, height / 2 ])
          .scale(150);



      return (
          <>
              <svg width={width} height={height}>
                  <FigTree width={width} height={height} margins={margins} tree={tree}>
                      <Nodes.Coalescent filter={(v=>v.node.children && v.node.children.length>2)} attrs={{fill:v=>(v.node.annotations.location?colorScale(v.node.annotations.location):"grey")}}/>
                      <NodeBackgrounds.Circle filter={(v=>v.node.children===null)} attrs={{r:5,fill:"black"}}/>

                      <Nodes.Circle filter={(v=>v.node.children===null)} attrs={{r:4,fill:v=>colorScale(v.node.annotations.location),strokeWidth:0,stroke:"black"}} hoveredAttrs={{r:9,strokeWidth:1}}>
                          {/*<ToolTip onHover>*/}
                          {/*    <p>Hello!</p>*/}
                          {/*</ToolTip>*/}
                      </Nodes.Circle>
                      <Branches.Coalescent filter={(e=>e.v0.node.children.length>2)} attrs={{strokeWidth:2, stroke:e=>e.v1.node.annotations.location? colorScale(e.v1.node.annotations.location):"grey"}}/>
                      <Branches.Rectangular filter={(e=>e.v0.node.children.length<=2)} attrs={{strokeWidth:2, stroke:e=>e.v1.node.annotations.location? colorScale(e.v1.node.annotations.location):"grey"}}/>
                      <Axis direction={"horizontal"} scale={timeScale} gap={10}
                            ticks={{number: 5, format: timeFormat("%y-%m-%d"), padding: 20, style: {}, length: 6}}>
                          <AxisBars lift={5}/>
                      </Axis>
                      <Legend.Discrete height={300} columns={1} width={100} pos={{x:900,y:50}} scale={colorScale}/>
                  </FigTree>
              </svg>


              <svg width={width} height={height} onClick={()=>setOffset((!offset))}>
                  <Map projection = {projection}>
                    <Features geographies={geographies} attrs={{stroke:"black",fill:"none"}}/>
                    {/*<GreatCircleArc start={{long:112,lat:33}} stop={{long:-120,lat:47}} attrs={{stroke:"red", strokeWidth:4, fill:"none"}} />*/}
                    <GreatCircleArcMissal  start={{long:112,lat:33}} stop={{long:-120,lat:47}} attrs={{stroke:"red", strokeWidth:1, fill:"none"}} relativeLength={0.5} maxWidth={5} progress={offset} />
                  </Map>
              </svg>
          </>
      )
  }else{
      return <p>Loading data</p>
  }

}

export default App;
