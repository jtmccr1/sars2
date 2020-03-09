import React, {useEffect, useState} from 'react';
import {parseNexus,FigTree,Nodes,collapseUnsupportedNodes,
    orderByNodeDensity,Branches,annotateNode,Axis,
AxisBars} from "figtreejs-react"
import{tsv} from "d3-fetch";
import {schemeTableau10,schemeSet3} from "d3-scale-chromatic";
import {scaleOrdinal, scaleTime} from "d3-scale";
import {timeFormat} from "d3-time-format";

const processTree=tree=> {
    return collapseUnsupportedNodes(orderByNodeDensity(tree, false), node => node.annotations.posterior < 0.5);
};
function App() {

  const [tree,setTree]=useState(null);
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

  const width=1000,height=600,margins={top:50,right:50,bottom:75,left:20};

  if(tree!==null){
      const scheme = schemeTableau10.concat(schemeSet3);
      const colorScale = scaleOrdinal().domain(tree.annotationTypes.location.values).range(scheme);
      const timeScale = scaleTime().domain(tree.annotationTypes.date.extent).range([0,(width-margins.left-margins.right)]);
      return (
          <svg width={width} height={height}>
              <FigTree width={width} height={height} margins={margins} tree={tree}>
                  <Nodes.Circle filter={(v=>v.node.children===null)} attrs={{r:4,fill:v=>colorScale(v.node.annotations.location)}} hoveredAttrs={{r:9}}/>
                  <Branches.Coalescent filter={(e=>e.v0.node.children.length>2)} attrs={{strokeWidth:2, stroke:e=>e.v1.node.annotations.location? colorScale(e.v1.node.annotations.location):"grey"}}/>
                  <Nodes.Coalescent filter={(v=>v.node.children && v.node.children.length>2)} attrs={{fill:v=>(v.node.annotations.location?colorScale(v.node.annotations.location):"grey")}}/>
                  <Branches.Rectangular filter={(e=>e.v0.node.children.length<=2)} attrs={{strokeWidth:2, stroke:e=>e.v1.node.annotations.location? colorScale(e.v1.node.annotations.location):"grey"}}/>
                  <Axis direction={"horizontal"} scale={timeScale} gap={10}
                        ticks={{number: 5, format: timeFormat("%y-%m-%d"), padding: 20, style: {}, length: 6}}>
                      <AxisBars lift={5}/>
                  </Axis>
              </FigTree>
          </svg>
      )
  }else{
      return <p>Loading tree</p>
  }



}

export default App;
