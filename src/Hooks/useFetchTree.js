import {useEffect} from "react";
import {collapseUnsupportedNodes,orderByNodeDensity,
    parseNexus,getTips,annotateNode} from "figtreejs-react";
const processTree=tree=> {
    return collapseUnsupportedNodes(orderByNodeDensity(tree, false), node => node.annotations.posterior < 0.5);
};
export default function useFetchTree(path,callback){
    useEffect(()=>{
        ///data/2020-03-10/2020-03-19_nCoV.mcc.tre
        const countryContinentMap = new Map();
        fetch(process.env.PUBLIC_URL+path)
            .then(res=> res.text())
            .then(text=> {
                let tree= processTree(parseNexus(text,{datePrefix: "|",dateFormat:"%Y-%m-%d"})[0]);
                const externalNodes =getTips(tree);//.map(t=>t.name);
                for(const tip of externalNodes){
                    let country = tip.name.split("|").reverse()[1];
                    const continent = tip.name.split("|").reverse()[2];

                    countryContinentMap.set(country,continent);
                    country= country==="USA"?"United States of America":
                        country==="UnitedKingdom"?"United Kingdom":
                            country==="SouthKorea"?"South Korea":
                                country==="HongKong"?"Hong Kong":
                                    country==="CzechRepublic"?"Czech Republic":
                                        country==="NewZealand"?"New Zealand":country;
                    tree=annotateNode(tree,tip.id,{country:country,continent:continent});

                }
            callback(tree);
                console.log(countryContinentMap);
                // setOriginalTree(tree);
                // setTree(tree);
            })
    },[]);

}