import React, { useState, useRef, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import ReactTooltip from 'react-tooltip';
import ReactGA from 'react-ga';
import mapboxgl from 'mapbox-gl';
import Geocoder from 'react-mapbox-gl-geocoder'

import { getNextSystemNumStr } from '/lib/util.js';
import { INITIAL_SYSTEM, INITIAL_META } from '/lib/constants.js';

export function Start(props) {
  const [systemChoices, setSystemChoices] = useState({});

  const startRef = useRef(null);

  useEffect(() => {
    ReactTooltip.rebuild();
    loadDefaultData();
  }, [])

  const loadDefaultData = () => {
    if (props.database === null) {
      return;
    }

    const defaultSystemsCollection = collection(props.database, 'defaultSystems');
    const defaultSystemsQuery = query(defaultSystemsCollection, orderBy('title'));

    getDocs(defaultSystemsQuery)
      .then(async (systemsSnapshot) => {
        let sysChoices = {};
        for (const sDoc of systemsSnapshot.docs) {
          const sysDocData = sDoc.data();
          sysChoices[sysDocData.defaultId] = sysDocData;
        }

        setSystemChoices(sysChoices);
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
  }

  const handleCustomSelected = (result) => {
    if (result.place_name) {
      let system = INITIAL_SYSTEM;
      system.title = result.place_name;

      let meta = INITIAL_META;
      meta.systemNumStr = getNextSystemNumStr(props.settings);
      props.onSelectSystem(system, meta, result.bbox, []);

      ReactGA.event({
        category: 'Start',
        action: 'Select Custom Map'
      });
    }
  }

  const renderDefaultChoices = () => {
    if (Object.keys(systemChoices).length) {
      let choices = [];
      for (const system of Object.values(systemChoices)) {
        choices.push(
          <Link className="Start-defaultChoice" key={system.defaultId}
                href={{
                  pathname: '/edit/new',
                  query: { fromDefault: system.defaultId },
                }}
                onClick={() => ReactGA.event({
                  category: 'Start',
                  action: 'Select Default Map',
                  value: system.defaultId
                })}>
            {system.title ? system.title : 'Unnamed System'}
          </Link>
        );
      }
      return(
        <div className="Start-defaultChoices">
          {choices}
        </div>
      );
    }
    return '';
  }

  return (
    <div className="Start FadeAnim">
      <div className="Start-upper">
        <div className="Start-heading">
          Start from a preset city
        </div>
        {renderDefaultChoices()}
      </div>
      <div className="Start-lower" ref={startRef}>
        <div className="Start-heading">
          Search for a different city
        </div>

        <div className="Start-geocoderWrap">
          <Geocoder mapboxApiAccessToken={mapboxgl.accessToken} hideOnSelect={true}
                    placeholder={'Search for a place'} // TODO: placeholder not working/supported
                    queryParams={{
                      types: 'place,district,region,country',
                      placeholder: 'Search for a place'
                    }}
                    onSelected={(_, item) => handleCustomSelected(item)} />
        </div>
      </div>
    </div>
  );
}
