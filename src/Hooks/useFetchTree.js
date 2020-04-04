import {useEffect} from "react";
import {
    collapseNodes, orderByNodeDensity,
    parseNexus, getTips
} from "figtreejs-react";
const processTree=tree=> {
    return collapseNodes(orderByNodeDensity(tree, false), node => node.annotations.posterior < 0.5);
};
export default function useFetchTree(path,callback){
    useEffect(()=>{
        const countryContinentMap = {};
        console.log("fetching tree")
        fetch(process.env.PUBLIC_URL+path)
            .then(res=> res.text())
            .then(text=> {
                let tree= processTree(parseNexus(text,{datePrefix: "|",dateFormat:"%Y-%m-%d"})[0]);
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