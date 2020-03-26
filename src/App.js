/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import React, { useState} from 'react';

import {schemeTableau10,schemeSet3,schemePaired} from "d3-scale-chromatic";
import {scaleOrdinal} from "d3-scale";
import Container from "./components/Container";
import TreeFigure from "./components/TreeFigure";
import MapFigure from "./components/MapFigure";
import Slider from "./components/Slider";

const mapPannelFlexBoxCss = `display:flex;flex-direction:column;flex-wrap:nowrap;`;

function App() {

    const [colorScaleDomain, setColorScaleDomain] = useState([]);
    const [isTreeLoaded, setIsTreeLoaded] = useState(false);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [colorKey, setColorKey] = useState("country");
    const [countryContinentMap, setCountryContinentMap] = useState({});
    const width = 1100, height = 700, margins = {top: 10, right: 210, bottom: 40, left: 40};
    const mapWidth = 400, mapHeight = 400;

    const scheme = schemeTableau10.concat(schemeSet3).concat(schemePaired);
    const colorScale = scaleOrdinal().domain(colorScaleDomain).range(scheme);

    return (
        <>
            <div css={css`text-align:center;margin:auto;display:${isMapLoaded && isTreeLoaded ? "none" : "inline"}`}>
                <p>Loading data</p>
            </div>

            <Container>
                <div css={css`flex-basis:65%;`}>
                    <TreeFigure display={isMapLoaded && isTreeLoaded} setCountryContinentMap={setCountryContinentMap}
                                setIsTreeLoaded={setIsTreeLoaded} width={width} height={height} margins={margins}
                                colorScale={colorScale} setColorScaleDomain={setColorScaleDomain} colorKey={colorKey}/>
                </div>
                <div css={css`flex-basis:35%`}>
                    <div css={css`${mapPannelFlexBoxCss}`}>
                        <div css={css`margin:auto`}>
                            <Slider display={isTreeLoaded && isMapLoaded} colorKey={colorKey}
                                    setColorKey={setColorKey}/>
                        </div>
                    </div>
                    <MapFigure display={isTreeLoaded && isMapLoaded} countryContinentMap={countryContinentMap}
                               setIsMapLoaded={setIsMapLoaded} width={mapWidth} height={mapHeight} scale={85}
                               colorScale={colorScale} colorKey={colorKey} setColorKey={setColorKey}/>
                </div>
            </Container>
        </>
    )

}

export default App;

