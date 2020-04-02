import {useEffect} from "react";
import {collapseUnsupportedNodes,orderByNodeDensity,
    parseNexus,getTips,annotateNode} from "figtreejs-react";
const processTree=tree=> {
    console.log(tree)
    return collapseUnsupportedNodes(orderByNodeDensity(tree, false), node => node.annotations.posterior < 0.5);
};
export default function useFetchTree(path,callback){
    useEffect(()=>{
        ///data/2020-03-10/2020-03-19_nCoV.mcc.tre
        const countryContinentMap = {};
        fetch(process.env.PUBLIC_URL+path)
            .then(res=> res.text())
            .then(text=> {
                let tree= processTree(parseNexus(text,{datePrefix: "|",dateFormat:"%Y-%m-%d"})[0]);
                console.log(tree)
                const externalNodes =getTips(tree);//.map(t=>t.name);
                console.log(externalNodes.length)
                for(const tip of externalNodes){
                    countryContinentMap[tip.annotations.country] = tip.annotations.Continent;
                }
                console.log("done annotating")
                callback(tree, countryContinentMap);
                // console.log(countryContinentMap);
                // setOriginalTree(tree);
                // setTree(tree);
            })
    },[]);

}