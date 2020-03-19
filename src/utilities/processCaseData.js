const Merica = d3.timeParse("%m/%d/%y");

function nestByCounty(data){
    return d3.nest()
        .key(function(d) { return d["Country/Region"] })
        .rollup(longForm)
        .entries(data)
        .map(function(country) {
            country.value.forEach(v=>v.annotations.admin0=country.key)


            return{
                country:country.key,
                regions:country.value,
                annotations:{country:country.key},
                cases:getTotalCases(country.value)
            }
        })
}

function getTotalCases(regions){
    const allRegions = regions.reduce((acc,curr)=>acc.concat(curr.cases),[])
    return d3.nest()
        .key(d=>d.date)
        .rollup(d=>d3.sum(d,k=>k.cumulative))
        .entries(allRegions)
        .map(function(d){
            return{
                date:new Date(d.key),
                cumulative:d.value
            };
        })
}
function longForm(array){
    return array.reduce((regions,region)=>{

        regions.push({annotations:{admin1:region["Province/State"]},
            cases:Object.keys(region).reduce((acc,curr)=>{
                const date = Merica(curr);
                if(date){
                    acc.push({date:date,cumulative:parseInt(region[curr])})
                }
                return acc;
            },[])})
        return regions;
    },[])
}