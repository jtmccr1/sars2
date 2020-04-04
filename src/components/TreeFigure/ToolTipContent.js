/** @jsx jsx */
import React from "react";
import {group} from "d3-array";
import {css, jsx} from "@emotion/core";
import {getNode,getTips} from "figtreejs-react";
import {format} from "d3-format"

export default function ToolTipContent({tree,id,colorKey}){
        if(id===""){
            return null;
        };
        const node = getNode(tree, id);
        const tips = getTips(node);
        const locations= [...group(tips,tip=>tip.annotations[colorKey]).entries()].sort((a,b)=>b[1].length-a[1].length)
        return (
            <div>
                    {
                            node.annotations[`${colorKey}_probSet`] ? (
                                    <div>
                                            <h3>Clade root location</h3>
                                            <ul css={css` li {font-size:10px}`}>
                                                    {Object.entries(node.annotations[`${colorKey}_probSet`]).filter(([key, value]) => value > 0.01)
                                                        .sort((a, b) => b[1] - a[1])
                                                        .map(([key, value]) => <li
                                                            key={key}>{key}:{format(".0%")(value)}</li>)}
                                            </ul>
                                    </div>
                                )
                                : null
                    }

                    <p css={css`font-weight: bold`}> {tips.length} descendent samples</p>
                <p> from {[...node.annotationTypes[colorKey].values].length} locations</p>
                <ul css={css` li {font-size:10px}`}>
                        {locations.filter(([key, tips]) => tips.length > 5).map(([key, tips]) => <li
                            key={key}>{key}:{tips.length}</li>)}
                </ul>


            </div>
        )
}