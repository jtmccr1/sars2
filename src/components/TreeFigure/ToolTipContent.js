/** @jsx jsx */
import React from "react";
import {group} from "d3-array";
import {css, jsx} from "@emotion/core";
import {getNode,getTips} from "figtreejs-react";

export default function ToolTipContent({tree,id,colorKey}){
        if(id===""){
            return null;
        };
        const node = getNode(tree, id);
        const tips = getTips(node);
        const locations= [...group(tips,tip=>tip.annotations[colorKey]).entries()].sort((a,b)=>b[1].length-a[1].length)
        return (
            <div>
                <h2> {tips.length} Samples</h2>
                <p> from {[...node.annotationTypes[colorKey].values].length} locations</p>
                <ul css={css` li {font-size:10px}`}>
                    {locations.map(([key,tips])=><li key={key}>{key}:{tips.length}</li>)}
                </ul>

            </div>
        )
}