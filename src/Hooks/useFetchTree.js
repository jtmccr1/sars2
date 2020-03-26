import {useEffect} from "react";
import {collapseUnsupportedNodes,orderByNodeDensity,
    parseNexus,getTips,annotateNode} from "figtreejs-react";
const processTree=tree=> {
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
                const externalNodes =getTips(tree);//.map(t=>t.name);
                for(const tip of externalNodes){
                    let country = tip.name.split("|").reverse()[1];
                    const continent = tip.name.split("|").reverse()[2].replace(/([a-z])([A-Z])/g, "$1 $2");

                    country= country==="USA"?"United States of America":
                        country==="UnitedKingdom"?"United Kingdom":
                            country==="SouthKorea"?"South Korea":
                                country==="HongKong"?"Hong Kong":
                                    country==="CzechRepublic"?"Czech Republic":
                                        country === "NewZealand" ? "New Zealand" :
                                            country === "Congo" ? "Dem. Rep. Congo" : country;
                    tree=annotateNode(tree,tip.id,{country:country,continent:continent});

                    countryContinentMap[country] = continent;

                }
                callback(tree, countryContinentMap);
                // console.log(countryContinentMap);
                // setOriginalTree(tree);
                // setTree(tree);
            })
    },[]);

}