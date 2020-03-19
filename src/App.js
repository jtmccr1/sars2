import React, {useEffect, useState} from 'react';
import {parseNexus,FigTree,Nodes,collapseUnsupportedNodes,InteractionContainer,
    orderByNodeDensity,Branches,annotateNode,Axis,Legend,NodeBackgrounds,Map,Features,GreatCircleArcMissal,getDateRange,getTips,Timeline,Label,
AxisBars} from "figtreejs-react"
import {csv} from "d3-fetch";
import {schemeTableau10,schemeSet3} from "d3-scale-chromatic";
import {scaleOrdinal, scaleTime} from "d3-scale";
import {timeFormat} from "d3-time-format";
import {feature} from "topojson-client";
import {geoPeirceQuincuncial} from "d3-geo-projection";
import ReactTooltip from "react-tooltip"

const processTree=tree=> {
    console.log(tree);
    return collapseUnsupportedNodes(orderByNodeDensity(tree, false), node => node.annotations.posterior < 0.5);
};
function App() {
  const [tree,setTree]=useState(null);
  const [geographies,setGeographies] = useState(null);
  const [offset,setOffset] = useState(0);

  useEffect(()=>{
    fetch(process.env.PUBLIC_URL+"/data/2020-03-10/tree.MCC")
        .then(res=> res.text())
        .then(text=> {
          let tree= processTree(parseNexus(text,{datePrefix: "|",dateFormat:"%Y-%m-%d"})[0]);
            csv(process.env.PUBLIC_URL+"/data/2020-03-10/metadata.csv")
                .then((data)=>{
                    const externalNodes =getTips(tree).map(t=>t.name);
                    for(const tip of data){
                        if(externalNodes.includes(tip.label)){
                            tree=annotateNode(tree,tip.label,{country:tip.country})
                        }
                    }
                    console.log(tree);
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
              const countries = feature(worlddata, worlddata.objects.countries).features;
              countries.forEach(f=>f["annotations"]={"country":f.properties.name});
              console.log(countries)
              setGeographies(countries)
          })
      })
  },[]);


  const width=1000,height=800,margins={top:10,right:210,bottom:75,left:20};

  if(tree!==null&&geographies!==null){
      const scheme = schemeTableau10.concat(schemeSet3);
      const colorScale = scaleOrdinal().domain(tree.annotationTypes.country.values).range(scheme);
      const timeScale = scaleTime().domain(getDateRange(tree)).range([0,(width-margins.left-margins.right)]);
      const projection = geoPeirceQuincuncial()
          .translate([ 350, 330 ])
          .scale(145);
      return (
          <InteractionContainer>
              <Timeline width={width} height={height} margins={margins}>
                            <FigTree width={width-margins.left-margins.right} height={height-margins.top-margins.bottom} data={tree} pos={{x:margins.left,y:margins.top}}>
                              <Nodes.Coalescent filter={(v=>v.node.children && v.node.children.length>2)} attrs={{fill:v=>(v.node.annotations.country?colorScale(v.node.annotations.country):"grey")}}/>
                              <NodeBackgrounds.Circle filter={(v=>v.node.children===null)} attrs={{r:3,fill:"black"}}/>
                              <Nodes.Circle tooltip={{'data-tip':v=>v.id}} filter={(v=>v.node.children===null)} attrs={{r:2,fill:v=>colorScale(v.node.annotations.country),strokeWidth:0,stroke:"black"}} hoveredAttrs={{r:9,strokeWidth:1}}>
                              {/*<Label css={`opacity:0; pointer-events:all;&:hover {opacity:1};`}/>*/}
                              </Nodes.Circle>
                              <Branches.Coalescent filter={(e=>e.v0.node.children.length>2)} attrs={{strokeWidth:2, stroke:e=>e.v1.node.annotations.country? colorScale(e.v1.node.annotations.country):"grey"}}/>
                              <Branches.Rectangular filter={(e=>e.v0.node.children.length<=2)} attrs={{strokeWidth:2, stroke:e=>e.v1.node.annotations.country? colorScale(e.v1.node.annotations.country):"grey"}}/>
                              <Axis direction={"horizontal"} scale={timeScale} gap={10} ticks={{number: 10, format: timeFormat("%m-%d"), padding: 20, style: {}, length: 6}}>
                                  <AxisBars lift={5}/>
                              </Axis>
                              <Legend.Discrete height={500} columns={1} width={200} pos={{x:800,y:50}} scale={colorScale} annotation={"country"}/>
                          </FigTree>
              </Timeline>

                        <ReactTooltip type='light' effect={"solid"}   delayHide={200}  place={'right'} delayUpdate={100} pos/>

                        <svg width={700} height={700} onClick={()=>setOffset((!offset))}>
                          <Map projection = {projection}>
                            <Features geographies={geographies}
                                      attrs={{stroke:"black",strokeWidth:1,opacity:0.9,
                                          fill:(f)=>colorScale.domain().includes(f.properties.name)?colorScale(f.properties.name):'#f5f5dc'}}
                                      hoveredAttrs={{strokeWidth:2,opacity:1}}
                                      hoverKey={"country"}
                              tooltip={{'data-tip':v=>v.annotations.country}}
                            />
                            {/*<GreatCircleArc start={{long:112,lat:33}} stop={{long:-120,lat:47}} attrs={{stroke:"red", strokeWidth:4, fill:"none"}} />*/}
                            <GreatCircleArcMissal  pathProps={{start:{long:112,lat:33}, stop:{long:-120,lat:47}, attrs:{stroke:"none", strokeWidth:0, fill:"none"}}} missileProps={{relativeLength:0.5,maxWidth:5, progress:offset}} />
                          </Map>
                         </svg>
          </InteractionContainer>
      )
  }else{
      return <p>Loading data</p>
  }

}

export default App;

