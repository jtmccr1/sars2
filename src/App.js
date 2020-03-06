import React, {useEffect, useState} from 'react';
import {parseNexus,FigTree,Nodes,NodeShape,orderByNodeDensity,Branches,annotateNode} from "figtreejs-react"
import{tsv} from "d3-fetch";
import {schemeTableau10,schemeSet3} from "d3-scale-chromatic";
import {scaleOrdinal} from "d3-scale";

function App() {

  const [tree,setTree]=useState(null);
  useEffect(()=>{
    fetch(process.env.PUBLIC_URL+"/data/exp.MCC.txt")
        .then(res=> res.text())
        .then(text=> {
          let tree= orderByNodeDensity(parseNexus(text,{datePrefix: "|",dateFormat:"%Y-%m-%d"})[0]);
            tsv(process.env.PUBLIC_URL+"/data/location_trait.txt")
                .then((data)=>{
                    for(const tip of data){
                        tree=annotateNode(tree,tip.taxa,{location:tip.location})
                    }
                    setTree(tree);
                })
        })
  },[]);

  const width=1000,height=800,margins={top:50,right:50,bottom:75,left:20};

  if(tree!==null){
      // npm install d3-color
      //
      const scheme = schemeTableau10.concat(schemeSet3);
      console.log(tree);
      const colorScale = scaleOrdinal().domain(tree.annotationTypes.location.values).range(scheme);
      return (
          <svg width={width} height={height}>
              <FigTree width={width} height={height} margins={margins} tree={tree}>
                  <Nodes filter={(v=>v.node.children===null)}>
                      <NodeShape attrs={{r:4,fill:v=>colorScale(v.node.annotations.location)}} hoveredAttrs={{r:9}}/>
                  </Nodes>
                  <Branches/>
                  </FigTree>
          </svg>
      )
  }else{
      return <p>Loading</p>
  }



}

export default App;
