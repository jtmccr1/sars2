import React from "react";
import ReactTooltip from "react-tooltip";
import {Nodes,NodeBackgrounds,getTips, useFigtreeContext} from "figtreejs-react";
import {max, min} from "d3-array";

export default function NodesLayers(props){
    const {
        colorScale, colorKey, setTree, tree, setRoottipContent,
        setTooltipContent, selectedLocation, selectedLocationKey, setSelectedLocation
    } = props;
    const {height} = useFigtreeContext.scales();
    const nodeWidth = min([10,max([2,height/2/getTips(tree).length])]);
    return(
        <>
            <NodeBackgrounds.Circle filter={(v => !v.node.children)}
                                    attrs={{
                                        r: v => v.annotations[selectedLocationKey] === selectedLocation ? nodeWidth + 4 : nodeWidth + 1,
                                        fill: "black"
                                    }}/>
            <Nodes.Coalescent filter={(v => v.node.children && v.node.children.length > 2)}
                              sortFactor={-1}
                              attrs={{fill: v => (v.node.annotations[colorKey] ? colorScale(v.node.annotations[colorKey]) : "grey")}}
                              interactions={{
                                  "onClick": (v) => {
                                      console.log(v)
                                      setSelectedLocation(null)
                                  }
                              }}
            />
            <Nodes.Rectangle
                filter={(v => v.node.children && v.node.children.length > 2)}
                attrs={{
                    cursor: "pointer",
                    fill: "none",
                    pointerEvents: "all",
                    width: 50,
                    height: 20,
                    transform: `translate(0,-${20 / 2})`
                }}
                interactions={{
                    "onMouseEnter": v => v.id === tree.id ? setRoottipContent(v.id) : setTooltipContent(v.id),
                    "onMouseLeave": v => {
                        ReactTooltip.hide();
                        v.id === tree.id ? setRoottipContent("") : setTooltipContent("")
                    },
                    "onClick": (v) => {
                        setTree(v.node)
                    }
                }}
                hoverKey={null}
                tooltip={{"data-tip": '', "data-for": v => v.id === tree.id ? "root-tip" : "clade-tip"}}/>
            <Nodes.Circle tooltip={{'data-tip': v => v.id, "data-for": "tip-label"}}
                          filter={(v => !v.node.children)}
                          attrs={{
                              r: v => v.annotations[selectedLocationKey] === selectedLocation ? nodeWidth + 3 : nodeWidth,
                              fill: v => colorScale(v.annotations[colorKey]),
                              strokeWidth: 0,
                              stroke: "black"
                          }}
                          hoveredAttrs={{r: nodeWidth + 4, strokeWidth: 1}}/>
            </>
    )
}