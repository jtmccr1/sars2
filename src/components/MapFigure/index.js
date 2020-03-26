/** @jsx jsx */
import {css, jsx} from '@emotion/core'
import React, {useEffect, useState} from "react";
import {feature} from "topojson-client";
import {geoPeirceQuincuncial} from "d3-geo-projection";
import {Map,Features} from "figtreejs-react";
import Slider from "../Slider";

// import countryMap from "../../utilities/countryMap.js"

export default function MapFigure(props) {
    const {width, height, scale, colorScale, setIsMapLoaded, display, colorKey, countryContinentMap} = props;
    const [geographies,setGeographies] = useState(null);
    const projection = geoPeirceQuincuncial()
        .translate([ width/2, height/2 ])
        .scale(scale);

    useEffect(() => {
        fetch(process.env.PUBLIC_URL + "/data/world-110m.json")
            .then(response => {
                if (response.status !== 200) {
                    return
                }
                response.json().then(worlddata => {
                    const countries = feature(worlddata, worlddata.objects.countries).features;
                    countries.forEach(f => f["annotations"] = {"country": f.properties.name});
                    setGeographies(countries);
                    setIsMapLoaded(true)
                })
            })
    }, []);

    if(display){

        return (

            <svg viewBox={`0,0,${width},${height}`}>
                <Map projection={projection}>
                    <Features geographies={geographies}
                              attrs={{
                                  stroke: "black", strokeWidth: 1, opacity: 0.9,
                                  fill: (f) => {
                                      if (colorKey === "country") {
                                          return colorScale.domain().includes(f.properties.name) ? colorScale(f.properties.name) : '#f5f5dc'

                                      } else {
                                          if (f.properties.name in countryContinentMap) {
                                              return colorScale(countryContinentMap[f.properties.name])
                                          }
                                          return '#f5f5dc';
                                      }
                                  }
                              }}
                              hoveredAttrs={{strokeWidth: 2, opacity: 1}}
                              hoverKey={"country"}
                              tooltip={{'data-tip': v => v.annotations.country}}
                    />
                </Map>
            </svg>
        )
    }else{
        return null;
    }


}