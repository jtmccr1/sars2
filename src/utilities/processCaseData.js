'use strict';

const timeParse = require("d3-time-format").timeParse;
const nest = require("d3-collection").nest;
const sum =require("d3-array").sum;
const axios = require("axios");
const csvParse=require("d3-dsv").csvParse;
const fs = require('fs');


axios.get('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv')
    .then(response => {
        const data = csvParse(response.data).filter(column=>!column["Province/State"].match(/.+,.+/)) // filter out us cities
        const parsedData = JSON.stringify(nestByCounty(data));

        fs.writeFile('./public/data/2020-03-10/countryCases.json', parsedData, (err) => {
            if (err) throw err;
            console.log('Data written to file');
        });


    })
    .catch(error => {
        console.log(error);
    });

const Merica = timeParse("%m/%d/%y");
function nestByCounty(data){
    return nest()
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
    return nest()
        .key(d=>d.date)
        .rollup(d=>sum(d,k=>k.cumulative))
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

        let i=0;
        regions.push({annotations:{admin1:region["Province/State"]},
            cases:Object.keys(region).reduce((acc,curr)=>{
                const date = Merica(curr);
                if(date){
                    acc.push({date:date,
                        cumulative:parseInt(region[curr]),
                        new:(i)>0?parseInt(region[curr])-acc[i-1] :parseInt(region[curr]),
                    });
                    i++;
                }
                return acc;
            },[])});
        return regions;
    },[])
}