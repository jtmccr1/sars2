import React, {useEffect, useState} from "react"
import {timeFormat} from "d3-time-format";
import ReactTooltip from "react-tooltip";
import useFetchTree from "../../Hooks/useFetchTree";
import {getDateRange,FigTree,Axis,AxisBars,Legend} from "figtreejs-react";
import {scaleOrdinal, scaleTime} from "d3-scale";
import BranchesLayer from "./Branches";
import NodesLayers from "./NodesLayer";
import ToolTips from "./Tooltips"
export default function TreeFigure(props) {

    const {width, height, display, margins, colorScale, setColorScaleDomain, colorKey, setIsTreeLoaded, setCountryContinentMap} = props;

    console.log("intree")
    const [tree,setTree]=useState(null);
    const [originalTree,setOriginalTree] = useState(null);
    const [tooltipContent,setTooltipContent] = useState("");
    const [roottipContent,setRoottipContent] = useState("");
    useFetchTree("/data/2020-03-30/2020-03-30_continent_country.mcc.tre",
        (tree, map) => {
            setTree(tree);
            setOriginalTree(tree);
            setCountryContinentMap(map);
            setIsTreeLoaded(true)
        });

    useEffect(()=>{
        ReactTooltip.rebuild();
    },[tree]);


    if(display) {
        if(originalTree){

            setColorScaleDomain(originalTree.annotationTypes[colorKey].values)
        }
        const timeScale = scaleTime().domain(getDateRange(tree)).range([0,(width-margins.left-margins.right)]);
        const activeLocations = [...tree.annotationTypes[colorKey].values];
        const activeColors = activeLocations.map(c=>colorScale(c));
        const activeColorScale =  scaleOrdinal().domain(activeLocations).range(activeColors);
        return (

            <>
                <svg viewBox={`0,0,${width},${height}`}>
                    <rect width={width} height={height} fill={"none"} pointerEvents={"all"} onClick={() => {
                        setTree(originalTree)
                    }}/>

                    <FigTree width={width - margins.left - margins.right} height={height - margins.top - margins.bottom}
                             data={tree}
                             pos={{x: margins.left, y: margins.top}} getDateExtent={getDateRange}>

                        <Axis direction={"horizontal"} scale={timeScale} gap={10}
                              ticks={{number: 10, format: timeFormat("%m-%d"), padding: 20, style: {}, length: 6}}>
                            <AxisBars lift={5}/>
                        </Axis>
                        <BranchesLayer colorScale={colorScale} colorKey={colorKey}/>
                        <NodesLayers colorScale={colorScale} colorKey={colorKey} setTree={setTree} tree={tree}
                                     setRoottipContent={setRoottipContent} setTooltipContent={setTooltipContent}/>

                        <Legend.Discrete height={700} columns={1} width={200} pos={{x: width - 200, y: 0}}
                                         swatchSize={8}
                                         scale={activeColorScale} annotation={colorKey}/>
                    </FigTree>
                </svg>
                <ToolTips toottipContent={tooltipContent} tree={tree} roottipContent={roottipContent} colorKey={colorKey}/>
            </>
        )
    }else{
        return null;
    }
}