import React from "react";
import ReactTooltip from "react-tooltip";
import ToolTipContent from "./ToolTipContent";

export default function ToolTips({toottipContent,roottipContent,tree,colorKey}){
    return (
        <>
            <ReactTooltip id="tip-label" type='light' effect={"solid"}   delayHide={200}  place={'right'} delayUpdate={50}/>
            <ReactTooltip  id="clade-tip" type='light' effect={"solid"} delayHide={200} place={'left'} delayUpdate={50}>
                {toottipContent===""?null:
                    <ToolTipContent tree={tree} id={toottipContent} colorKey={colorKey}/>}
            </ReactTooltip>
            <ReactTooltip  id="root-tip" type='light' effect={"solid"}  place={'right'}>
                {roottipContent===""?null:
                    <ToolTipContent tree={tree} id={roottipContent} colorKey={colorKey}/>}
            </ReactTooltip>
            </>
    )
}
